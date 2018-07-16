<?php
class Cabinet extends MY_Controller{

    public function __construct(){
        parent::__construct();

        $parameters = M("equipments/equip")->get_parameters('sensor');
        $this->sensor_parameters = array();
        foreach($parameters as $parameter){
            $this->sensor_parameters[$parameter['param']] = $parameter['name'];
        }
    }

	function index_get_nologin(){
		$m=M("equipments/equip");

        $env = M('env');
        $this->response(array($this->sensor_parameters));

	}

	/**
	 * 展柜，概况--柜体概况
	 * 获取展柜的基本信息，图片默认为缩略图（70*70），获取展柜“尺寸、体积”信息
	 * @env_no 展柜编号
	 */
    function size_get($env_no){
        $env = API('get/base/envs/info/'.$env_no);

        $data = array();
        if($env){
            $data['env_no'] = $env['env_no'];
            $data['size'] = $env['size'];
            $data['volume'] = $env['volume'];
        }
        $this->response($data);
    }

	/**
	 * 展柜，概况--环境要求
	 * 获取展柜的环境要求，读取该展柜的阈值信息，若没有温湿度的，则图表与阈值都不显示；
	 * @env_no 展柜编号
	 */
    function threshold_get($env_no){

        $threshold = M('threshold')->find(array('no'=>$env_no));

        $sensor_parameters =  M('equipments/equip')->get_parameters('sensor');

        $data = array();
        foreach($sensor_parameters as $val){
            $param = $val['param'];

            $min = '';
            $max = '';
            if(isset($threshold[$param."_min"])){
                $min = $threshold[$param."_min"];
            }

            if(isset($threshold[$param."_max"])){
                $max = $threshold[$param."_max"];
            }

            if($min || $max){
                $data[$param] = $min."~".$max.$val['unit'];
            }
        }

        $this->response($data);
    }

	/**
	 * 展柜，柜内文物
	 * 读取该展柜当前存放的【文物基本信息】，同时只显示文物的【名称】(排序规则为：文物等级，名称）
	 * @env_no 展柜编号
	 */
    function relics_get($env_no){
        $relics = array(
            'total'=>0,
            'rows'=>array()
        );
        if(isset($env_no)&&$env_no&&$env_no != 'null'){
            $relics = API('get/relic/relics',array('parent_env_no'=>$env_no,'include_child'=>1));
        }

        $this->response($relics);
    }

