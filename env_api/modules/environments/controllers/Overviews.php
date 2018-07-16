<?php
class Overviews extends MY_Controller{

	/**
	 *微环境调控达标率
	 * 获取系统中微环境的数量和达标率
	 */
    function standard_reaches_get()
    {
        $envs = API('get/base/envs',array('type'=>"展柜"));

        $env_nos = array();
        if($envs && $envs['total']>0){
            foreach($envs['rows'] as $en){
                if(isset($en['env_no'])){
                    $env_nos[] = $en['env_no'];
                }
            }
        }
        $env = array(
            '主动调控'=>array(),
            '被动调控'=>array(),
            '仅监测'=>array()
        );

        if($env_nos){
            $equips = $this->db->select(array('env_no','equip_no','monitor_type'))->where_in('env_no',$env_nos)->get('equip')->result_array();
            $alerts = $this->db->select(array('env_no','equip_no'))->where_in('env_no',$env_nos)->where(array('clear_time'=>null))->get('alert')->result_array();
        }
        $alert_env = array();

       if(isset($alerts)&&$alerts){
           foreach($alerts as $alt){
               if(!in_array($alt['env_no'],$alert_env)){
                   $alert_env[] = $alt['env_no'];
               }
           }
       }

        $result = array();
        $result['total'] = 0;
	    $deal_env = array();
        foreach($env as $type=>$value){
            $count = array();
            $no_alert_env = array();
            foreach($equips as $equip){
                if(isset($equip['monitor_type']) && $type == $equip['monitor_type']){
                    if(in_array($equip['env_no'],$env_nos) && !in_array($equip['env_no'],$value)&& !in_array($equip['env_no'],$deal_env)){
                        $count[] = $equip['env_no'];
	                    $deal_env[] = $equip['env_no'];
                        if(!in_array($equip['env_no'],$alert_env)){
                            $no_alert_env[] = $equip['env_no'];
                        }
                    }
                }
            }

            $standard_rate = $count?round(sizeof($no_alert_env)/sizeof($count)*100,2):'-';
            $result['rows'][] = array('quantity'=>sizeof($count),'rate'=>$standard_rate,'name'=>$type);
            $result['total']++;
        }

        $this->response($result);
    }

    /**
     *特别关注箱线图
     * 获取特别关注对象的数据，并根据数据绘出相应的箱线图
     * @param     参数
     **/
    function box_plots_get($param=null)
    {
	    $time = $this->get_post("time");
        $follows = API('get/base/follows');
        $env_nos = array();
        $relic_env_nos = array();
	    $equip_nos = array();
        if(isset($follows['total']) && $follows['total']>0){
            $relic_no =array();
            foreach($follows['rows'] as $fl){
                if(isset($fl['no'])){
                    if($fl['type'] == 'cabinet'){
                        $env_nos[$fl['no']] = $fl['name'];
                    }else if($fl['type'] == 'relic'){
                        $relic_no[$fl['no']] = $fl['name'];
                    }else if($fl['type'] == "equip"){
	                    $equip_nos[$fl['no']] = $fl['name'];
                    }
                }
            }
            if($relic_no){
                $relic = API('get/relic/relics',array('relic_no'=>"".implode(',',array_keys($relic_no))));
                if(isset($relic['total']) && $relic['total'] > 0 ){
                    foreach($relic['rows'] as $r){
                        if(isset($r['parent_env_no']) && $r['parent_env_no']){
                            $relic_env_nos[$r['name']] = $r['parent_env_no'];
                        }
                    }
                }
            }
        }

        if(!$param){
            $param = "temperature";
        }

        $end_time = time();
        $start_time = $end_time - 24 * 3600;
	    $data_order = "equip_time";
	    if($time){
		    $time = explode(',',$time);
		    $end_time = isset($time[1])?strtotime($time[1]):time();
		    $start_time = isset($time[0])?strtotime($time[0]):$end_time - 24*3600;
	    }

	    $sql = "select equip_no,equip_time,server_time,env_no,".$param." from data_sensor where  ".$data_order." >= ".$start_time." and ".$data_order." <= ".$end_time;

	    $sql_env_nos = array_merge(array_keys($env_nos),array_values($relic_env_nos));
	    if($sql_env_nos){
		    $sql .= " and (env_no in ('".implode("','",$sql_env_nos)."')";
		    if($equip_nos){
			    $sql .= " or equip_no in ('".implode("','",array_keys($equip_nos))."')";
		    }
		    $sql .= ")";
	    }else if($equip_nos){
		    $sql .= " and equip_no in ('".implode("','",array_keys($equip_nos))."')";
	    }


        $datasensor = $this->db->query($sql)->result_array();

        $data = array();
        if($env_nos){
	        foreach($env_nos as $fl_no=>$fl_name){
		        $data[$fl_name] = array();
		        foreach($datasensor as $ds){
			        if(isset($ds['env_no']) &&$fl_no == $ds['env_no']){
				        if(isset($ds[$param]) && $ds[$param]){
					        $data[$fl_name][] = $ds[$param];
				        }
			        }
		        }
	        }
        }

        if($relic_env_nos){
	        foreach($relic_env_nos as $rl=>$ev){
		        $data[$rl] = array();
		        foreach($datasensor as $ds){
			        if(isset($ds['env_no']) &&$ev == $ds['env_no']){
				        if(isset($ds[$param]) && $ds[$param]){
					        $data[$rl][] = $ds[$param];
				        }
			        }
		        }
	        }
        }

	    if($equip_nos){
		    foreach($equip_nos as $no=>$name){
			    $data[$name] = array();
			    foreach($datasensor as $ds){
				    if(isset($ds['equip_no']) &&$no == $ds['equip_no']){
					    if(isset($ds[$param]) && $ds[$param]){
						    $data[$name][] = $ds[$param];
					    }
				    }
			    }
		    }
	    }

        $this->response($data);
    }

