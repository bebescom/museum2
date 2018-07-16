<?php
/**
 * Created by PhpStorm.
 * User: HBJ_PC
 * Date: 16-8-23
 * Time: 上午10:04
 */

class Box extends MY_Controller{

	public function __construct(){
		parent::__construct();
		$this->data_order = "equip_time";
	}

	public function box_lists_get($page=1,$limit=''){
		if(!M("common/permission")->check_permission("查看囊匣列表",$this->_user)){
			$this->response(array('error' => '无权限查看囊匣列表'));
		}
		$parent_env_no = $this->get_post("parent_env_no");

		$env_nos = array();
		if(isset($parent_env_no)&&$parent_env_no){
			$env_nos = M("common/common")->get_all_children($parent_env_no);
		}
		$count_where = "1=1";
		if($env_nos){
			$count_where .= " and parent_env_no in ('".implode("','",$env_nos)."')";
		}
		//囊匣统计
		$envs_count = M('box')->fetAll($count_where);
		$count = 0;
		$alert_count = 0;
		$box_no = array();
		$count = sizeof($envs_count);
		if(isset($envs_count)&&$envs_count){
			foreach($envs_count as $ec){
				if(isset($ec['alert_status'])&&$ec['alert_status']){
					$alert_count++;
				}
				if(isset($ec['env_no'])&&$ec['env_no']){
					$box_no[] = $ec['env_no'];
				}
			}
		}
		$thre = array();
		if($box_no){
			$thresholds = M("threshold")->fetAll("no in ('".implode("','",$box_no)."')");
			if($thresholds){
				foreach($thresholds as $threshold){
					if(isset($threshold['no'])&&$threshold['no']){
						$thre[$threshold['no']] = $threshold;
					}
				}
			}
		}

		$envs = API("get/base/envs");
		$navs = array();

		$where = "1=1";
		if($env_nos){
			$where .= " and parent_env_no in ('".implode("','",$env_nos)."')";
		}
		if(!$limit){
			$limit = 10;
		}

		if(!$page){
			$page = 1;
		}
		$offset = ($page - 1)*$limit;

		$data = array();
		//分页获取
		$boxes =  M('box')->fetAll($where,"*","alert_status desc",$offset,$limit);
		$data['page'] = $page;
		$data['count'] = $count;
		$data['alert_count'] = $alert_count;
		if(isset($boxes)&&$boxes){
			foreach($boxes as $key=>$env){
				if(isset($env['parent_env_no'])&&$env['parent_env_no']){
					if(isset($navs[$env['parent_env_no']])){
						$boxes[$key]['nav'] = $navs[$env['parent_env_no']];
					}else{
						$nav = M('common/common')->navigation($envs['rows'],$env['parent_env_no']);
						$boxes[$key]['nav'] = $nav;
						$navs[$env['parent_env_no']] = $nav;
					}
				}

				$new_data = M("data_sensor")->find("equip_no = '".$env['env_no']."'","temperature,humidity,env_no,alert_param",$this->data_order." desc");
//				$this->response($new_data);
				$boxes[$key]['temperature'] = isset($new_data['temperature'])?round($new_data['temperature'],1):"";
				$boxes[$key]['humidity'] = isset($new_data['humidity'])?round($new_data['humidity'],1):"";
				$boxes[$key]['alert_diff'] = "";
				$boxes[$key]['alert'] = "";
				if(isset($env['alert_param'])&&$env['alert_param']){
					$alert_param = explode(',',$env['alert_param']);
					if(in_array("box_open_alert",$alert_param)){
						$boxes[$key]['alert'] = "box_open_alert";
					}else if(in_array("move_alert",$alert_param)){
						$boxes[$key]['alert'] = "move_alert";
					}else if(in_array("humidity",$alert_param)){
						$boxes[$key]['alert'] = "humidity";
						$boxes[$key]['alert_diff'] = $this->alert_diff($thre,$env['env_no'],"humidity",$boxes[$key]['humidity']);
					}else if(in_array("temperature",$alert_param)){
						$boxes[$key]['alert'] = "temperature";
						$boxes[$key]['alert_diff'] = $this->alert_diff($thre,$env['env_no'],"temperature",$boxes[$key]['temperature']);
					}
				}
			}
		}

		$data['rows'] = $boxes;

		$this->response($data);
	}

