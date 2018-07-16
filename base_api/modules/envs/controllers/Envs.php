<?php

class Envs extends MY_Controller
{
    function index()
    {
        $keyword = $this->get_post('keyword');
        $type = $this->get_post('type');
        $env_no = $this->get_post('env_no');
        $parent_env_no = $this->get_post('parent_env_no');
        $sort_by = $this->get_post('sort_by');
	    $page = $this->get_post('page');
	    $limit = $this->get_post('limit');
        $result = array(
            'total' => 0,
            'rows' => array(),
        );
        if (isset($this->_user['data_scope'])&&$this->_user['data_scope']) {
            if (!isset($sort_by)) {
                $sort_by = "sort desc,id asc";
            }
            $where = "1=1";
            if (isset($keyword) && $keyword != '') {
                $where .= " and concat_ws('',env_no,name) like '%" . $keyword . "%'";
            }
            if (isset($type) && $type != '') {
                $type_tmp = explode(',', $type);
                $type_instr = "'" . join("','", $type_tmp) . "'";
                $where .= " and `type` in (" . $type_instr . ")";
            }
            if (isset($env_no) && $env_no != '') {
                $env_nos = explode(',',$env_no);
                $where .= " and env_no in ('" . implode("','",$env_nos) . "')";
            }

            if (isset($parent_env_no) && $parent_env_no != '') {
                $parent_env_nos = explode(',',$parent_env_no);
                $where .= " and parent_env_no in ('" . implode("','",$parent_env_nos) . "')";
            }

            $offset = 0;
            if(!$page){
                $page = 1;
            }

            if($limit){
                $offset = ($page-1)*$limit;
            }

            $m = M('env');
            $list = $m->fetAll($where, "*", $sort_by,$offset,$limit);
            if($list){
                foreach ($list as $k=>$item) {
                    if(isset($item['env_no'])&&$item['env_no']){
                        if($this->_user['data_scope'] != 'administrator'){
                            if(!in_array($item['env_no'],$this->_user['data_scope'],true)){
                                unset($list[$k]);
                            }
                        }
                    }
                }
            }
            $result = array(
                'total' => count($list),
                'rows' => $list,
            );
        }

	    $this->response($result);
    }

    function tree_get($env_no = '')
    {
        $inc_self = null;
        if($this->get_post('inc_self')){
            $inc_self = $this->get_post('inc_self');
        }
        $inc_box = 1;
        if($this->get_post('inc_box')) {
            $inc_box = $this->get_post('inc_box');
        }

        $inc_equip = null;
        if($this->get_post('inc_equip')){
            $inc_equip = $this->get_post('inc_equip');
        }
        $m = M('env');
        $where = "1=1";
        if(isset($this->_user['data_scope'])&&$this->_user['data_scope'] != "administrator"){
            $where .= " and env_no in ('".implode("','",$this->_user['data_scope'])."')";
        }
        $list = $m->fetAll($where, "env_no,parent_env_no,name,type,map,locate,sort", "sort desc,id asc");
        $env_nos = array();

       if($inc_box){
           $boxes = API('get/env/equipments/boxes',array("select"=>"env_no,parent_env_no,name,type,map,locate,sort"));
           if(isset($boxes['rows'])&&$boxes['rows']){
               $boxes = $boxes['rows'];
//           $boxes = M("box")->fetAll('',"env_no,parent_env_no,name,type,map,locate,sort");
               if($boxes){
                   foreach ($boxes as $k=>$box) {
                       $boxes[$k]['parent_env_no'] = "box_root";
                   }
                   array_push($boxes,array('env_no'=>'box_root','parent_env_no'=>'','name'=>'囊匣'));
                   $list = array_merge($list,$boxes);
               }
           }
       }
        if($list){
            foreach ($list as $lt) {
                if(isset($lt['env_no'])&&$lt['env_no']!="box_root"){
                    $env_nos[$lt['env_no']] = $lt['name'];
                }
            }
        }
        if($inc_equip){
            $equip_where = "status not in ('停用','备用') and equip_type not in ('网关','中继','气象站','智能囊匣')";
            if($env_nos){
                $equip_where .= "and env_no in ('".implode("','",array_keys($env_nos))."')";
            }
            $equips = API("get/env/equipments/equip_where",array("select"=>"equip_no as env_no,name,env_no as parent_env_no,equip_type as type","where"=>$equip_where));
            if($equips){
                foreach ($equips as $key=>$equip) {
                    $equips[$key]['name'] = $env_nos[$equip['parent_env_no']]."-".substr($equip['env_no'],-4);
                    $equips[$key]['icon'] = $equip['type'];
                }
            }

            $list = array_merge($list,$equips);
        }

        $this->load->helper('common/tree', 'tree');
        $tree = generate_tree($list, array(
            'id' => 'env_no',
            'fid' => 'parent_env_no',
            'root' => $env_no,
        ),$inc_self);
        $this->response($tree);

    }

    function info_get($env_no = '')
    {
        if ($env_no == '') {
            $this->response(array('error' => '没有找到env_no'));
        }
        if (isset($this->_user['data_scope'])&&$this->_user['data_scope']) {
            if($this->_user['data_scope'] != 'administrator' && !in_array($env_no,$this->_user['data_scope'])){
                $this->response(array('error' => '无该环境数据权限'));
            }
        }
        $m = M('env');
        $info = $m->find("env_no='" . $env_no . "'");
        if (!$info) {
            $this->response(array('error' => '没有找到环境信息'));
        }
        $this->response($info);
    }

