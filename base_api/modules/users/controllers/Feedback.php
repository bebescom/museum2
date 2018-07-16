<?php

/**
 * Created by PhpStorm.
 * User: Hebj
 * Date: 2016/11/18
 * Time: 14:22
 */
class Feedback extends MY_Controller
{
    public function __construct()
    {
        parent::__construct();
    }

    public function feedback_list_get(){
        $uid = $this->get_post("uid");
        $time = $this->get_post("time");
        $page = $this->get_post("page");
        $limit = $this->get_post("limit");
        $content = $this->get_post("content");

        $where = "1=1";
        if(isset($uid)&&$uid){
            $where .= " and uid = ".$uid;
        }

        if(isset($time)&&$time){
            switch($time){
                case '24h':
                    $end_time = time();
                    $start_time = $end_time - 24 * 3600;
                    break;
                case 'today':
                    $start_time = strtotime('today');
                    $end_time = time();
                    break;
                case 'yesterday':
                    $start_time = strtotime('yesterday');
                    $end_time = $start_time + 24*3600;
                    break;
                case 'week':
                    $today = date("Y-m-d");
                    $week = date('w',strtotime($today));
                    $start_time = strtotime($today ."-".($week ? $week - 1 : 6).' days');
                    $end_time = time();
                    break;
                case 'month':
                    $end_time = time();
                    $start_time = mktime(0,0,0,date("m"),1,date("Y"));
                    break;
                default:
                    $time_array = explode(',',$time);
                    $start_time = strtotime($time_array[0]);
                    $end_time = strtotime($time_array[1]);
                    break;
            }
            if(isset($start_time)&&isset($end_time)){
                $where .= " and time between ".$start_time ." and ".$end_time;
            }
        }

        if(isset($content)&&$content){
            $where .= " and content like '%".$content."%'";
        }

        if(!isset($page)||!$page){
            $page = 1;
        }

        if(!isset($limit)||!$limit){
            $limit = 10;
        }

        $offset = ($page - 1)*$limit;

        $feedbacks = M("user_feedback")->fetAll($where,""," time desc",$offset,$limit);

        $data = array(
            'total'=>sizeof($feedbacks),
            "rows"=>$feedbacks
        );

        $this->response($data);
    }

    public function feedback_add_post(){
        $content = $this->get_post("content");
        $feedback = array();
        if (!isset($this->_user['id'])) {
            $this->response(array('error' => '获取不了用户信息'));
        }
        $feedback['uid'] = $this->_user['id'];
        $feedback['time'] = time();
        if(isset($content)&&$content){
            $feedback['content'] = $content;
        }

        $ret = M("user_feedback")->add($feedback);
        $result = $ret?array("result"=>true,"msg"=>"添加成功"):array("result"=>false,"msg"=>"添加失败");

        $this->response($result);
    }

    public function feedback_delete_post(){
        $ids = $this->get_post("id");
        if($ids){
            $where = " id in (".$ids.")";
            $ret = M("user_feedback")->delete($where);
        }
        $result = array("result"=>false,"msg"=>"删除失败");
        if(isset($ret)&&$ret){
            $result = array("result"=>true,"msg"=>"删除成功");
        }
        $this->response($result);
    }
}