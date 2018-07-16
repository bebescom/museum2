<?php
class Weather_detail extends MY_Controller
{

	/**
	 *气象信息
	 ***/
    function detail_get($time=null)
	{
	    if($time){
		    switch($time){
			    case '24h':
				    $end_time = time();
				    $start_time = $end_time - 24 * 3600;
				    break;
			    case 'today':
				    $start_time = strtotime('today');
				    $end_time = time();
				    break;
			    case 'yesterday':
				    $start_time = strtotime('yesterday');
				    $end_time = $start_time + 24*3600;
				    break;
			    case 'week':
				    $today = date("Y-m-d");
				    $week = date('w',strtotime($today));
				    $start_time = strtotime($today ."-".($week ? $week - 1 : 6).' days');
				    $end_time = time();
				    break;
			    case 'month':
				    $end_time = time();
				    $start_time = mktime(0,0,0,date("m"),1,date("Y"));
				    break;
			    default:
				    $time_array = explode(',',$time);
				    $start_time = strtotime($time_array[0]);
				    $end_time = strtotime($time_array[1]);
				    break;
		    }
	    }else{
		    $end_time = time();
		    $start_time = $end_time - 24 * 3600;
	    }

	    $config = API("get/base/config/museum_config",array("keys"=>"weather_station,weather_key,city,data_order"));
	    $data = array();
	    $e = M('equipments/equip');
	    $parameters = $e->get_parameters('weather');
        /**************************************风向风速处理（风向玫瑰图）****************************************************/
        $w_data = array( '北风'=>array(),'东北偏北风'=>array(),'东北风'=>array(),'东北偏东风'=>array(),
            '东风'=>array(), '东南偏东风'=>array(), '东南风'=>array(), '东南偏南风'=>array(),
            '南风'=>array(), '西南偏南风'=>array(), '西南风'=>array(), '西南偏西风'=>array(),
            '西风'=>array(), '西北偏西风'=>array(), '西北风'=>array(), '西北偏北风'=>array(),
            'Total'=>array()
        );
        $wind_count = 0;

		$weather_data =  M('weather_data')->fetAll("equip_time > ".$start_time." and equip_time <= ".$end_time,"*","equip_time desc");
		$temp_data = array();
		if($weather_data){
			foreach($weather_data as $wd){
				if(isset($wd['equip_time'])){
					$t = $wd['equip_time'];
				}
				if($parameters){
					foreach ($parameters as $parameter) {
						$param = isset($parameter['param'])?$parameter['param']:"";
						$name = isset($parameter['name'])?$parameter['name']:"";
						$unit = isset($parameter['unit'])?$parameter['unit']:"";
						if($param){
							if(isset($wd[$param])&&$wd[$param] != ""&&$wd[$param] != "NaN"){
								if($param == "wind_direction"){
									$direction = M('weather')->wind_direction($wd[$param]);
									if(isset($wd["wind_speed"])){
										$w_data[$direction][] = deal_data_decimal("wind_speed",$wd["wind_speed"]);
									}
									$wind_count++;
								}else{
									if(isset($temp_data[$param])){
										$temp_data[$param][] = array($t*1000,deal_data_decimal($param,$wd[$param]));
									}else{
										$temp_data[$param] = array();
										$temp_data[$param][] = array($t*1000,deal_data_decimal($param,$wd[$param]));
									}
								}
							}
						}
					}
				}
			}

			$w_per_data = array();//百分比
			if($w_data){
				foreach($w_data as $wd=>$ws){
					$temp = array(
						"零级"=>array(),
						"一级"=>array(),
						"二级"=>array(),
						"三级"=>array(),
						"四级"=>array(),
						"五级"=>array(),
						"六级以上"=>array()
					);
					foreach($ws as $wsv){
						if($wsv < 0.3){
							$temp['零级'][] = $wsv;
						}else if($wsv >= 0.3 && $wsv < 1.6){
							$temp['一级'][] = $wsv;
						}else if($wsv >= 1.6 && $wsv < 3.4){
							$temp['二级'][] = $wsv;
						}else if($wsv >= 3.4 && $wsv < 5.5){
							$temp['三级'][] = $wsv;
						}else if($wsv >= 5.5 && $wsv < 8.0){
							$temp['四级'][] = $wsv;
						}else if($wsv >= 8.0 && $wsv < 10.8){
							$temp['五级'][] = $wsv;
						}else if($wsv >= 10.8){
							$temp['六级以上'][] = $wsv;
						}
					}
					$w_per_data[$wd] = array();
					if($wind_count){
						foreach($temp as $tem){
							$w_per_data[$wd][] = round(sizeof($tem)/$wind_count * 100,2);
						}
					}
					foreach($w_per_data as $wpdk=> $wpd){
						if($wpdk != "Total"){
							$w_per_data['Total'][] = array_sum($wpd);
						}
					}
				}
			}
			$temp_data['wind'] = $w_per_data;

			$data['from'] = "local";
			$data['data'] = $temp_data;
		}else{//网络气象数据
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
			if(isset($weather_online)&&$weather_online){

				if(isset($weather_online["HeWeather5"])&&$weather_online["HeWeather5"]){
					$w = $weather_online["HeWeather5"][0];
					if(isset($w['daily_forecast'])&&$w['daily_forecast']){//天气预报
						foreach($w['daily_forecast'] as $wdf){
							if(isset($wdf['date'])&&$wdf['date']){
								$temp_data[$wdf['date']] = array();
								$temp_data[$wdf['date']]['date'] = $wdf['date'];
								$temp_data[$wdf['date']]['humidity'] = $wdf['hum'];
								$temp_data[$wdf['date']]['temperature'] = $wdf['tmp']['min']."-".$wdf['tmp']['max'];
								$temp_data[$wdf['date']]['condition'] = ($wdf['cond']['txt_d']==$wdf['cond']['txt_n'])?$wdf['cond']['txt_n']:$wdf['cond']['txt_d']."转".$wdf['cond']['txt_n'];
								$temp_data[$wdf['date']]['wind_speed'] = $wdf['wind']['spd'];
								$temp_data[$wdf['date']]['wind_level'] = $wdf['wind']['sc'];
								$temp_data[$wdf['date']]['wind_direction'] = $wdf['wind']['dir'];
							}
						}
					}

				}
				$data['from'] = "online";
				$data['data']=$temp_data;
			}
		}
		$this->response($data);
    }
}

