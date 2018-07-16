<?php

class Permissions extends MY_Controller
{
    function index()
    {
        $keyword = $this->get_post('keyword');
        $id = $this->get_post('id');
        $sort_by = $this->get_post('sort_by');

        if (!isset($sort_by)||$sort_by=='') {
            $sort_by = "sort desc,id asc";
        }
        $where = "1=1";
        if (isset($keyword)&&$keyword!='') {
            $where .= " and concat_ws('',`name`,`val`,`group`,app) like '%" . $keyword . "%'";
        }
        if (isset($id)&&$id!='') {
            $where .= " and id in (" . $id . ")";
        }
        $m = M('permission');
        $list = $m->fetAll($where, "id,name,val,`group`,app,sort", $sort_by);
//        foreach ($list as $k => $row) {
//            $list[$k]['role_names'] = $m->get_role_names($row['role_ids']);
//        }
        $result = array(
            'total' => count($list),
            'rows' => $list,
        );
        $this->response($result);
    }

    function tab_tree_get()
    {
        $m = M('permission');
        $list = $m->fetAll("", "id,name,val,`group`,app,sort", "sort desc,id asc");

        $tab_tree = array();

        foreach ($list as $k => $row) {

            if (!isset($tab_tree[$row['app']])) {
                $tab_tree[$row['app']] = array();
            }
            if (!isset($tab_tree[$row['app']][$row['group']])) {
                $tab_tree[$row['app']][$row['group']] = array();
            }
            if($row['val'] != $row['group']){
                $tab_tree[$row['app']][$row['group']][] = array('name'=>$row['name'],'val'=>$row['val']);
            }
        }

        $this->response($tab_tree);

    }

    function info_get($id = '')
    {
        if ($id == '') {
            $this->response(array('error' => '没有找到id'));
        }

        $m = M('permission');
        $info = $m->find($id);
        if (!$info) {
            $this->response(array('error' => '没有找到角色信息'));
        }
        $this->response($info);
    }

    function add_post()
    {
        if(!M("common/permission")->check_permission("添加权限",$this->_user)){
            $this->response(array('error' => '无权限添加权限'));
        }
        $name = $this->post('name');
        $val = $this->post('val');
        $group = $this->post('group');
        $app = $this->post('app');
        $sort = $this->post('sort');

        if (!isset($name)) {
            $this->response(array('error' => '没有角色名称'));
        }
        if (!isset($val)) {
            $this->response(array('error' => '没有权限值'));
        }

        $m = M('permission');

        $data = array(
            'name' => $name,
            'val' => $val,
        );

        if (isset($group)) $data['group'] = $group;
        if (isset($app)) $data['app'] = $app;
        if (isset($sort)) $data['sort'] = $sort;

        $id = $m->add($data);
        if (!$id) {
            $this->response(array('error' => '添加失败!'));
        }
        $this->response(array('id' => $id, 'msg' => '添加成功!'));
    }

    function edit_post($id = '')
    {
        if(!M("common/permission")->check_permission("修改权限信息",$this->_user)){
            $this->response(array('error' => '无权限修改权限信息'));
        }
        $name = $this->post('name');
        $val = $this->post('val');
        $group = $this->post('group');
        $app = $this->post('app');
        $sort = $this->post('sort');

        if (!isset($id)) {
            $this->response(array('error' => '没有找到id'));
        }

        if (!isset($name)) {
            $this->response(array('error' => '没有权限名'));
        }
        if (!isset($val)) {
            $this->response(array('error' => '没有权限值'));
        }

        $m = M('permission');
        $old = $m->find($id);
        if (!$old) {//不存在
            $this->response(array('error' => ':id权限不存在'));
        }

        $data = array(
            'name' => $name,
            'val' => $val,
        );

        if (isset($group)) $data['group'] = $group;
        if (isset($app)) $data['app'] = $app;
        if (isset($sort)) $data['sort'] = $sort;

        $edit = $m->save($data, $old['id']);
        if (!$edit) {
            $this->response(array('error' => '修改失败!'));
        }
        $this->response(array('id' => $id, 'msg' => '修改成功!'));
    }

    function delete_post($id = '')
    {
        if(!M("common/permission")->check_permission("删除权限",$this->_user)){
            $this->response(array('error' => '无权限删除权限'));
        }
        if ($id == '') {
            $id = $this->post('id');
        }
        if (!isset($id)) {
            $this->response(array('error' => '没有找到权限id'));
        }
        $id_tmp = explode(',', $id);
        $where_instr = "'" . join("','", $id_tmp) . "'";

        $m = M('permission');
        $m->delete("id in (" . $where_instr . ")");

        $this->response(array('id' => $id, 'msg' => '删除成功'));
    }
}