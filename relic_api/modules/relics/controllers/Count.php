<?php

class Count extends MY_Controller
{
	/**
	 *根据文物等级统计文物数量,一般文物和未定级文物统称为其他文物
	 **/
    function relics_level_count_get($floor_no,$return=null)
    {
        $envs = API('get/base/envs');
        $env_nos = array();
		if(isset($floor_no)&&$floor_no){
			$envs = API('get/base/envs');
			if($envs['total']>0){
				$select_nos = explode(",",$floor_no);
				foreach ($select_nos as $select_no) {
					foreach($envs['rows'] as $env){
						if(isset($env['env_no'])&&$env['env_no']){
							if(strpos($env['env_no'],$select_no) !== false){
								$env_nos[] = $env['env_no'];
							}
						}
					}
				}
			}
		}
        $relics = array();
       if($env_nos){
           $relics = $this->db->select('level ,count(*) as count,count(relic_borrow.id) as b_count')->where_in('parent_env_no',$env_nos)
               ->join("relic_borrow","relic_borrow.relic_no = relic.relic_no","left")
               ->group_by('level')->get('relic')->result_array();
       }
       if($return == "inner"){
	       return $relics;
       }else{
	       $this->response($relics);
       }
    }


	/**
	 *按文物等级统计文物数据量，包含借调文物
	 **/
    function relics_level_get($env_no){
        $data = array(
            "一级文物"=>0,
            "二级文物"=>0,
            "三级文物"=>0,
            "一般文物"=>0,
            "未定级文物"=>0,
            "借调文物"=>0
        );

        $relics = $this->relics_level_count_get($env_no,"inner");
        if(!isset($relics['error'])&&$relics){
            foreach($relics as $relic){
                if(isset($relic['level']) && $relic['level']){
                    $data[$relic['level']] = $relic['count'] - $relic['b_count'];
                    $data['借调文物'] += $relic['b_count'];
                }
            }
        }

        $this->response($data);
    }

