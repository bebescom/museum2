<?php

class Boxes extends MY_Controller
{
    function index_nologin()
    {
        $keyword = $this->get_post('keyword');
        $type = $this->get_post('type');
        $env_no = $this->get_post('env_no');
        $parent_env_no = $this->get_post('parent_env_no');
        $sort_by = $this->get_post('sort_by');
	    $page = $this->get_post('page');
	    $limit = $this->get_post('limit');
	    $alert_status = $this->get_post('alert_status');
	    $select = $this->get_post('select');

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
            $where .= " and env_no in ('" . implode("','",explode(",",$env_no)) . "')";
        }

        if (isset($parent_env_no) && $parent_env_no != '') {
            $where .= " and parent_env_no in (" . $parent_env_no . ")";
        }

	    if(isset($alert_status)&&$alert_status){
		    $where .= " and alert_status = ".$alert_status;
	    }

	    $offset = 0;
	    if(!$page){
		    $page = 1;
	    }

	    if($limit){
		    $offset = ($page-1)*$limit;
	    }

        if(!$select){
            $select = "*";
        }

        $m = M('box');
        $list = $m->fetAll($where, $select, $sort_by,$offset,$limit);
        $total = $m->count($where);
        $result = array(
            'total' => $total,
            'rows' => $list,
        );
        $this->response($result);

    }


    function info_get($env_no = '')
    {
        if ($env_no == '') {
            $this->response(array('error' => '没有找到env_no'));
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
        if ($env_no == '') {
            $env_no = $this->post('env_no');
        }
        if (!isset($env_no)) {
            $this->response(array('error' => '没有找到环境编号'));
        }
        $no_tmp = explode(',', $env_no);
        $where_instr = "'" . join("','", $no_tmp) . "'";

        $m = M('box');
        $m->delete("env_no in (" . $where_instr . ")");

        $this->response(array('env_no' => $env_no, 'msg' => '删除成功'));
    }

    function env_position_get($no){
        $pos_img = M('image')->fetOne('type = "pos" and no ='.$no);

        if($pos_img['url']){
            $pos_img['url'] = base_url().$pos_img['url'];
        }

        $this->response($pos_img);
    }

    function env_show_image_get($no){
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

    function env_svg_get($parent_env_no = null){
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


	public function box_add_post_nologin(){
		$box = array();
		$box['env_no'] = $this->get_post("env_no");
		$box['name'] = $this->get_post("name");
		$box['map'] = $this->get_post("map");
		$box['locate'] = $this->get_post("locate");
		$box['sort'] = $this->get_post("sort");
		$box['size'] = $this->get_post("size");
		$box['volume'] = $this->get_post("volume");
		$box['type'] = "囊匣";

		if($box){
			$check_box = M("box")->find("env_no = '".$box['env_no']."'");
			if($check_box){
				$this->response(array("result"=>false,"msg"=>"该囊匣编号已存在","env_no"=>$check_box['env_no']));
			}else{
				$ret = M("box")->add($box);
				if($ret){
					$this->response(array("result"=>true,"msg"=>"囊匣添加成功","env_no"=>$box['env_no']));
				}
			}
		}
	}

	public function box_edit_post_nologin(){
		$env_no = $this->get_post("env_no");
		$alert_status = $this->get_post("alert_status");
		$alert_param = $this->get_post("alert_param");
		$name = $this->get_post("name");
		$size = $this->get_post("size");
		$volume = $this->get_post("volume");
		$map = $this->get_post("map");
		$locate = $this->get_post("locate");

		$up_data = array();
		if(isset($env_no)&&$env_no){
			if(isset($alert_status)){
				$up_data['alert_status'] = $alert_status;
			}
			if(isset($alert_param)){
				$up_data['alert_param'] = $alert_param;
			}
			if(isset($name)&&$name){
				$up_data['name'] = $name;
			}

			if(isset($size)&&$size){
				$up_data['size'] = $size;
			}

			if(isset($volume)&&$volume){
				$up_data['volume'] = $volume;
			}

			if(isset($map)&&$map){
				$up_data['map'] = $map;
			}

			if(isset($locate)&&$locate){
				$up_data['locate'] = $locate;
			}

			if($up_data){
				$ret = M("box")->update($up_data,"env_no = '".$env_no."'");
				$this->response($ret);
			}
		}
	}

}