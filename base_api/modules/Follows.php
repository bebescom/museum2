<?php

class Follows extends MY_Controller
{
    function index()
    {
        if (!isset($this->_user['id'])) {
            $this->response(array('error' => '获取不了用户信息'));
        }
        $keyword = $this->get_post('keyword');
        $type = $this->get_post('type');
        $sort_by = $this->get_post('sort_by');
        $id = $this->get_post('id');
        $rows = $this->get_post('rows');
        $no = $this->get_post('no');

        if (!isset($sort_by)) {
            $sort_by = "sort desc,id asc";
        }
        $where = "1=1 and user_id=" . $this->_user['id'];
        if (isset($keyword) && $keyword != '') {
            $where .= " and concat_ws('',no,name) like '%" . $keyword . "%'";
        }
        if (isset($type) && $type != '') {
            $type_tmp = explode(',', $type);
            $type_instr = "'" . join("','", $type_tmp) . "'";
            $where .= " and `type` in (" . $type_instr . ")";
        }
        if (isset($id) && $id != '') {
            $where .= " and id in (" . $id . ")";
        }

	    if (isset($no) && $no != '') {
		    $nos = explode(",",$no);
		    $where .= " and no in ('" . implode("','",$nos) . "')";
	    }

        $m = M('user_follow');
        $list = $m->fetAll($where, "*", $sort_by,0,$rows);
        $result = array(
            'total' => count($list),
            'rows' => $list,
        );
        $this->response($result);
    }

    function add_post()
    {
        if (!isset($this->_user['id'])) {
            $this->response(array('error' => '获取不了用户信息'));
        }
        $name = $this->post('name');
        $type = $this->post('type');
        $no = $this->post('no');
        $sort = $this->post('sort');

        if (!isset($name)) {
            $this->response(array('error' => '没有对象名称'));
        }
        if (!isset($no)) {
            $this->response(array('error' => '没有对象编号'));
        }
        if (!isset($type)) {
            $this->response(array('error' => '没有对象类型'));
        }
        $m = M('user_follow');
        $old = $m->find("user_id='" . $this->_user['id'] . "' and concat_ws('',no,type) = '" . $no . $type . "'");
        if ($old) {//存在
            $this->response(array('error' => '对象编号+对象类型信息重复'));
        }

        $data = array(
            'name' => $name,
            'no' => $no,
            'type' => $type,
            'user_id' => $this->_user['id'],
        );

        if (isset($sort)) $data['sort'] = $sort;

        $id = $m->add($data);
        if (!$id) {
            $this->response(array('error' => '添加失败!'));
        }
        $this->response(array('id' => $id, 'msg' => '添加成功!'));
    }

    function edit_post($id = '')
    {
        if (!isset($this->_user['id'])) {
            $this->response(array('error' => '获取不了用户信息'));
        }
        $name = $this->post('name');
        $type = $this->post('type');
        $no = $this->post('no');
        $sort = $this->post('sort');

        if (!isset($id)) {
            $this->response(array('error' => '没有找到id'));
        }
        if (!isset($name)) {
            $this->response(array('error' => '没有对象名称'));
        }
        if (!isset($no)) {
            $this->response(array('error' => '没有对象编号'));
        }
        if (!isset($type)) {
            $this->response(array('error' => '没有对象类型'));
        }
        $m = M('user_follow');
        $old = $m->find("id='" . $id . "' and user_id='" . $this->_user['id'] . "'");
        if (!$old) {//不存在
            $this->response(array('error' => '所属当前用户的id信息不存在'));
        }

        $data = array(
            'name' => $name,
            'no' => $no,
            'type' => $type,
        );

        if (isset($sort)) $data['sort'] = $sort;

        $edit = $m->save($data, $old['id']);
        if (!$edit) {
            $this->response(array('error' => '修改失败!'));
        }
        $this->response(array('id' => $id, 'msg' => '修改成功!'));
    }

    function delete_post($no = '')
    {
        if ($no == '') {
	        $no = $this->post('no');
        }
        if (!isset($no)) {
            $this->response(array('error' => '没有找到关注对象'));
        }
        if (!isset($this->_user['id'])) {
            $this->response(array('error' => '获取不了用户信息'));
        }
        $id_tmp = explode(',', $no);
        $where_instr = "'" . join("','", $id_tmp) . "'";

        $m = M('user_follow');
        $m->delete("no in (" . $where_instr . ") and user_id='" . $this->_user['id'] . "'");

        $this->response(array('no' => $no, 'msg' => '删除成功'));
    }

}