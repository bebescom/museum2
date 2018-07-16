<?php
/**
 * Created by PhpStorm.
 * User: HBJ_PC
 * Date: 16-8-31
 * Time: 上午10:48
 */

class Data extends MY_Controller{

	function __construct(){
		parent::__construct();
		$this->order_time = "equip_time";
	}

	public function new_data_get(){

		$env_no = $this->get_post("env_no");
		$equip_no = $this->get_post("equip_no");

		$where = "1=1";

		if(isset($env_no)&&$env_no){
			$where .= " and env_no = '".$env_no."'";
		}

		if(isset($equip_no)&&$equip_no){
			$where .= " and equip_no = '".$equip_no."'";
		}

		$data = M("data_sensor")->find($where,"*",$this->order_time." desc");
		$this->response($data);
	}

	public function  data_by_time_get(){
		$equip_no = $this->get_post("equip_no");
		$env_no = $this->get_post("env_no");
		$s_time = $this->get_post("s_time");
		$e_time = $this->get_post("e_time");

		$where = "1=1";
		if(isset($equip_no)&&$equip_no){
			$where .= " and equip_no = '".$equip_no."'";
		}

		if(isset($env_no)&&$env_no){
			$where .= " and env_no = '".$env_no."'";
		}

		$regex = "/^(\\d{4})-(0\\d{1}|1[0-2])-(0\\d{1}|[12]\\d{1}|3[01]) (0\\d{1}|1\\d{1}|2[0-3]):[0-5]\\d{1}:([0-5]\\d{1})$/";
		if(isset($s_time)&&$s_time){
			if(preg_match($regex,$s_time)){
				$s_time = strtotime($s_time);
			}

			$where .= " and ".$this->order_time." > ".$s_time;
		}

		if(isset($e_time)&&$e_time){
			if(preg_match($regex,$e_time)){
				$e_time = strtotime($e_time);
			}
			$where .= " and ".$this->order_time." <= ".$e_time;
		}

		$data_sensor = M("data_sensor")->fetAll($where,"*",$this->order_time." desc");
		$data = array(
			"total"=>sizeof($data_sensor),
			"rows"=>$data_sensor,
		);

		$this->response($data);
	}

} 