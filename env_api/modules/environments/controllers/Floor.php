<?php
class Floor extends MY_Controller{

	function index_get_nologin(){
		$m=M("equipments/equip");

        $env = M('env');
        $this->response(array($m->get_parameters()));
	}

	/**
	 * 楼层选择，展厅信息
	 *获取楼层中以及其中各展厅的信
	 */
    function hall_infos_get($hall_no)
    {
        $data = array();
        if($hall_no){
            $env = API('get/base/envs/info/'.$hall_no);

            $data['name'] = $env['name'];
            $data['env_no'] = $env['env_no'];

            $equips = M('equip')->fetAll("env_no = '".$hall_no."'");

            $data_sensor = array();
	        $data_order = "equip_time";
	        $config = API("get/base/config/museum_config",array("keys"=>"data_order"));
	        if($config){
		        if(isset($config['data_order'])&&$config['data_order']){
			        $data_order = $config['data_order'];
		        }
	        }
            foreach($equips as $equip){
                if(isset($equip['env_no']) && $equip['env_no']){
                    if(isset($equip['equip_no'])&&$equip['equip_no']){
                        $ds = M('data_sensor')->find(array('equip_no'=>$equip['equip_no']),'humidity,temperature,equip_no,equip_time,server_time',$data_order.' DESC');
                        $data_sensor[] = $data;
                    }
                }
            }

            if($data_sensor){

            }
        }

        $this->response($data);
    }

	/**
	 * 楼层选择，设备概况
	 *获取楼层中以及其中各展厅的各类别的设备数量
	 */
    function floor_equips_get($floor_no)
    {
        $envs = API('get/base/envs',array('parent_env_no'=>$floor_no));
        $env_nos = array($floor_no);
        $zt = array();
        if(isset($envs['total'])&&$envs['total']>0){
            foreach($envs['rows'] as $env){
                if(isset($env['env_no'])&&$env['env_no']){
                    $env_nos[] = $env['env_no'];
                    $zt[$env['env_no']] = array(
                        'name'=>$env['name'],
                        'child'=>array($env['env_no'])
                    );
                    $cabinet = API('get/base/envs',array('parent_env_no'=>$env['env_no']));
                    if(isset($cabinet['total'])&&$cabinet['total']>0){
                        foreach($cabinet['rows'] as $c){
                            if(isset($c['env_no'])&&$c['env_no']){
                                $env_nos[] = $c['env_no'];
                                $zt[$env['env_no']]['child'][] = $c['env_no'];
                            }
                        }
                    }
                }
            }
        }
	    $zt[$floor_no] = array(
		    'name' => "本层(展厅外)",
		    "child"=>array($floor_no)
	    );
        $equip_types = equip_type('type');
        $sensor = array('温湿度监测终端','带屏温湿度监测终端','有机挥发物监测终端','光照紫外监测终端','二氧化碳监测终端','空气质量监测终端','土壤温湿度监测终端','安防监测终端','震动监测终端');
        if(isset($equip_types['监测终端'])){
            $sensor = $equip_types['监测终端'];
        }
        $controller = array('调湿机','调湿柜','调湿剂');
        if(isset($equip_types['调控设备'])){
            $controller = $equip_types['调控设备'];
        }
//        $offline = array('手持式温湿度检测仪','手持式光照紫外检测仪','手持式有机挥发物检测仪','手持式二氧化碳检测仪','手持式甲醛检测仪');
//        if(isset($equip_types['手持离线设备'])){
//            $offline = $equip_types['手持离线设备'];
//        }
//        $box = array('智能囊匣');
//        if(isset($equip_types['智能囊匣'])){
//            $box = $equip_types['智能囊匣'];
//        }
        $network = array('网关','中继');
        if(isset($equip_types['网络设备'])){
            $network = $equip_types['网络设备'];
        }
        $data = array();
        $data['total'] = array(
            '监测设备'=>0,
            '调控设备'=>0,
            '网络设备'=>0,
        );
        if($env_nos){
            $equips = $this->db->where_in('env_no',$env_nos)->get('equip')->result_array();
            foreach($zt as $no=>$v){
                $temp = array(
                    'env_no'=>$no,
                    'name'=>$v['name'],
                    '监测设备'=>0,
                    '调控设备'=>0,
                    '网络设备'=>0,
                );
                if($equips){
                    foreach($equips as $equip){
                        if(isset($equip['env_no']) && $equip['env_no']){
                            if(in_array($equip['env_no'],$v['child'])){
                                if(isset($equip['equip_type']) && $equip['equip_type']){
                                    if(in_array($equip['equip_type'],$sensor)){
                                        $temp['监测设备']++;
                                        $data['total']['监测设备']++;
                                    }else if(in_array($equip['equip_type'],$controller)){
                                        $temp['调控设备']++;
                                        $data['total']['调控设备']++;
                                    }else if(in_array($equip['equip_type'],$network)){
                                        $temp['网络设备']++;
                                        $data['total']['网络设备']++;
                                    }
                                    $data[$no] = $temp;
                                }
                            }
                        }
                    }
                }
            }
        }
        $this->response($data);
    }

