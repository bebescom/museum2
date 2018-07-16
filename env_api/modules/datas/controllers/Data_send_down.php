<?php

class Data_send_down extends MY_Controller
{
    public function __construct()
    {
        parent::__construct();
        $this->load->Library("excel");

        $this->order_time = "server_time";
        $data_order = API('get/base/config/museum_config', array('keys' => "data_order"));
        if ($data_order) {
            $this->order_time = $data_order['data_order'];
        }

        $sensor_param = M("equipments/equip")->get_parameters('sensor');
        $this->param = array();
        if ($sensor_param) {
            foreach ($sensor_param as $sp) {
                if (isset($sp['param']) && $sp['param']) {
                    $this->param[$sp['param']] = array("name" => $sp['name'], "unit" => $sp['unit']);
                }
            }
        }

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
    }

    /**
    *保存需要下发的指令，等待数据下发
     */
    function save_post()
    {
        if(!M("common/permission")->check_permission("批量设置",$this->_user)){
            $this->response(array('error' => '无权限批量下发参数'));
        }
        $downs = $this->get_post("equips");
        $send_type = $this->get_post("send_type");
        if(!isset($send_type)){
        	$send_type=1;
        }

        $successed = 0;
        $failed = 0;
        if($downs){
            foreach($downs as $down){
                if(isset($down['equip_no'])&&$down['equip_no']&&isset($down['instruct'])&&$down['instruct']){
                    $equip = M('equip')->fetOne("equip_no = '{$down['equip_no']}'");
                    $pre_send = M("equip_operation")->fetOne("equip_no = '".$down['equip_no']."' and instruct = '".$down['instruct']."'","*","operation_time desc");
                    $data = array(
                        "send_type"=>$send_type,
                        "send_status"=>1,
                        "uid"=>$this->_user['id'],
                        'env_no'=>isset($equip['env_no'])&&$equip['env_no']?$equip['env_no']:"",
                        'operator'=>$this->_user['real_name'],
                    );
                    $instruct = $down['instruct'];
                    $equip_no = $down['equip_no'];
                    $send_data = isset($down['send_data'])?$down['send_data']:"";
                    $remark = isset($down['remark'])?$down['remark']:"";
                    if(isset($instruct)&&$instruct){
                        $data['instruct'] = $instruct;
                        $data['operation'] = $this->instruct_name[$instruct]['name'];
                        $up_data = array();
                        switch($instruct){
                            case "31":
                                $up_data['target'] = isset($send_data['min'])?$send_data['min']:"";
                                break;
                            case "02":
                                $sleep = 600;
                                if(isset($send_data['unit'])&&$send_data['unit']){
                                    if($send_data['unit'] == "second"){
                                        $sleep =$send_data['sleep_period'];
                                    }else if($send_data['unit'] == "minute"){
                                        $sleep = $send_data['sleep_period']*60;
                                    }else if($send_data['unit'] == "hour"){
                                        $sleep = $send_data['sleep_period']*3600;
                                    }
                                }
                                $up_data['sleep'] = $sleep;
                                break;
                            case "22":
                                if(isset($send_data['instruct'])&&$send_data['instruct'] == "设置除湿时间"){
                                    if(isset($send_data['set_unit'])&&$send_data['set_unit']){
                                        if($send_data['set_unit'] == "second"){
                                            $sleep =$send_data['set_value'];
                                        }else if($send_data['set_unit'] == "minute"){
                                            $sleep = $send_data['set_value']*60;
                                        }else if($send_data['set_unit'] == "hour"){
                                            $sleep = $send_data['set_value']*3600;
                                        }
                                    }
                                }
                                if(isset($sleep)&&$sleep){
                                    $up_data['sleep'] = $sleep;
                                }

                                break;
                        }
                        if($up_data){
                            M('equip')->update($up_data,"equip_no = '".$equip_no."'");
                        }
                    }
                    if(isset($equip_no)&&$equip_no){
                        $data['equip_no'] = $equip_no;
                    }
                    if(isset($send_data)&&$send_data){
                        $data['send_data'] = json_encode($send_data);
                        $remark .= "; ".$data['send_data'];
                    }
                    if(isset($remark)&&$remark){
                        $data['remark'] = $remark;
                    }
                    if(isset($down['send_cycle'])&&$down['send_cycle']){
                        $data['send_cycle'] = $down['send_cycle'];
                    }
                    $data['operation_time'] = time();

                    $ret = M("equip_operation")->add($data);
                    if(isset($pre_send['send_status'])&&($pre_send['send_status'] == 1||$pre_send['send_status'] == 2)){
                        if($ret){
                            M("equip_operation")->update(array('send_status'=>5),"id = ".$pre_send['id']);
                        }
                    }

                    if($ret){
                        $successed++;
                    }else{
                        $failed++;
                    }
                }
            }
        }else{
            $this->response(array('error' => '无下发指令，请填写'));
        }
        $result = array("result"=>true,"msg"=>"总共保存".sizeof($downs)."条指令：成功".$successed."条，失败".$failed."条。");

        if($send_type==2){
        	$config = app_config();
        	@file_get_contents($config['monitor_port'].'/sendDown');
        }

        $this->response($result);
    }

