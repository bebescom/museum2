<?php
/**
 * Created by PhpStorm.
 * User: HBJ_PC
 * Date: 16-9-1
 * Time: 上午10:13
 */

class Data extends MY_Controller{
	function __construct(){
		parent::__construct();
		//读取设备参数
		$sensor_param = API("get/env/equipments/equip_parameters/sensor");
		$this->param = array();
		if(isset($sensor_param['total'])&&$sensor_param['total']){
			if(isset($sensor_param['rows'])&&$sensor_param['rows']){
				foreach($sensor_param['rows'] as $sp){
					if(isset($sp['param'])&&$sp['param']){
						$this->param[$sp['param']] = array("name"=>$sp['name'],"unit"=>$sp['unit']);
					}
				}
			}
		}
		//读取系统配置--数据排序
		$this->order_time = "server_time";
		$data_order = API('get/base/config/museum_config',array('keys'=>"data_order"));
		if($data_order){
			$this->order_time = $data_order['data_order'];
		}
	}

	public function line_get($relic_no){
		$time = $this->get_post("time");
		if(isset($time)&&$time){
			switch($time){
				case '24h':
					$e_time = time();
					$s_time = $e_time - 24 * 3600;
					break;
				case 'today':
					$s_time = strtotime('today');
					$e_time = time();
					break;
				case 'yesterday':
					$s_time = strtotime('yesterday');
					$e_time = $s_time + 24*3600;
					break;
				case 'week':
					$today = date("Y-m-d");
					$week = date('w',strtotime($today));
					$s_time = strtotime($today ."-".($week ? $week - 1 : 6).' days');
					$e_time = time();
					break;
				case 'month':
					$e_time = time();
					$s_time = mktime(0,0,0,date("m"),1,date("Y"));
					break;
				default:
					$time_array = explode(',',$time);
					$s_time = strtotime($time_array[0]);
					$e_time = strtotime($time_array[1]);
					break;
			}
		}else{
			$e_time = time();
			$s_time = $e_time - 24 * 3600;
		}

		if(!$relic_no){
			$this->response(array("result"=>false,"msg"=>"文物编号为空"));
		}

		$relic = M("relic")->find("relic_no = '".$relic_no."'");
		if(!$relic){
			$this->response(array("result"=>false,"msg"=>"文物不存在"));
		}

		$time_len = 600;
		$data = array();
		if(isset($relic['parent_env_no'])&&$relic['parent_env_no']){
			$data_sensor = API("get/env/common/data/data_by_time",array("env_no"=>$relic['parent_env_no'],"s_time"=>$s_time,"e_time"=>$e_time));

			$pdata = array();
			if(isset($data_sensor['rows'])&&$data_sensor['rows']){
				$data_sensor['rows'] = array_reverse($data_sensor['rows']);
				if(isset($data_sensor['rows'][0])&&isset($data_sensor['rows'][0][$this->order_time])){
					$start_time = $data_sensor['rows'][0][$this->order_time];
				}

				foreach($data_sensor['rows'] as $ds){
					if($this->param){
						foreach($this->param as $p=>$v){
							if(isset($ds[$p])&&$ds[$p]){
								if(isset($pdata[$p])){
									$pdata[$p][$ds[$this->order_time]] = $ds[$p];
								}else{
									$pdata[$p] = array($ds[$this->order_time]=>$ds[$p]);
								}
							}
						}
					}
				}

				if($pdata){
					foreach($pdata as $pk=>$pv){
						if($pk != "temperature" && $pk != "humidity"){
							$time_len = 900;
						}
						$deal_data = array();
						if($pv){
							foreach($pv as $pv_t=>$pv_v){
								if(isset($start_time)){
									$t = floor(($pv_t - $start_time)/$time_len)*$time_len + $start_time;
									if(isset($deal_data[$t])){
										$deal_data[$t][] = $pv_v;
									}else{
										$deal_data[$t] = array($pv_v);
									}
								}
							}
							if($deal_data){
								$data[$pk] = array();
								foreach($deal_data as $dt=>$dd){
									$data[$pk][] = array($dt*1000,round(array_sum($dd)/sizeof($dd),2));
								}
							}
						}
					}
				}
			}

			$this->response($data);
		}
	}
} 