	/**
	 * 展柜，环境监控，达标率--仪表
	 * 获取当前展柜，在所选时间段内的数据达标率
	 * @env_no 展柜编号
	 * @time   时间段
	 */
    function standard_get($env_no)
    {
        $time = $this->get_post('time');
        if($time){
            switch($time){
                case '24h':
                    $e_time = time();
                    $s_time = $e_time - 24 * 3600;
                    break;
                case 'today':
                    $s_time = strtotime('today');
                    $e_time = time();
                    break;
                case 'yesterday':
                    $s_time = strtotime('yesterday');
                    $e_time = $s_time + 24*3600;
                    break;
                case 'week':
                    $today = date("Y-m-d");
                    $week = date('w',strtotime($today));
                    $s_time = strtotime($today ."-".($week ? $week - 1 : 6).' days');
                    $e_time = time();
                    break;
                case 'month':
                    $e_time = time();
	                $s_time = mktime(0,0,0,date("m"),1,date("Y"));
                    break;
                default:
                    $time_array = explode(',',$time);
                    $s_time = isset($time_array[0])?$time_array[0]:time()-24*3600;
                    $e_time = isset($time_array[1])?$time_array[1]:time();
                    break;
            }
        }else{
            $e_time = time();
            $s_time = $e_time - 24 * 3600;
        }
        $equip_types = equip_type('type');
        $sensor = array('温湿度监测终端','带屏温湿度监测终端','有机挥发物监测终端','光照紫外监测终端','二氧化碳监测终端','空气质量监测终端','土壤温湿度监测终端','安防监测终端','震动监测终端');
        if(isset($equip_types['监测终端'])){
            $sensor = $equip_types['监测终端'];
        }

        $equips = $this->db->select('parameter,equip_no,env_no')->where("env_no = '".$env_no."'")
//            ->where_in('equip_type',$sensor)
            ->get('equip')->result_array();

        $param_count =array();
        if($equips){
           foreach($equips as $equip){
               if($equip['equip_no']){
                   if($equip['parameter']){
                       $param_count[$equip['equip_no']] = sizeof(explode(',',$equip['parameter']));
                   }
               }
           }
        }
	    $data_order = "equip_time";
        $sql = "select equip_no,alert_param from data_sensor where env_no = '".$env_no."' and ".
            $data_order." < ".$e_time ." and ".$data_order." >= ".$s_time.
            " order by ".$data_order." desc";
        $data_sensor = $this->db->query($sql)->result_array();

        $sum =0;
	    $alert_count = 0;
        if($data_sensor){
            foreach($data_sensor as $ds){
                if(isset($ds['equip_no'])&&$ds['equip_no']){
	                if(!isset($param_count[$ds['equip_no']])){
                        $equip = M("equip")->fetOne("equip_no = '".$ds['equip_no']."'","parameter");
                        if(isset($equip['parameter'])&&$equip['parameter']){
                            $param_count[$ds['equip_no']] = sizeof(explode(',',$equip['parameter']));
                        }
                       if(isset($param_count[$ds['equip_no']])){
                           $sum += $param_count[$ds['equip_no']];
                       }
                    }else{
                        if(isset($param_count[$ds['equip_no']])){
                            $sum += $param_count[$ds['equip_no']];
                        }
                    }
	                if(isset($ds['alert_param'])&&$ds['alert_param']){
		                $alert_param = explode(',',$ds['alert_param']);
		                $alert_count += sizeof($alert_param);
	                }
                }
            }
        }
        $result = array();
        $result['env_no'] = $env_no;
        $result['rate'] = 100;
        if($sum&&$sum != 0){
           if($alert_count){
               $result['rate'] = round(($sum - $alert_count)/$sum * 100 ,2);
           }
        }

        $this->response($result);
    }

	/**
	 * 展柜，环境监控，达标率--雷达图
	 * 获取当前展柜，在所选时间段内的各监测参数达标率
	 * @env_no 展柜编号
	 * @time   时间段
	 */
    function param_standard_get($env_no,$time=null)
    {
        $time = $this->get_post('time');
        if($time){
            switch($time){
                case '24h':
                    $e_time = time();
                    $s_time = $e_time - 24 * 3600;
                    break;
                case 'today':
                    $s_time = strtotime('today');
                    $e_time = time();
                    break;
                case 'yesterday':
                    $s_time = strtotime('yesterday');
                    $e_time = $s_time + 24*3600;
                    break;
                case 'week':
                    $today = date("Y-m-d");
                    $week = date('w',strtotime($today));
                    $s_time = strtotime($today ."-".($week ? $week - 1 : 6).' days');
                    $e_time = time();
                    break;
                case 'month':
                    $e_time = time();
                    $s_time =  mktime(0,0,0,date("m"),1,date("Y"));
                    break;
                default:
                    $time_array = explode(',',$time);
                    $s_time = isset($time_array[0])?$time_array[0]:time()-24*3600;
                    $e_time = isset($time_array[1])?$time_array[1]:time();
                    break;
            }
        }else{
            $e_time = time();
            $s_time = $e_time - 24 * 3600;
        }

	    $data_order = "equip_time";
        $ds_query = "select * from data_sensor where env_no = '".$env_no."' and ".$data_order." >= ".$s_time ." and ".$data_order." < ".$e_time;
        $data_sensor = $this->db->query($ds_query)->result_array();

        $params = array("co2","temperature","humidity","organic","inorganic","sulfur");
        $count = array();
	    $alert_count = array();
        foreach($params as $param){
            $count[$param] = 0;
	        $alert_count[$param] = 0;
            if($data_sensor){
                foreach($data_sensor as $ds){
                    if(isset($ds[$param])&& $ds[$param]){
                        $count[$param]++;
                    }

	                if(isset($ds['alert_param'])&&$ds['alert_param']){
		                $alert_param = explode(',',$ds['alert_param']);
		                if(in_array($param,$alert_param)){
			                $alert_count[$param]++;
		                }
	                }
                }
            }
        }

        $result = array();
        foreach($count as $p=>$v){
            $result[$p] = 100 ;
            if(isset($alert_count[$p]) && $alert_count[$p]){
                $result[$p] -= round($alert_count[$p]/$v * 100,2);
            }
        }

        $this->response($result);
    }

