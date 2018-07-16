<?php

/**
 * Created by PhpStorm.
 * User: Hebj
 * Date: 2017/8/9
 * Time: 16:46
 */
class Equip_alert_model extends MY_Model
{
    /**
     * 设备数据错误
     * @param $equip  array   设备信息
     * @param $data  array  监测数据
     * @return 数据写入结果
     **/
    function _data_filter($equip,$data)
    {
        $parameters = M("equipments/equip")->get_parameters('sensor');
        $params = array();
        foreach($parameters as $parameter){
            $params[$parameter['param']] = $parameter;
        }
        if(!isset($params)||empty($params)){
            return array('error'=>'设备参数错误');
        }
        if(isset($equip['parent_env_no'])&&$equip['parent_env_no']){
            $env = API("get/base/env/env_info/".$equip['parent_env_no']);
        }

        $env_names = array();
        if(isset($env)&&isset($env['name'])&&$env['name']){
            $env_names[] = $env['name'];
        }
        $env_names[] = $equip['equip_type'];
        $env_names[] = substr($equip['equip_no'],-4);
        $env_name = implode("-",$env_names);

        $remark = array();
        $exception_data = $data;
        foreach ($params as  $param=>$un) {
            if(!in_array($param,array('voltage','rssi'))){
                $min = 0;
                $max = 100000000;
                switch($param){
                    case 'temperature':
                    case 'soil_temperature':
                        $min = -20;
                        $max = 80;
                        break;
                    case 'humidity':
                    case 'soil_humidity':
                    case 'soil_conductivity':
                    case 'soil_salt':
                        $min = 0;
                        $max = 100;
                        break;
                    case 'light':
                        $min = 0;
                        $max = 1000000;
                        break;
                    case 'uv':
                        $min = 0;
                        $max = 230;
                        break;
                    case 'co2':
                        $min = 0;
                        $max = 5000;
                        break;
                    case 'voc':
                        $min = 0;
                        $max = 20000;
                        break;
                    case 'organic':
                    case 'inorganic':
                    case 'sulfur':
                        $min = 0;
                        $max = 100000000;
                        break;
                    case 'so2':
                        $min = 0;
                        $max = 20;
                        break;
                    case 'cascophen':
                        $min = 0;
                        $max = 10;
                        break;
                    case 'accel':
                    case 'speed':
                    case 'displacement':
                        $min = 0;
                        $max = 1000;
                        break;
                    default:
                        break;
                }

                if(isset($data[$param])){
                    $val = $data[$param];
                    $unit = isset($un['unit'])?$un['unit']:'';
                    $name = isset($un['name'])?$un['name']:'';
                    if($val === "NaN" || $val < $min || $val > $max){
                        $data_alert = array(
                            'equip_no'=>$equip['equip_no'],
                            'name'=>$equip['name'],
                            'alert_time'=>isset($data['equip_time'])?$data['equip_time']:time(),
                            'env_no'=>$equip['env_no'],
                            'alert_count'=>1,
                            'clear_time'=>isset($data['equip_time'])?$data['equip_time']:time(),
                            'clear_remark'=>'',
                        );
                        $data_alert['type'] = '数据错误';
                        $data['status'] = '数据错误';
                        $data_alert['alert_remark'] = "{$name}:{$val}{$unit}";
                        $alert_ret = M('equip_alert')->add($data_alert);
                        $opt = array(
                            'equip_no'=>$equip['equip_no'],
                            'operation'=>'数据错误',
                            'operator'=>'后台系统',
                            'env_no'=>$equip['env_no']
                        );
                        $opt['remark'] = "{$name}:{$val}{$unit}";
                        M('equipments/equip')->equip_operation($opt);

                        $remark[] = "{$name}数据错误:{$val}{$unit}";
//                    $result = $ret?array('result'=>false,'msg'=>'异常数据写入成功'):array('error'=>'异常数据写入失败');
//                    return $result;
                        unset($data[$param]);

                        $sendMsg = array(
                            "alert"=>$data_alert['type'],
                            "equip_no"=>$equip['equip_no'],
                            "env_name"=>$env_name,
                            "msg"=>"{$name}:{$val}{$unit}",
                        );
                        $send_alert = "equip_alert";
                        sendWebMsg($send_alert,$sendMsg);
                    }
                }
                if($remark){
                    $exception_data['remark'] = implode(";",$remark);
                    M("data_sensor_exception")->add($exception_data);
                }
            }
        }
        //补发或者重发数据不再进行下步验证
        $last_data = M('data_sensor')->fetOne("equip_no = '".$equip['equip_no']."' and equip_time <=".time(),"equip_time",'equip_time desc');
        if($last_data&&isset($last_data['equip_time'])){
            if($data['equip_time'] <= $last_data['equip_time']){
                $ret = M("data_sensor")->add($data);
                $result = $ret?array('result'=>true,'msg'=>'补发或者重发数据写入成功'):array('error'=>'补发或者重发数据写入失败');
                return $result;
            }
        }
        return $this->_voltage_alert($equip,$data,$env_name);
    }

