<?php
/**
 * Created by PhpStorm.
 * User: HBJ_PC
 * Date: 16-9-14
 * Time: 下午1:38
 */

class Alerts extends MY_Controller{

	public function __construct(){
		parent::__construct();
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

	public function alerts_count_get(){
		$envs = API("get/base/envs/");
		$env_name = array();
		$env_nos = array();
		if(isset($envs['rows'])&&$envs['rows']){
			foreach($envs['rows'] as $env){
				if(isset($env['env_no'])&&$env['env_no']){
					$env_nos[] = $env['env_no'];
					if(isset($env['name'])&&$env['name']){
						$env_name[$env['env_no']] = $env['name'];
					}
				}
			}
		}
		$data = array(
			"count"=>0,
			"total"=>0,
			"rows"=>array()
		);
		if($env_nos){
			$sql_str = "select count(distinct(env_no))  as count from alert where clear_time is null and env_no in ('".implode("','",$env_nos)."')";
			$ret = $this->db->query($sql_str)->row_array();
			$count = isset($ret['count'])?$ret['count']:0;

			$sql = "select count(*) as count,env_no from alert where clear_time is null and env_no in ('".implode("','",$env_nos)."') group by env_no order by count desc limit 7";

			$alerts = $this->db->query($sql)->result_array();
			if($alerts){
				foreach($alerts as $k=>$alert){
					$alerts[$k]['env_name'] = "";
					if(isset($alert['env_no'])&&$alert['env_no']){
						if(isset($env_name[$alert['env_no']])&&$env_name[$alert['env_no']]){
							$alerts[$k]['env_name'] = $env_name[$alert['env_no']];
						}
					}
				}
			}

			$data['count'] = $count;
			$data['total'] = sizeof($alerts);
			$data['rows'] = $alerts;
		}

		$this->response($data);
	}

	/**
	* 环境预警列表
	 **/
	public function alerts_lists_get()
	{
		$page = $this->get_post("page");
		$limit = $this->get_post("limit");
		$env_no = $this->get_post("env_no");
		$param = $this->get_post("param");
		$relic_no = $this->get_post("relic_no");
		$id = $this->get_post('id');
		$alert_time = $this->get_post("alert_time");
		$clear_time = $this->get_post("clear_time");
		$clear = $this->get_post("clear");
		$index = $this->get_post("index");

		if(!$page){
			$page = 1;
		}

		if(!$limit){
			$limit = 10;
		}

		$envs = API("get/base/envs/");
		$env_name = array();
		$env_nos = array();//所有环境编号
		$id_env_nos = array();//通过id模糊查询出来的环境编号
		if(isset($envs['rows'])&&$envs['rows']){
			foreach($envs['rows'] as $env){
				if(isset($env['env_no'])&&$env['env_no']){
					if(isset($id)&&$id){
						if(isset($env['name'])&&$env['name']){
							if(strpos($env['name'],(string)$id) !== false){
								$id_env_nos[] = $env['env_no'];
							}
						}
					}
					$env_nos[] = $env['env_no'];
					if(isset($env['name'])&&$env['name']){
						$env_name[$env['env_no']] = $env['name'];
					}
				}
			}
		}

		$where = "1=1";
		$select_relic_no = array();
		$relics = array();
		if(isset($this->_user['data_scope'])&&($this->_user['data_scope'] == "administrator" || !empty($this->_user['data_scope']))){
			if($this->_user['data_scope'] != "administrator" ){
				$select_env_nos = array_intersect($env_nos,$this->_user['data_scope']);
			}
			if(isset($env_no)&&$env_no){
				$select_env_nos = isset($select_env_nos)?array_intersect($select_env_nos,explode(",",$env_no)):explode(",",$env_no);
			}

			if(isset($select_env_nos)&&$select_env_nos){
				$where .= " and alert.env_no in ('".implode("','",$select_env_nos)."')";
			}
			if(isset($relic_no)&&$relic_no){
				$where .= " and relic_no in ('".implode("','",explode(',',$relic_no))."')";
			}
			if(isset($id)&&$id){
				$relics = API('get/relic/relics',array('name'=>$id));
				if(isset($relics['rows'])&&$relics['rows']){
					foreach ($relics['rows'] as $row) {
						if(isset($row['relic_no'])&&$row['relic_no']){
							if(!in_array($row['relic_no'],$select_relic_no)){
								$select_relic_no[] = $row['relic_no'];
								$relics[$row['relic_no']] = $row['name'];
							}
						}
					}
				}

				$or_where  = "";
				if($select_relic_no){
					$or_where .= " relic_no in ('".implode("','",$select_relic_no)."')";
				}
				if($id_env_nos){
					if($or_where){
						$or_where .= " or alert.env_no in ('".implode("','",$id_env_nos)."')";
					}else{
						$or_where .= " alert.env_no in ('".implode("','",$id_env_nos)."')";
					}
				}

				if($or_where){
					$where .= " and ({$or_where})";
				}
			}


			if(isset($param)&&$param){
				$where .= " and alert_param in ('".implode("','",explode(",",$param))."')";
			}

			if(isset($alert_time)&&$alert_time){
				switch($alert_time){
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
						$time_array = explode(',',$alert_time);
						$s_time = $time_array[0];
						$e_time = $time_array[1];
						break;
				}
				$where .= " and alert_time between ".$s_time ." and ".$e_time;
			}

			if(isset($clear_time)&&$clear_time){
				switch($clear_time){
					case '24h':
						$clear_e_time = time();
						$clear_s_time = $clear_e_time - 24 * 3600;
						break;
					case 'today':
						$clear_s_time = strtotime('today');
						$clear_e_time = time();
						break;
					case 'yesterday':
						$clear_s_time = strtotime('yesterday');
						$clear_e_time = $clear_s_time + 24*3600;
						break;
					case 'week':
						$today = date("Y-m-d");
						$week = date('w',strtotime($today));
						$clear_s_time = strtotime($today ."-".($week ? $week - 1 : 6).' days');
						$clear_e_time = time();
						break;
					case 'month':
						$clear_e_time = time();
						$clear_s_time = mktime(0,0,0,date("m"),1,date("Y"));
						break;
					default:
						$time_array = explode(',',$alert_time);
						$clear_s_time = $time_array[0];
						$clear_e_time = $time_array[1];
						break;
				}
				$where .= " and clear_time between ".$clear_s_time ." and ".$clear_e_time;
			}

			if($clear){
				$where .= " and clear_time is null";
			}

			$offset = ($page-1)*$limit;
			$count = M("alert")->count($where);
//			$alerts = M("alert")->fetAll($where,"*","alert_time desc",$offset,$limit);
			$alerts = $this->db->select("alert.*,equip.equip_type")->join('equip','equip.equip_no = alert.equip_no','left')->where($where)->order_by('alert_time',"desc")->limit($limit,$offset)->get('alert')->result_array();
			$navs = array();
			if($alerts){
				foreach($alerts as $k=>$alert){
					if(isset($alert['alert_param'])&&$alert['alert_param']){
						if(isset($this->param[$alert['alert_param']])){
							$param = $this->param[$alert['alert_param']];
							$alerts[$k]['content'] = $param['name'].$alert['content'].$param['unit'];
						}else if($alert['alert_param'] == "box_open_alert"){
							if($alert['content'] == ""){
								$alerts[$k]['content'] = "非法开盖";
							}
						}else if($alert['alert_param'] == "move_alert"){
							if($alert['content'] == ""){
								$alerts[$k]['content'] = "异常震动";
							}
						}
					}

					if(isset($alert['alert_time'])&&$alert['alert_time']){
						$alerts[$k]['alert_time'] = date("Y-m-d H:i",$alert['alert_time']);
					}

					if(isset($alert['clear_time'])&&$alert['clear_time']){
						$alerts[$k]['clear_time'] = date("Y-m-d H:i",$alert['clear_time']);
						$alerts[$k]['clear'] = true;
					}else{
						$alerts[$k]['clear'] = false;
					}

					$alerts[$k]['nav'] = "";
					if(isset($alert['env_no'])&&$alert['env_no']){
						if(isset($navs[$alert['env_no']])){
							$alerts[$k]['nav'] = $navs[$alert['env_no']];
						}else{
							$nav = API('get/base/envs/navigation/'.$alert['env_no']);
							$alerts[$k]['nav'] = isset($nav['rows'])?$nav['rows']:"";
							$navs[$alert['env_no']] = $nav['rows'];
						}
					}

					$alerts[$k]['relic_name'] = "";
					if(isset($alert['relic_no'])&&$alert['relic_no']){
						if(!isset($relics[$alert['relic_no']])){
							$relic = API('get/relic/relics/relic_one/'.$alert['relic_no']);
							if(isset($relic['relic_no'])&&!isset($relics[$relic['relic_no']])){
								if(isset($relic['name'])){
									$relics[$relic['relic_no']] = $relic['name'];
								}
							}
						}
						$alerts[$k]['relic_name'] = isset($relics[$alert['relic_no']])?$relics[$alert['relic_no']]:"";
					}
				}
			}
		}

		$data = array(
			"index"=>$index
		);
		$data['count'] = isset($count)?$count:0;
		$data['total'] = isset($alerts)?sizeof($alerts):0;
		$data['rows'] = isset($alerts)?$alerts:array();
		$this->response($data);
	}

	public function clear_post($id)
	{
		if(!M("common/permission")->check_permission("处理报警",$this->_user)){
			$this->response(array('error' => '无权限处理报警'));
		}
		$remark = $this->get_post("remark");
		$clear_time = $this->get_post("clear_time");
		if(!$clear_time){
			$clear_time = time();
		}else{
			$clear_time = strtotime($clear_time);
		}

		$alert = M("alert")->update(array("clear_time"=>$clear_time,"remark"=>$remark),"id = ".$id);

		if($alert){
			$this->response(array("result"=>true,"msg"=>"处理成功"));
		}else{
			$this->response(array("result"=>false,"msg"=>"处理失败"));
		}
	}


	public function alert_count_get()
	{
		$clear = $this->get_post('clear');
		$where = "1=1";
		if($clear){
			$where .= " and clear_time is null";
		}
		$sql = "select alert_param,count(*) as param_count from alert where {$where} group by alert_param";
		$param_count = $this->db->query($sql)->result_array();

		$data = array(
			'param'=>array(),
			'alert_time'=>array()
		);
		if($param_count){
			foreach ($param_count as $count) {
				if(isset($count['alert_param'])&&isset($count['param_count'])){
					$data['param'][] = array(
						'name'=>$count['alert_param'],
						'count'=>(int)$count['param_count']
					);
				}
			}
		}

		//时间统计
		$yesterday_count = M("alert")->count($where." and alert_time >= ".strtotime('yesterday')." and alert_time < ".strtotime('today'));
		$today_count = M("alert")->count($where." and alert_time >= ".strtotime('today'));
		$today = date("Y-m-d");
		$week_start = strtotime($today ."-".(date('w',strtotime($today)) ? date('w',strtotime($today)) - 1 : 6).' days');
		$week_end = time();
		$week_count = M("alert")->count($where." and alert_time >= ".$week_start." and alert_time <= ".$week_end);
		$month_end  = time();
		$month_start = mktime(0,0,0,date("m"),1,date("Y"));
		$month_count = M("alert")->count($where." and alert_time >= ".$month_start." and alert_time <= ".$month_end);

		if($yesterday_count){
			$data['alert_time'][] = array(
				'name'=>'yesterday',
				'count'=>$yesterday_count
			);
		}
		if($today_count){
			$data['alert_time'][] = array(
				'name'=>'today',
				'count'=>$today_count
			);
		}
		if($week_count){
			$data['alert_time'][] = array(
				'name'=>'week',
				'count'=>$week_count
			);
		}
		if($month_count){
			$data['alert_time'][] = array(
				'name'=>'month',
				'count'=>$month_count
			);
		}

		$this->response($data);
	}

	public function alert_unknown_get()
	{
		$index = $this->get_post("index");
//		$check_time = API('get/base/users/active/',array("key"=>"查看预警"));
//		$start_time = time() - 24*2600;
//		if(isset($check_time['env'])&&isset($check_time['env']['last_time'])){
//			$start_time = $check_time['env']['last_time'];
//		}

		$where = " clear_time is null";
		$alert_count = M("alert")->count($where);
//		$alerts = M("alert")->fetAll($where,"env_no,equip_no,alert_val,alert_time,alert_param,content","alert_time desc",0,5);
//		if($alerts){
//			foreach ($alerts as $key=>$alert) {
//				if(isset($alert['alert_time'])){
//					$alerts[$key]['alert_time'] = date("Y-m-d H:i",$alert['alert_time']);
//				}
//			}
//		}
		$data = array(
			'index'=>$index,
			'total'=>$alert_count,
			'rows'=>array()
		);
		$this->response($data);
	}

}