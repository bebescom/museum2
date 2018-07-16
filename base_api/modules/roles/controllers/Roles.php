<?php

class Roles extends MY_Controller
{
    function index()
    {
        $keyword = $this->get_post('keyword');
        $id = $this->get_post('id');
        $sort_by = $this->get_post('sort_by');

        if (!isset($sort_by)) {
            $sort_by = "sort desc,id asc";
        }
        $where = "1=1";
        if (isset($keyword)&&$keyword!='') {
            $where .= " and concat_ws('',name) like '%" . $keyword . "%'";
        }
        if (isset($id)&&$id!='') {
            $where .= " and id in (" . $id . ")";
        }
        $m = M('role');
        $list = $m->fetAll($where, "id,parent_id,name,permissions,data_scope,sort", $sort_by);
//        foreach ($list as $k => $row) {
//            $list[$k]['role_names'] = $m->get_role_names($row['role_ids']);
//        }
        $result = array(
            'total' => count($list),
            'rows' => $list,
        );
        $this->response($result);
    }

    function tree_get($id = '')
    {
        $m = M('role');
        $list = $m->fetAll("", "id,parent_id,name,permissions,data_scope,sort", "sort desc,id asc");
        $this->load->helper('common/tree', 'tree');
        $tree = generate_tree($list, array(
            'id' => 'id',
            'fid' => 'parent_id',
            'root' => $id,
        ));

        $this->response($tree);

    }

    function info_get($id = '')
    {
        if ($id == '') {
            $this->response(array('error' => '没有找到id'));
        }

        $m = M('role');
        $info = $m->find($id);
        if (!$info) {
            $this->response(array('error' => '没有找到角色信息'));
        }
        $this->response($info);
    }

    function add_post()
    {
        if(!M("common/permission")->check_permission("添加角色",$this->_user)){
            $this->response(array('error' => '无权限添加角色'));
        }
        $parent_id = $this->post('parent_id');
        $name = $this->post('name');
        $permissions = $this->post('permissions');
        $data_scope = $this->post('data_scope');
        $sort = $this->post('sort');

        if (!isset($name)) {
            $this->response(array('error' => '没有角色名称'));
        }
        if (!isset($parent_id)) {
            $parent_id = 0;
        }

        $m = M('role');

        $data = array(
            'name' => $name,
        );

        if (isset($parent_id)) $data['parent_id'] = $parent_id;
        if (isset($permissions)) $data['permissions'] = $permissions;
        if (isset($data_scope)) $data['data_scope'] = $data_scope;
        if (isset($sort)) $data['sort'] = $sort;

        $id = $m->add($data);
        if (!$id) {
            $this->response(array('error' => '添加失败!'));
        }
        $this->response(array('id' => $id, 'msg' => '添加成功!'));
    }

    function edit_post($id = '')
    {
        if(!M("common/permission")->check_permission("修改角色信息",$this->_user)){
            $this->response(array('error' => '无权限修改角色信息'));
        }
        $parent_id = $this->get_post('parent_id');
        $name = $this->get_post('name');
        $permissions = $this->get_post('permissions');
        $data_scope = $this->get_post('data_scope');
        $sort = $this->get_post('sort');

        if (!isset($id)) {
            $this->response(array('error' => '没有找到id'));
        }

        if (!isset($name)) {
            $this->response(array('error' => '没有角色名称'));
        }
        if (!isset($parent_id)) {
            $parent_id = 0;
        }

        $m = M('role');
        $old = $m->find($id);
        if (!$old) {//不存在
            $this->response(array('error' => ':id角色不存在'));
        }

        $data = array(
            'name' => $name,
        );
        if (isset($parent_id)) $data['parent_id'] = $parent_id;
        if (isset($permissions)) $data['permissions'] = $permissions;
        if (isset($data_scope)) $data['data_scope'] = $data_scope;
        if (isset($sort)) $data['sort'] = $sort;

        $edit = $m->save($data, $old['id']);
        if (!$edit) {
            $this->response(array('error' => '修改失败!'));
        }
        $user = M('user')->fetOne('id = '.$this->_user['id']);
        $data_scope = M('users/user')->get_scope($user['id'], $user['role_ids']);
        $permissions = M('users/user')->get_permissions($user['id'], $user['role_ids']);
        $user_row = array(
            'id' => $user['id'],
            'username' => $user['username'],
            'level' => $user['level'],
            'real_name' => $user['real_name'],
            'permissions' => $permissions,
            'data_scope' =>$data_scope,
            'token' => $this->_token,
            'token_level' => 1,
            'ip'=>$this->_ip,
        );
        $api_hosts = config_item('api_hosts');
        $api_list = array();
        foreach ($api_hosts as $app => $api) {
            $api_list[] = array('post/' . $app . '/sync/login', array('auth_code' => API_encode($app, $user_row)));
        }
        $result['results'] = API($api_list);//批量发出
        $this->response(array('id' => $id, 'msg' => '修改成功!'));
    }

    function delete_post($id = '')
    {
        if(!M("common/permission")->check_permission("删除角色",$this->_user)){
            $this->response(array('error' => '无权限删除角色'));
        }
        if ($id == '') {
            $id = $this->post('id');
        }
        if (!isset($id)) {
            $this->response(array('error' => '没有找到id'));
        }
        $user = M("user")->fetAll("role_ids like '%".$id."%'");
        if(sizeof($user)){
            $this->response(array('error'=>"存在该角色用户，无法删除"));
        }
        $id_tmp = explode(',', $id);
        $where_instr = "'" . join("','", $id_tmp) . "'";

        $m = M('role');
        $m->delete("id in (" . $where_instr . ")");

        $this->response(array('id' => $id, 'msg' => '删除成功'));
    }
}