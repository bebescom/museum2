<?php

/**
 * Created by PhpStorm.
 * User: Hebj
 * Date: 2017/2/21
 * Time: 11:10
 */
class Compare extends MY_Controller
{
    public function __construct()
    {
        parent::__construct();
        $this->order_time = "equip_time";

        $this->fileds = array("equip_no" , "env_no" , "humidity" , "temperature" , "voc" , "co2" , "uv" , "light" ,
            "organic" , "inorganic" , "sulfur" , "dip" , "acceleration" , "canbi" , "voltage" , "rssi" , "move_alert" ,
            "box_open_alert" , "box_status" , "wind_speed" , "wind_direction" , "rain" , "air_presure" , "pm10" , "pm25" ,
            "equip_time" , "server_time" , "ip_port" , "php_time" , "alert_param" , "status" , "soil_humidity" ,
            "soil_temperature" , "soil_conductivity","soil_salt" , "broken" , "vibration" , "multi_wave" , "cascophen" );
    }

    public function compare_by_equip(){
        $equip_nos = $this->get_post("equip_nos");
        $time = $this->get_post("time");
        $index = $this->get_post('index');

        $time = M("monitor/monitor")->time_change($time);
        if(!$equip_nos||!isset($equip_nos)){
            $this->response(array("error"=>"设备编号不能为空"));
        }
        $where = "1=1";
        $where .= " and equip_no in ('".implode("','",explode(",",$equip_nos))."')";
        $equips = M("equip")->fetAll($where,"equip_no,parameter");
        $params = array();//确定所需参数字段
        if($equips){
            foreach($equips as $equip){
                if(isset($equip['parameter'])&&$equip['parameter']){
                    $params = array_merge($params,explode(",",$equip['parameter']));
                }
            }
           $params =  array_unique($params);
        }
        $where .= " and ".$this->order_time." between ".$time['s_time']." and ".$time['e_time'];
        $data_sensor = M("data_sensor")->fetAll($where,implode(",",$this->fileds),$this->order_time." asc");
        $data = array();
        $has_data_no = array();
        if($data_sensor){
            foreach ($data_sensor as $ds) {
                $dt = isset($ds[$this->order_time])?$ds[$this->order_time]:"";
                $equip_no = isset($ds["equip_no"])?$ds["equip_no"]:"";
                if($equip_no&&!in_array($equip_no,$has_data_no)){
                    $has_data_no[] = $equip_no;
                }
                if($params){
                    foreach ($params as $param) {
                        if(isset($ds[$param])&&$ds[$param] != ""&&$ds[$param] != null&&$dt){
                            $ds[$param] = deal_data_decimal($param,$ds[$param]);
                            if(!isset($data[$param])){
                                $data[$param] = array();
                            }
                            if(!isset($data[$param][$equip_no])){
                                $data[$param][$equip_no] = array();
                            }
                            $data[$param][$equip_no][] = array($dt*1000,$ds[$param]);
                        }
                    }
                }
            }
        }

        $no_data_no = explode(',',$equip_nos);//无数据设备
        if($has_data_no){
            $no_data_no = array_values(array_diff(explode(',',$equip_nos),$has_data_no));
        }
        $result = array(
            'index'=>$index,
            'data'=>$data,
            "no_data_no"=>$no_data_no
        );
        $this->response($result);
    }

}