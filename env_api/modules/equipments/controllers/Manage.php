<?php
/**
 * Created by PhpStorm.
 * User: HBJ_PC
 * Date: 16-8-26
 * Time: 下午1:39
 */

class Manage extends MY_Controller{

	function __construct(){
		parent::__construct();
		$this->order_time = "equip_time";
		$this->museum_no = app_config('museum_no');
	}

	function equip_list()
	{
		$status = $this->get_post("status");
		$env_no = $this->get_post("env_no");
		$equip_no = $this->get_post("equip_no");
		$equip_type = $this->get_post("equip_type");
		$name = $this->get_post("name");
		$page = $this->get_post("page");
		$limit = $this->get_post("limit");
		$id = $this->get_post("id");
		$parameter = $this->get_post("parameter");
		$type = $this->get_post("type");
		$index = $this->get_post("index");

		$activities = API("get/base/users/active");
		if(isset($activities['查看预警'])&& $activities['查看预警']){
			if(isset($activities['查看预警']['equip'])&&$activities['查看预警']['equip']){
				if(isset($activities['查看预警']['equip']['last_time'])&&$activities['查看预警']['equip']['last_time']){
					$check_alert_time = $activities['查看预警']['equip']['last_time'];
				}
			}
		}

//		$equip_alerts = array();
//		if(isset($check_alert_time)&&$check_alert_time){
//			$sql = "select count(*) as alert_count,equip_no from equip_alert where alert_time > {$check_alert_time} group by equip_no";
//			$alert_counts = $this->db->query($sql)->result_array();
//			if($alert_counts){
//				foreach ($alert_counts as $alert_count) {
//					if(isset($alert_count['equip_no'])&&$alert_count['equip_no']){
//						$equip_alerts[$alert_count['equip_no']] = 0;
//						if(isset($alert_count['alert_count'])){
//							$equip_alerts[$alert_count['equip_no']] = $alert_count['alert_count'];
//						}
//					}
//				}
//			}
//		}

		$all_type = array(
			'sensor' => array('温湿度监测终端','带屏温湿度监测终端','有机挥发物监测终端','二氧化碳监测终端','光照紫外监测终端','空气质量监测终端',"土壤温湿度监测终端","智能囊匣","智能展柜","震动监测终端"),
			'controller'=> array('调湿机','调湿剂',"充氮调湿柜"),
			'network'=> array('中继','网关',"AP"),
			'offline'=> array('手持式温湿度检测仪','手持式二氧化碳检测仪','手持式光照紫外检测仪','手持式有机挥发物检测仪',"手持式甲醛检测仪"),
			'weather'=>array('气象站')
		);

		if(!$page){
			$page = 1;
		}
		if(!$limit){
			$limit = 10;
		}

		$offset = ($page-1)*$limit;
		$where = "1=1";


		$data = array(
			"index"=>$index,
			"count"=>0,
			"page"=>$page,
			"rows"=>array()
		);

		$envs = API("get/base/envs");
		if(isset($this->_user['data_scope'])&&($this->_user['data_scope'] == "administrator" || !empty($this->_user['data_scope']))){

			if(isset($env_no)&&$env_no){
				$env_nos = explode(',',$env_no);
				if($this->_user['data_scope'] != 'administrator'){
					$env_nos = array_intersect($env_nos,$this->_user['data_scope']);
				}
			}else{
				$env_nos = $this->_user['data_scope'];
			}
			if($env_nos != "administrator"){
				if(!isset($env_nos)||empty($env_nos)){
					$this->response($data);
				}else{
					if(!isset($env_no)||!$env_no){
						$where .= " and (env_no in ('".implode("','",$env_nos)."') or env_no is null or env_no = '')";
					}else{
						$where .= " and env_no in ('".implode("','",$env_nos)."')";
					}
				}
			}

			if(isset($name)&&$name){
				$where .= " and name like '%".$name."%'";
			}
			if(isset($equip_no)&&$equip_no){
				$where .= " and equip_no = '".$equip_no."'";
			}

			if($type){
				if(isset($all_type[$type])){
					$where .= " and equip_type in ('".implode("','",$all_type[$type])."')";
				}
			}

			if(isset($equip_type)&&$equip_type){
				$where .= " and equip_type in ('".implode("','",explode(",",$equip_type))."')";
			}


			if(isset($status)&&$status){
				$where .= " and status in ('".implode("','",explode(",",$status))."')";
			}

			if(isset($id)&&$id){
				$where .= " and (equip_no like '%".$id."%' or name like '%".$id."%')";
			}
			if(isset($parameter)&&$parameter){
				$where .= " and parameter like '%".$parameter."%'";
			}
			$count = M("equip")->count($where);
			$sql = "select * from equip where {$where} order by field(`status`,'异常','超低电','超标','低电','正常','备用','停用') limit {$offset},{$limit}";
			$equips = $this->db->query($sql)->result_array();

			$data['count'] = $count;
			$navs = array();
			$equip_nos = array();
			$equip_info = array();
			if($equips){
				foreach($equips as $key=>$equip){
					$equips[$key]['nav'] = false;
					$equips[$key]['map'] = false;
					if(isset($equip['env_no'])&&$equip['env_no']){
						if(isset($navs[$equip['env_no']])){
							$equips[$key]['nav'] = $navs[$equip['env_no']];
						}else{
							$nav = M('common/common')->navigation($envs['rows'],$equip['env_no']);
							$equips[$key]['nav'] = $nav;
							$navs[$equip['env_no']] = $nav;
						}

						if($navs[$equip['env_no']]){
//								array_reverse($navs[$equip['env_no']]);
							foreach($navs[$equip['env_no']] as $n_r){
								if(isset($n_r['type'])&&in_array($n_r['type'],array("展厅","库房","修复室","研究室","楼层"))&&$equip['env_no'] == $n_r['env_no']){
									if(isset($n_r['map'])&&$n_r['map']){
										$equips[$key]['map'] = $n_r['map'];
										continue;
									}
								}else {
									if (isset($n_r['type']) && in_array($n_r['type'], array("展厅", "库房", "修复室", "研究室"))) {
										if (isset($n_r['map']) && $n_r['map']) {
											$equips[$key]['map'] = $n_r['map'];
											continue;
										}
									}
								}
							}
						}
					}

					$equips[$key]['message'] = array();
//					$equips[$key]['new_data'] = array();
					if(isset($equip['parameter_val'])&&$equip['parameter_val']){
						$param_vals = json_decode($equip['parameter_val']);
						if($param_vals){
							$temp_data = array();
							foreach($param_vals as $param=>$param_val){
								if(isset($equip['parameter'])&&$equip['parameter']){
									$sensor_parameter = explode(',',$equip['parameter']);
									if(in_array($param,$sensor_parameter)){
										if(isset($equip['equip_type'])&&$equip['equip_type'] == "智能展柜"){
											$v = explode(',',$param_val);
											foreach ($v as $k=>$val) {
												if($val == "0.00"||$k == 4){
													unset($v[$k]);
												}
											}
											if($v){
												$v = implode(',',$v);
											}
										}else{
											$v = $param_val;
										}
										if(isset($v)){
											$e_type = substr($equip['equip_no'],-11,3);
											$temp_data[$param] = $e_type != "000"?deal_data_decimal($param,$v):$v;
										}
									}
								}
							}
							if($temp_data){
								$equips[$key]['message']['new_data'] = $temp_data;
							}
						}
					}
					$equips[$key]['time'] = "";
					if(isset($equip['last_equip_time'])&&$equip['last_equip_time']){
						$equips[$key]['message']['time'] = date("Y-m-d H:i",$equip['last_equip_time']);
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
						$equips[$key]['locate'] = $locate;
					}

					$equips[$key]['alert_count'] = 0;
					if(isset($equip_alerts[$equip['equip_no']])){
						$equips[$key]['alert_count'] = $equip_alerts[$equip['equip_no']];
					}

					$equip_records = M('equip')->equip_record($equip['equip_no'],3);
					if(!isset($equips[$key]['message']['record'])){
						$equips[$key]['message']['record'] = array();
					}
					if($equip_records){
						foreach ($equip_records as $equip_record) {
							$temp_record = array();
							if(isset($equip_record['type'])&&$equip_record['type'] == '参数下发'){
								if(isset($equip_record['alert_remark'])&&$equip_record['alert_remark']){
									$str_split = explode(':',$equip_record['alert_remark']);
									if(isset($str_split[0])&&$str_split[0]){
										$equip_record['type'] = $str_split[0];
									}
								}
							}
							$temp_record['type'] = $equip_record['type'];
							$temp_record['time'] = $equip_record['alert_time'];
							$temp_record['title'] = date("Y-m-d H:i",$equip_record['alert_time'])."  ".$equip_record['operator'];
							$temp_record['remark'] = $equip_record['alert_remark'];
							$equips[$key]['message']['record'][] = $temp_record;
						}
					}

					$data['rows'][] = $equips[$key];
				}
			}
		}

		$this->response($data);
	}