	public function age_count_get(){

		$parent_env_no = $this->get_post("parent_env_no");
		$category = $this->get_post("category");
		$material = $this->get_post("material");
		$level = $this->get_post("level");
		$age = $this->get_post("age");
		$name = $this->get_post("name");
		$relic_no = $this->get_post("relic_no");
		$status = $this->get_post("status");
		$index = $this->get_post("index");
        $search_array = array();

        if(isset($parent_env_no)&&$parent_env_no){
			$envs = API('get/base/envs');
			if($envs['total']>0){
				$select_envs = explode(',',$parent_env_no);
				foreach($select_envs as $select_env){
					foreach($envs['rows'] as $env){
						if(isset($env['env_no'])&&$env['env_no']){
							if(strpos($env['env_no'],$select_env) !== false){
								$env_nos[] = $env['env_no'];
							}
						}
					}
				}
			}
        }

		$data = array(
			'index'=>$index
		);
		$where = "1=1";
		if(isset($this->_user['data_scope'])&&$this->_user['data_scope']) {
			if ($this->_user['data_scope'] != "administrator") {
				if (isset($env_nos) && $env_nos) {
					$env_nos = array_intersect($env_nos, $this->_user['data_scope']);
				} else {
					$env_nos = $this->_user['data_scope'];
				}
			}
			if(isset($env_nos)){
				if(!$parent_env_no){
					$env_nos[] = "";
				}
				$where .= " and parent_env_no in ('".implode("','",$env_nos)."')";
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
			if(isset($status)&&$status){
				$where .= " and status in ('".implode("','",explode(',',$status))."')";
			}
			if(isset($name)&&$name){
				$where .= " and name like '%".$name."%'";
			}

			if(isset($relic_no)&&$relic_no){
				$where .= " and relic_no = '".$relic_no."'";
			}

			$sql_str = "select count(*) as quantity,age from relic where ".$where." group by age order by quantity desc";
			$group = $this->db->query($sql_str)->result_array();
			$i = 1;
			$other = 0;
			if($group){
				foreach($group as $g){
					if(sizeof($group) == 7){
						if($g['age']){
							$data[$g['age']] = $g['quantity'];
						}else{
							$data['其它'] = $g['quantity'];
						}
					}else{
						if($i>6){
							$other += $g['quantity'];
							$data['其它'] = $other;
						}else{
							if($g['age']){
								$data[$g['age']] = $g['quantity'];
							}else{
								if(!isset($data['未知年代'])){
									$data['未知年代'] = 0;
								}
								$data['未知年代'] +=$g['quantity'];
							}
						}
					}
					$i++;
				}
			}
		}

		$this->response($data);
	}

	public function category_count_get(){
		$parent_env_no = $this->get_post("parent_env_no");
		$category = $this->get_post("category");
		$material = $this->get_post("material");
		$level = $this->get_post("level");
		$age = $this->get_post("age");
		$name = $this->get_post("name");
		$status = $this->get_post("status");
		$relic_no = $this->get_post("relic_no");
		$index = $this->get_post("index");

        $search_array = array();
        if(isset($parent_env_no)&&$parent_env_no){
			$envs = API('get/base/envs');
			if($envs['total']>0){
				$select_envs = explode(',',$parent_env_no);
				foreach($select_envs as $select_env){
					foreach($envs['rows'] as $env){
						if(isset($env['env_no'])&&$env['env_no']){
							if(strpos($env['env_no'],$select_env) !== false){
								$env_nos[] = $env['env_no'];
							}
						}
					}
				}
			}
        }

		$data = array(
			'index'=>$index
		);
		$where = "1=1";
		if(isset($this->_user['data_scope'])&&$this->_user['data_scope']) {
			if ($this->_user['data_scope'] != "administrator") {
				if (isset($env_nos) && $env_nos) {
					$env_nos = array_intersect($env_nos, $this->_user['data_scope']);
				} else {
					$env_nos = $this->_user['data_scope'];
				}
			}
			if(isset($env_nos)){
				if(!$parent_env_no){
					$env_nos[] = "";
				}
				$where .= " and parent_env_no in ('".implode("','",$env_nos)."')";
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
			if(isset($status)&&$status){
				$where .= " and status in ('".implode("','",explode(',',$status))."')";
			}
			if(isset($name)&&$name){
				$where .= " and name like '%".$name."%'";
			}

			if(isset($relic_no)&&$relic_no){
				$where .= " and relic_no = '".$relic_no."'";
			}

			$sql_str = "select count(*) as quantity,category from relic where ".$where." group by category order by quantity desc";
			$group = $this->db->query($sql_str)->result_array();

			$i = 1;
			$other = 0;
			if($group){
				foreach($group as $g){
					if(sizeof($group) == 7){
						if($g['category']){
							$data[$g['category']] = $g['quantity'];
						}else{
							$data['其它'] = $g['quantity'];
						}
					}else{
						if($i>6){
							$other += $g['quantity'];
							$data['其它'] = $other;
						}else{
							if($g['category']){
								$data[$g['category']] = $g['quantity'];
							}else{
								if(!isset($data['未知材质'])){
									$data['未知材质'] = 0;
								}
								$data['未知材质'] +=$g['quantity'];
							}
						}
					}
					$i++;
				}
			}
		}

		$this->response($data);
	}

	public function filter_conditions_get()
	{
		$opt = $this->get_post('opt');
		$where = "1=1";
		if($opt){
			if($opt == 'in'){
				$status = "('科研','展陈','修复','借出','待入库')";
			}else if($opt == 'out'){
				$status = "('不需修复','需要修复','亟需修复')";
			}
			if(isset($status)&&$status){
				$where .= " and status in {$status}";
			}
		}
		$category_str = "select count(*) as `count`,category as name from relic where {$where} group by category order by `count` desc";
		$category = $this->db->query($category_str)->result_array();

		$status_str = "select count(*) as `count`,status as name from relic where {$where} group by status order by `count` desc";
		$status = $this->db->query($status_str)->result_array();

		$level_str = "select count(*) as `count`,`level` as name from relic where {$where} group by `level` order by `count` desc";
		$levels = $this->db->query($level_str)->result_array();

		$age_str = "select count(*) as `count`,age as name from relic where {$where} group by age order by `count` desc";
		$age = $this->db->query($age_str)->result_array();

		$material_str = "select count(*) as `count`,material as name from relic where {$where} group by material order by `count` desc";
		$material =  $this->db->query($material_str)->result_array();
		$envs = API('get/base/envs',array('type'=>"展柜,展厅,库房,存储柜,研究室,修复室"));
		$hall = array();
		$hall_name = array();
		if(isset($envs['rows'])&&$envs['rows']){
			foreach($envs['rows'] as $env){
				if(isset($env['type'])&&in_array($env['type'] ,array("展柜",'存储柜','安防展柜'))){
					if(isset($env['parent_env_no'])&&$env['parent_env_no']){
						$hall[$env['env_no']] = $env['parent_env_no'];
					}
				}else{
					$hall[$env['env_no']] = $env['env_no'];
					$hall_name[$env['env_no']] = $env['name'];
				}
			}
		}

		$env_str = "select count(*) as `count`,parent_env_no from relic where {$where} group by parent_env_no order by `count` desc";
		$relic = $this->db->query($env_str)->result_array();
		$env_count = array();
		if($relic){
			foreach($relic as $r){
				if(isset($r['parent_env_no'])&&$r['parent_env_no']){
					if(isset($hall[$r['parent_env_no']])){
						$hall_no = $hall[$r['parent_env_no']];
						if(!isset($env_count[$hall_no])){
							$env_count[$hall_no] = array();
							$env_count[$hall_no]['count'] = $r['count'];
							if(isset($hall_name[$hall_no])){
								$env_count[$hall_no]['name'] = $hall_name[$hall_no];
							}
						}else{
							$env_count[$hall_no]['count'] += $r['count'];
						}
					}
				}
			}
		}

		$data = array();
		if($category){
			$data['category'] = $category;
		}
		if($age){
			$data['age'] = $age;
		}
		if($material){
			$data['material'] =  $material;
		}
		if($env_count){
			$data['hall'] = $env_count;
		}
		if($levels){
			$data['level'] = $levels;
		}
		if($status){
			$data['status'] = $status;
		}
		$this->response($data);
	}
}
