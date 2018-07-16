<?php

/**
 * Created by PhpStorm.
 * User: Hebj
 * Date: 2016/10/28
 * Time: 14:07
 */
class Active extends MY_Controller
{
    public function __construct()
    {
        parent::__construct();
    }

    public function index_get()
    {
        $active_key = $this->get_post('key');
        $user = $this->_user;
        $data = array();
        if(isset($user['id'])&&$user['id']){
            $user_id = $user['id'];
            $where = "uid = ".$user_id;
            if($active_key){
                $where .= " and `key` = '{$active_key}'";
            }
            $actives = M("user_active")->fetAll($where);
            if($actives){
                foreach ($actives as $key=>$active){
                    if(isset($active['key'])&&$active['key']){
                        if(!isset($data[$active['key']])){
                            $data[$active['key']] = array();
                        }
                    }

                    if(isset($active['value'])&&$active['value']){
                        $data[$active['key']] = json_decode($active['value']);
                    }
                }
            }
        }
        if($active_key){
            $data = $data[$active_key];
        }
        $this->response($data);
    }

    public function active_add_post(){
        $key = $this->get_post("key");
        $env_no = $this->get_post("env_no");

        $uid = $this->_user['id'];

        $actives = M("user_active")->fetAll(array("uid"=>$uid));

        if(isset($key)&&$key){
            $active = array();
            $follow = array();
            if($actives){
                foreach ($actives as $atv){
                    if(isset($atv['key'])&&$atv['key'] == $key){
                        $active = $atv;
                    }
                    if(isset($atv['key'])&&$atv['key'] == "关注"){
                        if(isset($atv['value'])){
                            $follow = json_decode($atv['value'],true);
                        }
                    }
                }
            }
            $data = array();
            if($active){
                $value = array();
                if(isset($active['value'])){
                    $value = json_decode($active['value'],true);
                }
                if(isset($env_no)&&$env_no){
                    if(isset($value[$env_no])){
                        $value[$env_no]['last_time'] = time();
                    }else{
                        $value[$env_no] = array(
                            "last_time"=>time()
                        );
                    }
                }
                if($value){
                    uasort($value, function($a,$b){
                        if(isset($a['last_time'])&&isset($b['last_time'])){
                            if($a['last_time'] == $b['last_time']) return 0;
                            return ($a['last_time'] > $b['last_time'])? -1:1;
                        }
                    });
                }
                if($key == "浏览"){
                    if(sizeof($value)>5){
                        array_pop($value);
                    }
                }
                $data['value'] = json_encode($value);
                $ret = M("user_active")->update($data,array("uid"=>$uid,"key"=>$key));
            }else{
                $data["uid"]= $uid;

                if(isset($key)&&$key){
                    $data["key"] = $key;
                }
                $value = array();
                if(isset($env_no)&&$env_no){
                    $value[$env_no] = array(
                        "last_time"=>time()
                    );
                }
                $data['value'] = json_encode($value);
                $ret = M("user_active")->add($data);
            }

            if($key == "浏览"){
                if($follow && in_array($env_no,array_keys($follow))){
                    $follow_atv = array(
                        "uid"=>$uid,
                        "key"=>"关注"
                    );
                    $follow[$env_no] = array(
                        "last_time"=>time()
                    );
                    if($follow){
                        uasort($follow, function($a,$b){
                            if(isset($a['last_time'])&&isset($b['last_time'])){
                                if($a['last_time'] == $b['last_time']) return 0;
                                return ($a['last_time'] > $b['last_time'])? -1:1;
                            }
                        });
                    }
                    $follow_atv['value'] = json_encode($follow);
                    M("user_active")->update($follow_atv,array("uid"=>$uid,"key"=>"关注"));
                }
            }
        }else{
            $ret = false;
        }

        $result = $ret?array("result"=>true,"msg"=>"添加成功"):array("result"=>false,"msg"=>"添加失败");

        $this->response($result);
    }

    function alert_activity_post(){
        $alert_type = $this->get_post('alert_type');

        $uid = $this->_user['id'];
        $actives = M("user_active")->fetOne(array("uid"=>$uid,'key'=>'查看预警'));

        if(!$alert_type || !isset($alert_type)){
            $this->response('预警类型不能为空');
        }
        if(isset($alert_type)&&$alert_type) {
            $check_alert = array();
            if ($actives) {
                if (isset($actives['value'])) {
                    $check_alert = json_decode($actives['value'], true);
                }
            }

            $data = array();
            if($check_alert){
                $check_alert[$alert_type] = array('last_time'=>time());
                $data['value'] = json_encode($check_alert);
                $ret = M("user_active")->update($data,array("uid"=>$uid,"key"=>"查看预警"));
            }else{
                $check_alert[$alert_type] = array('last_time'=>time());
                $data['uid'] = $uid;
                $data['key'] = '查看预警';
                $data['value'] = json_encode($check_alert);
                $ret = M("user_active")->add($data);
            }
        }

        $result =array("result"=>false,"msg"=>"添加失败");
        if(isset($ret)&&$ret){
            $result = array("result"=>true,"msg"=>"添加成功");
        }

        $this->response($result);
    }

    function time_sort($a,$b){
        if($a['last_time'] == $b['last_time']) return 0;
        return ($a['last_time'] > $b['last_time'])? -1:1;
    }

    public function follow_delete_post(){
        $env_no = $this->get_post('env_no');

        $uid = $this->_user['id'];
        $active = M("user_active")->fetOne(array("uid"=>$uid,"key"=>"关注"));
        if(isset($active['value'])&&$active['value']){
            $value = json_decode($active['value'],true);
            if($env_no){
                if(isset($value[$env_no])){
                    unset($value[$env_no]);
                }
            }
        }
        $data = array();
        $ret = false;

        if(isset($value)){
            uasort($value, function($a,$b){
                if(isset($a['last_time'])&&isset($b['last_time'])){
                    if($a['last_time'] == $b['last_time']) return 0;
                    return ($a['last_time'] > $b['last_time'])? -1:1;
                }
            });

            $data["value"] = json_encode($value);
            $ret = M("user_active")->update($data,array("uid"=>$uid,"key"=>"关注"));

            if($ret){
                $this->response(array("result"=>true,"msg"=>"已取消"));
            }
        }

        $this->response(array("result"=>false,"msg"=>"取消失败"));
    }
}