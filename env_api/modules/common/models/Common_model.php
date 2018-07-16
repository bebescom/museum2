<?php
/**
 * Created by PhpStorm.
 * User: HBJ_PC
 * Date: 16-8-26
 * Time: 下午1:33
 */

class Common_model extends MY_Model{

	public function new_data($keys=array()){

	}

	public function get_children($env_no = array()){
		$envs = API("get/base/envs",array("sort_by"=>"id asc"));
		$env_nos = $env_no;
		$box_parents = array();
		if(isset($envs['rows'])&&$envs['rows']){
			foreach ($envs['rows'] as $env) {
				 if($env_nos){
					if(isset($env['parent_env_no'])&&$env['parent_env_no']&&in_array($env['parent_env_no'],$env_nos)){
						if(!in_array($env['env_no'],$env_nos)){
							$env_nos[] = $env['env_no'];
						}
						if(isset($env['type'])&&in_array($env['type'],array("展厅","库房","修复室","研究室","楼层"))){
							$box_parents[] = $env['env_no'];
						}
					}
				}else{
					if(!in_array($env['env_no'],$env_nos)){
						$env_nos[] = $env['env_no'];
					}
					if(isset($env['type'])&&in_array($env['type'],array("展厅","库房","修复室","研究室","楼层"))){
						$box_parents[] = $env['env_no'];
					}
				}
			}
		}

		if($box_parents){
			$boxes = API("get/base/envs/boxes",array('parent_env_no'=>implode(",",$box_parents)));
			if(isset($boxes['rows'])&&$boxes['rows']){
				foreach($boxes['rows'] as $box){
					if(isset($box['env_no'])&&$box['env_no']){
						$env_nos[] = $box['env_no'];
					}
				}
			}
		}

		return $env_nos;
	}

	function get_all_children($parent_env_nos){
		$parent_env_nos = explode(',',$parent_env_nos);
		$envs = API("get/base/envs",array("sort_by"=>"id asc"));

		$children = array();
		if($parent_env_nos){
			foreach ($parent_env_nos as $parent_env_no) {
				if(isset($envs['rows'])&&$envs['rows']){
					foreach($envs['rows'] as $env){
						if($env['env_no']&& strpos($env['env_no'],(string)$parent_env_no) !== false){
							$children[] = $env['env_no'];
						}
					}
				}
			}

			$boxes = API("get/base/envs/boxes",array('parent_env_no'=>implode(",",$parent_env_nos)));
			if(isset($boxes['rows'])&&$boxes['rows']){
				foreach($boxes['rows'] as $box){
					if(isset($box['env_no'])&&$box['env_no']){
						$children[] = $box['env_no'];
					}
				}
			}
		}

		$children = array_unique($children);
		return $children;
	}

	function navigation($envs,$env_no)
	{
		$env_nos = array();
		$navs = array();
		foreach ($envs as $env) {
			if(isset($env['env_no'])&&$env['env_no']){
				$env_nos[$env['env_no']] = $env;
			}
		}
		if(isset($env_nos[$env_no])){
			$temp = $env_nos[$env_no];
			$navs[] = $temp;
			while(isset($temp['parent_env_no'])){
				$temp = isset($env_nos[$temp['parent_env_no']])?$env_nos[$temp['parent_env_no']]:array();
				if($temp){
					$navs[] = $temp;
				}
			}
			$navs = array_reverse($navs);
		}

		return $navs;
	}
} 