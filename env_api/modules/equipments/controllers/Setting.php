<?php

/**
 * Created by PhpStorm.
 * User: Hebj
 * Date: 2017/12/19
 * Time: 13:48
 */
class Setting extends MY_Controller
{
    public function __construct()
    {
        parent::__construct();
        $this->instruct_name =array(
            "01"=>array(
                "key"=>"01",
                "name"=>"设置工作模式(0x01)"
            ),
            "02"=>array(
                "key"=>"02",
                "name"=>"设置休眠周期(0x02)"
            ),
            "03"=>array(
                "key"=>"03",
                "name"=>"同步系统时间(0x03)"
            ),
            "04"=>array(
                "key"=>"04",
                "name"=>"设置设备编号(0x04)"
            ),
            "10"=>array(
                "key"=>"10",
                "name"=>"设置:量程(0x10)"
            ),
            "11"=>array(
                "key"=>"11",
                "name"=>"设置:预警范围(0x11)"
            ),
            "12"=>array(
                "key"=>"12",
                "name"=>"设置频率波特率(0x12)"
            ),
            "20"=>array(
                "key"=>"20",
                "name"=>"标定(0x20)"
            ),
            "21"=>array(
                "key"=>"21",
                "name"=>"校正系数(0x21)"
            ),
            "22"=>array(
                "key"=>"22",
                "name"=>"设置功能参数(0x22)"
            ),
            "30"=>array(
                "key"=>"30",
                "name"=>"设置调控模式(0x30)"
            ),
            "31"=>array(
                "key"=>"31",
                "name"=>"设定调控目标值(0x31)"
            ),
            "32"=>array(
                "key"=>"32",
                "name"=>"设置调控内部参数(0x32)"
            ),
            "equip_status"=>array(
                "key"=>"equip_status",
                "name"=>"设定使用状态"
            ),
            "equip_name"=>array(
                "key"=>"equip_name",
                "name"=>"修改设备名称"
            ),
            "equip_env_no"=>array(
                "key"=>"equip_env_no",
                "name"=>"修改设备位置"
            ),
            "equip_model"=>array(
                "key"=>"equip_model",
                "name"=>"修改型号"
            ),
            "equip_manufacturer"=>array(
                "key"=>"equip_manufacturer",
                "name"=>"修改厂商"
            ),
            "equip_applicability"=>array(
                "key"=>"equip_applicability",
                "name"=>"修改适用条件"
            ),
            "equip_remark"=>array(
                "key"=>"equip_remark",
                "name"=>"修改备注"
            ),
            "equip_img"=>array(
                "key"=>"equip_img",
                "name"=>"添加图片"
            ),
            "box_open_auth"=>array(
                "key"=>"box_open_auth",
                "name"=>"开盖授权"
            ),
            "box_move_auth"=>array(
                "key"=>"box_move_auth",
                "name"=>"震动授权"
            ),
            "ctr_info"=>array(
                "key"=>"ctr_info",
                "name"=>"修改投放信息"
            ),
            "equip_effect"=>array(
                "key"=>"equip_effect",
                "name"=>"修改调控效果"
            ),
            "0a"=>array(
                "key"=>"0a",
                "name"=>"藏品信息图片下发(0x0a)"
            ),
            "box_model"=>array(
                "key"=>"box_model",
                "name"=>"切换囊匣模式"
            ),
            "other"=>array(
                "key"=>"other",
                "name"=>"自定义指令参数"
            ),
            "replace"=>array(
                "key"=>"replace",
                "name"=>"设备替换"
            )
        );

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

    public function index()
    {
        $settings = $this->get_post('settings');
        $equips = array();
        $excute_status = array(
            'success'=>0,
            'failure'=>0
        );
        $navs = array();
        $envs = array();
        if($settings){
            foreach($settings as $setting){
                $ret = false;
                if(!isset($setting['equip_no'])){
                    $this->response(array('error'=>"设备编号不能为空!"));
                }
                if(!isset($setting['instruct'])){
                    $this->response(array('error'=>"设置操作不能为空!"));
                }
                $instruct = $setting['instruct'];

                if(!isset($equips[$setting['equip_no']])){
                    $equip = M("equip")->fetOne("equip_no = '{$setting['equip_no']}'");
                    $equips[$setting['equip_no']] = $equip;
                }else{
                    $equip = $equips[$setting['equip_no']];
                }

                if(isset($instruct)){
                    switch($instruct){
                        /************* 修改设备基础信息 *****************/
                        case "equip_status";//设定使用状态
                            $remark = $equip['status']." -> ".$setting['status'];
                            if(isset($setting['clear_env'])){
                                if($setting['clear_env']) {
                                    $setting['env_no'] = '';
                                }
                                $remark .= "(清空位置)";
                                unset($setting['clear_env']);
                            }
                            $ret = $this->_edit_equip($setting,$remark,$equip['env_no']);
                            break;
                        case "equip_name";//修改设备名称
                            $remark = $equip['name']." -> ".$setting['name'];
                            $ret = $this->_edit_equip($setting,$remark,$equip['env_no']);
                            break;
                        case "equip_env_no";//修改设备位置
                            if(!$envs){
                                $envs = API("get/base/envs");
                            }
                            //原位置
                            if(isset($navs[$equip['env_no']])){
                                $pre_nav = $navs[$equip['env_no']];
                            }else{
                                $nav = M('common/common')->navigation($envs['rows'],$equip['env_no']);
                                $pre_nav = $nav;
                                $navs[$equip['env_no']] = $nav;
                            }
                            $pre_position = implode(">",array_column(array_slice($pre_nav,-2),"name"));
                            //新位置
                            if(isset($navs[$setting['env_no']])){
                                $new_nav = $navs[$setting['env_no']];
                            }else{
                                $nav = M('common/common')->navigation($envs['rows'],$setting['env_no']);
                                $new_nav = $nav;
                                $navs[$setting['env_no']] = $nav;
                            }
                            $new_position = implode(">",array_column(array_slice($new_nav,-2),"name"));

                            $remark = $pre_position." -> ".$new_position;
                            $ret = $this->_edit_equip($setting,$remark,$equip['env_no']);
                            break;
                        case "equip_remark";//修改备注
                            $remark = "";
                            if(isset($equip['remark'])&&$equip['remark']){
                               $remark .= $equip['remark']."->";
                            }
                            $remark .= $setting['remark'];
                            $ret = $this->_edit_equip($setting,$remark,$equip['env_no']);
                            break;
                        case "equip_img";//添加图片
                            $remark = "添加图片";
                            if(isset($setting['file'])&&is_array($setting['file'])&&!empty($setting['file'])){
                                $images = $setting['file'];
                                $image_datas = array();
                                foreach ($images as $image) {
                                    $temp = "('{$equip['equip_no']}','show','{$image}')";
                                    $image_datas[] = $temp;
                                }
                                $remark = implode("；",$images);
                                $insert_sql = "insert into image (`no`,`type`,`url`) values ".implode(',',$image_datas);
                                $ret = $this->db->query($insert_sql);
                                if($ret){
                                    $operation = array();
                                    $operation['equip_no'] = $equip['equip_no'];
                                    $operation['operation'] = $this->instruct_name[$instruct]['name'];
                                    $operation['remark']= $remark;
                                    $operation['env_no']= $equip['env_no'];
                                    $operation['operator']= $this->_user['real_name'];
                                    $operation['instruct']= $instruct;
                                    M('equipments/equip')->equip_operation($operation);
                                }
                            }
                            break;
                        case "equip_effect";//修改调控效果
                            $remark = "每立方所需:".$equip['effect']." -> ".$setting['effect'];
                            $ret = $this->_edit_equip($setting,$remark,$equip['env_no']);
                            break;
                        case "equip_model";//修改型号
                            $remark = $equip['model']." -> ".$setting['model'];
                            $ret = $this->_edit_equip($setting,$remark,$equip['env_no']);
                            break;
                        case "equip_manufacturer";//修改厂商
                            $remark = $equip['manufacturer']." -> ".$setting['manufacturer'];
                            $ret = $this->_edit_equip($setting,$remark,$equip['env_no']);
                            break;
                        case "equip_applicability"://修改适用条件
                            $remark = $equip['applicability']." -> ".$setting['applicability'];
                            $ret = $this->_edit_equip($setting,$remark,$equip['env_no']);
                            break;
                        case "replace"://设备替换
                            $ret = $this->_equip_replace($setting);
                            break;
                        /************* 参数下发 *****************/
                        case "01";//设置工作模式(0x01)
                            $remark = $setting['send_data']['model'];
                            $ret = $this->_send_down($setting,$remark,$equip['env_no']);
                            break;
                        case "02";//设置休眠周期(0x02)
                            if(isset($setting['send_data'])&&$setting['send_data']){
                                $send_data = $setting['send_data'];
                                $sleep = 600;
                                $unit_name = "";
                                if(isset($send_data['unit'])&&$send_data['unit']){
                                    switch($send_data['unit']){
                                        case "second":
                                            $sleep =$send_data['sleep_period'];
                                            $unit_name = "秒";
                                            break;
                                        case "minute":
                                            $sleep = $send_data['sleep_period']*60;
                                            $unit_name = "分钟";
                                            break;
                                        case "hour":
                                            $sleep = $send_data['sleep_period']*3600;
                                            $unit_name = "小时";
                                            break;
                                    }
                                }
                                $current_sleep = "";
                                if(isset($equip['sleep'])&&$equip['sleep']){
                                    $current_sleep = $equip['sleep']/60 .'分钟';
                                }
                                $remark = $current_sleep ." -> ".$send_data['sleep_period'].$unit_name;
                                $up_data['sleep'] = $sleep;
                                $ret = $this->_send_down($setting,$remark,$equip['env_no']);
                                if($ret){
                                    M('equip')->update(array('sleep'=>$sleep),"equip_no = '{$setting['equip_no']}'");
                                }
                            }
                            break;
                        case "03";//同步系统时间(0x03)
                            $remark = "同步系统时间";
                            $ret = $this->_send_down($setting,$remark,$equip['env_no']);
                            break;
                        case "04";//设置设备编号(0x04)
                            $remark = $equip['equip_no']."->".$setting['send_data']['equip_no'];
                            $ret = $this->_send_down($setting,$remark,$equip['env_no']);
                            break;
                        case "0a";//藏品信息图片下发(0x0a)
                            $remark = $this->instruct_name[$instruct]['name'];
                            $ret = $this->_send_down($setting,$remark,$equip['env_no']);
                            break;
                        case "10";//设置:量程(0x10)
                            $remark = "";
                            if(isset($setting['send_data'])&&$setting['send_data']) {
                                $send_data = $setting['send_data'];
                                if(isset($send_data['range_param'])&&$send_data['range_param']){
                                    $remark .= ",参数：".$this->param[$send_data['range_param']]['name'];
                                }
                                if(isset($send_data['range_value1'])){
                                    $remark .= ",值：".$send_data['range_value1'];
                                }
                                if(isset($send_data['range_value2'])){
                                    $remark .= "~".$send_data['range_value2'];
                                }
                                $ret = $this->_send_down($setting,$remark,$equip['env_no']);
                            }
                            break;
                        case "11";//设置:预警范围(0x11)
                            $remark = "";
                            if(isset($setting['send_data'])&&$setting['send_data']) {
                                $send_data = $setting['send_data'];
                                if(isset($send_data['alert_param'])&&$send_data['alert_param']){
                                    $remark .= ",参数：".$this->param[$send_data['alert_param']]['name'];
                                }
                                if(isset($send_data['alert_value1'])){
                                    $remark .= ",值:".$send_data['alert_value1'];
                                }
                                if(isset($send_data['alert_value2'])){
                                    $remark .= "~".$send_data['alert_value2'];
                                }
                                $ret = $this->_send_down($setting,$remark,$equip['env_no']);
                            }
                            break;
                        case "12";//设置频率波特率(0x12)
                            $remark = "";
                            if(isset($setting['send_data'])&&$setting['send_data']) {
                                $send_data = $setting['send_data'];
                                if(isset($send_data['f_rate'])){
                                    $remark .= ",频率：".$send_data['f_rate'];
                                }
                                if(isset($send_data['b_rate'])){
                                    $remark .= ",波特率:".$send_data['b_rate'];
                                }
                                $ret = $this->_send_down($setting,$remark,$equip['env_no']);
                            }
                            break;
                        case "20";//标定(0x20)
                            $remark = (isset($setting['send_type'])&&$setting['send_type']==3)?"(每周)":"";
                            if(isset($setting['send_data'])&&$setting['send_data']) {
                                $send_data = $setting['send_data'];
                                if(isset($send_data['correction'])&&$send_data['correction']){
                                    $remark .= ",标定参数：".$this->param[$send_data['correction']]['name'];
                                }
                                if(isset($send_data['crt_value'])&&$send_data['crt_value']){
                                    $remark .= ",标定值：".$send_data['crt_value'];
                                }
                                $ret = $this->_send_down($setting,$remark,$equip['env_no']);
                            }
                            break;
                        case "21";//校正系数(0x21)
                            $remark = "";
                            if(isset($setting['send_data'])&&$setting['send_data']) {
                                $send_data = $setting['send_data'];
                                if(isset($send_data['correction'])&&$send_data['correction']){
                                    $remark .= ",校正参数：".$this->param[$send_data['correction']]['name'];
                                }
                                if(isset($send_data['crt_value'])&&$send_data['crt_value']){
                                    $remark .= ",校正值：".$send_data['crt_value'];
                                }
                                $ret = $this->_send_down($setting,$remark,$equip['env_no']);
                            }
                            break;
                        case "22";//设置功能参数(0x22)
                            $remark = "";
                            if(isset($setting['send_data'])&&$setting['send_data']) {
                                $send_data = $setting['send_data'];
                                if(isset($send_data['parameter'])&&$send_data['parameter']){
                                    $remark .= "参数：".$this->param[$send_data['parameter']]['name'];
                                }
                                if(isset($send_data['func'])&&$send_data['func']){
                                    $remark .= ",".$send_data['func'];
                                }
                                if(isset($send_data['set_value'])&&$send_data['set_value']){
                                    $remark .= ",".$send_data['set_value '];
                                }
                                if(isset($send_data['set_unit'])&&$send_data['set_uni ']){
                                    $remark .= " ".$send_data['set_unit'];
                                }
                                $ret = $this->_send_down($setting,$remark,$equip['env_no']);
                            }
                            break;
                        case "30";//设置调控模式
                            $remark = $setting['send_data']['c_model'];
                            $ret = $this->_send_down($setting,$remark,$equip['env_no']);
                            break;
                        case "31";//设定调控目标值(0x31)
                            $remark = "";
                            if(isset($setting['send_data'])&&$setting['send_data']) {
                                $send_data = $setting['send_data'];
                                if(isset($send_data['control'])&&$send_data['control']){
                                    $remark .= "调控参数：".$this->param[$send_data['control']]['name'];
                                }
                                if(isset($send_data['min'])&&$send_data['min']){
                                    $remark .= ",目标值：".$send_data['min'];
                                }
                                $ret = $this->_send_down($setting,$remark,$equip['env_no']);
                                if($ret){
                                    M('equip')->update(array('target'=>$send_data['min']),"equip_no = '{$setting['equip_no']}'");
                                }
                            }
                            break;
                        case "32";//设置调控内部参数(0x32)
                            $remark = "";
                            if(isset($setting['send_data'])&&$setting['send_data']) {
                                $send_data = $setting['send_data'];
                                if(isset($send_data['control_inner'])&&$send_data['control_inner']){
                                    $remark .= ",调控参数：".$this->param[$send_data['control_inner']]['name'];
                                }
                                if(isset($send_data['c_order '])){
                                    $remark .= "调控序号：".$send_data['c_order '];
                                }
                                if(isset($send_data['c_value '])&&$send_data['c_value ']){
                                    $remark .= ",调控值值：".$send_data['c_value '];
                                }
                                $ret = $this->_send_down($setting,$remark,$equip['env_no']);
                            }
                            break;
                        case "other";//自定义
                            $remark = "";
                            if(isset($setting['send_data'])&&$setting['send_data']) {
                                $send_data = $setting['send_data'];
                                if(isset($send_data['other'])&&$send_data['other']){
                                    $remark .= $send_data['other'];
                                }
                            }
                            $ret = $this->_send_down($setting,$remark,$equip['env_no']);
                            break;
                        /************* 修改囊匣设置 *****************/
                        case "box_model";//切换囊匣模式
                            $box = $this->_box_info($setting['equip_no']);

                            if($box){
                                $current_model = "";
                                if($box['model']){
                                    $current_model = $box['model'];
                                }
                                $remark = $current_model."模式 -> ".$setting['model'];
                                $ret = $this->_box_model($setting,$remark);
                            }
                            break;
                        case "box_open_auth";//开盖授权
                            $box = $this->_box_info($setting['equip_no']);
                            if($box){
                                $start_date = date("Y-m-d H:i",$setting['start_time']);
                                $end_date = date("Y-m-d H:i",$setting['end_time']);
                                $remark = "授权 ".$start_date." 至 ".$end_date." 时段内开盖不报警";
                                $ret = $this->_box_auth($setting,$remark);
                            }
                            break;
                        case "box_move_auth";//震动授权
                            $box = $this->_box_info($setting['equip_no']);
                            if($box){
                                $start_date = date("Y-m-d H:i",$setting['start_time']);
                                $end_date = date("Y-m-d H:i",$setting['end_time']);
                                $remark = "授权 ".$start_date." 至 ".$end_date." 时段内震动不报警";
                                $ret = $this->_box_auth($setting,$remark);
                            }
                            break;
                        /************* 修改调控材料 *****************/
                        case "ctr_info";//修改投放信息
                            $start_date = date("Y-m-d",$setting['control_time']);
                            $end_date = date("Y-m-d",$setting['replace_time']);
                            $last_control = M('control_record')->fetOne("equip_no = '{$setting['equip_no']}'",'equip_no,quantity,unit,control_time,replace_time','control_time desc');
                            $pre_start_date = date("Y-m-d",$last_control['control_time']);
                            $pre_end_date = date("Y-m-d",$last_control['replace_time']);
                            $current_quantity = "";
                            if(isset($last_control['quantity'])&&$last_control['quantity']){
                                $current_quantity = $last_control['quantity'];
                            }
                            if($equip['env_no']){
                                $setting['env_no'] = $equip['env_no'];
                            }
                            $env_info = API("get/base/envs/info/".$equip['env_no']);
                            $pre_status = "";
                            $now_status = "";
                            if(isset($env_info['volume'])&&$env_info['volume']){
                                if(isset($equip['effect'])&&$equip['effect']){
                                    $need_q = $equip['effect'] * $env_info['volume'];
                                    $pre_status = $current_quantity>=$need_q?"【足量】":"【不足量】";
                                    $now_status = $setting['quantity']>$need_q?"【足量】":"【不足量】";
                                }
                            }
                            $remark = "{$pre_status}{$current_quantity}Kg,{$pre_start_date}放入,{$pre_end_date}更换 -> {$now_status}{$setting['quantity']}Kg,{$start_date}放入,{$end_date}更换";
                            $ret = $this->_control($setting,$remark,$equip['env_no']);
                            break;
                        default:
                            break;
                    }
                }
                if($ret){
                    $excute_status['success']++;
                }else{
                    $excute_status['failure']++;
                }
            }
        }
        $return = array(
            'msg'=>"成功：{$excute_status['success']},失败：{$excute_status['failure']}"
        );

        $this->response($return);
    }

    /**
     * 编辑设备信息
     * @param array $data  设置数据
     * @param $remark      操作备注
     * @param $env_no      设备位置
     * @return mixed
     */
    protected  function _edit_equip($data = array(),$remark,$env_no)
    {
        $opt = $data['instruct'];
        if(isset($data['status'])&&$data['status'] == "启用"){
            $data['status'] = "正常";
        }
        unset($data['instruct']);
        unset($data['operation']);
        $ret = M("equip")->update($data,"equip_no= '{$data['equip_no']}'");
        if($ret){
            $operation = array();
            $operation['equip_no'] = $data['equip_no'];
            $operation['operation'] = $this->instruct_name[$opt]['name'];
            $operation['remark']= $remark;
            $operation['env_no']= $env_no;
            $operation['operator']= $this->_user['real_name'];
            $operation['instruct']= $opt;
            M('equipments/equip')->equip_operation($operation);
        }
        return $ret;
    }

    /**
     * 下发设备指令
     * @param $data        设置数据
     * @param $remark      操作备注
     * @param $env_no      设备位置
     * @return bool|mixed
     */
    protected function _send_down($data,$remark,$env_no)
    {
        $instruct = $data['instruct'];
        $pre_send = M("equip_operation")->fetOne("equip_no = '".$data['equip_no']."' and instruct = '".$instruct."'","*","operation_time desc");
        $basic = array(
            "send_status"=>1,
            "uid"=>$this->_user['id'],
            'send_count'=>0,
            'operation_time'=>time(),
            'operator'=> $this->_user['real_name'],
            'operation'=>$this->instruct_name[$instruct]['name'],
            'remark'=>$remark,
            'env_no'=>$env_no,
        );
        $data = array_merge($data,$basic);
        if(isset($data['send_data'])&&$data['send_data']){
            $data['send_data'] = json_encode($data['send_data']);
        }
        $ret = M("equip_operation")->add($data);

        if($pre_send && (isset($pre_send['send_status'])&&($pre_send['send_status'] == 1||$pre_send['send_status'] == 2))){
            $ret = M("equip_operation")->update(array("send_status"=>5),"id = ".$pre_send['id']);
        }
        return $ret;
    }

    /**
     * 囊匣切换模式
     * @param $data      操作数据
     * @param $remark    备注
     * @return mixed
     */
    public function _box_model($data,$remark)
    {
        $opt = $data['instruct'];
        unset($data['instruct']);
        $ret = M("box")->update($data,"env_no = '{$data['equip_no']}'");
        if($ret){
            $operation = array();
            $operation['equip_no'] = $data['equip_no'];
            $operation['operation'] = $this->instruct_name[$opt]['name'];
            $operation['remark']= $remark;
            $operation['env_no']= $data['equip_no'];
            $operation['operator']= $this->_user['real_name'];
            $operation['instruct']= $opt;
            M('equipments/equip')->equip_operation($operation);
        }
        return $ret;
    }

    /**
     * @param $data     操作数据
     * @param $remark    备注
     * @return bool
     */
    public function _box_auth($data,$remark)
    {
        $opt = $data['instruct'];
        unset($data['instruct']);
        $data['box_no'] = $data['equip_no'];
        unset($data['equip_no']);
        $data['auth_time'] = time();
        $data['user_id'] = $this->_user['id'];
        $ret = M("box_auth")->add($data);
        if($ret){
            $operation = array();
            $operation['equip_no'] = $data['box_no'];
            $operation['operation'] = $this->instruct_name[$opt]['name'];
            $operation['remark']= $remark;
            $operation['env_no']= $data['box_no'];
            $operation['operator']= $this->_user['real_name'];
            $operation['instruct']= $opt;
            M('equipments/equip')->equip_operation($operation);
        }
        return $ret;
    }

    /**
     * @param $data        操作数据
     * @param $remark      备注
     * @param $env_no      设备位置
     * @return bool
     */
    protected function _control($data,$remark,$env_no)
    {
        $opt = $data['instruct'];
        unset($data['instruct']);
        unset($data['operation']);
        unset($data['remark']);
        $ret = M('control_record')->add($data);
        if($ret){
            $operation = array();
            $operation['equip_no'] = $data['equip_no'];
            $operation['operation'] = $this->instruct_name[$opt]['name'];
            $operation['remark']= $remark;
            $operation['env_no']= $env_no;
            $operation['operator']= $this->_user['real_name'];
            $operation['instruct']= $opt;
            M('equipments/equip')->equip_operation($operation);
        }
        return $ret;
    }

    /**
     * @param $equip_no    囊匣编号
     * @return mixed
     */
    protected function _box_info($equip_no)
    {
        $box = M('box')->fetOne("env_no = '{$equip_no}'");
        return $box;
    }

    protected function _equip_replace($data = array()){
        $current_no = $data['equip_no'];
        $new_no = $data['new_no'];
        $opt = $data['instruct'];

        $current_equip = M('equip')->fetOne("equip_no = '{$current_no}'");
        $new_equip = M('equip')->fetOne("equip_no = '{$new_no}'");

        $current_update = array();
        $current_update['status'] = "停用";

        $new_update = array();
        $new_update['status'] = "正常";
        $new_update['remark'] = $current_equip['remark'];
        $new_update['env_no'] = $current_equip['env_no'];
        $new_update['sleep'] = $current_equip['sleep'];
        $new_update['locate'] = $current_equip['locate'];

        if($current_update){
            $cu_ret = M('equip')->update($current_update,"equip_no = '{$current_no}'");
            if($cu_ret){
                $cu_operation = array(
                    'operator'=>$this->_user['real_name'],
                    'equip_no'=>$current_no,
                    'instruct'=>$opt,
                    'operation'=>$this->instruct_name[$opt]['name'],
                    "remark"=>"新设备：".$new_no,
                    'env_no'=>isset($current_equip['env_no'])?$current_equip['env_no']:null
                );
                if($cu_operation){
                    $cu_opt = M("equipments/equip")->equip_operation($cu_operation);
                }
            }
        }
        if($new_update){
            $new_ret = M('equip')->update($new_update,"equip_no = '{$new_no}'");
            if($new_ret){
                $new_operation = array(
                    'operator'=>$this->_user['real_name'],
                    'equip_no'=>$new_no,
                    'operation'=>$this->instruct_name[$opt]['name'],
                    'instruct'=>$opt,
                    "remark"=>"旧设备：".$current_no,
                    'env_no'=>isset($new_equip['env_no'])?$new_equip['env_no']:null
                );
                if($new_operation){
                    $new_opt = M("equipments/equip")->equip_operation($new_operation);
                }

                if(!in_array($new_equip['equip_type'],array("网关","中继"))){
                    $remark = "{$new_equip['sleep']}s -> {$new_update['sleep']}s";
                    $send_data = array();
                    if($current_equip['sleep']){
                        if($current_equip['sleep'] <= 100){
                            $send_data = array(
                                'sleep_period'=>$current_equip['sleep'],
                                'unit'=>'second',
                            );
                        }else if($current_equip['sleep']/60 <= 100){
                            $send_data = array(
                                'sleep_period'=>floor($current_equip['sleep']/60),
                                'unit'=>'minute',
                            );
                        }else{
                            $send_data = array(
                                'sleep_period'=>floor($current_equip['sleep']/3600),
                                'unit'=>'hour',
                            );
                        }
                    }
                    $send_data = array(
                        'instruct'=>"02",
                        'send_data'=>$send_data,
                        'send_type'=>1,
                        'equip_no'=>$new_equip['equip_no']
                    );
                    $this->_send_down($send_data,$remark,$new_update['env_no']);
                }
            }
        }
        $result = false;
        if(isset($cu_ret)&&$cu_ret&&isset($new_ret)&&$new_ret){
            $result = true;
        }

        return $result;
    }
}