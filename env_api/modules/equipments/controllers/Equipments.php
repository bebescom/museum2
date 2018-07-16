<?php

class Equipments extends MY_Controller
{

	function __construct(){
		parent::__construct();
		$this->order_time = "equip_time";
	}
    function index_get()
    {
        $type = $this->get('type');
        $equip_no = $this->get('equip_no');
        $env_no = $this->get('env_no');
        $status = $this->get('status');
        $usage = $this->get('usage');
        $monitor_type = $this->get('monitor_type');

        if(isset($type) && $type){
            $types = explode(',',$type);
           if($types){
               $this->db->where_in('equip_type',$types);
           }
        }

        if(isset($equip_no) && $equip_no){
            $equip_nos = explode(',',$equip_no);
            $this->db->where_in('equip_no',$equip_nos);
        }

        if(isset($env_no) && $env_no){
            $env_nos = explode(',',$env_no);
            $this->db->where_in('env_no',$env_nos);
        }

        if(isset($status) && $status){
            $this->db->where('status = '.$status);
        }

        if(isset($usage) && $usage){
            $usages = explode(',',$usage);
            $this->db->where_in('usage',$usages);
        }

        if(isset($monitor_type) && $monitor_type){
            $monitor_types = explode(',',$monitor_type);
            $this->db->where_in('monitor_type',$monitor_types);
        }

        $equips = $this->db->get('equip')->result_array();
        $result = array(
            'total'=>sizeof($equips),
            'rows'=>$equips
        );
        $this->response($result);
    }

    function equip_one_get($equip_no)
    {
        $e = M('equip');
        $equip = $e->find(array('equip_no'=>$equip_no));
        $this->response($equip);
    }

    /**
    *根据$where条件和$select查找
     * @param $select string 返回字段
     * @param $where string 查询条件
     */
    function equip_where_get()
    {
        $select = $this->get_post("select");
        if(!isset($select) || !$select){
            $select = "*";
        }

        $where= $this->get_post("where");
        if(!isset($where) || !$where){
            $where = "1=1";
        }
        $sql = "select {$select} from equip where {$where}";
        $equips = $this->db->query($sql)->result_array();
        $this->response($equips);
    }

    function equip_lists_get()
    {
        $type = $this->get('type');
        $equip_type = $this->get('$equip_type');
        $equip_no = $this->get('equip_no');
        $env_no = $this->get('env_no');
        $status = $this->get('status');
        $usage = $this->get('usage');
        $page = $this->get('page');
        $monitor_type = $this->get('monitor_type');

        $all_type = array(
            'sensor' => array('温湿度监测终端','带屏温湿度监测终端','有机挥发物监测终端','二氧化碳监测终端','光照紫外监测终端','空气质量监测终端',"土壤温湿度监测终端","智能囊匣","智能展柜","震动监测终端"),
            'controller'=> array('调湿机','调湿剂',"充氮调湿柜"),
            'network'=> array('中继','网关',"AP"),
            'offline'=> array('手持式温湿度检测仪','手持式二氧化碳检测仪','手持式光照紫外检测仪','手持式有机挥发物检测仪',"手持式甲醛检测仪"),
            'weather'=>array('气象站')
        );

        $result = array(
            'total'=>0,
            'rows'=>array()
        );
        if(isset($this->_user['data_scope'])&&$this->_user['data_scope']){
            $where = "1=1";

            if(isset($env_no)&&$env_no){
                $env_nos = M("common/common")->get_all_children($env_no);
                if($this->_user['data_scope'] != 'administrator'){
                    $env_nos = array_intersect($env_nos,$this->_user['data_scope']);
                }
            }else{
                $env_nos = $this->_user['data_scope'];
            }
            if($env_nos != "administrator"){
                if(!isset($env_nos)||empty($env_nos)){
                    $this->response($result);
                }else{
                    if(!isset($env_no)||!$env_no){
                        $where .= " and (env_no in ('".implode("','",$env_nos)."') or env_no is null or env_no = '')";
                    }else{
                        $where .= " and env_no in ('".implode("','",$env_nos)."')";
                    }
                }
            }

            if(isset($name)&&$name){
                $where .= " and name like '%".$name."%'";
            }
            if(isset($equip_no)&&$equip_no){
                $where .= " and equip_no = '".$equip_no."'";
            }

            if($type){
                if(isset($all_type[$type])){
                    $where .= " and equip_type in ('".implode("','",$all_type[$type])."')";
                }
            }

            if(isset($equip_type)&&$equip_type){
                $where .= " and equip_type in ('".implode("','",explode(",",$equip_type))."')";
            }


            if(isset($status)&&$status){
                $where .= " and status in ('".implode("','",explode(",",$status))."')";
            }

            if(isset($id)&&$id){
                $where .= " and (equip_no like '%".$id."%' or name like '%".$id."%')";
            }
            if(isset($parameter)&&$parameter){
                $where .= " and parameter like '%".$parameter."%'";
            }
//			$this->response($where);
            $sql = "select * from equip where {$where} order by field(`status`,'异常','超低电','超标','低电','正常','备用','停用')";
            $equips = $this->db->query($sql)->result_array();
            $result = array(
                'total'=>sizeof($equips),
                'rows'=>$equips
            );
        }

        $this->response($result);
    }


