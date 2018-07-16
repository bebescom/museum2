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

    function index()
    {
        $no = $this->get_post('no');
        $limit = $this->get_post('limit');
        $page = $this->get_post('page');

        $where = "1=1";
        if(isset($no)&&$no){
            $where .= " and no = '{$no}'";
        }

        if(!$limit){
            $limit = 10;
        }
        if(!$page){
            $page = 1;
        }

        $offset = ($page - 1)*$limit;
        $m = M('image');
        $total = $m->count($where);
        $list = $m->fetAll($where, '*', 'id desc',$offset,$limit);

        $data = array(
            "total"=>$total,
            'rows'=>$list
        );
        $this->response($data);
    }


    function add_images()
    {
        $no = $this->get_post('no');
        $urls = $this->get_post('urls');
        if(!$no){
            $this->response(array('error' => '编号不能为空'));
        }

        if($urls){
            $image_datas = array();
            foreach ($urls as $url) {
                $temp = "('{$no}','show','{$url}')";
                $image_datas[] = $temp;
            }

            $insert_sql = "insert into image (`no`,`type`,`url`) values ".implode(',',$image_datas);
            $ret = $this->db->query($insert_sql);
        }

        if (!$ret || !isset($ret)) {
            $this->response(array('error' => '添加失败'));
        }

        $this->response(array("result"=>true,'msg' => '添加成功'));

    }

    function del_images()
    {
        $no = $this->get_post('no');
        $id = $this->get_post('id');

        $where = "1=1";
        if($no){
            $where .= " and no = '{$no}'";
        }

        if($id){
            $where .= " and id = '{$id}'";
        }
        $ret = M('image')->delete($where);
        if(!$ret){
            $this->response(array('msg' => '删除失败'));
        }

        $this->response(array("result"=>true,'msg' => '删除成功'));
    }

    function home_images($id = '')
    {
        if (empty($id)) {
            $this->response(array('error' => 'id不存在'));
        }
        $m = M('image');
        $row = $m->find($id);
        if (!$row) {
            $this->response(array('error' => '没有找到该图片'));
        }

        $ret = M('equip')->update(array('image'=>$row['url']),"equip_no = '{$row['no']}'");
        if($ret){
            $m->save(array('type' => 'show'), "no='" . $row['no'] . "' and type='home'");
            $m->save(array('type' => 'home'), $id);
            $this->response(array("result"=>true,'msg' => '设置成功'));
        }
        $this->response(array('error' => '设置失败'));
    }
}