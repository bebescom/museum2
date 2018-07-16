<?php
class Legends extends MY_Controller{

    public function __construct()
    {
        parent::__construct();
        $this->order_time = "server_time";
        $data_order = API('get/base/config/museum_config',array('keys'=>"data_order"));
        if($data_order){
            $this->order_time = $data_order['data_order'];
        }
    }

    function index_get_nologin(){
		$m=M("equipments/equip");

        $env = M('env');
        $this->response(array($m->get_parameters()));
	}

	/**
	 * 楼层，1 图例切换
	 * @floor_no 楼层/展厅编号
	 */
    function legend_classifies_get($floor_no)
    {
        $small_env = array();
        $micro_env = array();
        if($floor_no){
            $env_self = API('get/base/envs/info/'.$floor_no);
            if(isset($env_self['type'])&&$env_self['type'] == "楼层"){
                $small_env[] = $env_self['env_no'];
            }else{
                $envs = API('get/base/envs');
                if($envs['total']>0){
                    foreach($envs['rows'] as $env){
                        if(isset($env['env_no'])&&$env['env_no']){
                            if(in_array($env['type'],array("展厅","库房","修复室","研究室"))){
                                if(strpos($env['env_no'],(string)$floor_no) !== false){
                                    $small_env[] = $env['env_no'];
                                }
                            }else if(in_array($env['type'],array("展柜","存储柜","安防展柜"))){
                                if(strpos($env['env_no'],(string)$floor_no) !== false){
                                    $micro_env[] = $env['env_no'];
                                }
                            }
                        }
                    }
                }
            }
        }

        $sensor = array("th_sensor"=>'温湿度监测终端',"sth_sensor"=>'带屏温湿度监测终端',"voc_sensor"=>'有机挥发物监测终端',"co2_sensor"=>'二氧化碳监测终端',"cabinet_sensor"=>'智能展柜',
            "lu_sensor"=>'光照紫外监测终端',"qcm_sensor"=>'空气质量监测终端',"soil_sensor"=>"土壤温湿度监测终端","security_sensor"=>"安防监测终端","vibration_sensor"=>"震动监测终端");
        $network = array("repeater"=>'中继',"gateway"=>'网关');
        $controller = array("hum_machine"=>'调湿机',"hum_agent"=>'调湿剂',"nitrogen_controller"=>"充氮调湿柜","light_controller"=>"灯光调控终端");
        $offline = array("offline_th"=>"手持式温湿度检测仪","offline_casco"=>"手持式甲醛检测仪","offline_light"=>"手持式光照紫外检测仪",
            "offline_co2"=>"手持式二氧化碳检测仪","offline_voc"=>"手持式有机挥发物检测仪");

        if($small_env){
            $s_equips = $this->db->select('equip_type,count(*) as count')->where_not_in('status',array("停用"))->where_in('env_no',$small_env)->group_by('equip_type')->get('equip')->result_array();
        }
        if($micro_env){
            $m_equips = $this->db->select('equip_type,count(*) as count')->where_not_in('status',array("停用"))->where_in('env_no',$micro_env)->group_by('equip_type')->get('equip')->result_array();
        }

        $data = array(
            'small_env'=>array(),
            'micro_env'=>array(),
            'network'=>array(),
            'relic'=>array()
        );
        $data['network'] = array(
            'total'=>0
        );
        if(isset($s_equips)&&$s_equips){
            $temp = array(
                'sensor'=>array(
                    'total'=>0
                ),
                'controller'=>array(
                    'total'=>0
                ),
                'offline'=>array(
                    'total'=>0
                )
            );
            foreach($s_equips as $se){
                if(in_array($se['equip_type'],array_values($controller))){
                    $temp['controller']['total'] += $se['count'];
                    $temp['controller'][array_search($se['equip_type'],$controller)] = array(
                        "name"=>$se['equip_type'],
                        "count"=>$se['count']
                    );
                }else if(in_array($se['equip_type'],array_values($sensor))){
                    $temp['sensor']['total'] += $se['count'];
                    $temp['sensor'][array_search($se['equip_type'],$sensor)] = array(
                        "name"=>$se['equip_type'],
                        "count"=>$se['count']
                    );
                }else if(in_array($se['equip_type'],array_values($network))){
                    $data['network']['total'] += $se['count'];
                    if(!isset($data['network'][array_search($se['equip_type'],$network)])){
                        $data['network'][array_search($se['equip_type'],$network)] = array(
                            "name"=>$se['equip_type'],
                            "count"=>$se['count']
                        );
                    }else{
                        $data['network'][array_search($se['equip_type'],$network)]['count'] += $se['count'] ;
                    }
                }
                else if(in_array($se['equip_type'],array_values($offline))){
                    $temp['offline']['total'] += $se['count'];
                    $temp['offline'][array_search($se['equip_type'],$offline)] = array(
                        "name"=>$se['equip_type'],
                        "count"=>$se['count']
                    );
                }
            }
            $data['small_env'] = $temp;
        }

        if(isset($m_equips)&&$m_equips){
            $temp = array(
                'sensor'=>array(
                    'total'=>0
                ),
                'controller'=>array(
                    'total'=>0
                ),
                'offline'=>array(
                    'total'=>0
                )
            );
            foreach($m_equips as $me){
                if(in_array($me['equip_type'],array_values($controller))){
                    $temp['controller']['total'] += $me['count'];
                    $temp['controller'][array_search($me['equip_type'],$controller)] = array(
                        "name"=>$me['equip_type'],
                        "count"=>$me['count']
                    );
                }else if(in_array($me['equip_type'],array_values($sensor))){
                    $temp['sensor']['total'] += $me['count'];
                    $temp['sensor'][array_search($me['equip_type'],$sensor)] = array(
                        "name"=>$me['equip_type'],
                        "count"=>$me['count']
                    );
                }else if(in_array($me['equip_type'],array_values($network))){
                    $data['network']['total'] += $me['count'];
                    if(!isset($data['network'][array_search($me['equip_type'],$network)])){
                        $data['network'][array_search($me['equip_type'],$network)] = array(
                            "name"=>$me['equip_type'],
                            "count"=>$me['count']
                        );
                    }else{
                        $data['network'][array_search($me['equip_type'],$network)]['count'] += $me['count'] ;
                    }
                }
                else if(in_array($me['equip_type'],array_values($offline))){
                    $temp['offline']['total'] += $me['count'];
                    $temp['offline'][array_search($me['equip_type'],$offline)] = array(
                        "name"=>$me['equip_type'],
                        "count"=>$me['count']
                    );
                }
            }
            $data['micro_env'] = $temp;
        }

        $relics = API('get/relic/relics/count/relics_level_count/'.$floor_no);
        if($relics ){
            $temp_rlc = array(
                "一级文物"=>0,
                "二级文物"=>0,
                "三级文物"=>0,
                "其他文物"=>0
            );
            foreach($relics as $relic){
               if(isset($relic['level'])&&$relic['level']){
                   $level = $relic['level'];
                   if($level != "一级文物" && $level != "二级文物"&& $level != "三级文物"){
                       $level = "其他文物";
                   }
                   $temp_rlc[$level] += $relic['count'];
               }
            }

            $data['relic'] = $temp_rlc;
        }

        $this->response($data);
    }