	function delete_post($equip_no)
	{
		if(!M("common/permission")->check_permission("删除设备",$this->_user)){
			$this->response(array('error' => '无权限删除设备'));
		}
		if(!isset($equip_no)||$equip_no == ""){
			$this->response(array('result'=>false,"msg"=>"设备编号为空"));
		}
		$e = M('equip');
		if($equip_no){
			$equip_no = implode("','",explode(",",$equip_no));
			$equips = $e->fetAll("equip_no in ('".$equip_no."')");
			if($equips){
				$delete = $e->delete("equip_no in ('".$equip_no."')");
				$result = $delete?array('result'=>true,"msg"=>"删除成功"):array('result'=>"error","msg"=>"删除失败");
				$this->response($result);
			}else{
				$this->response(array('result'=>false,"msg"=>"设备不存在"));
			}
		}else{
			$this->response(array('result'=>false,"msg"=>"设备编号为空"));
		}
	}

	/**
	 *修改设备信息
	 **/
	public function edit_post()
	{
		if(!M("common/permission")->check_permission("修改设备信息",$this->_user)){
			$this->response(array('error' => '无权限修改设备信息'));
		}
		$name = $this->get_post("name");
		$env_no = $this->get_post("env_no");
		$minute = $this->get_post("minute");
		$second = $this->get_post("second");
		$status = $this->get_post("status");
		$equip_no = $this->get_post("equip_no");
		$locate = $this->get_post("locate");
		$equip_remark = $this->get_post("remark");

		$equip = M("equip")->fetOne("equip_no = '".$equip_no."'");

		$up_data = array();
		$sleep = 0;
		$remark = array();
		if(isset($minute)&&$minute){
			$sleep += $minute*60;
		}

		if(isset($second)&&$second){
			$sleep += $second;
		}

		if($sleep){
			$up_data['sleep'] = $sleep;
			$remark[] .= "传输间隔:{$equip['sleep']}->{$sleep}s";
		}

		if(isset($name)&&$name){
			$up_data['name'] = $name;
			$remark[] = "设备名称:{$equip['name']}->{$name}";
		}
		if(isset($env_no)&&$env_no){
			$up_data['env_no'] = $env_no;
			$remark[] = "设备名称:{$equip['env_no']}->{$env_no}";
		}

		if(isset($equip_remark)&&$equip_remark){
			$up_data['remark'] =  $equip_remark;
			$remark[] = "设备名称:{$equip['remark']}->{$equip_remark}";
		}

		$opt = null;
		$opt_remark = "";
		if(isset($status)&&$status){
			$up_data['status'] = $status;
			switch($status){
				case "备用":
					$up_data['env_no'] = null;
					$opt = "设备备用";
					$opt_remark = "备用前位置：";
					break;
				case "正常":
					$opt = "设备启用";
					$opt_remark = "启用位置：";
					break;
				case "停用":
					$opt = "设备停用";
					$up_data['env_no'] = null;
					$opt_remark = "停用前位置：";
					break;
				case "异常":
					$opt = "设备异常";
					$opt_remark = "异常前位置：";
					break;
				default:
					break;
			}
		}
		if(isset($locate)&&$locate){
			$up_data['locate'] = $locate;
		}

		if(isset($equip_no)&&$equip_no){
			$position = array();
			if($equip){
				if(isset($equip['env_no'])&&$equip['env_no']){
					$env_no = $equip['env_no'];
				}
				$ret = M("equip")->update($up_data,"equip_no = '".$equip_no."'");
				$result = $ret?array("result"=>true,"msg"=>"修改成功"):array("result"=>false,"msg"=>"修改失败");
				if($opt){
					if(isset($env_no)&&$env_no){
						$nav = API('get/base/envs/navigation/'.$env_no);
						if(isset($nav['rows'])&&$nav['rows']){
							foreach($nav['rows'] as $nv){
								if(isset($nv['name'])&&$nv['name']){
									$position[] = $nv['name'];
								}
							}
						}
						if($position){
							$opt_remark .= implode(" > ",$position);
							$remark[] = $opt_remark;
						}
					}
					$operation = array(
						'operator'=>$this->_user['real_name'],
						'equip_no'=>$equip_no,
						'operation'=>$opt,
						"remark"=>implode(";",$remark),
						'env_no'=>isset($equip['env_no'])?$equip['env_no']:null
					);
					if($operation){
						$opt_ret = M("equipments/equip")->equip_operation($operation);
					}
				}
			}else{
				$result = array("result"=>false,"msg"=>"设备不存在");
			}

			$this->response($result);
		}else{
			$this->response(array("result"=>false,"msg"=>"未选择设备"));
		}
	}

