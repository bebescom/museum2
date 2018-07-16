<?php
class Weather extends MY_Controller{

	/**
	 *气象信息
	 ***/
    function weathers_get()
	{
	    $config = API("get/base/config/museum_config",array("keys"=>"weather_station,weather_key,city,data_order"));
	    $data = array();
		$week = array("日","一","二","三","四","五","六");
		$data['today'] = date("Y年m月d日 星期").$week[date("w")];
	    $data_order = "equip_time";

	    $e = M('equipments/equip');
	    $parameter = $e->get_parameters('weather');

		//在线天气信息
		$city = isset($config['city'])?$config['city']:"重庆";
		$key = isset($config['weather_key'])?$config['weather_key']:"";
		$city = str_replace("市","",$city);
		$ch = curl_init();
		if($key){
			$url = "https://free-api.heweather.com/v5/weather?city=".$city."&key=".$key;
			//执行HTTP请求
			curl_setopt($ch , CURLOPT_URL , $url);
			curl_setopt($ch , CURLOPT_SSL_VERIFYPEER , false);
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
			$weather_online = json_decode(curl_exec($ch),true);
			curl_close($ch);
		}
		$data_online = array();
		if(isset($weather_online)&&$weather_online){
			if(isset($weather_online["HeWeather5"])&&$weather_online["HeWeather5"]){
				$w = $weather_online["HeWeather5"][0];

				if(isset($w['now'])&&$w['now']){
					$data['from'] = '网络数据';
					$data_online['temperature'] = array();
					$data_online['temperature']['val'] = isset($w['now']['tmp'])?deal_data_decimal('temperature',$w['now']['tmp']):"";
					$data_online['humidity'] = array();
					$data_online['humidity']['val']  = isset($w['now']['hum'])?deal_data_decimal('humidity',$w['now']['hum']):"";
					$data_online['air_presure'] = array();
					$data_online['air_presure']['val']  = isset($w['now']['pres'])?deal_data_decimal('air_presure',$w['now']['pres']):"";
					$data_online['rain'] = array();
					$data_online['rain']['val']  = isset($w['now']['pcpn'])?deal_data_decimal('rain',$w['now']['pcpn']):"";
					if(isset($w['now']['wind'])&&$w['now']['wind']){
						$data_online['wind_direction'] = array();
						$data_online['wind_direction']['val']  = isset($w['now']['wind']['deg'])?deal_data_decimal('wind_direction',$w['now']['wind']['deg']):"";
						$data_online['wind_direction']['level'] = M('weather')->wind_direction($data_online['wind_direction']['val']);
						$data_online['wind_speed'] = array();
						$data_online['wind_speed']['val']  = isset($w['now']['wind']['spd'])?deal_data_decimal('wind_speed',$w['now']['wind']['spd']/3.6):"";
						$data_online['wind_speed']['level'] = isset($w['now']['wind']['sc'])?$w['now']['wind']['sc']:"";
					}
					if(isset($w['now']['cond'])&&$w['now']['cond']){
						$data_online['condition'] = array(
							"param"=>"condition",
							"name"=>"天气状况",
							"val"=>$w['now']['cond']['txt']
						);
					}
				}
				if(isset($w['aqi'])&&$w['aqi']){
					if(isset($w['aqi']['city'])&&$w['aqi']['city']){
						$data_online['pm25'] = array();
						$data_online['pm25']['val']  = isset($w['aqi']['city']['pm25'])?deal_data_decimal('pm25',$w['aqi']['city']['pm25']):"";
						$data_online['pm25']['level'] = M('weather')->pm25_level($data_online['pm25']['val']);
						$data_online['pm10'] = array();
						$data_online['pm10']['val']  = isset($w['aqi']['city']['pm10'])?deal_data_decimal('pm10',$w['aqi']['city']['pm10']):"";
						$data_online['pm10']['level'] = M('weather')->pm25_level($data_online['pm10']['val']);
						$data_online['aqi'] = array(
							'param'=>"aqi",
							'name'=>"空气质量"
						);
						$data_online['aqi']['level']  = isset($w['aqi']['city']['qlty'])?$w['aqi']['city']['qlty']:"";
						$data_online['aqi']['val']  = isset($w['aqi']['city']['aqi'])?deal_data_decimal('aqi',$w['aqi']['city']['aqi']):"";
					}

				}
				if(isset($w['basic'])&&$w['basic']){
					if(isset($w['basic']['update'])&&$w['basic']['update']){
						$data_online['update_time'] = isset($w['basic']['update']['loc'])?$w['basic']['update']['loc']:"";
					}

				}
				if($parameter){
					foreach($parameter as $param){
						if(isset($param['id'])){
							unset($param['id']);
						}
						if(isset($param['type'])){
							unset($param['type']);
						}
						$p = isset($param['param'])?round($param['param'],2):"";
						if($p){
							if(isset($data_online[$p])){
								$data_online[$p] = array_merge($data_online[$p],$param);
							}
						}
					}
				}
			}
		}

		$start_time = time() - 24*3600;
		$weather_data = array();
		$weather = M('weather_data');
		$weather_data = $weather->fetOne($data_order." > ".$start_time,"*","equip_time desc");
		unset($weather_data['voltage']);
		unset($weather_data['raw_data']);
		unset($weather_data['ip_port']);
		unset($weather_data['php_time']);

		if($weather_data){
			$data['from'] = '气象站数据';
			if(isset($weather_data['equip_time'])&&$weather_data['equip_time']){
				$weather_data['update_time'] = date("Y-m-d H:i",$weather_data['equip_time']);
				$weather_data['equip_time'] = date("Y-m-d H:i",$weather_data['equip_time']);
			}

			if(isset($weather_data['server_time'])&&$weather_data['server_time']){
				$weather_data['server_time'] = date("Y-m-d H:i",$weather_data['server_time']);
			}
			if(isset($weather_data['php_time'])&&$weather_data['php_time']){
				$weather_data['php_time'] = date("Y-m-d H:i",$weather_data['php_time']);
			}
			if($parameter){
				foreach($parameter as $param){
					$temp = array();
					$temp['param'] = $param['param'];
					$temp['name'] = $param['name'];
					$temp['unit'] = $param['unit'];
					$temp['val'] = '';
					$temp['level'] = '';
					if(isset($weather_data[$param['param']]) && $weather_data[$param['param']] != "NaN"&& $weather_data[$param['param']] != ""){
						$temp['val'] = deal_data_decimal($param['param'],$weather_data[$param['param']]);
						switch($param['param']){
							case "wind_speed":
								$temp['level'] = M('weather')->wind_level($temp['val']);
								break;
							case "wind_direction":
								$temp['level'] = M('weather')->wind_direction($temp['val']);
								break;
							case "pm25":
							case "pm10":
								$temp['level'] = M('weather')->pm25_level($temp['val']);
								break;
							case "rain":
								$s_time = time() - 7200;
								$sum_sql = "select sum(rain)  as sum_rain from weather_data where {$data_order} >= {$s_time} ORDER BY {$data_order}";
								$sum = $this->db->query($sum_sql)->row_array();
								$temp['val'] = round($sum['sum_rain'],1);
								break;
							case "uv":
								$temp['val'] = deal_data_decimal('uv',$weather_data[$param['param']],"weather");
								break;
							default:
								$temp['val'] = deal_data_decimal($param['param'],$weather_data[$param['param']]);
								break;
						}
					}else{
						if(isset($data_online[$param['param']])&&$data_online[$param['param']] != ''){
							$temp = deal_data_decimal($param['param'],$data_online[$param['param']]);
						}
					}
					$weather_data[$param['param']] = $temp;
				}
			}
			$weather_data['aqi'] = "";
			if(isset($data_online['aqi'])){
				$weather_data['aqi'] = $data_online['aqi'];
			}
			if(isset($data_online['condition'])){
				$weather_data['condition'] = $data_online['condition'];
			}
		}
		if(!$weather_data){
			$weather_data = $data_online;
		}

		$data = array_merge($data,$weather_data);

		$this->response($data);
    }
}

