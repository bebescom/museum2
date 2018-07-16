<?php
/**
 * Created by PhpStorm.
 * User: HBJ_PC
 * Date: 16-9-3
 * Time: 下午2:22
 */

class Monitor_model extends MY_Model{

	function get_param_standard(){
		$param_standard = M("param_standard")->fetAll();

		return $param_standard;
	}

	function time_change($time){
		$time_int = array();
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
					$e_time = strtotime('today');
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
					$s_time = "";
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
			$s_time = strtotime('yesterday');
			$e_time = strtotime('today');
		}
		if(!$s_time){
			$s_time = strtotime('yesterday');
		}

		if(!$e_time){
			$e_time = strtotime('today');
		}
		$time_int = array(
			"s_time"=>$s_time,
			"e_time"=>$e_time
		);
		return $time_int;
	}

	function statistic($pdata,$threshold=array()){
		$env_model = M("environments/env");
		$temp = array();
		foreach ($pdata as $pp=>$pv) {
			$temp[$pp] = array(
				'threshold'=>"-",
				'extremum'=>"-",
				'average'=>"-",
				'standard_reach'=>"-",
				'cv'=>"-",
				'diff'=>"-",
				'max_fluctuate'=>"-",
				'avg_fluctuate'=>"-"
			);
			if(isset($pv['all'])&&$pv['all']){
				$average = array_sum($pv['all'])/sizeof($pv['all']);
				$temp[$pp]['average'] = deal_data_decimal($pp,$average);
				$min = deal_data_decimal($pp,min($pv['all']));
				$max = deal_data_decimal($pp,max($pv['all']));
				$temp[$pp]['extremum'] = $min." ~ ".$max;
				$temp[$pp]['diff'] = deal_data_decimal($pp,$max -$min);
				$sd = deal_data_decimal($pp,$env_model->get_standard_deviation($pv['all']));
				$temp[$pp]['cv']=0;
				if($average){
					$temp[$pp]['cv'] = deal_data_decimal($pp,$sd/$average * 100);
				}
				$temp[$pp]['standard_reach'] = 100;
				if(isset($pv['alert'])&&$pv['alert']){
					$temp[$pp]['standard_reach'] -= round(sizeof($pv['alert'])/sizeof($pv['all'])*100,2);
				}
			}
			if(isset($pv['by_date'])&&$pv['by_date']){
				$ex_array = array();//日波动数组
				foreach($pv['by_date'] as $pv_bd){
					if($pv_bd){
						$ex = deal_data_decimal($pp,max($pv_bd) - min($pv_bd));
						$ex_array[] = $ex;
					}
				}
				if($ex_array){
					$temp[$pp]['max_fluctuate'] = deal_data_decimal($pp, max($ex_array));
					$temp[$pp]['avg_fluctuate'] = deal_data_decimal($pp,array_sum($ex_array)/sizeof($ex_array));
				}
			}
			if(isset($threshold)&&$threshold){
				$thres_min = "";
				$thres_max = "";
				if(isset($threshold[$pp."_min"])&&!is_null($threshold[$pp."_min"])){
					$thres_min = $threshold[$pp."_min"];
				}
				if(isset($threshold[$pp."_max"])&&$threshold[$pp."_max"]){
					$thres_max = $threshold[$pp."_max"];
				}
				if(in_array($pp,array('humidity','temperature','soil_humidity','soil_temperature','soil_conductivity','soil_salt'))){
					$temp[$pp]['threshold'] = ($thres_max || $thres_min)?($thres_min." ~ ".$thres_max):"-";
				}else{
					if(isset($threshold["qcm_".$pp."_max"])){
						$temp["qcm_".$pp]['threshold'] = "≤".$threshold["qcm_".$pp."_max"];
					}
					if(isset($threshold["total_light"])){
						$temp["total_light"]['threshold'] = "≤".$threshold["total_light"];
					}
					$temp[$pp]['threshold'] = "≤".$thres_max;
				}
			}
		}

		return $temp;
	}



} 