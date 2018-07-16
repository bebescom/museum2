<?php

/**
 * Created by PhpStorm.
 * User: Hebj
 * Date: 2016/10/26
 * Time: 13:56
 */
class Relic_threshold extends MY_Controller
{
    function __construct()
    {
        parent::__construct();
    }

    function index_get(){
        $type = $this->get_post("type");
        $type = explode(",",$type);
        $where = "1=1";
        if($type){
            $where .= " and type in ('".implode("','",$type)."')";
        }
        $relic_threshold = M("threshold")->fetAll($where);
        if(!$relic_threshold){
            $relic_threshold = M("threshold")->fetAll("type = '其他'");
        }

        $data = array(
            'total'=>sizeof($relic_threshold),
            "rows"=>$relic_threshold
        );

        $this->response($data);
    }

    public function type_get(){
        $relic_threshold = M("threshold")->fetAll();

        $type = array();
        if($relic_threshold){
            foreach($relic_threshold as $rt){
                $type[] = $rt['type'];
            }
        }

        $ret = implode(",",$type);

        $this->response($ret);
    }
}