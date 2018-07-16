<?php

/**
 * Created by PhpStorm.
 * User: Hebj
 * Date: 2016/11/21
 * Time: 13:53
 */
class Monitor_overview extends MY_Controller
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
        $time = $this->get_post('time');
        $s_env_no = $this->get_post('env_no');
        $index = $this->get_post("index");
        $s_env_nos =array();
        if(isset($s_env_no)&&$s_env_no){
            $s_env_nos = explode(",",$s_env_no);
        }
        $params = array("humidity","temperature");
        if(isset($param)&&$param){
            $params = explode(",",$param);
        }

        $time_int = M("monitor")->time_change($time);
        $s_time = date("Y-m-d",$time_int['s_time']);
        $e_time = date("Y-m-d",$time_int['e_time']);

        //获取所有环境
        $tree = array();
        if(isset($this->_user['data_scope'])&&$this->_user['data_scope']){
            $envs = API('get/base/envs/',array("sort_by"=>"sort desc,id asc"));
            $env_nos = array();
            $env_parents = array();
            $env_type = array();
            $env_link = array();
            //取得环境类型，便于数据统计
            if(isset($envs['rows'])&&$envs['rows']){
                $env = array();
                foreach ($envs['rows'] as $er){
                    if(isset($er['env_no'])&&$er['env_no']){
                        $env_nos[] = $er['env_no'];
                        $env[$er['env_no']] = $er;
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
                                    $ds['min'] = deal_data_decimal($param,$ds['min']);
                                    $pdata[$no][$param]['min'][] = $ds['min'];
                                }
                                if(isset($ds['max'])&&$ds['max']){
                                    $ds['max'] = deal_data_decimal($param,$ds['max']);
                                    $pdata[$no][$param]['max'][] = $ds['max'];
                                }
                                if(isset($ds['sum'])&&$ds['sum']){
                                    $ds['sum'] = deal_data_decimal($param,$ds['sum']);
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
                    $pd = array();
                    $thr = array();
                    if(isset($pdata[$env_no])){
                        $pd = $pdata[$env_no];
                        foreach($pd as $p=>$d){
                            if(!isset($temp[$p])){
                                $temp[$p] = array(
                                    'standard_reach'=>'-',
                                    'min'=>'-',
                                    'max'=>'-',
                                    'threshold'=>'-',
                                    'average'=>'-',
                                    'cv'=>'-'
                                );
                            }
                            if(isset($d['min'])&&$d['min']){
                                $temp[$p]['min'] = deal_data_decimal($p,min($d['min']));
                            }
                            if(isset($d['max'])&&$d['max']){
                                $temp[$p]['max'] = deal_data_decimal($p,max($d['max']));
                            }
                            if(isset($d['sum'])&&isset($d['count'])){
                                $temp[$p]['average'] =deal_data_decimal($p,array_sum($d['sum'])/array_sum($d['count']));
                            }
                            if(isset($d['count'])&&isset($d['count_well'])){
                                $temp[$p]['standard_reach'] = round(array_sum($d['count_well'])/array_sum($d['count'])*100,2);
                            }
                            if(isset($threshold[$env_no])){
                               if(isset($threshold[$env_no][$p.'_min'])&&isset($threshold[$env_no][$p.'_max'])){
                                   $temp[$p]['threshold'] = deal_data_decimal($p,$threshold[$env_no][$p.'_min']).'~'.deal_data_decimal($p,$threshold[$env_no][$p.'_max']);
                               }
                            }
                        }
                    }
                    if(empty($temp)){
                        foreach ($params as $param) {
                            $temp[$param] = array(
                                'standard_reach'=>'-',
                                'min'=>'-',
                                'max'=>'-',
                                'threshold'=>'-',
                                'average'=>'-',
                                'cv'=>'-'
                            );
                        }
                    }
                    $data[$env_no] = $temp;
                }
                $tree = array();
                $list = array();
                if(isset($envs['rows'])&&$envs['rows']){
                    foreach($envs['rows'] as $k=>$ers){
                        if(isset($ers['env_no'])&&$ers['env_no']) {
                            if (isset($data[$ers['env_no']])) {
                                $ers['data'] = $data[$ers['env_no']];
                            }
                        }
                        if($this->_user['data_scope'] != "administrator"){
                            if(in_array($ers['env_no'],$this->_user['data_scope'],true)){
                                if($s_env_nos){
                                    if(in_array($ers['env_no'],$s_env_nos)){
                                        $list[$k] = $ers;
                                    }
                                }else{
                                    $list[$k] = $ers;
                                }
                            }
                        }else{
                            if($s_env_nos){
                                if(in_array($ers['env_no'],$s_env_nos)){
                                    $list[$k] = $ers;
                                }
                            }else{
                                $list[$k] = $ers;
                            }
                        }
                    }
                    $this->load->helper('common/tree', 'tree');
                    $tree = generate_tree($list, array(
                        'id' => 'env_no',
                        'fid' => 'parent_env_no',
                        'root' => "",
                    ),0);
                }
            }
        }

        $this->response($tree);
    }
}