	function equip_add_post()
	{
		if(!M("common/permission")->check_permission("添加设备",$this->_user)){
			$this->response(array('error' => '无权限添加设备'));
		}
		$equip_type = $this->get_post("equip_type");
		$id = $this->get_post("id");
		$name = $this->get_post("name");
		$env_no = $this->get_post("env_no");
		$status = $this->get_post("status");
		$ip = $this->get_post("ip");
		$minute = $this->get_post("minute");
		$second = $this->get_post("second");
		$locate = $this->get_post("locate");
		$param = $this->get_post('param');

		$equip_param = array(
			"温湿度监测终端"=>"temperature,humidity",
			"调湿机"=>"humidity",
			"调控材料"=>"",
			"中继"=>"",
			"网关"=>"",
			"rfid"=>"",
			"移动手持设备"=>"",
			"智能囊匣"=>"temperature,humidity",
			"智能展柜"=>"temperature,humidity",
			"带屏温湿度监测终端"=>"temperature,humidity",
			"二氧化碳监测终端"=>"temperature,humidity,co2",
			"光照紫外监测终端"=>"temperature,humidity,light,uv",
			"有机挥发物监测终端"=>"temperature,humidity,voc",
			"空气质量监测终端"=>"temperature,humidity,organic,inorganic,sulfur",
			"手持式温湿度检测仪"=>"temperature,humidity",
			"手持式二氧化碳检测仪"=>"co2",
			"手持式光照紫外检测仪"=>"light,uv",
			"手持式有机挥发物检测仪"=>"voc",
			"手持式甲醛检测仪"=>"cascophen",
			"安防监测终端"=>"broken,vibration,multi_wave",
			"土壤温湿度监测终端"=>"soil_temperature,soil_humidity,soil_conductivity",
			"震动监测终端"=>"accel,speed,displacement",
			"灯光调控终端"=>"lighting"
		);

		$equip = array();
		$type = "温湿度监测终端";
		if(isset($equip_type)&&$equip_type){
			$equip['equip_type'] = $equip_type;
			if(in_array($equip_type, array('手持式温湿度检测仪','手持式二氧化碳检测仪','手持式光照紫外检测仪','手持式有机挥发物检测仪',"手持式甲醛检测仪","自定义手持检测仪"))){
				$type = "移动手持设备";
			}else{
				$type = $equip_type;
			}
		}

		if(isset($env_no)&&$env_no){
			$equip['env_no'] = $env_no;
		}

		if(isset($status)&&$status){
			$equip['status'] = $status;
		}
		if(isset($ip)&&$ip){
			$equip['ip_port'] = $ip;
		}

		if(isset($sleep)&&$sleep){
			$equip['sleep'] = $sleep;
		}

		$sleep = "";
		if(isset($minute)&&$minute){
			$sleep += $minute*60;
		}

		if(isset($second)&&$second){
			$sleep += $second;
		}
		if(isset($locate)&&$locate){
			$equip['locate'] = $locate;
		}

		$equips = M("equip")->fetAll("","equip_no");
		$equip_nos = array();
		if($equips){
			foreach($equips as $e){
				if(isset($e['equip_no'])&&$e['equip_no']){
					$equip_nos[] = $e['equip_no'];
				}
			}
		}
		if(!isset($id)){
			$id = "";
		}

		$equip_no = "";
		$code = M("equip")->equip_code($type,$id);
		if($id){
			if(isset($this->museum_no)){
				$equip_no = $this->museum_no.$id;
				if(in_array($equip_no,$equip_nos,true)){
					$this->response(array('result'=>false,"msg"=>"编号已存在"));
				}
			}
			$equip['equip_no'] = $equip_no;
		}
		if(!isset($param)||!$param){
			if(isset($equip_param[$equip_type])){
				$param = $equip_param[$equip_type];
			}
		}
		$equip['parameter'] = $param;

		if(isset($equip_param[$equip_type])){
			$equip['parameter'] = $equip_param[$equip_type];
		}

		$equip['sleep'] = 600;
		if(in_array($equip_type,array("温湿度监测终端","智能囊匣","智能展柜","带屏温湿度监测终端"))){
			$equip['monitor_type'] = "仅监测";
		}else if(in_array($equip_type,array("空气质量监测终端","二氧化碳监测终端","光照紫外监测终端","有机挥发物监测终端"))){
			$equip['sleep'] = 900;
			$equip['monitor_type'] = "仅监测";
		}else if($equip_type === "调湿机"||$equip_type == "充氮调湿柜"){
			$equip['monitor_type'] = "主动调控";
		}else if($equip_type === "调控材料"){
			$equip['monitor_type'] = "被动调控";
		}

		if($sleep){
			$equip['sleep'] = $sleep;
		}
		$e = M('equip');
		$add = false;
		if(isset($equip['equip_no'])&&$equip['equip_no']){
			if(isset($name)&&$name){
				$equip['name'] = $name;
			}else{
				$equip['name'] = substr($equip['equip_no'],8);
			}
			$add = $e->add($equip);
			if($add){
				$operation = array();
				$operation['equip_no'] = $equip_no;
				$operation['operation'] = "添加设备";
				$operation['remark']= "手动添加{$equip_type}";
				$operation['env_no']= $env_no;
				$operation['operator']= $this->_user['real_name'];
				M('equip')->equip_operation($operation);
			}
		}
		$result = $add?array('result'=>true,"msg"=>"添加成功"):array('result'=>false,"msg"=>"添加失败");
		$this->response($result);
	}

