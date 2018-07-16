<?php 

class Data_model extends MY_Model
{

	/**
	* 查找设备：如果设备不存在，则添加设备；否则，修改设备参数
	 * @param $equip_no string   设备编号
	 * @param $json  array 设备监测数据
	 *@return equip   设备信息
	 **/
	function findEquip($equip_no,$json=array())
	{
		$type = equip_type('code');
		$parameters = M("equipments/equip")->get_parameters('sensor');
		$sensor_parameters = array();
		foreach($parameters as $parameter){
			$sensor_parameters[] = $parameter['param'];
		}

		$config = app_config();
		$e_type = substr($equip_no,-11,3);
		$e = M('equip');
		$equip = $e->find("equip_no = '" . $equip_no . "'");
		$equip_type = "";
		if (array_search($e_type,$type)) {
			$equip_type = array_search($e_type,$type);
		}

		if ($e_type === "007") {//智能囊匣
			$this->add_box($equip_no,$json);
		}

		if ($equip) {
			$update = array();
			if (isset($json['param'])) {
				if ($json['param']) {
					$params = array();
					foreach ($json['param'] as $jp => $jv) {
						if (in_array($jp, $sensor_parameters)) {
							$params[] = $jp;
						}
					}
					if ($params && $equip_type != "中继" && $equip_type != "网关") {
						$param = implode(',', $params);
						$update['parameter'] = $param;
					}
				}
			}
			if(isset($json['ip_port'])){
				$update['ip_port'] = $json['ip_port'];
			}
//			if(isset($json['equip_time'])&&$json['equip_time']>$equip['last_equip_time']){
//				$update['parameter_val'] = json_encode($json['param']);
//				$update['last_equip_time'] = $json['equip_time'];
//			}
			if ($update) {
				$e->update($update, "equip_no ='" . $equip_no . "'");
				$equip = $e->find("equip_no ='" . $equip_no . "'");
			}
		} else {
			if(isset($config['auto_insert_equip'])&&!$config['auto_insert_equip']){
				return array("result"=>false,"msg"=>"设备自动录入已关闭");
			}
			$equip['sleep'] = '600';
			if ($e_type === "013") {
				$equip['sleep'] = "900";
				$equip['monitor_type'] = "仅监测";
			} else if (in_array($e_type, array("001", "008", "009", "010", "011", "012", "017", "018","020","021","022"))) {
				$equip['monitor_type'] = "仅监测";
			} else if ($e_type === "007") {
				$equip['monitor_type'] = "仅监测";
			} else if ($e_type === "002" || $e_type === "016"|| $e_type === "019") {
				$equip['monitor_type'] = "主动调控";
			} else if ($e_type === "998") {
				$equip['monitor_type'] = "被动调控";
			}else if($e_type === "003"||$e_type === "004"){
				unset($equip['sleep']);
				$equip['monitor_type'] = "网络设备";
			}
			$equip['name'] = substr($equip_no,-11);
			$equip['equip_no'] = $equip_no;
			$equip['equip_type'] = $equip_type;
			$equip['status'] = '备用';
			$equip['usage'] = '备用';

			if(isset($json['ip_port'])){
				$equip['ip_port'] = $json['ip_port'];
			}
			if (isset($env_no) && $env_no) {
				$equip['env_no'] = $env_no;
			}
//			if(isset($json['equip_time'])){
//				$equip['last_equip_time'] = $json['equip_time'];
//			}
			$params = array();
			if (isset($json['param']) && $equip_type != "中继" && $equip_type != "网关") {
				foreach ($json['param'] as $jp => $jv) {
					if (in_array($jp, $sensor_parameters)) {
						$params[] = $jp;
					}
				}
				if($params){
					$equip['parameter'] = implode(',', array_intersect($params, $sensor_parameters));
				}
//				$equip['parameter_val'] = json_encode($json['param']);
			}

			$id = $e->add($equip);
			$equip = $e->find($id);
		}

		return $equip;
	}

