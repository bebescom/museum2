<?php

/**
 * Created by PhpStorm.
 * User: Hebj
 * Date: 2018/4/9
 * Time: 15:45
 */
class Alert_msg extends MY_Controller
{
    public function __construct()
    {
        parent::__construct();
        $parameters = M("equipments/equip")->get_parameters('sensor');
        $this->params = array();
        foreach($parameters as $parameter){
            $this->params[$parameter['param']] = $parameter;
        }
    }

    public function index()
    {
        $end_time = strtotime('now');
        $start_time = $end_time - 3600;

        $alert_count = array();//报警统计
        $data = array();

        $env_alert_sql = "select alert_param,count(*) as total from alert where alert_time >= {$start_time} and alert_time < {$end_time} group by alert_param order by total";
        $env_alerts = $this->db->query($env_alert_sql)->result_array();

        if($env_alerts){
            foreach ($env_alerts as $env_alert) {
                if(isset($env_alert['alert_param'])&&$env_alert['alert_param']){
                    $param = $env_alert['alert_param'];
                    if(isset($env_alert['total'])&&$env_alert['total']){
                        if(isset($this->params[$param])&&$this->params[$param]){
                            if(isset($this->params[$param]['name'])&&$this->params[$param]['name']){
                                $alert_type = $this->params[$param]['name']."超标";
                                $alert_count[$alert_type] = $env_alert['total'];
                            }
                        }
                    }
                }
            }
        }

        $equip_alert_sql = "select `type`,count(*) as total from equip_alert where alert_time >= {$start_time} and alert_time < {$end_time} group by `type` order by total";
        $equip_alerts = $this->db->query($equip_alert_sql)->result_array();
        if($equip_alerts){
            foreach ($equip_alerts as $equip_alert) {
                if(isset($equip_alert['type'])&&$equip_alert['type']){
                    if(isset($equip_alert['total'])&&$equip_alert['total']){
                        $alert_count[$equip_alert['type']] = $equip_alert['total'];
                    }
                }
            }
        }
        arsort($alert_count);
//        $this->response($alert_count);
        $alert_msgs = array();
        if($alert_count){
            foreach ($alert_count as $ac_key=>$ac_val) {
                $alert_msg = "{$ac_key} {$ac_val}次";
                $alert_msgs[] = $alert_msg;
            }
        }
        $s_day = date("Y-m-d",$start_time);
        $e_day = date("Y-m-d",$end_time);
        if($s_day === $e_day){
            if($s_day == date("Y-m-d")){
                $s_day = $e_day = "今天";
            }
            $data['start_time'] = $s_day." ".date("H",$start_time);
            $data['end_time'] = $e_day." ".date("H",$end_time);
        }else{
            $data['start_time'] = "昨天".date("H",$start_time);
            $data['end_time'] = "今天".date("H",$end_time);
        }
        if(empty($alert_msgs)){
            $this->response(array("msg"=>"该时间段内无报警"));
        }
        $this->load->Library('SendMsg');
        $result = array(
            'email'=>array(),
            'sms'=>array(),
        );
        /********** 发送短信 ************/
        $data['msg'] = $alert_msgs;
        $sms_ret = $this->sendmsg->sendAlertSms($data);
        $result['sms'] = $sms_ret===true?array('msg'=>'短信发送成功'):$sms_ret;

        /********* 发送邮件 ************/
        $email_msg = "您好！为您推送{$data['start_time']}点到{$data['end_time']}点预防性保护平台报警情况：<br>";
        $email_msg .= implode(",<br>",$alert_msgs);
        $email_data = array(
            'subject'=>"预防性保护系统报警信息推送",
            'msg'=>$email_msg,
        );

        $email_ret = $this->sendmsg->sendAlertEmail($email_data);
        $result['email'] = $email_ret===true?array('msg'=>'邮件发送成功'):$email_ret;
        $this->response($result);
    }
}