    /***
     *指令下发后，记录状态变更
     */
    function send_post_nologin(){
        $id = $this->get_post('id');
        $send_time = $this->get_post("send_time");
        $status = $this->get_post("status");
        $raw_data = $this->get_post("raw_data");

        $up_data = array();
        if(isset($send_time)&&$send_time){
            $up_data['send_time'] = $send_time;
        }

        $up_data['send_status'] = 2;
        if(isset($status)&&$status){
            $up_data['send_status'] = $status;
        }

        if(isset($raw_data)&&$raw_data){
            $up_data['raw_data'] = $raw_data;
        }

        $result = array("result"=>false,"msg"=>"下发失败");
        $ret = M("equip_operation")->update($up_data,"id = ".$id);
        if($ret){
            $result = array("result"=>true,"msg"=>"下发成功");
        }

        $this->response($result);
    }

    /***
    *接收设备反馈数据
     */
    function feedback_post_nologin(){
        $instruct = $this->get_post('instruct');
        $equip_no = $this->get_post("equip_no");
        $sensor_no = $this->get_post("sensor_no");
        $feedback_data = $this->get_post("feedback_data");
        $feedback_time = $this->get_post("feedback_time");
        $status = $this->get_post("status");
        $raw_data = $this->get_post("raw_data");

        if(!$equip_no&&isset($sensor_no)&&$sensor_no){
            $equip_no = $sensor_no;
        }

        $feedback = array();
        if(isset($feedback_time)&&$feedback_time){
            $feedback['feedback_time'] = $feedback_time;
        }else{
            $feedback['feedback_time'] = time();
        }
        $feedback['send_status'] = 2;
        if(isset($status)&&$status){
            $feedback['send_status'] = $status;
        }
        if(isset($feedback_data)&&$feedback_data){
            $feedback['feedback_data'] = json_encode($feedback_data);
        }
        if(isset($raw_data)&&$raw_data){
            $feedback['raw_data'] = $raw_data;
        }

        $result = array("result"=>false,"msg"=>"反馈失败");
        if($equip_no){
            $ret = M("equip_operation")->update($feedback,"instruct = '".$instruct."' and equip_no like '%".$equip_no."' order by id desc limit 1");
            if($ret){
                $result = array("result"=>true,"msg"=>"反馈成功");
            }
        }

        $this->response($result);
    }