    /**
     * 设备电压预警
     * @param $equip  array   设备信息
     * @param $data  array  监测数据
     * @return 数据写入结果
     **/
    function _voltage_alert($equip=array(),$data = array(),$env_name="")
    {
//        return $equip;
        $result = array();
        $equip_up = array();
        if(isset($data['voltage'])&&$data['voltage']){
            $voltage = $data['voltage'];
            $vol_alert = array(
                'equip_no'=>$equip['equip_no'],
                'name'=>$equip['name'],
                'alert_time'=>isset($data['equip_time'])?$data['equip_time']:time(),
                'env_no'=>$equip['env_no'],
                'alert_count'=>1,
            );
            if(isset($equip['equip_type'])&&$equip['equip_type']){
                if(in_array($equip['equip_type'],array('温湿度监测终端','光照紫外监测终端','空气质量监测终端'))){
                    if($voltage < 2.5){
                        $equip_up['status'] = '异常';
                    }else if($voltage < 2.8){
                        $equip_up['status'] = '低电';
                    }else{
                        $equip_up['status'] = '正常';
                    }
                }else if(in_array($equip['equip_type'],array('二氧化碳监测终端','有机挥发物监测终端','土壤温湿度监测终端'))){
                    if($voltage < 3){
                        $equip_up['status'] = '异常';
                    }else if($voltage < 3.2){
                        $equip_up['status'] = '低电';
                    }else{
                        $equip_up['status'] = '正常';
                    }
                }else if(in_array($equip['equip_type'],array('二氧化硫监测终端','甲醛监测终端'))){
                    if($voltage < 3){
                        $equip_up['status'] = '异常';
                    }else if($voltage < 3.2){
                        $equip_up['status'] = '低电';
                    }else{
                        $equip_up['status'] = '正常';
                    }
                }else if($equip['equip_type'] == '智能囊匣'){
                    if($voltage < 2.7){
                        $equip_up['status'] = '异常';
                    }else if($voltage < 2.8){
                        $equip_up['status'] = '低电';
                    }else{
                        $equip_up['status'] = '正常';
                    }
                }else{
                    $equip_up['status'] = '正常';
                }
            }else{
                $equip_up['status'] = '正常';
            }
            $opt = array(
                'equip_no'=>$equip['equip_no'],
                'operation'=>'电压检测',
                'operator'=>'后台系统',
                'env_no'=>$equip['env_no']
            );
            if(isset($equip_up['status'])){
                switch($equip_up['status']){
                    case '正常':
                        $ret = M('equip_alert')->update(array('clear_time'=>time(),'clear_remark'=>'设备电压恢复正常'),"equip_no='".$equip['equip_no']."' and clear_time is null and type in ('低电','异常')");
                        if($equip['status'] != '正常'){
                            $opt['remark'] = "{$equip['status']}=>{$equip_up['status']},设备电压恢复正常";
                        }
                        break;
                    case '低电':
                        $vol_alert['type'] = $equip_up['status'];
                        $vol_alert['alert_remark'] = $voltage."V";
                        $pre_alert = M('equip_alert')->fetOne("equip_no='".$equip['equip_no']."' and clear_time is null and type = '低电'");
                        if($pre_alert){
                            $pre_alert['alert_count']++;
                            $ret = M('equip_alert')->update(array('alert_count'=>$pre_alert['alert_count']),'id = '.$pre_alert['id']);
                        }else{
                            $ret = M('equip_alert')->add($vol_alert);
                        }
                        M('equip_alert')->update(array('clear_time'=>time(),'clear_remark'=>'设备电压恢复为低电'),"equip_no='".$equip['equip_no']."' and clear_time is null and type in ('异常低电')");
                        if($equip['status'] != '低电'){
                            $opt['remark'] = "{$equip['status']}=>{$equip_up['status']},设备电压变为低电";
                        }
                        break;
                    case '异常':
                        $vol_alert['type'] = '异常低电';
                        $vol_alert['alert_remark'] = $voltage."V";
                        $pre_alert = M('equip_alert')->fetOne("equip_no='".$equip['equip_no']."' and clear_time is null and type = '异常低电'");
                        if($pre_alert){
                            $pre_alert['alert_count']++;
                            $ret = M('equip_alert')->update(array('alert_count'=> $pre_alert['alert_count']),'id = '.$pre_alert['id']);
                        }else{
                            $ret = M('equip_alert')->add($vol_alert);
                        }
                        if($equip['status'] != '异常'){
                            $opt['remark'] = "{$equip['status']}=>{$equip_up['status']},设备电压过低";
                        }
                        break;
                    default:
                        break;
                }
                if(isset($ret)&&$ret){
                    if($equip_up['status'] == '异常' ){
                        M('equip_alert')->update(array('clear_time'=>time(),'clear_remark'=>'设备电压异常'),"equip_no='".$equip['equip_no']."' and clear_time is null and type = '低电'");
                        $data['remark'] = "设备电压过低,{$voltage}V";
                        $ret = M("data_sensor_exception")->add($data);

                        if($equip['status'] != '异常'){
                            M("equip")->update($equip_up,"equip_no = '".$equip['equip_no']."'");
                            if(isset($opt)&&$opt&&$equip_up['status'] != $equip['status']){
                                $opt['operation'] = "异常低电";
                                M('equipments/equip')->equip_operation($opt);
                            }
                        }
                        $sendMsg = array(
                            "alert"=>$vol_alert['type'],
                            "equip_no"=>$equip['equip_no'],
                            "env_name"=>$env_name,
                            "msg"=>$data['remark'],
                        );
                        $send_alert = "equip_alert";
                        sendWebMsg($send_alert,$sendMsg);
                        $result = $ret?array('result'=>false,'msg'=>'异常数据写入成功'):array('error'=>'异常数据写入失败');
                    }else{
                        $data['status'] = $equip_up['status'];
                        $insert_ret = M("data_sensor")->add($data);
                        $last_alert = M('equip_alert')->fetOne("equip_no='".$equip['equip_no']."' and clear_time is null");
                        if(isset($last_alert['type'])&&strpos($last_alert['type'],"低电") != false){
                            if($equip['status'] != $equip_up['status']){
                                M("equip")->update($equip_up,"equip_no = '".$equip['equip_no']."'");
                                if(isset($opt)&&$opt&&$equip_up['status'] != $equip['status']){
                                    $opt['operation'] = "电压恢复";
                                    M('equipments/equip')->equip_operation($opt);
                                }
                            }else{
                                M("equip")->update($equip_up,"equip_no = '".$equip['equip_no']."'");
                            }
                        }
                        $result = $insert_ret?array('result'=>true,'msg'=>'数据写入成功'):array('error'=>'数据写入失败');
                    }

                    return $result;
                }
            }
        }else{
            $insert_ret = M("data_sensor")->add($data);
            $result = $insert_ret?array('result'=>true,'msg'=>'数据写入成功'):array('result'=>false,'msg'=>'数据写入失败');
        }
        $this->_equip_time_alert($equip,$data,$env_name);
        $this->_data_revulsion($equip,$data,$env_name);

        return $result;
    }

