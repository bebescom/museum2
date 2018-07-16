<?php
/**
 * Created by PhpStorm.
 * User: HBJ_PC
 * Date: 16-8-30
 * Time: 下午4:25
 */

class Relics_model extends  MY_Model{

	function all_children($parent_env_no){
		$envs = API('get/base/envs',array('parent_env_no'=>$parent_env_no));

		$env_nos = array($parent_env_no);
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

	function relic_code($count=1){
        $code = $this->db->where(array("key"=>"relic_code"))->get("config")->row_array();
        if(!$code){
            $relic_count = M("relic")->count();
            $code_insert = array(
                "key"=>"relic_code",
                "val"=>$relic_count
            );
            $this->db->insert("config",$code_insert);
        }

		$relics = $this->db->get("relic")->result_array();
		$nos = array();
		if($relics){
			foreach ($relics as $relic){
				if(isset($relic['relic_no'])&&$relic['relic_no']){
					$nos[] = $relic['relic_no'];
				}
			}
		}

		$museum_no = app_config('museum_no');
        $code = $this->db->where(array("key"=>"relic_code"))->get("config")->row_array();
		$encode_num = 0;
		$relic_nos = array();
		//批量生成编号
		while($encode_num<$count){
			$num = 1;
			if(isset($code['val'])){
				$code['val']++;
				$num = $code['val'];
			}
			$relic_code = str_pad($num,6,"0",STR_PAD_LEFT);
			$relic_no = $museum_no.$relic_code;
			while (in_array($relic_no,$nos,true)){
				$code['val']++;
				$num = $code['val'];
				$relic_code = str_pad($num,6,"0",STR_PAD_LEFT);
				$museum_no = app_config('museum_no');
				$relic_no = $museum_no.$relic_code;
			}
			$relic_nos[] = $relic_no;
			$encode_num++;
		}

        $up_data = array("val"=>$code['val']);
        $this->db->update("config",$up_data,array("key"=>"relic_code"));

        return $relic_nos;
    }
} 