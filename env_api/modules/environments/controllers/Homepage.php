<?php
class Homepage extends MY_Controller{

	/***
	 *获取展厅，展柜最近一小时内每10分钟的温湿度概况,均值，极值
	 * @param   显示参数
	 **/
    function overview_average_get($param = null)
	{
        $envs = API('get/base/envs',array('type'=>"展柜,展厅,库房,存储柜"));

        if(!$param){
            $param = 'temperature';
        }

        $env_nos = array();
        if($envs['total']>0){
            foreach($envs['rows'] as $env){
                if(isset($env['env_no']) && $env['env_no']){
                    if(!in_array($env['env_no'],$env_nos)){
                        $env_nos[] = $env['env_no'];
                    }
                }
            }
        }

        $now = time();
        $end_time = time() - $now%600;
        $start_time = $end_time - 3600;
        $time_len = 600;

	    $data_order = "equip_time";

	    $data = array();
	    if($env_nos){
	        $sql = "select equip_time,server_time,env_no,".$param." from data_sensor where env_no in ('".implode("','",$env_nos)."') "
		        ."and ".$data_order." >= ".$start_time." and ".$data_order." <".time();
	        $data_sensor = $this->db->query($sql)->result_array();

	        $deal_data = array();
	        if($data_sensor){
		        $num = 0;

		        for($num = 0;$num < 6;$num++){
			        $low_time = $start_time + $num * $time_len;
			        $high_time = $low_time + $time_len;

			        foreach($data_sensor as $ds){
				        if(isset($ds[$data_order])){
					        if($ds[$data_order] >= $low_time && $ds[$data_order] < $high_time){
						        if(isset($ds[$param]) && $ds[$param]){
							        $dt = $low_time ;
							        if(isset($deal_data[$low_time])){
								        $deal_data[$dt][] = $ds[$param];
							        }else{
								        $deal_data[$dt] = array($ds[$param]);
							        }
						        }
					        }
				        }
			        }
		        }
	        }

	        if($deal_data){
		        foreach($deal_data as $t=>$v){
			        $average = round(array_sum($v)/count($v),2);
			        $min = min($v);
			        $max = max($v);
			        $data['time'][] = date("Y-m-d H:i",$t);
			        $data['average'][] = $average;
			        $data['min'][] = $min;
			        $data['max'][] = $max;
		        }
	        }
        }

        $this->response($data);

    }