    function overviews_get($equip_no)
    {
        $equip = M('equip')->find("equip_no = '".$equip_no."'","equip_no,equip_type,sleep,status,parameter,usage,env_no,name");
        $params = array();

	    $data_order = $this->order_time;
        if($equip){
            $parameters = "rssi,voltage";
            if(isset($equip['parameter'])&& $equip['parameter']){
                $parameters .= ','.$equip['parameter'];
                $params = explode(',',$equip['parameter']);
            }
            if(isset($equip['equip_no'])&& $equip['equip_no']){
                $data_sensor = M('data_sensor')->find("equip_no = '".$equip_no."' and ".$data_order." <= ".time() ,$parameters,$data_order." desc");

                if($data_sensor){
                    $equip = array_merge($equip,$data_sensor);
                }
            }
        }

        $this->response($equip);
    }

    function data_lists_get($equip_no)
    {
        $page = $this->get_post('page');
        $limit = $this->get_post('limit');
        $time = $this->get_post("time");
        $index = $this->get_post("index");

        $d_time = M("equip")->get_time($time);

        $e_type = substr($equip_no,-11,3);
        $data_order = $this->order_time;
        if(!$equip_no||!isset($equip_no)){
            $this->response(array("error"=>"设备编号不能为空"));
        }
        $offline = array('手持式温湿度检测仪','手持式二氧化碳检测仪','手持式光照紫外检测仪','手持式有机挥发物检测仪',"手持式甲醛检测仪");
        $equip = M("equip")->fetOne("equip_no = '".$equip_no."'");
        if(isset($equip['equip_type'])&&in_array($equip['equip_type'],$offline)){
            $d_time['e_time'] = time();
            $d_time['s_time'] = $d_time['e_time'] - 15 * 24 * 3600;
        }

        $select = 'equip_no,equip_time';
        if($equip['equip_type'] == "气象站"){
            $select = 'weather_no,equip_time';
        }
        if($equip['parameter']){
            $select .= ",". $equip['parameter'];
        }
        if(!$limit){
            $limit = 5;
        }
        if(!$page){
            $page = 1;
        }

        $offset = ($page - 1)*$limit;
        $where = "1=1";
        if(isset($equip_no)&&$equip_no){
            $where .= " and equip_no = '".$equip_no."'";
        }

        if($d_time){
            $where .= " and ".$data_order." >= ".$d_time['s_time']." and ".$data_order." < ".$d_time['e_time'];
        }
        $result = array();
        $result['index'] = $index?$index:1;
        if($equip['equip_type'] == "震动监测终端"){
            $vib_select = 'count_time';
            if($equip['parameter']){
                $params = explode(',',$equip['parameter']);
                foreach ($params as $param) {
                    $vib_select .= ','.$param."_average";
                }
            }
            $vib_datas = M("data_sensor_vibration_count")->fetAll("count_time between {$d_time['s_time']} and {$d_time['e_time']}",$vib_select,'count_time desc',$offset,$limit);
            $total = M("data_sensor_vibration_count")->count("count_time between {$d_time['s_time']} and {$d_time['e_time']}");
            $result['total'] = $total;
            $result['rows'] = array();
            if($vib_datas){
                foreach ($vib_datas as $vib_data) {
                    $item = array(
                        'equip_no'=>$equip_no
                    );
                    foreach ($vib_data as $k=>$d) {
                        if($k == 'count_time'){
                            $item['equip_time'] = date("Y-m-d H:i",$d);
                        }else{
                            $k_str = explode('_',$k);
                            if(isset($k_str[0])&&$k_str[0]){
                                $item[$k_str[0]] = deal_data_decimal($k_str[0],$d);
                            }
                        }
                    }
                    $result['rows'][] = $item;
                }
            }
        }else if($equip['equip_type'] == "气象站"){
            $w_where = "equip_time >= {$d_time['s_time']} and equip_time <= {$d_time['e_time']}";
            $total = M('weather_data')->count($w_where);
            $result['total'] = $total;
            $result['rows'] = array();
            $weather_datas = M('weather_data')->fetAll($w_where,$select,'equip_time desc',$offset,$limit);
            if($weather_datas){
                foreach ($weather_datas as $weather_data) {
                    if(isset($weather_data['equip_time']) && $weather_data['equip_time']){
                        $ds['equip_time'] = date("Y-m-d H:i",$weather_data['equip_time']);
                    }
                    $weather_data['equip_no'] = $weather_data['weather_no'];
                    unset($weather_data['weather_no']);
                    unset($weather_data['voltage']);
                    unset($weather_data['rssi']);
                    if( $equip['parameter']){
                        $params = explode(',', $equip['parameter']);
                        foreach ($params as $param) {

                            if(isset($weather_data[$param])&&$weather_data[$param] != ""&&$weather_data[$param] != null&&$weather_data[$param] != "NaN"){
                                $datas = explode(',',$weather_data[$param]);
                                $temp_data  = array();
                                if($datas){
                                    foreach ($datas as $data) {
                                        $temp_data[] = deal_data_decimal($param,$data);
                                    }
                                }
                                if($temp_data){
                                    $weather_data[$param] = implode(",",$temp_data);
                                }
                            }
                        }
                    }
                    $result['rows'][] = $weather_data;
                }
            }
        }else{

            $data_sensor = M("data_sensor")->fetAll($where,$select,$data_order." desc",$offset,$limit);
            $count = M("data_sensor")->count($where);
            if($data_sensor){
                $result['total'] = $count;
                $result['rows'] = array();
                foreach($data_sensor as $ds){
                    if(isset($ds[$data_order]) && $ds[$data_order]){
                        $ds['equip_time'] = date("Y-m-d H:i",$ds[$data_order]);
                    }
                    if( $equip['parameter']){
                        $params = explode(',', $equip['parameter']);
                        foreach ($params as $param) {
                            if(isset($ds[$param])&&$ds[$param] != ""&&$ds[$param] != null&&$ds[$param] != "NaN"){
                                $datas = explode(',',$ds[$param]);
                                $temp_data  = array();
                                if($datas){
                                    foreach ($datas as $data) {
                                        $temp_data[] = deal_data_decimal($param,$data);
                                    }
                                }
                                if($temp_data){
                                    $ds[$param] = implode(",",$temp_data);
                                }
                            }
                        }
                    }
                    $result['rows'][] = $ds;
                }
            }
        }

        $this->response($result);
    }

