<?php

/**
 * Created by PhpStorm.
 * User: Hebj
 * Date: 2017/6/12
 * Time: 11:29
 */
class Vibration extends MY_Controller
{
    function __construct()
    {
        parent::__construct();
        $sensor_param = M("equip")->get_parameters('sensor');
        $this->param = array();
        if($sensor_param){
            foreach($sensor_param as $sp){
                if(isset($sp['param'])&&$sp['param']){
                    $this->param[$sp['param']] = array("name"=>$sp['name'],"unit"=>$sp['unit']);
                }
            }
        }
    }

    public function lines_get()
    {
        $equip_no = $this->get_post('equip_no');
        $time = $this->get_post('time');

        $equip = M("equip")->find("equip_no = '".$equip_no."'");

        $d_time = M("equip")->get_time($time);
        $s_time = $d_time['s_time'];
        $e_time = $d_time['e_time'];

        $vib_datas = M("data_sensor_vibration_count")->fetAll("count_time between {$s_time} and {$e_time}");

        $data = array(
            'total'=>sizeof($vib_datas),
            'rows'=>$vib_datas
        );
        $data = array_merge($data,$this->param['vibration']);

        $this->response($data);
    }
}