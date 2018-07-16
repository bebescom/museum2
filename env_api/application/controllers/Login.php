<?php defined('BASEPATH') OR exit('No direct script access allowed');

/**
 * 登录base,并推送各子系统
 * Class Login
 */
class Login extends MY_Controller
{
    //登录，仅base,不验证token的user
    function index_post_nologin()
    {
        $result = array();
        $user = $this->post('user', true);
        $pwd = $this->post('pwd', true);
//        print_r($_REQUEST);
        if (empty($user) || empty($pwd)) {
            $this->response(array('error' => '请输入用户名和密码'));
        }
        $m = M('user');
        $row = $m->find("username='" . $user . "'");
        if (!$row) {
            $this->response(array('error' => '不存在此用户'));
        }

        if ($row['password'] != md5($user . $pwd)) {
            $this->response(array('error' => '密码错误'));
        }

        $permissions = array('环境监测', '系统管理', '环境监测.概览', '环境监测.概览.新增');
        $user_row = array(
            'user_id' => $user['id'],
            'user_name' => $user['username'],
            'level' => $user['level'],
            'realname' => $user['realname'],
            'permissions' => $permissions,
            'data_scope'=>'',
            'token' => $this->_token);

        $api_hosts = config_item('api_hosts');
        $api_list = array();
        foreach ($api_hosts as $app => $api) {
            $api_list[] = array('post/' . $app . '/sync/login_sync', array('auth_code' => API_encode($app, $user_row)));
        }
        API($api_list);//批量发出
        $result ['msg'] = $user . '登录成功';
        $result['permissions'] = $permissions;
        $result['is_login'] = true;

        $this->response($result);
    }

    //退出，仅base
    function logout_post()
    {

        $local_api = config_item('local_api');
        $api_hosts = config_item('api_hosts');
        $result = array('msg' => '注销成功');
        $api = $api_hosts[$local_api];
        unset($api_hosts[$local_api]);
        $api_hosts[$local_api] = $api;//将当前应用 放在最后退出，否则token将改变
        $api_list = array();
        foreach ($api_hosts as $app => $api) {
            $api_list[] = array('post/' . $app . '/sync/logout_sync',
                array('auth_code' => API_encode($app, array('token' => $this->_token)))
            );
        }
        API($api_list);//批量发出
        $result['is_exit'] = true;

        $this->response($result);
    }

}