    /***
     * 设备采集时间预警
     * @param $equip  array   设备信息
     * @param $data  array  监测数据
     * @param string $env_name
     */
    function _equip_time_alert($equip=array(),$data=array(),$env_name="")
    {
        $config = app_config();
        $last_data = M('data_sensor')->fetOne("equip_no = '".$equip['equip_no']."' and equip_time <=".time(),"equip_time",'equip_time desc');

        if($last_data){
            $std_time = 1800;
            if(isset($config['max_acquisition_time_interval'])&&$config['max_acquisition_time_interval']){
                $std_time = $config['max_acquisition_time_interval']*$equip['sleep'];
            }
            $time_diff = $data['equip_time'] - $last_data['equip_time'];
            if($time_diff > $std_time){
                $acq_alert = array(
                    'equip_no'=>$equip['equip_no'],
                    'name'=>$equip['name'],
                    'alert_time'=>isset($data['equip_time'])?$data['equip_time']:time(),
                    'env_no'=>$equip['env_no'],
                    'alert_count'=>1,
                    'clear_time'=>isset($data['equip_time'])?$data['equip_time']:time(),
                );
                $equip_up = array(
                    'status'=>'异常'
                );
                $acq_alert['type'] = '采集时间超时';
                $data['status'] = '采集时间超时';
                $time_diff = abs(time() - $last_data['equip_time']);
                $h = floor($time_diff/3600);
                $d = floor($h/24);
                $h = $h%24;
                $m = floor(($time_diff%3600)/60);
                $s = $time_diff%60;
                $timeout = "";
                if($d){
                    $timeout .= "{$d}天";
                }
                if($h){
                    $timeout .= "{$h}小时";
                }
                if($m){
                    $timeout .= "{$m}分钟";
                }
                if($s){
                    $timeout .= "{$s}秒";
                }
                $acq_alert['alert_remark'] = "自".date("Y-m-d H:i",$last_data['equip_time'])."->".date("Y-m-d H:i")."{$timeout},无数据上传";
                $pre_alert = M('equip_alert')->fetOne("equip_no='".$equip['equip_no']."' and clear_time is null and type = '采集时间超时'");
                if($pre_alert){
                    $pre_alert['alert_count']++;
                    $ret = M('equip_alert')->update(array('alert_count'=>$pre_alert['alert_count']),'id='.$pre_alert['id']);
                }else{
                    $ret = M('equip_alert')->add($acq_alert);
                }
                if($ret){
                    if(isset($equip['status'])&&$equip['status'] != "异常"){
                        M("equip")->update(array('status'=>'异常'),"equip_no = '".$equip['equip_no']."'");
                        $opt = array(
                            'equip_no'=>$equip['equip_no'],
                            'operation'=>'采集时间超时',
                            'operator'=>'后台系统',
                            'operation_time'=>time(),
                            'env_no'=>$equip['env_no']
                        );
                        $opt['remark'] = "{$equip['status']}=>{$equip_up['status']},数据采集时间超时";
                        M('equipments/equip')->equip_operation($opt);
                    }

                    $sendMsg = array(
                        "alert"=>$acq_alert['type'],
                        "equip_no"=>$equip['equip_no'],
                        "env_name"=>$env_name,
                        "msg"=>$acq_alert['alert_remark'],
                    );
                    $send_alert = "equip_alert";
                    sendWebMsg($send_alert,$sendMsg);
                }

            }else{
                $ret = M('equip_alert')->update(array('clear_time'=>time(),'clear_remark'=>'采集时间超时已恢复'),"equip_no = '{$equip['equip_no']}' and clear_time is null and type = '采集时间超时'");
                if($ret) {
                    if (isset($equip['status']) && $equip['status'] == "异常") {
                        M("equip")->update(array('status' => '正常'), "equip_no = '" . $equip['equip_no'] . "'");
                        $opt = array(
                            'equip_no' => $equip['equip_no'],
                            'operation' => '采集时间恢复',
                            'operator' => '后台系统',
                            'operation_time' => time(),
                            'env_no' => $equip['env_no']
                        );
                        $opt['remark'] = "{$equip['status']}=>正常,采集时间超时已恢复";
                        M('equipments/equip')->equip_operation($opt);
                    }
                }
//                $this->_data_revulsion($equip,$data);
            }
        }

    }

