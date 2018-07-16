<?php

/**
 * Created by PhpStorm.
 * User: Hebj
 * Date: 2017/8/9
 * Time: 15:26
 */
class Env_alert_model extends MY_Model
{
    function env_alert($equip = array(),$json=array())
    {
        if(isset($json['param'])){
            $param = $json['param'];
        }
        $env_no = $equip['env_no'];
        //文物信息
        $relics = M('data')->findRelic($env_no);
        $thre = M('threshold');
        $env_threshold = $thre->find(array('no'=>$env_no));
        $thresholds = array();
        if($relics){
            $relic_thresholds = $thre->fetAll("no in ('".implode("','",array_keys($relics))."')");
            if($relic_thresholds){
                foreach($relic_thresholds as $rt){
                    if(isset($rt['no'])&&$rt['no']){
                        $thresholds[$rt['no']] = $rt;
                    }
                }
            }
            foreach($relics as $no=>$relic){
                if(!isset($thresholds[$no])){
                    $thresholds[$no] = $env_threshold;
                }
            }
        }else{
            $thresholds[] = $env_threshold;
        }

        //设备参数
        $parameters = M("equipments/equip")->get_parameters('sensor');
        $params = array();
        foreach($parameters as $parameter){
            $params[$parameter['param']] = $parameter;
        }

        $e_type = substr($json['sensor_no'],0,3);
        $alert_param = array();
        if(!$thresholds){
            return array("error"=>"阈值不存在");
        }
        //环境信息
        if($e_type == "007"){
            $env = M("box")->fetOne("env_no = '{$env_no}'");
        }else{
            $env = API('get/base/envs/info/'.$env_no);
        }

        foreach($thresholds as $t_no=>$threshold){
            if(!$threshold){
                return array("error"=>"阈值不存在");
            }

            $alt = M('alert');
            if(isset($param) && $param){
                foreach($param as $p=>$v){
                    $v = deal_data_decimal($p,$v);
                    if(in_array($p,array_keys($params))&&!is_array($v)){
                        $alert = array();
                        $min = (isset($threshold[$p.'_min'])&&$threshold[$p.'_min'])?$threshold[$p.'_min']:"";
                        $max = (isset($threshold[$p.'_max'])&&$threshold[$p.'_max'])?$threshold[$p.'_max']:"";
                        $diff = 0;
                        if($min || $max){
                            if($v>$max || $v < $min){
                                $alert['env_no'] = $env_no;
                                $alert['relic_no'] = $relics?$t_no:"";
                                $alert['equip_no'] = $equip['equip_no'];
                                $alert['alert_type'] = $threshold['type'];
                                $alert['level'] = 'common';
                                $alert['content'] = "";
                                $alert['alert_time'] = $json['equip_time'];
                                $alert['alert_count'] = 1;
                                $alert['alert_val'] = $v;
                                $alert['alert_param'] = $p;

                                if($v>$max){
                                    $diff = deal_data_decimal($p,$v - $max);
                                    $alert['content'] = "偏高".$diff;
                                }else if($v < $min){
                                    $diff = deal_data_decimal($p,$v - $min);
                                    $alert['content'] = "偏低".abs($diff);
                                }

                                $query = array('equip_no'=>$alert['equip_no'],'alert_type'=>$alert['alert_type'],'alert_param'=>$alert['alert_param'],'level'=>$alert['level'],'env_no'=>$alert['env_no'],'clear_time'=>null);
                                if($relics){
                                    $query['relic_no'] = $t_no;
                                }
                                $pre_alert = $alt->find($query,"id,alert_val,clear_time,alert_count","alert_time desc");
                                if($pre_alert){
                                    if(($pre_alert['alert_val']>$max && $alert['alert_val']<$min) || ($pre_alert['alert_val']<$min && $alert['alert_val']>$max)){
                                        $pre_alert['clear_time'] = $json['server_time'];
                                        $alt->update(array('clear_time' => $json['server_time']),array('id'=>$pre_alert['id']));
                                        $alt->add($alert);
                                    }else{
                                        $up_data = array();
                                        if(($pre_alert['alert_val'] < $alert['alert_val'] && $pre_alert['alert_val'] > $max)
                                            || ($pre_alert['alert_val'] > $alert['alert_val'] && $pre_alert['alert_val'] < $min)){
                                            $up_data['alert_val'] = $alert['alert_val'];
                                        }
                                        $up_data['alert_count'] = $pre_alert['alert_count']+1;
                                        $alt->update($up_data,"id = ".$pre_alert['id']);
                                    }
                                }else{
                                    $alt->add($alert);
                                }
                                if(!in_array($p,$alert_param)){
                                    $alert_param[] = $p;
                                }
                                $alert_status = 1;
                                $send_alert = "env_alert";
                                if($e_type == "007"){
                                    $send_alert = "box_alert";

                                    $up = array("env_no"=>$env_no);
                                    if(isset($env['alert_status'])){
                                        if($alert_status>$env['alert_status']){
                                            $up["alert_status"] = $alert_status;
                                        }
                                    }

                                    if($up){
                                        $ret = M("box")->update($up,"env_no= '{$env_no}'");
                                    }
                                }

                                $alert_type = "{$params[$p]['name']}超标";
                                $alert_ch = $diff>0?abs($diff)."↑":abs($diff)."↓";
                                $relic_name = isset($relics[$t_no])?$relics[$t_no]['name']:"";
                                $msg = "{$relic_name} {$params[$p]['name']} {$v}{$params[$p]['unit']}({$alert_ch})";
                                $env_names = array();
                                if(isset($env)&&isset($env['name'])&&$env['name']){
                                    $env_names[] = $env['name'];
                                }
                                $env_names[] = $equip['equip_type'];
                                $env_names[] = substr($equip['equip_no'],-4);
                                $sendMsg = array(
                                    "alert"=>$alert_type,
                                    "env_no"=>$env_no,
                                    "env_name"=>implode("-",$env_names),
                                    "msg"=>$msg,
                                );
                                sendWebMsg($send_alert,$sendMsg);
                                M('msg')->sendToAndriod($env_no,$p,$alert['content'],$json['param']);
                            }else{
                                $query = array('equip_no'=>$equip['equip_no'],'alert_param'=>$p,'env_no'=>$env_no,'clear_time'=>null);
                                $result = $alt->update(array('clear_time' =>$json['server_time']),$query);
                            }
                        }
                    }else{
                        continue;
                    }
                }
            }
        }
        return $alert_param;
    }



