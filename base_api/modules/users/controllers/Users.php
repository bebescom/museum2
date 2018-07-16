<?php

class Users extends MY_Controller
{
    function index()
    {
        $keyword = $this->get_post('keyword');
        $id = $this->get_post('id');
        $sort_by = $this->get_post('sort_by');
        $page = $this->get_post('page');
        $select = $this->get_post('select');
        $limit = $this->get_post('limit');

        if (!isset($sort_by)) {
            $sort_by = "sort desc,id asc";
        }
        $where = '1=1 and level != "服务端"';
        if (isset($keyword)&&$keyword!='') {
            $where .= " and concat_ws('',username,real_name,tel,department,position) like '%" . $keyword . "%'";
        }
        if (isset($id)&&$id!='') {
            $where .= " and id in (" . $id . ")";
        }
        $m = M('user');
        if(!$page){
            $page = 1;
        }

        if(!$select){
            $select = "id,username,role_ids,status,level,real_name,tel,department,position,sort,email";
        }

        if(!$limit){
            $limit = 10;
        }
        $offset = ($page - 1)*$limit;
        $total = $m->count($where);
        $list = $m->fetAll($where,$select , $sort_by,$offset,$limit);
        foreach ($list as $k => $row) {
            if(isset($row['level'])&&( $row['level'] == "服务端")){
                $total--;
                unset($list[$k]);
            }else{
               if(isset($row['role_ids'])){
                   $list[$k]['role_names'] = $m->get_role_names($row['role_ids']);
                   $permissions = $m->get_permissions($row['level'], $row['role_ids']);
                   $list[$k]['permission'] = $permissions;
               }
            }
        }
        $result = array(
            'total' => $total,
            'rows' => array_values($list),
        );
        $this->response($result);

    }

    function info_get($uid = 0)
    {
        if (!is_numeric($uid)) {
            $this->response(array('error' => ':id非数字'));
        }
        $m = M('user');
        $user = $m->find($uid, 'id,username,role_ids,status,level,real_name,tel,department,position,sort,email');
        if (!$user) {
            $this->response(array('error' => '不存在此id的用户'));
        }
        if (isset($user['favorite'])) $user['favorite'] = json_decode($user['favorite'], true);

        $user['role_names'] = $m->get_role_names($user['role_ids']);
        $this->response($user);

    }

    function delete_post($id = '')
    {
        if(!M("common/permission")->check_permission("删除用户",$this->_user)){
            $this->response(array('error' => '无权限删除用户'));
        }

        if ($id == '') {
            $id = $this->post('id');
        }
        if (!isset($id)) {
            $this->response(array('error' => '没有找到用户编号'));
        }
        $id_tmp = explode(',', $id);
        $where_instr = "'" . join("','", $id_tmp) . "'";

        $m = M('user');
        $users = $m->fetAll("id in (" . $where_instr . ")");
        foreach ($users as $user) {
            if($user['level'] == "超级管理员"){
                $this->response(array('error'=>'无权限删除超级管理员'));
            }
        }

        $m->delete("id in (" . $where_instr . ")");

        $this->response(array('id' => $id, 'msg' => '删除成功'));
    }

    function my_post()
    {
        if (!isset($this->_user['id'])) {
            $this->response(array('error' => '获取不了用户信息'));
        }

        $old_password = $this->post('old_password');
        $password = $this->post('password');
        $real_name = $this->post('real_name');
        $tel = $this->post('tel');
        $email = $this->post('email');
        $department = $this->post('department');
        $position = $this->post('position');

        if (!isset($old_password)) {
            $this->response(array('error' => '原密码必填'));
        }
        $m = M('user');
        $old = $m->find($this->_user['id']);
        if (!$old) {//不存在
            $this->response(array('error' => ':id用户不存在!'));
        }

        if ($old['password'] != md5($old['username'] . $old_password)) {
            $this->response(array('error' => '原密码错误!'));
        }

        $data = array();
        if (isset($password) && $password != '') $data['password'] = md5($old['username'] . $password);
        if (isset($real_name)) $data['real_name'] = $real_name;
        if (isset($tel)) $data['tel'] = $tel;
        if (isset($email)) $data['email'] = $email;
        if (isset($department)) $data['department'] = $department;
        if (isset($position)) $data['position'] = $position;
        if (count($data) == 0) {
            $this->response(array('error' => '没有做任何修改'));
        }
        $edit = $m->save($data, $old['id']);
        if (!$edit) {
            $this->response(array('error' => '修改失败!'));
        }
        $this->response(array('id' => $old['id'], 'msg' => '修改成功!'));

    }

    function favorite_post()
    {
        if (!isset($this->_user['id'])) {
            $this->response(array('error' => '获取不了用户信息'));
        }

        $data = $this->post('favorite');

        $m = M('user');
        $old = $m->find($this->_user['id']);
        if (!$old) {//不存在
            $this->response(array('error' => ':id用户不存在!'));
        }
        $favorite = array();
        if (isset($old['favorite'])) {
            $favorite = json_decode($old['favorite'], true);
        }

        if($data){
            foreach($data as $key=>$value){
                if(isset($favorite[$key])){
                    if(is_array($value)){
                        $favorite[$key] = array_merge_recursive($favorite[$key],$value);
                        if(is_array($favorite[$key])){
                            $array_count = 0;//统计数组中的数组个数，方便unique
                            foreach($favorite[$key] as $fk=>$fv){
                                if(is_array($fv)){
                                    $favorite[$key][$fk] = array_values(array_unique($fv));
                                    $array_count++;
                                }
                            }
                           if($array_count <= 1){
                               $favorite[$key] = array_unique($favorite[$key]);
                           }
                        }
                    }else{
                        $favorite[$key] = $value;
                    }
                }else{
                    $favorite[$key] = $value;
                }
            }
        }
        if (count($favorite) == 0) {
            $this->response(array('error' => '没有做任何修改'));
        }
        $edit = $m->save(array('favorite' => zh_json_encode($favorite)), $old['id']);
        if (!$edit) {
            $this->response(array('error' => '修改失败!'));
        }
        $this->response(array('id' => $old['id'], 'msg' => '修改成功!'));

    }


    function favorite_get($type){
        if (!isset($this->_user['id'])) {
            $this->response(array('error' => '获取不了用户信息'));
        }

        $m = M('user');
        $old = $m->find($this->_user['id'],"favorite");
        if($old){
            if(isset($old['favorite'])&&$old['favorite']){
                $old['favorite'] = json_decode($old['favorite'],true);
            }
        }
        $data = array();
        $data[$type] = '';
        if(isset($old['favorite'][$type])){
            $data[$type] = $old['favorite'][$type];
        }
        $this->response($data);
    }

}