	/**
	 * 展柜，环境监控，温湿度稳定性
	 * 获取当前展柜，在所选时间段内的温湿度稳定性
	 * @env_no 展柜编号
	 * @time   时间段
	 */
    function stable_get($env_no,$time=null)
    {
        $time = $this->get_post('time');
        if($time){
            switch($time){
                case '24h':
                    $e_time = time();
                    $s_time = $e_time - 24 * 3600;
                    break;
                case 'today':
                    $s_time = strtotime('today');
                    $e_time = time();
                    break;
                case 'yesterday':
                    $s_time = strtotime('yesterday');
                    $e_time = $s_time + 24*3600;
                    break;
                case 'week':
                    $today = date("Y-m-d");
                    $week = date('w',strtotime($today));
                    $s_time = strtotime($today ."-".($week ? $week - 1 : 6).' days');
                    $e_time = time();
                    break;
                case 'month':
                    $e_time = time();
                    $s_time =  mktime(0,0,0,date("m"),1,date("Y"));
                    break;
                default:
                    $time_array = explode(',',$time);
                    $s_time = isset($time_array[0])?$time_array[0]:time()-24*3600;
                    $e_time = isset($time_array[1])?$time_array[1]:time();
                    break;
            }
        }else{
            $e_time = time();
            $s_time = $e_time - 24 * 3600;
        }
	    $data_order = "equip_time";
        $sql = "select temperature,humidity from data_sensor where env_no = '".$env_no."' and ".
            $data_order." >= ".$s_time." and ".$data_order." < ".$e_time;
        $data_sensor = $this->db->query($sql)->result_array();

        $p_data = array(
            'temperature'=>array(),
            'humidity'=>array()
        );

        foreach($data_sensor as $ds){
            if($ds['temperature']){
                $p_data['temperature'][] = $ds['temperature'];
            }

            if($ds['humidity']){
                $p_data['humidity'][] = $ds['humidity'];
            }
        }

        $result = array();
        $env_model = M('env');
        foreach($p_data as $p=>$v){
            $result[$p] = $env_model->get_standard_deviation($v);
        }

        $this->response($result);
    }

	/**
	 * 展柜，环境监控，参数选择器/最新数据
	 * 获取当前展柜的可选参数及其最新数据
	 * @env_no 展柜编号
	 */
    function new_data_get($env_no)
    {
	    $data_order = "equip_time";
        $data_sensor = $this->db->select('*')->where("env_no = '".$env_no."'")
            ->limit(50)->order_by($data_order.' desc')
            ->get('data_sensor')->result_array();

        $result = array();

        $m=M("equipments/equip");
        $sensor_parameters = $m->get_parameters('sensor');

        if($data_sensor){
            $data_sensor = array_reverse($data_sensor);
            foreach($sensor_parameters as $sp){
                $param = $sp['param'];
                foreach($data_sensor as $ds){
                    if(isset($ds[$param])&& $ds[$param] != ""&& $ds[$param] != "NaN"&& $ds[$param] != null){
                        $result[$param] = array(
                            'value'=>deal_data_decimal($param,$ds[$param]),
                            'unit'=>$sp['unit'],
                            'name'=>$sp['name'],
                            'time'=>date("Y-m-d H:i",$ds[$data_order])
                        );
                    }
                }
            }
        }

        $this->response($result);
    }

