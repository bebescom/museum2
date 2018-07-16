<?php

/**
 * Created by PhpStorm.
 * User: Hebj
 * Date: 2016/11/15
 * Time: 15:18
 */
class Security extends MY_Controller
{
    public function __construct()
    {
        parent::__construct();
        $this->order_time = "server_time";
        $data_order = API('get/base/config/museum_config',array('keys'=>"data_order"));
        if($data_order){
            $this->order_time = $data_order['data_order'];
        }

        $sensor_param = M("equipments/equip")->get_parameters('sensor');
        $this->param = array();
        if($sensor_param){
            foreach($sensor_param as $sp){
                if(isset($sp['param'])&&$sp['param']){
                    $this->param[$sp['param']] = array("name"=>$sp['name'],"unit"=>$sp['unit']);
                }
            }
        }
    }

    public function index_get(){
        $envs = API('get/base/envs/',array("type"=>"安防展柜"));
        $env = array();
        if(isset($envs['rows'])&&$envs['rows']){
            $env = $envs['rows'][0];
            if(isset($env['parent_env_no'])&&$env['parent_env_no']){
                $nav = API('get/base/envs/navigation/'.$env['env_no']);
                if(isset($nav['rows'])&&$nav['rows']){
                    $env['nav'] = $nav['rows'];
                }
            }
            $env['broken'] = false;
            $env['vibration'] = false;
            $env['multi_wave'] = false;
            if(isset($env['env_no'])&&$env['env_no']){
                $where = "env_no = '".$env['env_no']."' and clear_time is null";
                $alerts = M("alert")->fetAll($where);

                $equip = M("equip")->find("equip_type = '安防传感器' and env_no = ".$env["env_no"]);
                if($equip){
                    if(isset($equip['equip_no'])&&$equip['equip_no']){
                        $env['equip_no'] = $equip['equip_no'];
                    }
                }
                if($alerts){
                    foreach($alerts as $alert){
                        if(isset($alert['alert_param'])&&$alert['alert_param']){
                            $env[$alert['alert_param']] = true;

                        }
                    }
                }
            }
        }
        $this->response($env);
    }

    public function data_line_get(){
        $env_no = $this->get_post("env_no");
        $end_time = time();
        $start_time = $end_time - 24 * 3600;
        $where = "1=1";
        $where .=  " and ".$this->order_time." > ".$start_time." and ".$this->order_time." <= ".$end_time;
        if(isset($env_no)&&$env_no){
            $where .= " and env_no = '".$env_no."'";
        }
        $equips = M("equip")->fetAll("env_no = '".$env_no."'");
        $equip_name = array();
        if($equips){
            foreach($equips as $equip){
                if(isset($equip['name'])&&$equip['name']){
                    $equip_name[$equip['equip_no']] = $equip['name'];
                }
            }
        }
        $data_sensor = M("data_sensor")->fetAll($where);

        $data = array();
        if($data_sensor){
            $pdata = array();
            foreach($data_sensor as $ds){
                if(isset($ds['equip_no'])&&$ds['equip_no']){
                    if(!isset($pdata[$ds['equip_no']])){
                        $pdata[$ds['equip_no']] = array();
                    }
                    if($this->param){
                        foreach($this->param as $tp=>$tv){
                           if(!in_array($tp,array("broken","vibration","multi_wave"))){
                               if(!isset($data[$tp])){
                                   $data[$tp] = array("data"=>array());
                                   $data[$tp] = array_merge($data[$tp],$tv);
                               }
                               if(isset($ds[$tp])&&$ds[$tp]){
                                   $dst = $ds[$this->order_time]*1000;
                                   $name = $ds['equip_no'];
                                   if(isset($equip_name[$ds['equip_no']])){
                                       $name = $equip_name[$ds['equip_no']];
                                   }
                                   if(!isset($data[$tp]['data'][$name])){
                                       $data[$tp]['data'][$name] = array();
                                   }
                                   $data[$tp]['data'][$name][] = array($dst,$ds[$tp]);
                               }
                           }
                        }
                    }
                }
            }
        }

        $this->response($data);
    }

    public function clear_alert_post(){
        $env_no = $this->get_post("env_no");
        $alert_type = $this->get_post("alert_type");

        $where = "clear_time is null";
        if($env_no){
            $where .= " and env_no = '".$env_no."'";
        }
        if($alert_type){
            $where .= " and alert_param = '".$alert_type."'";
        }

        $up_data = array("clear_time"=>time());
        $ret = M("alert")->update($up_data,$where);
        $result = array("result"=>false,"msg"=>"清除失败");
        if($ret){
            $result = array("result"=>true,"msg"=>"清除成功");
        }

        $this->response($result);
    }

}