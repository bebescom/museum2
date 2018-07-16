<?php
/**
 * Created by PhpStorm.
 * User: HBJ_PC
 * Date: 16-8-31
 * Time: 下午3:49
 */

class Common extends MY_Controller{
	public function __construct(){
		parent::__construct();
	}

	public function equip_type_get(){
		$sql_str = "select distinct(equip_type) from equip ";

		$equip_type = $this->db->query($sql_str)->result_array();
		$equip_types = equip_type('type');
		$sensors = array('温湿度监测终端','带屏温湿度监测终端','有机挥发物监测终端','光照紫外监测终端','二氧化碳监测终端','空气质量监测终端','土壤温湿度监测终端','安防监测终端','震动监测终端');
		if(isset($equip_types['监测终端'])){
			$sensors = $equip_types['监测终端'];
		}
		$controllers = array('调湿机','调湿柜','调湿剂');
		if(isset($equip_types['调控设备'])){
			$controllers = $equip_types['调控设备'];
		}
		$offline = array('手持式温湿度检测仪','手持式光照紫外检测仪','手持式有机挥发物检测仪','手持式二氧化碳检测仪','手持式甲醛检测仪');
		if(isset($equip_types['手持离线设备'])){
			$offline = $equip_types['手持离线设备'];
		}
        $box = array('智能囊匣');
        if(isset($equip_types['智能囊匣'])){
            $box = $equip_types['智能囊匣'];
        }
		$networks = array('网关','中继');
		if(isset($equip_types['网络设备'])){
			$networks = $equip_types['网络设备'];
		}
		$data = array(
			"sensor"=>array(),
			"network"=>array(),
			"controller"=>array(),
			"offline"=>array(),
			"box"=>array()
		);
		if($equip_type){
			foreach($equip_type as $et){
				if(isset($et['equip_type'])&&$et['equip_type']){
					if(in_array($et['equip_type'],$sensors)){
						$data['sensor'][] = $et['equip_type'];
					}else if(in_array($et['equip_type'],$networks)){
						$data['network'][] = $et['equip_type'];
					}else if(in_array($et['equip_type'],$controllers)){
						$data['controller'][] = $et['equip_type'];
					}else if(in_array($et['equip_type'],$offline)){
						$data['offline'][] = $et['equip_type'];
					}else if(in_array($et['equip_type'],$box)){
						$data['box'][] = $et['equip_type'];
					}
				}
			}
		}
		$this->response($data);
	}

	public function all_equip_type_get(){
		$sql = "select equip_type,type from equip_type ";

		$equip_types = $this->db->query($sql)->result_array();
		$data = array();
		if($equip_types){
			foreach ($equip_types as $equip_type) {
				if(!isset($data[$equip_type['type']])){
					$data[$equip_type['type']] = array();
				}
				$data[$equip_type['type']][] = $equip_type['equip_type'];
			}
		}
		$this->response($data);
	}
	public function equip_from_ds()
	{
		$env_no = $this->get_post('env_no');
		$stime = $this->get_post('stime');
		$etime = $this->get_post('etime');

		$where = "1=1";
		if($env_no){
			$env_nos = explode(',',$env_no);
			$where .= " and env_no in ('".implode("','",$env_nos)."')";
		}
		if($stime && $etime){
			$where .= " and equip_time between {$stime} and {$etime}";
		}
//		$this->response(array($where));
		$sql = "select distinct(equip_no) from data_sensor where  {$where}";
		$equips = $this->db->query($sql)->result_array();
		$equip_nos = array();
		if($equips){
			foreach($equips as $equip){
				if(isset($equip['equip_no'])&&$equip['equip_no']){
					$equip_nos[] = $equip['equip_no'];
				}
			}
		}

		$this->response($equip_nos);
	}
} 