    function param_lines_get($equip_no,$time=null)
    {
        $d_time = M("equip")->get_time($time);
        $s_time = $d_time['s_time'];
        $e_time = $d_time['e_time'];

        $param = $this->get_post('param');
        $parameters = M("equipments/equip")->get_parameters('sensor');
        $parameter = array();
        if($parameters){
            foreach($parameters as $ps){
                $parameter[$ps['param']] = $ps;
            }
        }
        $equip = M("equip")->find("equip_no = '".$equip_no."'");

        $result = array();
        if($equip['equip_type'] == "震动监测终端"){
            $result = $this->_vibration_line($equip,$s_time,$e_time);
        }else if($equip['equip_type'] == "气象站"){
            $result = $this->_weather_line($equip,$s_time,$e_time);
        }else{
            $result = $this->_sensor_line($equip,$s_time,$e_time);
        }

        $this->response($result);
    }

    /**
     * 普通传感器数据图表
     * @param $equip       设备信息
     * @param $s_time      起始时间
     * @param $e_time      结束时间
     * @return array
     */
    function _sensor_line($equip,$s_time,$e_time)
    {
        $result = array();
        $params = array();
        $select = 'equip_no,equip_time,server_time';
        if(isset($param)&&$param){
            $select .= ','.$param;
            $params = explode(',',$param);
        }else if(isset($equip['parameter'])&&$equip['parameter']){
            $select .= ','.$equip['parameter'];
            $params = explode(',',$equip['parameter']);
        }

        $e_type = substr($equip['equip_no'],-11,3);
        //超时周期
        $max_transmission_time_interval = app_config('max_transmission_time_interval');

        $sql = "select ".$select." from data_sensor where equip_no = '".$equip['equip_no']."' and equip_time >= ".
            $s_time." and equip_time < ".$e_time." order by equip_time asc ";
        $data_sensor = $this->db->query($sql)->result_array();

        $sleep = isset($equip['sleep'])?$equip['sleep']:"600";
        if($data_sensor){
            if($params){
                foreach($params as $p){
                    if($p!= "canbi"){
                        $result[$p] = array(
                            "value"=>array()
                        );
                        $pdata = array();
                        if(isset($parameter[$p])){
                            $result[$p]['name'] = $parameter[$p]['name'];
                            $result[$p]['unit'] = $parameter[$p]['unit'];
                        }
                        $num = 1;
                        $pre_time = 0;
                        foreach($data_sensor as $k=>$ds){
                            $fill_point = array();
                            if(isset($ds["equip_time"])&&$ds["equip_time"]){
                                $current_time = $ds["equip_time"];
                                if(!$pre_time){
                                    $pre_time = $ds['equip_time'];
                                }else{
                                    $sub_time = $ds['equip_time'] - $pre_time;
                                    //超过超时周期 倍采集周期，则填充断点
                                    if($sub_time > $max_transmission_time_interval*$sleep){
                                        $fill_point_time = ceil(($ds['equip_time'] + $pre_time)/2);
                                        $fill_point = array($fill_point_time*1000,"-");
                                    }
                                    $pre_time = $ds['equip_time'];
                                }
                                if($ds[$p]!=""&&$ds[$p]!=null&&$ds[$p]!="NaN"){
                                    if(isset($fill_point)&&$fill_point) {
                                        $pdata[] = $fill_point;
                                    }
                                    $v = $ds[$p];
                                    if(isset($equip['equip_type'])&&$equip['equip_type'] == "智能展柜"){
                                        $v = explode(',',$ds[$p]);
                                        foreach ($v as $key=>$val) {
                                            if($val == "0.00"||$key == 4){
                                                unset($v[$key]);
                                            }
                                        }
                                    }
                                    if(is_array($v)&&$v){
                                        $temp_v = $e_type != "000"?deal_data_decimal($p,array_sum($v)/sizeof($v)):array_sum($v)/sizeof($v);
                                        $pdata[] = array($current_time*1000,$temp_v);
                                    }else{
                                        $temp_v = $e_type != "000"?deal_data_decimal($p,$v):$v;
                                        $pdata[] = array($current_time*1000,$temp_v);
                                    }
                                }
                            }
                        }
                        $result[$p]['value'][$num] = $pdata;
                    }
                }
            }
        }

        return $result;
    }