    function security_alert($equip=array(),$json=array())
    {
        $alert_param = array();
        if(isset($json['param'])&&$json['param']){
            foreach($json['param'] as $jp=>$jv){
                if(in_array($jp,array("broken","vibration","multi_wave"))){
                    if($jv){
                        $alert = array();
                        $alert['env_no'] = $equip['env_no'];
                        $relic_no = M('data')->findRelic($equip['env_no']);
                        $alert['relic_no'] = $relic_no?implode(',',$relic_no):"";
                        $alert['equip_no'] = $equip['equip_no'];
                        $alert['alert_type'] = "area";
                        $alert['level'] = 'common';
                        $alert['content'] = "";
                        $alert['alert_time'] = $json['server_time'];
                        $alert['alert_count'] = 1;
                        $alert['alert_val'] = 1;
                        $alert['alert_param'] = $jp;

                        $msg = $jp;
                        if($jp == "broken"){
                            $alert['content'] = "玻璃破碎";
                        }else if($jp == "vibration"){
                            $alert['content'] = "异常震动";
                        }else if($jp == "multi_wave"){
                            $alert['content'] = "多维驻波预警";
                        }

                        $alt = M("alert");
                        $query = array('equip_no'=>$alert['equip_no'],'alert_type'=>$alert['alert_type'],'alert_param'=>$alert['alert_param'],'level'=>$alert['level'],'env_no'=>$alert['env_no'],'clear_time'=>null);
                        $pre_alert = $alt->find($query,"*","alert_time desc");
                        if($pre_alert){
                            $up_data = array();
                            $up_data['alert_count'] = $pre_alert['alert_count'] + 1;
                            $alt->update($up_data,"id = ".$pre_alert['id']);
                        }else{
                            $alt->add($alert);
                        }
                        $send_alert = "security_alert";
                        $sendMsg = array(
                            "alert"=>$jp,
                            "env_no"=>$equip['env_no'],
                            "msg"=>$alert['content'],
                            "temperature"=>isset($json['param']['temperature'])?$json['param']['temperature']:"",
                            "humidity"=>isset($json['param']['humidity'])?$json['param']['humidity']:"",
                        );
                        sendWebMsg($send_alert,$sendMsg);

                        $alert_param[] = $jp;
                    }
                }
            }
        }

        return $alert_param;
    }

