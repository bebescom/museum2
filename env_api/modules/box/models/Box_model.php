<?php
/**
 * Created by PhpStorm.
 * User: HBJ_PC
 * Date: 16-8-24
 * Time: 下午2:09
 */

class Box_model extends MY_Model{

	function all_children($parent_env_no){
		$envs = API('get/base/envs',array('parent_env_no'=>$parent_env_no));

		$env_nos = explode(",",$parent_env_no);
		$search_array = array();
		if($envs['total']>0){
			foreach($envs['rows'] as $env){
				if(isset($env['env_no'])&&$env['env_no']){
					$env_nos[] = $env['env_no'];
					$search_array[] = array('get/base/envs',array('parent_env_no'=>$env['env_no']));
				}
			}
		}

		if($search_array){
			$cabinets = API($search_array);
			if($cabinets){
				if(!isset($cabinets['total'])){
					foreach($cabinets as $cabinet){
						if(isset($cabinet['total'])&&$cabinet['total']>0){
							foreach($cabinet['rows'] as $c){
								if(isset($c['env_no'])&&$c['env_no']){
									$env_nos[] = $c['env_no'];
								}
							}
						}
					}
				}
			}else{
				if(isset($cabinets['total'])&&$cabinets['total']>0){
					foreach($cabinets['rows'] as $c){
						if(isset($c['env_no'])&&$c['env_no']){
							$env_nos[] = $c['env_no'];
						}
					}
				}
			}
		}
		return $env_nos;
	}

} 