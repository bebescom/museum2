<?php

/**
 * Created by PhpStorm.
 * User: Hebj
 * Date: 2016/10/28
 * Time: 13:27
 */
class Envs extends MY_Controller
{
    public function __construct()
    {
        parent::__construct();
        $this->order_time = "equip_time";

        $sensor_param = M("equipments/equip")->get_parameters('sensor');
        $this->param = array();
        if ($sensor_param) {
            foreach ($sensor_param as $sp) {
                if (isset($sp['param']) && $sp['param']) {
                    $this->param[$sp['param']] = array("name" => $sp['name'], "unit" => $sp['unit']);
                }
            }
        }
    }

    public function all_envs_get()
    {
        $envs = API("get/base/envs");
        //用户行为
        $act_env = API("get/base/users/active");
//        $act_env = array();
//        if ($actives) {
//            foreach ($actives as $active) {
//                if (isset($active['key']) && $active['key']) {
//                    $act_env[$active['key']] = array();
//                    if (isset($active['value']) && $active['value']) {
//                        $act_env[$active['key']] = $active['value'];
//                    }
//                }
//            }
//        }
        $building = array();
        $floor = array();
        $data = array();
        $env_nos = array();
        $images = API("get/base/envs/images");//获取图片
        if (isset($this->_user['data_scope']) && $this->_user['data_scope']) {
            if (!isset($data['follow'])) {
                $data['follow'] = array(
                    'env_no' => "follow",
                    'name' => "关注",
                    "rows" => array()
                );
            }
            if (isset($envs['rows']) && $envs['rows']) {
                foreach ($envs['rows'] as $k=>$env) {
                    if (isset($env['type']) && $env['type'] == "楼栋") {
                        $env['image'] = null;
                        if ($images && isset($images[$env['env_no']])) {
                            if (isset($images[$env['env_no']]['home']) && $images[$env['env_no']]['home']) {
                                $env['image'] = $images[$env['env_no']]['home'];
                            }
                        }

                        if (isset($env['env_no']) && $env['env_no']) {
                            $building[$env['env_no']] = $env;
                        }
                    }
                }

                foreach ($envs['rows'] as $k=>$env) {
                    if (isset($env['type']) && $env['type'] == "楼层") {
                        if (isset($env['env_no']) && $env['env_no']) {
                            $env['image'] = null;
                            if ($images && isset($images[$env['env_no']])) {
                                if (isset($images[$env['env_no']]['home']) && $images[$env['env_no']]['home']) {
                                    $env['image'] = $images[$env['env_no']]['home'];
                                }
                            }

                            if (isset($env['parent_env_no']) && $env['parent_env_no']) {
                                if (isset($building[$env['parent_env_no']])) {
                                    $floor[$env['env_no']] = $building[$env['parent_env_no']];
                                }
                            }
                        }
                    }
                }
                $small_env = array("展厅", "库房", "修复室", "研究室");
                foreach ($envs['rows'] as $env) {
                    if (isset($env['type']) && in_array($env['type'], $small_env)) {
                        if ($env['type'] == "展厅" || $env['type'] == "库房") {
                            if (isset($env['env_no']) && $env['env_no']) {
                                $env_nos[] = $env['env_no'];
                                $env['image'] = null;
                                if ($images && isset($images[$env['env_no']])) {
                                    if (isset($images[$env['env_no']]['home']) && $images[$env['env_no']]['home']) {
                                        $env['image'] = $images[$env['env_no']]['home'];
                                    }
                                }

                                //是否关注
                                $env['关注'] = false;
                                if (isset($act_env["关注"]) && $act_env["关注"]) {
                                    if (in_array($env['env_no'], array_keys($act_env["关注"]))) {
                                        $env['关注'] = true;
                                        $data['follow']['rows'][$env['env_no']] = array_merge($act_env["关注"][$env['env_no']], $env);
                                    }
                                }

                                if (isset($env['parent_env_no']) && $env['parent_env_no']) {
                                    if (isset($floor[$env['parent_env_no']])) {
                                        if (isset($floor[$env['parent_env_no']]['env_no'])) {
                                            $b_no = $floor[$env['parent_env_no']]['env_no'];
                                            if (!isset($data[$b_no])) {
                                                $data[$b_no] = $floor[$env['parent_env_no']];
                                                $data[$b_no]['rows'] = array(
                                                    "展厅" => array(),
                                                    "库房" => array()
                                                );
                                            }
                                            $env['last_time'] = 0;
                                            if (isset($act_env["浏览"]) && $act_env["浏览"]) {
                                                if(isset($act_env["浏览"][$env['env_no']])){
                                                    $env['last_time'] = $act_env["浏览"][$env['env_no']]['last_time'];
                                                }
                                            }
                                            $data[$b_no]['rows'][$env['type']][$env['env_no']] = $env;
                                        }
                                    }
                                }
                            }
                        } else {
                            if (!isset($data['other'])) {
                                $data['other'] = array(
                                    "env_no" => "other",
                                    "name" => "其它",
                                    "rows" => array()
                                );
                            }
                            $env['image'] = null;
                            if ($images && isset($images[$env['env_no']])) {
                                if (isset($images[$env['env_no']]['home']) && $images[$env['env_no']]['home']) {
                                    $env['image'] = $images[$env['env_no']]['home'];
                                }
                            }
                            $env_nos[] = $env['env_no'];
                            $env['关注'] = false;
                            if (isset($act_env["关注"]) && $act_env["关注"]) {
                                if (in_array($env['env_no'], array_keys($act_env["关注"]))) {
                                    $env['关注'] = true;
                                    $data['follow']['rows'][$env['env_no']] = array_merge($act_env["关注"][$env['env_no']], $env);
                                }
                            }
                            $env['last_time'] = 0;
                            if (isset($act_env["浏览"]) && $act_env["浏览"]) {
                                if(isset($act_env["浏览"][$env['env_no']])){
                                    $env['last_time'] = $act_env["浏览"][$env['env_no']]['last_time'];
                                }
                            }
                            $data['other']['rows'][$env['env_no']] = $env;
                        }
                    }
                }
            }

            $poles = array();
            if(isset($env_nos)&&$env_nos){
                foreach ($env_nos as $env_no) {
                    $sql = "select min(temperature) as temperature_min,max(temperature) as temperature_max,min(humidity) as humidity_min,max(humidity) as humidity_max from data_sensor where ".
                        " temperature != 'NaN' and temperature is not null and humidity != 'NaN' and humidity is not null and env_no like '".$env_no."%' and ".
                        $this->order_time." between ".strtotime("yesterday")." and ".strtotime("today");
                    $data_sensor = $this->db->query($sql)->row_array();
                    if($data_sensor){
                        $temp = array();
                        $temp['env_no'] = $env_no;
                        foreach($data_sensor as $p=>$val){
                            if($p!="env_no"){
                                $ps = explode("_",$p);
                                if(!isset($temp[$ps[0]])){
                                    $temp[$ps[0]] = array();
                                    if(isset($this->param[$ps[0]])){
                                        $temp[$ps[0]] = array_merge($temp[$ps[0]],$this->param[$ps[0]]);
                                    }
                                }
                                $temp[$ps[0]][$ps[1]] = deal_data_decimal($ps[0],$val);
                            }
                        }
                        if($temp){
                            $poles[$env_no] = $temp;
                        }
                    }
                }
            }

//            if(isset($act_env["关注"])){
//                $data['follow']['rows'] = $act_env["关注"];
//            }
            if ($data) {
                foreach ($data as $k => $d) {
                    if ($k != "follow" && $k != "other") {
                        if (isset($d['rows']) && $d['rows']) {
                            foreach ($d['rows'] as $dk => $dr) {
                                if ($dr) {
                                    //按访问时间排序
                                    uasort($data[$k]['rows'][$dk], function ($a, $b) {
                                        if (isset($a['last_time']) && isset($b['last_time'])) {
                                            if ($a['last_time'] == $b['last_time']) return 0;
                                            return ($a['last_time'] > $b['last_time']) ? -1 : 1;
                                        }
                                    });
                                    foreach ($data[$k]['rows'][$dk] as $no => $v) {
                                        if ($this->_user['data_scope'] != "administrator") {
                                            if (!in_array($no, $this->_user['data_scope'])) {
                                                unset($data[$k]['rows'][$dk][$no]);
                                                continue;
                                            }
                                        }
                                        if (isset($v['env_no']) && $v['env_no']) {
                                            if (isset($poles[$v['env_no']]) && $poles[$v['env_no']]) {
                                                $data[$k]['rows'][$dk][$no] = array_merge($data[$k]['rows'][$dk][$no], $poles[$v['env_no']]);
                                            }
                                        }
                                    }
                                    $data[$k]['rows'][$dk] = array_values($data[$k]['rows'][$dk]);
                                }
                            }
                        }
                    } else {
                        if (isset($d['rows']) && $d['rows']) {
                            //按访问时间排序
                            uasort($data[$k]['rows'], function ($a, $b) {
                                if (isset($a['last_time']) && isset($b['last_time'])) {
                                    if ($a['last_time'] == $b['last_time']) return 0;
                                    return ($a['last_time'] > $b['last_time']) ? -1 : 1;
                                }
                            });
                            foreach ($d['rows'] as $dk => $dr) {
                                if ($this->_user['data_scope'] != "administrator") {
                                    if (!in_array($dk, $this->_user['data_scope'])) {
                                        unset($data[$k]['rows'][$dk]);
                                        continue;
                                    }
                                }
                                if (isset($dr['env_no']) && $dr['env_no']) {
                                    if (isset($poles[$dr['env_no']]) && $poles[$dr['env_no']]) {
                                        $data[$k]['rows'][$dk] = array_merge($data[$k]['rows'][$dk], $poles[$dr['env_no']]);
                                    }
                                }
                            }
                            $data[$k]['rows'] = array_values($data[$k]['rows']);

                        }
                    }
                }
            }
        }

        $this->response($data);
    }

