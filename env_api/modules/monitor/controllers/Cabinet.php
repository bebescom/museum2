<?php

/**
 * Created by PhpStorm.
 * User: Hebj
 * Date: 2017/6/12
 * Time: 15:08
 */
class Cabinet extends MY_Controller
{
    function __construct()
    {
        parent::__construct();
    }

    public function index_get()
    {
        $data_order = "equip_time";

        //获取设备参数
        $m=M("equipments/equip");
        $sensor_parameters = $m->get_parameters('sensor');

        $cabinets =  API("get/base/envs", array("type" => "展柜"));
        if(isset($cabinets['rows'])&&$cabinets['rows']){
            foreach ($cabinets['rows'] as $k=>$row) {
                if(isset($row['env_no'])&&$row['env_no']){
                    $start_time = time() - 24*3600;
                    $data_sensor = $this->db->select('*')->where("env_no = '".$row['env_no']."' and {$data_order} >= ".$start_time)
                        ->limit(50)->order_by($data_order.' desc')
                        ->get('data_sensor')->result_array();

                    if($data_sensor){
                        $data_sensor = array_reverse($data_sensor);
                        foreach($sensor_parameters as $sp){
                            $param = $sp['param'];
                            foreach($data_sensor as $ds){
                                if(isset($ds[$param])&& $ds[$param] != ""&& $ds[$param] != "NaN"&& $ds[$param] != null){
                                    $row[$param] = $ds[$param];
                                    $row['time'] = date("Y-m-d H:i");
                                }
                            }
                        }
                    }
                    $cabinets['rows'][$k] = $row;
                }
            }
        }

        $this->response($cabinets);
    }
}