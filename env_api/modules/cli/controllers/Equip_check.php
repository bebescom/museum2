<?php

/**
 * Created by PhpStorm.
 * User: Hebj
 * Date: 2017/8/10
 * Time: 15:19
 */
class Equip_check extends MY_Controller
{
    public function __construct()
    {
        parent::__construct();
        $this->museum_config = array();
        $config = app_config();
        $this->museum_config = $config;

        $this->load->helper("cli");
    }

    public function sensor_check_get_nologin()
    {
//        $equip_types = array('温湿度监测终端','带屏温湿度监测终端','有机挥发物监测终端','光照紫外监测终端','二氧化碳监测终端','空气质量监测终端','土壤温湿度监测终端',
//            '安防监测终端','震动监测终端','调湿机','调湿柜');
        $equip_types = M('equip_type')->fetAll("type in ('监测终端','调控设备','智能囊匣')");
        $e_types = array();
        if($equip_types){
            foreach ($equip_types as $equip_type) {
                if(isset($equip_type['equip_type'])&&$equip_type['equip_type']&&$equip_type['equip_type'] != "调控材料"){
                    $e_types[] = $equip_type['equip_type'];
                }
            }
        }
        $where = "equip_type in ('".implode("','",$e_types)."') and status not in ('备用','停用')" ;
        $sensors = M('equip')->fetAll($where);
        cli_logs("开始执行监测设备检测", date("Y-m-d"));
        foreach ($sensors as $sensor) {
            cli_logs("设备编号：".$sensor['equip_no']);
            $env_name = array();
            if(isset($sensor['parent_env_no'])&&$sensor['parent_env_no']){
                $env = API("get/base/env/env_info/".$sensor['parent_env_no']);
                if($env){
                    if(isset($env['env_no'])&&$env['env_no']){
                        $env_name[$env['env_no']] = $env['name'];
                    }
                }
            }
            if(isset($sensor['status'])){
                if($sensor['status'] != '异常'){
                    $last_data = M('data_sensor')->fetOne("equip_no = '{$sensor['equip_no']}' and server_time <= ".time(),"equip_no,server_time",'server_time desc');//最后一条数据

                    if($last_data){
                        if(isset($last_data['server_time'])&&$last_data['server_time']){
                            if(isset($this->museum_config['max_transmission_time_interval'])&&$this->museum_config['max_transmission_time_interval']){
                                $now = time();
                                $std = $now - $last_data['server_time'] - $this->museum_config['max_transmission_time_interval']*$sensor['sleep'];
                                if($std > 0){
                                    $time_diff = abs(time() - $last_data['server_time']);
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
                                    $alert = array(
                                        'equip_no'=>$sensor['equip_no'],
                                        'name'=>$sensor['name'],
                                        'alert_time'=>time(),
                                        'env_no'=>$sensor['env_no'],
                                        'alert_count'=>1,
                                        'type'=>'传输时间超时',
                                        'alert_remark'=>"自".date("Y-m-d H:i",$last_data['server_time'])."->".date("Y-m-d H:i").",{$timeout},无数据上传"
                                    );
                                    cli_logs($sensor['equip_no'].'-- 传输时间超时', date("Y-m-d"));
                                    $ret = M('equip_alert')->add($alert);
                                    if($ret){
                                        M('equip')->update(array('status'=>'异常'),"equip_no ='{$sensor['equip_no']}'");
                                        $opt = array(
                                            'equip_no'=>$sensor['equip_no'],
                                            'operation'=>'传输时间超时',
                                            'operator'=>'后台系统',
                                            'remark'=>"正常=》异常,自".date("Y-m-d H:i",$last_data['server_time'])."->".date("Y-m-d H:i").",{$timeout},无数据上传",
                                            'env_no'=>$sensor['env_no'],
                                            'uid'=>$this->_user['id'],
                                        );
                                        M('equipments/equip')->equip_operation($opt);
                                        $names = array();
                                        if(isset($env_name[$sensor['env_no']])){
                                            $names[] = $env_name[$sensor['env_no']];
                                        }
                                        $names[] = $sensor['equip_type'];
                                        $names[] = substr($sensor['equip_no'],-4);
                                        $name = implode("-",$names);
                                        $sendMsg = array(
                                            "alert"=>$alert['type'],
                                            "equip_no"=>$sensor['equip_no'],
                                            "env_name"=>$name,
                                            "msg"=>$alert['alert_remark'],
                                        );
                                        $send_alert = "equip_alert";
                                        sendWebMsg($send_alert,$sendMsg);
                                    }
                                }
                            }
                        }
                    }else{
                        $alert = array(
                            'equip_no'=>$sensor['equip_no'],
                            'name'=>$sensor['name'],
                            'alert_time'=>time(),
                            'env_no'=>$sensor['env_no'],
                            'alert_count'=>1,
                            'type'=>'传输时间超时',
                            'alert_remark'=>"设备无数据上传"
                        );
                        $ret = M('equip_alert')->add($alert);
                        if($ret){
                            M('equip')->update(array('status'=>'异常'),"equip_no ='{$sensor['equip_no']}'");
                            $opt = array(
                                'equip_no'=>$sensor['equip_no'],
                                'operation'=>'传输时间超时',
                                'operator'=>'后台系统',
                                'remark'=>"正常=》异常,设备无数据上传",
                                'env_no'=>$sensor['env_no'],
                                'uid'=>$this->_user['id'],
                            );
                            M('equipments/equip')->equip_operation($opt);
                        }
                    }
                }else{
                    $alt_where = "equip_no = '{$sensor['equip_no']}' and type = '传输时间超时'  and clear_time is null";
                    $last_alert = M('equip_alert')->fetOne($alt_where,'id,alert_time,equip_no,type,alert_count','alert_time desc');

                    if($last_alert){
                        if(isset($last_alert['alert_time'])&&$last_alert['alert_time']){
                            $offset = $last_alert['alert_count'] - 1;
                            $last_datas = M('data_sensor')->fetAll("equip_no = '{$sensor['equip_no']}' and server_time > ".$last_alert['alert_time'],"equip_no,server_time",'server_time asc',$offset,2);
                            if(sizeof($last_datas) == 2){
                                $alert_time = array();
                                $std = abs($last_datas[1]['server_time'] - $last_datas[0]['server_time']);
                                if($std  - $this->museum_config['max_transmission_time_interval'] * $sensor['sleep'] < 0){
                                    $up_data = array(
                                        'clear_time'=>time(),
                                        'clear_remark'=>'数据传输恢复，恢复上传时间:'.date("Y-m-d H:i",$last_datas[0]['server_time'])
                                    );
                                    $ret = M('equip_alert')->update($up_data,$alt_where);
                                    if($ret){
                                        M('equip')->update(array('status'=>'正常'),"equip_no ='{$sensor['equip_no']}'");
                                        $opt = array(
                                            'equip_no'=>$sensor['equip_no'],
                                            'operation'=>'数据传输恢复',
                                            'operator'=>'后台系统',
                                            'remark'=>"异常=》正常,设备数据上传恢复,恢复上传时间:".date("Y-m-d H:i",$last_datas[0]['server_time']),
                                            'env_no'=>$sensor['env_no'],
                                            'uid'=>$this->_user['id'],
                                        );
                                        M('equipments/equip')->equip_operation($opt);
                                    }
                                }else{
                                    $alert_count = $last_alert['alert_count']+1;
                                    $ret = M('equip_alert')->update(array("alert_count"=>$alert_count),"id = {$last_alert['id']}");
                                }
                            }
                        }
                    }else{
                        $last_data = M('data_sensor')->fetOne("equip_no = '{$sensor['equip_no']}' and server_time <= ".time(),"equip_no,server_time",'server_time desc');//最后一条数据
                        if(isset($last_data['server_time'])&&$last_data['server_time']){
                            if(isset($this->museum_config['max_transmission_time_interval'])&&$this->museum_config['max_transmission_time_interval']){
                                $now = time();
                                $std = $now - $last_data['server_time'] - $this->museum_config['max_transmission_time_interval']* $sensor['sleep'];
                                if($std >= 0){
                                    $time_diff = abs(time() - $last_data['server_time']);
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
                                    $alert = array(
                                        'equip_no'=>$sensor['equip_no'],
                                        'name'=>$sensor['name'],
                                        'alert_time'=>time(),
                                        'env_no'=>$sensor['env_no'],
                                        'alert_count'=>1,
                                        'type'=>'传输时间超时',
                                        'alert_remark'=>"自".date("Y-m-d H:i",$last_data['server_time'])."->".date("Y-m-d H:i").",{$timeout},无数据上传"
                                    );
                                    cli_logs($sensor['equip_no'].'-- 传输时间超时', date("Y-m-d"));
                                    $ret = M('equip_alert')->add($alert);
                                    if($ret){
                                        M('equip')->update(array('status'=>'异常'),"equip_no ='{$sensor['equip_no']}'");
                                        $opt = array(
                                            'equip_no'=>$sensor['equip_no'],
                                            'operation'=>'传输时间超时',
                                            'operator'=>'后台系统',
                                            'remark'=>"正常=》异常,自".date("Y-m-d H:i",$last_data['server_time'])."->".date("Y-m-d H:i").",{$timeout},无数据上传",
                                            'env_no'=>$sensor['env_no'],
                                            'uid'=>$this->_user['id'],
                                        );
                                        M('equipments/equip')->equip_operation($opt);
                                    }
                                }else{
                                    M('equip')->update(array('status'=>'正常'),"equip_no ='{$sensor['equip_no']}'");
                                    $opt = array(
                                        'equip_no'=>$sensor['equip_no'],
                                        'operation'=>'监测终端检测',
                                        'operator'=>'后台系统',
                                        'remark'=>"异常=》正常,设备数据上传恢复,上传恢复时间：".date("Y-m-d H:i",$last_data['server_time']),
                                        'uid'=>$this->_user['id'],
                                        'env_no'=>$sensor['env_no']
                                    );
                                    M('equipments/equip')->equip_operation($opt);
                                }
                            }else{
                                M('equip')->update(array('status'=>'正常'),"equip_no ='{$sensor['equip_no']}'");
                                $opt = array(
                                    'equip_no'=>$sensor['equip_no'],
                                    'operation'=>'监测终端检测',
                                    'operator'=>'后台系统',
                                    'remark'=>"异常=》正常,设备数据上传恢复,上传恢复时间：".date("Y-m-d H:i",$last_data['server_time']),
                                    'uid'=>$this->_user['id'],
                                    'env_no'=>$sensor['env_no']
                                );
                                M('equipments/equip')->equip_operation($opt);
                            }
                        }
                    }
                }
            }
        }
        cli_logs("监测终端检测完成", date("Y-m-d"));
        $this->response(array('msg'=>'监测终端检测完成'));
    }

