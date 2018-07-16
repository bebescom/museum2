<?php


if (!function_exists('app_config')) {
    /**
     * 获取系统配置参数
     * @param string $key
     * @param bool $load_local_config
     * @return mixed
     */
    function app_config($key = null, $load_local_config = false)
    {
        static $_api_config;
        if ($_api_config && !$load_local_config) {
            if ($key == null) {
                return $_api_config;
            }
            if (isset($_api_config[$key])) {
                return $_api_config[$key];
            }
        }
        $local_api = config_item('local_api');
        if ($local_api == 'base' || $load_local_config) {
            $m = M('config');
            $list = $m->fetAll();
            $_api_config = array();
            foreach ($list as $row) {
                $_api_config[$row['key']] = $row['val'];
            }
        } else {
            $_api_config = API('get/base/config/museum_config');
        }

        if ($key == null) {
            return $_api_config;
        }
        if (isset($_api_config[$key])) {
            return $_api_config[$key];
        }
        return false;
    }
}

//读取XML $xml = join("",file($filePath));
if (!function_exists('xml_to_array')) {
    function xml_to_array($xml)
    {
        $reg = "/<(\\w+)[^>]*?>([\\x00-\\xFF]*?)<\\/\\1>/";
        if (preg_match_all($reg, $xml, $matches)) {
            $count = count($matches[0]);
            $arr = array();
            for ($i = 0; $i < $count; $i++) {
                $key = $matches[1][$i];
                $val = xml_to_array($matches[2][$i]); // 递归
                if (array_key_exists($key, $arr)) {
                    if (is_array($arr[$key])) {
                        if (!array_key_exists(0, $arr[$key])) {
                            $arr[$key] = array($arr[$key]);
                        }
                    } else {
                        $arr[$key] = array($arr[$key]);
                    }
                    $arr[$key][] = $val;
                } else {
                    $arr[$key] = $val;
                }
            }
            return $arr;
        } else {
            return $xml;
        }
    }
}


if (!function_exists('zh_json_encode')) {
    function zh_json_encode($data)
    {
        if (defined('JSON_UNESCAPED_UNICODE')) {
            $ret = json_encode($data, JSON_UNESCAPED_UNICODE);
        } else {
            $ret = json_encode($data);
//            function utf8_json_encode($arr)
//            {
//                array_walk_recursive($arr, function (&$item, $key) {
//                    if (is_string($item)) $item = mb_encode_numericentity($item, array(0x80, 0xffff, 0, 0xffff), 'UTF-8');
//                });
//                return mb_decode_numericentity(json_encode($arr), array(0x80, 0xffff, 0, 0xffff), 'UTF-8');
//            }
//
//            $ret = utf8_json_encode($data);
        }
        return $ret;
    }
}

if (!function_exists('guid')) {
    /**
     * 生成GUID {xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx}
     * @return string
     */
    function guid()
    {
        $guid = '';
        if (function_exists('com_create_guid')) {
            $guid = com_create_guid();
        } else {
            mt_srand((double)microtime() * 10000);
            $charid = strtoupper(md5(uniqid(rand(), true)));
            $hypen = chr(45); //"-"
            $guid = chr(123) //"{"
                . substr($charid, 0, 8) . $hypen
                . substr($charid, 8, 4) . $hypen
                . substr($charid, 12, 4) . $hypen
                . substr($charid, 16, 4) . $hypen
                . substr($charid, 20, 12)
                . chr(125);
        }

        return $guid;
    }


}
if (!function_exists('uuid')) {
    function uuid()
    {
        $guid = guid();
        return trim($guid, '{}');
    }
}


if (!function_exists('checkmobile')) {
    /**
     * 检查电话号码格式正确
     * @param $phone
     * @return int
     */
    function checkMobile($phone)
    {
        return preg_match('/^((\(\d{2,3}\))|(\d{3}\-))?1[3458]\d{9}$/', $phone);
    }
}


if (!function_exists('zh_pathinfo')) {
    /**
     * 处理utf8 解决路径中含中文,pathinfo被忽略
     * @param $filepath
     * @return array
     */
    function zh_pathinfo($filepath)
    {
        $ret = array();
        $tarr = explode('/', $filepath);

        $ret['basename'] = array_pop($tarr);
        $ret['dirname'] = join('/', $tarr);
        $tarr = explode('.', $ret['basename']);
        $ret['extension'] = array_pop($tarr);
        $ret['filename'] = join('.', $tarr);
        unset($tarr);
        return $ret;
    }
}

