<?php
class Sso extends MY_Controller
{
    function index_post_nologin()
    {

        $auth_code = $this->post('auth_code');
        if (empty($auth_code)) {
            $this->response(array('error' => '缺少加密串！'), 400);
        }

        // 验证
        $this->load->library('rest_des');
        $data = json_decode($this->rest_des->decrypt(base64_decode($auth_code), app_config('museum_no')), true);

        if (empty($data)) {
            $this->response(array('error' => '解密失败！'), 400);
        }
        if(!isset($data['time']) || abs($data['time']-time())>600){
            $this->response(array('error' => '无效加密串！'), 400);
        }

    	// 同步
    	$user_row = array(
            'id'=>-5,
            'username' => $data['username'],
            'real_name' => '单点登录',
            "level"=>"服务端",
            "permissions"=>"administrator",
            "data_scope"=>"administrator",
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

        // 返回结果
        $result ['msg'] = $user_row['username'].'登录成功';
        $result ['token'] = $user_row['token'];
        $result['is_login'] = true;
    	$this->response($result);
    }


}
