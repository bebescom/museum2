<?php

/**
 * Created by PhpStorm.
 * User: Hebj
 * Date: 2017/12/14
 * Time: 15:58
 */
class Alerts extends MY_Controller
{
    public function __construct()
    {
        parent::__construct();
        $this->load->library('excel');

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

    public function env_alerts_get()
    {
        $env_no = $this->get_post('env_no');
        $relic_no = $this->get_post('relic_no');
        $alert_time = $this->get_post('alert_time');

        $where = "1=1";
        if($env_no){
            $env_nos = explode(',',$env_no);
            $where .= " and env_no in ('".implode("','",$env_nos)."')";
        }
        if($relic_no){
            $where .= " and relic_no = '{$relic_no}'";
        }

        //位置信息
        $envs = API("get/base/envs");
        //文物信息
        $relics = API('get/relic/relics',array('select'=>'relic_no,name'));
        $relic_info = array();
        if(isset($relics['rows'])&&$relics['rows']){
            foreach ($relics['rows'] as $row) {
               if(isset($row['relic_no'])&&$row['relic_no']){
                   if(isset($row['name'])&&$row['name']){
                       $relic_info[$row['relic_no']] = $row['name'];
                   }
               }
            }
        }

        if($alert_time){
            $deal_time = $this->deal_time($alert_time);
            $stime = $deal_time['s_time'];
            $etime = $deal_time['e_time'];
            $where .= " and alert_time between {$stime} and {$etime}";
        }
        $select = "clear_time as status,id,env_no,alert_param,relic_no,alert_time,clear_time,content";
        $alerts = M("alert")->fetAll($where,$select,'alert_time desc');
        $export_data = array();
        if($alerts){
            foreach ($alerts as $alert) {
                if(isset($alert['status'])&&$alert['status']){
                    $alert['status'] = "已处理";
                }else{
                    $alert['status'] = "未处理";
                }

                if(isset($alert['env_no'])&&$alert['env_no']){
                    if(!isset($navs[$alert['env_no']])){
                        $nav = M('common/common')->navigation($envs['rows'],$alert['env_no']);
                        $navs[$alert['env_no']] = implode(' 》 ', array_column($nav, "name"));;
                    }
                    $alert['env_no'] = $navs[$alert['env_no']];
                }

                if(isset($alert['alert_param'])&&$alert['alert_param']){
                    $param = $alert['alert_param'];
                    if(isset($this->param[$param])){
                        $alert['alert_param'] = $this->param[$param]['name']."未达标";
                        if(isset($alert['content'])&&$alert['content']){
                            $alert['content'] = $this->param[$param]['name'].$alert['content'].$this->param[$param]['unit'];
                        }
                    }else if(in_array($param,array('boxopenalert','box_open_alert'))){
                        $alert['alert_param'] = '非法开盖';
                    }else if(in_array($param,array('movealert','move_alert'))){
                        $alert['alert_param'] = '异常震动';
                    }
                }
                if(isset($alert['relic_no'])&&$alert['relic_no']){
                    if(isset($relic_info[$alert['relic_no']])){
                        $alert['relic_no'] = $relic_info[$alert['relic_no']];
                    }
                }
                if(isset($alert['alert_time'])&&$alert['alert_time']){
                    $alert['alert_time'] = date("Y-m-d H:i",$alert['alert_time']);
                }
                if(isset($alert['clear_time'])&&$alert['clear_time']){
                    $alert['clear_time'] = date("Y-m-d H:i",$alert['clear_time']);
                }
                $export_data[] = $alert;
            }
        }
        $fields = array(
            'status'=>'处理情况',
            'id'=>'事件ID',
            'env_no'=>'报警位置',
            'alert_param'=>'报警类型',
            'relic_no'=>'关联藏品',
            'alert_time'=>'报警时间',
            'clear_time'=>'清除报警时间',
            'content'=>'情况说明'
        );
        $title = "环境预警表-".date("Y-m-d-H-i");
        $column_size['C'] = '100';
        $url = $this->excel->download2007($title, $fields, $export_data, "", $column_size);
        $download = API('get/base/download/', array("url" => $url, "from" => "env"));
        $this->response($download);

    }

    public function equip_alerts_get()
    {
//        $env_no = $this->get_post('env_no');
        $equip_no = $this->get_post('equip_no');
        $alert_time = $this->get_post('alert_time');

        //位置信息
        $envs = API("get/base/envs");
        //设备类型（array('code'=>'type')）
        $equip_types = equip_type('code');

        $where = "1=1";
        if($alert_time){
            $deal_time = $this->deal_time($alert_time);
            $stime = $deal_time['s_time'];
            $etime = $deal_time['e_time'];
            $where .= " and alert_time between {$stime} and {$etime}";
        }
        if($equip_no){
            $equip_nos = explode(",",$equip_no);
            $where .= " and equip_no in ('".implode("','",$equip_nos)."')";
        }
        $select = "id,name,equip_no,equip_type,type,env_no,alert_time,clear_time,alert_remark";
        $equip_alerts = M('equip_alert')->fetAll($where,$select,'alert_time desc');
        $export_data = array();
        $navs = array();
        if($equip_alerts){
            foreach ($equip_alerts as $equip_alert) {
                if(isset($equip_alert['env_no'])&&$equip_alert['env_no']){
                    if(!isset($navs[$equip_alert['env_no']])){
                        $nav = M('common/common')->navigation($envs['rows'],$equip_alert['env_no']);
                        $navs[$equip_alert['env_no']] = implode(' 》 ', array_column($nav, "name"));;
                    }
                    $equip_alert['env_no'] = $navs[$equip_alert['env_no']];
                }
                if(isset($equip_alert['alert_time'])&&$equip_alert['alert_time']){
                    $equip_alert['alert_time'] = date("Y-m-d H:i",$equip_alert['alert_time']);
                }
                if(isset($equip_alert['clear_time'])&&$equip_alert['clear_time']){
                    $equip_alert['clear_time'] = date("Y-m-d H:i",$equip_alert['clear_time']);
                }

                if(!isset($equip_alert['equip_type'])||!$equip_alert['equip_type']){
                    $e_type = substr($equip_alert['equip_no'],-11,3);
                    if(array_search($e_type,$equip_types)){
                        $equip_alert['equip_type'] = array_search($e_type,$equip_types);
                    }
                }
                if(isset($equip_alert['equip_no'])&&$equip_alert['equip_no']){
                    $equip_alert['equip_no'] .= "\t";
                }
                $export_data[] = $equip_alert;
            }
        }

        $fields = array(
            'id'=>'事件ID',
            'name'=>'设备名称',
            'equip_no'=>'设备ID',
            'equip_type'=>'设备类型',
            'type'=>'报警类型',
            'env_no'=>'设备位置',
            'alert_time'=>'报警时间',
            'clear_time'=>'清除报警时间',
            'alert_remark'=>'情况说明'
        );
        $title = "设备报警表-".date("Y-m-d-H-i");
        $column_size['F'] = '80';
        $column_size['I'] = '80';
        $url = $this->excel->download2007($title, $fields, $export_data, "", $column_size);
        $download = API('get/base/download/', array("url" => $url, "from" => "env"));
        $this->response($download);
    }
}