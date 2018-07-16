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


if (!function_exists('get_standard_deviation')) {
    function get_standard_deviation($data = array())
    {
        $sd = 0;
        if($data){
            $sum = array_sum($data);
            $n = sizeof($data);
            $average = $sum/$n;

            $pow_sum = 0;
            foreach($data as $d){
                $pow_sum += pow($d - $average,2);
            }

            $sd = round(pow($pow_sum/$n,0.5),2);
        }

        return $sd;
    }
}

/**
* 剔除离群值 （拉依达准则）
*/
if (!function_exists('remove_outliers2')) {
    function remove_outliers2($data, $magnitude = 3){
        if(empty($data)) return $data;
        $count = count($data);
        $avg = array_sum($data) / $count;

        // 标准差
        $deviation = $magnitude * round(sqrt(array_sum(array_map(function($x, $avg){
            return pow($x - $avg, 2);
        }, $data, array_fill(0, $count, $avg))) / $count), 2);

        // 过滤离群值
        return array_filter($data, function($x) use ($avg, $deviation) { 
            return ($x <= $avg + $deviation && $x >= $avg - $deviation); 
        });
    }
}


/**
* 剔除离群值 （箱式图法）
*/
if (!function_exists('remove_outliers')) {
    function remove_outliers($data){
        $boxplot = calc_boxplot($data);
        if(isset($boxplot[5]) && $boxplot[5]){
            // 过滤离群值
            return array_filter($data, function($x) use ($boxplot) { 
                return !in_array($x, $boxplot[5]);
            });
        }
        return $data;
    }
}

/**
* 计算箱线图数据  包含离群值
*/
if (!function_exists('calc_boxplot')) {
    function calc_boxplot($data){
        $c = count($data);
        if($c<4) return array();
        
        usort($data, function($a, $b){
            return $a > $b ? 1 : -1;
        });

        $i = ceil($c*0.25);
        $q1 = ($data[$i]+$data[$i-1])/2;

        $i = ceil($c*0.5);
        $q2 = ($data[$i]+$data[$i-1])/2;

        $i = ceil($c*0.75);
        $q3 = ($data[$i]+$data[$i-1])/2;

        $iqr = $q3 - $q1;
        $lower = max($q1-1.5*$iqr, min($data));
        $upper = min($q3+1.5*$iqr, max($data));

        $outliers = array_filter($data, function($x) use ($lower, $upper) { 
            return $x > $upper || $x < $lower; 
        });

        return array($lower, $q1, $q2, $q3, $upper, array_values($outliers));
    }
}