    /**
     * 设备传输时间预警预警
     * @param $equip  array   设备信息
     * @param $data  array  监测数据
     **/
//    function _receive_time_alert($equip=array(),$data=array())
//    {
//        $config = app_config();
//        $last_data = M('data_sensor')->fetOne("equip_no = '".$equip['equip_no']."' and server_time <=".time(),"server_time",'server_time desc');
//        if($last_data){
//            $std_time = 1800;
//            if(isset($config['max_transmission_time_interval'])&&$config['max_transmission_time_interval']){
//                $std_time = $config['max_transmission_time_interval'];
//            }
//
//            $time_diff = $data['server_time'] - $last_data['server_time'];
//            if($time_diff > $std_time){
//                $acq_alert = array(
//                    'equip_no'=>$equip['equip_no'],
//                    'name'=>$equip['name'],
//                    'alert_time'=>isset($data['equip_time'])?$data['equip_time']:time(),
//                    'env_no'=>$equip['env_no'],
//                    'alert_count'=>1,
//                );
//                $equip_up = array(
//                    'status'=>'异常'
//                );
//                $acq_alert['type'] = '传输时间超时';
//                $acq_alert['alert_remark'] = "异常----数据传输时间超时：{$time_diff}s,上次传输时间：".date("Y-m-d H:i",$last_data['server_time']).", 本次传输时间：".date("Y-m-d H:i",$data['server_time']);
//                $pre_alert = M('equip_alert')->fetOne("equip_no='".$equip['equip_no']."' and clear_time is null and type = '传输时间超时'");
//                if($pre_alert){
//                    $alert_count = $pre_alert['alert_count']++;
//                    $ret = M('equip_alert')->update(array('alert_count'=>$alert_count),'id='.$pre_alert['id']);
//                }else{
//                    $ret = M('equip_alert')->add($acq_alert);
//                }
//                if($ret){
//                    if(isset($equip['status'])&&$equip['status'] != "异常"){
//                        M("equip")->update(array('status'=>'异常'),"equip_no = '".$equip['equip_no']."'");
//                    }
//                }
//                $insert_ret = M("data_sensor")->add($data);
//                $result = $insert_ret?array('result'=>true,'msg'=>'数据写入成功'):array('result'=>false,'msg'=>'数据写入失败');
//                $this->response($result);
//            }else{
//                $ret = M('equip_alert')->update(array('clear_time'=>time(),'clear_remark'=>'传输时间超时已恢复'),"equip_no = '{$equip['equip_no']}' and clear_time is null and type = '传输时间超时'");
//                $this->_data_revulsion($equip,$data);
//            }
//        }else{
//            $this->_data_revulsion($equip,$data);
//        }
//    }


