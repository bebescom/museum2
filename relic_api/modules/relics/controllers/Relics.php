<?php

class Relics extends MY_Controller
{
    function __construct()
    {
        parent::__construct();
        $this->museum_no = app_config('museum_no');
    }

    function index_get()
    {
        $select = $this->get('select');
        $relic_no = $this->get('relic_no');
        $parent_env_no = $this->get('parent_env_no');
        $level = $this->get('level');
        $category = $this->get('category');
        $age = $this->get('age');
        $sort_by = $this->get_post('sort_by');
		$include_child = $this->get_post("include_child");
		$name = $this->get_post('name');

		$relics = array();
		$envs = API('get/base/envs');
		if(isset($this->_user['data_scope'])&&$this->_user['data_scope']) {
			$env_nos = array();
			if ($this->_user['data_scope'] != "administrator") {
				if(isset($parent_env_no)&&$parent_env_no){
					if(!$include_child){
						if($envs['total']>0){
							$select_envs = explode(',',$parent_env_no);
							foreach($select_envs as $select_env){
								if(in_array($select_env,$this->_user['data_scope'])){
									foreach($envs['rows'] as $env){
										if(isset($env['env_no'])&&$env['env_no']&&in_array($env['env_no'],$this->_user['data_scope'])){
											if(strpos($env['env_no'],$select_env) !== false){
												$env_nos[] = $env['env_no'];
											}
										}
									}
								}
							}
						}
					}else{
						$env_nos = explode(',',$parent_env_no);
						$env_nos = array_intersect($env_nos, $this->_user['data_scope']);
					}
				}else{
					foreach($envs['rows'] as $env){
						if(isset($env['env_no'])&&$env['env_no']&&in_array($env['env_no'],$this->_user['data_scope'])){
							$env_nos[] = $env['env_no'];
						}
					}
				}
			}else{
				if(isset($parent_env_no)&&$parent_env_no){
					if($envs['total']>0){
						$select_envs = explode(',',$parent_env_no);
						if(!$include_child){
							foreach($select_envs as $select_env){
								foreach($envs['rows'] as $env){
									if(isset($env['env_no'])&&$env['env_no']&&strpos($env['env_no'],$select_env) !== false){
										$env_nos[] = $env['env_no'];
									}
								}
							}
						}else{
							$env_nos = $select_envs;
						}
					}
				}else{
					foreach($envs['rows'] as $env){
						$env_nos[] = $env['env_no'];
					}
				}
			}

			$where = '1=1';
			if(isset($env_nos)){
				if(!isset($parent_env_no)||!$parent_env_no){
					$where .= " and (parent_env_no in ('".implode("','",$env_nos)."') or parent_env_no is null)";
				}else{
					$where .= " and parent_env_no in ('".implode("','",$env_nos)."')";
				}

				$sort_by = "";
				if (!isset($sort_by)) {
					$sort_by = "sort asc,level asc";
				}

				if(isset($relic_no)&&$relic_no){
					$relic_nos = explode(',',$relic_no);
					$where .= " and relic_no in ('".implode("','",$relic_nos)."')";
				}
				if(isset($name)&&$name){
					$where .= " and name like '%{$name}%'";
				}

				if(isset($level)&&$level){
					$where .= " and level in ('".implode("','",explode(',',$level))."')";
				}
				if(isset($category)&&$category){
					$where .= " and category in ('".implode("','",explode(',',$category))."')";
				}
				if(isset($material)&&$material){
					$where .= " and material in ('".implode("','",explode(',',$material))."')";
				}
				if(isset($age)&&$age){
					$where .= " and age in ('".implode("','",explode(',',$age))."')";
				}

				if(isset($name)&&$name){
					$where .= " and name like '%".$name."%'";
				}
				if(!$select){
					$select = "*";
				}
				$relics =M("relic")->fetAll($where,$select,$sort_by);
			}
		}

        $data = array(
            'total'=>sizeof($relics),
            'rows'=>$relics
        );
        $this->response($data);
    }


    function relic_one_get($relic_no){
        $m = M('relic');
        $relic = $m->find(array('relic_no'=>$relic_no));

        $this->response($relic) ;
    }

    function delete($relic_no){
		if(!M("common/permission")->check_permission("删除文物",$this->_user)){
			$this->response(array('error' => '无权限删除文物'));
		}
		if($relic_no == ""||!$relic_no){
			$this->response(array('error' => '文物编号不能为空'));
		}
        $m = M('relic');
	    $relic = $m->find("relic_no ='".$relic_no."'");
	    if(!$relic){
		    $this->response(array("result"=>false,"msg"=>"文物不存在"));
	    }

        $ret = $m->delete("relic_no = '".$relic_no."'");
		$result = $ret?array("result"=>true,"msg"=>"删除成功"):array("result"=>false,"msg"=>"删除失败");

        $this->response($result);
    }