	/**
	 * 楼层，1 图例详情
	 * @floor_no 楼层/展厅编号
	 * @legend     图例类型
	 */
    function legend_detail_get($env_no,$legend)
    {
        $sensor = array("th_sensor"=>'温湿度监测终端',"sth_sensor"=>'带屏温湿度监测终端',"voc_sensor"=>'有机挥发物监测终端',"co2_sensor"=>'二氧化碳监测终端',"cabinet_sensor"=>'智能展柜',
            "lu_sensor"=>'光照紫外监测终端',"qcm_sensor"=>'空气质量监测终端',"soil_sensor"=>"土壤温湿度监测终端","security_sensor"=>"安防监测终端","vibration_sensor"=>"震动监测终端");
        $network = array("repeater"=>'中继',"gateway"=>'网关');
        $controller = array("hum_machine"=>'调湿机',"hum_agent"=>'调湿剂',"nitrogen_controller"=>"充氮调湿柜","light_controller"=>"灯光调控终端");
        $offline = array("offline_th"=>"手持式温湿度检测仪","offline_casco"=>"手持式甲醛检测仪","offline_light"=>"手持式光照紫外检测仪",
            "offline_co2"=>"手持式二氧化碳检测仪","offline_voc"=>"手持式有机挥发物检测仪");

        $sensor_ctr = array_merge($sensor,$controller,$offline);
        $small_env = array();
        $micro_env = array();
        if($env_no){
            $env_self = API('get/base/envs/info/'.$env_no);
            if(isset($env_self['type'])&&$env_self['type'] == "楼层"){
                $small_env[] = $env_self['env_no'];
            }else{
                $envs = API('get/base/envs');
                if($envs['total']>0){
                    foreach($envs['rows'] as $env){
                        if(isset($env['env_no'])&&$env['env_no']){
                            if(in_array($env['type'],array("展厅","库房","修复室","研究室"))){
                                if(strpos($env['env_no'],(string)$env_no) !== false){
                                    $small_env[] = $env['env_no'];
                                }
                            }else if(in_array($env['type'],array("展柜","存储柜","安防展柜"))){
                                if(strpos($env['env_no'],(string)$env_no) !== false){
                                    $micro_env[] = $env['env_no'];
                                }
                            }
                        }
                    }
                }
            }
        }
        $equips = array();
        if($legend === "small_env"){
            if(isset($small_env) && $small_env){
                $equips = $this->db->select("equip_no,env_no,equip_type,locate,name,parameter,status")->where_not_in('status',array("停用"))->where_in("env_no",$small_env)->where_in('equip_type',array_values($sensor_ctr))
                    ->get('equip')->result_array();
            }
        }else if($legend === "micro_env"){
            if(isset($micro_env)&&$micro_env){
                $equips = $this->db->select("equip_no,env_no,equip_type,locate,name,parameter,status")->where_not_in('status',array("停用"))->where_in("env_no",$micro_env)->where_in('equip_type',array_values($sensor_ctr))
                    ->get('equip')->result_array();
            }
        }else if($legend === "network"){
           if(isset($small_env)&& $small_env){
               $equips = $this->db->select("equip_no,env_no,equip_type,locate,name,parameter,status")->where_not_in('status',array("停用"))->where_in("env_no",array_merge($small_env,$micro_env))->where_in('equip_type',array_values($network))
                   ->get('equip')->result_array();
           }
        }else {
            $select = "relic_no,parent_env_no,name,age,category,describe,level,locate";
            if($env_no){
                $relics = API('get/relic/relics',array('parent_env_no'=>$env_no,'select'=>$select));
            }
        }

        $data = array();
        $time = array();
        if(isset($equips)&& $equips){
            foreach($equips as $equip){
                $select = "rssi,voltage,alert_param,".$this->order_time;
                if(isset($equip['parameter'])&&$equip['parameter']){
                    $select .= ",".$equip['parameter'];
                }
                if($equip['equip_type'] == "震动传感器"){
                    $new_data = M('data_sensor_vibration_count')->fetOne("",'',"count_time desc");
                }else{
                    $new_data = M('data_sensor')->fetOne("equip_no = '".$equip['equip_no']."'",$select,$this->order_time." desc");
                }
                if(isset($new_data[$this->order_time])&&$new_data[$this->order_time]){
                    $new_data['time'] = date("Y-m-d H:i",$new_data[$this->order_time]);
                    unset($new_data[$this->order_time]);
                }

                if(isset($equip['status'])&&$equip['status']){
                    if($equip['status'] != "正常"&&$equip['status'] != "备用"){
                        $equip['status'] = "异常";
                    }else{
                        if(isset($new_data['alert_param'])&&$new_data['alert_param']){
                            $equip['status'] = "超标";
                        }
                    }
                }else{
                    $equip['status'] = "正常";
                }
                if(isset($new_data['alert_param'])){
                    unset($new_data['alert_param']);
                }
                $equip['new_data'] = array();
                if($new_data){
                    $equip['new_data'] = $new_data;
                }
                if(isset($equip['locate'])&&$equip['locate']){
                    $equip['locate'] = json_decode($equip['locate']);
                }
               if($legend ===  "small_env"||$legend === "micro_env"){
                   if(isset($equip['equip_type']) && $equip['equip_type']){
                       $equip_type = $equip['equip_type'];
                       $type = array_search($equip_type,$sensor_ctr);
                       if(isset($data[$type])){
                           $data[$type][] = $equip;
                       }else{
                           $data[$type] = array();
                           $data[$type][] = $equip;
                       }
                   }
               }else{
                   if(isset($equip['equip_type']) && $equip['equip_type']){
                       $equip_type = $equip['equip_type'];
                       $type = array_search($equip_type,$network);
                       if(isset($data[$type])){
                           $data[$type][] = $equip;
                       }else{
                           $data[$type] = array();
                           $data[$type][] = $equip;
                       }
                   }
               }
            }
        }
        if(isset($relics['total'])&&$relics['total']){
            foreach($relics['rows'] as $relic){
                if(isset($relic['relic_no'])&&$relic['relic_no']){
                    if(isset($relic['level'])&& $relic['level']){
                        $level = $relic['level'];
                        if($level === "一般文物"||$level === "未定级文物"){
                            $level = "其他文物";
                            $relic['level'] = $level;
                        }
                        if(isset($data[$level])){
                            $data[$level][] = $relic;
                        }else{
                            $data[$level] = array($relic);
                        }
                    }
                }
            }
        }

        $this->response($data);
    }
}