    function delete_post($env_no = '')
    {
//        if(!M("common/permission")->check_permission("删除环境",$this->_user)){
//            $this->response(array('error' => '无权限删除环境'));
//        }
        if ($env_no == '') {
            $env_no = $this->post('env_no');
        }
        if (!isset($env_no)) {
            $this->response(array('error' => '没有找到环境编号'));
        }
        $no_tmp = explode(',', $env_no);
        $where_instr = "'" . join("','", $no_tmp) . "'";

        $m = M('env');
        $m->delete("env_no in (" . $where_instr . ")");

        $this->response(array('env_no' => $env_no, 'msg' => '删除成功'));
    }

    /**
    *  环境展示图片
     **/
    function env_show_image_get($no)
    {
        $show_img = $this->db->where(array('no'=>$no,'type'=>'show'))->get('image')->result_array();

        $result = array();
        $result['no'] = $no;
        $result['images'] = array();
        if($show_img){
            foreach($show_img as $s_img){
                if($s_img['url']){
                    $result['images'][] = base_url().$s_img['url'];
                }
            }
        }

        $this->response($result);
    }

    function env_svg_get($parent_env_no = null)
    {
        if($parent_env_no){
            $sql = "select env_no,name,locate from env where parent_env_no ='".$parent_env_no."'";
        }else{
            $sql = "select env_no,name,locate from env where parent_env_no is NULL or parent_env_no = ''";
        }
        $envs = $this->db->query($sql)->result_array();

        $data = array();
        if($envs){
            $data['total'] = sizeof($envs);
            $data['rows'] = array();
            foreach($envs as $env){
                if(isset($env['locate'])&&$env['locate']){
                    $locate = json_decode($env['locate'],true);
                    $env['locate'] = $locate;
                }
                $data['rows'][] = $env;
            }
        }

        $this->response($data);
    }

    function fast_enter_get(){
        $envs = M('env')->fetAll("type in ('楼层','展厅')","env_no,parent_env_no,name,type,map,locate,sort");

        $this->load->helper('common/tree', 'tree');
        $tree = generate_tree($envs, array(
            'id' => 'env_no',
            'fid' => 'parent_env_no',
            'root' => '',
        ));

        $this->response($tree);
    }

    function navigation_get($env_no,$level="")
    {
        $envs = M('env')->fetAll("","env_no,parent_env_no,type,name,map,locate");
        $env_nos = array();
        $navs = array(
            'total'=>0,
            'rows'=>array()
        );
        foreach ($envs as $env) {
            if(isset($env['env_no'])&&$env['env_no']){
                $env_nos[$env['env_no']] = $env;
            }
        }
        if(isset($env_nos[$env_no])){
            $temp = $env_nos[$env_no];
            $navs['rows'][] = $temp;
            $navs['total']++;
            while(isset($temp['parent_env_no'])){
                $temp = isset($env_nos[$temp['parent_env_no']])?$env_nos[$temp['parent_env_no']]:array();
                if($temp){
                    $navs['rows'][] = $temp;
                    $navs['total']++;
                }
            }
            $navs['rows'] = array_reverse($navs['rows']);
        }
        if($level){
            $num = 0;
            $temp_nav = array();
            if($navs['rows']){
                foreach ($navs['rows'] as $row) {
                    if($row){
                        if($num<$level){
                            $temp_nav[] = $row;
                            $num++;
                        }
                    }
                }
            }
            $navs['total'] = sizeof($temp_nav);
            $navs['rows'] = $temp_nav;
        }

        $this->response($navs);
    }
	//获取环境的子环境
	public function all_children_get($env_no)
    {
		$env_nos = array();
		$env_type = array("楼层","楼层","展厅","库房","展柜","存储柜","智能囊匣");
		$env = M("env")->find("parent_env_no ='".$env_no."'","env_no,parent_env_no,type,name");
		if($env){
			foreach($env as $e){
				if(isset($e['env_no'])&&$e['env_no']){
					$env_nos[] = $e['env_no'];
					while(in_array($e['type'],$env_type)){
						$env = M("env")->find("parent_env_no ='".$env_no."'","env_no,parent_env_no,type,name");
						if(isset($env['env_no'])&&$env['env_no']){
							$env_nos[] = $env['env_no'];
							while(in_array($env['type'],$env_type)){
								$env = M("env")->find("parent_env_no ='".$env_no."'","env_no,parent_env_no,type,name");
								if(isset($env['env_no'])&&$env['env_no']){
									$env_nos[] = $env['env_no'];
								}
							}
						}
					}
				}
			}
		}

		$this->response($env_nos);
	}

    function images_get(){
        $env_no = $this->get_post("env_no");

        $where = "1=1";
        if($env_no){
            $env_nos = explode(",",$env_no);
            $where .= " and no in ('".implode("','",$env_nos)."')";
        }

        $images = M("image")->fetAll($where);
        $data = array();
        if($images){
            foreach ($images as $image) {
                if(isset($image['no'])&&$image['no']){
                    if(!isset($data[$image['no']])){
                        $data[$image['no']] = array();
                    }
                    if(isset($image['type'])&&$image['type']){
                        if(isset($image['url'])&&$image['url']){
                            $data[$image['no']][$image['type']] = $image['url'];
                        }
                    }
                }
            }
        }

        $this->response($data);
    }

}