	/**
	 *微环境的各参数的达标率
	 * @time     查看的时间段
	 */
    function standard_params_get($time = null)
	{
        if(!$time){
            $time = 'today';
        }

        $envs = API('get/base/envs',array('type'=>"展柜,存储柜,库房,存储柜"));

        $env_nos = array();
        if($envs && $envs['total']>0){
            foreach($envs['rows'] as $en){
                if(isset($en['env_no'])){
                    $env_nos[] = $en['env_no'];
                }
            }
        }
	    $data_order = "equip_time";

        if($env_nos){
	        $select = "data_sensor.co2,data_sensor.temperature,data_sensor.humidity,data_sensor.voc,data_sensor.uv,data_sensor.light,data_sensor.equip_no".
		        ",data_sensor.env_no,data_sensor.alert_param,data_sensor.equip_time,data_sensor.server_time,equip.parameter";
            if($time == 'today'){
	            $s_time = strtotime('today');
	            $sql = "SELECT ".$select." FROM data_sensor LEFT JOIN equip ON equip.equip_no = data_sensor.equip_no WHERE data_sensor.env_no IN('"
		            .implode("','",$env_nos)."') and data_sensor.".$data_order." >= ".$s_time ." ORDER BY data_sensor.".$data_order." ASC";
            }else if($time == "yesterday"){
	            $s_time = strtotime('yesterday');
	            $e_time = strtotime('today');
	            $sql = "SELECT ".$select." FROM data_sensor LEFT JOIN equip ON equip.equip_no = data_sensor.equip_no WHERE data_sensor.env_no IN('"
		            .implode("','",$env_nos)."') AND data_sensor.".$data_order." between ".$s_time ." AND ".$e_time." ORDER BY data_sensor.".$data_order." ASC";
            }
	        $data_sensor = $this->db->query($sql)->result_array();
        }

        $parameters  = $this->db->where(array('type'=>'sensor'))->get('equip_param')->result_array();

        $data = array();
        $data['total'] = 0;
        foreach($parameters as $parameter){
            if(!in_array($parameter['param'],array('organic','inorganic','sulfur'))){
                $temp_data = array();

	            $param = $parameter['param'];
                $temp_data['name'] = $parameter['name'];
                $temp_data['param'] = $param;
                $temp_data['max'] = 100;


	            $count = 0;
	            $alert_count = 0;
	            if(isset($data_sensor)&&$data_sensor){
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

        $this->response($data);
    }

	/**
	 *获取博物馆各模块评分及其综合评分
	 **/
    function museum_scores_get()
	{
        $data = array(
            'equip_score'=>100,
            'env_score'=>100,
            'manage_score'=>0,
            'global_score'=>100
        );

        $e = M('equip');
        $equips = $e->fetAll();
        if($equips){
            $normal_equip = 0;
            foreach($equips as $equip){
                if(isset($equip['status']) && '正常' == $equip['status']){
                    $normal_equip++;
                }
            }

            $data['equip_score'] = round($normal_equip/count($equips)  * 100,2);
        }

        $envs = API('get/base/envs',array('type'=>"展厅,展柜"));
        $env_nos = array();
        $env_type = array(
            'hall'=>array(),
            'cabinet'=>array()
        );
        if($envs['total'] > 0){
            foreach($envs['rows'] as $env){
                if($env['env_no']){
                    $env_nos[] = $env['env_no'];

                    if(isset($env['type']) && $env['type']){
                        if('展厅' == $env['type']){
                            $env_type['hall'][] = $env['env_no'];
                        }else if('展柜' == $env['type']){
                            $env_type['cabinet'][] = $env['env_no'];
                        }
                    }
                }
            }
        }

        if($env_nos){
            $alerts = $this->db->select('env_no')->where(array('clear_time'=>null))->where_in('env_no',$env_nos)->distinct()->get('alert')->result_array();
        }
        $alert_env = array();
        if(isset($alerts)&&$alerts){
            foreach($alerts as $alt){
                if(isset($alt['env_no']) && $alt['env_no']){
                    $alert_env[] = $alt['env_no'];
                }
            }
            $temp_score = array(
                'hall' => 1,
                'cabinet'=>1
            );
            if($alert_env){
                foreach($env_type as $ty=>$v){
                    $alt_count = count(array_intersect($v,$alert_env));
                    $temp_score[$ty] = round((count($v) - $alt_count)/count($v)  * 100,2);
                }

                if($temp_score){
                    $data['env_score'] = $temp_score['hall'] * 0.3 + $temp_score['cabinet'] * 0.7;
                }
            }
        }

        $users = API('get/base/users',array('level'=>'工作人员'));

        $monday = mktime(0, 0 , 0,date("m"),date("d")-date("w")+1,date("Y"));
        $today = strtotime('today');

        $user_logins = API('get/base/users/login_count',array('ktime'=>$monday,'dtime'=>time()));

        $days = ($today-$monday)/(24*3600) + 1;
        if($days == 0){
            $days = 7;
        }

        if($users['total'] > 0){
            $data['manage_score'] = 100;
            if(isset($user_logins['total_user_count'])&&$user_logins['total_user_count']){
                $data['manage_score'] =  round($user_logins['total_user_count']/($days * $users['total'])*100,2);
            }
        }

        $data['global_score'] = $data['equip_score'] * 0.3 + $data['env_score'] * 0.3 + $data['manage_score'] * 0.4;

        $this->response($data);
    }

	/***
	 *区域概况
	 *获取各展厅的温湿度均值和微环境达标率
	 ***/
    function hall_overview_get()
	{
        $hall = API('get/base/envs',array('type'=>"展厅,库房"));

        $hall_nos = array();
        $micro_env = array();
        $m_e_count = array();
	    $search_array = array();
        if(isset($hall['total'])&&$hall['total'] > 0){
            foreach($hall['rows'] as $h){
                if(isset($h['env_no']) && $h['env_no']){
                    $hall_nos[$h['env_no']] = $h['name'];
                    $m_e_count[$h['env_no']] = array();
                    if($h['type'] === "展厅"||$h['type'] === "库房"){
                        $hall_nos[$h['env_no']] = $h['name'];
                        $search_array[] = array('get/base/envs',array('parent_env_no'=>$h['env_no']));
                    }
                }
            }
        }

	    if($search_array){
		    $cabinets = API($search_array);
		    if($cabinets){
			    if(!isset($cabinets['total'])){
				    foreach($cabinets as $cabinet){
					    if(isset($cabinet['total'])&&$cabinet['total']>0){
						    foreach($cabinet['rows'] as $c){
							    if(isset($c['env_no'])&&$c['env_no']){
								    if($c['type'] === "展柜"||$c['type'] === "存储柜"){
									    $micro_env[] = $c['env_no'];
									    $m_e_count[$c['parent_env_no']][] = $c['env_no'];
								    }
							    }
						    }
					    }
				    }
			    }else{
				    if(isset($cabinets['total'])&&$cabinets['total']>0){
					    foreach($cabinets['rows'] as $c){
						    if(isset($c['env_no'])&&$c['env_no']){
							    if($c['type'] === "展柜"||$c['type'] === "存储柜"){
								    $micro_env[] = $c['env_no'];
								    $m_e_count[$c['parent_env_no']][] = $c['env_no'];
							    }
						    }
					    }
				    }
			    }
		    }
	    }

	    $data_order = "equip_time";

	    $end_time = time() ;
        $start_time = $end_time - 24 * 3600;

	    $datas = array(
		    'total'=>0,
		    'rows'=>array()
	    );
        if($hall_nos){
	        $sql = "select equip_time,server_time,temperature,humidity,env_no from data_sensor where env_no in ('".implode("','",array_keys($hall_nos)).
		        "') and ".$data_order." > ".$start_time." and ".$data_order." <=".$end_time;
	        $data_sensor = $this->db->query($sql)->result_array();

            if($micro_env){
	            $alerts = $this->db->select('env_no,clear_time,alert_param')->where_in("env_no",$micro_env)
		            ->where(array('clear_time'=>null))->distinct()
		            ->get('alert')->result_array();
            }

            $alert_data = array();
            if(isset($alerts)&&$alerts){
                foreach($m_e_count as $p_no=>$nos){
                    if(!isset($alert_data[$p_no])){
                        $alert_data[$p_no] = array();
                    }
                    foreach($alerts as $alert){
                        if(in_array($alert['env_no'],$nos)&&!in_array($alert['env_no'],$alert_data[$p_no],true)){
                            $alert_data[$p_no][] = $alert['env_no'];
                        }
                    }
                }
            }

	        $pdata = array();
	        if($data_sensor){
		        foreach($data_sensor as $ds){
			        if(isset($ds['env_no'])&&$ds['env_no']){
				        if(isset($pdata[$ds['env_no']])){
					        if(isset($pdata[$ds['env_no']]['humidity'])){
						        if(isset($ds['humidity'])&& $ds['humidity']){
							        $pdata[$ds['env_no']]['humidity'][] = $ds['humidity'];
						        }
					        }else{
						        if(isset($ds['humidity'])&& $ds['humidity']){
							        $pdata[$ds['env_no']]['humidity'] = array($ds['humidity']);
						        }
					        }

					        if(isset($pdata[$ds['env_no']]['temperature'])){
						        if(isset($ds['temperature'])&& $ds['temperature']){
							        $pdata[$ds['env_no']]['temperature'][] = $ds['temperature'];
						        }
					        }else{
						        if(isset($ds['temperature'])&& $ds['temperature']){
							        $pdata[$ds['env_no']]['temperature'] = array($ds['temperature']);
						        }
					        }
				        }else{
					        $pdata[$ds['env_no']] = array();
				        }
			        }
		        }
	        }
            foreach($hall_nos as $no=>$name){

                $data = array(
                    'env_no'=>$no,
                    'name'=>$name,
                    'humidity'=>'-',
                    'temperature'=>'-',
                    'standard_rate'=>'-'
                );

	            if(isset($pdata[$no]['humidity'])&&$pdata[$no]['humidity']){
		            $data['humidity'] = round(array_sum($pdata[$no]['humidity'])/sizeof($pdata[$no]['humidity']),2);
	            }

	            if(isset($pdata[$no]['temperature'])&&$pdata[$no]['temperature']){
		            $data['temperature'] = round(array_sum($pdata[$no]['temperature'])/sizeof($pdata[$no]['temperature']),2);
	            }

	            if($alert_data && isset($alert_data[$no])&& $m_e_count[$no]){
		            $data['standard_rate'] = (1 - round(sizeof($alert_data[$no])/sizeof($m_e_count[$no]),2))*100;
		            if($data['standard_rate'] < 0){
			            $data['standard_rate'] = 0;
		            }
	            }else{
		            $data['standard_rate'] = 100;
	            }

	            $datas['total']++;
	            $datas['rows'][] = $data;
            }
        }

        $this->response($datas);
    }

}