	/**
	 * 展柜，环境监控，曲线
	 * 获取当前展柜，在所选时间段内，所选的参数曲线
	 * @env_no 展柜编号
	 * @time   时间段
	 */
    function param_lines_get($env_no)
    {
        $param = $this->get('param');
        $time=$this->get_post('time');
        $relic_no = $this->get('relic_no');
        if($time){
            switch($time){
                case '24h':
                    $e_time = time();
                    $s_time = $e_time - 24 * 3600;
                    break;
                case 'today':
                    $s_time = strtotime('today');
                    $e_time = time();
                    break;
                case 'yesterday':
                    $s_time = strtotime('yesterday');
                    $e_time = $s_time + 24*3600;
                    break;
                case 'week':
                    $today = date("Y-m-d");
                    $week = date('w',strtotime($today));
                    $s_time = strtotime($today ."-".($week ? $week - 1 : 6).' days');
                    $e_time = time();
                    break;
                case 'month':
                    $e_time = time();
                    $s_time =  mktime(0,0,0,date("m"),1,date("Y"));
                    break;
                default:
                    $time_array = explode(',',$time);
                    $s_time = isset($time_array[0])?$time_array[0]:time() - 24*2600;
                    $e_time = isset($time_array[1])?$time_array[1]:time();
                    break;
            }
        }else{
            $e_time = time();
            $s_time = $e_time - 24 * 3600;
        }
        $params = $param?explode(',',$param):array(
            "temperature",
            "humidity",
            "voc",
            "co2",
            "light",
            "uv",
            "organic",
            "inorganic",
            "sulfur"
        );
        $parameters = M("equipments/equip")->get_parameters('sensor');
        $parameter = array();
        if($parameters){
            foreach($parameters as $ps){
                $parameter[$ps['param']] = $ps;
            }
        }
	    $data_order = "equip_time";
        $select = $params;
        $sql = "select equip_time,server_time,".implode(',',$select)." from data_sensor where env_no = '".$env_no."' and ".
            $data_order." < ".$e_time ." and ".$data_order." >= ".$s_time.
            " order by ".$data_order." desc";
        $data_sensor = $this->db->query($sql)->result_array();


        if(isset($relic_no)&&$relic_no){
            $threshold = M("threshold")->find("no = '".$relic_no."'");
        }
        if(!isset($threshold)||!$threshold){
            $threshold = M("threshold")->find("no = '".$env_no."'");
        }
        $time_len = 600;
        $result = array();
        $data = array();
        foreach($params as $p){
            $pdata = array();
            $min_max = array();
            if($data_sensor){
                $deal_time = $data_sensor[0][$data_order];
                foreach($data_sensor as $ds){
                    $dt = $deal_time - floor(($deal_time - $ds[$data_order])/$time_len)*$time_len; //时间段
                    if(isset($ds[$p])&& $ds[$p] != ""&&$ds[$p] != null&&$ds[$p] != "NaN"){
                        if(isset($pdata[$dt])){
                            array_push($pdata[$dt], deal_data_decimal($p,$ds[$p]));  //一个时间段可能有几个值
                        }else{
                            $pdata[$dt] = array(deal_data_decimal($p,$ds[$p]));
                        }
                        $min_max[] = deal_data_decimal($p,$ds[$p]);
                    }
                }
                ksort($pdata);
                if($pdata){
                    $comp_data = array(min($min_max),max($min_max));
                    foreach($pdata as $t=>$v){
                        $data[$p]['average'][] = array($t*1000,round(array_sum($v)/sizeof($v),2));
                        $data[$p]['min'][] = array($t*1000,min($v));
                        $data[$p]['max'][] = array($t*1000,max($v));
                    }

                    if($threshold){
                        if(isset($threshold[$p.'_min'])){
                            if($threshold[$p.'_min'] != "" && $threshold[$p.'_min'] != null){
                                $result[$p]['threshold']['min'] =deal_data_decimal($p,$threshold[$p.'_min']) ;
                                $data[$p]['threshold']['min'] = deal_data_decimal($p,$threshold[$p.'_min']);
                                $comp_data[] = deal_data_decimal($p,$threshold[$p.'_min']* 0.95);
                            }else{
                                $comp_data[] = 0;
                            }
                        }

                        if(isset($threshold[$p.'_max'])){
                            if($threshold[$p.'_max'] != "" && $threshold[$p.'_max'] != null){
                                $result[$p]['threshold']['max'] = deal_data_decimal($p,$threshold[$p.'_max']);
                                $data[$p]['threshold']['max'] = deal_data_decimal($p,$threshold[$p.'_max']);
                                $comp_data[] =  deal_data_decimal($p,$threshold[$p.'_max'] * 1.05);
                            }else{
                                $comp_data[] = 0;
                            }

                        }
                    }

                    if($comp_data){
                        $data[$p]['range'] = array('min'=>min($comp_data),'max'=>max($comp_data));
                    }
                    if(isset($parameter[$p])){
                        $data[$p]['unit'] = $parameter[$p]['unit'];
                        $data[$p]['name'] = $parameter[$p]['name'];
                    }
                }
            }

        }

        $this->response($data);
    }

