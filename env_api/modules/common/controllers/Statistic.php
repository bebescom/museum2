<?php
/**
 * Created by PhpStorm.
 * User: HBJ_PC
 * Date: 16-9-12
 * Time: 上午10:38
 */

class Statistic extends MY_Controller{

	public function param_standard_get_nologin($stime = null,$etime = null){

		if(!$stime){
			$stime = strtotime("yesterday");
		}

		if(!$etime){
			$etime = strtotime("today");
		}

		$where = "equip_time between ".$stime." and ".$etime;
		$alert_count = M("data_sensor")->count("alert_param is not null and ".$where);
		$count = M("data_sensor")->count($where);

		$result = "100";
		if($count){
			$result = round(($count-$alert_count)/$count * 100,2);
		}
		$this->response($result);
	}

	public function cv_get_nologin($stime = null,$etime = null){
		if(!$stime){
			$stime = strtotime("yesterday");
		}

		if(!$etime){
			$etime = strtotime("today");
		}
		$where = "equip_time between ".$stime." and ".$etime;
		$data_sensor = M("data_sensor")->fetAll($where,"temperature,humidity");
//		$average = M("data_sensor")->fetAll($where,"avg(temperature) as temperature,avg(humidity) as humidity");
		$pdata = array();
		if($data_sensor){
			foreach($data_sensor as $ds){
				foreach($ds as $p=>$v){
					if(!isset($pdata[$p])){
						$pdata[$p] = array();
					}
					if($v){
						$pdata[$p][] = $v;
					}
				}
			}
		}

		$data = array(
			"temperature"=>0,
			"humidity"=>0
		);
		if($pdata){
			foreach($pdata as $pp=>$pv){
				$average = round(array_sum($pv)/sizeof($pv),2);
				$sd = M("environments/env")->get_standard_deviation(array_values($pv));
				$data[$pp] = round($sd/$average*100,2);
			}
		}
		$this->response($data);
	}
} 