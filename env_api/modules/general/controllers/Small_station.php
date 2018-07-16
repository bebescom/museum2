<?php

/**
 * Created by PhpStorm.
 * User: Hebj
 * Date: 2018/5/2
 * Time: 11:12
 */
class Small_station extends MY_Controller
{
    public function __construct()
    {
        parent::__construct();
    }

    public function index()
    {
        $time = $this->get_post('time');
        if($time){
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
        }else{
            $end_time = time();
            $start_time = $end_time - 24 * 3600;
        }
        $data = array();
        $small_station_config = API("get/base/config/museum_config",array("keys"=>"small_weather_no,small_weather,max_transmission_time_interval"));
        $max_sleep = 1000000000;
        if(isset($small_station_config['max_transmission_time_interval'])&&$small_station_config['max_transmission_time_interval']){
            $max_sleep = $small_station_config['max_transmission_time_interval'];
        }
        if(isset($small_station_config['small_weather_no'])&&$small_station_config['small_weather_no']){
            $equip_nos = array_values(json_decode($small_station_config['small_weather_no'],true));
            $equips = M('equip')->fetAll("equip_no in ('".implode("','",$equip_nos)."')","equip_no,sleep");
            $equip_info = array();
            if($equips){
                foreach ($equips as $equip) {
                    if(isset($equip['equip_no'])&&$equip['equip_no']){
                        if(isset($equip['sleep'])&&$equip['sleep']){
                            $equip_info[$equip['equip_no']] = $equip['sleep'];
                        }
                    }
                }
            }
            $where = "equip_time between {$start_time} and {$end_time} and equip_no in('".implode("','",$equip_nos)."')";
            $select = "equip_no,equip_time";
            $params = array("temperature","humidity","co2","no","so2","o3");
            $select .= ",".implode(",",$params);
            $data_sensors = M('data_sensor')->fetAll($where,$select,"equip_time asc");

            if($data_sensors){
                $pre_time = array();
                foreach ($data_sensors as $data_sensor) {
                    if(isset($data_sensor['equip_time'])&&$data_sensor['equip_time']){
                        $current_time = $data_sensor['equip_time'];
                        $current_equip_no = $data_sensor['equip_no'];
                        foreach ($params as $param) {
                            if(!isset($data[$param])){
                                $data[$param] =  array();
                            }
                            if(isset($data_sensor[$param])&& $data_sensor[$param] != "NaN"&& $data_sensor[$param] != ""){
                                if(!isset($pre_time[$param])){
                                    $data[$param][] = array($current_time*1000,$data_sensor[$param]);
                                    $pre_time[$param] = $data_sensor['equip_time'];
                                }else{
                                    if(isset($equip_info[$current_equip_no])){
                                        $diff_time = $current_time - $pre_time[$param];
                                        if($diff_time > $max_sleep*$equip_info[$current_equip_no]){
                                            $fill_time = floor(($current_time+$pre_time[$param])/2);
                                            $fill_point = array($fill_time*1000,"-");
                                            $data[$param][] = $fill_point;
                                        }else{
                                            $data[$param][] = array($current_time*1000,$data_sensor[$param]);
                                        }
                                    }else{
                                        $data[$param][] = array($current_time*1000,$data_sensor[$param]);
                                    }
                                    $pre_time[$param] = $data_sensor['equip_time'];
                                }
                            }

                        }
                    }
                }
            }
        }
        /**************************************风向风速处理（风向玫瑰图）****************************************************/
        $w_data = array( '北风'=>array(),'东北偏北风'=>array(),'东北风'=>array(),'东北偏东风'=>array(),
            '东风'=>array(), '东南偏东风'=>array(), '东南风'=>array(), '东南偏南风'=>array(),
            '南风'=>array(), '西南偏南风'=>array(), '西南风'=>array(), '西南偏西风'=>array(),
            '西风'=>array(), '西北偏西风'=>array(), '西北风'=>array(), '西北偏北风'=>array(),
            'Total'=>array()
        );
        $wind_count = 0;
        $weather_datas = M("weather_data")->fetAll("equip_time between {$start_time} and {$end_time}",'wind_speed,wind_direction,equip_time');
        if($weather_datas){
            foreach ($weather_datas as $weather_data) {
                if(isset($weather_data['wind_direction'])&&$weather_data['wind_direction'] != "NaN"&&$weather_data['wind_direction'] != ""){
                    $direction = M('environments/weather')->wind_direction($weather_data['wind_direction']);
                    if($direction){
                        $w_data[$direction][] = deal_data_decimal("wind_speed",$weather_data['wind_speed']);
                    }
                    $wind_count++;
                }
            }
        }
        $w_per_data = array();//百分比
        if($w_data){
            foreach($w_data as $wd=>$ws){
                $temp = array(
                    "零级"=>array(),
                    "一级"=>array(),
                    "二级"=>array(),
                    "三级"=>array(),
                    "四级"=>array(),
                    "五级"=>array(),
                    "六级以上"=>array()
                );
                foreach($ws as $wsv){
                    if($wsv < 0.3){
                        $temp['零级'][] = $wsv;
                    }else if($wsv >= 0.3 && $wsv < 1.6){
                        $temp['一级'][] = $wsv;
                    }else if($wsv >= 1.6 && $wsv < 3.4){
                        $temp['二级'][] = $wsv;
                    }else if($wsv >= 3.4 && $wsv < 5.5){
                        $temp['三级'][] = $wsv;
                    }else if($wsv >= 5.5 && $wsv < 8.0){
                        $temp['四级'][] = $wsv;
                    }else if($wsv >= 8.0 && $wsv < 10.8){
                        $temp['五级'][] = $wsv;
                    }else if($wsv >= 10.8){
                        $temp['六级以上'][] = $wsv;
                    }
                }
                $w_per_data[$wd] = array();
                if($wind_count){
                    foreach($temp as $tem){
                        $w_per_data[$wd][] = round(sizeof($tem)/$wind_count * 100,2);
                    }
                }
                foreach($w_per_data as $wpdk=> $wpd){
                    if($wpdk != "Total"){
                        $w_per_data['Total'][] = array_sum($wpd);
                    }
                }
            }
        }
        $data['wind'] = $w_per_data;
        $ret_data = array(
            'data'=>$data
        );
        $this->response($ret_data);
    }

    protected function _deal_time($time)
    {
        if (isset($time) && $time) {
            switch ($time) {
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
                    $e_time = $s_time + 24 * 3600;
                    break;
                case 'week':
                    $today = date("Y-m-d");
                    $week = date('w', strtotime($today));
                    $s_time = strtotime($today . "-" . ($week ? $week - 1 : 6) . ' days');
                    $e_time = time();
                    break;
                case 'month':
                    $e_time = time();
                    $s_time = mktime(0, 0, 0, date("m"), 1, date("Y"));
                    break;
                default:
                    $time_array = explode(',', $time);
                    $s_time = $time_array[0];
                    $e_time = $time_array[1];
                    break;
            }
        } else {
            $e_time = time();
            $s_time = $e_time - 24 * 3600;
        }

        return array('s_time' => $s_time, 'e_time' => $e_time);
    }
}