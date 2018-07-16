<?php

class Edit extends MY_Controller
{
    function index_post($env_no = '')
    {
//        if(!M("common/permission")->check_permission("修改环境信息",$this->_user)){
//            $this->response(array('error' => '无权限修改环境信息'));
//        }
        $post_env_no = $this->post('env_no');
        $parent_no = $this->post('parent_no');
        $name = $this->post('name');
        $type = $this->post('type');
        $map = $this->post('map');
        $locate = $this->post('locate');
        $sort = $this->post('sort');

        if (!isset($env_no)||$env_no=='') {
            $this->response(array('error' => '没有找到环境编号'));
        }

        $m = M('env');
        $old = $m->find("env_no='" . $env_no . "'");
        if (!$old) {//环境编号不存在
            $this->response(array('error' => '该环境编号信息不存在'));
        }

        $data = array();
        if (isset($name)) $data['name'] = $name;
        if (isset($post_env_no)) {
        	$env_no=$data['env_no'] = $post_env_no;
        }
        if (isset($parent_no)) $data['parent_no'] = $parent_no;
        if (isset($type)) $data['type'] = $type;
        if (isset($map)) $data['map'] = $map;
        if (isset($locate)) $data['locate'] = $locate;
        if (isset($sort)) $data['sort'] = $sort;
        if(count($data)==0){
        	$this->response(array("error"=>'没有任何修改数据'));
        }
        $edit = $m->save($data, $old['id']);
        if (!$edit) {
            $this->response(array('error' => '修改失败!'));
        }
        $this->response(array('env_no' => $env_no, 'msg' => '修改成功!'));

    }

}