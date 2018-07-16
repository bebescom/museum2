<?php
/**
 * Created by PhpStorm.
 * User: HBJ_PC
 * Date: 16-9-1
 * Time: 下午6:14
 */

class Monitor extends MY_Controller{

	public function __construct(){
		parent::__construct();
		$this->order_time = "equip_time";

		$sensor_param = M("equipments/equip")->get_parameters('sensor');
		$this->param = array();
		if($sensor_param){
			foreach($sensor_param as $sp){
				if(isset($sp['param'])&&$sp['param']){
					$this->param[$sp['param']] = array("name"=>$sp['name'],"unit"=>$sp['unit']);
				}
			}
		}
	}

	public function index_get(){
		$this->response(array("this is monitor"));
	}

	/**
	 *环境监测--详情--设备（对比）
	 */
	public function equip_get()
	{
		$env_no = $this->get_post("env_no");
		$status = $this->get_post("status");
		$no_name = $this->get_post("no_name");
		$equip_type = $this->get_post("equip_type");
		$limit = $this->get_post("limit");
		$page = $this->get_post("page");
		$index = $this->get_post("index");

		$data = array(
			"index"=>$index,
			"total"=>0,
			"rows"=>array()
		);
		$navs = array();
		$where = "1=1";
		if(isset($this->_user['data_scope'])&&$this->_user['data_scope']){
			if(isset($env_no)&&$env_no){
				$env_nos = M("common/common")->get_children(explode(",",$env_no));
				if($this->_user['data_scope'] != 'administrator'){
					$env_nos = array_intersect($env_nos,$this->_user['data_scope']);
				}
				$where .= " and env_no in ('".implode("','",$env_nos)."')";

				if(isset($status)&&$status){
					$where .= " and status in ('".implode("','",explode(",",$status))."')";
				}

				if(isset($equip_type)&&$equip_type){
					$where .= " and equip_type in ('".implode("','",explode(",",$equip_type))."')";
				}

				if(isset($no_name)&&$no_name != ""&&$no_name != null){
					$where .= " and (equip_no like '%".$no_name."%' or name like '%".$no_name."%')";
				}

				$where .= " and status != '停用'";

				if(!$limit){
					$limit = 10;
				}
				if(!$page){
					$page = 1;
				}
				$offset = ($page-1)*$limit;
				$equips = M("equip")->fetAll($where,"equip_no,env_no,name,status,equip_type,parameter,locate","",$offset,$limit);
				$total = M("equip")->count($where);
				if($equips){
					foreach ($equips as $k=>$equip) {
						if(isset($equip['equip_no'])&&$equip['equip_no']){
							$new_data = M("data_sensor")->fetOne("equip_no = '".$equip['equip_no']."'","*",$this->order_time." desc");
							$temp_data = array();
							if($new_data){
								if(isset($equip['parameter'])&&$equip['parameter']){
									$params = explode(",",$equip['parameter']);
									if($params){
										$temp_data = array();
										foreach($params as $param){
											$temp_data[$param] = "";
											if(isset($new_data[$param])&&$new_data[$param] != ""&&$new_data[$param] != null){
												$temp_data[$param] = $new_data[$param];
											}
										}
									}
								}

								if(isset($new_data[$this->order_time])&&$new_data[$this->order_time]){
									$equips[$k]['time'] = date("Y-m-d H:i",$new_data[$this->order_time]);
								}
							}
							$equips[$k]['new_data'] = $temp_data;
							$equips[$k]['nav'] = false;
							$equips[$k]['map'] = false;
							if(isset($equip['env_no'])&&$equip['env_no']){
								if(isset($navs[$equip['env_no']])){
									$equips[$k]['nav'] = $navs[$equip['env_no']];
								}else{
									$nav = API('get/base/envs/navigation/'.$equip['env_no'].'');
									$equips[$k]['nav'] = isset($nav['rows'])?$nav['rows']:"";
									$navs[$equip['env_no']] = $nav['rows'];
								}
								if($navs[$equip['env_no']]){
									foreach($navs[$equip['env_no']] as $n_r){
										if(isset($n_r['type'])&&in_array($n_r['type'],array("展厅","库房","修复室","研究室","楼层"))&&$equip['env_no'] == $n_r['env_no']){
											if(isset($n_r['map'])&&$n_r['map']){
												$equips[$k]['map'] = $n_r['map'];
												continue;
											}
										}else{
											if(isset($n_r['type'])&&in_array($n_r['type'],array("展厅","库房","修复室","研究室"))){
												if(isset($n_r['map'])&&$n_r['map']){
													$equips[$k]['map'] = $n_r['map'];
													continue;
												}
											}
										}
									}
								}
							}

							if(isset($equip['locate'])&&$equip['locate']){
								$locate = json_decode($equip['locate'],true);
								if(isset($locate['area'])&&$locate['area']){
									$area = explode(",",$locate['area'][0]);
									$locate['x'] = isset($area[0])?$area[0]:0;
									$locate['y'] = isset($area[1])?$area[1]:0;
								}
								if(isset($locate['area'])){
									unset($locate['area']);
								}
								$equips[$k]['locate'] = $locate;
							}
						}
					}
				}

				$data = array(
					"index"=>$index,
					"total"=>$total,
					"rows"=>$equips
				);
			}
		}

		$this->response($data);
	}