	/**
	 *特别关注
	 * 获取用户特别关注的文物或者微环境,并标注其环境状态
	 */
    function follows_get()
    {
        $rows = $this->get('rows');
        $no = $this->get('no');
        $type = $this->get('type');
        $param =  array();
        if($rows){
            $param['rows'] = $rows;
        }
	    if($no){
		    $param['no'] = $no;
	    }
	    if($type){
		    $param['type'] = $type;
	    }
        $follows = API('get/base/follows',$param);

        $env_nos = array();
        $relic_env_nos = array();
	    $images = array();
        if(isset($follows['total']) && $follows['total']>0){
            $relic_no =array();
            foreach($follows['rows'] as $fl){
                if(isset($fl['no'])){
                    if($fl['type'] == 'cabinet'){
                        $env_nos[] = $fl['no'];
                    }else{
                        $relic_no[] = $fl['no'];
                    }
                }
            }
            if($relic_no){
                $relic = API('get/relic/relics',array('relic_no'=>"".implode(',',$relic_no).""));
                if(isset($relic['total']) && $relic['total'] > 0 ){
                    foreach($relic['rows'] as $r){
                        if(isset($r['parent_env_no']) && $r['parent_env_no']){
                            $relic_env_nos[$r['relic_no']] = $r['parent_env_no'];
                        }
	                    if(isset($r['image']) && $r['image']){
		                    $images[$r['relic_no']] = $r['image'];
	                    }
                    }
                }
            }

	        if($env_nos){
		        $envs = API('get/base/envs',array('env_no'=>implode(",",$env_nos)));
		        if(isset($envs['total'])&&$envs['total']){
			        foreach($envs['rows'] as $env){
				        if(isset($env['env_no'])&&$env['env_no']){
					        if(isset($env['map'])){
								$images[$env['env_no']] = $env['map'];
					        }
				        }
			        }
		        }
	        }
        }

        $query_env_nos = array_merge($env_nos,array_values($relic_env_nos));

       if($query_env_nos){
           $alert = $this->db->select(array('env_no','relic_no'))->where_in('env_no',$query_env_nos)->where(array('clear_time'=>null))->get('alert')->result_array();
       }

        $alert_no = array();
        if(isset($alert)&&$alert){
            foreach($alert as $alt){
                if(isset($alt['env_no'])){
                    if(in_array($alt['env_no'],$env_nos)){
                        $alert_no[] = $alt['env_no'];
                    }else if(in_array($alt['env_no'],array_values($relic_env_nos))){
                        $no = array_search($alt['env_no'],$relic_env_nos);
                        if(!in_array($no,$alert_no)){
                            $alert_no[] = $no;
                        }
                    }
                }
            }
        }

        if(isset($follows['rows'])&&$follows['rows']){
            foreach($follows['rows'] as $key=>$follow){
	            if(isset($follow['no'])&&$follow['no']){
		            if(in_array($follow['no'],$alert_no)){
			            $follows['rows'][$key]['status'] = "异常";
		            }else{
			            $follows['rows'][$key]['status'] = "正常";
		            }
		            if(isset($images[$follow['no']])){
			            $follows['rows'][$key]['image'] = $images[$follow['no']];
		            }
	            }
            }
        }

        $this->response($follows);
    }

