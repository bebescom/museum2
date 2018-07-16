<?php

/**
 * Created by PhpStorm.
 * User: Hebj
 * Date: 2017/4/25
 * Time: 15:21
 */
class Monitor_data extends MY_Controller
{
    public function __construct()
    {
        parent::__construct();
        $this->order_time = "equip_time";
    }

    public function index_get(){
        $env_no = $this->get_post('env_no');
        $equip_no = $this->get_post('equip_no');
        $time = $this->get_post('time');
        $params = $this->get_post('params');

        $where = "1=1";
        if($env_no){
            $where .= " and env_no like '{$env_no}%'";
        }
        if($equip_no){
            $where .= " and equip_no in ('".implode("','",explode(',',$equip_no))."')";
        }
        if($time){
            $deal_time = explode(',',$time);
            $where .= " and {$this->order_time} between {$deal_time[0]} and {$deal_time[1]}";
        }
        $select = "env_no,equip_no,".$this->order_time;
        if($params){
            $select .= ",".$params;
            $params = explode(',',$params);
            $or_where = array();
            foreach ($params as $param) {
                $or_where[] = " {$param} is not null and {$param} != '' and {$param} != ".'"NaN"';
            }
            if(isset($or_where)&&$or_where){
                $where .= " and (".implode(" or ",$or_where).")";
            }
        }

        $sql = "select {$select} from data_sensor where {$where} order by {$this->order_time}";
        $data_sensors = $this->db->query($sql)->result_array();
        $data = array(
            'total'=>sizeof($data_sensors),
            'rows'=>$data_sensors
        );
        $this->response($data);
    }

    public function data_count_get()
    {
        $env_no = $this->get_post('env_no');
        $equip_no = $this->get_post('equip_no');
        $time = $this->get_post('time');
        $params = $this->get_post('params');

        $where = "1=1";
        if($env_no){
            $where .= " and env_no like '{$env_no}%'";
        }
        if($equip_no){
            $where .= " and equip_no in ('".implode("','",explode(',',$equip_no))."')";
        }
        if($time){
            $deal_time = explode(',',$time);
            $where .= " and {$this->order_time} between {$deal_time[0]} and {$deal_time[1]}";
        }
        $select = "env_no,equip_no,".$this->order_time;
        if($params){
            $select .= ",".$params;
            $params = explode(',',$params);
            $or_where = array();
            foreach ($params as $param) {
                $or_where[] = " {$param} is not null and {$param} != '' and {$param} != ".'"NaN"';
            }
            if(isset($or_where)&&$or_where){
                $where .= " and (".implode(" or ",$or_where).")";
            }
        }

        $sql = "select count(*) as total from data_sensor where {$where}";
        $data_total = $this->db->query($sql)->row_array();

        $this->response($data_total);
    }
}