	/**
	 *环境监测--详情--原始数据（对比）
	 */
	public function data_table_get(){
		$env_no = $this->get_post("env_no");
		$page = $this->get_post("page");
		$limit = $this->get_post("limit");
		$time = $this->get_post("time");
		$equip_no = $this->get_post("equip_no");
		$equip_type = $this->get_post("equip_type");
		$index = $this->get_post("index");

		$time_switch = $this->_time($time);
		$s_time = $time_switch['s_time'];
		$e_time = $time_switch['e_time'];

		if(!$page){
			$page = 1;
		}
		if(!$limit){
			$limit = 10;
		}

		$data = array(
			"index"=>$index,
			"count"=>0,
			"page"=>$page,
			"total"=>0,
			"rows"=>array(),
			"param"=>array()
		);
		$offset = ($page - 1)*$limit;
		$equip_nos = array();
		$params = array();

		$where = "1=1";
		if(isset($env_no)&&$env_no){
			$env_nos = explode(",",$env_no);
			$envs = API("get/base/envs/");
			$all_env_no = array();
			foreach ($env_nos as $e_no) {
				if(strlen($e_no) <= 12){
					if(isset($envs['rows'])&&$envs['rows']){
						foreach ($envs['rows'] as $env) {
							if(strpos($env['env_no'],(string)$e_no) !== false){
								if(!in_array($env['env_no'],$all_env_no)){
									$all_env_no[] = $env['env_no'];
								}
							}
						}
					}
				}else{
					if(!in_array($e_no,$all_env_no)){
						$all_env_no[] = $e_no;
					}
				}
			}
			//重命名--重名环境
			$env_info = M('common/env')->rename_repeat_env($envs['rows'],$env_no);

			if($all_env_no){
				$where .= " and (env_no in ('".implode("','",$all_env_no)."') or equip_no in ('".implode("','",$all_env_no)."'))";
				$equips = M("equip")->fetAll("env_no in ('".implode("','",$all_env_no)."') and equip_type not in ('网关','中继')");
				if($equips){
					foreach ($equips as $equip) {
						if(isset($equip_type)&&$equip_type){
							$equip_types = explode(",",$equip_type);
							if(in_array($equip['equip_type'],$equip_types)){
								if(isset($equip['equip_no'])&&$equip['equip_no']){
									$equip_nos[] = $equip['equip_no'];
								}
							}
						}
						if(isset($equip['parameter'])&&$equip['parameter']){
							$parameters = explode(',',$equip['parameter']);
							$params = array_merge($params,$parameters);
						}
					}
				}
			}
			if($params){
				$params = array_unique($params);
			}

			if($equip_nos){
				$where .= " and equip_no in ('".implode("','",$equip_nos)."')";
			}
			if(isset($equip_no)&&$equip_no){
				$where .= " and equip_no like '%".$equip_no."%'";
			}

			$where .= " and ".$this->order_time." between ".$s_time." and ".$e_time;
			$count = M("data_sensor")->count($where);

			$data_sensor = M("data_sensor")->fetAll($where,"*",$this->order_time." desc",$offset,$limit);

			$data['count'] = $count;
			$data['total'] = sizeof($data_sensor);

			$envs = array();
			if($data_sensor){
				foreach($data_sensor as $ds){
					$temp = array();
					if(isset($ds[$this->order_time])&&$ds[$this->order_time]){
						$temp[$this->order_time] = date("Y-m-d H:i",$ds[$this->order_time]);
					}

					if(isset($ds['equip_no'])&&$ds['equip_no']){
						$temp['equip_no'] = $ds['equip_no'];
					}

					$temp['env_name'] = "-";
					if(isset($ds['env_no'])&&$ds['env_no']){
						if(isset($env_info[$ds['env_no']])){
							$temp['env_name'] = $env_info[$ds['env_no']]['name'];
						}
					}
					$new_data =array();
					if($this->param){
						foreach($this->param as $p=>$un){
							if(!in_array($p,array("vibration","broken","multi_wave","cascophen"))){
								$new_data[$p] = "-";
								if(isset($ds[$p])&&$ds[$p] != "NaN"){
									$new_data[$p] = $ds[$p];
									unset($ds[$p]);
								}
							}
						}
					}
					$temp['new_data'] = $new_data;
					$data['rows'][] = $temp;
					$data['param'] = array_values($params);
				}
			}
		}

		$this->response($data);
	}