    public function env_overview()
    {
        $envs = API("get/base/envs");
        //用户行为
        $act_env = API("get/base/users/active");
        $follow_env = array();
        $browse_env = array();
        if (isset($act_env['关注'])) {
            $follow_env = $act_env['关注'];
        }
        if (isset($act_env['浏览'])) {
            $browse_env = $act_env['浏览'];
        }
        $building = array();
        $floor = array();
        $floor_parent = array();
        $data = array();
        $env_nos = array();
        if (isset($this->_user['data_scope']) && $this->_user['data_scope']) {
            if (!isset($data['follow'])) {
                $data['follow'] = array(
                    'env_no' => "follow",
                    'name' => "关注",
                    "rows" => array()
                );
            }
            $images = API("get/base/envs/images");//获取图片
            if(isset($envs['rows'])&&$envs['rows']){
                foreach ($envs['rows'] as $env) {
                    if (isset($env['env_no']) && $env['env_no'] && ($this->_user['data_scope'] == "administrator" || (is_array($this->_user['data_scope']) && in_array($env['env_no'], $this->_user['data_scope'])))) {
                        if (isset($env['type'])) {
                            switch ($env['type']) {
                                case "楼栋":
                                    $env['rows'] = array();
                                    $env['关注'] = false;
                                    if(isset($follow_env[$env['env_no']])){
                                        $env['关注'] = true;
                                        $fl_where = " temperature != 'NaN' and temperature is not null and humidity != 'NaN' and humidity is not null and env_no like '".$env['env_no']."%' and ".
                                            " equip_time between ".strtotime("yesterday")." and ".strtotime("today");
                                        $sql = "select min(temperature) as temperature_min,max(temperature) as temperature_max,min(humidity) as humidity_min,max(humidity) as humidity_max,count(*) as total from data_sensor where {$fl_where}";
                                        $data_sensor = $this->db->query($sql)->row_array();
                                        $temp = array(
                                            'temperature'=>array(
                                                'min'=>'-',
                                                'max'=>'-'
                                            ),
                                            'humidity'=>array(
                                                'min'=>'-',
                                                'max'=>'-'
                                            ),
                                        );
                                        if($data_sensor){
                                            if(isset($data_sensor['total'])&&$data_sensor['total']){
                                                foreach($data_sensor as $p=>$val){
                                                    if($p!="env_no" && $p != "total"){
                                                        $ps = explode("_",$p);
                                                        if(!isset($temp[$ps[0]])){
                                                            $temp[$ps[0]] = array();
                                                        }
                                                        $temp[$ps[0]][$ps[1]] = deal_data_decimal($ps[0],$val);
                                                    }
                                                }
                                            }
                                        }
                                        foreach($temp as $tp=>$tv){
                                            if(isset($this->param[$tp])){
                                                $tv = array_merge($tv,$this->param[$tp]);
                                            }
                                            $env[$tp] = $tv;
                                        }

                                        //浏览
                                        $env['last_time'] = 0;
                                        if(isset($browse_env[$env['env_no']])){
                                            $env['last_time'] = $browse_env[$env['env_no']]['last_time'];
                                        }
                                        $data['follow']['rows'][] = $env;
                                    }
                                    $data[$env['env_no']] = $env;
                                    $building[$env['env_no']] = $env['name'];
                                    break;
                                case "楼层":
                                    $env['rows'] = array();
                                    if (!isset($floor[$env['env_no']])) {
                                        $floor[$env['env_no']] = $env;
                                    }
                                    if(isset($env['parent_env_no'])&&$env['parent_env_no']){
                                        $floor_parent[$env['env_no']] = $env['parent_env_no'];
                                    }
                                    break;
                                default:
                                    break;
                            }
                        }
                    }
                }
                $temp_b = array();
                foreach ($envs['rows'] as $env) {
                    if(isset($env['env_no'])&&$env['env_no']&&($this->_user['data_scope'] == "administrator" ||(is_array($this->_user['data_scope'])&&in_array($env['env_no'],$this->_user['data_scope'])))){
                        $belong = null;
                        $belong_name = null;
                        if(isset($env['type'])){
                            switch($env['type']){
//                                case "楼栋":
//                                    $belong = $env['env_no'];
//                                    $belong_name = $env['name'];
//                                    break;
//                                case "楼层":
//                                    $belong = $env['env_no'];
//                                    $belong_name = $env['name'];
//                                    break;
                                 case "库房":
                                 case "展厅":
                                 case "修复室":
                                 case "研究室":
                                     if(isset($env['parent_env_no'])&&$env['parent_env_no']){
                                         if(isset($floor_parent[$env['parent_env_no']])){
                                             if(isset($building[$floor_parent[$env['parent_env_no']]])){
                                                 $building_no = $floor_parent[$env['parent_env_no']];
                                                 $building_name = $building[$building_no];
                                                 $belong = $building_no;
                                                 $belong_name = $building_name;
                                                 $temp_b[] = array($env['env_no'],$belong,$building_name);
                                             }
                                         }
                                     }
                                    break;
                                default:
                                    break;
                            }

                            if(isset($env['parent_env_no'])&&$env['parent_env_no']){
                                if(isset($floor[$env['parent_env_no']])){
                                    $floor[$env['parent_env_no']]['rows'][] = $env['env_no'];
                                }
                            }

                            //环境数据
                            if(in_array($env['type'],array("修复室","研究室","库房","展厅","楼层"))){
                                $where =  " temperature != 'NaN' and temperature is not null and humidity != 'NaN' and humidity is not null and env_no like '".$env['env_no']."%' and ".
                                    " equip_time between ".strtotime("yesterday")." and ".strtotime("today");
//                                $count_sql = "explain select count(*) as total from data_sensor where {$where}";
//                                $total = $this->db->query($count_sql)->row_array();
                                $temp = array(
                                    'temperature'=>array(
                                        'min'=>'-',
                                        'max'=>'-'
                                    ),
                                    'humidity'=>array(
                                        'min'=>'-',
                                        'max'=>'-'
                                    ),
                                );
                                $sql = "select min(temperature) as temperature_min,max(temperature) as temperature_max,min(humidity) as humidity_min,max(humidity) as humidity_max,count(*) as total from data_sensor where {$where}";
                                $data_sensor = $this->db->query($sql)->row_array();

                                if($data_sensor){
                                    if(isset($data_sensor['total'])&&$data_sensor['total']){
                                        foreach($data_sensor as $p=>$val){
                                            if($p!="env_no" && $p != "total"){
                                                $ps = explode("_",$p);
                                                if(!isset($temp[$ps[0]])){
                                                    $temp[$ps[0]] = array();
                                                }
                                                $temp[$ps[0]][$ps[1]] = deal_data_decimal($ps[0],$val);
                                            }
                                        }
                                    }
                                }
                                foreach($temp as $tp=>$tv){
                                    if(isset($this->param[$tp])){
                                        $tv = array_merge($tv,$this->param[$tp]);
                                    }
                                    $env[$tp] = $tv;
                                }

                                if(isset($belong)&&isset($belong_name)){
                                    //环境图片
                                    $env['image'] = null;
                                    if ($images && isset($images[$env['env_no']])) {
                                        if (isset($images[$env['env_no']]['home']) && $images[$env['env_no']]['home']) {
                                            $env['image'] = $images[$env['env_no']]['home'];
                                        }
                                    }

                                    //浏览
                                    $env['last_time'] = 0;
                                    if(isset($browse_env[$env['env_no']])){
                                        $env['last_time'] = $browse_env[$env['env_no']]['last_time'];
                                    }

                                    //关注
                                    $env['关注'] = false;
                                    if(isset($follow_env[$env['env_no']])){
                                        $env['关注'] = true;
                                        $data['follow']['rows'][] = $env;
                                    }

                                    if (!isset($data[$belong])) {
                                        $data[$belong] = array(
                                            'env_no' => $belong,
                                            'name' => $belong_name,
                                            "rows" => array()
                                        );
                                    }
                                    $data[$belong]['rows'][] = $env;
                                }
                            }
                        }
                    }
                }
            }

            //楼层处理---无子环境楼层加入列表
            if($floor){
                foreach ($floor as $floor_no=>$fl) {
                    if(isset($fl['rows'])&&empty($fl['rows'])){
                        unset($fl['rows']);
                        $fl_where = " temperature != 'NaN' and temperature is not null and humidity != 'NaN' and humidity is not null and env_no like '".$fl['env_no']."%' and ".
                            " equip_time between ".strtotime("yesterday")." and ".strtotime("today");
                        $sql = "select min(temperature) as temperature_min,max(temperature) as temperature_max,min(humidity) as humidity_min,max(humidity) as humidity_max,count(*) as total from data_sensor where {$fl_where}";
                        $data_sensor = $this->db->query($sql)->row_array();
                        $temp = array(
                            'temperature'=>array(
                                'min'=>'-',
                                'max'=>'-'
                            ),
                            'humidity'=>array(
                                'min'=>'-',
                                'max'=>'-'
                            ),
                        );
                        if($data_sensor){
                            if(isset($data_sensor['total'])&&$data_sensor['total']){
                                foreach($data_sensor as $p=>$val){
                                    if($p!="env_no" && $p != "total"){
                                        $ps = explode("_",$p);
                                        if(!isset($temp[$ps[0]])){
                                            $temp[$ps[0]] = array();
                                        }
                                        $temp[$ps[0]][$ps[1]] = deal_data_decimal($ps[0],$val);
                                    }
                                }
                            }
                        }
                        foreach($temp as $tp=>$tv){
                            if(isset($this->param[$tp])){
                                $tv = array_merge($tv,$this->param[$tp]);
                            }
                            $fl[$tp] = $tv;
                        }

                        //环境图片
                        $fl['image'] = null;
                        if ($images && isset($images[$fl['env_no']])) {
                            if (isset($images[$fl['env_no']]['home']) && $images[$fl['env_no']]['home']) {
                                $fl['image'] = $images[$fl['env_no']]['home'];
                            }
                        }

                        //浏览
                        $fl['last_time'] = 0;
                        if(isset($browse_env[$fl['env_no']])){
                            $fl['last_time'] = $browse_env[$fl['env_no']]['last_time'];
                        }
                        //关注
                        $fl['关注'] = false;
                        if(isset($follow_env[$fl['env_no']])){
                            $fl['关注'] = true;
                            $data['follow']['rows'][] = $fl;
                        }
                        if($building){
                            if(isset($fl['parent_env_no'])&&isset($building[$fl['parent_env_no']])){
                                $data[$fl['parent_env_no']]['rows'][] = $fl;
                            }
                        }
                    }
                }
            }
        }
        $return_data = array(
            "follow"=>array(),
            "envs"=>array(),
        );
        if($data){
            foreach ($data as $key=>$d) {
                if($key == "follow"){
                    usort($d['rows'],function ($a, $b) {
                        if (isset($a['last_time']) && isset($b['last_time'])) {
                            if ($a['last_time'] == $b['last_time']) return 0;
                            return ($a['last_time'] > $b['last_time']) ? -1 : 1;
                        }
                    });
                    $return_data[$key] = $d;
                }else{
                    if(isset($d['rows'])&&$d['rows']){
                        usort($d['rows'],function ($a, $b) {
                            if (isset($a['last_time']) && isset($b['last_time'])) {
                                if ($a['last_time'] == $b['last_time']) return 0;
                                return ($a['last_time'] > $b['last_time']) ? -1 : 1;
                            }
                        });
                    }else{
                        $fl_where = " temperature != 'NaN' and temperature is not null and humidity != 'NaN' and humidity is not null and env_no like '".$d['env_no']."%' and ".
                            " equip_time between ".strtotime("yesterday")." and ".strtotime("today");
                        $select = "min(temperature) as temperature_min,max(temperature) as temperature_max,min(humidity) as humidity_min,max(humidity) as humidity_max,count(*) as total";
                        $sql = "select {$select} from data_sensor where {$fl_where}";
                        $data_sensor = $this->db->query($sql)->row_array();
                        $temp = array(
                            'temperature'=>array(
                                'min'=>'-',
                                'max'=>'-'
                            ),
                            'humidity'=>array(
                                'min'=>'-',
                                'max'=>'-'
                            ),
                        );
                        if($data_sensor){
                            if(isset($data_sensor['total'])&&$data_sensor['total']){
                                foreach($data_sensor as $p=>$val){
                                    if($p!="env_no" && $p != "total"){
                                        $ps = explode("_",$p);
                                        if(!isset($temp[$ps[0]])){
                                            $temp[$ps[0]] = array();
                                        }
                                        $temp[$ps[0]][$ps[1]] = deal_data_decimal($ps[0],$val);
                                    }
                                }
                            }
                        }
                        foreach($temp as $tp=>$tv){
                            if(isset($this->param[$tp])){
                                $tv = array_merge($tv,$this->param[$tp]);
                            }
                            $d[$tp] = $tv;
                        }
                    }
                    $return_data['envs'][] = $d;
                }
            }
        }

        $this->response($return_data);
    }

