<?php
/**
 * Created by PhpStorm.
 * User: HBJ_PC
 * Date: 16-8-26
 * Time: 下午1:39
 */

class Detail extends MY_Controller{

	function __construct(){
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

	public function detail_info_get($equip_no)
	{
//		$sql = " select e.*,cr.control_time,cr.replace_time,cr.quantity,cr.unit from equip e left join control_record cr on cr.equip_no = e.equip_no where e.equip_no = '{$equip_no}' order by cr.control_time desc";
//		$equip = $this->db->query($sql)->row_array();
//		$this->response($equip);
		$equip = M("equip")->find("equip_no = '".$equip_no."'");

		//设备类型
		$type = array();
		$equip_type = equip_type('type');
		if($equip_type){
			foreach ($equip_type as $ty=>$et) {
				if($et){
					foreach ($et as $item) {
						$type[$item] = $ty;
					}
				}
			}
		}

		//环境信息
		$envs = API("get/base/envs");
		$env_info = array();
		if($envs['rows']){
			foreach ($envs['rows'] as $row) {
				if(isset($row['env_no'])){
					$env_info[$row['env_no']] = $row;
				}
			}
		}


		if($equip){
			if(isset($equip['equip_no'])&&$equip['equip_no']){
				$e_type = substr($equip_no,-11,3);
				$equip['new_data_time'] = "";
				switch($equip['equip_type']){
					case "震动监测终端":
						$new_data = M('data_sensor_vibration_count')->fetOne("count_time < ".time(),"*","count_time desc");
						if(isset($new_data['count_time'])&&$new_data['count_time']){
							$equip['new_data_time'] = date("Y-m-d H:i",$new_data['count_time']);
						}
						break;
					case "调控材料":
					case "调湿机":
					case "充氮调湿柜":
					case "智能存储柜":
					case "灯光调控终端":
						$control_record = M('control_record')->fetOne("equip_no = '{$equip_no}'","equip_no,control_time,replace_time,quantity,unit","id desc");
						if($control_record){
							$equip = array_merge($equip,$control_record);
						}
						$equip['volume'] = "";
						if(isset($equip['env_no'])&&$equip['env_no']){
							if(isset($env_info[$equip['env_no']])&&$env_info[$equip['env_no']]){
								if(isset($env_info[$equip['env_no']]['volume'])&&$env_info[$equip['env_no']]['volume']){
									$equip['volume'] = $env_info[$equip['env_no']]['volume'];
								}
							}
						}
					 	if(isset($equip['parameter_val'])&&$equip['parameter_val']){
							$new_data = json_decode($equip['parameter_val'],true);
						}
						if(isset($equip['last_equip_time'])&&$equip['last_equip_time']){
							$equip['new_data_time'] = date("Y-m-d H:i",$equip['last_equip_time']);
						}

						break;
					case "智能囊匣":
						$box = M('box')->fetOne("env_no = '{$equip_no}'");
						if($box){
							if(isset($box['model'])){
								$equip['box_model'] = $box['model'];
							}
						}
						break;
					default:
						if(isset($equip['parameter_val'])&&$equip['parameter_val']){
							$new_data = json_decode($equip['parameter_val'],true);
						}
						if(isset($equip['last_equip_time'])&&$equip['last_equip_time']){
							$equip['new_data_time'] = date("Y-m-d H:i",$equip['last_equip_time']);
						}
						break;
				}

				if(isset($type[$equip['equip_type']])){
					$equip['monitor_type'] = $type[$equip['equip_type']];
				}
				if(isset($new_data)&&$new_data){
					if(isset($equip['parameter'])&&$equip['parameter']){
						$params = explode(",",$equip['parameter']);
						if($params){
							$temp_data = array();
							foreach($params as $param){
								if($param != 'canbi'){
									$temp_data[$param] = "";
									if(in_array($param,array('accel','speed','displacement'))){
										if(isset($new_data[$param.'_average'])&&$new_data[$param.'_average'] != ""&&$new_data[$param.'_average'] != null&&$new_data[$param.'_average'] != "NaN"){
											if(is_array($new_data[$param.'_average'])){
												$temp_data[$param] = implode(",",$new_data[$param.'_average']);
											}else{
												$temp_data[$param] = $e_type!="000"?deal_data_decimal($param, $new_data[$param.'_average']):$new_data[$param.'_average'];
											}
										}
									}else{
										if(isset($new_data[$param])&&$new_data[$param] != ""&&$new_data[$param] != null&&$new_data[$param] != "NaN"){
											if(is_array($new_data[$param])){
												$temp_data[$param] = implode(",",$new_data[$param]);
											}else{
												$temp_data[$param] = $e_type!="000"?deal_data_decimal($param,$new_data[$param]):$new_data[$param];
											}
										}
									}
								}
							}
							$equip['new_data'] = $temp_data;
						}
					}

					$equip['rssi'] = isset($new_data['rssi'])?$new_data['rssi']:"";
					$equip['voltage'] = isset($new_data['voltage'])?$new_data['voltage']:"";
				}
				$equip['min'] =  "";
				if(isset($equip['equip_type'])&&in_array($equip['equip_type'],array("调湿机","充氮调湿机"))){
					$send_down = M("equip_operation")->fetOne("equip_no = '".$equip_no."' and instruct = '31'","*"," operation_time desc");
					if($send_down){
						if(isset($send_down['send_data'])&&$send_down['send_data']){
							$send_data = json_decode($send_down['send_data'],true);
							if(isset($send_data['min'])){
								$equip['min'] = $send_data['min'];
							}
						}
					}
				}
			}
			$image = M("image")->fetOne("no = '".$equip_no."' and `type` = 'home' ");
			if(isset($image['url'])&&$image['url']){
				$equip['image'] = $image['url'];
			}

			$equip['nav'] = "";
			$equip['map'] = false;
			if(isset($equip['env_no'])&&$equip['env_no']){
				if(isset($navs[$equip['env_no']])){
					$equip['nav'] = $navs[$equip['env_no']];
				}else{
					$nav = M('common/common')->navigation($envs['rows'],$equip['env_no']);
					$equip['nav'] = $nav;
					$navs[$equip['env_no']] = $nav;
				}
				if(isset($equip['nav'])&&$equip['nav']){
					foreach($equip['nav'] as $n_r){
						if(isset($n_r['type'])&&in_array($n_r['type'],array("展厅","库房","修复室","研究室","楼层"))&&$equip['env_no'] == $n_r['env_no']){
							if(isset($n_r['map'])&&$n_r['map']){
								$equip['map'] = $n_r['map'];
								continue;
							}
						}else {
							if (isset($n_r['type']) && in_array($n_r['type'], array("展厅", "库房", "修复室", "研究室"))) {
								if (isset($n_r['map']) && $n_r['map']) {
									$equip['map'] = $n_r['map'];
									continue;
								}
							}
						}
					}
				}
				if(isset($env_info[$equip['env_no']])&&$env_info[$equip['env_no']]){
					if(isset($env_info[$equip['env_no']]['volume'])&&$env_info[$equip['env_no']]['volume']){
						$equip['volume'] = $env_info[$equip['env_no']]['volume'];
					}
				}
			}
			if(isset($equip['sleep'])&&$equip['sleep']){
				$equip['minute'] = floor($equip['sleep']/60);
				$equip['second'] = $equip['sleep']%60;
			}
		}else{
			$equip = array(
				'result'=>false,
				'msg'=>'设备不存在'
			);
		}
		$this->response($equip);
	}

	public function opt_record($equip_no)
	{
		$time = $this->get_post("time");
		$page = $this->get_post("page");
		$limit = $this->get_post("limit");
		$id = $this->get_post("id");
		$operation = $this->get_post("operation");
		$operator = $this->get_post("operator");
		$sort = $this->get_post("sort");
		if($time){
			$d_time = M("equip")->get_time($time);
			$e_time = $d_time['e_time'];
			$s_time = $d_time['s_time'];
		}

		$where = "1=1";

		if(isset($equip_no)){
			$where .= " and equip_no ='".$equip_no."'";
		}
		if(isset($id)&&$id){
			$where .= " and (operation like '%{$id}%' or operator like '%{$id}%')";
		}

		if(isset($e_time) && isset($s_time)){
			$where .= " and operation_time between ".$s_time ." and ".$e_time;
		}

		if(isset($operation)&&$operation){
			$where .= " and operation in ('".implode("','",explode(",",$operation))."')";
		}

		if(isset($operator)&&$operator){
			$where .= " and operator in ('".implode("','",explode(",",$operator))."')";
		}

		if(!isset($sort)){
			$sort = "desc";
		}

		if(!$page){
			$page = 1;
		}

		if(!$limit){
			$limit = 10;
		}

		$offset = ($page - 1)*$limit;

		$count = M("equip_operation")->count($where);
		$records = M("equip_operation")->fetAll($where,"*","operation_time ".$sort,$offset,$limit);

		$data = array(
			"count"=>$count,
			"page"=>$page,
			"total"=>sizeof($records),
			"rows"=>array()
		);

		if($records){
			foreach($records as $record){
				if(isset($record['operation_time'])&&$record['operation_time']){
					$record['operation_time'] = date("Y-m-d H:i",$record['operation_time']);
					$data['rows'][] = $record;
				}
			}
		}
		$this->response($data);
	}


	public function statistic_get()
	{
		$time = $this->get_post("time");
		$equip_no = $this->get_post("equip_no");
		$e_type = substr($equip_no,-11,3);

		$d_time = M("equip")->get_time($time);
		$e_time = $d_time['e_time'];
		$s_time = $d_time['s_time'];

		$temp_thres = array(
			"temperature"=> array(
				"name"=> "温度",
				"unit"=> "℃"
			),
			"soil_temperature"=> array(
				"name"=> "温度",
				"unit"=> "℃"
			),
			"temperature_range"=> array(
				"name"=> "温度日波动",
				"unit"=> "℃"
			),
			"humidity"=> array(
				"name"=> "相对湿度",
				"unit"=> "%"
			),
			"soil_humidity"=> array(
				"name"=> "相对湿度",
				"unit"=> "%"
			),
			"soil_salt"=> array(
				"name"=> "相对湿度",
				"unit"=> "%"
			),
			"humidity_range"=> array(
				"name"=> "相对湿度日波动",
				"unit"=> "%"
			),
			"voc"=> array(
				"name"=> "有机挥发物",
				"unit"=> "ppb"
			),
			"co2"=> array(
				"name"=> "二氧化碳",
				"unit"=> "ppm"
			),
			"light"=> array(
				"name"=> "光照",
				"unit"=> "lx"
			),
			"total_light"=> array(
				"name"=> "累积照度",
				"unit"=> "lx"
			),
			"uv"=> array(
				"name"=> "紫外",
				"unit"=> "μw/cm²"
			),
			"organic"=> array(
				"name"=> "有机污染物",
				"unit"=> "Hz"
			),
			"inorganic"=> array(
				"name"=> "无机污染物",
				"unit"=> "Hz"
			),
			"sulfur"=> array(
				"name"=> "硫化污染物",
				"unit"=> "Hz"
			),
			"qcm_organic"=> array(
				"name"=> "有机污染物30天累计当量",
				"unit"=> "mg/m²"
			),
			"qcm_inorganic"=> array(
				"name"=> "无机污染物30天累计当量",
				"unit"=> "mg/m²"
			),
			"qcm_sulfur"=> array(
				"name"=> "硫化污染物30天累计当量",
				"unit"=> "mg/m²"
			)
		);

		$where = "1=1";
		if(!isset($equip_no)||!$equip_no){
			$this->response(array('error'=>"设备编号不能为空"));
		}
		$where .= " and equip_no = '".$equip_no."'";
		$equip = M("equip")->fetOne("equip_no = '".$equip_no."'");
		$select = "equip_no,alert_param,".$this->order_time;
		$params = array();
		if($equip){
			if(isset($equip['parameter'])&&$equip['parameter']){
				$select .= ",".$equip['parameter'];
				$params = explode(',',$equip['parameter']);
			}
		}

		$threshold = array();
		if(isset($equip['env_no'])&&$equip['env_no']){
			$threshold = M("threshold")->fetOne("no = '{$equip['env_no']}'");
		}

		if($s_time){
			$where .= " and equip_time > ".$s_time;
		}
		if($e_time){
			$where .= " and equip_time <= ".$e_time;
		}
		if(isset($equip['equip_type'])&&$equip['equip_type'] != '震动监测终端'){
			$data_sensor = M("data_sensor")->fetAll($where,$select,"equip_time asc");
			$pdata = array();
			$monitor = M("monitor/monitor");
			if($data_sensor){
				foreach ($data_sensor as $ds) {
					if($params){
						foreach ($params as $param) {
							if($param != 'canbi'){
								if(!isset($pdata[$param])){
									$pdata[$param] = array(
										'all'=>array(),
										'alert'=>array(),
										"by_date"=>array()
									);
								}
								if(isset($ds[$param])&&$ds[$param]!=""&&$ds[$param]!="NaN"&&$ds[$param]!=null){
									$vals = explode(',',$ds[$param]);
									foreach ($vals as $k=> $val) {
										if($equip['equip_type'] == "智能展柜"){
											if($val == '0.00' || $k==4){
												continue;
											}
										}
										$pdata[$param]['all'][] = $val;
										$date = date("Y-m-d",$ds['equip_time']);
										if(!isset($pdata[$param]['by_date'][$date])){
											$pdata[$param]['by_date'][$date] = array();
										}
										$pdata[$param]['by_date'][$date][] = $val;
									}
									if(isset($ds['alert_param'])&&$ds['alert_param']){
										if(strpos($ds['alert_param'],$param) !== false){
											$pdata[$param]['alert'][] = $ds[$param];
										}
									}
								}
							}
						}
					}
				}
			}
			$data  = $monitor->statistic($pdata,$threshold);
			foreach($data as $p=>$value){
				if(!in_array($p,$params)){
					unset($data[$p]);
					continue;
				}
				if(in_array($p,array('humidity','temperature'))){
					if(isset($threshold[$p."_range"])){
						$data[$p."_range"] = array(
							"threshold"=>$threshold[$p."_range"],
							"extremum"=>$value['diff'],
							'standard_reach'=>'-'
						);
						$data[$p."_range"] = array_merge($data[$p."_range"],$temp_thres[$p."_range"]);
					}
				}else if(in_array($p,array('light'))){
					if(isset($threshold["total_light"])){
						$data["total_light"] = array(
							"threshold"=>$threshold["total_light"],
							"extremum"=>$value['extremum'],
							'standard_reach'=>'-'
						);
					}
				}
				$data[$p] = array_merge($data[$p],$temp_thres[$p]);
				unset($data[$p]['diff']);
				unset($data[$p]['cv']);
				unset($data[$p]['average']);
				unset($data[$p]['avg_fluctuate']);
				unset($data[$p]['max_fluctuate']);
			}

			$qcm_30ds = M("equip_qcm")->fetAll($where,"equip_time,env_no,equip_time,organic,inorganic,sulfur","equip_time asc");
//			$this->response($qcm_30ds);
			if($qcm_30ds){
				$deal_qcm = array();
				$qcm = array("organic","inorganic","sulfur");
				foreach ($qcm_30ds as $qcm_30d) {
					foreach ($qcm as $qp) {
						if(!isset($deal_qcm["qcm_".$qp])){
							$deal_qcm["qcm_".$qp] = array(
								'all'=>array(),
								'bad'=>array()
							);
						}
						if(isset($qcm_30d[$qp])){
							$deal_qcm["qcm_".$qp]['all'][] = $qcm_30d[$qp];
							if(isset($threshold["qcm_{$qp}_max"])&&$threshold["qcm_{$qp}_max"]){
								if($qcm_30d[$qp] > $threshold["qcm_{$qp}_max"]){
									$deal_qcm["qcm_".$qp]['bad'][] = $qcm_30d[$qp];
								}
							}
						}
					}
				}
				if($deal_qcm){
					foreach ($deal_qcm as $d_p=>$d_qcm) {
						if(!isset($data[$d_p])){
							$data[$d_p] = array(
								"threshold"=>isset($threshold[$d_p."_max"])?"≤".$threshold[$d_p."_max"]:"-",
								"extremum"=>"-",
								'standard_reach'=>'-'
							);
						}
						if($d_qcm['all']){
							$data[$d_p]['extremum'] = min($d_qcm['all'])."~".max($d_qcm['all']);
							$data[$d_p]['standard_reach'] = 100 - round(sizeof($d_qcm['bad'])/sizeof($d_qcm['all']) * 100 ,2);
						}
						$data[$d_p] = array_merge($data[$d_p],$temp_thres[$d_p]);
					}
				}

			}
		}else{
			$data_sensors = M("data_sensor_vibration_count")->fetAll("count_time > ".$s_time. " and count_time <= ".$e_time,'*',"count_time asc");
			$pdata = array();
			if($data_sensors){
				foreach($data_sensors as $data_sensor){
					if(isset($equip['parameter'])&&$equip['parameter']){
						$parameters = explode(',',$equip['parameter']);
						foreach ($parameters as $p) {
							if(!isset($pdata[$p])){
								$pdata[$p]=array(
									'min'=>array(),
									'max'=>array(),
									'avg'=>array(),
									'fluctuate'=>array()
								);
							}
							$min = "";
							$max = "";
							if(isset($data_sensor[$p."_min"])&&$data_sensor[$p."_min"]){
								$pdata[$p]['min'][] = $data_sensor[$p."_min"];
								$min = $data_sensor[$p."_min"];
							}
							if(isset($data_sensor[$p."_max"])&&$data_sensor[$p."_max"]){
								$pdata[$p]['max'][] = $data_sensor[$p."_max"];
								$max = $data_sensor[$p."_max"];;
							}
							if($min!= ""&&$max!=""){
								$pdata[$p]['fluctuate'][] = $e_type!="000"?deal_data_decimal($p,$max - $min):$max-$min;
							}
							if(isset($data_sensor[$p."_average"])&&$data_sensor[$p."_average"]){
								$pdata[$p]['avg'][] = $data_sensor[$p."_average"];
							}

						}
					}
				}
			}
			$temp = array();
			if($pdata){
				foreach($pdata as $p=>$pd){
					$temp[$p] = array(
//						'threshold'=>"-",
						'extremum'=>"-",
						'average'=>"-",
						'standard_reach'=>"-",
						'cv'=>"-",
						'diff'=>"-",
						'max_fluctuate'=>"-",
						'avg_fluctuate'=>"-"
					);
					if(isset($pd['min'])&&$pd['min']&&isset($pd['max'])&&$pd['max']){
						$p_max = $e_type!="000"?deal_data_decimal($p, max($pd['max'])):max($pd['max']);
						$p_min = $e_type!="000"?deal_data_decimal($p,min($pd['min'])):min($pd['min']);
						$temp[$p]['extremum'] = $p_min.'~'.$p_max;
						$temp[$p]['diff'] = $e_type!="000"?deal_data_decimal($p,$max - $min):$max - $min;
					}
					if(isset($pd['avg'])&&$pd['avg']){
						$avg = array_sum($pd['avg'])/sizeof($pd['avg']);
						$temp[$p]['average'] = $e_type!="000"?deal_data_decimal($p,$avg):$avg;
					}
					if(isset($pd['fluctuate'])&&$pd['fluctuate']){
						$fluctuate = array_sum($pd['fluctuate'])/sizeof($pd['fluctuate']);
						$temp[$p]['avg_fluctuate'] = $e_type!="000"?deal_data_decimal($p,$fluctuate):$fluctuate;
						$temp[$p]['max_fluctuate'] = $e_type!="000"?deal_data_decimal($p,max($pd['fluctuate'])):max($pd['fluctuate']);
					}
				}
			}
			$data = $temp;
		}

		$this->response($data);
	}

	public function env_threshold_get()
	{
		$time = $this->get_post('time');
		$env_no = $this->get_post('env_no');

		$env_info = API('get/base/envs/info/'.$env_no);
		$thres = M('threshold')->fetOne("no = '{$env_no}'");

		$data = array();
		if($this->param) {
			foreach ($this->param as $pp => $un) {
				if(in_array($pp,array('humidity','temperature'))){
					if(!isset($data[$pp])){
						$data[$pp] = array(
							'threshold'=>'-',
							'real_value'=>'-',
							'standard_reach'=>'-',
						);
						$data[$pp] = array_merge($data[$pp],$un);
					}
				}
				$min = "";
				$max = "";
				if(isset($thres[$pp."_min"])&&$thres[$pp."_min"] !=''&&$thres[$pp."_min"] !=null){
					$min = $thres[$pp."_min"];
				}
				if(isset($thres[$pp."_max"])&&$thres[$pp."_max"] !=''&&$thres[$pp."_max"] !=null){
					$max = $thres[$pp."_max"];
				}
				if(in_array($pp,array('humidity','temperature','soil_humidity','soil_temperature','soil_conductivity','soil_salt'))){
					$data[$pp]['threshold'] = ($min || $max)?($min." ~ ".$max):"-";
				}else{
					$data[$pp]['threshold'] = "≤".$max;
				}
			}
		}

		$d_time = M("equip")->get_time($time);
		$e_time = $d_time['e_time'];
		$s_time = $d_time['s_time'];

		$where = "1=1";
		if(!isset($env_no)||!$env_no){
			$this->response(array('error'=>"环境编号不能为空"));
		}
		$where .= " and env_no = '".$env_no."' and equip_time between {$s_time}  and {$e_time}";
		$select = "equip_no,alert_param,equip_time";

		$data_sensors = M('data_sensor')->fetAll($where);
		if($data_sensors){
			$pdata = array();
			foreach ($data_sensors as $data_sensor) {
				if($this->param){
					foreach ($this->param as $tp=>$un) {
						if(!isset($pdata[$tp])){
							$pdata[$tp] = array(
								'all'=>array(),
								'alert'=>0
							);
						}
						if(isset($data_sensor[$tp])&&$data_sensor[$tp] !=""&&$data_sensor[$tp] !=null){
							$pdata[$tp]['all'][] = $data_sensor[$tp];
						}
						if(isset($data_sensor['alert_param'])&&$data_sensor['alert_param']){
							if(strpos($data_sensor['alert_param'],$tp) !== false){
								$pdata[$tp]['alert']++;
							}
						}
					}
				}
			}

			if($pdata){
				foreach ($pdata as $param=>$pd) {
					if(!isset($data[$param])){
						$data[$param] = array(
							'threshold'=>'-',
							'real_value'=>'-',
							'standard_reach'=>'-'
						);
					}

					if($pd['all']&&is_array($pd['all'])){
						$pd_min = min($pd['all']);
						$pd_max = max($pd['all']);
						$range = deal_data_decimal($param,abs($pd_max-$pd_min));
						$data[$param]['real_value'] = $pd_min."~".$pd_max;
						if(sizeof($pd['all'])){
							$data[$param]['standard_reach'] =100 - round($pd['alert']/sizeof($pd['all'])  * 100,2);
						}
					}
					if(in_array($param,array('humidity','temperature'))){
						if(!isset($data[$param."_range"])){
							$data[$param."_range"] = array(
								'threshold'=>'-',
								'real_value'=>isset($range)?$range:'-',
								'standard_reach'=>'-'
							);
						}
					}
				}
			}
		}
		$this->response($data);
	}

	public function branch($equip_no)
	{
		$now = time();
		$s_time = $now - 18*60;
		$sensorList = array();
		$where = "1=1";
		if (isset($equip_no) && $equip_no) {
			$equip_no = substr($equip_no,-11);
			$where .= " and (sensor_no = '{$equip_no}' or gateway_no = '{$equip_no}'or relay1_no = '{$equip_no}'or relay2_no = '{$equip_no}'or relay3_no = '{$equip_no}')";
		}
		$where .= " and server_time between ".$s_time." and ".$now;
		$routes = M("data_route")->fetAll($where,"*","server_time desc");
		foreach ($routes as $route) {
			$level = array_search($equip_no,$route);
			switch($level){
				case "gateway_no":
					foreach ($route as $key=>$value) {
						if(in_array($key,array('relay1_no','relay2_no','relay3_no','sensor_no'))){
							if(isset($route[$key])&&$route[$key]){
								if(!in_array($route[$key],$sensorList)){
									$sensorList[$route[$key]] = $route['server_time'];
								}
							}
						}
					}
					break;
				case "relay1_no":
					foreach ($route as $key=>$value) {
						if(in_array($key,array('relay2_no','relay3_no','sensor_no'))){
							if(isset($route[$key])&&$route[$key]){
								if(!in_array($route[$key],$sensorList)){
									$sensorList[$route[$key]] = $route['server_time'];
								}
							}
						}
					}
					break;
				case "relay2_no":
					foreach ($route as $key=>$value) {
						if(in_array($key,array('relay3_no','sensor_no'))){
							if(isset($route[$key])&&$route[$key]){
								if(!in_array($route[$key],$sensorList)){
									$sensorList[$route[$key]] = $route['server_time'];
								}
							}
						}
					}
					break;
				case "relay3_no":
					foreach ($route as $key=>$value) {
						if(in_array($key,array('sensor_no'))){
							if(isset($route[$key])&&$route[$key]){
								if(!in_array($route[$key],$sensorList)){
									$sensorList[$route[$key]] = $route['server_time'];
								}
							}
						}
					}
					break;
			}
		}
		$rows = array();
		$config = app_config();
		$museum_no = $config['museum_no'];
		if($sensorList){
			foreach ($sensorList as $no=>$time) {
				$rows[] = array(
					'equip_no'=>$museum_no.$no,
					'name'=>$no,
					'server_time'=>date('Y-m-d H:i',$time)
				);
			}
		}
		$data = array(
			'rows'=>$rows,
			'total'=>sizeof($rows)
		);
		$this->response($data);
	}
}