    /**
     * 气象站数据图表
     * @param $equip       设备信息
     * @param $s_time      起始时间
     * @param $e_time      结束时间
     * @return array
     */
    function _weather_line($equip,$s_time,$e_time)
    {
        $data = array();
        $e = M('equipments/equip');
        $parameters = $e->get_parameters('weather');
        /**************************************风向风速处理（风向玫瑰图）****************************************************/
        $w_data = array( '北风'=>array(),'东北偏北风'=>array(),'东北风'=>array(),'东北偏东风'=>array(),
            '东风'=>array(), '东南偏东风'=>array(), '东南风'=>array(), '东南偏南风'=>array(),
            '南风'=>array(), '西南偏南风'=>array(), '西南风'=>array(), '西南偏西风'=>array(),
            '西风'=>array(), '西北偏西风'=>array(), '西北风'=>array(), '西北偏北风'=>array(),
            'Total'=>array()
        );
        $wind_count = 0;

        $weather_data =  M('weather_data')->fetAll("equip_time > ".$s_time." and equip_time <= ".$e_time,"*","equip_time desc");
        $temp_data = array();
        if($weather_data){
            foreach($weather_data as $wd){
                if(isset($wd['equip_time'])){
                    $t = $wd['equip_time'];
                }
                if($parameters){
                    foreach ($parameters as $parameter) {
                        $param = isset($parameter['param'])?$parameter['param']:"";
                        if($param){
                            if(isset($wd[$param])&&$wd[$param] != ""&&$wd[$param] != "NaN"){
                                if($param == "wind_direction"){
                                    $direction = M('weather')->wind_direction($wd[$param]);
                                    if(isset($wd[$param])){
                                        $w_data[$direction][] = deal_data_decimal($param,$wd[$param]);
                                    }
                                    $wind_count++;
                                }else{
                                    if(isset($temp_data[$param])){
                                        $temp_data[$param][] = array($t*1000,deal_data_decimal($param,$wd[$param]));
                                    }else{
                                        $temp_data[$param] = array();
                                        $temp_data[$param][] = array($t*1000,deal_data_decimal($param,$wd[$param]));
                                    }
                                }
                            }
                        }
                    }
                }
            }

            $w_per_data = array();//百分比
            if($w_data){
                foreach($w_data as $wd=>$ws){
                    $temp = array(
                        "零级"=>array(),
                        "一级"=>array(),
                        "二级"=>array(),
                        "三级"=>array(),
                        "四级"=>array(),
                        "五级"=>array(),
                        "六级以上"=>array()
                    );
                    foreach($ws as $wsv){
                        if($wsv < 0.3){
                            $temp['零级'][] = $wsv;
                        }else if($wsv >= 0.3 && $wsv < 1.6){
                            $temp['一级'][] = $wsv;
                        }else if($wsv >= 1.6 && $wsv < 3.4){
                            $temp['二级'][] = $wsv;
                        }else if($wsv >= 3.4 && $wsv < 5.5){
                            $temp['三级'][] = $wsv;
                        }else if($wsv >= 5.5 && $wsv < 8.0){
                            $temp['四级'][] = $wsv;
                        }else if($wsv >= 8.0 && $wsv < 10.8){
                            $temp['五级'][] = $wsv;
                        }else if($wsv >= 10.8){
                            $temp['六级以上'][] = $wsv;
                        }
                    }
                    $w_per_data[$wd] = array();
                    if($wind_count){
                        foreach($temp as $tem){
                            $w_per_data[$wd][] = round(sizeof($tem)/$wind_count * 100,2);
                        }
                    }
                    foreach($w_per_data as $wpdk=> $wpd){
                        if($wpdk != "Total"){
                            $w_per_data['Total'][] = array_sum($wpd);
                        }
                    }
                }
            }
            $temp_data['wind'] = $w_per_data;

            $data['from'] = "local";
            $data['data'] = $temp_data;
        }
        return $data;
    }

