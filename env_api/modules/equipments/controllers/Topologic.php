<?php

/**
 * Created by PhpStorm.
 * User: Hebj
 * Date: 2016/12/8
 * Time: 10:16
 */
class Topologic extends  MY_Controller
{
    public function __construct()
    {
        parent::__construct();

        $this->order_time = "equip_time";
        $data_order = API('get/base/config/museum_config',array('keys'=>"data_order"));
        if($data_order){
            $this->order_time = $data_order['data_order'];
        }
    }

    //网络拓扑图，树形结构
    public function index_get(){
        $sensor_no = $this->get_post("sensor_no");

        $now = time();
        $s_time = $now - 18*60;
        $sensorList = array();
        $where = "1=1";
        if (isset($sensor_no) && $sensor_no) {
            $where .= " and (sensor_no = '{$sensor_no}' or gateway_no = '{$sensor_no}'or relay1_no = '{$sensor_no}'or relay2_no = '{$sensor_no}'or relay3_no = '{$sensor_no}')";
        }
        $where .= " and server_time between ".$s_time." and ".$now;
        $route = M("data_route")->fetAll($where,"*","server_time desc");
        $this->response($where);
        $equips = M("equip")->fetAll();
        $equip_name = array();
        if($equips){
            foreach ($equips as $k=>$equip) {
                if(isset($equip["equip_no"])&&$equip["equip_no"]){
                    $no = substr($equip["equip_no"],8);
                    $equip_name[$no] = $no;
                    if(isset($equip['name'])&&$equip['name']){
                        $equip_name[$no] = $equip['name'];
                    }
                }
            }
        }

        $nodes = array();//拓扑图节点
        $links = array();//提拓扑图连线

        //获取路由路径
        foreach ($route as $rt) {
            if (in_array($rt["sensor_no"], $sensorList)) {
                continue;
            } else {
                $r_equip = array();
                if (isset($rt["gateway_no"]) && $rt["gateway_no"] != "000000"&& $rt["gateway_no"] != null) {
                    $name = $rt["gateway_no"];
                    if(isset($equip_name[$rt["gateway_no"]])&&$equip_name[$rt["gateway_no"]]){
                        $name = $equip_name[$rt["gateway_no"]];
                    }
                    $r_equip[] = $name;
                    $node = array(
                        'id' => $name,
                        'status' => 1,
                        'type' => "网关",
                        'name' => $name
                    );
                    if(!in_array($node,$nodes)){
                        $nodes[] = $node;
                    }
                }
                if (isset($rt["relay1_no"]) && $rt["relay1_no"] != "000000"&& $rt["relay1_no"] != null) {
                    $name = $rt["relay1_no"];
                    if(isset($equip_name[$rt["relay1_no"]])&&$equip_name[$rt["relay1_no"]]){
                        $name = $equip_name[$rt["relay1_no"]];
                    }
                    $r_equip[] = $name;
                    $node = array(
                        'id' => $name,
                        'status' => 1,
                        'type' => "中继",
                        'name' => $name
                    );
                    if(!in_array($node,$nodes)){
                        $nodes[] = $node;
                    }
                }
                if (isset($rt["relay2_no"]) && $rt["relay2_no"] != "000000"&& $rt["relay2_no"] != null) {
                    $name = $rt["relay2_no"];
                    if(isset($equip_name[$rt["relay2_no"]])&&$equip_name[$rt["relay2_no"]]){
                        $name = $equip_name[$rt["relay2_no"]];
                    }
                    $r_equip[] = $name;
                    $node = array(
                        'id' => $name,
                        'status' => 1,
                        'type' => "中继",
                        'name' => $name
                    );
                    if(!in_array($node,$nodes)){
                        $nodes[] = $node;
                    }
                }
                if (isset($rt["relay3_no"]) && $rt["relay3_no"] != "000000"&& $rt["relay3_no"] != null) {
                    $name = $rt["relay3_no"];
                    if(isset($equip_name[$rt["relay3_no"]])&&$equip_name[$rt["relay3_no"]]){
                        $name = $equip_name[$rt["relay3_no"]];
                    }
                    $r_equip[] = $name;
                    $node = array(
                        'id' => $name,
                        'status' => 1,
                        'type' => "中继",
                        'name' => $name
                    );
                    if(!in_array($node,$nodes)){
                        $nodes[] = $node;
                    }
                }
                if (isset($rt["sensor_no"]) && ($rt["sensor_no"] != "000000"&&$rt["sensor_no"] != null )) {
                    $name = $rt["sensor_no"];
                    if(isset($equip_name[$rt["sensor_no"]])&&$equip_name[$rt["sensor_no"]]){
                        $name = $equip_name[$rt["sensor_no"]];
                    }
                    $r_equip[] = $name;
                    $sensorList[] = $name;
                    $node = array(
                        'id' => $name,
                        'status' => 1,
                        'type' => "监测终端",
                        'name' =>$name
                    );
                    if(!in_array($node,$nodes)){
                        $nodes[] = $node;
                    }
                }
                if($r_equip){
                    for($i=0;$i<sizeof($r_equip);$i++) {
                        if(isset($r_equip[$i+1])){
                            $link = array(
                                'source' => $r_equip[$i],
                                'target' => $r_equip[$i+1]
                            );
                            if (!in_array($link, $links)) {
                                $links[] = $link;
                            }
                        }
                    }
                }
            }
        }
        $data = array(
            "node"=>$nodes,
            "links"=>$links
        );
        $this->response($data);
    }


