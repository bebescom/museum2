<?php

class Manage extends MY_Controller
{
	 function __construct(){
		 parent::__construct();
		 $sensor_param = API("get/env/equipments/equip_parameters/sensor");
		 $this->param = isset($sensor_param['sensor'])?$sensor_param['sensor']:array();
	 }

	//文物列表
    function relic_list_get()
    {
        $relic_no = $this->get('relic_no');
        $parent_env_no = $this->get('parent_env_no');
        $level = $this->get('level');
        $category = $this->get('category');
        $age = $this->get('age');
        $name = $this->get('name');
        $id = $this->get('id');
	    $page = $this->get_post("page");
	    $limit = $this->get_post("limit");
	    $material = $this->get_post("material");
	    $status = $this->get_post("status");
		$include_child = $this->get_post("include_child");
		$index = $this->get_post("index");

		$data = array(
			'index'=>$index,
			'count'=>0,
			'total'=>0,
			"page"=>$page,
			'rows'=>array()
		);
		$envs = API('get/base/envs');
		if(isset($parent_env_no)&&$parent_env_no){
//			if(!$include_child){
//				if($envs['total']>0){
//					$select_envs = explode(',',$parent_env_no);
//					foreach($select_envs as $select_env){
//						foreach($envs['rows'] as $env){
//							if(isset($env['env_no'])&&$env['env_no']){
//								if(strpos($env['env_no'],$select_env) !== false){
//									$env_nos[] = $env['env_no'];
//								}
//							}
//						}
//					}
//				}
//			}else{
//				$env_nos = explode(',',$parent_env_no);
//			}
			$env_nos = explode(',',$parent_env_no);
		}
		$where = "1=1";
		$relics = array();
		$count = 0;
		if(isset($this->_user['data_scope'])&&$this->_user['data_scope']) {
			if ($this->_user['data_scope'] != "administrator") {
				if (isset($env_nos) && $env_nos) {
					$env_nos = array_intersect($env_nos, $this->_user['data_scope']);
				} else {
					$env_nos = $this->_user['data_scope'];
				}
			}
			$sort_by = "";
			if (isset($env_nos)) {
				if (!$parent_env_no) {
					$env_nos[] = "";
					$sort_by = "parent_env_no desc";
				}
				$where .= " and parent_env_no in ('" . implode("','", $env_nos) . "')";
			}
			if (!isset($sort_by)) {
				$sort_by = "sort asc,level asc";
			}

			if (isset($relic_no) && $relic_no) {
				$relic_nos = explode(',', $relic_no);
				$where .= " and relic_no in ('" . implode("','", $relic_nos) . "')";
			}

			if (isset($level) && $level) {
				$where .= " and level in ('" . implode("','", explode(',', $level)) . "')";
			}

			if (isset($category) && $category) {
				$where .= " and category in ('" . implode("','", explode(',', $category)) . "')";
			}
			if (isset($material) && $material) {
				$where .= " and material in ('" . implode("','", explode(',', $material)) . "')";
			}
			if (isset($age) && $age) {
				$where .= " and age in ('" . implode("','", explode(',', $age)) . "')";
			}
			if (isset($status) && $status) {
				$where .= " and status in ('" . implode("','", explode(',', $status)) . "')";
			}
			if (isset($id) && $id) {
				$where .= " and (name like '%" . $id . "%' or relic_id like '%" . $id . "%')";
			}
			if (isset($name) && $name) {
				$where .= " and (name like '%" . $name . "%')";
			}
			if (!$page) {
				$page = 1;
			}
			if (!$limit) {
				$limit = 10;
			}

			$offset = ($page - 1) * $limit;
			$relics = M("relic")->fetAll($where, "*", $sort_by, $offset, $limit);
			$count = M("relic")->count($where);

			$images = M('image')->fetAll('`type` = "home"');
			$relic_images = array();
			if ($images) {
				foreach ($images as $image) {
					if (isset($image['no']) && $image['no']) {
						if (isset($image['url']) && $image['url'] && file_exists($_SERVER['DOCUMENT_ROOT'] .$image['url'])) {
							$relic_images[$image['no']] = $image['url'];
						}
					}
				}
			}
			$navs = array();
			$new_datas = array();
			$relic_env_nos = array();
			$num = 0;
			if ($relics) {
				foreach ($relics as $k => $relic) {
					$relics[$k]['nav'] = "";
					$relics[$k]['new_data'] = array();
					if (isset($relic['parent_env_no']) && $relic['parent_env_no']) {
						if (isset($navs[$relic['parent_env_no']])) {
							$relics[$k]['nav'] = $navs[$relic['parent_env_no']];
						} else {
							$nav = M('common/common')->navigation($envs['rows'], $relic['parent_env_no']);
							$relics[$k]['nav'] = $nav;
							$navs[$relic['parent_env_no']] = $nav;
						}
						if (!in_array($relic['parent_env_no'], $relic_env_nos)) {
							$relic_env_nos[] = $relic['parent_env_no'];
						}

						if (!isset($new_datas[$relic['parent_env_no']]) || !$new_datas[$relic['parent_env_no']]) {
							$new_data = API("get/env/common/data/new_data", array('env_no' => $relic['parent_env_no']));
							$new_datas[$relic['parent_env_no']] = $new_data;
//							$num++;
						}
						if (isset($new_datas[$relic['parent_env_no']]) && $new_datas[$relic['parent_env_no']]) {
							if ($this->param) {
								foreach ($this->param as $p => $v) {
									if (isset($new_datas[$relic['parent_env_no']][$p]) && $new_datas[$relic['parent_env_no']][$p]) {
										$relics[$k]['new_data'][$p] = $new_datas[$relic['parent_env_no']][$p];
									}
								}
							}
						}
					}
					if (!isset($relic['image']) || !$relic['image'] ||!file_exists($_SERVER['DOCUMENT_ROOT'] .$relic['image'])) {
						$relics[$k]['image'] = isset($relic_images[$relic['relic_no']]) ? $relic_images[$relic['relic_no']] : null;
					}
					//图片超过1M生成缩率图
					if($relics[$k]['image'] && filesize($_SERVER['DOCUMENT_ROOT'] .$relics[$k]['image']) > 1024*1024){
						$file_names = explode('.',$relics[$k]['image']);
						$file_name  = array_shift($file_names);
						$suffix = array_pop($file_names);
						$small_img = $file_name."_small.{$suffix}";
						$org_url = $_SERVER['DOCUMENT_ROOT'] .$relics[$k]['image'];
						resizeImage($org_url,150,150,$_SERVER['DOCUMENT_ROOT'].$small_img);
						$updata = array("image"=>$small_img);
						if(!$relic['relic_id']){
							$updata['relic_id'] = $relic['relic_no'];
						}
						M("relic")->save($updata,"relic_no = '".$relic['relic_no']."'");
					}
				}
			}
		}

        $data = array(
	        'count'=>$count,
            "page"=>$page,
            'rows'=>$relics,
        );

        $this->response($data);
    }