    function box_alerts($equip = array(),$json=array())
    {
        $alert_param = array();
        if(isset($json['param'])&&$json['param']){
            foreach($json['param'] as $jp=>$jv){
                if(in_array($jp,array("box_open_alert","move_alert"))){
                    $send_alert = "box_alert";
                    if($jv){
                        $env_no = $equip['equip_no'];
                        $alert = array();
                        $alert['env_no'] = $env_no;
                        $relic_no = M('data')->findRelic($env_no);
                        $alert['relic_no'] = $relic_no?implode(',',array_keys($relic_no)):"";
                        $alert['equip_no'] = $equip['equip_no'];
                        $alert['alert_type'] = "area";
                        $alert['level'] = 'common';
                        $alert['content'] = "";
                        $alert['alert_time'] = $json['server_time'];
                        $alert['alert_count'] = 1;
                        $alert['alert_val'] = 1;
                        $alert['alert_param'] = $jp;

                        $alert_status = 0;
                        $msg = "";
                        if($jp == "box_open_alert"){
                            $alert_status = 3;
                            $msg = "非法开盖";
                            $alert['content'] = "非法开盖";
                        }else if($jp == "move_alert"){
                            $alert_status = 2;
                            $msg = "异常震动";
                            $alert['content'] = "异常震动";
                        }

                        $alt = M("alert");
                        $box = M('box')->fetOne("env_no = '{$equip['equip_no']}'");
                        $up = array();
                        if($box){
                            if(isset($box['alert_status'])||$box['alert_status'] == null){
                                if($alert_status >= $box['alert_status']){
                                    $up['alert_status'] = $alert_status;
                                }
                            }
                           if($up){
                               M('box')->update($up,"env_no='{$env_no}'");
                           }
                        }

                        $query = array('equip_no'=>$alert['equip_no'],'alert_type'=>$alert['alert_type'],'alert_param'=>$alert['alert_param'],'level'=>$alert['level'],'env_no'=>$alert['env_no'],'clear_time'=>null);
                        $pre_alert = $alt->find($query,"*","alert_time desc");
                        if($pre_alert){
                            $up_data = array();
                            $up_data['alert_count'] = $pre_alert['alert_count'] + 1;
                            $alt->update($up_data,"id = ".$pre_alert['id']);
//                            sendWebMsg($env_no,$jp,$msg,$json['param']['temperature'],$json['param']['humidity']);
                            M('msg')->sendToAndriod($env_no,$jp,$msg,$json['param']);
                        }else{
                            $alt->add($alert);
//                            sendWebMsg($env_no,$jp,$msg,$json['param']['temperature'],$json['param']['humidity']);
                            M('msg')->sendToAndriod($env_no,$jp,$msg,$json['param']);
                        }
                        $sendMsg = array(
                            "alert"=>$msg,
                            "env_no"=>$env_no,
                            "env_name"=>$box['name'],
                            "msg"=>$msg,
                            "temperature"=>isset($json['param']['temperature'])?$json['param']['temperature']:"",
                            "humidity"=>isset($json['param']['humidity'])?$json['param']['humidity']:"",
                        );
                        sendWebMsg($send_alert,$sendMsg);
                        $alert_param[] = $jp;
                    }
                }
            }
        }

        return $alert_param;
    }
}