    public function topo_tree_get(){
        $sensor_no = $this->get_post("sensor_no");
        if(!M("common/permission")->check_permission("拓扑图",$this->_user)){
            $this->response(array('error' => '无权限查看网络拓扑图'));
        }
        $now = time();
        $s_time = $now - 18*60;
        $sensorList = array();
        $where = "1=1";
        if (isset($sensor_no) && $sensor_no) {
            $where .= " and (sensor_no = '{$sensor_no}' or gateway_no = '{$sensor_no}'or relay1_no = '{$sensor_no}'or relay2_no = '{$sensor_no}'or relay3_no = '{$sensor_no}')";
        }
        $where .= " and server_time between ".$s_time." and ".$now;
        $route = M("data_route")->fetAll($where,"*","server_time desc");
        $equips = M("equip")->fetAll();
        $equip_name = array();
        if($equips){
            foreach ($equips as $k=>$equip) {
                if(isset($equip["equip_no"])&&$equip["equip_no"]){
                    $no = substr($equip["equip_no"],8);
                    $equip_name[$no] = $no;
                    if(isset($equip['name'])&&$equip['name']){
                        $equip_name[$no] = $equip['name'];
                    }
                }
            }
        }

        $node = array();
        $r1_sensor = array();
        $r2_sensor = array();
        $g_sensor = array();

        foreach ($route as $k => $r) {
            if (isset($r['sensor_no']) && !in_array($r['sensor_no'], $sensorList)) {
                if (isset($r["gateway_no"]) && $r["gateway_no"] != "00000000000"&&$r["gateway_no"] != null) {
                    if (!isset($node[$r['gateway_no']])) {
                        $name = $r['gateway_no'];
                        if(isset($equip_name[$r['gateway_no']])){
                            $name = $equip_name[$r['gateway_no']];
                        }
                        $node[$r['gateway_no']] = array();
                        $node[$r['gateway_no']]['type'] = "gateway";
                        $node[$r['gateway_no']]['level'] = "0";
                        $node[$r['gateway_no']]['name'] = $name;
                        $node[$r['gateway_no']]['children'] = array();
                    }
                }

                //一级中继
                if (isset($r["relay1_no"]) && $r["relay1_no"] != "00000000000"&&$r["relay1_no"] != null) {
                    if (!isset($node[$r["gateway_no"] . $r['relay1_no']])) {
                        $name = $r['relay1_no'];
                        if(isset($equip_name[$r['relay1_no']])){
                            $name = $equip_name[$r['relay1_no']];
                        }
                        $node[$r["gateway_no"] . $r['relay1_no']] = array();
                        $node[$r["gateway_no"] . $r['relay1_no']]['type'] = "repeater";
                        $node[$r["gateway_no"] . $r['relay1_no']]['level'] = "1";
                        $node[$r["gateway_no"] . $r['relay1_no']]['parent'] = $r["gateway_no"];
                        $node[$r["gateway_no"] . $r['relay1_no']]['name'] = $name;
                        $node[$r["gateway_no"] . $r['relay1_no']]['children'] = array();
                    }
                }

                //二级中继
                if (isset($r["relay2_no"]) && $r["relay2_no"] != "00000000000"&&$r["relay2_no"] != null) {
                    $parentid = $node[$r["gateway_no"] . $r['relay1_no']]['parent'] . $r['relay1_no'];

                    if (!isset($node[$parentid . $r['relay2_no']])) {
                        $name = $r['relay2_no'];
                        if(isset($equip_name[$r['relay2_no']])){
                            $name = $equip_name[$r['relay2_no']];
                        }
                        $node[$parentid . $r['relay2_no']] = array();
                        $node[$parentid . $r['relay2_no']]['type'] = "repeater";
                        $node[$parentid . $r['relay2_no']]['level'] = "2";
                        $node[$parentid . $r['relay2_no']]['parent'] = $parentid;
                        $node[$parentid . $r['relay2_no']]['name'] = $name;
                        $node[$parentid . $r['relay2_no']]['children'] = array();
                    }

                }

                //三级中继
                if (isset($r['relay3_no']) && $r["relay3_no"] != "00000000000"&&$r["relay3_no"] != null) {
                    $parentid = $node[$r["gateway_no"] . $r['relay1_no'] . $r['relay2_no']]['parent'] . $r['relay2_no'];

                    if (!isset($node[$parentid . $r['relay3_no']])) {
                        $name = $r['relay3_no'];
                        if(isset($equip_name[$r['relay3_no']])){
                            $name = $equip_name[$r['relay3_no']];
                        }
                        $node[$parentid . $r['relay3_no']] = array();
                        $node[$parentid . $r['relay3_no']]['type'] = "repeater";
                        $node[$parentid . $r['relay3_no']]['level'] = "3";
                        $node[$parentid . $r['relay3_no']]['parent'] = $parentid;
                        $node[$parentid . $r['relay3_no']]['name'] = $name;
                        $node[$parentid . $r['relay3_no']]['children'] = array();
                    }
                }

                if ($r["gateway_no"] != "00000000000"&&$r["gateway_no"] != null) {
                    if ($r["relay1_no"] != "00000000000"&&$r["relay1_no"] != null) {
                        if (!in_array(array('name' => $r["relay1_no"]), $node[$r['gateway_no']]['children'])) {
                            $node[$r['gateway_no']]['children'][] = array('name' => $r["relay1_no"]);
                        }
                    } else if ($r['sensor_no'] != "00000000000"&&$r["sensor_no"] != null) {
                        if (!isset($node[$r['gateway_no']]['children']['终端'])) {
                            $node[$r['gateway_no']]['children']['终端'] = array('name' => '终端', 'type' => 'sensor', 'children' => array());
                        }
                        if (!in_array(array('name' => $r["sensor_no"]), $node[$r['gateway_no']]['children']['终端']['children'])) {
                            $node[$r['gateway_no']]['children']['终端']['children'][] = array('name' => $r["sensor_no"], 'type' => 'sensor');
                        }
                        $sensorList[] = $r['sensor_no'];
                    }
                }

                if ($r["relay1_no"] != "00000000000"&&$r["relay1_no"] != null) {
                    if ($r["relay2_no"] != "00000000000"&&$r["relay2_no"] != null) {
                        if (!in_array(array('name' => $r["relay2_no"]), $node[$r["gateway_no"] . $r['relay1_no']]['children'])) {
                            $node[$r["gateway_no"] . $r['relay1_no']]['children'][] = array('name' => $r["relay2_no"]);
                        }
                    } else if ($r['sensor_no'] != "00000000000"&&$r["sensor_no"] != null) {
                        if (!isset($node[$r["gateway_no"] . $r['relay1_no']]['children']['终端'])) {
                            $node[$r["gateway_no"] . $r['relay1_no']]['children']['终端'] = array('name' => '终端', 'type' => 'sensor', 'children' => array());
                        }
                        if (!in_array(array('name' => $r["sensor_no"]), $node[$r["gateway_no"] . $r['relay1_no']]['children']['终端']['children'])) {
                            $node[$r["gateway_no"] . $r['relay1_no']]['children']['终端']['children'][] = array('name' => $r["sensor_no"], 'type' => 'sensor');
                        }
                        $sensorList[] = $r['sensor_no'];
                    }
                }

                if ($r["relay2_no"] != "00000000000"&&$r["relay2_no"] != null) {
                    $pid = $node[$r["gateway_no"] . $r["relay1_no"] . $r['relay2_no']]['parent'];
                    if ($r["relay3_no"] != "00000000000"&&$r["relay1_no"] != null) {
                        if (!in_array(array('name' => $r["relay3_no"]), $node[$pid . $r['relay2_no']]['children'])) {
                            $node[$pid . $r['relay2_no']]['children'][] = array('name' => $r["relay3_no"]);
                        }
                    } else if ($r['sensor_no'] != "00000000000"&&$r["sensor_no"] != null) {
                        if (!isset($node[$pid . $r['relay2_no']]['children']['终端'])) {
                            $node[$pid . $r['relay2_no']]['children']['终端'] = array('name' => '终端', 'type' => 'sensor', 'children' => array());
                        }
                        if (!in_array(array('name' => $r["sensor_no"]), $node[$pid . $r['relay2_no']]['children']['终端']['children'])) {
                            $name = $r['sensor_no'];
                            if(isset($equip_name[$r['sensor_no']])){
                                $name = $equip_name[$r['sensor_no']];
                            }
                            $node[$pid . $r['relay2_no']]['children']['终端']['children'][] = array('name' =>$name, 'type' => 'sensor');
                        }
                        $sensorList[] = $r['sensor_no'];
                    }
                }

                if ($r["relay3_no"] != "00000000000"&&$r["relay3_no"] != null) {
                    $pid = $node[$r["gateway_no"] . $r["relay1_no"] . $r["relay2_no"] . $r['relay3_no']]['parent'];
                    if ($r['sensor_no'] != "00000000000"&&$r["sensor_no"] != null) {
                        if (!isset($node[$pid . $r['relay3_no']]['children']['终端'])) {
                            $node[$pid . $r['relay3_no']]['children']['终端'] = array('name' => '终端', 'type' => 'sensor', 'children' => array());
                        }
                        if (!in_array(array('name' => $r["sensor_no"]), $node[$pid . $r['relay3_no']]['children']['终端']['children'])) {
                            $node[$pid . $r['relay3_no']]['children']['终端']['children'][] = array('name' => $r["sensor_no"], 'type' => 'sensor');
                        }
                        $sensorList[] = $r['sensor_no'];
                    }
                }
            }
            //网关
        }

        foreach ($node as $id => $value) {
            if (isset($value['children'])) {
                foreach ($value['children'] as $m => $v_c) {
                    if ($m == '终端') {
                        unset($node[$id]['children'][$m]);
                        $node[$id]['children'][] = $v_c;
                    }
                }
                $node[$id]['children'] = array_values($node[$id]['children']);
            }
        }

        for ($i = 2; $i >= 0; $i--) {
            foreach ($node as $eid => $nd) {
                if (isset($nd['level'])&&$nd['level'] == $i && $nd['children']) {
                    foreach ($nd['children'] as $nd_k => $n) {
                        if (isset($node[$eid . $n['name']])) {
                            $node[$eid]['children'][$nd_k] = $node[$eid . $n['name']];
                            unset($node[$eid . $n['name']]);
                        }
                    }
                }
            }
        }

        $nodes = array('name' => '系统', 'children' => array());
        foreach ($node as $v) {
            $nodes['children'][] = $v;
        }
        $this->response($nodes);
    }
}