	/**
	 *文物展出状况
	 * 分级获取文物的数量,并标注其环境达标率
	 */
    function relics_status_get()
    {
        $relics = API('get/relic/relics');

        $data = array();
        $env_nos = array();
        $level_relics = array(
            "一级文物"=>array(),
            "二级文物"=>array(),
            "三级文物"=>array(),
            "其他文物"=>array()
        );
        $level_envs = array(
            "一级文物"=>array(),
            "二级文物"=>array(),
            "三级文物"=>array(),
            "其他文物"=>array()
        );
        $count = array();
        if(isset($relics['total']) && $relics['total']>0){
            foreach($relics['rows'] as $relic){

                if(isset($relic['level']) && $relic['level']){
                    $level = $relic['level'];
                    if($level == "一般文物" || $level == "未定级文物"){
                        $level = "其他文物";
                    }

                    if(isset($level_relics[$level])){
                        if(isset($relic['relic_no']) && $relic['relic_no']){
                            $level_relics[$level][] = $relic['relic_no'];
                        }
                    }else{
                        if(isset($relic['relic_no']) && $relic['relic_no']){
                            $level_relics[$level] = array($relic['relic_no']);
                        }
                    }

                    if(isset($level_envs[$level])){
                        if(isset($relic['parent_env_no']) && $relic['parent_env_no']){
                            if(!in_array($relic['parent_env_no'],$env_nos,true)){
                                $env_nos[] = $relic['parent_env_no'];
                            }
                           if(!in_array($relic['parent_env_no'],$level_envs[$level],true)){
                               $level_envs[$level][] = $relic['parent_env_no'];
                           }
                        }
                    }else{
                        if(isset($relic['parent_env_no']) && $relic['parent_env_no']){
                            if(!in_array($relic['parent_env_no'],$env_nos,true)){
                                $env_nos[] = $relic['parent_env_no'];
                            }
                            $level_envs[$level] = array($relic['parent_env_no']);
                        }
                    }

                    if(isset($count[$level])){
                        $count[$level]++;
                    }else{
                        $count[$level] = 1;
                    }
                }
            }
        }

        if($env_nos){
            $alerts = $this->db->select('env_no')->where(array('clear_time'=>null))->where_in('env_no',$env_nos)->distinct()->get('alert')->result_array();
        }
        $alert_env = array();
        if(isset($alerts)&&$alerts){
            foreach($alerts as $alert){
                if(isset($alert['env_no']) && $alert['env_no']){
                    foreach($level_envs as $lv => $val){
                        if(!isset($alert_env[$lv])){
                            $alert_env[$lv] = array();
                        }
                        if(in_array($alert['env_no'],$val,true)&&!in_array($alert['env_no'],$alert_env[$lv],true)){
                           $alert_env[$lv][] = $alert['env_no'];
                        }
                    }
                }
            }
        }

        foreach($level_relics as $lv=>$val){
            $data[$lv]['quantity'] = $val?count($val):0;
            $data[$lv]['rate'] = 100;
            if(isset($level_envs[$lv])){
                $count = sizeof($level_envs[$lv]);
                if($count){
                    if(isset($alert_env[$lv])){
                        $data[$lv]['rate'] = 100 - round(sizeof($alert_env[$lv])/$count * 100,2);
                    }
                }
            }

        }

//        $this->response(array($level_envs,$alert_env));
        $this->response($data);
    }