	//文物详情
	public function detail_get($relic_no){

		$relic = M("relic")->find("relic_no = '".$relic_no."'");

		$data = array();
		if($relic){
			if(isset($relic['parent_env_no'])&&$relic['parent_env_no']){
				$nav = API('get/base/envs/navigation/'.$relic['parent_env_no'].'');
				if(isset($nav['rows'])){
					$relics['nav'] =  $nav['rows'];
				}
			}

			$threshold = API("get/env/common/relic_threshold/".$relic_no);
			$relic['threshold'] = array();
			if($this->param){
				foreach($this->param as $p=>$v){
					if($threshold){
						$relic['threshold'][$p] = array();
						if(isset($threshold[$p."_min"])&&$threshold[$p."_min"]){
							$relic['threshold'][$p]['min'] = $threshold[$p."_min"];
						}
						if(isset($threshold[$p."_max"])&&$threshold[$p."_max"]){
							$relic['threshold'][$p]['max'] = $threshold[$p."_max"];
						}
					}
				}
			}
			$data = $relic;
		}

		$this->response($data);
	}

	public function edit_post(){
		if(!M("common/permission")->check_permission("修改文物信息",$this->_user)){
			$this->response(array('error' => '无权限修改文物信息'));
		}
		$relic_no = $this->get_post("relic_no");
		$parent_env_no = $this->get_post("parent_env_no");
		$material = $this->get_post("material");
		$category = $this->get_post("category");
		$level = $this->get_post("level");
		$age = $this->get_post("age");
		$name = $this->get_post("name");
		$describe = $this->get_post("describe");
		$status = $this->get_post("status");

		$relic = M("relic")->find("relic_no = '".$relic_no."'");
		if(!$relic){
			$this->response(array("result"=>false,"msg"=>"文物不存在"));
		}

		$up_data = array();
		if(isset($parent_env_no)&&$parent_env_no){
			$up_data['parent_env_no'] = $parent_env_no;
		}

		if(isset($material)&&$material){
			$up_data['material'] = $material;
		}

		if(isset($category)&&$category){
			$up_data['category'] = $category;
		}

		if(isset($level)&&$level){
			$up_data['level'] = $level;
		}
		if(isset($name)&&$name){
			$up_data['name'] = $name;
		}

		if(isset($age)&&$age){
			$up_data['age'] = $age;
		}

		if(isset($describe)&&$describe){
			$up_data['describe'] = $describe;
		}

		if(isset($status)&&$status){
			$up_data['status'] = $status;
		}

		if($up_data){
			$ret = M("relic")->update($up_data,"relic_no = '".$relic_no."'");
			$result = $ret?array("result"=>true,"msg"=>"修改成功"):array("result"=>false,"msg"=>"修改失败");
			$this->response($result);
		}else{
			$this->response(array("result"=>false,"msg"=>"修改项为空"));

		}
	}