	function weather($equip_no,$json=array()){

		$weather = M('equip')->find("equip_no = '".$equip_no."'");
		if(!$weather){
			$type = equip_type('code');
			$weather['equip_no'] = $equip_no;
			$weather['name'] = '气象站';
			$weather['last_equip_time'] = $json['equip_time'];
			$weather['status'] = '正常';
			$weather['equip_type'] = array_search(substr($equip_no,-11,3),$type);
			if($json['param']){
				$weather['parameter_val'] = json_encode($json['param']);
				$weather['parameter'] = implode(",",array_keys($json['param']));
			}
			M('equip')->add($weather);
		}

		$weather_data = array();
		$weather_data['weather_no'] = $equip_no;
		$weather_data['equip_time'] = isset($json['equip_time'])?$json['equip_time']:"";
		$weather_data['server_time'] = isset($json['server_time'])?$json['server_time']:"";
		$weather_data['php_time'] = time();
		if($json['param']){
			foreach($json['param'] as $p=>$v){
				$weather_data[$p] = $v;
			}
		}

		//测试数据过滤
		if(isset($weather_data['humidity'])&&isset($weather_data['temperature'])){
			if($weather_data['humidity']<-100 && ($weather_data['temperature']<-100)){
				return array('result'=>false,'msg'=>'温湿度均小于-100，测试数据');
			}
		}
		if(!$weather_data['equip_time'] || abs($weather_data['equip_time'] - $weather_data['server_time'])> 48 * 3600){
			$weather_data['equip_time'] = $weather_data['server_time'];
		}

		$parameters = M("equipments/equip")->get_parameters('weather');
		$params = array();
		foreach($parameters as $parameter){
			$params[$parameter['param']] = $parameter;
		}
		$expcetion_data = array(
			'equip_no'=>$equip_no,
			'raw_data' =>$json['raw_data'],
			'equip_time'=>$weather_data['equip_time'],
			'server_time'=>$weather_data['server_time'],
			'php_time'=>time()
		);
		$expcetion_data = $weather_data;
		$remark = array();
		if(isset($params)&&$params) {
			$remark = array();
			foreach ($params as $param => $un) {
				$min = 0;
				$max = 100000000;
				$unit = isset($un['unit']) ? $un['unit'] : '';
				$name = isset($un['name']) ? $un['name'] : '';
				switch ($param) {
					case 'temperature':
						$min = -30;
						$max = 70;
						break;
					case 'humidity':
						$min = 0;
						$max = 110;
						break;
					case 'light':
						$min = 0;
						$max = 200000;
						break;
					case 'uv':
						$min = 0;
						$max = 8000;
						break;
					case 'co2':
						$min = 0;
						$max = 5000;
						break;
					case 'voc':
						$min = 0;
						$max = 20000;
						break;
					case 'PM10':
						$min = 0;
						$max = 1000;
						break;
					case 'PM25':
						$min = 0;
						$max = 500;
						break;
					case 'air_presure':
						$min = 0;
						$max = 1100;
						break;
					case 'wind_direction':
						$min = 0;
						$max = 360;
						break;
					case 'wind_speed':
						$min = 0;
						$max = 50;
						break;
					default:
						break;
				}

				if (isset($weather_data[$param])) {
					$val = $weather_data[$param];
					$expcetion_data[$param] = $weather_data[$param];
					if ($val === "NaN" || $val < $min || $val > $max) {
						$data_alert = array(
							'equip_no' => $weather['weather_no'],
							'name' => $weather['name'],
							'alert_time' => isset($weather_data['equip_time']) ? $weather_data['equip_time'] : time(),
							'env_no' => '',
							'alert_count' => 1,
							'clear_time' => isset($weather_data['equip_time']) ? $weather_data['equip_time'] : time(),
							'clear_remark' => '',
						);
						$data_alert['type'] = '数据错误';
						$expcetion_data['status'] = '数据错误';
						$data_alert['alert_remark'] = "异常----{$name}数据错误:{$val}{$unit}";
						$remark[] = "{$name}数据错误:{$val}{$unit}";

						M('equip_alert')->add($data_alert);
						unset($weather_data[$param]);
					}
				}
			}
		}

		if(isset($expcetion_data['status'])&&$expcetion_data['status'] == "数据错误"){
			$expcetion_data['remark'] = implode(";",$remark);
			M("data_sensor_exception")->add($expcetion_data);
		}
		$ret = M('weather_data')->add($weather_data);
		$result = $ret?array('result'=>true,'msg'=>'写入成功'):array('error'=>'写入失败');
		return $result;
	}

	function add_box($no,$json){
		$box = array();
		$box['env_no'] = $no;
		$box['name'] = $no;
		if(isset($json['box_status'])){
			$box['box_status'] = $json['box_status'];
		}

		$ret = false;
		$check_box = M('box')->fetOne("env_no = '{$no}'");
		if($check_box){
			$ret = M('box')->update($box,"env_no = '{$no}'");
		}else{
			$ret = M('box')->add($box);
		}
		return $ret;
	}

	/**
	* 根据环境编号查找文物
	 * @param $env_no string 环境编号
	 * @return array  该环境下所有文物的编号
	 */
	function findRelic($env_no){
		//文物信息
		$relic = API('get/relic/relics/relic',array('parent_env_no'=>$env_no));
		$relics = array();
		if($relic && isset($relic['total']) && $relic['total']>0){
			foreach($relic['rows'] as $rl){
				if(isset($rl['relic_no']) && $rl['relic_no']){
					$relics[$rl['relic_no']] = $rl;
				}
			}
		}

		return $relics;
	}
}