	function alert_diff($threshold,$no,$param,$val){
		$alert_diff = 0;
		if(isset($threshold[$no])&&$threshold[$no]){
			$max = "";
			$min = "";
			if(isset($threshold[$no][$param.'_max'])&&$threshold[$no][$param.'_max']){
				$max = $threshold[$no][$param.'_max'];
			}
			if(isset($threshold[$no][$param.'_min'])&&$threshold[$no][$param.'_min']){
				$min = $threshold[$no][$param.'_min'];
			}

			if($max && $val>$max){
				$alert_diff =  $val - $max;
			}
			if($min && $val<$min){
				$alert_diff =  $val - $min;
			}
		}

		return $alert_diff;
	}

	public function clear_alert_post($env_no){
		if(!M("common/permission")->check_permission("清除囊匣预警",$this->_user)){
			$this->response(array('error' => '无权限清除囊匣预警'));
		}
		$remark = $this->get_post("remark");
		$box = API('get/base/envs/boxes',array("env_no"=>$env_no));

		if(isset($box['total'])&&$box['total'] == 0){
			$this->response(array("result"=>false,"msg"=>"囊匣不存在"));
		}else{
			if(isset($box['rows'])&&$box['rows']){
				$up = array("env_no"=>$env_no,"alert_status"=>0,"alert_param"=>"");
				$ret = API("post/base/envs/boxes/box_edit",$up);

				$alert = M("alert")->update(array("clear_time"=>time(),"remark"=>$remark),"env_no = '".$env_no."' and clear_time is null");

				if($alert&&$ret){
					$this->response(array("result"=>true,"msg"=>"处理成功"));
				}else{
					$this->response(array("result"=>false,"msg"=>"处理失败"));
				}
			}
		}

	}

	public function alert_list_get($env_no=null){

		$page = $this->get_post("page");
		$limit = $this->get_post("limit");

		if(!$page){
			$page = 1;
		}
		if(!$limit){
			$limit = 10;
		}
		$offset = ($page-1)*$limit;
		$where = "1=1";
		if($env_no){
			$where .= " and env_no = '".$env_no."'";
		}
		$alerts = M("alert")->fetAll($where,"*","alert_time desc",$offset,$limit);
		$count = M("alert")->count($where);
		$data = array(
			"count"=>$count,
			"total"=>0,
			"page"=>$page,
			"rows"=>array()
		);
		if($alerts){
			$data['total'] = sizeof($alerts);
			foreach($alerts as $key=>$alert){
				if(isset($alert['alert_time'])&&$alert['alert_time']){
					$alerts[$key]["alert_time"] = date("Y-m-d H:i",$alert['alert_time']);
				}

				if(isset($alert['clear_time'])&&$alert['clear_time']){
					$alerts[$key]["clear_time"] = date("Y-m-d H:i",$alert['clear_time']);
				}
			}

			$data['rows'] = $alerts;
		}

		$this->response($data);
	}

	public function box_alert_get($env_no){
		$box = API('get/base/envs/boxes',array("env_no"=>$env_no));
		$data = array();
		$alert_key = array(
			"move_alert"=>"异常震动",
			"box_open_alert"=>"非法开盖",
			"temperature"=>"温度超标",
			"humidity"=>"湿度超标",
		);
		$data =array();
		if(isset($box['rows'])&&$box['rows']){
			$b = $box['rows'][0];
			$alert = M("alert")->find("env_no = '".$env_no."' and clear_time is null ","*","alert_time desc");
			$b['alert_time'] = "";
			if(isset($alert['alert_time'])&&$alert['alert_time']){
				$b['alert_time'] = date("Y-m-d H:i",$alert['alert_time']);
			}

			if(isset($b['alert_param'])&&$b['alert_param']){
				$alert_param = explode(",",$b['alert_param']);
				$temp =array();
				foreach($alert_param as $ap){
					if(isset($alert_key[$ap])){
						$temp[] = $alert_key[$ap];
					}
				}
				$b['alert_param'] = implode(",",$temp);
			}
			$data = $b;
		}

		$this->response($data);
	}

}