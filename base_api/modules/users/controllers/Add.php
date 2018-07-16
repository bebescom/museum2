<?php

class Add extends MY_Controller
{

    function index_post()
    {
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

        if(!M("common/permission")->check_permission("添加用户",$this->_user)){
            $this->response(array('error' => '无权限添加用户'));
        }
        if (!isset($username)) {
            $this->response(array('error' => '用户名必填'));
        }
        if (!isset($password)) {
            $this->response(array('error' => '密码必填'));
        }

        $m = M('user');
        $old = $m->find("username='" . $username . "'");
        if ($old) {//存在
            $this->response(array('error' => '用户名已存在'));
        }

        $data = array(
            'username' => $username,
            'password' => md5($username . $password),
        );

        if (isset($role_ids)) $data['role_ids'] = $role_ids;
        if (isset($status)) $data['status'] = $status;
        if (isset($sort)) $data['sort'] = $sort;
        if (isset($real_name)) $data['real_name'] = $real_name;
        if (isset($tel)) $data['tel'] = $tel;
        if (isset($email)) $data['email'] = $email;
        if (isset($department)) $data['department'] = $department;
        if (isset($position)) $data['position'] = $position;
        if (isset($sort)) $data['sort'] = $sort;
        $data['level'] = isset($level)?$level:"工作人员";

        $id = $m->add($data);
        if (!$id) {
            $this->response(array('error' => '添加失败!'));
        }
        $this->response(array('id' => $id, 'msg' => '添加成功!'));

    }

}