	/**
	*获取24小时内的各个展厅温湿度极值及其微环境的达标率
	 **/
    function env_poles_get()
    {
        $envs = API('get/base/envs',array('type'=>"展厅,展柜"));

        $env_nos = array();
        $env_show = array();
        $env_children = array();
        $env_name = array();
        if($envs['total']>0){
            foreach($envs['rows'] as $env){
                if(isset($env['type']) && $env['type'] == "展厅"){
                    if(isset($env['env_no']) && $env['env_no']){
                        if(!in_array($env['env_no'],$env_nos)){
                            $env_nos[] = $env['env_no'];
                        }
                    }
                }else{
                    if(isset($env['parent_env_no']) && $env['parent_env_no']){
                        if(isset($env_children[$env['parent_env_no']])){
                            $env_children[$env['parent_env_no']][] = $env['env_no'];
                        }else{
                            $env_children[$env['parent_env_no']] = array($env['env_no']);
                        }
                    }

                    $env_show[] = $env['env_no'];
                }

                $env_name[$env['env_no']] = $env['name'];
            }
        }

        $now = time();

        $end_time = $now;
        $start_time = $end_time - 24* 3600;

	    $data_order = "equip_time";
        if($env_nos){
            $data_sensor = $this->db->select(array('equip_time','server_time','temperature','humidity','env_no'))
                ->where_in('env_no',$env_nos) ->where($data_order.'> '.$start_time.' and '.$data_order.' <='.$end_time)
                ->get('data_sensor')->result_array();
        }

        $deal_data = array();
        if(isset($data_sensor)&&$data_sensor){
            foreach($data_sensor as $ds){
                if(isset($ds['env_no']) && $ds['env_no']){
                    $env_no = $ds['env_no'];
                    if(!isset($deal_data[$env_no])){
                        $deal_data[$env_no] = array(
                            'humidity'=>array(),
                            'temperature'=>array()
                        );
                    }

                    if(isset($ds['temperature']) &&$ds['temperature']){
                        $deal_data[$env_no]['temperature'][] = $ds['temperature'];
                    }

                    if(isset($ds['humidity']) &&$ds['humidity']){
                        $deal_data[$env_no]['humidity'][] = $ds['humidity'];
                    }
                }
            }
        }

        if($env_show){
            $alerts = $this->db->select('env_no')->where(array('clear_time'=>null))->where_in('env_no',$env_show)->distinct()->get('alert')->result_array();
        }
        $alert_env = array();
        if(isset($alerts)&&$alerts){
            foreach($alerts as $alt){
                if(isset($alt['env_no']) && $alt['env_no']){
                    $alert_env[] = $alt['env_no'];
                }
            }
        }

        $sr_rate = array();
        if($alert_env){
            foreach($env_children as $no=>$val){
                if($val){
                    $alt_count = count(array_intersect($val,$alert_env));
                    $children_count = count($val);
                    $sr_rate[$no] = 100 - round($alt_count/$children_count * 100,2);
                }
            }
        }

        $data = array();

        foreach($env_nos as $no){
            $data[$no]['env_no'] = $no;

            if($env_name){
                if(isset($env_name[$no])){
                    $data[$no]['name'] = $env_name[$no];
                }
            }

            if($sr_rate){
                if(isset($sr_rate[$no])){
                    $data[$no]['rate'] = $sr_rate[$no];
                }
            }

            if($deal_data){
                if(isset($deal_data[$no])){
                    if($deal_data[$no]['temperature']){
                        $data[$no]['temperature_min'] = deal_data_decimal('temperature',min($deal_data[$no]['temperature']));
                        $data[$no]['temperature_max'] = deal_data_decimal('temperature',max($deal_data[$no]['temperature']));
                    }

                    if($deal_data[$no]['humidity']){
                        $data[$no]['humidity_min'] = deal_data_decimal('humidity',min($deal_data[$no]['humidity']));
                        $data[$no]['humidity_max'] = deal_data_decimal('humidity',max($deal_data[$no]['humidity']));
                    }
                }
            }
        }

        $this->response($data);

    }

