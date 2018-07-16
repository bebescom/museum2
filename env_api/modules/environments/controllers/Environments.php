<?php
class Environments extends MY_Controller{

	function index_get_nologin(){
		$m=M("equipments/equip");

        $env = M('env');
        $this->response(array($m->get_parameters()));
	}

	/**
	 * 楼层，2. 环境监控，小环境达标率
	 * 获取楼层中所有小环境的达标率
	 * @floor_no 楼层/展厅编号
	 */
    function hall_infos_get($hall_no){

        $data = array();
        if($hall_no){
            $env = API('get/base/envs/info/'.$hall_no);

            $data['name'] = $env['name'];
            $data['env_no'] = $env['env_no'];

            $equips = M('equip')->fetAll("env_no = '".$hall_no."'");

            $data_sensor = array();
            foreach($equips as $equip){
                if(isset($equip['env_no']) && $equip['env_no']){
                    if(isset($equip['equip_no'])&&$equip['equip_no']){
                        $ds = M('data_sensor')->find(array('equip_no'=>$equip['equip_no']),'humidity,temperature,equip_no,equip_time','equip_time DESC');
                        $data_sensor[] = $data;
                    }
                }
            }

            if($data_sensor){

            }
        }

        $this->response($data);
    }

    function floor_equips_get($floor_no)
    {
        $envs = API('get/base/envs',array('parent_env_no'=>$floor_no));
        $env_nos = array($floor_no);
        $zt = array();
        if($envs['total']>0){
            foreach($envs['rows'] as $env){
                if(isset($env['env_no'])&&$env['env_no']){
                    $env_nos[] = $env['env_no'];
                    $zt[$env['env_no']] = array(
                        'name'=>$env['name'],
                        'child'=>array($env['env_no'])
                    );
                    $cabinet = API('get/base/envs',array('parent_env_no'=>$env['env_no']));
                    if($cabinet['total']>0){
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

    function floor_halls_get($floor_no)
    {
        $envs = API('get/base/envs',array('parent_env_no'=>$floor_no));

        $env_nos = array();
        $zt = array();
        if(isset($envs['total'])&&$envs['total']>0){
            foreach($envs['rows'] as $env){
                if(isset($env['env_no'])&&$env['env_no']){
                    $env_nos[] = $env['env_no'];
                    $zt[$env['env_no']] = array(
                        'name'=>$env['name'],
                        'total'=>0,
                        'normal'=>0,
                        'alert'=>0
                    );
                }
            }
        }

        $equip_types = equip_type('type');
        $sensor = array('温湿度监测终端','带屏温湿度监测终端','有机挥发物监测终端','光照紫外监测终端','二氧化碳监测终端','空气质量监测终端','土壤温湿度监测终端','安防监测终端','震动监测终端');
        if(isset($equip_types['监测终端'])){
            $sensor = $equip_types['监测终端'];
        }
        if($env_nos){
            $equips = $this->db->select('equip_no,status,usage,env_no,equip_type')->where_in('equip_type',$sensor)
                ->where_in('env_no',$env_nos)->get('equip')->result_array();

	        $alerts = $this->db->select('equip_no,env_no')->where_in('env_no',$env_nos)->where(array('clear_time'=>null))->get('alert')->result_array();

            $alt_equip = array();
            if($alerts){
                foreach($alerts as $alt){
                    if(isset($alt['equip_no']) && $alt['equip_no'] && !in_array($alt['equip_no'],$alt_equip)){
                        $alt_equip[] = $alt['equip_no'];
                    }
                }
            }

            if(isset($equips)&&$equips){
                foreach($equips as $equip){
                    if(isset($equip['env_no']) && $equip['env_no']){
                        if(isset($zt[$equip['env_no']])){
                            $zt[$equip['env_no']]['total']++;
                            if(isset($equip['equip_no']) && in_array($equip['equip_no'],$alt_equip)){
                                $zt[$equip['env_no']]['alert']++;
                            }
                        }
                    }
                }
            }
            $end_time = time();
            $start_time = $end_time - 24 * 3600;
            $data_sensor = $this->db->select(array('humidity','temperature','env_no'))->where_in('env_no',$env_nos)
                ->where('equip_time > '.$start_time.' and equip_time <='.$end_time)
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

                if($val['total']){
                    $val['normal'] = $val['total'] - $val['alert'];
                    $zt[$no]['rate'] = round($val['normal']/$val['total'] * 100,2);
                }else{
                    $zt[$no]['rate'] = '-';
                }

                $zt[$no]['temperature_min'] = '-';
                $zt[$no]['temperature_max'] = '-';
                $zt[$no]['humidity_min'] = '-';
                $zt[$no]['humidity_max'] = '-';
                if(isset($temp[$no]) && $temp[$no]){
                    $zt[$no]['temperature_min'] = $temp[$no]['temperature']?min($temp[$no]['temperature']):'-';
                    $zt[$no]['temperature_max'] = $temp[$no]['temperature']?max($temp[$no]['temperature']):'-';
                    $zt[$no]['humidity_min'] = $temp[$no]['humidity']?min($temp[$no]['humidity']):'-';
                    $zt[$no]['humidity_max'] = $temp[$no]['humidity']?max($temp[$no]['humidity']):'-';
                }
            }
        }

        $this->response($zt);
    }

    /**
     * 楼层，2. 环境监控，小环境达标率--仪表盘
     * 获取楼层中所有小环境的达标率--合格的小环境数、总的小环境数
     * @floor_no 楼层/展厅编号
     * 备注：功能现已取消显示
     */
    function hall_standards_get($floor_no){

        $envs = API('get/base/envs',array('parent_env_no'=>$floor_no));

        $small_env = array($floor_no);
        if($envs['total']>0){
            foreach($envs['rows'] as $env){
                if(isset($env['env_no'])&&$env['env_no']){
                    if(isset($env['type'])&&$env['type']){
                        if(isset($en['type'])&&($en['type'] == "展厅"||$en['type'] == "库房"||$en['type'] == "研究室"||$en['type'] == "修复室")){
		                    $small_env[] = $env['env_no'];
	                    }
                    }
                }
            }
        }

        $equip_types = equip_type('type');
        $sensor = array('温湿度监测终端','带屏温湿度监测终端','有机挥发物监测终端','光照紫外监测终端','二氧化碳监测终端','空气质量监测终端','土壤温湿度监测终端','安防监测终端','震动监测终端');
        if(isset($equip_types['监测终端'])){
            $sensor = $equip_types['监测终端'];
        }
        if($small_env){
            $s_equips = $this->db->select('*')->where_in('env_no',$small_env)->where_in('equip_type',$sensor)->get('equip')->result_array();
            $alerts = $this->db->select('equip_no')->where_in('env_no',$small_env)->where(array('clear_time'=>null))->get('alert')->result_array();
        }

        $alt_equip = array();
        if(isset($alerts)&&$alerts){
            foreach($alerts as $alt){
                if(isset($alt['equip_no']) && $alt['equip_no'] && !in_array($alt['equip_no'],$alt_equip)){
                    $alt_equip[] = $alt['equip_no'];
                }
            }
        }
        $data = array(
            'total'=>0,
            'normal'=>0,
            "rate"=>"-"
        );
        if(isset($s_equips)&&$s_equips){
	        $sensor_nos = array();
	        foreach($s_equips as $se){
		        if(isset($se['equip_no'])&&$se['equip_no']){
			        $sensor_nos[] = $se['equip_no'];
		        }
	        }
            $data['total'] = sizeof($s_equips);
            $data['normal'] = $data['total'] - sizeof(array_intersect($alt_equip,$sensor_nos));
            $data['rate'] = round($data['normal']/$data['total'] * 100,2);
        }
        $this->response($data);
    }

	/**
	 * 楼层，2. 环境监控，小环境分项达标率--雷达图
	 * 获取楼层中所有小环境的各参数分类达标率
	 * @floor_no 楼层/展厅编号
     * 备注：功能现已取消显示
	 */
    function hall_params_get($floor_no)
    {
        $envs = API('get/base/envs',array('parent_env_no'=>$floor_no));

        $env_nos = array($floor_no);
        if($envs && $envs['total']>0){
            foreach($envs['rows'] as $en){
                if(isset($en['env_no'])){
                   if(isset($en['type'])&&($en['type'] == "展厅"||$en['type'] == "库房"||$en['type'] == "研究室"||$en['type'] == "修复室")){
	                   $env_nos[] = $en['env_no'];
                   }
                }
            }
        }

	    $s_time = time() - 24*3600;
	    $data = array(
		    'total'=>0,
		    'rows'=> array()
	    );

	    $data_order = "equip_time";
        if($env_nos){

	       $select = "data_sensor.co2,data_sensor.temperature,data_sensor.humidity,data_sensor.organic,data_sensor.inorganic,data_sensor.sulfur,data_sensor.equip_no".
	            ",data_sensor.env_no,data_sensor.alert_param,data_sensor.equip_time,data_sensor.server_time,equip.parameter";
	       $sql = "SELECT ".$select." FROM data_sensor LEFT JOIN equip ON equip.equip_no = data_sensor.equip_no WHERE data_sensor.env_no IN('"
		       .implode("','",$env_nos)."') and data_sensor.".$data_order." >= ".$s_time ." and data_sensor.".$data_order." ORDER BY data_sensor.".$data_order." ASC";
			$data_sensor = $this->db->query($sql)->result_array();

	       $parameters = M('equipments/equip')->get_parameters('sensor');

	       if(isset($parameters)){
		       foreach($parameters as $parameter){
			       if(in_array($parameter['param'],array('humidity','temperature','co2',"organic","inorganic","sulfur"))){
				       $temp_data = array();
				       $param = $parameter['param'];
				       $temp_data['name'] = $parameter['name'];
				       $temp_data['max'] = 100;

				       $count = 0;
				       $alert_count = 0;
				       if($data_sensor){
					       foreach($data_sensor as $ds){
						       if(isset($ds[$param])&&$ds[$param]){
							       $count++;
						       }

						       if(isset($ds['alert_param'])&&$ds['alert_param']){
							       $alert_param = explode(',',$ds['alert_param']);
							       if(in_array($param,$alert_param)){
								       $alert_count++;
							       }
						       }
					       }
				       }

				       if($count){
					       $temp_data['reaches'] = $count - $alert_count;
					       $temp_data['total'] = $count;
					       $temp_data['rate'] = round($temp_data['reaches']/$temp_data['total'] *100,2);
				       }else{
					       $temp_data['rate'] = '-';
					       $temp_data['reaches'] = '-';
					       $temp_data['total'] = '-';
				       }

				       $data['rows'][] = $temp_data;
				       $data['total']++;
			       }
		       }
	       }
       }

        $this->response($data);
    }

	/**
	 * 楼层，2. 环境监控，均峰值
	 * 获取楼层及其小环境的温湿度极值和标准差
	 * @floor_no 楼层/展厅编号
	 * @param  参数
	 */
    function  floor_poles_get($floor_no,$param=null)
    {

	    $time = $this->get_post('time');
	    if($time){
		    switch($time){
			    case '24h':
				    $end_time = time();
				    $start_time = $end_time - 24 * 3600;
				    break;
			    case 'today':
				    $start_time = strtotime('today');
				    $end_time = time();
				    break;
			    case 'yesterday':
				    $start_time = strtotime('yesterday');
				    $end_time = $start_time + 24*3600;
				    break;
			    case 'week':
				    $today = date("Y-m-d");
				    $week = date('w',strtotime($today));
				    $start_time = strtotime($today ."-".($week ? $week - 1 : 6).' days');
				    $end_time = time();
				    break;
			    case 'month':
				    $end_time = time();
				    $start_time = mktime(0,0,0,date("m"),1,date("Y"));
				    break;
			    default:
				    $time_array = explode(',',$time);
				    $start_time = strtotime($time_array[0]);
				    $end_time = strtotime($time_array[1]);
				    break;
		    }
	    }else{
		    $end_time = time();
		    $start_time = $end_time - 24 * 3600;
	    }

        $env_self = API('get/base/envs/info/'.$floor_no);
        $envs = API('get/base/envs',array('parent_env_no'=>$floor_no));

        $data = array();
        if(!isset($env_self['error'])){

            $env_nos = array(
                $floor_no=>array(
                    'name'=>$env_self['name'],
                    'type'=>$env_self['type']
                )
            );
            if($envs && $envs['total']>0){
                foreach($envs['rows'] as $en){
                    if(isset($en['env_no'])){
                        $env_nos[$en['env_no']] = array(
                            'name'=>$en['name'],
                            'type'=>$en['type']
                        );
                    }
                }
            }
            if(!$param){
                $param = 'temperature';
            }
            $data_order = "equip_time";
            if($env_nos){
                $sql = "select data_sensor.".$param.",data_sensor.env_no from data_sensor where env_no in ('".implode("','",array_keys($env_nos)).
                    "') and ".$data_order." >=".$start_time." and ".$data_order." <".$end_time;
                $data_sensor = $this->db->query($sql)->result_array();
            }

            $parameters = M('equipments/equip')->get_parameters('sensor');

            $all_data = array();
            $env_data = array();
            if(isset($data_sensor)&&$data_sensor){
                foreach($data_sensor as $ds){
                    if(isset($ds['env_no']) && $ds['env_no']){
                        if(isset($ds[$param]) && $ds[$param] != ""&& $ds[$param] != null&& $ds[$param] != "NaN"){
                            $ds[$param] = deal_data_decimal($param,$ds[$param]);
                            $all_data[] = $ds[$param];
                            if(isset($env_data[$ds['env_no']])){
                                $env_data[$ds['env_no']][] = $ds[$param];
                            }else{
                                $env_data[$ds['env_no']] = array($ds[$param]);
                            }
                        }
                    }
                }
            }
            $data = array();
            $params = array();
            if($parameters){
                foreach($parameters as $parameter){
                    if(isset($parameter['param'])&&$parameter['param']){
                        $params[$parameter['param']] = array(
                            'unit'=>$parameter['unit']
                        );
                    }

                }
            }
            if($all_data){
                $data['floor'] = array();
                $data['floor']['env_no'] = $floor_no;
                $data['floor']['name'] = "本层";
                $data['floor']['type'] = "楼层";
                if($env_self){
                    if(isset($env_self['type'])){
                        $data['floor']['type'] = $env_self['type'];
                        switch($env_self['type']){
                            case "展厅":
                                $data['floor']['name'] = "本展厅";
                                break;
                            case "库房":
                                $data['floor']['name'] = "本库房";
                                break;
                            case "修复室":
                                $data['floor']['name'] = "本修复室";
                                break;
                            case "研究室":
                                $data['floor']['name'] = "本研究室";
                                break;
                            default:
                                break;
                        }
                    }
                }
                $data['floor']['min'] = min($all_data)+0;
                $data['floor']['max'] = max($all_data)+0;
                $average = array_sum($all_data)/sizeof($all_data);
                $data['floor']['average'] = deal_data_decimal($param,$average);
                $pow_sum = 0;
                foreach($all_data as $ad){
                    $pow_sum += pow($ad - $average,2);
                }
                $data['floor']['SD'] = round(pow($pow_sum/count($all_data),0.5),2);
            }

            if($env_data){
                foreach($env_data as $no=>$ed){
                    if($env_nos[$no]){
                        if($no == $floor_no){
                            $data['self'] = array();
                            $data['self']['env_no'] = $no;
                            $data['self']['name'] = $env_nos[$no]['name'];
                            $data['self']['type'] = $env_nos[$no]['type'];
                            $data['self']['min'] = min($ed)+0;
                            $data['self']['max'] = max($ed)+0;
                            $average = array_sum($ed)/sizeof($ed);
                            $data['self']['average'] = deal_data_decimal($param,$average);
                            $pow_sum = 0;
                            foreach($ed as $v){
                                $pow_sum += pow($v - $average,2);
                            }
                            $data['self']['SD'] =  deal_data_decimal($param,pow($pow_sum/count($ed),0.5));
                        }else{
                            $data[$no] = array();
                            $data[$no]['env_no'] = $no;
                            $data[$no]['name'] = $env_nos[$no]['name'];
                            $data[$no]['type'] = $env_nos[$no]['type'];
                            $data[$no]['min'] = min($ed)+0;
                            $data[$no]['max'] = max($ed)+0;
                            $average = array_sum($ed)/sizeof($ed);
                            $data[$no]['average'] = deal_data_decimal($param,$average);
                            $pow_sum = 0;
                            foreach($ed as $v){
                                $pow_sum += pow($v - $average,2);
                            }
                            $data[$no]['SD'] =  deal_data_decimal($param,pow($pow_sum/count($ed),0.5));
                        }
                    }
                }
            }
            if($data){
                foreach($data as $env_no=>$d){
                    $p = array();
                    if(isset($params[$param])){
                        $p = $params[$param];
                    }
                    $data[$env_no] = array_merge($data[$env_no],$p);
                }
            }
        }

        $this->response($data);
    }

	/**
	 * 楼层，2. 环境监控，设备列表
	 * 获取小环境的监测设备列表
	 * @floor_no 楼层/展厅编号
	 */
    function floor_sensors_get($floor_no){

        if($floor_no){
            $env_self = API('get/base/envs/info/'.$floor_no);
        }
        $envs = API('get/base/envs');
        $small_env = array();
        $micro_env = array();
        $env_nos = array();
        if($envs['total']>0){
            foreach($envs['rows'] as $env){
                if(isset($env['env_no'])&&$env['env_no']){
                    if(in_array($env['type'],array("展厅","库房","修复室","研究室","楼层"))){
                        if(strpos($env['env_no'],(string)$floor_no) !== false){
                            $env_nos[] = $env['env_no'];
                            $small_env[] = $env['env_no'];
                        }
                    }else if(in_array($env['type'],array("展柜","存储柜","安防展柜","区域"))){
                        if(strpos($env['env_no'],(string)$floor_no) !== false){
                            $env_nos[] = $env['env_no'];
                            $micro_env[] = $env['env_no'];
                        }
                    }
                }
            }
        }

        $equip_types = equip_type('type');
        $sensor = array('温湿度监测终端','带屏温湿度监测终端','有机挥发物监测终端','光照紫外监测终端','二氧化碳监测终端','空气质量监测终端','土壤温湿度监测终端','安防监测终端','震动监测终端');
        if(isset($equip_types['监测终端'])){
            $sensor = $equip_types['监测终端'];
        }
        $offline =  array('手持式温湿度检测仪','手持式二氧化碳检测仪','手持式光照紫外检测仪','手持式有机挥发物检测仪',"手持式甲醛检测仪");
        if(isset($equip_types['手持离线设备'])){
            $offline = $equip_types['手持离线设备'];
        }

        $data = array(
            'total'=>0,
            'rows'=>array()
        );
        if(isset($this->_user['data_scope'])&&$this->_user['data_scope']){
            if($this->_user['data_scope'] != 'administrator'){
                $env_nos = array_intersect($this->_user['data_scope'],$env_nos);
            }
            if($env_nos){
                $equips = $this->db->where_not_in('status',array("停用"))->where_in('env_no',$env_nos)->where_in('equip_type',array_merge($sensor,$offline))->get('equip')->result_array();
                if($equips){
                    $data['total'] = sizeof($equips);
                    foreach($equips as $equip){
                        if(isset($equip['env_no']) && $equip['env_no']){
                            if(in_array($equip['env_no'],$small_env)){
                                if(isset($data['rows']['small_env'])){
                                    $data['rows']['small_env'][] = $equip;
                                }else{
                                    $data['rows']['small_env'] = array($equip);
                                }
                            }else if(in_array($equip['env_no'],$micro_env)){
                                if(isset($data['rows']['micro_env'])){
                                    $data['rows']['micro_env'][] = $equip;
                                }else{
                                    $data['rows']['micro_env'] = array($equip);
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
	 * 楼层，2. 环境监控 设备运行状况
	 * 获取正常和异常设备的设备的数量
	 * @env_no 楼层/展厅编号
	 */
    function equip_status_get($env_no){
        $envs = API('get/base/envs',array('parent_env_no'=>$env_no));

        $env_nos = array();
        if($envs['total']>0){
            foreach($envs['rows'] as $env){
                if(isset($env['env_no'])&&$env['env_no']){
                    if(in_array($env['type'],array("展厅","库房","修复室","研究室","楼层"))){
                        if(strpos($env['env_no'],(string)$env_no) !== false){
                            $env_nos[] = $env['env_no'];
                            $small_env[] = $env['env_no'];
                        }
                    }else if(in_array($env['type'],array("展柜","存储柜","安防展柜"))){
                        if(strpos($env['env_no'],(string)$env_no) !== false){
                            $env_nos[] = $env['env_no'];
                            $micro_env[] = $env['env_no'];
                        }
                    }
                }
            }
        }

        $data = array(
            '正常'=>0,
            '异常'=>0
        );
        $equip_types = equip_type('type');
        $sensor = array('温湿度监测终端','带屏温湿度监测终端','有机挥发物监测终端','光照紫外监测终端','二氧化碳监测终端','空气质量监测终端','土壤温湿度监测终端','安防监测终端','震动监测终端');
        if(isset($equip_types['监测终端'])){
            $sensor = $equip_types['监测终端'];
        }
        if(isset($this->_user['data_scope'])&&$this->_user['data_scope']) {
            if ($this->_user['data_scope'] != 'administrator') {
                $env_nos = array_intersect($this->_user['data_scope'], $env_nos);
            }
            if($env_nos){
                $equips = $this->db->select("status,count(*) as count")->where_in('env_no',$env_nos)->where_in('equip_type',$sensor)
                    ->group_by('status')->get('equip')->result_array();
            }
            if(isset($equips)&&$equips){
                foreach($equips as $equip){
                    $data[$equip['status']] = $equip['count'];
                }
            }
        }

        $this->response($data);
    }

	/**
	 * 展柜，展柜概览
	 * 获取展柜的概览信息，包括预警数，最新温湿度数据，拥有文物、设备等
	 * @env_no 展柜编号
	 */
    function env_detail_get($env_no){

        $env = API('get/base/envs/info/'.$env_no);

        $data = array(
            'env'=>array(),
            'alert'=>array(),
            'data'=>array(),
            'relic'=>array(),
            'equip'=>array()
        );

        if(isset($env['env_no'])&&$env['env_no']){
            $data['env']['env_no']=$env['env_no'];
        }
        if(isset($env['name'])&&$env['name']){
            $data['env']['name']=$env['name'];
        }

	    $data_order = "equip_time";

        if(isset($env['env_no'])&&$env['env_no']){
            $alert_count = M("alert")->count("env_no = '".$env['env_no']."' and clear_time is NULL");
            $data['alert']['count'] = $alert_count;

            $data_temp = M("data_sensor")->find("env_no = '".$env['env_no']."' and temperature is not null and ".$data_order." <=".time(),"temperature",$data_order." desc");
            $data_hum = M("data_sensor")->find("env_no = '".$env['env_no']."' and humidity is not null and ".$data_order." <=".time(),"humidity",$data_order." desc");
 
            if($data_temp&&isset($data_temp['temperature'])&&$data_temp['temperature']){
               $data['data']['temperature'] = deal_data_decimal('temperature',$data_temp['temperature']);
            }
            if($data_hum&&isset($data_hum['humidity'])&&$data_hum['humidity']){
               $data['data']['humidity'] = deal_data_decimal('humidity',$data_hum['humidity']);
            }
            $data['data']['env_no'] = $env['env_no'];

            $relics = API("get/relic/relics",array('parent_env_no'=>$env['env_no'],"select"=>"relic_no,parent_env_no,name"));
            if(isset($relics['total'])&&$relics['total']){
                $data['relic'] = $relics['rows'];
            }

            $sensor = array("th_sensor"=>'温湿度监测终端',"sth_sensor"=>'带屏温湿度监测终端',"voc_sensor"=>'有机挥发物监测终端',"co2_sensor"=>'二氧化碳监测终端',
                "lu_sensor"=>'光照紫外监测终端',"qcm_sensor"=>'空气质量监测终端',"soil_sensor"=>"土壤温湿度监测终端","security_sensor"=>"安防监测终端","vibration_sensor"=>"震动监测终端");
            $network = array("repeater"=>'中继',"gateway"=>'网关');
            $controller = array("hum_machine"=>'调湿机',"hum_agent"=>'调湿剂',"nitrogen_controller"=>"充氮调湿柜");
            $offline = array("offline_th"=>"手持式温湿度检测仪","offline_casco"=>"手持式甲醛检测仪","offline_light"=>"手持式光照紫外检测仪",
                "offline_co2"=>"手持式二氧化碳检测仪","offline_voc"=>"手持式有机挥发物检测仪");
            $sensor_ctr = array_merge($sensor,$controller,$offline);
            $equips = $this->db->select("equip_no,name,equip_type,status,env_no")->where("env_no = '".$env['env_no']."'")->where_in('equip_type',array_values($sensor_ctr))
                ->get("equip")->result_array();
            if($equips){
                $data['equip'] = array(
                    'sensor'=>array(),
                    'controller'=>array(),
                    'offline'=>array()
                );
                foreach($equips as $equip){
                   if(isset($equip['equip_type'])&&$equip['equip_type']){
                       $equip['equip_type_en'] = array_search($equip['equip_type'],$sensor_ctr);
                       if(in_array($equip['equip_type'],array_values($sensor))){
                           $data['equip']['sensor'][] = $equip;
                       }else if(in_array($equip['equip_type'],array_values($controller))){
                           $data['equip']['controller'][] = $equip;
                       }else if(in_array($equip['equip_type'],array_values($offline))){
                           $data['equip']['offline'][] = $equip;
                       }
                   }
                }
            }
        }

        $this->response($data);
    }

}
