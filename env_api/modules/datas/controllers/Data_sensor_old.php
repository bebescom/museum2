<?php
class Data_sensor extends MY_Controller {

    public function __construct(){
        parent::__construct();

        $this->type = array(
            "001"=>"温湿度监测终端",
            "002"=>"调湿机",
            "003"=>"中继",
            "004"=>"网关",
            "005"=>"RFID",
            "006"=>"离线设备",
            "007"=>"智能囊匣",
            "008"=>"智能展柜",
            "009"=>"带屏温湿度监测终端",
            "010"=>"二氧化碳监测终端",
            "011"=>"光照紫外监测终端",
            "012"=>"有机挥发物监测终端",
            "013"=>"空气质量监测终端",
            "014"=>"气象站",
            "015"=>"土壤温湿度监测终端",
            "016"=>"充氮调湿机",
            "017"=>"震动监测终端",
            "018"=>"安防监测终端",
            "998"=>"调湿剂",
            "999"=>"其他设备"
        );
        $parameters = M("equipments/equip")->get_parameters('sensor');
        $this->sensor_parameters = array();
        foreach($parameters as $parameter){
            $this->sensor_parameters[] = $parameter['param'];
        }

		$this->museum_no = API('get/base/config/museum_no');
    }

	function index_post_nologin(){
        $json = $this->post();

        if($json){
            $equip = array();
			if(!$json['sensor_no']){
				$this->response(array("result"=>false,"msg"=>"设备编号不能为空"));
			}
            $e_type = substr($json['sensor_no'],0,3);

            $museum_no = $this->museum_no;
            $ds = M('data_sensor');
            if(!isset($museum_no['val']) || $museum_no['val'] == ''){
               $this->response(array("result"=>false,"msg"=>"博物馆编号不存在，请完善博物馆配置信息"));
            }
            $equip_no = $museum_no['val'].$json['sensor_no'];
	        $config = API("get/base/config/museum_config",array("keys"=>"one_minute_skip,exception_time"));
	        if($config){
		        if(isset($config['one_minute_skip'])&&$config['one_minute_skip']){
			        $last_data = $ds->find("equip_no = '".$equip_no."' and equip_time <= ".time(),"*","equip_time desc");
			        if($last_data){
				        if(isset($last_data['equip_time'])&&$last_data['equip_time']){
					        if(isset($json['equip_time'])&&$json['equip_time']){
						        if(abs($json['equip_time'] - $last_data['equip_time'])< 60){
							        $this->response(array("result"=>false,"msg"=>"一分钟以内数据,写入失败"));
						        }
					        }
				        }
			        }
		        }
	        }

            if($equip_no){
                if($e_type === "014"){
                    $w = M('weather');
                    $weather = $w->find("weather_no = '".$equip_no."'");
                    if(!$weather){
                        $weather['weather_no'] = $equip_no;
                        $weather['name'] = '气象站';

                        $w->add($weather);
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
			                $this->response(array('result'=>false,'msg'=>'温湿度均小于-100，测试数据'));
		                }
	                }
	                if(!$weather_data['equip_time'] || abs($weather_data['equip_time'] - $weather_data['server_time'])> 48 * 360){
                        $weather_data['equip_time'] = $weather_data['server_time'];
                    }
                    $data = M('weather_data')->add($weather_data);
                    $result = $data?array('result'=>true,'msg'=>'写入成功'):array('result'=>false,'msg'=>'写入失败');
                    $this->response($result);

                }else{
                    $e = M('equip');
                    $equip = $e->find("equip_no = '".$equip_no."'");

                    if($this->type[$e_type]){
                        $equip_type = $this->type[$e_type];
                    }

                    $data_sensor = array();
	                $data_sensor['status'] = "正常";
	                if($e_type === "007"){
		                $env_no = M("data")->add_box($equip_no);
		                $envs = API('get/base/envs/boxes',array("env_no"=>$env_no));
	                }
	                $alert_param = array();
                    if($equip){
                        if(isset($equip['env_no'])&&$equip['env_no']){
                            $alert_param = $this->env_alert($equip['env_no'], $museum_no['val'],$json );
                            $data_sensor['env_no'] = $equip['env_no'];
                        }

                        $update = array();
                        if(isset($json['param'])){
                            if($json['param']){
                                $params = array();
                                foreach($json['param'] as $jp=>$jv){
                                    if(in_array($jp,$this->sensor_parameters)){
                                        $params[] = $jp;
                                    }else if($jp == "voltage") {
										if ($jv < 3) {
											$data_sensor['status'] = "超低电";
										}else if ($jv < 3.2) {
											$data_sensor['status'] = "低电";
										}else {
											$data_sensor['status'] = "正常";
										}
									}
                                }

                                if($params && $equip_type != "中继"&& $equip_type != "网关"){
                                    $param = implode(',',$params);
                                   	$update['parameter'] = $param;
                               }
                            }
                        }
	                   
                        if($update){
                            $e->update($update,"equip_no ='".$equip_no."'");
							$equip = $e->find("equip_no ='".$equip_no."'");
                        }
                    }else{
	                    $equip['sleep'] = '600';
	                    if($e_type === "013"){
		                    $equip['sleep'] = "900";
		                    $equip['monitor_type'] = "仅监测";
	                    }else if(in_array($e_type,array("001","008","009","010","011","012","017","018"))){
		                    $equip['monitor_type'] = "仅监测";
	                    }else if($e_type === "007"){
		                    $equip['monitor_type'] = "仅监测";
//	                        $env_no = $this->add_box($equip_no);
	                    }else if($e_type === "002"||$e_type === "016"){
		                    $equip['monitor_type'] = "主动调控";
	                    }else if($e_type === "998"){
		                    $equip['monitor_type'] = "被动调控";
	                    }
	                    $equip['name'] = $json['sensor_no'];
	                    $equip['equip_no'] = $equip_no;
	                    $equip['equip_type'] = $equip_type;
	                    $equip['status'] =  '备用';
	                    $equip['usage'] =  '备用';
	                    if(isset($env_no)&&$env_no){
		                    $equip['env_no'] =  $env_no;
		                    $data_sensor['env_no'] =  $env_no;
	                    }

	                    if(isset($json['param'])){
		                    $equip['parameter'] = implode(',',array_intersect(array_keys($json['param']),$this->sensor_parameters));
	                    }

	                    $id = $e->add($equip);
	                    $equip = $e->find($id);
                    }

					//智能囊匣及安防监测终端预警
					if($e_type == "018"){
						//玻璃破碎预警
						if(isset($json['param']["broken"]) && $json['param']["broken"] == 1){
							if(isset($equip['env_no'])&&$equip['env_no']){
								$this->security_alert($equip['env_no'], $museum_no['val'],"broken",$json);
							}
							$alert_param[] = "broken";
						}
						//震动预警
						if(isset($json['param']["vibration"]) && $json['param']["vibration"] == 1){
							if(isset($equip['env_no'])&&$equip['env_no']){
								$this->security_alert($equip['env_no'], $museum_no['val'],"vibration",$json);
							}
							$alert_param[] = "vibration";
						}
						//多维驻波预警
						if(isset($json['param']["multi_wave"]) && $json['param']["multi_wave"] == 1){
							if(isset($equip['env_no'])&&$equip['env_no']){
								$this->security_alert($equip['env_no'], $museum_no['val'],"multi_wave",$json);
							}
							$alert_param[] = "multi_wave";
						}
					}else if($e_type == "007"){
						//异常震动
						if(isset($json['param']["move_alert"]) && $json['param']["move_alert"] == 1&&isset($json['param']['box_status'])&&$json['param']['box_status'] == 1){
							if(isset($equip['env_no'])&&$equip['env_no']){
								$this->box_alerts($equip['env_no'], $museum_no['val'],"move_alert",$json);
							}
							$alert_param[] = "move_alert";
						}
						//非法开盖
						if(isset($json['param']["box_open_alert"]) && $json['param']["box_open_alert"] == 1){
							if(isset($equip['env_no'])&&$equip['env_no']){
								$this->box_alerts($equip['env_no'], $museum_no['val'],"box_open_alert",$json);
							}
							$alert_param[] = "box_open_alert";
						}
					}

	                if($alert_param){
		                $data_sensor['alert_param'] = implode(',',$alert_param);
		                $alert_params = array();
		                if(isset($envs['rows'])&&$envs['rows']){
			                $env = $envs['rows'][0];
			                if(isset($env['alert_param'])){
				                $alert_params = explode(",",$env['alert_param']);
			                }
			                $alert_params = array_merge($alert_params,$alert_param);
		                }
		                $alert_params = array_values(array_unique($alert_params));
		                if($alert_params){
			                $ret = API("post/base/envs/boxes/box_edit",array("env_no"=>$env_no,"alert_param"=>implode(",",$alert_params)));
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
								if($p == "humidity"){
									if($v < 0 || $v > 200){
										$v = 0;
									}else if($v > 100 && $v <= 200){
										$v = 100;
									}
								}
								$data_sensor[$p] = $v;
							}
                        }
                    }
                    $data_sensor['php_time'] = time();

                    if($data_sensor){
                        try{
	                        $max_time = 12 * 30 * 24 * 3600;
							if(isset($config['exception_time'])&&$config['exception_time']){
								$max_time = $config['exception_time'] * 30 * 24 * 3600;
							}
	                        if(isset($data_sensor['equip_time'])&&isset($data_sensor['server_time'])){
		                        if(abs($data_sensor['equip_time'] - $data_sensor['server_time']) > $max_time){
			                        $data_sensor['remark'] = "设备时间与服务器时间差异太大";
			                        $data = M("data_sensor_exception")->add($data_sensor);
			                        $result = $data?array('result'=>true,'msg'=>'异常数据写入成功'):array('result'=>false,'msg'=>'异常数据写入失败');
		                        }else{
		                            if($data_sensor['equip_time'] - $data_sensor['server_time'] > 24 * 3600){
		                                $data_sensor['equip_time'] = $data_sensor['server_time'];
                                    }
			                        $data = $ds->add($data_sensor);
			                        $result = $data?array('result'=>true,'msg'=>'写入成功'):array('result'=>false,'msg'=>'写入失败');
		                        }
	                        }
                            $this->response($result);
                        }catch (Exception $e){
                            $this->response(array('error'=>$e));
                        }
                    }
                }
            }
        }
	}

    function env_alert($env_no,$museum_no,$json){
        $thre = M('threshold');
        if(isset($json['param'])){
            $param = $json['param'];
        }
	    //文物信息
	    $relic_no = M("data")->findRelic($env_no);
        $env_threshold = $thre->find(array('no'=>$env_no));
	    $thresholds = array();
	    if($relic_no){
		    $relic_thresholds = $thre->fetAll("no in (".implode(",",$relic_no).")");
		    if($relic_thresholds){
			    foreach($relic_thresholds as $rt){
					if(isset($rt['no'])&&$rt['no']){
						$thresholds[$rt['no']] = $rt;
					}
			    }
		    }
		    foreach($relic_no as $no){
			    if(!isset($thresholds[$no])){
				    $thresholds[$no] = $env_threshold;
			    }
		    }
	    }else{
		    $thresholds[] = $env_threshold;
	    }

	    $e_type = substr($json['sensor_no'],0,3);
	    $alert_param = array();
        if($thresholds){
	        //环境信息
	        if($e_type == "007"){
		        $envs = API('get/base/envs/boxes',array("env_no"=>$env_no));
		        if(isset($envs['total'])&&$envs['total']){
			        $env = $envs['rows'][0];
		        }
	        }else{
		        $env = API('get/base/envs/info/'.$env_no);
	        }

	        foreach($thresholds as $t_no=>$threshold){
	            if($threshold){
		            $alt = M('alert');
		            if(isset($param) && $param){
						foreach($param as $p=>$v){
				            if(in_array($p,$this->sensor_parameters)&&!is_array($v)){
					            $alert = array();
					            $min = (isset($threshold[$p.'_min'])&&$threshold[$p.'_min'])?$threshold[$p.'_min']:"";
					            $max = (isset($threshold[$p.'_max'])&&$threshold[$p.'_max'])?$threshold[$p.'_max']:"";
					            $diff = 0;
					            if($min || $max){
						            if($v>$max || $v < $min){
							            $alert['env_no'] = $env_no;
							            $alert['relic_no'] = $relic_no?$t_no:"";
							            $alert['equip_no'] = $museum_no.$json['sensor_no'];
							            $alert['alert_type'] = $threshold['type'];
							            $alert['level'] = 'common';
							            $alert['content'] = "";
							            $alert['alert_time'] = $json['equip_time'];
							            $alert['alert_count'] = 1;
							            $alert['alert_val'] = $v;
							            $alert['alert_param'] = $p;

							            if($v>$max){
								            $diff = $v - $max;
								            $alert['content'] = "偏高".$diff;
							            }else if($v < $min){
								            $diff = $v - $min;
								            $alert['content'] = "偏低".abs($diff);
							            }

							            $query = array('equip_no'=>$alert['equip_no'],'alert_type'=>$alert['alert_type'],'alert_param'=>$alert['alert_param'],'level'=>$alert['level'],'env_no'=>$alert['env_no'],'clear_time'=>null);
							            if($relic_no){
								            $query['relic_no'] = $t_no;
							            }
							            $pre_alert = $alt->find($query,"id,alert_val,clear_time,alert_count","alert_time desc");
							            if($pre_alert){
								            if(($pre_alert['alert_val']>$max && $alert['alert_val']<$min) || ($pre_alert['alert_val']<$min && $alert['alert_val']>$max)){
									            $pre_alert['clear_time'] = $json['server_time'];
									            $alt->update(array('clear_time' => $json['server_time']),array('id'=>$pre_alert['id']));
									            $alt->add($alert);
								            }else{
									            $up_data = array();
									            if(($pre_alert['alert_val'] < $alert['alert_val'] && $pre_alert['alert_val'] > $max)
										            || ($pre_alert['alert_val'] > $alert['alert_val'] && $pre_alert['alert_val'] < $min)){
										            $up_data['alert_val'] = $alert['alert_val'];
									            }
									            $up_data['alert_count'] = $pre_alert['alert_count']+1;
									            $alt->update($up_data,"id = ".$pre_alert['id']);
								            }
							            }else{
								            $alt->add($alert);
							            }
							            if(!in_array($p,$alert_param)){
											$alert_param[] = $p;
										}
							            $alert_status = 1;
							            if($e_type == "007"){
								            if($v>$max){
									            $diff = round($v - $max,2);
								            }else if($v < $min){
									            $diff = round($v - $min,2);
								            }
								            if($p == "temperature" || $p == "humidity"){
									            $box_alert = $p;
									            $msg = $diff;
								            }

								            $up = array("env_no"=>$env_no);
								            if(isset($env['alert_status'])){
									            if($alert_status>$env['alert_status']){
										            $up["alert_status"] = $alert_status;
									            }
								            }
								            if($up){
									            $ret = API("post/base/envs/boxes/box_edit",$up);
								            }
								            $this->sendMsg($env_no,$box_alert,$msg,$param['temperature'],$param['humidity']);
							            }
										$this->_sendToAndriod($env_no,$p,$alert['content'],$json['param']);
						            }else{
							            $query = array('equip_no'=>$museum_no.$json['sensor_no'],'alert_param'=>$p,'env_no'=>$env_no,'clear_time'=>null);
							            $result = $alt->update(array('clear_time' =>$json['server_time']),$query);
									}
					            }
				            }
			            }
		            }
	            }
            }
        }
	    return $alert_param;
    }

	function box_alerts($env_no,$museum_no,$box_alert,$json){
		$alert = array();
		$alert['env_no'] = $env_no;
		$relic_no = M("data")->findRelic($env_no);
		$alert['relic_no'] = $relic_no?implode(',',$relic_no):"";
		$alert['equip_no'] = $museum_no.$json['sensor_no'];
		$alert['alert_type'] = "area";
		$alert['level'] = 'common';
		$alert['content'] = "";
		$alert['alert_time'] = $json['server_time'];
		$alert['alert_count'] = 1;
		$alert['alert_val'] = 1;
		$alert['alert_param'] = $box_alert;

		$alert_status = 0;
		$msg = "";
		if($box_alert == "box_open_alert"){
			$alert_status = 3;
			$msg = "非法开盖";
			$alert['content'] = "非法开盖";
		}else if($box_alert == "move_alert"){
			$alert_status = 2;
			$msg = "异常震动";
			$alert['content'] = "异常震动";
		}

		$alt = M("alert");
		$box = API('get/base/envs/boxes',array("env_no"=>$env_no));
		if(isset($box['total'])&&$box['total']){
			if(isset($box['rows'])&&$box['rows']){
				$b = $box['rows'][0];
				$up = array("env_no"=>$env_no);

				if(isset($b['alert_status'])||$b['alert_status'] == null){
					if($alert_status>=$b['alert_status']){
						$up['alert_status'] = $alert_status;
					}
				}
				$ret = API("post/base/envs/boxes/box_edit",$up);
			}
		}

		$query = array('equip_no'=>$alert['equip_no'],'alert_type'=>$alert['alert_type'],'alert_param'=>$alert['alert_param'],'level'=>$alert['level'],'env_no'=>$alert['env_no'],'clear_time'=>null);
		$pre_alert = $alt->find($query,"*","alert_time desc");
		if($pre_alert){
			$up_data = array();
			$up_data['alert_count'] = $pre_alert['alert_count'] + 1;
			$alt->update($up_data,"id = ".$pre_alert['id']);
			$this->sendMsg($env_no,$box_alert,$msg,$json['param']['temperature'],$json['param']['humidity']);
			$this->_sendToAndriod($env_no,$box_alert,$msg,$json['param']);
		}else{
			$alt->add($alert);
			$this->sendMsg($env_no,$box_alert,$msg,$json['param']['temperature'],$json['param']['humidity']);
			$this->_sendToAndriod($env_no,$box_alert,$msg,$json['param']);
		}

	}

	function sendMsg($env_no,$alert,$msg="",$temp=null,$hum=null){
		$config = API("get/base/config/museum_config",array("keys"=>"monitor_port"));
		$socket_url = "http://127.0.0.1:8020";
		if(isset($config['monitor_port'])&&$config['monitor_port']){
			$socket_url = $config['monitor_port'];
		}
		$emit = "box_alert";
		if(in_array($alert,array("broken","vibration","multi_wave"))){
			$emit = "security_alert";
		}
		$param = "/".$emit."?alert=".$alert;
		if($env_no){
			$param .= "&env_no=".$env_no;
		}
		if($msg){
			$param .= "&msg=".$msg;
		}
		if($temp){
			$param .= "&temperature=".$temp;
		}
		if($hum){
			$param .= "&humidity=".$hum;
		}
		// 初始化一个 cURL 对象
		$curl = curl_init();
		// 设置你需要抓取的URL
		curl_setopt($curl, CURLOPT_TIMEOUT, 60);
		curl_setopt($curl, CURLOPT_URL, $socket_url.$param);
		// 设置header 响应头是否输出
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($curl, CURLOPT_HEADER, 0);
		// 运行cURL，请求网页
		$data = curl_exec($curl);
		// 关闭URL请求
		curl_close($curl);
	}

	function security_alert($env_no,$museum_no,$alert_type,$json){
		$alert = array();
		$alert['env_no'] = $env_no;
		$relic_no = M("data")->findRelic($env_no);
		$alert['relic_no'] = $relic_no?implode(',',$relic_no):"";
		$alert['equip_no'] = $museum_no.$json['sensor_no'];
		$alert['alert_type'] = "area";
		$alert['level'] = 'common';
		$alert['content'] = "";
		$alert['alert_time'] = $json['server_time'];
		$alert['alert_count'] = 1;
		$alert['alert_val'] = 1;
		$alert['alert_param'] = $alert_type;

		$msg = "";
		if($alert_type == "broken"){
			$msg = "broken";
			$alert['content'] = "玻璃破碎";
		}else if($alert_type == "vibration"){
			$msg = "vibration";
			$alert['content'] = "异常震动";
		}else if($alert_type == "multi_wave"){
			$msg = "multi_wave";
			$alert['content'] = "多维驻波预警";
		}

		$alt = M("alert");
		$query = array('equip_no'=>$alert['equip_no'],'alert_type'=>$alert['alert_type'],'alert_param'=>$alert['alert_param'],'level'=>$alert['level'],'env_no'=>$alert['env_no'],'clear_time'=>null);
		$pre_alert = $alt->find($query,"*","alert_time desc");
		if($pre_alert){
			$up_data = array();
			$up_data['alert_count'] = $pre_alert['alert_count'] + 1;
			$alt->update($up_data,"id = ".$pre_alert['id']);
			$this->sendMsg($env_no,$alert_type,$msg);
		}else{
			$alt->add($alert);
			$this->sendMsg($env_no,$alert_type,$msg);
		}
	}

	public function _sendToAndriod($env_no,$alert,$msg="",$param = array()){
		//error_reporting(E_ALL);

		//目标IP
		$address = get_ini_var('MUSEUM_WEB_HOST', '127.0.0.1');
		//端口
		$service_port = 8848;

		//发送命令
		$param = array(
			"env_no"=>$env_no,
			"alert"=>$alert,
			"msg"=>$msg,
			"param"=>$param
		);
		$json_param = json_encode($param)."\n";

		try{
			//创建 TCP/IP socket
			if(function_exists('socket_create')){
				ob_start();
				$socket = socket_create(AF_INET, SOCK_STREAM, SOL_TCP);
				socket_connect($socket, $address, $service_port);
				socket_write($socket, $json_param, strlen($json_param));
				ob_end_flush();
				socket_close($socket);
			}
		}catch(Exception $e){
			$this->response($e);
		}
	}
}