	/**
	*环境监测--详情--数据曲线（对比）
	 */
	public function line_get()
	{
		$time = $this->get_post("time");
		$param = $this->get_post("param");
		$index = $this->get_post("index");
		$s_env_no = $this->get_post('env_no');
		$alert_time = $this->get_post('alert_time');
		$alert_param = $this->get_post('alert_param');
		$s_env_nos =array();

		$data = array(
			"index"=>$index,
			"param"=>array(),
			'yAxis'=>array(),
			'no_data'=>array()
		);

		//时间转换
		$time_switch = $this->_time($time);
		$s_time = $time_switch['s_time'];
		$e_time = $time_switch['e_time'];

		if(isset($s_env_no)&&$s_env_no) {
			$s_env_nos = explode(",", $s_env_no);

			//环境信息
			$envs = API("get/base/envs");
			$env_types = array();
			if(isset($envs['rows'])&&$envs['rows']){
				//重命名--重名环境
				$env_info = M('common/env')->rename_repeat_env($envs['rows'],$s_env_no);
			}

			//各环境的阈值
			$thresholds = M("threshold")->fetAll("no in ('" . implode("','", $s_env_nos) . "')");
			$threshold = array();
			if ($thresholds) {
				foreach ($thresholds as $thres) {
					if (isset($thres['no']) && $thres['no']) {
						$threshold[$thres['no']] = array();
						foreach($this->param as $tp=>$tv){
							if(isset($thres[$tp."_min"])||isset($thres[$tp."_max"])){
								$threshold[$thres['no']][$tp] = array(
									'min'=>isset($thres[$tp."_min"])?$thres[$tp."_min"]:"",
									'max'=>isset($thres[$tp."_max"])?$thres[$tp."_max"]:""
								);
							}
						}
					}
				}
			}

			//超时周期
			$max_transmission_time_interval = app_config('max_transmission_time_interval');
			//均峰值数据
			$min = array();//所有环境的最小值;
			$max = array();//所有环境的最大值;
			$all_data = array();
			foreach($s_env_nos as $env_no){
				//前一次数据时间
				$pre_equip_time = 0;
				$where = "1=1";
				if(strlen($env_no) <= 12||(isset($env_info[$env_no]['type']))&&in_array($env_info[$env_no]['type'],array("楼栋","楼层"))){
					$where = "env_no LIKE '{$env_no}%'";
				}else{
					$where = "(env_no  = '{$env_no}' or equip_no = '{$env_no}')";
				}

				$where .= " AND equip_time >= {$s_time} AND equip_time <= {$e_time}";
				$distinct_sql = "select distinct(equip_no) from data_sensor where {$where}";
				$ds_equip_nos = $this->db->query($distinct_sql)->result_array();
				$equip_nos = array($env_no);
				if($ds_equip_nos){
					foreach ($ds_equip_nos as $ds_equip_no) {
						if($ds_equip_no['equip_no']&&$ds_equip_no['equip_no']&&!in_array($env_no,$equip_nos)){
							$equip_nos[] = $ds_equip_no['equip_no'];
						}
					}
				}
				$equip_where = "1=1";
				if($equip_nos){
					$equip_where = " equip_no in ('".implode("','",$equip_nos)."') and equip_type not in ('中继','网关')";
				}
				$equips = M("equip")->fetAll($equip_where);
				$params = array();
				$equip_info = array();
				if($equips){
					foreach ($equips as $equip) {
						if(isset($equip['parameter'])&&$equip['parameter']){
							$parameters =  explode(',',$equip['parameter']);
							foreach ($parameters as $parameter) {
								if(!in_array($parameter,$params)){
									$params[] = $parameter;
								}
							}
						}
						$equip_info[$equip['equip_no']] = $equip;
					}
				}
				if(empty($params)){
					$params = array_keys($this->param);
				}

				//非设备和微环境---展示极值图
				if(isset($env_info[$env_no]['type'])&&!in_array($env_info[$env_no]['type'],array('展柜','存储柜','安防展柜'))){
					$select_params = array(
						'env_no', '(equip_time- equip_time % 900) timeformat'
					);
					if(isset($params)&&$params){
						foreach ($params as $param) {
							if(in_array($param,array_keys($this->param))){
								$select_params[] = "MAX({$param}+0) {$param}_max,MIN({$param}+0) {$param}_min" ;
							}
						}
					}

					$sql = "SELECT ".implode(",",$select_params).
						" FROM data_sensor WHERE {$where} GROUP BY timeformat ORDER BY timeformat" ;
					$data_sensor = $this->db->query($sql)->result_array();
					if($data_sensor){
						foreach($data_sensor as $ds){
							$fill_point = array();
							if(isset($env_no)&&$env_no){
								if(!isset($data[$env_no])){
									$data[$env_no] = array(
										"env_no"=>isset($env_info[$env_no]['env_no'])?$env_info[$env_no]['env_no']:"",
										"name"=>isset($env_info[$env_no]['name'])?$env_info[$env_no]['name']:"",
										"type"=>"small",
									);
								}
							}

							if(!$pre_equip_time){
								$pre_equip_time = $ds['timeformat'];
							}else{
								$sub_time = $ds['timeformat'] - $pre_equip_time;
								$sleep = 600;
								if($sub_time > $max_transmission_time_interval*$sleep){
									$fill_point_time = ceil(($ds['timeformat'] + $pre_equip_time)/2);
									$fill_point = array($fill_point_time*1000,"-");
								}
								$pre_equip_time = $ds['timeformat'];
							}

							if($this->param){
								foreach($this->param as $param=>$un){
									if(!isset($all_data[$param])){
										$all_data[$param] = array();
									}

									if($params&&in_array($param,$params)){
										if(isset($ds[$param."_min"])&&$ds[$param."_min"] != "NaN"&&$ds[$param."_min"] != ""){
											if(!isset($data[$env_no][$param])){
												$data[$env_no][$param] = array(
													"min"=>array(),
													"max"=>array(),
													"alert_point"=>false
												);
												if(!in_array($param,$data['param'])){
													$data['param'][] = $param;
												}
												$ds[$param."_min"] = deal_data_decimal($param,$ds[$param."_min"]);
												$data[$env_no][$param]['min'][] = array($ds["timeformat"]*1000,$ds[$param."_min"]);
											}
											//填充缺省点
											if(isset($fill_point)&&$fill_point){
												$data[$env_no][$param]['min'][] = $fill_point;
											}

											$ds[$param."_min"] = deal_data_decimal($param,$ds[$param."_min"]);
											$data[$env_no][$param]['min'][] = array($ds["timeformat"]*1000,$ds[$param."_min"]);

											$all_data[$param][] = $ds[$param."_min"];
											if(isset($alert_time)&&$alert_time&&isset($alert_param)&&$alert_param == $param){
												$t = $alert_time - $alert_time%900;
												if($ds['timeformat'] == $t){
													$data[$env_no][$param]['alert_point'] = array($ds["timeformat"]*1000,$ds[$param."_min"]);
												}
											}
										}
										if(isset($ds[$param."_max"])&&$ds[$param."_max"] != "NaN"&&$ds[$param."_max"] != ""){
											if(!isset($data[$env_no][$param])){
												$data[$env_no][$param] = array(
													"min"=>array(),
													"max"=>array(),
													"alert_point"=>false
												);
												if(!in_array($param,$data['param'])){
													$data['param'][] = $param;
												}
											}
											//填充缺省点
											if(isset($fill_point)&&$fill_point){
												$data[$env_no][$param]['max'][] = $fill_point;
											}

											$ds[$param."_max"] = deal_data_decimal($param,$ds[$param."_max"]);
											$data[$env_no][$param]['max'][] = array($ds["timeformat"]*1000,$ds[$param."_max"]);

											$all_data[$param][] = $ds[$param."_max"];
											if(isset($alert_time)&&$alert_time&&isset($alert_param)&&$alert_param == $param){
												$t = $alert_time - $alert_time%900;
												if($ds['timeformat'] == $t){
													$data[$env_no][$param]['alert_point'] = array($ds["timeformat"]*1000,$ds[$param."_max"]);
												}
											}
										}

										if(isset($data[$env_no][$param])){
											$data[$env_no][$param] = array_merge($data[$env_no][$param],$un);
											$data[$env_no][$param]['threshold'] = array();
											if(isset($threshold[$env_no][$param])&&$threshold[$env_no][$param]){
												$data[$env_no][$param]['threshold'] = $threshold[$env_no][$param];
											}
										}
									}
								}
							}
						}
					}else{
						$data['no_data'][] = isset($env_info[$env_no]['name'])?$env_info[$env_no]['name']:"";
					}
				}else{//设备及微环境---按设备展示数据--实时数据
					$sql = "select * FROM data_sensor WHERE {$where} ORDER BY equip_time ASC ";
					$data_sensor = $this->db->query($sql)->result_array();
					//对象名
					$env_name = isset($env_info[$env_no]['name'])?$env_info[$env_no]['name']:"";
					$type = "micro";
					if(in_array($env_no,array_keys($equip_info))){
						$type = "equip";
						$equip_env_no = isset($equip_info[$env_no]['env_no'])?$equip_info[$env_no]['env_no']:"";
						if($equip_info[$env_no]['equip_type'] === "智能囊匣"){
							$box = M("box")->fetOne("env_no = '{$env_no}'");
							$this->response($box);
							$env_name = isset($box['name'])?$box['name']:"";
						}else{
							$env_name = isset($env_info[$equip_env_no]['name'])?$env_info[$equip_env_no]['name']:"";
							$env_name = $env_name."-".substr($env_no,-4);
						}
					}
					if($data_sensor){
						foreach($data_sensor as $ds){
							$fill_point = array();
							if(isset($env_no)&&$env_no){
								if(!isset($data[$env_no])){
									$data[$env_no] = array(
										"env_no"=>isset($ds['env_no'])?$ds['env_no']:"",
										"name"=>$env_name,
										"type"=>$type
									);
								}

								if(!$pre_equip_time){
									$pre_equip_time = $ds['equip_time'];
								}else{
									$sub_time = $ds['equip_time'] - $pre_equip_time;
									if(isset($equip_info[$ds['equip_no']])&&$equip_info[$ds['equip_no']]){
										if(isset($equip_info[$ds['equip_no']]['sleep'])&&$equip_info[$ds['equip_no']]['sleep']){
											//超过超时周期 倍采集周期，则填充断点
											if($sub_time > $max_transmission_time_interval*$equip_info[$ds['equip_no']]['sleep']){
												$fill_point_time = ceil(($ds['equip_time'] + $pre_equip_time)/2);
												$fill_point = array($fill_point_time*1000,"-");
											}
										}
									}
									$pre_equip_time = $ds['equip_time'];
								}

								if(isset($ds['equip_no'])&&$ds['equip_no']){
									$e_type = substr($ds['equip_no'],-11,3);
									if($this->param) {
										foreach ($this->param as $param => $un) {
											if(isset($ds[$param])&&$ds[$param] != "NaN"&&$ds[$param] != ""){
												if(!isset($data[$env_no][$param])){
													$data[$env_no][$param] = array(
														"alert_point"=>false,
														"threshold"=>array()
													);
													if(!in_array($param,$data['param'])){
														$data['param'][] = $param;
													}
													if(isset($threshold[$env_no][$param])&&$threshold[$env_no][$param]){
														$data[$env_no][$param]['threshold'] = $threshold[$env_no][$param];
													}
												}
												if(!isset($data[$env_no][$param][$ds['equip_no']])){
													$data[$env_no][$param][$ds['equip_no']] = array();
												}
												//填充缺省点
												if(isset($fill_point)&&$fill_point){
													$data[$env_no][$param][$ds['equip_no']][] = $fill_point;
												}

												$ds[$param] = $e_type !="000"?deal_data_decimal($param,$ds[$param]):$ds[$param];
												$data[$env_no][$param][$ds['equip_no']][] = array($ds['equip_time']*1000,$ds[$param]);
												if(!isset($all_data[$param])){
													$all_data[$param] = array();
												}
												$all_data[$param][] = $ds[$param];
												if(isset($alert_time)&&$alert_time&&isset($alert_param)&&$alert_param == $param){
													if($ds['equip_time'] == $alert_time){
														$data[$env_no][$param]['alert_point'] = array($ds["equip_time"]*1000,$ds[$param]);
													}
												}
											}
										}
									}
								}

							}
						}
					}else{
						$data['no_data'][] = $env_name;
					}
				}
				if($all_data){
					foreach ($all_data as $p=>$v) {
						if($v&&is_array($v)){
							$min[$p] = min($v);
							$max[$p] = max($v);
						}
					}
				}

				if(isset($data['param'])&&$data['param']){
					foreach($data['param'] as $param){
						if(!isset($data['yAxis'][$param])){
							$data['yAxis'][$param] = array();
						}
						if(isset($min[$param])){
							$data['yAxis'][$param]['min'] = $min[$param];
						}
						if(isset($max[$param])){
							$data['yAxis'][$param]['max'] = $max[$param];
						}
					}
				}
			}
		}
		$this->response($data);
	}

