<?php

/**
 * Created by PhpStorm.
 * User: Hebj
 * Date: 2017/11/8
 * Time: 15:44
 */
class Import_model
{
    public function relic_box($url,$data = array())
    {
        $postdata = http_build_query($data);
        $options = array(
            'http' => array(
                'method' => 'POST',
                'header' => 'Content-type:application/x-www-form-urlencoded',
                'content' => $postdata,
                'timeout' => 15 * 60 // 超时时间（单位:s）
            )
        );
        $context = stream_context_create($options);
        $result = file_get_contents($url, false, $context);

        return $result;
//       return array(API("post/relics/relicBox/importFromJson",array("access_token"=>$token,"requestType"=>"pc",'dataBody'=>json_encode($tags))));
    }
}