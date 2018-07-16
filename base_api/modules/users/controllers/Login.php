<?php
require_once APPPATH.'libraries/Alidayu/TopSdk.php';
class Login extends MY_Controller
{
    function index_post_nologin()
    {
        $result = array();
        $user = $this->post('user');
        $pwd = $this->post('pwd');
        $ip = $this->post('ip');
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

	    $ip = $this->_ip;
//        if($ip){
//            $str = substr($ip,0,7);
//            if($str == "192.168"||$ip == "127.0.0.1"){
//                $this->_login($row);
//            }else{
//                $this->check_ip($row,$ip);
//            }
//        }
	    $this->_login($row);
    }

	function _login($row){
		$m = M('user');
		$m->login_count($row['id']);//记录登录次数
		$permissions = $m->get_permissions($row['id'], $row['role_ids']);//array('环境监测', '系统管理', '环境监测.概览', '环境监测.概览.新增');
		$data_scope = $m->get_scope($row['id'], $row['role_ids']);
		$user_row = array(
			'id' => $row['id'],
			'username' => $row['username'],
			'level' => $row['level'],
			'real_name' => $row['real_name'],
//			'tel' => $row['tel'],
//			'email' => $row['email'],
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

		$result ['msg'] = $row['username'] . '登录成功';
		$result['permissions'] = $permissions;
		$result['data_scope'] = $data_scope;
		$result['is_login'] = true;
		$result['token'] = $this->_token;

		$this->response($result);
	}

	function check_ip($user,$ip){
		if($ip){
			$city = app_config('city');

			$ip_info = json_decode(file_get_contents("http://ip.taobao.com/service/getIpInfo.php?ip=".$ip),true);
//			$this->response($ip_info);
			if(isset($ip_info['code'])&&$ip_info['code'] == 0){
				$ip_data = array();
				if($city === $ip_info['data']['city']|| "未分配或者内网IP" === $ip_info['data']['country']){
					$ip_data['user_id'] = $user['id'];
					$ip_data['login_time'] = time();
					$ip_data['city'] = $city;
					$ip_data['ip'] = $ip;
					$ip_data['pass'] = "是";

					M("user_ip")->add($ip_data);
					$this->_login($user);
				}else{
					$code = rand(1000,9999);
					$user_ip = array(
						'user_id'=>$user['id'],
						'login_time'=>time(),
						'city'=>$ip_info['data']['city'],
						'ip'=>$ip,
						'code'=>$code,
						'token'=>$this->_token
					);
					M("user_ip")->add($user_ip);
					$resq = $this->send_code($user,$code);
					$this->response(array("uesr_id"=>$user['id'],'token'=>$this->_token));
				}
			}
		}
	}

	function send_code($user,$code){
		$c = new TopClient;
		$c->appkey = "23409660";
		$c->secretKey = "cd146f14e69ef988aa9094ce64f3bafa";
		$req = new AlibabaAliqinFcSmsNumSendRequest;
		$req->setExtend("123456");
		$req->setSmsType("normal");
		$req->setSmsFreeSignName("智慧博物馆");
		$data = array(
			'name'=>$user['real_name'],
			'code'=>$code.""
		);
		$req->setSmsParam(json_encode($data));
		$req->setRecNum($user['tel']);
		$req->setSmsTemplateCode("SMS_12490178");
		$resp = $c->execute($req);
	    return $resp;
	}


	function check_code_get_nologin(){
		$token = $this->get_post("token");
		$code = $this->get_post("code");

		$user_ip = M('user_ip')->find("token = '".$token."'","*","login_time desc");

		if(isset($user_ip['user_id'])&&$user_ip['user_id']){
			$user = M('user')->find($user_ip['user_id']);
		}
		if(isset($user) &&$user){
			if(isset($user_ip['login_time'])&& $user_ip['login_time']){
				if(time() - $user_ip['login_time'] > 900){
					$this->response(array("result"=>"failed","msg"=>"您的验证码已过期，请重新获取验证码"));
					M('user_ip')->save(array('pass'=>"否"),"id = ".$user_ip['id']);
				}else{
					if(isset($user_ip['code'])&&$user_ip['code']){
						if($user_ip['code'] == $code){
							M('user_ip')->save(array('pass'=>"是"),"id = ".$user_ip['id']);
							$this->_login($user);
						}else{
							$this->response(array("result"=>"failed","msg"=>"验证码错误，请重新输入"));
						}
					}
				}
			}
		}
	}

}
