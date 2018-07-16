<?php

/**
 * Created by PhpStorm.
 * User: Hebj
 * Date: 2017/6/1
 * Time: 15:59
 */
class Edits extends MY_Controller
{
    function __construct()
    {
        parent::__construct();
        $this->order_time = "server_time";

        $museum_no = API('get/base/config/museum_no');
        if($museum_no&&isset($museum_no['val'])&&$museum_no['val']){
            $this->museum_no = $museum_no['val'];
        }
    }

    public function edit_multi_post()
    {
        $datas = $this->get_post('data');

        $envs = API("get/base/envs");
        $success = 0;
        $failed = 0;
        $navs = array();
        if($datas){
            foreach($datas as $data){
                $up_data = array();
                if(!isset($data['equip_no'])){
                    $this->response(array('error'=>"设备编号不能为空"));
                }
                $equip = M('equip')->fetOne('equip_no = "'.$data['equip_no'].'"');
                if(isset($data['env_no'])&&$data['env_no']){
                    $up_data['env_no'] = $data['env_no'];
                }
                $opt = null;
                $remark = "";
                if(isset($data['status'])&&$data['status']){
                    $up_data['status'] = $data['status'];
                    switch($data['status']){
                        case "备用":
                            $opt = "设备备用";
                            $remark = "备用前位置：";
                            break;
                        case "启用":
                            $opt = "设备启用";
                            $remark = "启用位置：";
                            $up_data['status'] = "正常";
                            break;
                        case "停用":
                            $opt = "设备停用";
                            $remark = "停用前位置：";
                            break;
                        case "异常":
                            $opt = "设备异常";
                            $remark = "异常前位置：";
                            break;
                        default:
                            break;
                    }
                }

                if(isset($data['clear_env'])&&$data['clear_env']){
                    $up_data['env_no'] = null;
                }

                $ret = M("equip")->update($up_data,"equip_no = '".$data['equip_no']."'");
                $ret?$success++:$failed++;
                if($opt) {
                    if($opt == "设备启用"){
                        if (isset($data['env_no']) && $data['env_no']) {
                            if(!isset($navs[$data['env_no']])){
                                $nav = M('common/common')->navigation($envs['rows'],$data['env_no']);
                                $position = array();
                                if (isset($nav['rows']) && $nav['rows']) {
                                    foreach ($nav['rows'] as $nv) {
                                        if (isset($nv['name']) && $nv['name']) {
                                            $position[] = $nv['name'];
                                        }
                                    }
                                }
                                if ($position) {
                                    $navs[$data['env_no']] = implode(" > ", $position);
                                }
                            }
                            $remark .= isset($navs[$data['env_no']])?$navs[$data['env_no']]:"";
                        }
                    }else{
                        if (isset($equip['env_no']) && $equip['env_no']) {
                            if(!isset($navs[$equip['env_no']])){
                                $nav = M('common/common')->navigation($envs['rows'],$equip['env_no']);
                                $position = array();
                                if (isset($nav['rows']) && $nav['rows']) {
                                    foreach ($nav['rows'] as $nv) {
                                        if (isset($nv['name']) && $nv['name']) {
                                            $position[] = $nv['name'];
                                        }
                                    }
                                }
                                if ($position) {
                                    $navs[$equip['env_no']] = implode(" > ", $position);
                                }
                            }
                            $remark .= isset($navs[$equip['env_no']])?$navs[$equip['env_no']]:"";
                        }
                    }
                    $operation = array(
                        'operator'=>$this->_user['real_name'],
                        'equip_no'=>$data['equip_no'],
                        'operation'=>$opt,
                        'operation_time'=>time(),
                        "remark"=>$remark,
                        "uid"=>$this->_user['id'],
                        'env_no'=>isset($equip['env_no'])?$equip['env_no']:null
                    );
                    if($operation){
                        $opt_ret = M("equipments/equip")->equip_operation($operation);
                    }
                }
            }
        }
        $this->response(array('msg'=>"总共修改".sizeof($datas)."个设备：成功".$success."个，失败".$failed."个。"));
    }

}