    /**
     * 震动传感器数据图表
     * @param $equip       设备信息
     * @param $s_time      起始时间
     * @param $e_time      结束时间
     * @return array
     */
    function _vibration_line($equip,$s_time,$e_time){
        $result = array();
        $vib_datas = M("data_sensor_vibration_count")->fetAll("count_time between {$s_time} and {$e_time}");
        if($vib_datas){
            foreach ($vib_datas as $vib_data) {
                foreach (explode(',',$equip['parameter']) as $p) {
                    if(!isset($result[$p])){
                        $result[$p]=array(
                            'value'=>array()
                        );
                        if(isset($parameter[$p])){
                            $result[$p]['name'] = isset($parameter[$p]['name'])?$parameter[$p]['name']:"";
                            $result[$p]['unit'] = isset($parameter[$p]['unit'])?$parameter[$p]['unit']:"";
                        }
                    }
                    if(!isset($result[$p]['value']['1'])){
                        $result[$p]['value']['1'] = array();
                    }
                    if(isset($vib_data[$p."_average"])&&$vib_data[$p."_average"] != ""&&$vib_data[$p."_average"]!= "NaN"){
                        $result[$p]['value']['1'][] = array($vib_data['count_time']*1000,deal_data_decimal($p,$vib_data[$p."_average"]));
                    }
                }
            }
        }

        return $result;
    }

