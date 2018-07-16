<?php

class Setting extends MY_Controller{

	function __construct(){
		parent::__construct();
	
	}

	function relic_type_get(){
		$m=M('relic');
		$list=$m->getAll("select distinct(level) from relic");
		$types=array();
		if($list){
			foreach ($list as $row) {
				if(!empty($row['level'])){
					$types[]=$row['level'];
				}
			}
		}

		$this->response($types);
		
	}

	function no_locate_get($env_no=''){
		$m=M('relic');
		$list=$m->fetAll("parent_env_no is null or parent_env_no=''",'id,relic_no,name,level,parent_env_no as env_no,locate','env_no');

		$this->response($list);
		
	}


	function relic_locate_get($env_no=''){
		$result=API('get/base/envs');
		$envs=array();
		if(is_array($result)&&count($result)>0){
			foreach($result['rows'] as $root){
				$envs[$root['env_no']]=$root;
			}
		}

		$m=M('relic');
		$list=$m->fetAll("parent_env_no like '".$env_no."%'",'id,relic_no,name,level,parent_env_no as env_no,locate','env_no asc,id desc');
		foreach ($list as $key=>$row) {
			if(isset($envs[$row['env_no']])){
				$list[$key]['env_id']=$envs[$row['env_no']]['id'];
				$list[$key]['env_name']=$envs[$row['env_no']]['name'];
				$list[$key]['env_sort']=$envs[$row['env_no']]['sort'];
			}
		}

		function cmp($a,$b){

			if(isset($a['env_no'])&&isset($b['env_no'])&&$a['env_no']==$b['env_no']){
				return 0;
			}
			if(isset($a['env_sort'])&&isset($b['env_sort'])&&$a['env_sort']>$b['env_sort']){
				return -1;
			}
			if(isset($a['env_id'])&&isset($b['env_id'])&&$a['env_id']>$b['env_id']){
				return 1;
			}
			return 0;
		}

		usort($list,'cmp');
		
		$this->response($list);
		
	}

	function save_locate_post(){

		$no=$this->post('no');
		$env_no=$this->post('env_no');
		$locate=$this->post('locate');
		$remove_all=$this->post('remove_all');

		$updata=array();

		if(isset($locate)){
			$updata['locate']=$locate;
		}
		if(isset($env_no)){
			$updata['parent_env_no']=$env_no;
		}

		if($remove_all){
			$updata=array('locate'=>null,'parent_env_no'=>null);
		}

		$m=M('relic');

		$m->save($updata,"relic_no='".$no."'");

		$this->response(array('msg'=>'保存locate成功','locate'=>$locate));
	}

	
}