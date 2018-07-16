<?php


require  dirname(__FILE__)."/PHPMailer/class.phpmailer.php";
require  dirname(__FILE__)."/PHPMailer/class.smtp.php";

class Mailer
{
    function send($user_emails=array(),$msg = array())
    {
        $mail = new PHPMailer(true);                              // true.启用exceptions
        try {
           if($user_emails){
               //Server settings
                // 是否启用smtp的debug进行调试 开发环境建议开启 生产环境注释掉即可 默认关闭debug调试模式
//               $mail->SMTPDebug = 1;
                // 使用smtp鉴权方式发送邮件
               $mail->isSMTP();
                // smtp需要鉴权 这个必须是true
               $mail->SMTPAuth = true;
                // 链接qq域名邮箱的服务器地址
               $mail->Host = 'smtp.ym.163.com';
                // 设置使用ssl加密方式登录鉴权
               $mail->SMTPSecure = 'ssl';
                // 设置ssl连接smtp服务器的远程服务器端口号
               $mail->Port = 465;
                // 设置发送的邮件的编码
               $mail->CharSet = 'UTF-8';
                // 设置发件人昵称 显示在收件人邮件的发件人邮箱地址前的发件人姓名
               $mail->FromName = app_config('app_name')?app_config('app_name'):'预防性保护系统';
                // smtp登录的账号邮箱即可
               $mail->Username = app_config('company_email')?app_config('company_email'):'mpecs@xintellitran.com';
                // smtp登录的密码 使用生成的授权码
               $mail->Password = app_config('company_email_pwd')?app_config('company_email_pwd'):'sgdzl2018';
                // 设置发件人邮箱地址 同登录账号
               $mail->From = app_config('company_email')?app_config('company_email'):'mpecs@xintellitran.com';
               // 邮件正文是否为html编码 注意此处是一个方法
               $mail->isHTML(true);
                // 设置收件人邮箱地址
               foreach ($user_emails as $user_email) {
                   $mail->addAddress($user_email);
               }
                // 添加该邮件的主题
               $mail->Subject = isset($msg['subject'])?$msg['subject']:'邮件主题';
                // 添加邮件正文
               $mail->Body = isset($msg['msg'])?$msg['msg']:'<h1>Hello World</h1>';
               // 为该邮件添加附件
               if(isset($msg['files'])&&$msg['files']){
                   foreach($msg['files'] as $file){
                       if(file_exists($file)){
                           $mail->addAttachment($file);
                       }
                   }
               }
               // 发送邮件 返回状态
               $status = $mail->send();
           }
            return $status;
        } catch (Exception $e) {
           return 'Message could not be sent. Mailer Error: '.$mail->ErrorInfo;
        }
    }
}