    function new_data_get($equip_no)
    {
        $equip = M("equip")->find("equip_no = '".$equip_no."'");
        $param = "humidity,temperature";
        if(isset($equip['parameter'])&&$equip['parameter']){
            $param = $equip['parameter'];
        }
        $e_type = substr($equip_no,-11,3);
        $sensor = array('温湿度监测终端','带屏温湿度监测终端','有机挥发物监测终端','二氧化碳监测终端','光照紫外监测终端','空气质量监测终端',"土壤温湿度监测终端","智能囊匣","智能展柜","震动监测终端");
        $network = array('中继','网关');
        $controller =  array('调湿机','调湿剂',"充氮调湿机");
        $offline = array('手持式温湿度检测仪','手持式二氧化碳检测仪','手持式光照紫外检测仪','手持式有机挥发物检测仪',"手持式甲醛检测仪");
        if($equip){
            if(in_array($equip['equip_type'],$network)){
                $param = "rssi,voltage";
            }
        }

        $m=M("equipments/equip");
        $sensor_parameters = $m->get_parameters('sensor');
        $parameters = array();
        if($sensor_parameters){
            foreach($sensor_parameters as $sp){
              if(isset($sp['param'])&&$sp['param']){
                  $parameters[$sp['param']] = array(
                      'unit'=>$sp['unit'],
                      'name'=>$sp['name']
                  );
              }
            }
        }

	    $data_order = "equip_time";
       if(isset($equip['equip_type'])&&$equip['equip_type'] != '震动监测终端'){
           $data_sensor = M("data_sensor")->find("equip_no = '".$equip_no."' and ".$data_order ." <= ".time(),$param.",".$data_order,$data_order." desc");
       }else{
           $select = "count_time";
           if($param){
               $params = explode(',',$param);
               foreach ($params as $p) {
                   $select .= ','.$p.'_average';
               }
           }

           $data_sensor = M("data_sensor_vibration_count")->fetOne('',$select,"count_time desc");
       }
        $data = array(
            'equip_no'=>$equip_no
        );
        if($data_sensor){
           foreach($data_sensor as $k=>$v){
              if($k == $data_order ||$k == "count_time") {
                  $data['time'] = date("Y-m-d H:i", $v);
              }else if(strpos($k,'_average') !== false){
                  $str = explode("_",$k);
                  $p = isset($str[0])?$str[0]:"";
                  if($p){
                      if($v != ""&&$v != null&&$v != "NaN"){
                          $temp = array(
                              'value'=>$e_type != "000"?deal_data_decimal($k,$v):$v
                          );
                          if(isset($parameters[$k])){
                              $temp = array_merge($temp,$parameters[$k]);
                          }
                          $data[$k] = $temp;
                      }
                  }
              }else{
                  if($v != ""&&$v != null&&$v != "NaN"){
                      $temp = array(
                          'value'=>$e_type != "000"?deal_data_decimal($k,$v):$v
                      );
                      if(isset($parameters[$k])){
                          $temp = array_merge($temp,$parameters[$k]);
                      }
                      $data[$k] = $temp;
                  }
              }
           }
        }
        $this->response($data);
    }

    function equip_parameters_get($equip_type = null)
    {
//        $type = array(
//            'sensor' => array('温湿度监测终端','带屏温湿度监测终端','有机挥发物监测终端','二氧化碳监测终端','光照紫外监测终端','空气质量监测终端',"土壤温湿度监测终端","智能囊匣","智能展柜"),
//            'controller'=> array('调湿机','调湿剂',"充氮调湿机"),
//            'offline'=> array('手持式温湿度检测仪','手持式二氧化碳检测仪','手持式光照紫外检测仪','手持式有机挥发物检测仪',"手持式甲醛检测仪"),
//            'weather'=>array('气象站')
//        );
//
//        $e_type = 'sensor';
//        foreach($type as $ty=>$v){
//            if(in_array($equip_type,$v)){
//                $e_type = $ty;
//                continue;
//            }
//        }

        if(!$equip_type){
            $equip_type = 'sensor';
        }
        $data = array();
        $parameters = $this->db->get('equip_param')->result_array();
        if($parameters){
            foreach($parameters as $param){
                if(isset($param['type'])&&$param['type']){
                    if(!isset($data[$param['type']])){
                        $data[$param['type']] = array();
                    }
                    if(isset($param['param'])&&$param['param']){
                        $data[$param['type']][$param['param']] = array(
                            'name'=>isset($param['name'])?$param['name']:'',
                            'unit'=>isset($param['unit'])?$param['unit']:'',
                        );
                    }
                }
            }
        }

        $this->response($data);
    }