if (!function_exists('authCode')) {
    /**
     * discuz加密解密
     * @param $string
     * @param string $operation
     * @param string $key
     * @param int $expiry
     * @return string
     */
    function authCode($string, $operation = 'DECODE', $key = '', $expiry = 0)
    {

        $ckey_length = 4;

        $key = md5($key ? $key : 'authcodekey122');
        $keya = md5(substr($key, 0, 16));
        $keyb = md5(substr($key, 16, 16));
        $keyc = $ckey_length ? ($operation == 'DECODE' ? substr($string, 0, $ckey_length) : substr(md5(microtime()), -$ckey_length)) : '';

        $cryptkey = $keya . md5($keya . $keyc);
        $key_length = strlen($cryptkey);

        $string = $operation == 'DECODE' ? base64_decode(substr($string, $ckey_length)) : sprintf('%010d', $expiry ? $expiry + time() : 0) . substr(md5($string . $keyb), 0, 16) . $string;
        $string_length = strlen($string);

        $result = '';
        $box = range(0, 255);

        $rndkey = array();
        for ($i = 0; $i <= 255; $i++) {
            $rndkey[$i] = ord($cryptkey[$i % $key_length]);
        }

        for ($j = $i = 0; $i < 256; $i++) {
            $j = ($j + $box[$i] + $rndkey[$i]) % 256;
            $tmp = $box[$i];
            $box[$i] = $box[$j];
            $box[$j] = $tmp;
        }

        for ($a = $j = $i = 0; $i < $string_length; $i++) {
            $a = ($a + 1) % 256;
            $j = ($j + $box[$a]) % 256;
            $tmp = $box[$a];
            $box[$a] = $box[$j];
            $box[$j] = $tmp;
            $result .= chr(ord($string[$i]) ^ ($box[($box[$a] + $box[$j]) % 256]));
        }

        if ($operation == 'DECODE') {
            if ((substr($result, 0, 10) == 0 || substr($result, 0, 10) - time() > 0) && substr($result, 10, 16) == substr(md5(substr($result, 26) . $keyb), 0, 16)) {
                return substr($result, 26);
            } else {
                return '';
            }
        } else {
            return $keyc . str_replace('=', '', base64_encode($result));
        }
    }
}
if (!function_exists('my_encode')) {

    /**
     * @param array $arr
     * @param string $key
     * @param int $expiry
     * @return string
     */
    function my_encode($arr = array(), $key = '', $expiry = 0)
    {
        return base64_encode(authCode(base64_encode(json_encode($arr)), 'ENCODE', $key, $expiry));
    }

    /**
     * @param string $str
     * @param string $key
     * @param int $expiry
     * @return mixed
     */
    function my_decode($str = '', $key = '', $expiry = 0)
    {
        return json_decode(base64_decode(authCode(base64_decode($str), 'DECODE', $key, $expiry)), true);
    }
}
if (!function_exists('my_json_encode')) {
    function my_json_encode($arr = array())
    {
        return urldecode(json_encode(array_map('urlencode', $arr)));
    }
}


// 生成下载文件重名处理
if (!function_exists('judgeRename')) {
    function judgeRename($filename=""){
        $info = pathinfo($filename);
        for ($i=1; ; $i++) {  // 重名判断
            if(file_exists($filename)){
                $xx = sprintf("%'.02d", $i);
                $filename = "{$info['dirname']}/{$info['filename']}_{$xx}.{$info['extension']}";
            }else{
                break;
            }
        }
        return $filename;
    }
}

//数据精度处理
if(!function_exists('deal_data_decimal')){
    /**
     * @param $param 参数类型
     * @param $val 参数值
     */
    function deal_data_decimal($param,$val,$type=null)
    {
        switch($param){
            case 'temperature':
            case 'wind_speed':
            case 'soil_temperature':
            case 'soil_humidity':
            case 'soil_conductivity':
            case 'soil_salt':
            case 'accel':
            case 'speed':
            case 'displacement':
            case 'voltage':
                $temp_val = round($val,1);
                break;
            case 'cascophen':
            case 'rain':
            case 'so2':
                $temp_val = round($val,2);
                break;
            case 'uv':
                if($type == 'weather'){
                    $temp_val = round($val*100,2);
                }else{
                    $temp_val = round($val,2);
                }
                break;
            case 'pm25':
            case 'pm10':
            case 'air_presure':
            case 'organic':
            case 'inorganic':
            case 'sulfur':
            case 'voc':
            case 'co2':
            case 'humidity':
            $temp_val = round($val);
                break;
            default:
                $temp_val = $val;
                break;
        }

        if($temp_val == '0.0'|| $temp_val == '0.00'){
            $temp_val = 0;
        }

        return $temp_val;
    }
}

