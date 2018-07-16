<?php

class Setting extends MY_Controller
{

    function __construct()
    {
        parent::__construct();

    }

    function pic_get($env_no = '')
    {
        $m = M('image');
        $list = $m->fetAll("no='" . $env_no . "' and `type` in ('home','show')", '*', 'id desc');

        $this->response($list);

    }


    function pic_post_nologin($env_no = '')
    {

        $url = $this->post('url');

        $m = M('image');
        $count=$m->count("no='".$env_no."'");
        $data['no'] = $env_no;
        $data['type'] = 'show';
        if(!$count){
            $data['type']='home';
        }
        $data['url'] = $url;
        $i = $m->add($data);

        if (!$i) {
            $this->response(array('error' => '添加失败'));
        }

        $this->response(array('msg' => '添加成功'));

    }

    function pic_del_post($id = '')
    {
        if (empty($id)) {
            $this->response(array('error' => 'id不存在'));
        }
        M('image')->delete($id);

        $this->response(array('msg' => '删除成功'));
    }

    function pic_home($id = '')
    {
        if (empty($id)) {
            $this->response(array('error' => 'id不存在'));
        }
        $m = M('image');
        $row = $m->find($id);
        if (!$row) {
            $this->response(array('error' => '没有找到该图片'));
        }
        $m->save(array('type' => 'show'), "no='" . $row['no'] . "' and type='home'");
        $m->save(array('type' => 'home'), $id);

        $this->response(array('msg' => '设置成功'));
    }


    function bg_post()
    {

        $app_name = $this->post('app_name');
        $museum_name = $this->post('museum_name');
        $museum_no = $this->post('museum_no');
        $bg = $this->post('map');
        
        $m = M('config');
        $save_keys=array(
            'app_name'=>$app_name,
            'museum_name'=>$museum_name,
            'museum_no'=>$museum_no,
            'bg'=>$bg
        );

        foreach($save_keys as $key=>$val){
            if(empty($val)||$val==''){
                continue;
            }

            $row = $m->find("`key`='".$key."'");

            if ($row) {
                $data = array(
                    'val' => $val,
                );
                $m->save($data, $row['id']);
            } else {
                $data = array(
                    'key' => $key,
                    'val' => $val,
                    'group' => 'system',
                    'input_type' => 'text'
                );
                $i = $m->add($data);
                if (!$i) {
                    $this->response(array('error' => '添加'.$key.'失败'));
                }
            }
        }
        
        $this->response(array('msg' => '保存成功'));

    }


}