    function box_plots_get($equip_no,$time=null)
    {

        $d_time = M("equip")->get_time($time);
        $s_time = $d_time['s_time'];
        $e_time = $d_time['e_time'];

        $equip = M('equip')->find("equip_no = '".$equip_no."'");
        if(!$equip){
            $this->response(array("result"=>"error","msg"=>"设备不存在"));
        }else{
            if(isset($equip['parameter'])&&$equip['parameter']){
                $parameter = $equip['parameter'];
                $params = explode(',',$parameter);
            }
        }

        $m=M("equipments/equip");
        $sensor_parameters = $m->get_parameters('sensor');
        $parameters = array();
        if($sensor_parameters){
            foreach($sensor_parameters as $sp){
                if(isset($sp['param'])&&$sp['param']){
                    $parameters[$sp['param']] = array(
                        'unit'=>$sp['unit'],
                        'name'=>$sp['name']
                    );
                }
            }
        }

        $data = array();

        $select = "equip_no,env_no,equip_time,server_time";
	    $data_order = $this->order_time;
        if(isset($parameter)&&$parameter){
            $select .= ','.$parameter;
            $data_sensors = M("data_sensor")->fetAll("equip_no = '".$equip_no."' and ".$data_order." between ".$s_time." and ".$e_time,$select,$data_order." desc");

            if($data_sensors){
                if(isset($params)&&$params){
                    foreach($params as $param){
                        $data[$param] = array(
                            "data" =>array()
                        );
                        if(isset($parameters[$param])&&$parameters[$param]){
                            $data[$param] = array_merge($data[$param],$parameters[$param]);
                        }
                        foreach($data_sensors as $ds){
                            if(isset($ds[$param])&&$ds[$param]){
                                $data[$param]['data'][] = deal_data_decimal($param,$ds[$param]);
                            }
                        }
                    }
                }
            }
        }

        $this->response($data);
    }

	function stability_get($equip_no,$time=null)
    {
        $d_time = M("equip")->get_time($time);
        $s_time = $d_time['s_time'];
        $e_time = $d_time['e_time'];
		$equip = M('equip')->find("equip_no = '".$equip_no."'");
		if(!$equip){
			$this->response(array("result"=>"error","msg"=>"设备不存在"));
		}else{
			if(isset($equip['parameter'])&&$equip['parameter']){
				$parameter = $equip['parameter'];
				$params = explode(',',$parameter);
			}
		}

		$m=M("equipments/equip");
		$sensor_parameters = $m->get_parameters('sensor');
		$parameters = array();
		if($sensor_parameters){
			foreach($sensor_parameters as $sp){
				if(isset($sp['param'])&&$sp['param']){
					$parameters[$sp['param']] = array(
						'unit'=>$sp['unit'],
						'name'=>$sp['name']
					);
				}
			}
		}

		$data = array();
		$select = "equip_no,env_no,equip_time,server_time";

		$data_order = $this->order_time;
		if(isset($parameter)&&$parameter){
			$select .= ','.$parameter;
			$data_sensors = M("data_sensor")->fetAll("equip_no = '".$equip_no."' and ".$data_order." between ".$s_time." and ".$e_time,$select,$data_order." desc");
			$env = M('environments/env');
			if($data_sensors){
				if(isset($params)&&$params){
					foreach($params as $param){
						$temp = array();
						foreach($data_sensors as $ds){
							if(isset($ds[$param])&&$ds[$param]){
								$temp[] = $ds[$param];
							}
						}

						$name = isset($parameters[$param]['name'])?$parameters[$param]['name']:"";
						$data[$param] = array(
							'name'=>$name,
							"SD"=>deal_data_decimal($param,$env->get_standard_deviation($temp))
						);
					}
				}
			}
		}

		$this->response($data);
	}
}