	/**
	 * 环境监测详情--统计数据(特征值）
	 */
	function monitor_statistic_get()
	{
		$time = $this->get_post('time');
		$select_env_no = $this->get_post('env_no');
		$index = $this->get_post('index');
		$param = $this->get_post('param');
		if (isset($this->param)) {
			if (isset($this->param['accel'])) {
				unset($this->param['accel']);
			}
			if (isset($this->param['accel'])) {
				unset($this->param['accel']);
			}
			if (isset($this->param['speed'])) {
				unset($this->param['speed']);
			}
			if (isset($this->param['displacement'])) {
				unset($this->param['displacement']);
			}
		}
		$params = array_keys($this->param);

		$time_int = M("monitor")->time_change($time);
		$s_time = $time_int['s_time'];
		$e_time = $time_int['e_time'];

		$data = array(
			'index'=>$index
		);
		if(isset($select_env_no)&&$select_env_no) {
			$s_env_nos = explode(",", $select_env_no);
			//环境信息
			$envs = API("get/base/envs",array("env_no"=>$select_env_no));
			$env_info = array();
			if(isset($envs['rows'])&&$envs['rows']){
				foreach ($envs['rows'] as $row) {
					if(isset($row['env_no'])&&$row['env_no']){
						$env_info[$row['env_no']] = $row;
					}
				}
			}
			//各环境的阈值
			$thresholds = M("threshold")->fetAll("no in ('" . implode("','", $s_env_nos) . "')");
			$threshold = array();
			if ($thresholds) {
				foreach ($thresholds as $thres) {
					if (isset($thres['no']) && $thres['no']) {
						$threshold[$thres['no']] = $thres;
					}
				}
			}
			$select = "env_no,alert_param," . $this->order_time;
			if ($params) {
				$select .= "," . implode(",", $params);
			}
			$env_model = M("environments/env");
			foreach($s_env_nos as $env_no){
				$where = "1=1";
				if(strlen($env_no) <= 12){
					$where = "env_no LIKE '{$env_no}%'";
				}else{
					$where = "env_no  = '{$env_no}'";
				}
				$sql = "SELECT {$select} FROM data_sensor	WHERE {$where} AND {$this->order_time} >= {$s_time} AND {$this->order_time} <= {$e_time} ORDER BY {$this->order_time}" ;

				$data_sensors = $this->db->query($sql)->result_array();
				$pdata = array();
				if ($data_sensors) {
					foreach ($data_sensors as $ds) {
						$date = date('Y-m-d', $ds[$this->order_time]);

						//数据按参数归类
						foreach ($params as $param) {
							if(!isset($pdata[$param])){
								$pdata[$param] = array(
									"all" => array(),
									"alert" => array(),
									"by_date" => array()
								);
							}
							if (isset($ds[$param]) && $ds[$param] != "NaN"&& $ds[$param] != "") {
								$pdata[$param]['all'][] = $ds[$param];
								if (!isset($pdata[$param]['by_date'][$date])) {
									$pdata[$param]['by_date'][$date] = array();
								}
								$pdata[$param]['by_date'][$date][] = $ds[$param];
								$temp_alert = false;
								if (isset($ds['alert_param']) && $ds['alert_param']) {
									if (in_array($param, explode(",", $ds['alert_param']))) {
										$temp_alert = true;
										$pdata[$param]['alert'][] = $ds[$param];
									}
								}
							}
						}
					}
				}else{
					foreach ($params as $param) {
						if(!isset($pdata[$param])){
							$pdata[$param] = array(
								"all" => array(),
								"alert" => array(),
								"by_date" => array()
							);
						}
					}
				}
				//特征值计算
				$temp_data= array();
				$bf_name = "";

				$thr = array();
				if (isset($threshold[$env_no])) {
					$thr = $threshold[$env_no];
				}
				$temp_data = M("monitor")->statistic($pdata, $thr);//特征值计算
				if($temp_data){
					foreach($temp_data as $td_param=>$td_value){
						if(!isset($data[$td_param])){
							$data[$td_param] = array();
						}
						$data[$td_param][$env_no] = $td_value;
						$data[$td_param][$env_no]['env_name'] = isset($env_info[$env_no]['name'])?$env_info[$env_no]['name']:'';
					}
				}
			}
		}
		$this->response($data);
	}

	function _time($time){
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
					if(isset($time_array[0])&&$time_array[0]){
						$s_time = $time_array[0];
					}
					$e_time = "";
					if(isset($time_array[1])&&$time_array[1]){
						$e_time = $time_array[1];
					}
					break;
			}
		}else{
			$e_time = time();
			$s_time = $e_time - 24 * 3600;
		}

		return array(
			's_time'=>$s_time,
			'e_time'=>$e_time
		);
	}
}