    public function all_envs_detail_get($env_no)
    {
        //用户行为
        $actives = API("get/base/users/active");
        $act_env = $actives;

        $keyword = $env_no;
        if($env_no == "follow"){
            $keyword = "";
        }

        $envs = API("get/base/envs", array("sort_by" => "sort desc,id asc"));
        $building = array();
        $floor = array();
        $env_nos = array();
        if (isset($this->_user['data_scope']) && $this->_user['data_scope']) {
            $images = API("get/base/envs/images");//获取图片
            if (isset($envs['rows']) && $envs['rows']) {
                if ($env_no == "follow") {
                    if ($env_no == "follow") {
                        $name = "关注";
                        $type = null;
                    }

                    if (isset($act_env["关注"]) && $act_env["关注"]) {
                        $env_nos = array_keys($act_env["关注"]);
                    }

                    $building[$env_no] = array("env_no" => $env_no, "name" => $name, "parent_env_no" => "", "children" => array());
                    $floor_children = array();
                    foreach ($envs['rows'] as $env) {
                        if (isset($env['env_no'])&&in_array($env['env_no'],$env_nos)) {
                            $env['image'] = null;
                            if ($images && isset($images[$env['env_no']])) {
                                if (isset($images[$env['env_no']]['home']) && $images[$env['env_no']]['home']) {
                                    $env['image'] = $images[$env['env_no']]['home'];
                                }
                            }

                            $env['关注'] = true;
                            $env['last_time'] = 0;
                            if (isset($act_env["浏览"]) && $act_env["浏览"]) {
                                if (in_array($env['env_no'], array_keys($act_env["浏览"]))) {
                                    $env['last_time'] = $act_env["浏览"][$env['env_no']]['last_time'];
                                }
                            }

                            $where = " temperature != 'NaN' and temperature is not null and humidity != 'NaN' and humidity is not null and env_no like '{$env['env_no']}%' and ".
                                " equip_time between ".strtotime("yesterday")." and ".strtotime("today");
                            $select = "min(temperature) as temperature_min,max(temperature) as temperature_max,min(humidity) as humidity_min,max(humidity) as humidity_max,count(*) as total";
                            $sql = "select {$select} from data_sensor  where {$where}";
                            $data_sensor = $this->db->query($sql)->row_array();
                            $temp = array(
                                'temperature'=>array(
                                    'min'=>'-',
                                    'max'=>'-'
                                ),
                                'humidity'=>array(
                                    'min'=>'-',
                                    'max'=>'-'
                                ),
                            );
                            if($data_sensor){
                                foreach($data_sensor as $p=>$val){
                                    if(isset($data_sensor['total'])&&$data_sensor['total']){
                                        foreach($data_sensor as $p=>$val){
                                            if($p!="env_no" && $p != "total"){
                                                $ps = explode("_",$p);
                                                if(!isset($temp[$ps[0]])){
                                                    $temp[$ps[0]] = array();
                                                }
                                                $temp[$ps[0]][$ps[1]] = deal_data_decimal($ps[0],$val);
                                            }
                                        }
                                    }
                                }
                            }
                            foreach($temp as $tp=>$tv){
                                if(isset($this->param[$tp])){
                                    $tv = array_merge($tv,$this->param[$tp]);
                                }
                                $env[$tp] = $tv;
                            }

                            $floor_children[] = $env;
                            uasort($floor_children, function ($a, $b) {
                                if (isset($a['last_time']) && isset($b['last_time'])) {
                                    if ($a['last_time'] == $b['last_time']) return 0;
                                    return ($a['last_time'] > $b['last_time']) ? -1 : 1;
                                }
                            });//按访问时间排序
                        }
                        $building[$env_no]['children'] = array_values($floor_children);
                    }
                } else {
                    //楼栋信息
                    foreach ($envs['rows'] as $env) {
                        if (isset($env['type']) && $env['type'] == "楼栋") {
                            if (isset($env['env_no']) && $env['env_no'] == $env_no) {
                                $env['children'] = array();
                                $env['关注'] = false;
                                if (isset($act_env["关注"]) && $act_env["关注"]) {
                                    if (in_array($env['env_no'], array_keys($act_env["关注"]))) {
                                        $env['关注'] = true;
                                        $act_env["关注"][$env['env_no']] = array_merge($act_env["关注"][$env['env_no']], $env);
                                    }
                                }
                                $env['last_time'] = 0;
                                if (isset($act_env["浏览"]) && $act_env["浏览"]) {
                                    if (in_array($env['env_no'], array_keys($act_env["浏览"]))) {
                                        $env['last_time'] = $act_env["浏览"][$env['env_no']]['last_time'];
                                    }
                                }

                                $env['image'] = null;
                                if ($images && isset($images[$env['env_no']])) {
                                    if (isset($images[$env['env_no']]['home']) && $images[$env['env_no']]['home']) {
                                        $env['image'] = $images[$env['env_no']]['home'];
                                    }
                                }
                                $building[$env_no] = $env;
                            }
                        }
                    }
                    //楼层信息
                    foreach ($envs['rows'] as $env) {
                        if (isset($env['type']) && $env['type'] == "楼层") {
                            if (isset($env['env_no']) && $env['env_no']) {
                                if (isset($env['parent_env_no']) && $env['parent_env_no'] == $env_no) {
                                    if (isset($building[$env['parent_env_no']])) {
                                        $env['children'] = array();
                                        $floor[$env['env_no']] = $env;
                                    }
                                }
                            }
                        }
                    }
                    //小环境信息
                    foreach ($envs['rows'] as $env) {
                        if (isset($env['env_no']) && $env['env_no']) {
                            if (isset($env['parent_env_no']) && $env['parent_env_no']) {
                                if (isset($floor[$env['parent_env_no']])) {
                                    $env['image'] = null;
                                    if ($images && isset($images[$env['env_no']])) {
                                        if (isset($images[$env['env_no']]['home']) && $images[$env['env_no']]['home']) {
                                            $env['image'] = $images[$env['env_no']]['home'];
                                        }
                                    }

                                    $env['关注'] = false;
                                    if (isset($act_env["关注"]) && $act_env["关注"]) {
                                        if (in_array($env['env_no'], array_keys($act_env["关注"]))) {
                                            $env['关注'] = true;
                                            $act_env["关注"][$env['env_no']] = array_merge($act_env["关注"][$env['env_no']], $env);
                                        }
                                    }

                                    $env['last_time'] = 0;
                                    if (isset($act_env["浏览"]) && $act_env["浏览"]) {
                                        if (in_array($env['env_no'], array_keys($act_env["浏览"]))) {
                                            $env['last_time'] = $act_env["浏览"][$env['env_no']]['last_time'];
                                        }
                                    }
                                    $where = " temperature != 'NaN' and temperature is not null and humidity != 'NaN' and humidity is not null and env_no like '{$env['env_no']}%' and ".
                                        " equip_time between ".strtotime("yesterday")." and ".strtotime("today");
                                    $select = "min(temperature) as temperature_min,max(temperature) as temperature_max,min(humidity) as humidity_min,max(humidity) as humidity_max,count(*) as total ";
                                    $sql = "select {$select} from data_sensor where {$where}";
                                    $data_sensor = $this->db->query($sql)->row_array();
                                    $temp = array(
                                        'temperature'=>array(
                                            'min'=>'-',
                                            'max'=>'-'
                                        ),
                                        'humidity'=>array(
                                            'min'=>'-',
                                            'max'=>'-'
                                        ),
                                    );
                                    if($data_sensor){
                                        foreach($data_sensor as $p=>$val){
                                            if(isset($data_sensor['total'])&&$data_sensor['total']){
                                                foreach($data_sensor as $p=>$val){
                                                    if($p!="env_no" && $p != "total"){
                                                        $ps = explode("_",$p);
                                                        if(!isset($temp[$ps[0]])){
                                                            $temp[$ps[0]] = array();
                                                        }
                                                        $temp[$ps[0]][$ps[1]] = deal_data_decimal($ps[0],$val);
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    foreach($temp as $tp=>$tv){
                                        if(isset($this->param[$tp])){
                                            $tv = array_merge($tv,$this->param[$tp]);
                                        }
                                        $env[$tp] = $tv;
                                    }
                                    $floor[$env['parent_env_no']]['children'][] = $env;
                                    $env_nos[] = $env['env_no'];
                                }
                            }
                        }
                    }

                    $building_children = array();
                    if ($floor) {
                        foreach ($floor as $floor_no => $fl) {
                            $floor_children = array();
                            if (isset($fl['children']) && $fl['children']) {
                                foreach ($fl['children'] as $no => $flc) {
                                    $flc['image'] = null;
                                    if ($images && isset($images[$flc['env_no']])) {
                                        if (isset($images[$flc['env_no']]['home']) && $images[$flc['env_no']]['home']) {
                                            $flc['image'] = $images[$flc['env_no']]['home'];
                                        }
                                    }
                                    if ($this->_user['data_scope'] != "administrator") {
                                        if (!in_array($no, $this->_user['data_scope'])) {
                                            unset($floor[$floor_no]['children'][$no]);
                                            continue;
                                        }
                                    }
                                    $floor_children[] = $flc;
                                }
                                uasort($floor_children, function ($a, $b) {
                                    if (isset($a['last_time']) && isset($b['last_time'])) {
                                        if ($a['last_time'] == $b['last_time']) return 0;
                                        return ($a['last_time'] > $b['last_time']) ? -1 : 1;
                                    }
                                });//按访问时间排序
                            } else{
                                $where =" temperature != 'NaN' and temperature is not null and humidity != 'NaN' and humidity is not null and env_no like '".$floor_no."%' and ".
                                    " equip_time between ".strtotime("yesterday")." and ".strtotime("today");
                                $select = "min(temperature) as temperature_min,max(temperature) as temperature_max,min(humidity) as humidity_min,max(humidity) as humidity_max,count(*) as total ";

                                $sql = "select {$select} from data_sensor where {$where}";
                                $data_sensor = $this->db->query($sql)->row_array();
                                $temp = array(
                                    'temperature'=>array(
                                        'min'=>'-',
                                        'max'=>'-'
                                    ),
                                    'humidity'=>array(
                                        'min'=>'-',
                                        'max'=>'-'
                                    ),
                                );
                                if($data_sensor){
                                    foreach($data_sensor as $p=>$val){
                                        if(isset($data_sensor['total'])&&$data_sensor['total']){
                                            foreach($data_sensor as $p=>$val){
                                                if($p!="env_no" && $p != "total"){
                                                    $ps = explode("_",$p);
                                                    if(!isset($temp[$ps[0]])){
                                                        $temp[$ps[0]] = array();
                                                    }
                                                    $temp[$ps[0]][$ps[1]] = deal_data_decimal($ps[0],$val);
                                                }
                                            }
                                        }
                                    }
                                }
                                foreach($temp as $tp=>$tv){
                                    if(isset($this->param[$tp])){
                                        $tv = array_merge($tv,$this->param[$tp]);
                                    }
                                    $fl[$tp] = $tv;
                                }
                                $fl['image'] = null;
                                if ($images && isset($images[$fl['env_no']])) {
                                    if (isset($images[$fl['env_no']]['home']) && $images[$fl['env_no']]['home']) {
                                        $fl['image'] = $images[$fl['env_no']]['home'];
                                    }
                                }
                                $fl['last_time'] = 0;
                                if (isset($act_env["浏览"]) && $act_env["浏览"]) {
                                    if (in_array($fl['env_no'], array_keys($act_env["浏览"]))) {
                                        $fl['last_time'] = $act_env["浏览"][$fl['env_no']]['last_time'];
                                    }
                                }
                                $fl['关注'] = false;
                                if (in_array($fl['env_no'], array_keys($act_env["关注"]))) {
                                    $fl['关注'] = true;
                                    $act_env["关注"][$fl['env_no']] = array_merge($act_env["关注"][$fl['env_no']], $fl);
                                }
                                $floor_children[] = $fl;
                            }
                            $floor[$floor_no]['children'] = array_values($floor_children);
                            $building_children[] = $floor[$floor_no];
                        }
                    }

                    $building[$env_no]['children'] = $building_children;
                }
            }
        }
        $this->response($building);
    }
}