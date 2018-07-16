<?php defined('BASEPATH') OR exit('No direct script access allowed');

class Config extends MY_Controller
{
    function index_nologin()
    {
        $result = array();
        $result['app_name'] = app_config('app_name');
        $result['user'] = $this->_user;
        $result['token'] = $this->_token;
        $result['ip'] = $this->input->ip_address();
        $result['museum_name'] = app_config('museum_name');
        $result['museum_no'] = app_config('museum_no');
        $result['monitor_port'] = app_config('monitor_port');
        // $result['bg'] = app_config('bg');
         $result['web_user'] = app_config('web_user');
         $result['web_msg'] = app_config('web_msg');
        $result['app_port'] = app_config('app_port');
        $result['vibration'] = app_config('vibration');
        $result['yuanzhi'] = app_config('yuanzhi');
        $result['capsule'] = app_config('capsule');
        $result['is_web_msg'] = false;
        if(isset($result['web_user'])&&$result['web_user']&&isset($result['web_msg'])&&$result['web_msg']){
            if(strpos($result['web_user'],$this->_user['id']) !== false){
                $result['is_web_msg'] = true;
            }
        }
//        $this->output->enable_profiler(true);
        $this->response($result);
    }

    function index_post_nologin()
    {
        $result = array('error' => 'post', 'post' => $this->post(), 'get' => $this->get());
        $result['raw_args'] = $this->_raw_args;
        print_r($this->input->raw_input_stream);
        $this->response($result);
    }

    function index_put()
    {
        $this->response(array('error' => 'put'));
    }

    function index_delete()
    {
        $this->response(array('error' => 'delete'));
    }

    function test_get($aa = 0, $ab = 1)
    {

        $r = array();
        $r['aa'] = $aa;
        $r['ab'] = $ab;
        $r['ac'] = $this->get('ac');
        $r['a'] = $a = API_encode('user', 'user_c8g4w0ogwksw4osws0ggkk40gkwww0css8k4o0w4');

//        echo ',';
        $r['b'] = $b = API_decode('user', $a);

        $this->response($r);
    }

    function museum_no_get_nologin()
    {

        $config = M('config')->find(array('key'=>'museum_no'));

        $this->response($config);
    }

	function museum_config_get_nologin()
    {

		$keys = $this->get_post("keys");
		$data = array();
		if($keys){
			$keys = explode(',',$keys);
			if(is_array($keys)){
				foreach($keys as $key){
					$config = app_config($key);
					if(isset($config)){
						$data[$key] = $config;
					}
				}
			}
		}else{
			$data = app_config();
            foreach ($data as $dk=>$dt) {
                if(in_array($dk,array("web_user","phone_user","email_user"))&&$dt){
                    $ids = explode(",",$dt);
                    $data[$dk] = $ids;
                }
            }
		}

		$this->response($data);
	}