	/**
	*获取24小时内的整个博物馆的温湿度极值及其均值
	 **/
    function env_averages_get($param = null)
    {
	    $time = $this->get_post("time");
        if(!$param){
            $param = 'temperature';
        }

        $end_time = time() ;
        $start_time = $end_time - 24 * 3600;

	    if($time){
		    $time = explode(',',$time);
		    $end_time = isset($time[1])?strtotime($time[1]):time();
		    $start_time = isset($time[0])?strtotime($time[0]):$end_time - 24*3600;
	    }

        $time_len = 7200;
        $data = array(
            'time'=>array(),
            'average'=>array(),
            'min'=>array(),
            'max'=>array()
        );

	    $data_order = "equip_time";

	    $count = (int)(($end_time - $start_time)/$time_len)+1;
        for($i = 0;$i < $count;$i++){
            $low_time = $start_time - $start_time%3600 + $i * $time_len;
            $high_time = $low_time + $time_len;

            $sql= "select avg(".$param.") as average,min(".$param.") as min,max(".$param.") as max from data_sensor where ".$data_order." >= ".$low_time." and ".$data_order." <".$high_time;
            $sql_data = $this->db->query($sql)->row_array();
            $data['time'][] = date("Y-m-d H:i",$low_time);
            if($sql_data){
                $data['average'][] = deal_data_decimal($param,$sql_data['average']);
                $data['min'][] = deal_data_decimal($param,$sql_data['min']);
                $data['max'][] = deal_data_decimal($param,$sql_data['max']);
            }
        }

        $this->response($data);
    }

	/**
	 * 区域湿度稳定性
	 *获取24小时内的整个博物馆及其小环境的湿度稳定性
	 **/
    function env_stabilities_get()
    {
        $hall = API('get/base/envs',array('type'=>"展厅"));

        $hall_nos = array();
        if($hall['total'] > 0){
            foreach($hall['rows'] as $h){
                if(isset($h['env_no']) && $h['env_no']){
                    $hall_nos[$h['env_no']] = $h['name'];
                }
            }
        }

        $end_time = time();
        $start_time = $end_time - 24 * 3600;

	    $data_order = "equip_time";

        if($hall_nos){
            $data_sensor = $this->db->select(array('humidity','env_no'))->where_in('env_no',array_keys($hall_nos))
                ->where($data_order.' > '.$start_time.' and '.$data_order.' <='.$end_time)
                ->get('data_sensor')->result_array();
        }

        $museum_hum = array();
        $hall_hum = array();

        if(isset($data_sensor)&&$data_sensor){
            foreach($data_sensor as $ds){
                if($ds['humidity']){
                    $museum_hum[] = $ds['humidity'];
                    if(isset($ds['env_no'])&& $ds['env_no']){
                       if(in_array($ds['env_no'],array_keys($hall_nos))){
                           if(isset($hall_hum[$ds['env_no']])){
                               $hall_hum[$ds['env_no']][] = $ds['humidity'];
                           }else{
                               $hall_hum[$ds['env_no']] = array($ds['humidity']);
                           }
                       }
                    }
                }
            }
        }

	    $env = M('env');
	    $data = array(
		    'env_no'=>'museum',
		    'name'=>'本馆',
		    'SD'=>0,
		    'hall'=>array()
	    );
	    if($museum_hum){
		    $data['SD'] = $env->get_standard_deviation($museum_hum);
	    }

        if($hall_hum){
            foreach($hall_hum as $no=>$hh){
                $data['hall'][] = array(
                    'env_no'=>$no,
                    'name'=>$hall_nos[$no],
                    'SD'=>$env->get_standard_deviation($hh)
                );
            }
        }

        arsort($data);

        $this->response($data);
    }
}
