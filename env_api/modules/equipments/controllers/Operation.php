<?php
/**
 * Created by PhpStorm.
 * User: HBJ_PC
 * Date: 16-8-8
 * Time: 上午9:21
 */
class Operation extends MY_Controller{
//	public function __construct(){
//
//	}

	function equip_opt_post($equip_no,$opt){
		$env_no = $this->get_post("env_no");
		$remark = $this->get_post("remark");
		$equip = M("equip")->find("equip_no = '".$equip_no."'");

		$data = array();
		if($equip){
			$up_data = array();
			$operation = array();
			if($opt){
				switch($opt){
					case "start":
						$up_data['env_no'] = $env_no;
						$up_data['status'] = "在用";
						$operation['operation'] = "启用";
						break;
					case "backup":
						$up_data['env_no'] = "";
						$up_data['status'] = "备用";
						$operation['operation'] = "备用";
						break;
					case "stop":
						$up_data['env_no'] = "";
						if($env_no){
							$up_data['env_no'] = $env_no;
						}
						$up_data['status'] = "停用";
						$operation['operation'] = "停用";
						break;
					default:
						break;
				}
				$operation['operation_time'] = time();
				$operation['equip_no'] = $equip_no;
				$operation['operator'] = $this->_user['real_name'];
				$operation['remark'] = $remark;
				$ret = M("equip")->update($up_data,"equip_no = '".$equip_no."'");
				if($ret){
					M("equip_operation")->add($operation);
					$data['result'] = "success";
					$data['msg'] = "操作成功";
				}
			}else{
				$data['result'] = "failure";
				$data['msg'] = "设备不存在";
			}

			$this->response($data);
		}
	}


	function equip_pos_post(){
		$equip_no = $this->get_post("equip_no");
		$width = $this->get_post("width");
		$height = $this->get_post("height");
		$x = $this->get_post("x");
		$y = $this->get_post("y");

		$equip = M("equip")->find("equip_no = '".$equip_no."'");
		$data = array();
		$locate = array();
		if(isset($width)&&$width){
			$locate['width'] = $width;
		}
		if(isset($height)&&$height){
			$locate['height'] = $height;
		}
		if(isset($x)&&isset($y)){
			$locate['area'][] = $x.",".$y;
		}
		if($equip){
			$up_data = array();
			$up_data['locate'] = json_encode($locate);

			$ret = M("equip")->update($up_data,"equip_no = '".$equip_no."'");
			if($ret){
				$data['result'] = true;
				$data['msg'] = "保存成功";
			}
		}else{
			$data['result'] = false;
			$data['msg'] = "设备不存在";
		}

		$this->response($data);
	}


	function operation_list(){
		$id = $this->get_post("id");
		$equip_no = $this->get_post("equip_no");
		$operation = $this->get_post("operation");
		$operator = $this->get_post("operator");
		$instruct = $this->get_post("instruct");
		$time = $this->get_post("time");
		$limit = $this->get_post("limit");
		$page = $this->get_post("page");

		$equip_opt =  array("设置工作模式(0x01)","设置休眠周期(0x02)","同步系统时间(0x03)","设置设备编号(0x04)","设置:量程(0x10)","藏品信息图片下发(0x0a)","设置:预警范围(0x11)",
			"设置频率波特率(0x12)","自定义指令参数","标定(0x20)","校正系数(0x21)","设置功能参数(0x22)","设置调控模式(0x30)","设定调控目标值(0x31)","设置调控内部参数(0x32)",
			"设定使用状态", "修改设备名称","修改设备位置","修改型号","修改厂商","修改适用条件","修改备注","添加图片","震动授权","修改投放信息","修改调控效果","设备替换",
			"切换囊匣模式","开盖授权","震动授权"
		);
		$where = "1=1";
		if(isset($id)&&$id){
			$where .= " and equip_no like '%{$id}%'";
		}

		$operations = array();
		if(isset($operation)&&$operation){
			$operations = explode(',',$operation);
			$where .= " and  operation in ('".implode("','",$operations)."')";
		}else{
			$where .= " and  operation in ('".implode("','",$equip_opt)."')";
		}

		if(isset($instruct)&&$instruct){
			$instructs = explode(',',$instruct);
			$where .= " and instruct in ('".implode("','",$instructs)."')";
		}

		if(isset($operator)&&$operator){
			$operators = explode(',',$operator);
			$where .= " and operator in ('".implode("','",$operators)."')";
		}


		if(isset($time)&&$time){
			$time_array = explode(',',$time);
			$s_time = $time_array[0];
			$e_time = $time_array[1];
			$where .= " and operation_time between ".$s_time ." and ".$e_time;
		}

		if(!$limit){
			$limit = 10;
		}
		if(!$page){
			$page = 1;
		}
		$offset = ($page - 1)*$limit;

		$equip_operations = M("equip_operation")->fetAll($where,"*","operation_time desc",$offset,$limit);
		$total =  M("equip_operation")->count($where);

		$data = array(
			"total"=>$total,
			"page"=>$page,
			"limit"=>$limit,
			"rows"=>array()
		);
		if($equip_operations){
			foreach ($equip_operations as $k=>$equip_operation) {
				//操作时间
				if(isset($equip_operation['operation_time'])&&$equip_operation['operation_time']){
					$equip_operations[$k]['operation_time'] = date("Y-m-d H:i",$equip_operation['operation_time']);
				}
				//下发时间
				if(isset($equip_operation['send_time'])&&$equip_operation['send_time']){
					$equip_operations[$k]['send_time'] = date("Y-m-d H:i",$equip_operation['send_time']);
				}
				//反馈时间
				if(isset($equip_operation['feedback_time'])&&$equip_operation['feedback_time']){
					$equip_operations[$k]['feedback_time'] = date("Y-m-d H:i",$equip_operation['feedback_time']);
				}
			}
		}


		$data['rows'] = $equip_operations;

		$this->response($data);
	}