/**
* 获取设备类型
 */
if(!function_exists('equip_type'))
{

    function equip_type($option='code'){
        static $_equip_types;
        if($_equip_types){
           if(isset($_equip_types[$option])){
               return $_equip_types[$option];
           }
        }

        $equip_types = M("equip_type")->fetAll("","*","sort asc");
        if($equip_types){
            foreach ($equip_types as $equip_type) {
                if(isset($equip_type['code'])&&isset($equip_type['equip_type'])){
                    if(!isset($_equip_types['code'])){
                        $_equip_types['code'] = array();
                    }
                    $_equip_types['code'][$equip_type['equip_type']] = $equip_type['code'];
                }
                if(isset($equip_type['type'])&&isset($equip_type['equip_type'])){
                    if(!isset($_equip_types['type'])){
                        $_equip_types['type'] = array();
                    }
                    if(!isset($_equip_types['type'][$equip_type['type']])){
                        $_equip_types['type'][$equip_type['type']] = array();
                    }
                    $_equip_types['type'][$equip_type['type']][$equip_type['sort']] = $equip_type['equip_type'];
                }
            }
        }

        return $_equip_types[$option];
    }

}

if(!function_exists('upload')){
    /**
     *上传文件
     * @param $file  上传文件源
     * @param $type 上传文件格式限定[excel,image,word]
     * @return  上传结果及路径
     */
    function upload($file,$type=null){
        $tmp_file = $file['tmp_name'];
        $file_types = explode(".", $file['name']);
        $file_type = $file_types[count($file_types) - 1];
        $old_name = $file_types[0];
        $suffix = array();

        switch($type){
            case 'excel':
                $suffix = array('xls','xlsx');
                $suffix_name = "Excel";
                break;
            case 'image':
                $suffix = array('png','jpg','jpeg','gif');
                $suffix_name = "图片";
                break;
            case 'word':
                $suffix = array('word');
                $suffix_name = "word";
                break;
            case "zip":
                $suffix = array("zip");
                $suffix_name = "ZIP";
                break;
        }
        //判断文件格式
        if($suffix){
            if(!in_array(strtolower($file_type),$suffix)){
                return array('error'=>'上传文件不是'.$suffix_name.'文件，请重新上传！');
            }
        }

        //上传文件存储路径
        $save_dir='./upload_file/';
        if(!is_dir($save_dir)){
            mkdir($save_dir);
        }
        $os_name = PHP_OS;
        if(strpos($os_name,"WIN")!==false){
            $old_name = mb_convert_encoding($old_name,"gbk","utf-8");
        }

        //以时间来命名上传的文件
        $str = date( 'Ymdhis' );
        $file_name = $old_name.'_'.$str . "." . $file_type;
        $save_path = $save_dir.$file_name;
        //是否上传成功
        if (!copy($tmp_file, $save_path)){
            return array('error'=>'上传失败！',copy($tmp_file, $save_path));
        }

        return array('result'=>true,'msg'=>'上传成功','save_path'=>$save_path);
    }
}

if(!function_exists("sendWebMsg")){
    function sendWebMsg($emit,$data=array()){
        $socket_host = get_ini_var('MUSEUM_NT_HOST', '127.0.0.1');//目标IP
        $socket_port = get_ini_var('MUSEUM_NT_WEB_PORT', '8020');//目标IP

        $socket_url = "http://{$socket_host}:{$socket_port}";

        $data_str = http_build_query($data);

        $param = "/{$emit}?{$data_str}";
        $url = $socket_url.$param;
        // 初始化一个 cURL 对象
        $curl = curl_init();
        // 设置你需要抓取的URL
        curl_setopt($curl, CURLOPT_TIMEOUT, 10);
        curl_setopt($curl, CURLOPT_URL, $url);
        // 设置header 响应头是否输出
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($curl, CURLOPT_HEADER, 0);
        // 运行cURL，请求网页
        $data = curl_exec($curl);
        // 关闭URL请求
        curl_close($curl);

        return $data;
    }
}