	function code_get()
	{
		$equip_type = $this->get_post('equip_type');
		$type = "温湿度监测终端";
		if(isset($equip_type)&&$equip_type){
			$equip['equip_type'] = $equip_type;
			if(in_array($equip_type, array('手持式温湿度检测仪','手持式二氧化碳检测仪','手持式光照紫外检测仪','手持式有机挥发物检测仪',"手持式甲醛检测仪","自定义手持检测仪"))){
				$type = "移动手持设备";
			}else{
				$type = $equip_type;
			}
		}
		$code = M("equip")->equip_code($type);

		$equips = M("equip")->fetAll("","equip_no");
		$equip_nos = array();
		if($equips){
			foreach($equips as $e){
				if(isset($e['equip_no'])&&$e['equip_no']){
					$equip_nos[] = $e['equip_no'];
				}
			}
		}

		$equip_no = "";
		if(isset($this->museum_no)){
			$equip_no .= $this->museum_no;
			if($code){
				if(isset($code['code'])&&$code['code']){
					$equip_no .= $code['code'];
				}
				if(isset($code['num'])&&$code['num']){
					$equip_no .= $code['num'];
				}
				while(in_array($equip_no,$equip_nos,true)){
					$code = M("equip")->equip_code($equip_type);
					$equip_no = "";
					$equip_no .= $this->museum_no;
					if(isset($code['code'])&&$code['code']){
						$equip_no .= $code['code'];
					}
					if(isset($code['num'])&&$code['num']){
						$equip_no .= $code['num'];
					}
				}
			}
		}

		$this->response($code);
	}

