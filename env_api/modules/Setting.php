<?php

class Setting extends MY_Controller{

	function __construct(){
		parent::__construct();
	
	}

	function no_locate_get($env_no=''){
		$m=M('equip');
		$list=$m->fetAll("env_no is null or env_no='' and status != '停用'",'id,equip_no,name,equip_type,status,env_no,locate','env_no');

		$this->response($list);
		
	}

	function equip_locate_get($env_no=''){

		$result=API('get/base/envs');
		$envs=array();
		if(is_array($result)&&count($result)>0){
			foreach($result['rows'] as $root){
				$envs[$root['env_no']]=$root;
			}
		}
		$m=M('equip');
		$list=$m->fetAll("env_no like '".$env_no."%' and status != '停用'",'id,equip_no,name,equip_type,status,env_no,locate','env_no asc,id desc');
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
		$locate=$this->post('locate');
		$env_no=$this->post('env_no');
		$remove_all=$this->post('remove_all');

		$envs = API("get/base/envs");
		$updata=array();

		if(isset($locate)){
			$updata['locate']=$locate;
		}
		$m=M('equip');

		$equip = $m->fetOne("equip_no = '{$no}'");
		if(isset($env_no)){
			$updata['env_no']=$env_no;
			$nav = M('common/common')->navigation($envs['rows'],$env_no);
			$position = array();
			if (isset($nav['rows']) && $nav['rows']) {
				foreach ($nav['rows'] as $nv) {
					if (isset($nv['name']) && $nv['name']) {
						$position[] = $nv['name'];
					}
				}
			}

			if($equip['status'] === "备用"&&$updata){
				$updata['status'] = "正常";
				$operation = array(
					'equip_no'=>$no,
					'operation'=>'设备启用',
					'operator'=>$this->_user['real_name'],
					'operation_time'=>time(),
					'remark'=>"启用位置:"
				);
				if (isset($position)&&$position) {
					$operation['remark'] .= implode(" > ", $position);
				}
			}else if($env_no != $equip['env_no']){
				$pre_nav = M('common/common')->navigation($envs['rows'],$equip['env_no']);
				$pre_position = array();
				if (isset($pre_nav['rows']) && $pre_nav['rows']) {
					foreach ($pre_nav['rows'] as $nv) {
						if (isset($nv['name']) && $nv['name']) {
							$pre_position[] = $nv['name'];
						}
					}
				}
				$operation = array(
					'equip_no'=>$no,
					'operation'=>'修改设备位置',
					'operator'=>$this->_user['real_name'],
					'operation_time'=>time(),
				);
				if (isset($position)&&$position) {
					$operation['remark'] .=  implode(" > ", $pre_position)."》".implode(" > ", $position);
				}
			}
		}

		if($remove_all){
			$updata=array('locate'=>null,'env_no'=>null,'status'=>'备用');
			$operation = array(
				'equip_no'=>$no,
				'operation'=>'设备备用',
				'operator'=>$this->_user['real_name'],
				'operation_time'=>time(),
				'remark'=>"备用前位置:"
			);
			if (isset($position)&&$position) {
				$operation['remark'] .= implode(" > ", $position);
			}
		}

		$m->save($updata,"equip_no='".$no."'");

		$this->response(array('msg'=>'保存locate成功','locate'=>$locate));
	}

	
}