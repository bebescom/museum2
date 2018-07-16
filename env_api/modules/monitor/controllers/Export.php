<?php

/**
 * Created by PhpStorm.
 * User: Hebj
 * Date: 2016/12/2
 * Time: 14:37
 */
class Export extends MY_Controller
{

    public function __construct(){
        parent::__construct();
        $this->load->Library("excel");

        $this->order_time = "equip_time";

        $sensor_param = M("equipments/equip")->get_parameters('sensor');
        $this->param = array();
        if($sensor_param){
            foreach($sensor_param as $sp){
                if(isset($sp['param'])&&$sp['param']){
                    $this->param[$sp['param']] = array("name"=>$sp['name'],"unit"=>$sp['unit']);
                }
            }
        }
    }

    public function index_get()
    {
        if(!M("common/permission")->check_permission("导出环境数据",$this->_user)){
            $this->response(array('error' => '无权限导出环境数据'));
        }
        $time = $this->get_post('time');
        $select_env_no = $this->get_post('env_no');
        $param = $this->get_post('param');
        $params = array("humidity","temperature");
        if(isset($param)&&$param){
            $params = explode(",",$param);
        }

        $select_env_nos = $select_env_no?explode(",",$select_env_no):array();

        $time_int = M("monitor")->time_change($time);
        $s_time = date("Y-m-d",$time_int['s_time']);
        $e_time = date("Y-m-d",$time_int['e_time']);

        $export_data = array();//导出数据
        if(isset($this->_user['data_scope'])&&$this->_user['data_scope']){
            //获取所有环境
            $envs = API('get/base/envs/',array("sort_by"=>"sort desc,id asc"));
            $env_nos = array();
            $env_parents = array();
            $env_type = array();
            $env_link = array();
            $env_names = array();
            //取得环境类型，便于数据统计
            if(isset($envs['rows'])&&$envs['rows']){
                $env = array();
                foreach ($envs['rows'] as $er){
                    if(isset($er['env_no'])&&$er['env_no']){
                        $env_nos[] = $er['env_no'];
                        $env[$er['env_no']] = $er;
                        $env_names[$er['env_no']] = $er['name'];
                        if(isset($er['type'])&&$er['type']){
                            $env_type[$er['env_no']] = $er['type'];
                        }
                    }
                }

                //上级环境及其类型
                foreach ($envs['rows'] as $env){
                    if(isset($env['env_no'])&&$env['env_no']){
                        if(isset($env['parent_env_no'])&&$env['parent_env_no']){
                            if(isset($env_type[$env["parent_env_no"]])&&$env_type[$env["parent_env_no"]]){
                                $env_parents[$env['env_no']] = array(
                                    "env_no"=>$env['parent_env_no'],
                                    "type"=>$env_type[$env["parent_env_no"]]
                                );
                            }
                        }
                    }
                }

                //父级环境统合
                if($env_parents){
                    foreach($env_parents as $epn=>$ep){
                        if(isset($ep['env_no'])&&$ep['env_no']){
                            $no = $ep['env_no'];
                            $type = $ep['type'];
                            $env_link[$epn][$type] = $no;
                            while(isset($env_parents[$no])){
                                $type = $env_parents[$no]['type'];
                                $no = $env_parents[$no]['env_no'];
                                $env_link[$epn][$type] = $no;
                            }
                        }
                    }
                }
            }
            $threshold = array();
            if($env_nos){
                $pdata = array();
                $alert = array();
                $thresholds = M("threshold")->fetAll("no in ('".implode("','",$env_nos)."')");
                if($thresholds){
                    foreach($thresholds as $thres){
                        if(isset($thres['no'])&&$thres['no']){
                            $threshold[$thres['no']] = $thres;
                        }
                    }
                }
                $where = "1=1";
                $where .= " and env_no in ('".implode("','",$env_nos)."')";
                $select = "env_no,alert_param," . $this->order_time;
                if ($params) {
                    $select .= "," . implode(",", $params);
                }

                //抓取数据
                $where .= " and date between '{$s_time}' and '{$e_time}' and parameter in ('".implode("','",$params)."')";
                $data_sensors = M("middle_index")->fetAll($where);
                if($data_sensors){
                    foreach($data_sensors as $ds){
                        if(isset($ds['env_no'])&&$ds['env_no']){
                            $no = $ds['env_no'];

                            if(!isset($pdata[$no])){
                                $pdata[$no] = array();
                            }
                            if(isset($ds['parameter'])&&$ds['parameter']){
                                $param = $ds['parameter'];
                                if(!isset($pdata[$no][$param])){
                                    $pdata[$no][$param] = array(
                                        "max"=>array(),
                                        "min"=>array(),
                                        "sum"=>array(),
                                        'count_well'=>array(),
                                        'count'=>array()
                                    );
                                }

                                if(isset($ds['min'])&&$ds['min']){
                                    $pdata[$no][$param]['min'][] = $ds['min'];
                                }
                                if(isset($ds['max'])&&$ds['max']){
                                    $pdata[$no][$param]['max'][] = $ds['max'];
                                }
                                if(isset($ds['sum'])&&$ds['sum']){
                                    $pdata[$no][$param]['sum'][] = $ds['sum'];
                                }
                                if(isset($ds['count_well'])&&$ds['count_well']){
                                    $pdata[$no][$param]['count_well'][] = $ds['count_well'];
                                }
                                if(isset($ds['count'])&&$ds['count']){
                                    $pdata[$no][$param]['count'][] = $ds['count'];
                                }
                                //父级环境
                                if (isset($env_link[$no])) {
                                    foreach ($env_link[$no] as $ty => $el_no) {
                                        if (!in_array($ty,array("展厅","库房","修复室","研究室"))) {
                                            if (!isset($pdata[$el_no])) {
                                                $pdata[$el_no] = array();
                                            }
                                            if(!isset($pdata[$el_no][$param])){
                                                $pdata[$el_no][$param] = array(
                                                    "max"=>array(),
                                                    "min"=>array(),
                                                    "sum"=>array(),
                                                    'count_well'=>array(),
                                                    'count'=>array()
                                                );
                                            }
                                            if(isset($ds['min'])&&$ds['min']){
                                                $pdata[$el_no][$param]['min'][] = $ds['min'];
                                            }
                                            if(isset($ds['max'])&&$ds['max']){
                                                $pdata[$el_no][$param]['max'][] = $ds['max'];
                                            }
                                            if(isset($ds['sum'])&&$ds['sum']){
                                                $pdata[$el_no][$param]['sum'][] = $ds['sum'];
                                            }
                                            if(isset($ds['count_well'])&&$ds['count_well']){
                                                $pdata[$el_no][$param]['count_well'][] = $ds['count_well'];
                                            }
                                            if(isset($ds['count'])&&$ds['count']){
                                                $pdata[$el_no][$param]['count'][] = $ds['count'];
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                foreach($env_nos as $env_no){
                    $data[$env_no] = array();
                    $temp = array();
                    $bf_name = "";
                    if (isset($env_type[$env_no])) {
                        if ($env_type[$env_no] == "楼层") {
                            $bf_name = "      ";
                        } else if ($env_type[$env_no] == "展厅" || $env_type[$env_no] == "库房" || $env_type[$env_no] == "研究室" || $env_type[$env_no] == "修复室") {
                            $bf_name = "               ";
                        } else if ($env_type[$env_no] == "展柜" || $env_type[$env_no] == "存储柜" || $env_type[$env_no] == "安防展柜") {
                            $bf_name = "                      ";
                        }
                    }
                    $pd = array();
                    $thr = array();
                    if(isset($pdata[$env_no])){
                        $pd = $pdata[$env_no];
                        foreach($pd as $p=>$d){
                            if(!isset($temp[$p])){
                                $temp[$p] = array(
                                    'standard_reach'=>'-',
                                    'extremum'=>'-',
                                    'threshold'=>'-',
                                    'average'=>'-',
//                                    'cv'=>'-'
                                );
                            }
                            if(isset($d['min'])&&isset($d['max'])){
                                $temp[$p]['extremum'] = min($d['min']).'~'.max($d['max']);
                            }
                            if(isset($d['sum'])&&isset($d['count'])){
                                $temp[$p]['average'] = round(array_sum($d['sum'])/array_sum($d['count']),2);
                            }
                            if(isset($d['count'])&&isset($d['count_well'])){
                                $temp[$p]['standard_reach'] = round(array_sum($d['count_well'])/array_sum($d['count'])*100,2);
                            }
                            if(isset($threshold[$env_no])){
                                if(isset($threshold[$env_no][$p.'_min'])&&isset($threshold[$env_no][$p.'_max'])){
                                    $temp[$p]['threshold'] = $threshold[$env_no][$p.'_min'].'~'.$threshold[$env_no][$p.'_max'];
                                }
                            }
                        }
                    }
                    if(empty($temp)){
                        foreach ($params as $param) {
                            $temp[$param] = array(
                                'standard_reach'=>'-',
                                'extremum'=>'-',
                                'threshold'=>'-',
                                'average'=>'-',
//                                'cv'=>'-'
                            );
                        }
                    }
                    if (isset($env_names[$env_no])) {
                        $temp['env_name'] = $bf_name . $env_names[$env_no];
                    }
                    $data[$env_no] = $temp;
                }
                $env_data = array();
                if ($env_type) {
                    //小微环境统合
                    foreach ($env_type as $e_no => $ty) {
                        if (in_array($ty, array("展柜", "存储柜", "安防展柜"))) {
                            if (isset($env_parents[$e_no]) && $env_parents[$e_no]) {
                                if (isset($env_parents[$e_no]['env_no'])) {
                                    if (!isset($env_data[$env_parents[$e_no]['env_no']])) {
                                        $temp_data = array();
                                        $env_data[$env_parents[$e_no]['env_no']] = array();
                                        if (isset($data[$env_parents[$e_no]['env_no']]) && $data[$env_parents[$e_no]['env_no']]) {
                                            $temp_data['env_name'] = "";
                                            if (isset($data[$e_no]['env_name'])) {
                                                $temp_data['env_name'] = $data[$env_parents[$e_no]['env_no']]['env_name'];
                                            }
                                            foreach ($data[$env_parents[$e_no]['env_no']] as $p => $items) {
                                                if ($p != "env_name") {
                                                    if ($items) {
                                                        foreach ($items as $k => $v) {
                                                            if(strpos($k,"fluctuate") == false ){
//                                                            if($v == "-"){
//                                                                $v = "";
//                                                            }
                                                                $temp_data[$p . "_" . $k] = $v;
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                        $env_data[$env_parents[$e_no]['env_no']][$env_parents[$e_no]['env_no']] = $temp_data;
                                    }
                                    if (isset($data[$e_no]) && $data[$e_no]) {
                                        $temp_data = array();
                                        $temp_data['env_name'] = "";
                                        if (isset($data[$e_no]['env_name'])) {
                                            $temp_data['env_name'] = $data[$e_no]['env_name'];
                                        }
                                        foreach ($data[$e_no] as $p => $items) {
                                            if ($p != "env_name") {
                                                if ($items) {
                                                    foreach ($items as $k => $v) {
                                                        if(strpos($k,"fluctuate") == false ){
//                                                        if($v == "-"){
//                                                            $v = "";
//                                                        }
                                                            $temp_data[$p . "_" . $k] = $v;
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    $env_data[$env_parents[$e_no]['env_no']][$e_no] = $temp_data;
                                }
                            }
                        }
                    }
                    //统合楼层
                    foreach ($env_type as $e_no => $ty) {
                        if (in_array($ty, array("展厅", "库房", "研究室", "修复室"))) {
                            if (!isset($env_data[$e_no])) {
                                $temp_data = array();
                                $temp_data['env_name'] = "";
                                if (isset($data[$e_no])) {
                                    $temp_data['env_name'] = $data[$e_no]['env_name'];
                                }
                                foreach ($data[$e_no] as $p => $items) {
                                    if ($p != "env_name") {
                                        if ($items) {
                                            foreach ($items as $k => $v) {
                                                if(strpos($k,"fluctuate") == false ){
//                                                if($v == "-"){
//                                                    $v = "";
//                                                }
                                                    $temp_data[$p . "_" . $k] = $v;
                                                }
                                            }
                                        }
                                    }
                                }
                                $env_data[$e_no][$e_no] = $temp_data;
                            }
                            if (isset($env_parents[$e_no]) && $env_parents[$e_no]) {
                                if (isset($env_parents[$e_no]['env_no'])) {
                                    if (!isset($env_data[$env_parents[$e_no]['env_no']])) {
                                        $env_data[$env_parents[$e_no]['env_no']] = array();
                                        if (isset($data[$env_parents[$e_no]['env_no']]) && $data[$env_parents[$e_no]['env_no']]) {
                                            $temp_data = array();
                                            $temp_data['env_name'] = "";
                                            if (isset($data[$env_parents[$e_no]['env_no']]['env_name'])) {
                                                $temp_data['env_name'] = $data[$env_parents[$e_no]['env_no']]['env_name'];
                                            }
                                            foreach ($data[$env_parents[$e_no]['env_no']] as $p => $items) {
                                                if ($p != "env_name") {
                                                    if ($items) {
                                                        foreach ($items as $k => $v) {
                                                            if(strpos($k,"fluctuate") === false ){
//                                                            if($v == "-"){
//                                                                $v = "";
//                                                            }
                                                                $temp_data[$p . "_" . $k] = $v;
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                        $env_data[$env_parents[$e_no]['env_no']][$env_parents[$e_no]['env_no']] = $temp_data;
                                    }

                                    $env_data[$env_parents[$e_no]['env_no']] = $env_data[$env_parents[$e_no]['env_no']]+ $env_data[$e_no];
                                    unset($env_data[$e_no]);
                                }
                            }
                        }
                    }
                    //统合楼栋
                    foreach ($env_type as $e_no => $ty) {
                        if (in_array($ty, array("楼层","室外环境"))) {
                            if (!isset($env_data[$e_no])) {
                                $temp_data = array();
                                $temp_data['env_name'] = "";
                                if (isset($data[$e_no])) {
                                    $temp_data['env_name'] = $data[$e_no]['env_name'];
                                }
                                foreach ($data[$e_no] as $p => $items) {
                                    if ($p != "env_name") {
                                        if ($items) {
                                            foreach ($items as $k => $v) {
                                                if(strpos($k,"fluctuate") === false ){
//                                                if($v == "-"){
//                                                    $v = "";
//                                                }
                                                    $temp_data[$p . "_" . $k] = $v;
                                                }
                                            }
                                        }
                                    }
                                }
                                $env_data[$e_no][$e_no] = $temp_data;
                            }
                            if (isset($env_parents[$e_no]) && $env_parents[$e_no]) {
                                if (isset($env_parents[$e_no]['env_no'])) {
                                    if (!isset($env_data[$env_parents[$e_no]['env_no']])) {
                                        $env_data[$env_parents[$e_no]['env_no']] = array();
                                        if (isset($data[$env_parents[$e_no]['env_no']]) && $data[$env_parents[$e_no]['env_no']]) {
                                            $temp_data = array();
                                            $temp_data['env_name'] = "";
                                            if (isset($data[$env_parents[$e_no]['env_no']])) {
                                                $temp_data['env_name'] = $data[$env_parents[$e_no]['env_no']]['env_name'];
                                            }
                                            foreach ($data[$env_parents[$e_no]['env_no']] as $p => $items) {
                                                if ($p != "env_name") {
                                                    if ($items) {
                                                        foreach ($items as $k => $v) {
                                                            if(strpos($k,"fluctuate") === false ){
//                                                            if($v == "-"){
//                                                                $v = "";
//                                                            }
                                                                $temp_data[$p . "_" . $k] = $v;
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                        $env_data[$env_parents[$e_no]['env_no']][$env_parents[$e_no]['env_no']] = $temp_data;
                                    }

                                    $env_data[$env_parents[$e_no]['env_no']] = $env_data[$env_parents[$e_no]['env_no']]+ $env_data[$e_no];
                                    unset($env_data[$e_no]);
                                }
                            }
                        }
                    }
                }
//                $this->response($env_data);
                if ($env_data) {
                    foreach ($env_data as $ed_no=>$ed) {
                        if($this->_user['data_scope'] != "administrator"){
                            $select_env_nos = $select_env_nos?array_intersect($select_env_nos,$this->_user['data_scope']):$this->_user['data_scope'];
                        }else{

                        }
                        if($select_env_nos){
                            foreach($ed as $no=>$value){
                                if(in_array($no,$select_env_nos)){
                                    $export_data[] = $value;
                                }
                            }
                        }else{
                            $export_data = array_merge($export_data, array_values($ed));
                        }
                    }
                }
            }
        }
        $fieldsxml = M("export/export")->getFields("monitor_overview");
        $fname = $fieldsxml['fename'];
        $fchnname = $fieldsxml['fchnname'];
        $fields = $fieldsxml['fields'];
        $column_size = array("A"=>80);
        try{
            $url = $this->excel->download2007($fchnname,$fields,$export_data,"",$column_size);
            $download = API('get/base/download/',array("url"=>$url,"from"=>"env"));
            $this->response($download);
        }catch(Exception $e){
            $this->response($e);
        }
    }
}