	/**
	 * 楼层选择，环境概况
	 *获取楼层中各展厅的微环境达标率和温湿度极值
	 */
    function floor_halls_get($floor_no)
    {

	    $envs = API('get/base/envs',array('parent_env_no'=>$floor_no));
	    $env_nos = array();
	    $zt = array();
	    if(isset($envs['total'])&&$envs['total']>0){
		    foreach($envs['rows'] as $env){
			    if(isset($env['env_no'])&&$env['env_no']){
				    $env_nos[] = $env['env_no'];
				    if($env['type'] === "展厅"||$env['type'] === "展厅"){
					    $zt[$env['env_no']] = array(
						    'name'=>$env['name'],
						    'child'=>array(),
						    'total'=>0,
						    'normal'=>0,
						    'alert'=>0
					    );
					    $cabinet = API('get/base/envs',array('parent_env_no'=>$env['env_no']));
					    if(isset($cabinet['total'])&&$cabinet['total']>0){
						    foreach($cabinet['rows'] as $c){
							    if(isset($c['env_no'])&&$c['env_no']){
								    $env_nos[] = $c['env_no'];
								    $zt[$env['env_no']]['child'][] = $c['env_no'];
								    $zt[$env['env_no']]['total']++;
							    }
						    }
					    }
				    }
			    }
		    }
	    }

        if($env_nos){
	        $alerts = $this->db->select('env_no')->where_in('env_no',$env_nos)->where(array('clear_time'=>null))->get('alert')->result_array();

            $alt_env = array();
            if($alerts){
                foreach($alerts as $alt){
                    if(isset($alt['env_no']) && $alt['env_no']&&!in_array($alt['env_no'],$alt_env)){
                        $alt_env[] = $alt['env_no'];
                    }
                }
            }

	        $data_order = "equip_time";

            $end_time = time();
            $start_time = $end_time - 24 * 3600;
            $data_sensor = $this->db->select(array('humidity','temperature','env_no'))->where_in('env_no',$env_nos)
                ->where($data_order.' > '.$start_time.' and '.$data_order.' <='.$end_time)
                ->get('data_sensor')->result_array();

            $temp = array();
            if($data_sensor){
                foreach($data_sensor as $ds){
                    if($ds['env_no']){

                        if($ds['temperature']){
                            $ds['temperature'] = deal_data_decimal('temperature',$ds['temperature']);
                            if(isset($temp[$ds['env_no']]['temperature'])){
                                $temp[$ds['env_no']]['temperature'][] = $ds['temperature'];
                            }else{
                                $temp[$ds['env_no']]['temperature'] = array($ds['temperature']);
                            }
                        }
                        if($ds['humidity']){
                            $ds['humidity'] = deal_data_decimal('humidity',$ds['humidity']);
                            if(isset($temp[$ds['env_no']]['humidity'])){
                                $temp[$ds['env_no']]['humidity'][] = $ds['humidity'];
                            }else{
                                $temp[$ds['env_no']]['humidity'] = array($ds['humidity']);
                            }
                        }
                    }
                }
            }

            foreach($zt as $no=>$val){
	            if($val['child']){
		            $alert_child = array_intersect($val['child'],$alt_env);
		            $zt[$no]['alert'] = sizeof($alert_child);
		            if($val['total']){
			            $zt[$no]['normal'] = $val['total'] -  $zt[$no]['alert'];
			            $zt[$no]['rate'] = round( $zt[$no]['normal']/$val['total'] * 100,2);
		            }else{
			            $zt[$no]['rate'] = '-';
		            }
	            }


                $zt[$no]['temperature_min'] = '-';
                $zt[$no]['temperature_max'] = '-';
                $zt[$no]['humidity_min'] = '-';
                $zt[$no]['humidity_max'] = '-';
                if(isset($temp[$no]) && $temp[$no]){
                    $zt[$no]['temperature_min'] = $temp[$no]['temperature']?deal_data_decimal('temperature',min($temp[$no]['temperature'])):'-';
                    $zt[$no]['temperature_max'] = $temp[$no]['temperature']?deal_data_decimal('temperature',max($temp[$no]['temperature'])):'-';
                    $zt[$no]['humidity_min'] = $temp[$no]['humidity']?deal_data_decimal('humidity',min($temp[$no]['humidity'])):'-';
                    $zt[$no]['humidity_max'] = $temp[$no]['humidity']?deal_data_decimal('humidity',max($temp[$no]['humidity'])):'-';
                }
	            unset($zt[$no]['child']);
            }
        }

        $this->response($zt);
    }

    public function hot_area_get($parent_env_no = null)
    {
        if(!$parent_env_no){
            $this->response(array('error'=>'环境编号不能为空'));
        }

        $envs = array(
            'total'=>0,
            'rows'=>array()
        );
        $env_nos = array();
        if(isset($this->_user['data_scope'])&&$this->_user['data_scope']){
            if($this->_user['data_scope'] == 'administrator'|| in_array($parent_env_no,$this->_user['data_scope'])){
                $envs = API('get/base/envs',array('parent_env_no'=>$parent_env_no));
                if(isset($envs['rows'])&&$envs['rows']){
                    foreach($envs['rows'] as $key=>$env){
                        $envs['rows'][$key]['alert'] = false;
                        if(isset($env['env_no'])&&$env['env_no']){
                            $env_nos[] = $env['env_no'];
                            $alert = M("alert")->fetAll("env_no = '".$env['env_no']."' and clear_time is null");
                            if($alert){
                                $envs['rows'][$key]['alert'] = true;
                            }
                        }
                    }
                }
            }
        }

        $this->response($envs);
    }

}