    function add_post(){
		if(!M("common/permission")->check_permission("添加文物",$this->_user)){
			$this->response(array('error' => '无权限添加文物'));
		}
	    $relic_id = $this->get_post("relic_id");
	    $parent_env_no = $this->get_post("parent_env_no");
	    $material = $this->get_post("material");
	    $category = $this->get_post("category");
	    $level = $this->get_post("level");
	    $age = $this->get_post("age");
	    $describe = $this->get_post("describe");
	    $status = $this->get_post("status");
	    $name = $this->get_post("name");
	    $threshold = $this->get_post("threshold");

		if(!$this->museum_no){
			$this->response(array('error'=>'博物馆编号为空!'));
		}

		$up_data = array();

		$relic_nos = M("relics")->relic_code();
		$up_data['relic_no'] = $relic_nos[0];
	    if(isset($parent_env_no)&&$parent_env_no){
		    $up_data['parent_env_no'] = $parent_env_no;
	    }
		if(isset($relic_id)&&$relic_id){
			$up_data['relic_id'] = $relic_id;
		}
//		if(isset($threshold)&&$threshold){
//			$relic_threshold = $threshold;
//		}
	    if(isset($material)&&$material){
		    $up_data['material'] = $material;
//			if(!isset($relic_threshold)||!$relic_threshold){
//				$relic_threshold = M("threshold")->find(array("type" =>$material));
//			}
	    }

	    if(isset($category)&&$category){
		    $up_data['category'] = $category;
	    }

	    if(isset($level)&&$level){
		    $up_data['level'] = $level;
	    }

	    if(isset($age)&&$age){
		    $up_data['age'] = $age;
	    }
        if(isset($name)&&$name){
            $up_data['name'] = $name;
        }
	    if(isset($describe)&&$describe){
		    $up_data['describe'] = $describe;
	    }

	    if(isset($status)&&$status){
		    $up_data['status'] = $status;
	    }

	    if($up_data){
		    $ret = M("relic")->add($up_data);
//            if(isset($relic_threshold)&&$relic_threshold){
//                unset($relic_threshold['id']);
//                $relic_threshold['no'] = $up_data['relic_no'];
//                API("post/env/common/threshold/add_edit",$relic_threshold);
//            }
		    $result = $ret?array("result"=>true,"msg"=>"添加成功","relic_no"=>$up_data['relic_no']):array("result"=>true,"msg"=>"添加失败");
		    $this->response($result);
	    }

    }

	/**
	 *获取文物信息，包括基础信息和
	 **/
    function relic_overview_get($relic_no){
        $relic = $this->db->select('relic.*,relic_show.start_time,relic_show.end_time')
            ->where(array('relic.relic_no'=>$relic_no))
            ->join('relic_show','relic_show.relic_no = relic.relic_no','left')
            ->limit(1)
            ->get('relic')->row_array();
		if(!$relic){
			$this->response(array('error'=>'查无此文物'));
		}
		if(isset($this->_user['data_scope'])&&$this->_user['data_scope']) {
			if ($this->_user['data_scope'] != "administrator") {
				if(isset($relic['parent_env_no'])&&$relic['parent_env_no']&&!in_array($relic['parent_env_no'],$this->_user['data_scope'])){
					$this->response(array('error'=>'无权限查看该文物信息'));
				}
			}
		}
        if($relic){
            $day = 24 * 3600;
            if(isset($relic['start_time'])){
				$relic['show_days'] = round((time() - $relic['start_time'])/$day);
				$relic['start_time'] = date('Y-m-d',$relic['start_time']);
            }
            if(isset($relic['end_time'])){
				$relic['rest_days'] = round(($relic['end_time'] - time())/$day);
				$relic['end_time'] = date('Y-m-d',$relic['end_time']);
            }
        }
        $this->response($relic);
    }

	public function relic_get_nolgin(){

		$relic_no = $this->get('relic_no');
		$parent_env_no = $this->get('parent_env_no');
		$level = $this->get('level');
		$category = $this->get('category');
		$age = $this->get('age');
		$sort_by = $this->get_post('sort_by');


		$search_array = array();
		if(isset($parent_env_no)&&$parent_env_no){
			$env_nos = explode(",",$parent_env_no);
			$this->db->where_in('parent_env_no',$env_nos);
		}

		if (!isset($sort_by)) {
			$sort_by = "sort asc,name asc";
		}

		if(isset($select) && $select){
			$this->db->select($select);
		}

		if(isset($relic_no)){
			$relic_nos = explode(',',$relic_no);
			$this->db->where_in('relic_no',$relic_nos);
		}

		if(isset($level)){
			$relic_level = explode(',',$level);
			$this->db->where_in('level',$relic_level);
		}
		if(isset($category)){
			$this->db->where(array('category'=>$category));
		}
		if(isset($age)){
			$this->db->where(array('age'=>$age));
		}

		$relics = $this->db->order_by($sort_by)->get('relic')->result_array();

		$data = array(
			'total'=>sizeof($relics),
			'rows'=>$relics
		);
		$this->response($data);
	}
}