    function edit_post()
    {
        $museum_name = $this->get_post('museum_name');
        $museum_no = $this->get_post('museum_no');
        $app_name = $this->get_post('app_name');
        $region_no = $this->get_post('region_no');
        $monitor_port = $this->get_post('monitor_port');
        $auto_insert_equip = $this->get_post('auto_insert_equip');
        $data_minimum_time_interval = $this->get_post('data_minimum_time_interval');
        $monitor_time = $this->get_post('monitor_time');
        $city = $this->get_post('city');
        $app_port = $this->get_post('app_port');
        $vibration = $this->get_post('vibration');
        $yuanzhi = $this->get_post('yuanzhi');
        $capsule = $this->get_post('capsule');
        $weather_key = $this->get_post('weather_key');
        $max_acquisition_time_interval = $this->get_post('max_acquisition_time_interval');
        $max_transmission_time_interval = $this->get_post('max_transmission_time_interval');
        $data_mutation_bounds = $this->get_post('data_mutation_bounds');
        $web_msg = $this->get_post('web_msg');
        $phone_msg = $this->get_post('phone_msg');
        $email_msg = $this->get_post('email_msg');
        $web_user = $this->get_post('web_user');
        $phone_user = $this->get_post('phone_user');
        $email_user = $this->get_post('email_user');
        $phone_time = $this->get_post('phone_time');
        $email_time = $this->get_post('email_time');

        $update = array();
        if(isset($museum_name)&&$museum_name){//博物馆名称
            $update['museum_name'] = $museum_name;
        }
        if(isset($museum_no)&&$museum_no){//博物馆编号
            $update['museum_no'] = $museum_no;
        }
        if(isset($app_name)&&$app_name){//应用标题
            $update['app_name'] = $app_name;
        }
        if(isset($region_no)&&$region_no){//所属区域中心编号
            $update['region_no'] = $region_no;
        }
        if(isset($monitor_port)&&$monitor_port){//消息推送端口
            $update['monitor_port'] = $monitor_port;
        }
        if(isset($auto_insert_equip)){//设备自动录入开关
            $update['auto_insert_equip'] = $auto_insert_equip;
        }

        $update['monitor_time'] = 900;
        if(isset($monitor_time)&&$monitor_time != ''){//
            $update['monitor_time'] = $monitor_time;
        }

        $update['data_minimum_time_interval'] = 60;
        if(isset($data_minimum_time_interval)&&$data_minimum_time_interval != ''){//数据处理时间
             $update['data_minimum_time_interval'] = $data_minimum_time_interval;
        }

        if(isset($city)&&$city){//所在城市，用于ip监测及气象数据获取
            $update['city'] = $city;
        }
        if(isset($weather_key)&&$weather_key){//气象数据api密钥
            $update['weather_key'] = $weather_key;
        }

        if(isset($app_port)&&$app_port){//app端口
            $update['app_port'] = $app_port;
        }
        if(isset($vibration)){//震动开关
            $update['vibration'] = $vibration;
        }
        if(isset($yuanzhi)){//元智开关
            $update['yuanzhi'] = $yuanzhi;
        }
        if(isset($capsule)){//囊匣开关
            $update['capsule'] = $capsule;
        }
        $update['max_acquisition_time_interval'] = 1800;
        if(isset($max_acquisition_time_interval)&& $max_acquisition_time_interval != ''){//设备异常时间间隔
            $update['max_acquisition_time_interval'] = $max_acquisition_time_interval;
        }
        $update['max_transmission_time_interval'] = 1800;
        if(isset($max_transmission_time_interval)&&$max_transmission_time_interval != ''){//传输异常时间间隔
            $update['max_transmission_time_interval'] = $max_transmission_time_interval;
        }
         $update['data_mutation_bounds'] = 2;
        if(isset($data_mutation_bounds)&&$data_mutation_bounds != ''){//突变数据倍数
            $update['data_mutation_bounds'] = $data_mutation_bounds;
        }
        $update['web_msg'] = 0;
        if(isset($web_msg)&&$web_msg != ''){//推送网页消息的开关
            $update['web_msg'] = $web_msg;
        }
        $update['phone_msg'] = 0;
        if(isset($phone_msg)&&$phone_msg != ''){//推送短信消息的开关
            $update['phone_msg'] = $phone_msg;
        }
        $update['email_msg'] = 0;
        if(isset($email_msg)&&$email_msg != ''){//推送邮件消息的开关
            $update['email_msg'] = $email_msg;
        }
        if(isset($web_user)){//推送网页消息的用户
            $update['web_user'] = $web_user;
        }
        if(isset($phone_user)){//推送短信消息的用户
            $update['phone_user'] = $phone_user;
        }
        if(isset($email_user)){//推送邮件消息的用户
            $update['email_user'] = $email_user;
        }
        if(isset($phone_time)){//短信消息推送时间段
            $update['phone_time'] = $phone_time;
        }
        if(isset($email_time)){//邮件消息推送时间段
            $update['email_time'] = $email_time;
        }

        $config = M('config')->fetAll();
        $cfg_data = array();
        if($config){
            foreach ($config as $cfg) {
                if(isset($cfg['key'])){
                    $cfg_data[$cfg['key']] = $cfg;
                }
            }
        }

        if($update){
            foreach($update as $key=>$val){
                $data = array('key'=>$key,'val'=>$val);
                if(in_array($key,array('app_ip','app_port'))){
                    $data['group'] = 'app';
                }else if(in_array($key,array('vibration','yuanzhi','capsule'))){
                    $data['group'] = 'extend';
                } else{
                    $data['group'] = 'system';
                }

                if(isset($cfg_data[$key])){
                    $ret = M('config')->update($data,"`key` = '".$key."'");
                }else{
                    $ret = M('config')->add($data);
                }
            }
        }

        $return = isset($ret)&&$ret?array('msg'=>'修改成功'):array('msg'=>'修改失败');
        $this->response($return);
    }

}