	/**
	 * 展柜，环境监控，设备列表
	 * 获取当前展柜的监测、调控设备列表及其最新数据
	 * @env_no 展柜编号
	 * @type   设备类型
	 **/
    function equip_lists_get($env_no,$type=null)
    {
        $equip_type = array();
        if(!$type){
            $type = "sensor";
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

	    if($type === "sensor"){
		    $equip_type = $sensor;
	    }else if($type === "controller"){
		    $equip_type = $controller;
	    }

	    if($equip_type){
		    $this->db->where_in('equip_type',$equip_type);
	    }
        $sensors = $this->db->where("env_no = '".$env_no."'")->get('equip')->result_array();
        $result = array(
            'total'=>0,
            'rows'=>array()
        );

	    $data_order = "equip_time";
        if($sensors){
            $ds = M('data_sensor');
            if($type === "sensor"){
                $param = "equip_no,env_no,humidity,temperature,voc,co2,uv,light,organic,inorganic,sulfur,canbi,equip_time,server_time,ip_port,php_time";
                foreach($sensors as $ss){
	                $data = array();

                    $data = $ds->find("equip_no = '".$ss['equip_no']."' and ".$data_order." <= ".time(),$param,$data_order.' desc');
                    if($data){
	                    if(isset($data['equip_time'])&&$data['equip_time']){
		                    $data['equip_time'] =date("Y-m-d H:i",$data['equip_time']);
	                    }
	                    if(isset($data['server_time'])&&$data['server_time']){
		                    $data['server_time'] =date("Y-m-d H:i",$data['server_time']);
	                    }
	                    if(isset($data['php_time'])&&$data['php_time']){
		                    $data['php_time'] =date("Y-m-d H:i",$data['php_time']);
	                    }

                    }
	                if(!isset($data['equip_no'])){
		                $data['equip_no'] = $ss['equip_no'];
	                }
	                if(isset( $ss['name'])){
		                $data['name'] = $ss['name'];
	                }
	                if(isset($ss['status'])){
		                $data['status'] = $ss['status'];
	                }
	                if(isset($ss['usage'])){
		                $data['usage'] = $ss['usage'];
	                }

	                $param_array = array();
	                if(isset($ss['parameter'])&&$ss['parameter']){
		                $ps = explode(',',$ss['parameter']);
		                if($ps){
			                foreach($ps as $p){
				                if(isset($this->sensor_parameters[$p])&&$this->sensor_parameters[$p]){
					                $param_array[] =  $this->sensor_parameters[$p];
				                }
			                }
		                }
	                }
	                $data['param'] = implode(',',$param_array);
	                if(isset($ss['equip_type'])){
		                $data['equip_type'] = $ss['equip_type'];
	                }

	                $result['total']++;
	                $result['rows'][] = $data;
                }
            }else if($type === "controller"){
                $param = "equip_no,env_no,humidity,equip_time,server_time,ip_port,php_time";
                foreach($sensors as $ss){

	                $data = array();
                    if(isset($ss['monitor_type']) &&$ss['monitor_type'] == "被动调控"){
	                    if(isset($ss['env_no']) && $ss['env_no']){
		                    $data = $ds->find("env_no = '".$ss['env_no']."' and ".$data_order." <= ".time(),$param,$data_order.' desc');
	                    }
                    }else{
	                    $data = $ds->find("equip_no = '".$ss['equip_no']."' and ".$data_order." <= ".time(),$param,$data_order.' desc');
                    }
	                if($data){
		                $record = M("control_record")->find("equip_no = '".$ss['equip_no']."'","*","control_time desc");
		                if($record){
			                if(isset($record['target']) && $record['target']){
				                $data['target'] = $record['target'];
			                }

			                if(isset($record['replace_time'])){
				                $data['replace_time'] = $record['replace_time']?date("Y-m-d",$record['replace_time']):"";
			                }
		                }

		                if(isset($data['equip_time'])&&$data['equip_time']){
			                $data['equip_time'] = date("Y-m-d H:i",(int)$data['equip_time']);
		                }
		                if(isset($data['server_time'])&&$data['server_time']){
			                $data['server_time'] =date("Y-m-d H:i",(int)$data['server_time']);
		                }
		                if(isset($data['php_time'])&&$data['php_time']){
			                $data['php_time'] =date("Y-m-d H:i",(int)$data['php_time']);
		                }
	                }
	                if(!isset($data['equip_no'])){
		                $data['equip_no'] = $ss['equip_no'];
	                }
	                if(isset( $ss['name'])){
		                $data['name'] = $ss['name'];
	                }
	                if(isset($ss['status'])){
		                $data['status'] = $ss['status'];
	                }
					if(isset($ss['usage'])){
						$data['usage'] = $ss['usage'];
					}

	                $param_array = array();
	                if(isset($ss['parameter'])&& $ss['parameter']){
		                $ps = explode(',',$ss['parameter']);
		                if($ps){
			                foreach($ps as $p){
				                $param_array[] =  $this->sensor_parameters[$p];
			                }
		                }
	                }
	                $data['param'] = implode(',',$param_array);
	               if(isset($ss['equip_type'])){
		               $data['equip_type'] = $ss['equip_type'];
	               }

	                $result['total']++;
	                $result['rows'][] = $data;
                }
            }
        }

        $this->response($result);
    }

	/**
	 * 展柜，展柜概况--柜内设备
	 * 获取当前展柜的设备并分类
	 * @env_no 展柜编号
	 **/
    function equips_get($env_no)
    {
        $result = array(
            'sensor'=>array(
                'total'=>0,
                'rows'=>array()
            ),
            'controller'=>array(
                'total'=>0,
                'rows'=>array()
            ),
            'network'=>array(
                'total'=>0,
                'rows'=>array()
            ),
            'offline'=>array(
                'total'=>0,
                'rows'=>array()
            )
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
        $offline = array('手持式温湿度检测仪','手持式光照紫外检测仪','手持式有机挥发物检测仪','手持式二氧化碳检测仪','手持式甲醛检测仪');
        if(isset($equip_types['手持离线设备'])){
            $offline = $equip_types['手持离线设备'];
        }
//        $box = array('智能囊匣');
//        if(isset($equip_types['智能囊匣'])){
//            $box = $equip_types['智能囊匣'];
//        }
        $network = array('网关','中继');
        if(isset($equip_types['网络设备'])){
            $network = $equip_types['网络设备'];
        }
        if($env_no){
            $equips = $this->db->select("equip_no,env_no,equip_type,name")->where("env_no = '".$env_no."' and status != '停用'")->get('equip')->result_array();
            if($equips){
                $result['total'] = sizeof($equips);

                foreach($equips as $equip){
                    if(isset($equip['equip_type']) && $equip['equip_type']){
                        if(in_array($equip['equip_type'],$sensor)){
                            $result['sensor']['total']++;
                            $equip['type'] = 'sensor';
                            $result['sensor']['rows'][] = $equip;
                        }else if(in_array($equip['equip_type'],$controller)){
                            $result['controller']['total']++;
                            $equip['type'] = 'controller';
                            $result['controller']['rows'][] = $equip;
                        }else if(in_array($equip['equip_type'],$network)){
                            $result['network']['total']++;
                            $equip['type'] = 'network';
                            $result['network']['rows'][] = $equip;
                        }else if(in_array($equip['equip_type'],$offline)){
                            $result['offline']['total']++;
                            $equip['type'] = 'offline';
                            $result['offline']['rows'][] = $equip;
                        }
                    }
                }
            }
        }

        $this->response($result);
    }
}