    /**
     * 设备数据突变预警
     * @param $equip  array   设备信息
     * @param $data  array  监测数据
     **/
    function _data_revulsion($equip,$data,$env_name="")
    {
        $config = app_config();
        $s_time = strtotime('yesterday');
        $e_time = strtotime('today');
        $sql = "SELECT  MAX(temperature+0) - MIN(temperature+0) as temperature_extrem,MAX(humidity+0) - MIN(humidity+0) as humidity_extrem,
						MAX(voc+0) - MIN(voc+0) as voc_extrem,MAX(co2+0)- MIN(co2+0) as co2_extrem,MAX(light+0) - MIN(light+0) as light_extrem,
						MAX(uv+0) - MIN(uv+0) as uv_extrem,MAX(organic+0) - MIN(organic+0) as organic_extrem,MAX(inorganic+0) - MIN(inorganic+0) as inorganic_extrem,
						MAX(sulfur+0)- MIN(sulfur+0) as sulfur_extrem,MAX(cascophen+0) - MIN(cascophen+0) as cascophen_extrem,MAX(soil_humidity+0) - MIN(soil_humidity+0) as  soil_humidity_extrem,
						MAX(soil_temperature+0) - MIN(soil_temperature+0) as soil_temperature_extrem,MAX(soil_conductivity+0)- MIN(soil_conductivity+0) as soil_conductivity_extrem,
						MAX(soil_salt+0) - MIN(soil_salt+0) as soil_sal_extrem
						 	FROM data_sensor
						WHERE equip_no = '{$equip['equip_no']}'AND equip_time >= {$s_time} AND equip_time < {$e_time}" ;
        $extrem = $this->db->query($sql)->row_array();
        if($extrem){
            $last_data = M('data_sensor')->fetOne("equip_no = '".$equip['equip_no']."' and equip_time <=".time(),"*",'equip_time desc');
            if(isset($equip['parameter'])&&$equip['parameter']){
                $params = explode(',',$equip['parameter']);
                $std_val = 0;
                $data_mutation_bounds = $config['data_mutation_bounds'];
                foreach ($params as $param) {
                    if(isset($extrem[$param.'_extrem'])&&$extrem[$param.'_extrem']){
                        $std_val = $extrem[$param.'_extrem'];
                        if(isset($last_data[$param])&&isset($data[$param])){
                            $temp_alert = array(
                                'equip_no'=>$equip['equip_no'],
                                'name'=>$equip['name'],
                                'alert_time'=>isset($data['equip_time'])?$data['equip_time']:time(),
                                'clear_time'=>isset($data['equip_time'])?$data['equip_time']:time(),
                                'env_no'=>$equip['env_no'],
                                'alert_count'=>1,
                            );
                            $mark = abs($data[$param] - $last_data[$param]) - $std_val*$data_mutation_bounds;
                            $unit = isset($un[$param]['unit'])?$un[$param]['unit']:'';
                            $name = isset($un[$param]['name'])?$un[$param]['name']:'';
                            if($mark > 0){
                                $temp_alert['type'] = '数据突变';
                                $temp_alert['alert_remark'] = "{$last_data[$param]}{$unit}->{$data[$param]}{$unit}";
                                $ret = M('equip_alert')->add($temp_alert);
                                if($ret){
                                    $opt = array(
                                        'equip_no'=>$equip['equip_no'],
                                        'operation'=>'数据突变',
                                        'operator'=>'后台系统',
                                        'operation_time'=>time(),
                                        'env_no'=>$equip['env_no']
                                    );
                                    $opt['remark'] = "{$equip['status']}=>异常----{$name}数据突变";
                                    M('equipments/equip')->equip_operation($opt);

                                    $sendMsg = array(
                                        "alert"=>$temp_alert['type'],
                                        "equip_no"=>$equip['equip_no'],
                                        "env_name"=>$env_name,
                                        "msg"=>$temp_alert['alert_remark'] ,
                                    );
                                    $send_alert = "equip_alert";
                                    sendWebMsg($send_alert,$sendMsg);
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}