/**
* 参数描述性判断
* @param data [array] 计算后的数据
* @param param [string] 参数
* @param type [string] 类型,如日波动、标准差等，默认表示整体
*/
if (!function_exists('desc_judge')) {
    function desc_judge($data, $param, $type=''){
        $desc = '';
        if($data){
            try{
                switch ($param) {
                    // 温度
                    case 'temperature':
                        // 湿度
                    case 'humidity':
                        switch ($type) {
                            case '稳定性较好日期':
                            case '稳定性较差日期':
                                $range_x_date = $type=='稳定性较好日期' ? 'range_min_date' : 'range_max_date';
                                $std_x_date = $type=='稳定性较好日期' ? 'std_min_date' : 'std_max_date';
                                $c = count($data) > 1 ? 2 : 0;
                                $count_date = array_count_values(array_merge(array_column($data, $range_x_date), array_column($data, $std_x_date)));
                                $date_bad = array_filter($count_date, function($x) use($c){
                                    return $x>$c;
                                });
                                $desc = count($date_bad) ? implode('、', array_keys($date_bad)) : '无日期';
                                break;
                            case '日波动':
                                $env_bad_max = array();
                                $env_bad_avg = array();
                                if($param == 'temperature'){
                                    $std_wave = 4;
                                }else{
                                    $std_wave = 7;
                                }
                                foreach ($data as $evn_name => $wave) {
                                    if(isset($wave[0])&&$wave[0]>$std_wave){
                                        array_push($env_bad_max, $evn_name);
                                    }
                                    if(isset($wave[2])&&$wave[2]>$std_wave){
                                        array_push($env_bad_avg, $evn_name);
                                    }
                                }
                                $desc = "";
                                if(empty($env_bad_max)&&empty($env_bad_avg)){
                                    $desc = "整体日波动数据范围较为适宜，稳定性良好";
                                }else if(empty($env_bad_avg) && sizeof($env_bad_max) >0){
                                    $desc = "存在日波动偏大的日期";
                                }else if(sizeof($env_bad_avg) == sizeof($data)){
                                    $desc = "整体日波动数据范围偏高，稳定性有待提高";
                                }else{
                                    $desc = implode("，",$env_bad_max)." 日波动偏大，稳定性有待提高";
                                }
                                break;
                            case '标准差':
                                $env_bad_range = array();
                                $env_bad_std = array();
                                if($param == 'temperature'){
                                    $std_value = 1.8;
                                    $range_value = 8;
                                    $unit = "℃";
                                }else{
                                    $std_value = 7;
                                    $range_value = 20;
                                    $unit = "%";
                                }
                                foreach ($data as $env_name => $std) {
                                    if(isset($std['std'])&&$std['std'] > $std_value){
                                        array_push($env_bad_std, $env_name);
                                    }
                                    if(isset($std['range']) && $std['range'] > $range_value){
                                        array_push($env_bad_range, $env_name);
                                    }
                                }
                                if(empty($env_bad_range)&&empty($env_bad_std)){
                                    $desc = "整体标准差及全距数据范围较为适宜，稳定性良好";
                                }else if(sizeof($env_bad_range) == sizeof($data) && sizeof($env_bad_std) ==  sizeof($data)){
                                    $desc = "整体标准差及全距数据范围偏高，稳定性有待提高";
                                }else if(sizeof($env_bad_range) < sizeof($data) && sizeof($env_bad_std) ==  sizeof($data)){
                                    $desc = "整体标准差偏高，稳定性有待提高";
                                }else if(sizeof($env_bad_range) == sizeof($data) && sizeof($env_bad_std) <  sizeof($data)){
                                    $desc = "整体全距偏高，稳定性有待提高";
                                }else{
                                    if(!empty($env_bad_range) ){
                                        $desc .= "，".implode("，",$env_bad_range)." 全距偏大，稳定性有待提高";
                                    }
                                    if(!empty($env_bad_std) ){
                                        $desc .= "，".implode("，",$env_bad_std)." 标准差偏大，稳定性有待提高";
                                    }
                                }

                                break;
                            case '全距':
                                $env_bad = array();
                                if($param == 'temperature'){
                                    $range_value = 8;
                                }else{
                                    $range_value = 20;
                                }
                                foreach ($data as $evn_name => $wave) {
                                    if($wave>$range_value){
                                        array_push($env_bad, $evn_name);
                                    }
                                }
                                $desc = sizeof($env_bad)? '，存在全距偏大的环境' : '';
                                break;
                            default:
                                $q2s = array_column($data, 2);
                                if($q2s){
                                    $q2s_avg = round(array_sum($q2s)/sizeof($q2s),2);
                                }
                                if($param == 'temperature'){
                                    $avg_min = 18;
                                    $avg_max = 22;
                                }else{
                                    $avg_min = 30;
                                    $avg_max = 60;
                                }

                                if(isset($q2s_avg) && $q2s_avg<$avg_min){
                                    $desc = '偏低';
                                }elseif(isset($q2s_avg) && $q2s_avg>$avg_max){
                                    $desc = '偏高';
                                }else{
                                    $desc = '数据范围较为适宜';
                                }
                                if($q2s && min($q2s) < $avg_min ){
                                    $desc .= "，存在偏低的环境";
                                }

                                if($q2s && max($q2s) > $avg_max){
                                    $desc .= "，存在偏高的环境";
                                }
                                break;
                        }
                        break;

                        // 光照
                    case 'light':
                        //紫外
                    case 'uv':
                    if(is_array($data)&&$data){
                        switch($param){
                            case "light":
                                $std_value2 = 300;
                                break;
                            case "uv":
                                $std_value2 = 20;
                                break;
                        }
                        $min = min($data);
                        $max = max($data);
//                            $avg
                        if($min > $std_value2){
                            $desc = "偏高";
                        }else if($max < $std_value2){
                            $desc = "数据范围较为适宜";
                        }else{
                            $desc = '存在数据偏高的监测点';
                        }
                    }
                        break;
                        // 有机挥发物
                    case 'voc':
                    // co2
                    case 'co2':
                        if(is_array($data)&&$data){
                            switch($param){
                                case "voc":
                                    $std_value2 = 300;
                                    break;
                                case "co2":
                                    $std_value2 = 1000;
                                    break;
                            }
                            $all_min = array_column($data,'min');
                            $all_max = array_column($data,'max');
                            $all_avg = array_column($data,'avg');

                            $min = min($all_min);
                            $max = max($all_max);
                            $max_avg = max($all_avg);
                            $min_avg = min($all_avg);

//                            $avg
                            if($max <= $std_value2 && $max_avg <= 700){
                                $desc = "数据范围较为适宜";
                            }else if($max > $std_value2 && $max_avg <= 700){
                                $desc = '存在数据偏高的数据';
                            }else if($min_avg > 700){
                                $desc = "偏高";
                            }else{
                                $desc = '存在数据偏高的监测点';
                            }
                        }
                        break;
                }
            }catch(Exception $e){
                exit($e->getMessage());
            }
        }
        return $desc;
    }
}

if(!function_exists('data_filter')){
    function data_filter($val,$param){
        switch($param){
            case 'temperature':
            case 'soil_temperature':
                $min = -10;
                $max = 60;
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

        if($val >= $min && $val <= $max){
            return true;
        }

        return false;
    }
}

if(!function_exists('get_children')){
    function get_children($envs,$env_no)
    {
        $children = array();
        if($envs){
            foreach ($envs as $env) {
                if(isset($env['parent_env_no'])&& $env['parent_env_no'] == $env_no){
                    array_push($children,$env);
                    $children = array_merge($children,get_children($envs,$env['env_no']));
                }
            }
        }

        return $children;
    }
}

//数据精度处理
if(!function_exists('deal_data_decimal')){
    /**
     * @param $param 参数类型
     * @param $val 参数值
     * @param $type 设备类型
     * @return float 返回值
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

