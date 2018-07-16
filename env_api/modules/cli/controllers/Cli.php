<?php

class Cli extends CI_Controller{

	public function __construct(){
		parent::__construct();
		$this->load->helper("cli");
	}

	public function index(){
		echo "cli";
	}

	/**
	* 统计环境指标中间表
	* @param $date [string] 开始日期 默认昨天
	* @param $edate [string] 结束日期 默认昨天
	*/
	/*
	温度：电压大于对应传感器极限电压，且数据在0-50°C之内。 
	湿度：电压大于对应传感器极限电压，且数据在0-100%之内
	传感器极限电压：T/H：2.5V ，UV/UX：2.5V，CO2：3.0V，VOC：3.0V，QCM：2.5V
	*/
	public function middleIndex($date="", $edate=""){
		// 统计数据
		function dealData($db, $time){
			$data = array();
			$date = date("Y-m-d", $time);
			// 查询sql
			$sql = "SELECT env_no, MAX(CONVERT(_parameter_,DECIMAL(10,2))) max, MIN(CONVERT(_parameter_,DECIMAL(10,2))) min, SUM(CONVERT(_parameter_,DECIMAL(10,2))) sum, COUNT(CONVERT(_parameter_,DECIMAL(10,2))) count, COUNT(IF(FIND_IN_SET('_parameter_',alert_param),TRUE,NULL)) count_well FROM data_sensor WHERE server_time BETWEEN ? AND ? AND CONVERT(voltage, DECIMAL(10,2)) > 3.0 AND _parameter_ IS NOT NULL _otherwhere_ GROUP BY env_no";
			// 遍历参数
			$param = array("temperature","humidity","voc","co2","light","uv","organic","inorganic","sulfur");
			foreach ($param as $p) {
				$otherwhere = "";
				switch ($p) {
					case 'temperature':
						$otherwhere = " AND CONVERT(temperature, DECIMAL(10,2)) BETWEEN 0 AND 50";
						break;
					case 'humidity':
						$otherwhere = " AND CONVERT(humidity, DECIMAL(10,2)) BETWEEN 0 AND 100";
						break;
					default:
						break;
				}
				$query = str_replace("_parameter_", $p, $sql);
				$query = str_replace("_otherwhere_", $otherwhere, $query);
				$result = $db->query($query, array($time, $time+86400))->result_array();

				if(empty($result)){
					continue;
				}
				foreach ($result as $k => $v) {
					$v['date'] = $date;
					$v['parameter'] = $p;
					$v['count_well'] = $v['count'] - $v['count_well'];
					array_push($data, $v);
				}
			}

			if(empty($data)){
				cli_logs("没有数据", $date);
				return;
			}

			// 开启事务
			$db->trans_begin();
			// 删除旧数据
			$db->where("date", $date)->delete("middle_index");
			// 批量插入
			$res = $db->insert_batch("middle_index", $data);
			if ($db->trans_status() === FALSE){
			    $db->trans_rollback();
			    cli_logs("执行失败", $db->error());
			}else{
			    $db->trans_commit();
			    cli_logs("执行成功", $date, $res);
			}
		}
		$start_time=time();
		$log=array();
		//echo "start ...\n";
		cli_logs("开始执行");
		// 读取数据
		$time = strtotime($date);
		$ystime = strtotime($edate);
		if(!$ystime){
			$ystime = strtotime("yesterday");
		}
		if(!$time){
			$time = $ystime;
		}

		// 日期遍历（从开始日期到昨天）
		while (true) {
			if($time > $ystime) break;
			$d = getdate($time);
			dealData($this->db, $time);
			$log[]=date("Y-m-d", $time);
			//echo date("Y-m-d", $time)."\tok\n";
			$time = mktime(0, 0, 0, $d['mon'], $d['mday']+1, $d['year']);
		}
		cli_logs("执行结束", "\n");
		$end_time=time();
		$log['time']=$end_time-$start_time;
		echo zh_json_encode($log);
		//echo "end\n";
	}

}