	public function filter_get()
	{
		$equip_no = $this->get_post('equip_no');

		$equip_alert = array('异常低电','采集时间超时','传输时间超时','数据错误','数据突变','低电');
		$equip_opt =  array("设置工作模式(0x01)","设置休眠周期(0x02)","同步系统时间(0x03)","设置设备编号(0x04)","设置:量程(0x10)","藏品信息图片下发(0x0a)","设置:预警范围(0x11)",
			"设置频率波特率(0x12)","自定义指令参数","标定(0x20)","校正系数(0x21)","设置功能参数(0x22)","设置调控模式(0x30)","设定调控目标值(0x31)","设置调控内部参数(0x32)",
			"设定使用状态", "修改设备名称","修改设备位置","修改型号","修改厂商","修改适用条件","修改备注","添加图片","震动授权","修改投放信息","修改调控效果","设备替换",
			"切换囊匣模式","开盖授权","震动授权"
		);
		$opt_where = "operation is not null";
		if($equip_no){
			$opt_where .= " and equip_no = '{$equip_no}'";
		}
		$opt_group_sql = "select count(*) as count,operation as name from equip_operation where {$opt_where} group by operation order by count desc";
		$operation_groups = $this->db->query($opt_group_sql)->result_array();
		$data = array();
		if($operation_groups){
			foreach ($operation_groups as $operation_group) {
				if(isset($operation_group['name'])&&$operation_group['name']){
					if($equip_no){
						if(in_array($operation_group['name'],$equip_alert)){
							if(!isset($data['equip_alert'])){
								$data['equip_alert'] = array();
							}
							$data['equip_alert'][] = $operation_group;
						}else {
							if(!isset($data['equip_opt'])){
								$data['equip_opt'] = array();
							}
							$data['equip_opt'][] = $operation_group;
						}
					}else{
						if(in_array($operation_group['name'],$equip_opt)){
							if(!isset($data['equip_opt'])){
								$data['equip_opt'] = array();
							}
							$data['equip_opt'][] = $operation_group;
						}
					}

				}
			}
		}

//		$opts = array_merge($equip_alert,$equip_opt);
		$where = "operator is not null";
		if($equip_no){
			$where .= " and equip_no = '{$equip_no}'";
		}else{
			if($equip_opt){
				$where .= " and operation in ('".implode("','",$equip_opt)."')";
			}
		}

		$operator_group_sql = "select count(*) as count,operator as name from equip_operation where {$where} group by operator order by count desc";
		$operator_groups = $this->db->query($operator_group_sql)->result_array();
		if($operator_groups){
			foreach ($operator_groups as $operator_group) {
				if(isset($operator_group['name'])&&$operator_group['name']){
					if(!isset($data['operator'])){
						$data['operator'] = array();
					}
					$data['operator'][] =$operator_group;
				}
			}
		}

		$this->response($data);
	}


	/**
	 *通过ping设备的ip测试是否可以联通设备
	 */
	public function ping($equip_no)
	{
		$equip = M("equip")->find("equip_no = '".$equip_no."'");

		$ip = "";
		if(isset($equip['ip_port'])&&$equip['ip_port']){
			$ip_ports = explode(":",$equip['ip_port']);
			$reg_str = '((25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))';
			if($ip_ports){
				if(isset($ip_ports[3])){
					$ip = $ip_ports[3];
				}
//				foreach ($ip_ports as $ip_port) {
//					if(fnmatch($reg_str,$ip_port)){
//						$ip = $ip_port;
//					}
//				}
			}
		}

		$return = array(
			"code"=>1,
			'ip'=>$ip
		);
		if(isset($ip)&&$ip){
			if (PHP_OS == "Linux") {
				$command = "ping -c4 $ip";
			} else {
				//header("Content-type:text/html;charset=gbk");
				$command = "ping $ip -n 4";
			}
			@exec($command,$info, $result);
			echo mb_convert_encoding(implode("<br/>", $info),'utf-8','gbk');
			//$return['code'] = $result;
			if($result){
				echo "该设备无法连接";
			}else{
				echo "设备连接成功";
			}
		}else{
			echo '未找到ip';
		}

		//$this->response($return);
	}
}