	public function operate_post(){
		$relic_no = $this->get_post("relic_no");
		$env_no = $this->get_post("env_no");
		$operation = $this->get_post("operation");
		if(!$operation){
			$this->response(array("result"=>false,"msg"=>"未知操作"));
		}else{
			$status = "无需修复";
			switch($operation){
				case "展出":
					$status = "展出";
					break;
				case "研究":
					$status = "研究";
					break;
				case "修复":
					$status = "修复";
					break;
				case "借出":
					$status = "借出";
					break;
				case "借入":
					$status = "借入";
					break;
				case "归还":
					$status = "已归还";
					break;
				default:
					break;
			}
			$relic_nos = explode(",",$relic_no);
			$where = "relic_no in ('".implode("','",$relic_nos)."')";

			$relics = M("relic")->fetAll($where);
			if(isset($relics['total'])&&!$relics['total']){
				$this->response(array("result"=>false,"msg"=>"未知文物"));
			}else{
				$ret = M("relic")->update(array("status"=>$status),$where);
				$result = $ret?array("result"=>true,"msg"=>$operation."成功"):array("result"=>false,"msg"=>$operation."失败");
				$this->response($result);
			}
		}
	}

	function relic_pos_post(){
		$relic_no = $this->get_post("relic_no");
		$width = $this->get_post("width");
		$height = $this->get_post("height");
		$x = $this->get_post("x");
		$y = $this->get_post("y");

		$relic = M("relic")->find("relic_no = '".$relic_no."'");
		$data = array();
		$locate = array();
		if(isset($width)&&$width){
			$locate['width'] = $width;
		}
		if(isset($height)&&$height){
			$locate['height'] = $height;
		}
		if(isset($x)&&isset($y)){
			$locate['area'][] = $x.",".$y;
		}
		if($relic){
			$up_data = array();
			$up_data['locate'] = json_encode($locate);

			$ret = M("relic")->update($up_data,"relic_no = '".$relic_no."'");
			if($ret){
				$data['result'] = true;
				$data['msg'] = "保存成功";
			}
		}else{
			$data['result'] = false;
			$data['msg'] = "设备不存在";
		}

		$this->response($data);
	}
}