    /**
    * 设备参数下发列表
     * @param $equip_no设备编号
     */
    function send_down_list($equip_no=null)
    {
        $time = $this->get_post("time");
        $instruct = $this->get_post("instruct");
        $status = $this->get_post("status");
        $index = $this->get_post("index");
        $limit = $this->get_post("limit");
        $page = $this->get_post("page");

        $where = "1=1";
        if(isset($equip_no)&&$equip_no){
            $where .= " and equip_no in ('".implode("','",explode(",",$equip_no))."')";
        }
        if(isset($instruct)&&$instruct){
            $where .= " and instruct = '".$instruct."'";
        }
        if(isset($status)&&$status){
            $where .= " and send_status = ".$status;
        }

        $time_unit = array(
            'second'=>'秒',
            'minute'=>'分钟',
            'hour'=>'小时'
        );

        if(!$page){
            $page = 1;
        }
        if(!$limit){
            $limit = 10;
        }
        $offset = ($page - 1)*$limit;
        $send_downs = M("equip_operation")->fetAll($where,"*","operation_time desc",$offset,$limit);
        $total = M("equip_operation")->count($where);

        $data = array(
            "index"=>$index,
            "total"=>$total,
            "rows"=>array()
        );
        if($send_downs){
            foreach ($send_downs as $k=>$send_down) {
                if(isset($send_down['instruct'])&&$send_down['instruct']){
                    if(isset($this->instruct_name[$send_down['instruct']])&&$this->instruct_name[$send_down['instruct']]){
                        $send_downs[$k]['instruct'] = isset($this->instruct_name[$send_down['instruct']]['name'])?$this->instruct_name[$send_down['instruct']]['name']:'';
                    }
                }
                if(isset($send_down['operation_time'])&&$send_down['operation_time']){
                    $send_downs[$k]['operation_time'] = date("Y-m-d H:i",$send_down['operation_time']);
                }
                if(isset($send_down['send_time'])&&$send_down['send_time']){
                    $send_downs[$k]['send_time'] = date("Y-m-d H:i",$send_down['send_time']);
                }
                if(isset($send_down['feedback_time'])&&$send_down['feedback_time']){
                    $send_downs[$k]['feedback_time'] = date("Y-m-d H:i",$send_down['feedback_time']);
                }

                if(isset($send_down['send_data'])&&$send_down['send_data']){
                    $send_data = json_decode($send_down['send_data'],true);
                    $sd = "";
                    if($send_data){
                        foreach($send_data as $key=>$val){
                            switch($key){
                                case "control":
                                    $sd .= "调控参数：".$this->param[$val]['name'];
                                    break;
                                case "min":
                                    $sd .= ", 目标值:".$val;
                                    break;
                                case "max":
                                    break;
                                case "sleep_period":
                                    $sd .= $val;
                                    break;
                                case "unit":
                                    $sd .= $val;
                                    break;
                                case "control_inner":
                                    $sd .= "调控参数：".$this->param[$val]['name'];
                                    break;
                                case "c_order":
                                    $sd .= ", 序号：".$val;
                                    break;
                                case "c_value":
                                    $sd .= ", 目标值：".$val;
                                    break;
                                case "correction":
                                    $sd .= "校正参数：".$this->param[$val]['name'];
                                    break;
                                case "crt_value":
                                    $sd .= ", 校正值:".$val;
                                    break;
                                case "f_rate":
                                    $sd .= "频率:".$val;
                                    break;
                                case "b_rate":
                                    $sd .= ", 波特率:".$val;
                                    break;
                                case "parameter":
                                    $sd .= "设定参数:".$this->param[$val]['name'];
                                    break;
                                case "func":
                                    $sd .= ", 功能:".$val;
                                    break;
                                case "set_value":
                                   if($val){
                                       $sd .= ", 设定值:".$val;
                                   }
                                    break;
                                default:
                                    $sd .= $val;
                                    break;
                            }
                        }
                    }
                    $send_downs[$k]['send_data'] = $sd;
                }
            }
        }

        $data['rows'] = $send_downs;
        $this->response($data);
    }

    function instruct_get()
    {
        $instruct_name = $this->instruct_name;

        $this->response($instruct_name);
    }
}