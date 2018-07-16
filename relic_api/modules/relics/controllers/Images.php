<?php

/**
 * Created by PhpStorm.
 * User: Hebj
 * Date: 2017/4/5
 * Time: 16:41
 */
class Images extends MY_Controller
{
    public function __construct()
    {
        parent::__construct();
    }

    function pic_get($relic_no = '')
    {
        $m = M('image');
        $list = $m->fetAll("no='" . $relic_no . "' and `type` in ('home','show')", '*', 'id desc');

        $this->response($list);

    }


    function pic_post_nologin($relic_no = '')
    {

        $url = $this->get_post('url');

        $m = M('image');
        $count=$m->count("no='".$relic_no."'");
        $data['no'] = $relic_no;
        $data['type'] = 'show';
        if(!$count){
            $data['type']='home';
        }
        $data['url'] = $url;
        $relic = M("relic")->fetOne("relic_no = '{$relic_no}'");
        if(!isset($relic['relic_id'])|| !$relic['relic_id']){
            $relic['relic_id'] = $relic['relic_no'];
        }
        $urls = explode(".",$url);
        $suffix = array_pop($urls);
        $save_path = "/uploads/relic/".$relic['relic_id'].".{$suffix}";
        $org_url =$_SERVER['DOCUMENT_ROOT'] .$url;
        if(copy($org_url,$_SERVER['DOCUMENT_ROOT'] . $save_path)){
            $small_img = "/uploads/relic/".$relic['relic_id']."_small.{$suffix}";
            resizeImage($org_url,150,150,$_SERVER['DOCUMENT_ROOT'].$small_img);
            M("relic")->save(array("image"=>$small_img,'relic_id'=>$relic['relic_no']),"relic_no = '".$relic_no."'");
            $data['url'] = $save_path;
            unlink("../..".$url);
        }
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

    function pic_home_post($id = '')
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
        M("relic")->save(array("image"=>$row['url']),"relic_no = '".$row['no']."'");
        $this->response(array('msg' => '设置成功'));
    }
}