<?php

/**
 * Created by PhpStorm.
 * User: Hebj
 * Date: 2018/4/11
 * Time: 10:39
 */
require_once dirname(__FILE__)."/Sms.php";
require_once dirname(__FILE__) . "/Mailer.php";

class SendMsg
{
    public function sendAlertSms($alert_msgs)
    {
        $allow_send = true;
        if($phone_time = app_config('phone_time')){
            $today = date("Y-m-d");
            $phone_times = explode("-",$phone_time);
            $s_time = strtotime("{$today} ".$phone_times[0]);
            $e_time = strtotime("{$today} ".$phone_times[1]);
            if(time() < $s_time || time() > $e_time){
                $allow_send = false;
            }
        }
        if(!$allow_send){
            return array('error'=>"该时段禁止发送邮件");
        }
        if(app_config('phone_msg') && $allow_send){
            $phone_user = app_config('phone_user');
            $phones = array();
            $msgs = array();
            $signNames = array();
            if($phone_user){
                $ids = implode(",",$phone_user);
                $users = API('get/base/users',array('id'=>$ids,"select"=>"id,tel"));
                if(isset($users['rows'])){
                    foreach ($users['rows'] as $user) {
                        if(isset($user['tel'])&&$user['tel']){
                            $phones[] = $user['tel'];
                            if(isset($alert_msgs['msg'])&&is_array($alert_msgs['msg'])){
                                $alert_msgs['msg'] = implode(",",$alert_msgs['msg']);
                            }
                            $msgs[] = $alert_msgs;
                            $signNames[] = "智联预防性保护平台";
                        }
                    }
                }
            }
            if(empty($phones)){
                $this->response(array('error'=>"电话为空"));
            }
            $sms = new Sms();
            $templateCode = "SMS_130914444";
            $ret = $sms->sendBatchSms($phones,$msgs,$signNames,$templateCode);
            return $ret;
        }else{
            return array('error'=>"禁止发送短信");
        }
    }

    public function sendAlertEmail($msg)
    {
        $allow_send = true;
        if($email_time = app_config('email_time')){
            $today = date("Y-m-d");
            $email_times = explode("-",$email_time);
            $s_time = strtotime("{$today} ".$email_times[0]);
            $e_time = strtotime("{$today} ".$email_times[1]);
            if(time() < $s_time || time() > $e_time){
                $allow_send = false;
            }
        }
        if(!$allow_send){
            return array('error'=>"该时段禁止发送邮件");
        }
        if(app_config('email_msg')){
            $email_user = app_config('email_user');
            $emails = array();
            if($email_user){
                $ids = implode(",",$email_user);
                $users = API('get/base/users',array('id'=>$ids,"select"=>"id,email"));
                if(isset($users['rows'])){
                    foreach ($users['rows'] as $user) {
                        if(isset($user['email'])&&$user['email']){
                            $emails[] = $user['email'];
                        }
                    }
                }
            }
            if(empty($emails)){
                return array('error'=>"邮箱为空");
            }
            $mailer = new Mailer();
            $ret_email = $mailer->send($emails,$msg);
            return $ret_email;
        }else{
            return array('error'=>"禁止发送邮件");
        }
    }

}