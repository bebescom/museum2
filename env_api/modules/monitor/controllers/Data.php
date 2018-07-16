<?php

/**
 * Created by PhpStorm.
 * User: Hebj
 * Date: 2017/9/30
 * Time: 9:16
 */
class Data extends MY_Controller
{
    public function __construct()
    {
        parent::__construct();
    }

    public function line_by_equip_get()
    {
        $time = $this->get_post("time");
        $param = $this->get_post("param");
        $index = $this->get_post("index");
        $env_no = $this->get_post('env_no');

        $data = array(
            "index"=>$index,
            "param"=>array(),
            'yAxis'=>array()
        );
        if(isset($time)&&$time){
            switch($time){
                case '24h':
                    $e_time = time();
                    $s_time = $e_time - 24 * 3600;
                    break;
                case 'today':
                    $s_time = strtotime('today');
                    $e_time = time();
                    break;
                case 'yesterday':
                    $s_time = strtotime('yesterday');
                    $e_time = $s_time + 24*3600;
                    break;
                case 'week':
                    $today = date("Y-m-d");
                    $week = date('w',strtotime($today));
                    $s_time = strtotime($today ."-".($week ? $week - 1 : 6).' days');
                    $e_time = time();
                    break;
                case 'month':
                    $e_time = time();
                    $s_time = mktime(0,0,0,date("m"),1,date("Y"));
                    break;
                default:
                    $time_array = explode(',',$time);
                    $e_time = strtotime('today');
                    if(isset($time_array[1])&&$time_array[1]){
                        $e_time = $time_array[1];
                    }
                    $s_time = strtotime('yesterday');
                    if(isset($time_array[0])&&$time_array[0]){
                        $s_time = $time_array[0];
                    }
                    break;
            }
        }else{
            $e_time = time();
            $s_time = $e_time - 24 * 3600;
        }

        $where = "1=1";
        if(strlen($env_no) <= 12||(isset($env_info[$env_no]['type']))&&in_array($env_info[$env_no]['type'],array("楼栋","楼层"))){
            $where = "env_no LIKE '{$env_no}%'";
        }else{
            $where = "env_no  = '{$env_no}'";
        }
        $where .= " AND equip_time >= {$s_time} AND equip_time <= {$e_time}";

        $sql = "select * FROM data_sensor WHERE {$where}";
        $data_sensor = $this->db->query($sql)->result_array();
        $all_data = array();
        if($data_sensor){
            foreach ($data_sensor as $ds) {
                if(isset($ds['equip_no'])&&$ds['equip_no']){
                   if($ds[$param] != null&& isset($ds[$param])&& $ds[$param] != ''&& $ds[$param] != "NaN"){
                       if(!isset($data['param'][$ds['equip_no']])){
                           $data['param'][$ds['equip_no']] = array();
                       }
                       $data['param'][$ds['equip_no']][] = array($ds['equip_time']*1000,$ds[$param]);
                       $all_data[] = $ds[$param];
                   }
                }
            }
        }
        if($all_data){
            $data['yAxis']['min'] = min($all_data);
            $data['yAxis']['max'] = max($all_data);
        }

        $this->response($data);
    }
}