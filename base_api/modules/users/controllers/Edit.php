<?php

class Edit extends MY_Controller
{

    function index_post($id = 0)
    {
        if (!isset($id)) {
            $this->response(array('error' => '没有找到id'));
        }

        if(!M("common/permission")->check_permission("修改用户",$this->_user)){
            $this->response(array('error' => '无权限修改用户信息'));
        }
        $username = $this->get_post('username');
        $password = $this->get_post('password');
        $role_ids = $this->get_post('role_ids');
        $status = $this->get_post('status');
        $level = $this->get_post('level');
        $real_name = $this->get_post('real_name');
        $tel = $this->get_post('tel');
        $email = $this->get_post('email');
        $department = $this->get_post('department');
        $position = $this->get_post('position');
        $sort = $this->get_post('sort');

        if (!isset($username)) {
            $this->response(array('error' => '用户名必填'));
        }

        $m = M('user');
        $old = $m->find("username='" . $username . "' and id = " . $id);

        $data = array();
        if (isset($password) && $password != '') $data['password'] = md5($username . $password);
        if (isset($role_ids)) $data['role_ids'] = $role_ids;
        if (isset($status)) $data['status'] = $status;
        if (isset($level)) $data['level'] = $level;
        if (isset($sort)) $data['sort'] = $sort;
        if (isset($real_name)) $data['real_name'] = $real_name;
        if (isset($tel)) $data['tel'] = $tel;
        if (isset($email)) $data['email'] = $email;
        if (isset($department)) $data['department'] = $department;
        if (isset($position)) $data['position'] = $position;
        if (isset($sort)) $data['sort'] = $sort;

        $edit = $m->save($data, $old['id']);
        if (!$edit) {
            $this->response(array('error' => '修改失败!'));
        }
        $this->response(array('id' => $old['id'], 'msg' => '修改成功!'));

    }

}