    function network_check_get_nologin()
    {
        cli_logs("开始执行网络设备检测", date("Y-m-d"));
        $equip_types = M('equip_type')->fetAll("type in ('网络设备')");
        $e_types = array();
        if($equip_types){
            foreach ($equip_types as $equip_type) {
                if(isset($equip_type['equip_type'])&&$equip_type['equip_type']){
                    $e_types[] = $equip_type['equip_type'];
                }
            }
        }
        $networks = M('equip')->fetAll("equip_type in ('".implode("','",$e_types)."') and status not in ('备用','停用')");
        $start_time = time() - 25*3600;
        if($networks){
            foreach ($networks as $network) {
                $equip_no = substr($network['equip_no'],-11);
                $type_no = substr($equip_no,0,3);
                cli_logs("设备编号：".$equip_no);
               if($type_no == "004"){
//                   $last_route = M('data_route')->fetOne("gateway_no = '{$equip_no}'",'*','server_time desc');
                   $beat = M('data_sensor')->fetOne("equip_no = '{$network['equip_no']}' and server_time > {$start_time}","*","server_time desc");
                   if($beat){
                       if(isset($network['status'])&&$network['status'] == '异常'){
                           $up_data = array(
                               'clear_time'=>time(),
                               'clear_remark'=>'数据传输恢复'
                           );
                           $ret = M('equip_alert')->update($up_data,"equip_no = '{$network['equip_no']}' and type = '传输时间超时'");
                           if($ret){
                               M('equip')->update(array('status'=>'正常'),"equip_no ='{$network['equip_no']}'");
                               $opt = array(
                                   'equip_no'=>$network['equip_no'],
                                   'operation'=>'数据传输恢复',
                                   'operator'=>'后台系统',
                                   'remark'=>"异常=》正常,网关心跳恢复",
                                   'env_no'=>$network['env_no'],
                                   'uid'=>$this->_user['id']
                               );
                               M('equipments/equip')->equip_operation($opt);
                           }
                       }
                   }else{
                       if(isset($network['status'])&&$network['status'] != '异常'){
                           $alert = array(
                               'equip_no'=>$network['equip_no'],
                               'name'=>$network['name'],
                               'alert_time'=>time(),
                               'env_no'=>$network['env_no'],
                               'alert_count'=>1,
                               'type'=>'传输时间超时',
                               'alert_remark'=>'该网关25小时内无心跳'
                           );
                           $ret = M('equip_alert')->add($alert);
                           if($ret){
                               M('equip')->update(array('status'=>'异常'),"equip_no ='{$network['equip_no']}'");
                               $opt = array(
                                   'equip_no'=>$network['equip_no'],
                                   'operation'=>'传输时间超时',
                                   'operator'=>'后台系统',
                                   'remark'=>"正常=》异常,该网关25小时内无心跳",
                                   'env_no'=>$network['env_no'],
                                   'uid'=>$this->_user['id']
                               );
                               M('equipments/equip')->equip_operation($opt);
                           }
                       }
                   }
               }else{
                   $where = "server_time >= {$start_time} and (relay1_no = '{$equip_no}' or relay3_no = '{$equip_no}' or relay2_no = '{$equip_no}')";
                   $last_route = M('data_route')->fetOne($where,'*','server_time desc');
                   $beat = M('data_sensor')->fetOne("equip_no = '{$network['equip_no']}' and server_time > {$start_time}","*","server_time desc");
                   if($last_route || $beat){
                       if(isset($network['status'])&&$network['status'] == '异常'){
                           $up_data = array(
                               'clear_time'=>time(),
                               'clear_remark'=>'数据传输恢复:'
                           );
                           $ret = M('equip_alert')->update($up_data,"equip_no = '{$network['equip_no']}' and type = '传输时间超时'");
                           if($ret){
                               M('equip')->update(array('status'=>'正常'),"equip_no ='{$network['equip_no']}'");
                               $opt = array(
                                   'equip_no'=>$network['equip_no'],
                                   'operation'=>'数据传输恢复',
                                   'operator'=>'后台系统',
                                   'remark'=>"异常=》正常,中继路由信息恢复",
                                   'env_no'=>$network['env_no'],
                                   'uid'=>$this->_user['id']
                               );
                               M('equipments/equip')->equip_operation($opt);
                           }
                       }
                   }else{
                       if(isset($network['status'])&&$network['status'] != '异常'){
                           $alert = array(
                               'equip_no'=>$network['equip_no'],
                               'name'=>$network['name'],
                               'alert_time'=>time(),
                               'env_no'=>$network['env_no'],
                               'alert_count'=>1,
                               'type'=>'传输时间超时',
                               'alert_remark'=>'该中继超过25小时无路由信息'
                           );

                           $ret = M('equip_alert')->add($alert);
                           if($ret){
                               M('equip')->update(array('status'=>'异常'),"equip_no ='{$network['equip_no']}'");
                               $opt = array(
                                   'equip_no'=>$network['equip_no'],
                                   'operation'=>'传输时间超时',
                                   'operator'=>'后台系统',
                                   'remark'=>"正常=》异常,中继超过25小时无路由信息",
                                   'env_no'=>$network['env_no'],
                                   'uid'=>$this->_user['id']
                               );
                               M('equipments/equip')->equip_operation($opt);
                           }
                       }
                   }
               }
            }
        }
        cli_logs("网络设备检测完成", date("Y-m-d"));
        $this->response(array('msg'=>'网络设备检测完成'));
    }
}