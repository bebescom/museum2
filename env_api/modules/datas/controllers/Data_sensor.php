<?php
class Data_sensor extends MY_Controller {

    public function __construct(){
        parent::__construct();

        $this->type = equip_type('code');
        $parameters = M("equipments/equip")->get_parameters('sensor');
        $this->sensor_parameters = array();
        $this->params = array();
        foreach($parameters as $parameter){
            $this->sensor_parameters[] = $parameter['param'];
			$this->params[$parameter['param']] = $parameter;
        }
	    $this->museum_config = app_config();
    }

	function index_post_nologin(){
        $json = $this->post();
        if(!$json){
			$this->response(array("error"=>"设备上传数据不能为空"));
        }
		$equip = array();
		if(!$json['sensor_no']){
			$this->response(array("error"=>"设备编号不能为空"));
		}
		$e_type = substr($json['sensor_no'],0,3);

		$museum_no = isset($this->museum_config['museum_no'])?$this->museum_config['museum_no']:'';
		if(!isset($museum_no) || $museum_no == ''){
			$this->response(array("error"=>"博物馆编号不存在，请完善博物馆配置信息"));
		}
		$equip_no = $museum_no.$json['sensor_no'];

		//同设备单位时间间隔内数据是否处理
//		if(isset($json['equip_time'])){
//			$this->_data_skip($json['equip_time'],$equip_no);
//		}

		$data_sensor = array();
		$data_sensor['status'] = "正常";
		if(!$equip_no){
			$this->response(array("error"=>"设备编号不能为空"));
		}
		if($e_type === "014"){//气象站数据
			$result = M('data')->weather($equip_no,$json);
			$this->response($result);
		}

		$equip = M('data')->findEquip($equip_no,$json);
		if(isset($equip['result'])&&!$equip['result']){
			$this->response($equip);
		}
		if(isset($equip['status'])&&$equip['status'] == '停用'){
			$this->response(array("result"=>false,"msg"=>"设备已停用"));
		}

		$alert_param = array();
		if(isset($equip['env_no'])&&$equip['env_no']){
			$alert_param = M('env_alert')->env_alert($equip,$json);
			$data_sensor['env_no'] = $equip['env_no'];
		}

		//智能囊匣及安防监测终端预警
		if($e_type == "018"){//安防监测终端预警
			if(isset($equip['env_no'])&&$equip['env_no']){
			   $alt_param = M('env_alert')->security_alert($equip,$json);
			}
		}else if($e_type == "007"){//智能囊匣预警
			$alt_param = M('env_alert')->box_alerts($equip,$json);
		}

		if(isset($alt_param)&&$alt_param){
			$alert_param = array_merge($alert_param,$alt_param);
		}
		if(isset($alert_param)&&$alert_param){
			$data_sensor['alert_param'] = implode(',',$alert_param);
			$alert_params = array();
			if($e_type == "007"){
				$box = M('box')->fetOne("env_no = '{$equip['equip_no']}'");
				if($box){
					if(isset($box['alert_param'])){
						$alert_params = explode(",",$box['alert_param']);
					}
					$alert_params = array_merge($alert_params,$alert_param);
				}
				$alert_params = array_values(array_unique($alert_params));
				if($alert_params){
					$ret = M('box')->update(array("alert_param"=>implode(",",$alert_params)),"env_no = '{$equip['equip_no']}'");
				}
			}
		}

		$data_sensor['equip_no'] = $equip_no;
		$data_sensor['equip_time'] = $json['equip_time'];
		$data_sensor['server_time'] = $json['server_time'];
		$data_sensor['raw_data'] = $json['raw_data'];
		$data_sensor['ip_port'] = $json['ip_port'];
		if(isset($json['param'])){
			foreach($json['param'] as $p=>$v){
				if(is_array($v)){
					$data_sensor[$p] = implode(',',$v);
				}else{
					$data_sensor[$p] = $e_type !="000"?deal_data_decimal($p,$v):$v;
				}
//				if(!in_array($p,$this->sensor_parameters)){
//					unset($json['param'][$p]);
//				}
			}
		}

		$data_sensor['php_time'] = time();
		if($data_sensor){
			try{
				if($equip['status'] != "备用"&&$equip['status'] != "停用"&&!in_array($equip['equip_type'],array('网关','中继')) ){
					$result = M('equip_alert')->_data_filter($equip,$data_sensor);
				}else{
					$insert_ret = M("data_sensor")->add($data_sensor);
					$result = $insert_ret?array('result'=>true,'msg'=>'数据写入成功'):array('error'=>'数据写入失败');
				}
				if(isset($json['equip_time'])&&$json['equip_time']>$equip['last_equip_time']){
					$equip_up['parameter_val'] = json_encode($json['param']);
					$equip_up['last_equip_time'] = $json['equip_time'];
					if(isset($result['result'])&&$result['result']){
						M("equip")->update($equip_up,"equip_no = '".$equip['equip_no']."'");
					}
				}
				$this->response($result);
			}catch (Exception $e){
				$this->response(array('error'=>$e));
			}
		}
	}

	/**
	* 同设备单位时间间隔内数据是否处理
	 *@param $equip_time 本次上传数据时间
	 *@param $equip_no 设备编号
	 * @return  true or error
	 */
	function _data_skip($equip_time,$equip_no){
		if(!isset($this->museum_config['data_minimum_time_interval'])){
			return true;
		}
		$interval = $this->museum_config['data_minimum_time_interval'];
		$last_data = M('data_sensor')->find("equip_no = '".$equip_no."' and equip_time <= ".time(),"*","equip_time desc");
		if($last_data){
			if(isset($last_data['equip_time'])&&$last_data['equip_time']){
				if(isset($equip_time)&&$equip_time){
					if(abs($equip_time - $last_data['equip_time'])< $interval){
						$this->response(array("error"=>"{$interval}以内数据,写入失败"));
					}
				}
			}
		}
		return true;
	}
}
