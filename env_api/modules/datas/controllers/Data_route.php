<?php
class Data_route extends MY_Controller {

    public function __construct(){
        parent::__construct();
        $this->type = equip_type('code');

    }

    function index_post_nologin(){
        $route = $this->post();
        $museum_no = app_config('museum_no');
        if(!isset($museum_no) || $museum_no == ''){
            $this->response(array("result"=>false,"msg"=>"博物馆编号不存在，请完善博物馆配置信息"));
        }

	    $data_model = M("data");

        $route_data = array();
        if(isset($route['gateway_no'])&&$route['gateway_no'] !== ''&&$route['gateway_no'] !== "00000000000"){
	        $data_model->findEquip($museum_no.$route['gateway_no'],$route);
            $route_data['gateway_no'] = $route['gateway_no'];
        }

        if(isset($route['relay1_no'])&&$route['relay1_no']&&$route['relay1_no']!=="00000000000"){
	        $data_model->findEquip($museum_no.$route['relay1_no']);
            $route_data['relay1_no'] = $route['relay1_no'];
        }

        if(isset($route['relay2_no'])&&$route['relay2_no']&&$route['relay2_no']!=="00000000000"){
	        $data_model->findEquip($museum_no.$route['relay2_no']);
            $route_data['relay2_no'] = $route['relay2_no'];
        }

        if(isset($route['relay3_no'])&&$route['relay3_no']&&$route['relay3_no']!=="00000000000"){
	        $data_model->findEquip($museum_no.$route['relay3_no']);
            $route_data['relay3_no'] = $route['relay3_no'];
        }

        if(isset($route['sensor_no'])&&$route['sensor_no']&&$route['sensor_no']!=="00000000000"){
	        $data_model->findEquip($museum_no.$route['sensor_no']);
            $route_data['sensor_no'] = $route['sensor_no'];
        }

        $route_data['raw_data'] = $route['raw_data'];
        $route_data['server_time'] = $route['server_time'];
        $ret = M('data_route')->add($route_data);
        if($ret){
            $this->response(array('result'=>true,'msg'=>'路由信息写入成功'));
        }
    }

}