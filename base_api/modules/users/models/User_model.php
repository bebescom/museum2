<?php

class User_model extends MY_Model
{
    function get_user($uid = 0)
    {
        static $_users = array();
        if (isset($_users[$uid])) {
            return $_users[$uid];
        }
        $list = $this->fetAll();
        foreach ($list as $row) {
            $_users[$row['id']] = $row;
        }

        if (isset($_users[$uid])) {
            return $_users[$uid];
        }
        return false;
    }

    function get_permissions($uid = 0, $role_ids = '')
    {
        $user = $this->get_user($uid);
        if (isset($user['level'])&&($user['level'] == "超级管理员"||$user['level'] == "服务端")) {
            return 'administrator';
        }
        if ($role_ids == '') {
            if (!$user) {
                return '';
            }
            $role_ids = $user['role_ids'];
        }
        return $this->_get_permissions($role_ids);

    }

    function _get_permissions($role_ids)
    {
        if($role_ids==''){
            return '';
        }
        $m = M('role');
        $list = $m->fetAll(' id in ("' . implode('","',explode(',',$role_ids)) .'")');
        $permissions = array();
        foreach ($list as $row) {
            if (isset($row['permissions']) && $row['permissions'] != '') {
                $tmp = explode(',', $row['permissions']);
                $permissions = array_merge($tmp, $permissions);
            }
        }
        $permissions = array_unique($permissions);
        if (count($permissions) == 0) {
            return '';
        }
        $list = M('permission')->fetAll("", "id,name,val,`group`,app,sort", "sort desc,id asc");

        $tab_tree = array();

        foreach ($list as $k => $row) {
            if(in_array($row['val'],$permissions)){
                if (!isset($tab_tree[$row['group']])) {
                    $tab_tree[$row['group']] = array();
                }
//                $tab_tree[$row['group']][] = array('name'=>$row['name'],'val'=>$row['val']);
                if($row['val'] != $row['group']){
                    $tab_tree[$row['group']][] = array('name'=>$row['name'],'val'=>$row['val']);
                }
            }

        }

//        $permissions = join(',', $permissions);
        return $tab_tree;
    }

    function get_role_names($role_ids)
    {
        $rm = M('roles/role');

        $role_names = array();
        if ($role_ids != '') {
            $role_tmp = explode(',', $role_ids);
            foreach ($role_tmp as $role_id) {
                $role = $rm->get_role($role_id);
                if ($role) {
                    $role_names[] = $role['name'];
                }
            }
        }
        return join(',', $role_names);

    }

    function login_count($user_id)
    {
        $m = M('user_login');
        $today_time = strtotime(date('Y-m-d'));
        $count = $m->count("user_id='" . $user_id . "' and login_time>" . $today_time);
        if ($count == 0) {
            $m->add(array('user_id' => $user_id, 'login_time' => time()));
        }
    }

    function get_scope($uid = 0, $role_ids = '')
    {
        $user = $this->get_user($uid);
        if (isset($user['level'])&&($user['level'] == "超级管理员"||$user['level'] == "服务端")) {
            return 'administrator';
        }
        if ($role_ids == '') {
            if (!$user) {
                return '';
            }
            $role_ids = $user['role_ids'];
        }
        return $this->_get_scope($role_ids);

    }

    function _get_scope($role_ids)
    {
        if($role_ids==''){
            return '';
        }
        $m = M('role');
        $list = $m->fetAll(' id in ("' . implode('","',explode(',',$role_ids)) .'")');
        $data_scope = array();
        foreach ($list as $row) {
            if (isset($row['data_scope']) && $row['data_scope'] != '') {
                $tmp = explode(',', $row['data_scope']);
                $data_scope = array_merge($tmp, $data_scope);
            }
        }
        $data_scope = array_unique($data_scope);

        return $data_scope;
    }
}