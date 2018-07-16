<?php

/**
 * Created by PhpStorm.
 * User: Hebj
 * Date: 2017/8/9
 * Time: 16:21
 */
class Msg_model extends MY_Model
{
    function sendMsg($env_no,$alert,$msg="",$temp=null,$hum=null){
        $socket_host = get_ini_var('MUSEUM_NT_HOST', '127.0.0.1');//目标IP
        $socket_port = get_ini_var('MUSEUM_NT_WEB_PORT', '8020');//目标IP

        $socket_url = "http://{$socket_host}:{$socket_port}";

        $emit = "box_alert";
        if(in_array($alert,array("broken","vibration","multi_wave"))){
            $emit = "security_alert";
        }
        $param = "/".$emit."?alert=".$alert;
        if($env_no){
            $param .= "&env_no=".$env_no;
        }
        if($msg){
            $param .= "&msg=".$msg;
        }
        if($temp){
            $param .= "&temperature=".$temp;
        }
        if($hum){
            $param .= "&humidity=".$hum;
        }
        // 初始化一个 cURL 对象
        $curl = curl_init();
        // 设置你需要抓取的URL
        curl_setopt($curl, CURLOPT_TIMEOUT, 1);
        curl_setopt($curl, CURLOPT_URL, $socket_url.$param);
        // 设置header 响应头是否输出
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($curl, CURLOPT_HEADER, 0);
        // 运行cURL，请求网页
        $data = curl_exec($curl);
        // 关闭URL请求
        curl_close($curl);
        return $data;
    }

    public function sendToAndriod($env_no,$alert,$msg="",$param = array()){
        //error_reporting(E_ALL);
        $address = get_ini_var('MUSEUM_WEB_HOST', '127.0.0.1');//目标IP
        $service_port = 8848;//端口

        //发送命令
        $param = array(
            "env_no"=>$env_no,
            "alert"=>$alert,
            "msg"=>$msg,
            "param"=>$param
        );
        $json_param = json_encode($param)."\n";

        try{
            //创建 TCP/IP socket
            if(function_exists('socket_create')){
                ob_start();
                $socket = socket_create(AF_INET, SOCK_STREAM, SOL_TCP);
                if(@socket_connect($socket, $address, $service_port)){
                    socket_write($socket, $json_param, strlen($json_param));
                    ob_end_flush();
                    socket_close($socket);
                }
            }
        }catch(Exception $e){
            $this->response($e);
        }
    }

}