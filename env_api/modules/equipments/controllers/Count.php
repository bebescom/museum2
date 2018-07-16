<?php

/**
 * Created by PhpStorm.
 * User: Hebj
 * Date: 2017/8/9
 * Time: 9:37
 */
class Count extends MY_Controller
{
    public function __construct()
    {
        parent::__construct();
    }

    public function type_count_get()
    {
        $status = $this->get_post("status");
        $env_no = $this->get_post("env_no");
        $equip_no = $this->get_post("equip_no");
        $equip_type = $this->get_post("equip_type");

        $envs = API("get/base/envs");
        $where = "1=1";
        if(isset($this->_user['data_scope'])&&($this->_user['data_scope'] == "administrator" || !empty($this->_user['data_scope']))) {

            if (isset($env_no) && $env_no) {
                $env_nos = explode(',', $env_no);
                if ($this->_user['data_scope'] != 'administrator') {
                    $env_nos = array_intersect($env_nos, $this->_user['data_scope']);
                }
            } else {
                $env_nos = $this->_user['data_scope'];
            }
            if ($env_nos != "administrator") {
                if (!isset($env_no) || !$env_no) {
                    $where .= " and (env_no in ('" . implode("','", $env_nos) . "') or env_no is null or env_no = '')";
                } else {
                    $where .= " and env_no in ('" . implode("','", $env_nos) . "')";
                }
            }

            if (isset($name) && $name) {
                $where .= " and name like '%" . $name . "%'";
            }
            if (isset($equip_no) && $equip_no) {
                $where .= " and equip_no = '" . $equip_no . "'";
            }

            if (isset($equip_type) && $equip_type) {
                $where .= " and equip_type in ('" . implode("','", explode(",", $equip_type)) . "')";
            }


            if (isset($status) && $status) {
                $where .= " and status in ('" . implode("','", explode(",", $status)) . "')";
            }
        }
        $count_sql = "select equip_type,count(*) as type_count from equip where {$where} group by equip_type ";
        $count_ret = $this->db->query($count_sql)->result_array();
        $data = array();
        $equip_types = equip_type('type');
        $sensor = array('温湿度监测终端','带屏温湿度监测终端','有机挥发物监测终端','光照紫外监测终端','二氧化碳监测终端','空气质量监测终端',
            '土壤温湿度监测终端','安防监测终端','震动监测终端','甲醛监测终端','二氧化硫监测终端','分体式多参数监测终端');
        if(isset($equip_types['监测终端'])){
            $sensor = $equip_types['监测终端'];
        }
        $controller = array('调湿机','调湿柜','调湿剂');
        if(isset($equip_types['调控设备'])){
            $controller = $equip_types['调控设备'];
        }
        $offline = array('手持式温湿度检测仪','手持式光照紫外检测仪','手持式有机挥发物检测仪','手持式二氧化碳检测仪','手持式甲醛检测仪');
        if(isset($equip_types['移动手持设备'])){
            $offline = $equip_types['移动手持设备'];
        }
        $intelligent = array('智能囊匣');
        if(isset($equip_types['智能囊匣'])){
            $intelligent = $equip_types['智能囊匣'];
        }
        $network = array('网关','中继');
        if(isset($equip_types['网络设备'])){
            $network = $equip_types['网络设备'];
        }
        $weather = array('气象站');
        if(isset($equip_types['气象站'])){
            $weather = $equip_types['气象站'];
        }
        if($count_ret){
            $sort = 0;
            foreach ($count_ret as $count) {
                if(isset($count['equip_type'])&&$count['equip_type']){
                    $type = '';
                    if(in_array($count['equip_type'],$sensor)){
                        $type = '监测终端';
                        $sort = array_search($count['equip_type'],$sensor);
                    }else if(in_array($count['equip_type'],$controller)){
                        $type = '调控设备';
                        $sort = array_search($count['equip_type'],$controller);
                    }else if(in_array($count['equip_type'],$offline)){
                        $type = '移动手持设备';
                        $sort = array_search($count['equip_type'],$offline);
                    }else if(in_array($count['equip_type'],$network)){
                        $type = '网络设备';
                        $sort = array_search($count['equip_type'],$network);
                    }else {
                        $type = '其它';
                        $sort++;
                    }
                    if(!isset($data[$type])){
                        $data[$type] = array();
                    }
                    $data[$type][$sort] = array(
                        'name'=>$count['equip_type'],
                        'count'=>(int)$count['type_count'],
                        'sort'=>$sort
                    );
                }
            }
        }

        if($data){
            foreach ($data as $ty=>$ds) {
                 ksort($data[$ty]);
            }
        }
        $this->response($data);
    }

    public function status_count_get()
    {
        $status = $this->get_post("status");
        $env_no = $this->get_post("env_no");
        $equip_no = $this->get_post("equip_no");
        $equip_type = $this->get_post("equip_type");

        $envs = API("get/base/envs");
        $where = "1=1";
        if(isset($this->_user['data_scope'])&&($this->_user['data_scope'] == "administrator" || !empty($this->_user['data_scope']))) {

            if (isset($env_no) && $env_no) {
                $env_nos = explode(',', $env_no);
                if ($this->_user['data_scope'] != 'administrator') {
                    $env_nos = array_intersect($env_nos, $this->_user['data_scope']);
                }
            } else {
                $env_nos = $this->_user['data_scope'];
            }
            if ($env_nos != "administrator") {
                if (!isset($env_no) || !$env_no) {
                    $where .= " and (env_no in ('" . implode("','", $env_nos) . "') or env_no is null or env_no = '')";
                } else {
                    $where .= " and env_no in ('" . implode("','", $env_nos) . "')";
                }
            }

            if (isset($name) && $name) {
                $where .= " and name like '%" . $name . "%'";
            }
            if (isset($equip_no) && $equip_no) {
                $where .= " and equip_no = '" . $equip_no . "'";
            }

            if (isset($equip_type) && $equip_type) {
                $where .= " and equip_type in ('" . implode("','", explode(",", $equip_type)) . "')";
            }


            if (isset($status) && $status) {
                $where .= " and status in ('" . implode("','", explode(",", $status)) . "')";
            }
        }
        $count_sql = "select status,count(*) as status_count from equip where {$where} group by status";
        $count_ret = $this->db->query($count_sql)->result_array();
        $data = array();
        if($count_ret){
            foreach ($count_ret as $count) {
                if(isset($count['status'])&&$count['status']){
                    $data[] = array(
                        'name'=>$count['status'],
                        'count'=>(int)$count['status_count']
                    );
                }
            }
        }
        $this->response($data);
    }

}