	public function all_equip_get()
	{
		$equip_type = $this->get_post("equip_type");
		$env_no = $this->get_post("env_no");
		$equip_no = $this->get_post("equip_no");
		$usage = $this->get_post('usage');

		$where = "1=1";
		if($equip_type){
			$equip_types = explode(",",$equip_type);
			$where .= " and equip_type in ('".implode("','",$equip_types)."')";
		}

		if($env_no){
			$env_nos = explode(",",$env_no);
			$where .= " and env_no in ('".implode("','",$env_nos)."')";
		}
		if($equip_no){
			$equip_nos = explode(",",$equip_no);
			$where .= " and equip_no in ('".implode("','",$equip_nos)."')";
		}
		if(!$usage){
			$usage = "在用";
		}
		$usages = explode(',',$usage);
		$where .= " and `usage` in ('".implode("','",$usages)."')";

		$count = M("equip")->count($where);
		$equips = M('equip')->fetAll($where);
		$envs = API("get/base/envs");

		$data = array();
		$data['count'] = $count;
		$data['rows'] = array();
		$navs = array();
		if($equips){
			foreach($equips as $key=>$equip){
				$equips[$key]['nav'] = false;
				if(isset($equip['env_no'])&&$equip['env_no']){
					if(isset($navs[$equip['env_no']])){
						$equips[$key]['nav'] = $navs[$equip['env_no']];
					}else{
						$nav = M('common/common')->navigation($envs['rows'],$equip['env_no']);
						$equips[$key]['nav'] = $nav;
						$navs[$equip['env_no']] = $nav;
					}

					if($navs[$equip['env_no']]){
						foreach($navs[$equip['env_no']] as $n_r){
							if(isset($n_r['type'])&&in_array($n_r['type'],array("展厅","库房","修复室","研究室","楼层"))&&$equip['env_no'] == $n_r['env_no']){
								if(isset($n_r['map'])&&$n_r['map']){
									$equips[$key]['map'] = $n_r['map'];
									continue;
								}
							}else {
								if (isset($n_r['type']) && in_array($n_r['type'], array("展厅", "库房", "修复室", "研究室"))) {
									if (isset($n_r['map']) && $n_r['map']) {
										$equips[$key]['map'] = $n_r['map'];
										continue;
									}
								}
							}
						}
					}
				}

				$equips[$key]['control'] = array();
				if(isset($equip['equip_type'])&&($equip['equip_type'] == "调控材料"||$equip['equip_type'] == "调湿机")){
					$control_record = M('control_record')->fetOne("equip_no = '{$equip['equip_no']}'","*","control_time desc");
					if($control_record){
						if(isset($control_record['control_time'])&&$control_record['control_time']){
							$control_record['control_time'] = date("Y-m-d H:i",$control_record['control_time']);
						}
						unset($control_record['equip_no']);
						unset($control_record['id']);
						$equips[$key]['control'] = $control_record;
					}
				}

				$data['rows'][] = $equips[$key];
			}
		}
		$this->response($data);

	}
}