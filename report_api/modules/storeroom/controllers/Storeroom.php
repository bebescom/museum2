<?php

/**
 * Created by PhpStorm.
 * User: Hebj
 * Date: 2017/5/4
 * Time: 17:17
 */
class Storeroom extends MY_Controller
{
    protected  $env_info;
    protected  $report;
    public function __construct()
    {
        parent::__construct();
        //设备参数信息
        $parameters = API("get/env/equipments/equip_parameters/sensor");
        $this->params = array();
        if(isset($parameters['sensor'])&&$parameters['sensor']){
            foreach($parameters['sensor'] as $p=>$parameter){
                if($p == "humidity"){
                    $parameter['name'] = "湿度";
                }
                $this->params[$p] = $parameter;
            }
        }
    }

    public function index(){
        $report_id = $this->get_post('report_id');
        $param = $this->get_post('param');
        $type = $this->get_post('type');
        $floor_no = $this->get_post('floor_no');

        if(!$param){
            $param = 'temperature,humidity';
        }
        $param = explode(',',$param);

        // 报告参数
        $report = M("report")->fetOne('id = '.$report_id);
        $this->report = $report;
        $day_seconds = 24*2600 - 1;
        if(isset($report['report_time_range'])&&$report['report_time_range']){
            $time = explode("-",$report['report_time_range']);
            $stime = isset($time[0])?strtotime($time[0]):"";
            $etime = isset($time[1])?strtotime($time[1])+$day_seconds:"";
        }else{
            $season = ceil((date('n'))/3)-1;//上季度是第几季度
            $stime = mktime(0, 0, 0,$season*3-3+1,1,date('Y'));
            $etime = mktime(23,59,59,$season*3,date('t',mktime(0, 0 , 0,$season*3,1,date("Y"))),date('Y'));
        }
//        $stime = strtotime('2017-4-1');
//        $etime = strtotime('2017-4-7');

        $floor = API("get/base/envs/info/".$floor_no);
        if(!$floor){
            $this->response(array('error'=>"未找到楼层信息"));
        }
        define('FLOOR_NAME',$floor['name']);
        define('FLOOR_NO',$floor['env_no']);
        $storerooms = API("get/base/envs", array(
            'type' => $type,
            'parent_env_no'=>$floor_no
        ));
        $env_info = array();
        $envs = API('get/base/envs');
        if(isset($envs['rows'])&&$envs['rows']){
            foreach ($envs['rows'] as $row) {
                $env_info[$row['env_no']] = array(
                    'type'=>$row['type'],
                    'name'=>$row['name']
                );
            }
        }
        $this->env_info = $env_info;

        //定义变量

        $all_data = array();//所有数据
        $env_names = array();
        $boxplot_prepare = array();//箱型图准备
        $box_pole_std = array();//各环境箱型图数据
        $range_std = array();//日波动，标准差数据
        $boxplot_by_type = array();//分类型箱型图数据
        $calendar = array();//日历图
        $all = array();//
        $floor_data = array();//整层数据统合-------为日历图做准备
        $env_data_by_type = array();
        $contents = array();
        $equip_nos = array();

        foreach($param as $p){
            $param_name = $this->params[$p]['name'];
            $contents["{$floor['name']}{$param_name}"] = 0;
        }
        $pdata = array();
        $day_data = array();
//        $this->response($storerooms);
        if(isset($storerooms['rows'])&&$storerooms['rows']){
            foreach ($storerooms['rows'] as $row) {
                if(isset($row['env_no'])&&$row['env_no']){
                    $env_no = $row['env_no'];
                    $name = $row['name'];
                    $env_names[$env_no] = $name;
                    $sheet_name = $floor['name'];
                    if($this->db->database == 'sx_report'){
                        $sheet_name = $name;
                    }
                    if(!isset($all_data[$sheet_name])){
                        $all_data[$sheet_name] = array();
                    }
                    if(!isset($all[$sheet_name])){
                        $all[$sheet_name] = array();
                    }

                    if(!isset($env_data_by_type[$sheet_name])){
                        $env_data_by_type[$sheet_name] = array(
                            '微环境'=>array(),//微环境
                            '小环境'=>array()//小环境
                        );
                    }

                    if(isset($row['type'])&&$row['type'] == $type){
                        //原始数据
                        $data_sensor =  API("get/env/common/monitor_data",array(
                            'env_no'=>$env_no,
                            'time'=>$stime.",".$etime,
                            'params'=>implode(',',$param)
                        ));
//                        $this->response(sizeof($data_sensor['rows']));
                        if(isset($data_sensor['rows'])&&$data_sensor['rows']){
                            foreach($data_sensor['rows'] as $ds_row){
                                $date = date("m月d日",$ds_row['equip_time']);
                                $calendar_date = date("Y-m-d",$ds_row['equip_time']);
                                if(isset($ds_row['env_no'])&&$ds_row['env_no']){

                                    //整合所有数据--按监测点分类(环境+设备编码后四位)
                                    if($ds_row['env_no'] == $env_no){
                                        $env_type = "小环境";
                                        $env_name = "小环境";
                                    }else{
                                        $env_type = "微环境";
                                        $env_name = isset($env_info[$ds_row['env_no']])?$env_info[$ds_row['env_no']]['name']:"小环境";
                                    }
                                    $short_no = substr($ds_row['equip_no'],-4);
                                    $row_name = $env_name."(".$short_no.")";

                                    $env_data_by_type[$sheet_name][$env_type][] = $ds_row;

                                    //为分类计算箱型图做准备
                                    if(!isset($boxplot_prepare[$env_type])){
                                        $boxplot_prepare[$env_type] = array();
                                    }
                                    if(!isset($boxplot_prepare[$env_type][$row_name])){
                                        $boxplot_prepare[$env_type][$row_name] = array();
                                    }

                                    foreach ($param as $p) {
                                        $param_name = $this->params[$p]['name'];
                                        if(!isset($equip_nos[$param_name])){
                                            $equip_nos[$param_name] = array();
                                        }
                                        if(!isset($boxplot_prepare[$env_type][$row_name][$p])){
                                            $boxplot_prepare[$env_type][$row_name][$p]  = array();
                                        }
                                        //统合温度数据
                                        if(isset($ds_row[$p])&&$ds_row[$p] != null&&$ds_row[$p] != "NaN"&&$ds_row[$p] != ""){
                                            if(data_filter($ds_row[$p],$p)){
                                                $contents["{$floor['name']}{$param_name}"] = 1;
                                                if(!isset($equip_nos[$p][$short_no])){
                                                    $equip_nos[$param_name][$short_no] = $env_name;
                                                }
                                                //所有数据
                                                if(!isset($pdata[$p])){
                                                    $pdata[$p] = array();
                                                }
                                                if(!isset($pdata[$p][$row_name])){
                                                    $pdata[$p][$row_name] = array();
                                                }
                                                $pdata[$p][$row_name][$ds_row['equip_time']] = $ds_row[$p];

                                                $boxplot_prepare[$env_type][$row_name][$p][] = $ds_row[$p];

                                                //以天为单位统和数据
                                                if(!isset($day_data[$p])){
                                                    $day_data[$p] = array();
                                                }
                                                if(!isset($day_data[$p][$row_name])){
                                                    $day_data[$p][$row_name] = array();
                                                }

                                                if(!isset($day_data[$p][$row_name][$date])){
                                                    $day_data[$p][$row_name][$date] = array();
                                                }
                                                $day_data[$p][$row_name][$date][] = $ds_row[$p];

                                                if(!isset($all[$sheet_name][$p])){
                                                    $all[$sheet_name][$p] = array();
                                                }
                                                $all[$sheet_name][$p][] = $ds_row[$p];
                                                //整层数据
                                                if(!isset($floor_data[$p])){
                                                    $floor_data[$p] = array();
                                                }
                                                if(!isset($floor_data[$p][$calendar_date])){
                                                    $floor_data[$p][$calendar_date] = array();
                                                }
                                                if(!isset($floor_data[$p][$calendar_date][$row_name])){
                                                    $floor_data[$p][$calendar_date][$row_name] = array();
                                                }

                                                $floor_data[$p][$calendar_date][$row_name][] = $ds_row[$p];
                                            }
                                        }
                                    }
                                }
                            }

                        }
                    }
                }
            }
        }
//        $this->response(sizeof($equip_nos));
        if($pdata){
            //计算箱型图，均峰图，标准差的数据
            $box_pole_std = $this->_box_pole_std($pdata,$sheet_name);
        }

        //各监测点的波动数据
        if($day_data){
            $range_std = $this->_range_std($day_data,$sheet_name);
        }

        if($boxplot_prepare){
            $boxplot_by_type = $this->_boxplot_by_type($boxplot_prepare,$sheet_name);
        }

//        $this->response(array($box_pole_std,$range_std,$boxplot_by_type));
        //文字性参数
        $content = array();
        if(isset($env_data_by_type)&&$env_data_by_type){
            $max_wave = array();
            if(isset($range_std['day_range'])&&$range_std['day_range']){
                foreach ($range_std['day_range'] as $rs_p=>$rs_vals) {
                    if(!isset($max_wave[$rs_p])){
                        $max_wave[$rs_p] = array();
                    }
                    if($rs_vals){
                        foreach ($rs_vals as $rsv_sht_name=>$rs_val) {
                            if(!isset($max_wave[$rs_p][$rsv_sht_name])){
                                $max_wave[$rs_p][$rsv_sht_name] = array();
                            }
                            if($rs_val){
                                foreach ($rs_val as $rsv_name=>$rsv_range) {
                                    $max_wave[$rs_p][$rsv_sht_name][$rsv_name] = $rsv_range[0];
                                }
                            }
                        }
                    }
                }
            }
            if(isset($box_pole_std)&&isset($range_std['table_range_std_date'])){
                $content = $this->_contents($env_data_by_type,$boxplot_by_type,$box_pole_std,$range_std['table_range_std_date'],$max_wave,$param);
//                $this->response($content);
            }
        }

        //监测设备
        if($equip_nos){
            foreach ($equip_nos as $equip_no_param=>$equip_no) {
                $contents["{$floor['name']}{$equip_no_param}设备"] = json_encode($equip_no);
            }
        }

        if($contents){
            $contents = array_merge($content,$contents);
            $content_col = "`report_id`,`content_key`,`content_value`,`create_time`";
            $content_val = array();
            foreach($contents as $key=>$val){
//                $content_val[] = '('.$report_id.',"'.$key.'",'.$val.','.time().')';
                $content_val[] = "(".$report_id.",'".$key."','".$val."',".time().")";
            }
            $sql = 'replace into content ('.$content_col.') value '.implode(',',$content_val);
            $this->db->query($sql);
        }
//        $this->response($contents);

        /****************图表数据写入数据库***************/
        $image_val = array();
        $images = array();

        /*************  _box_pole_std  返回数据 *******/
        $image_data1 = $this->_box_pole_std_save($box_pole_std);

        /********************  _range_std  返回数据 ***********************************/
        $image_data2 = $this->_range_std_save($range_std);

//        $this->response(array($calendar,$image_data1,$image_data2));

//        $image_val = array_merge($image_data1['image_val'],$image_data2['image_val']);
        $images = array_merge($image_data1['images'],$image_data2['images']);

        //整层波动数据,返回日历图数据
        if($floor_data){
            $calendar = $this->_calendar($floor_data,$stime,$etime,$sheet_name);
            if($calendar){
//                if(isset($calendar['image_val'])){
//                    $image_val = array_merge($image_val,$calendar['image_val']);
//                }
                if(isset($calendar['images'])){
                    $images = array_merge($images,$calendar['images']);
                }
            }
        }
        //图片数据写入数据库
        if($images){
//            $this->response($images);
            foreach ($images as $image) {
                unset($image['unit']);
                $image['report_id'] = $report_id;
                $pre_image = M("images")->fetOne('report_id = '.$image['report_id'].' and image_key = "'.$image['image_key'].'"');
                if($pre_image){
                    $ret = M("images")->update($image,'report_id = '.$image['report_id'].' and image_key = "'.$image['image_key'].'"');
                }else{
                    $ret = M("images")->add($image);
                }
           }
        }
        $msg = "处理失败";
        if(isset($ret)&&$ret){
            $msg = "处理成功";
        }
        $this->response(array('data'=>array('report_id'=>$report_id,"msg"=>$msg)));
    }

    /***
    * 计算描述性统计数据--------箱型图，均峰图，标准差的数据
     * @param $pdata array 已分好类的数据
     * @param $sheet_name string 报表的图表环境名
     * @return 表格数据
     **/
    function _box_pole_std($pdata= array(),$sheet_name)
    {
        $report_id = $this->report['id'];

        $table_data_desc = array();
        $std_data_rm_outliner = array();
        $outliner = array();
        $std_data = array();
        $avg_pole_rm_outliner = array();
        $avg_pole = array();
        $boxplot = array();
//        $wave = array();
        foreach($pdata as $p=>$datas){
            /**********初始化**********/
            //箱型图
            if(!isset($boxplot[$p])){
                $boxplot[$p] = array();
            }
            if(!isset($boxplot[$p][$sheet_name])){
                $boxplot[$p][$sheet_name] = array();
            }
            //离群点
            if(!isset($outliner[$p])){
                $outliner[$p] = array();
            }
            if(!isset($outliner[$p][$sheet_name])){
                $outliner[$p][$sheet_name] = array();
            }

            //均峰值
            if(!isset($avg_pole[$p])){
                $avg_pole[$p] = array();
            }
            if(!isset($avg_pole[$p][$sheet_name])){
                $avg_pole[$p][$sheet_name] = array();
            }

            //去除离群点后的均峰值
            if(!isset($avg_pole_rm_outliner[$p])){
                $avg_pole_rm_outliner[$p] = array();
            }
            if(!isset($avg_pole_rm_outliner[$p][$sheet_name])){
                $avg_pole_rm_outliner[$p][$sheet_name] = array();
            }
            if(!isset($std_data[$p])){
                $std_data[$p] = array();
            }

            //标准差
            if(!isset($std_data[$p][$sheet_name])){
                $std_data[$p][$sheet_name] = array();
            }
            if(!isset($std_data_rm_outliner[$p])){
                $std_data_rm_outliner[$p] = array();
            }

            //去除离群值后的标准差
            if(!isset($std_data_rm_outliner[$p][$sheet_name])){
                $std_data_rm_outliner[$p][$sheet_name] = array();
            }

            if($datas){
                foreach ($datas as $monitor_point=>$data) {
                    $d = array_values($data);
                    //箱型图
                    $bp = calc_boxplot($d);
                    $boxplot[$p][$sheet_name][$monitor_point] = $bp;
                    //离群值数量图
                    $outliner[$p][$sheet_name][$monitor_point] = isset($bp[5])?sizeof($bp[5]):0;

                    //原生数据图表
                    //均峰图
                    $min =  deal_data_decimal($p,min($d));
                    $max =  deal_data_decimal($p,max($d));
                    $avg = deal_data_decimal($p,array_sum($d)/sizeof($d));
                    $avg_pole[$p][$sheet_name][$monitor_point] = array($max,$min,$avg);
//                    $wave[$monitor_point] = $max - $min;
                    //标准差
                    $std = get_standard_deviation($d);
                    $std_data[$p][$sheet_name][$monitor_point] = $std;

                    $table_data_desc[] = array(
                        'report_id'=>$report_id,
                        'sheet_name' =>"{$sheet_name}{$this->params[$p]['name']}数据描述性统计量",
                        'env_name' => $monitor_point,
                        'total_count' => count($d),
                        'range' => deal_data_decimal($p,$max - $min),
                        'min' => $min,
                        'max' => $max,
                        'avg' => $avg ?$avg : 0,
                        'std' => $std
                    );

                    //剔除离群值图表
                    $d_rm_outliner = remove_outliers($d);//剔除离群值
                    //均峰图--剔除离群值
                    $min_ro = deal_data_decimal($p,min($d_rm_outliner));
                    $max_ro =  deal_data_decimal($p,max($d_rm_outliner));
                    $avg_rm_outliner = deal_data_decimal($p,array_sum($d_rm_outliner)/sizeof($d_rm_outliner));
                    $avg_pole_rm_outliner[$p][$sheet_name][$monitor_point] = array($max_ro,$min_ro,$avg_rm_outliner);

                    //标准差
                    $std_outliner = get_standard_deviation($d_rm_outliner);
                    $std_data_rm_outliner[$p][$sheet_name][$monitor_point] = $std_outliner;

                    $table_data_desc[] =  array(
                        'report_id'=>$report_id,
                        'sheet_name' => "{$sheet_name}{$this->params[$p]['name']}数据描述性统计量（已剔除离群值）",
                        'env_name' => $monitor_point,
                        'total_count' => count($d_rm_outliner),
                        'range' =>  deal_data_decimal($p,$max_ro-$min_ro),
                        'min' => $min_ro,
                        'max' => $max_ro,
                        'avg' => $avg_rm_outliner ? $avg_rm_outliner : 0,
                        'std' => $std_outliner
                    );
                }
            }
        }
        return array(
            'table_data_desc'=>isset($table_data_desc)?$table_data_desc:array(),
            'std_data_rm_outliner'=>isset($std_data_rm_outliner)?$std_data_rm_outliner:array(),
            'outliner'=>isset($outliner)?$outliner:array(),
            'std_data'=>isset($std_data)?$std_data:array(),
            'avg_pole_rm_outliner'=>isset($avg_pole_rm_outliner)?$avg_pole_rm_outliner:array(),
            'avg_pole'=>isset($avg_pole)?$avg_pole:array(),
            'boxplot'=>isset($boxplot)?$boxplot:array(),
//            'wave'=>$wave
        );
    }

    /***
     * 计算日波动、标准差的数据
     * @param $day_data array 每日的数据
     * @param $sheet_name string 报表的图表环境名
     * @return 波动及标准差表格数据
     **/
    function _range_std($day_data= array(),$sheet_name)
    {
        $report_id = $this->report['id'];
        $table_range_std = array();//日波动及标准差统计表
        $table_range_std_day = array();//日波动及标准差统计表
        $table_range_std_date = array();//日波动、标准差极值发生的日期列表
        $day_std = array();//每日标准差
        $day_range = array();//日波动

        foreach ($day_data as $p=>$d_data) {
            if($d_data){
                foreach ($d_data as $monitor_point=>$date_data) {
                    if($date_data){
                        $range = array();
                        $std_array = array();
                        foreach ($date_data as $day=>$dd) {
                            $range[$day] =  deal_data_decimal($p,max($dd) - min($dd));
                            $std_array[$day] = get_standard_deviation($dd);
                        }

                        $table_range_std = $table_range_std_day[] = array(
                            'report_id'=>$report_id,
                            'sheet_name' => $sheet_name.$this->params[$p]['name'].'日波动及标准差统计表',
                            'env_name' => $monitor_point,
                            'range_min' =>  deal_data_decimal($p,min($range)),
                            'range_max' => deal_data_decimal($p,max($range)),
                            'range_avg' => count($range) ?  deal_data_decimal($p,array_sum($range)/count($range)) : 0,
                            'std_min' =>  deal_data_decimal($p,min($std_array)),
                            'std_max' =>  deal_data_decimal($p,max($std_array)),
                            'std_avg' => count($std_array) ? deal_data_decimal($p,array_sum($std_array)/count($std_array)) : 0,
                        );
                        if(!isset($day_range[$p])){
                            $day_range[$p] = array();
                        }
                        if(!isset($day_range[$p][$sheet_name])){
                            $day_range[$p][$sheet_name] = array();
                        }
                        if(!isset($day_std[$p])){
                            $day_std[$p] = array();
                        }
                        if(!isset($day_std[$p][$sheet_name])){
                            $day_std[$p][$sheet_name] = array();
                        }

                        $day_range[$p][$sheet_name][$monitor_point] = array($table_range_std['range_max'],$table_range_std['range_min'],$table_range_std['range_avg']);
                        $day_std[$p][$sheet_name][$monitor_point] = array($table_range_std['std_max'], $table_range_std['std_min'], $table_range_std['std_avg']);

                        $table_range_std_date[] = array(
                            'report_id'=>$report_id,
                            'sheet_name' =>$sheet_name.$this->params[$p]['name'].'日波动、标准差极值发生的日期列表',
                            'env_name' => $monitor_point,
                            'range_max_date' => array_search(max($range), $range),
                            'range_min_date' => array_search(min($range), $range),
                            'std_max_date' => array_search(max($std_array), $std_array),
                            'std_min_date' => array_search(min($std_array), $std_array),
                        );
                    }
                }
            }
        }
        return array(
            "table_range_std_date"=>$table_range_std_date,
            "table_range_std"=>$table_range_std,
            "table_range_std_day"=>$table_range_std_day,
            "day_std"=>$day_std,
            "day_range"=>$day_range,
        );
    }

    /***
     * 构建日历图数据
     * @param $floor_data array 日波动数据
     * @param $stime string 起始时间
     * @param $etime string 结束时间
     * @return 日历图数据
     **/
    function _calendar($floor_data= array(),$stime,$etime,$sheet_name)
    {
        $report_id = $this->report['id'];
        //列出月份
        $add_time = $stime;
        $month = array(date("Y-m",$stime));//时间内的月份
        while(($add_time = strtotime('+1 month', $add_time)) < $etime){
            $month[] = date("Y-m",$add_time);
        }
        $return_data = array(
            'image_val'=>array(),
            'images'=>array(),
        );//日历图数据
        foreach ($floor_data as $fd_param=>$fd_datas) {
            $all_range = array();
            if(!isset($calendar[$fd_param])){
                $calendar[$fd_param] = array(
                    'data'=>array(),
                    'top'=>array(),
                    'sheet_name'=>$sheet_name,
                    'range'=>array(date("Y-m-d",$stime),date("Y-m-d",$etime)),
                    'top_len'=>2*sizeof($month),
                    'ch_size'=>1
                );
            }
            if($fd_datas){
                foreach ($fd_datas as $fd_date=>$fd_data) {

                    if(!isset($floor_range)){
                        $floor_range = array();
                    }
                    if(!isset($floor_range[$fd_date])){
                        $floor_range[$fd_date] = array();
                    }
                    if($fd_data){
                        foreach ($fd_data as $row_name=>$fd_vals) {
                            $floor_range[$row_name] =  deal_data_decimal($fd_param,max($fd_vals) - min($fd_vals));
                        }
                        if($floor_range){
                            $temp_range = deal_data_decimal($fd_param,array_sum($floor_range)/sizeof($floor_range));
                            $calendar[$fd_param]['data'][] = array($fd_date,$temp_range);
                            $all_range[$fd_date] = $temp_range;
                        }
                    }
                }
                if($all_range){
                    arsort($all_range);
                    $top = array_slice($all_range,0,2*sizeof($month));
                    $cld_max = max(array_values($all_range));
                    $calendar[$fd_param]['ch_size'] = round(20/$cld_max,2);
                    if($top){
                        foreach ($top as $t=>$value) {
                            $calendar[$fd_param]['top'][] = array($t,$value);
                        }
                    }
                }
            }
        }

        //日历图
        if($calendar){
            foreach ($calendar as $cld_param=>$cld_datas) {
                if($cld_datas){
                    $image_key = "{$cld_datas['sheet_name']}{$this->params[$cld_param]['name']}日波动日历图";
                    $image = array(
                        'image_key'=>$image_key,
                        'image_type' => 'calendar',
                        'image_data' => json_encode($cld_datas),
                        'unit'=>isset($this->params[$cld_param]['unit'])?$this->params[$cld_param]['unit']:""
                    );
                    $return_data['images'][] = $image;
                }
            }
        }

        return $return_data;
    }

    /**
     * @param array $env_data_by_type          按环境分类数据
     * @param array $boxplot                   分类箱型图
     * @param array $std_data                  标准差数据
     * @param array $table_range_std_date      标准差日期数据
     * @param array $day_range                 日波动数据
     * @param $param                           请求参数
     * @return array                           描述性语句
     */
    function _contents($env_data_by_type= array(),$boxplot = array(),$box_pole_std= array(),$table_range_std_date= array(),$day_range=array(),$param)
    {
        $report_id = $this->report['id'];
        $content = array();

        $std_data = $box_pole_std['std_data'];
        if($env_data_by_type){
            foreach ($env_data_by_type as $sht_name=>$ed_datas) {
                if($ed_datas){
                    foreach ($ed_datas as $env_type=>$ed_data) {
                        if($ed_data){
                            foreach ($param as $ed_param) {
                                $param_name = $this->params[$ed_param]['name'];
                                $content["{$sht_name}{$env_type}{$param_name}"] = 0;
                                /************************ 排序 ****************************/
                                if($ed_param == 'temperature'){
                                    //温度排序
                                    usort($ed_data,function($a,$b){
                                        return $a['temperature']> $b['temperature'] ? 1 : -1;
                                    });
                                }else if($ed_param == 'humidity'){
                                    //湿度排序
                                    usort($ed_data,function($a,$b){
                                        return $a['humidity']> $b['humidity'] ? 1 : -1;
                                    });
                                }
                                $ty_data = array();
                                foreach ($ed_data as $edd) {
                                    $env_name = isset($this->env_info[$edd['env_no']])?$this->env_info[$edd['env_no']]['name']:"小环境";
                                    $short_no = substr($edd['equip_no'],-4);
                                    $row_name = $env_name."(".$short_no.")";
                                    if(!isset($ty_data[$row_name])){
                                        $ty_data[$row_name] = array();
                                    }
                                    $ty_data[$row_name][] = $edd[$ed_param];
                                }
                                $wave = array();
                                if($ty_data){
                                    foreach ($ty_data as $ty_name=>$ty_d) {
                                        $wave[$ty_name] = deal_data_decimal($ed_param,max($ty_d)-min($ty_d));
                                    }
                                }
                                $temp_ed_data = $ed_data;
                                $min_temp = array_shift($temp_ed_data);
                                while(is_null($min_temp[$ed_param])&&sizeof($temp_ed_data)){
                                    $min_temp = array_shift($temp_ed_data);
                                }

                                $temp_ed_data = array();
                                $temp_ed_data = $ed_data;
                                $max_temp = array_pop($temp_ed_data);
                                while(is_null($max_temp[$ed_param])&&sizeof($temp_ed_data)){
                                    $max_temp = array_pop($temp_ed_data);
                                }
                                if($min_temp){
                                    $content["{$sht_name}{$env_type}{$param_name}"] = 1;
                                }
                                $content["{$sht_name}{$env_type}{$param_name}最小值"] = isset($min_temp[$ed_param])?$min_temp[$ed_param]:'';
                                $content["{$sht_name}{$env_type}{$param_name}最小值环境"] = isset($this->env_info[$min_temp['env_no']])?$this->env_info[$min_temp['env_no']]['name']:'';
                                $content["{$sht_name}{$env_type}{$param_name}最大值"] = isset($max_temp[$ed_param])?$max_temp[$ed_param]:"";
                                $content["{$sht_name}{$env_type}{$param_name}最大值环境"] = isset($this->env_info[$max_temp['env_no']])?$this->env_info[$max_temp['env_no']]['name']:'';
                                $content["{$sht_name}{$env_type}{$param_name}描述"] = "";
                                if(isset($boxplot[$env_type])&&isset($boxplot[$env_type][$ed_param])){
                                    if(isset($boxplot[$env_type][$ed_param][$sht_name])&&$boxplot[$env_type][$ed_param][$sht_name]){
                                        $content["{$sht_name}{$env_type}{$param_name}描述"] = desc_judge($boxplot[$env_type][$ed_param][$sht_name],$ed_param);
                                    }
                                    if($wave){
                                        $content["{$sht_name}{$env_type}{$param_name}描述"] .= desc_judge($wave,$ed_param,"全距");
                                    }
                                }

                                $date_judge = $this->judge_date(array_filter($table_range_std_date,function($x){
                                    return strpos($x['sheet_name'],"温度") !== false;
                                }));
                                $content["{$sht_name}{$param_name}稳定性较差日期"] = isset($date_judge['bad'])?$date_judge['bad']:'';
                                $content["{$sht_name}{$param_name}稳定性较好日期"] = isset($date_judge['good'])?$date_judge['good']:'';

                            }
                        }
                    }
                }

                $std_des_data = array();
                if($day_range){
                    foreach ($day_range as $dr_p=>$dr_datas) {
                        $dr_p_name =  $this->params[$dr_p]['name'];
                        if($dr_datas&&isset($dr_datas[$sht_name])){
                            $content["{$sht_name}{$dr_p_name}日波动描述"] = desc_judge($dr_datas[$sht_name],$dr_p,"日波动");
                            if($dr_datas[$sht_name]){
                                foreach ($dr_datas[$sht_name] as $env_name=>$dr_data) {
                                    $std_des_data[$env_name]['range'] = $dr_data;
                                }
                            }
                        }
                    }
                }
                if($std_data){
                    foreach ($std_data as $std_p=>$std_val) {
                        $std_p_name =  $this->params[$std_p]['name'];
                        if($std_val&&isset($std_val[$sht_name])){
                            if($std_val[$sht_name]){
                                foreach ($std_val[$sht_name] as $env_name=>$val) {
                                    $std_des_data[$env_name]['std'] = $val;
                                }
                            }
                            $content["{$sht_name}{$std_p_name}标准差描述"] = desc_judge($std_des_data,$std_p,"标准差");
                        }
                    }
                }
                
            }
        }
        /*********************  写入数据库 ********************/
        if($content){
            $content_col = "`report_id`,`content_key`,`content_value`,`create_time`";
            $content_val = array();
            foreach($content as $key=>$val){
                $content_val[] = '('.$report_id.',"'.$key.'","'.$val.'",'.time().')';
            }
            $sql = 'replace into content ('.$content_col.') value '.implode(',',$content_val);
            $this->db->query($sql);
        }
        return $content;
    }

    /***
     * 计算每个环境的特征值：波动，极值，变异系数，最大日波动，平均日波动，均值，标准差
     * @param array $arr 基础数据
     * @return array
     */
    function statistic($arr = array()){
        $temp = array(
            'fluctuate'=>array(),
            'min'=>"",
            'max'=>"",
            'average'=>"",
            'sd_array'=>array(),
            'cv'=>"",
            'diff'=>"",
            'max_fluctuate'=>"",
            'avg_fluctuate'=>"",
            'sd'=>''
        );
        if(isset($arr['all'])&&$arr['all']){
            $average = array_sum($arr['all'])/sizeof($arr['all']);
            $temp['average'] = round($average,2);
            $min = min($arr['all']);
            $max = max($arr['all']);
            $temp['min'] = $min;
            $temp['max'] = $max;
            $temp['diff'] = $max -$min;
            $sd = get_standard_deviation($arr['all']);
            $temp['sd'] = $sd;
            $temp['cv']=0;
            if($average){
                $temp['cv'] = round($sd/$average * 100,2);
            }
        }

        if(isset($arr['by_date'])&&$arr['by_date']){
            $ex_array = array();//日波动数组
            $sd_array = array();//日波动数组
            foreach($arr['by_date'] as $date=>$arr_bd){
                if($arr_bd){
                    $ex = max($arr_bd) - min($arr_bd);
                    $ex_array[$date] = $ex;
                }
                $sd_array[$date] = get_standard_deviation($arr_bd);
            }
            if($ex_array){
                $temp['max_fluctuate'] = max($ex_array);
                $temp['avg_fluctuate'] = round(array_sum($ex_array)/sizeof($ex_array),2);
                $temp['fluctuate'] = $ex_array;
                $temp['sd_array'] = $sd_array;
            }
        }
        return $temp;
    }

    /**
     * 判断最好及最坏的日期
     * @param $data
     * @return array
     */
    function judge_date($data){
        $bad_dates = array_count_values(array_merge(array_column($data, 'range_max_date'), array_column($data, 'std_max_date')));
        $bad_date = array_search(max($bad_dates),$bad_dates);
        $good_dates = array_count_values(array_merge(array_column($data, 'range_min_date'), array_column($data, 'std_min_date')));
        $good_date = array_search(max($good_dates),$good_dates);
        return array('bad'=>$bad_date,'good'=>$good_date);
    }

    /**
     * 保存均峰图，箱型图及对应表格数据并返回图表数据
     * @param $box_pole_std
     * @return array
     */
    function _box_pole_std_save($box_pole_std)
    {
        $report_id = $this->report['id'];

        $image_val = array();
        $images = array();
        //表格数据
        if(isset($box_pole_std['table_data_desc'])&&$box_pole_std['table_data_desc']){
            $col = "`report_id`,`sheet_name`,`env_name`,`total_count`,`range`,`min`,`max`,avg,`std`";
            $val = array();
            foreach ($box_pole_std['table_data_desc'] as $item) {
                $val[] = '("'.implode('","',array_values($item)).'")';
            }
            $sql = 'replace into table_data_desc ('.$col.') values '.implode(',',$val);
            $this->db->query($sql);
        }

        //离群值数量图
        if(isset($box_pole_std['outliner'])&&$box_pole_std['outliner']){
            foreach ($box_pole_std['outliner'] as $outl_p=>$outl_datas) {
                if($outl_datas){
                    foreach ($outl_datas as $sht_name=>$outl_data) {
                        $image_key = "{$sht_name}{$this->params[$outl_p]['name']}离群值数量图";
                        $image = array(
                            'image_key'=>$image_key,
                            'image_type' => 'bar',
                            'image_data' => json_encode(array(
                                'unit'=>$this->params[$outl_p]['unit'],
                                'data'=>$outl_data
                            )),
                            'unit'=>isset($this->params[$outl_p]['unit'])?$this->params[$outl_p]['unit']:""
                        );
                        $images[] = $image;
                    }
                }
            }
        }

        //箱型图
        if(isset($box_pole_std['boxplot'])&&$box_pole_std['boxplot']){
            foreach ($box_pole_std['boxplot'] as $bp_p=>$bp_datas) {
                if($bp_datas){
                    foreach ($bp_datas as $sht_name=>$bp_data) {
                        $image_key = "{$sht_name}{$this->params[$bp_p]['name']}箱型图";
                        $image = array(
                            'image_type'=>'box_plot',
                            'image_key'=>$image_key,
                            'image_data'=>json_encode(array(
                                'unit'=>$this->params[$bp_p]['unit'],
                                'data'=>$bp_data
                            )),
                            'unit'=>isset($this->params[$bp_p]['unit'])?$this->params[$bp_p]['unit']:""
                        );
                        $images[] = $image;
                    }
                }
            }
        }

        //均峰图
        if(isset($box_pole_std['avg_pole'])&&$box_pole_std['avg_pole']){
            foreach ($box_pole_std['avg_pole'] as $avg_p=>$avg_datas) {
                if($avg_datas){
                    foreach ($avg_datas as $sht_name=>$avg_data) {
                        $image_key = "{$sht_name}{$this->params[$avg_p]['name']}均峰图";
                        $image = array(
                            'image_type' => 'peak_average_valley',
                            'image_key' => $image_key,
                            'image_data' => json_encode(array(
                                'unit'=>$this->params[$avg_p]['unit'],
                                'data'=>$avg_data
                            )),
                            'unit'=>isset($this->params[$avg_p]['unit'])?$this->params[$avg_p]['unit']:""
                        );
                        $images[] = $image;
                    }
                }
            }
        }
        //均峰图（已剔除离群值）
        if(isset($box_pole_std['avg_pole_rm_outliner'])&&$box_pole_std['avg_pole_rm_outliner']){
            foreach ($box_pole_std['avg_pole_rm_outliner'] as $avg_pro_p=>$avg_pro_datas) {
                foreach ($avg_pro_datas as $sht_name=>$avg_pro_data) {
                    $image_key = "{$sht_name}{$this->params[$avg_pro_p]['name']}均峰图（已剔除离群值）";
                    $image = array(
                        'image_key'=>$image_key,
                        'image_type' => 'peak_average_valley',
                        'image_data' => json_encode(array(
                            'unit'=>$this->params[$avg_pro_p]['unit'],
                            'data'=>$avg_pro_data
                        )),
                        'unit'=>isset($params[$avg_pro_p]['unit'])?$params[$avg_pro_p]['unit']:""
                    );
                    $images[] = $image;
                }
            }
        }

        //标准差条形图
        if(isset($box_pole_std['std_data'])&&$box_pole_std['std_data']){
            foreach ($box_pole_std['std_data'] as $std_p=>$std_vals) {
                if($std_vals){
                    foreach ($std_vals as $sht_name=>$std_val) {
                        $image_key = "{$sht_name}{$this->params[$std_p]['name']}标准差条形图";
                        $image = array(
                            'image_key'=>$image_key,
                            'image_type' => 'bar',
                            'image_data' => json_encode(array(
                                'unit'=>"",
                                'data'=>$std_val
                            )),
                            'unit'=>isset($this->params[$std_p]['unit'])?$this->params[$std_p]['unit']:""
                        );
                        $images[] = $image;
                    }
                }
            }
        }
        //标准差条形图（已剔除离群值）
        if(isset($box_pole_std['std_data_rm_outliner'])&&$box_pole_std['std_data_rm_outliner']){
            foreach ($box_pole_std['std_data_rm_outliner'] as $std_p=>$std_dros) {
                if($std_dros){
                    foreach ($std_dros as $sht_name=>$std_drotd) {
                        $image_key = "{$sht_name}{$this->params[$std_p]['name']}标准差条形图（已剔除离群值）";
                        $image = array(
                            'image_key'=>$image_key,
                            'image_type' => 'bar',
                            'image_data' => json_encode(array(
                                'unit'=>"",
                                'data'=>$std_drotd
                            )),
                            'unit'=>isset($this->params[$std_p]['unit'])?$this->params[$std_p]['unit']:""
                        );
                        $images[] = $image;
                    }
                }
            }
        }

        $return_data = array(
            'images'=>$images
        );
        return $return_data;
    }

    /***
     * 保存日波动及，标准差及对应表格数据，并返回图片数据
     * @param $range_std
     * @return array
     */
    function _range_std_save($range_std)
    {
        $report_id = $this->report['id'];

        $image_val = array();
        $images = array();
        //表格数据
        if(isset($range_std['table_range_std_day'])&&$range_std['table_range_std_day']){
            $col = "`report_id`,`sheet_name`,`env_name`,`range_min`,`range_max`,`range_avg`,`std_min`,`std_max`,`std_avg`";
            $val = array();
            foreach ($range_std['table_range_std_day'] as $item) {
                $val[] = '("'.implode('","',array_values($item)).'")';
            }
            $sql = 'replace into table_rang_std_day ('.$col.') values '.implode(',',$val);
            $this->db->query($sql);
        }

        if(isset($range_std['table_range_std_date'])&&$range_std['table_range_std_date']){
            $col = "`report_id`,`sheet_name`,`env_name`,`range_max_date`,`range_min_date`,`std_max_date`,`std_min_date`";
            $val = array();
            foreach ($range_std['table_range_std_date'] as $item) {
                $val[] = '("'.implode('","',array_values($item)).'")';
            }
            $sql = 'replace into table_rang_std_date ('.$col.') values '.implode(',',$val);
            $this->db->query($sql);
        }

        //日波动均峰图
        if(isset($range_std['day_range'])&&$range_std['day_range']){
            foreach ($range_std['day_range'] as $d_p=>$d_ranges) {
                if($d_ranges){
                    foreach ($d_ranges as $sht_name=>$d_range) {
                        $image_key = "{$sht_name}{$this->params[$d_p]['name']}日波动均峰图";
                        $image = array(
                            'image_key'=>$image_key,
                            'image_type' => 'peak_average_valley',
                            'image_data' => json_encode(array(
                                'unit'=>$this->params[$d_p]['unit'],
                                'data'=>$d_range
                            )),
                            'unit'=>isset($this->params[$d_p]['unit'])?$this->params[$d_p]['unit']:""
                        );
                        $images[] = $image;
                    }
                }
            }
        }
        //标准差均峰图
        if(isset($range_std['day_std'])&&$range_std['day_std']){
            foreach ($range_std['day_std'] as $ds_p=>$sd_datas) {
                if($sd_datas){
                    foreach ($sd_datas as $sht_name=>$sd_data) {
                        $image_key = "{$sht_name}{$this->params[$ds_p]['name']}标准差均峰图";
                        $image = array(
                            'image_key'=>$image_key,
                            'image_type' => 'peak_average_valley',
                            'image_data' => json_encode(array(
                                'unit'=>"",
                                'data'=>$sd_data
                            )),
                            'unit'=>isset($this->params[$ds_p]['unit'])?$this->params[$ds_p]['unit']:""
                        );
                        $images[] = $image;
                    }
                }
            }
        }

        $return_data = array(
            'images'=>$images
        );

        return $return_data;
    }

    /**
     * 按环境类型（小，微环境）计算对应的箱型图
     * @param $datas
     * @param $sheet_name
     * @return array
     */
    function _boxplot_by_type($datas,$sheet_name)
    {
        $return_data = array();
        foreach ($datas as $env_type=>$data) {
            if(!isset($return_data[$env_type])){
                $return_data[$env_type] = array();
            }
            if($data){
                foreach ($data as $env_name=>$d) {
                    if($d){
                        foreach ($d as $dp=>$dp_val) {
                            if(!isset($return_data[$env_type][$dp])){
                                $return_data[$env_type][$dp] = array();
                            }
                            if(!isset($return_data[$env_type][$dp][$sheet_name])){
                                $return_data[$env_type][$dp][$sheet_name] = array();
                            }
                            $return_data[$env_type][$dp][$sheet_name][$env_name] = calc_boxplot($dp_val);
                        }
                    }
                }
            }
        }
        return $return_data;
    }


    function has_data()
    {
        $report_id = $this->get_post('report_id');
        $floor_no = $this->get_post('floor_no');

        // 报告参数
        $report = M("report")->fetOne('id = '.$report_id);
        $this->report = $report;
        $day_seconds = 24*2600 - 1;
        if(isset($report['report_time_range'])&&$report['report_time_range']){
            $time = explode("-",$report['report_time_range']);
            $stime = isset($time[0])?strtotime($time[0]):"";
            $etime = isset($time[1])?strtotime($time[1])+$day_seconds:"";
        }else{
            $season = ceil((date('n'))/3)-1;//上季度是第几季度
            $stime = mktime(0, 0, 0,$season*3-3+1,1,date('Y'));
            $etime = mktime(23,59,59,$season*3,date('t',mktime(0, 0 , 0,$season*3,1,date("Y"))),date('Y'));
        }

        $data_sensor =  API("get/env/common/monitor_data/data_count",array(
            'env_no'=>$floor_no,
            'time'=>$stime.",".$etime,
            'params'=>"temperature,humidity,co2,light,uv,voc"
        ));

        $floor = API("get/base/envs/info/".$floor_no);
        if(!$floor){
            $this->response(array('error'=>"未找到楼层信息"));
        }
        $content = array(
            'content_key' => $floor['name'],
            'content_value' =>1
        );
        if(isset($data_sensor['total'])&&$data_sensor['total'] == 0){
            $content = array(
                'content_key' => $floor['name'],
                'content_value' =>0
            );
        }

        $content_col = "`report_id`,`content_key`,`content_value`,`create_time`";
        $sql = 'replace into content ('.$content_col.') value '. '('.$report_id.',"'.$content['content_key'].'",'.$content['content_value'].','.time().')';
        $this->db->query($sql);

        $layout = $this->_layout($floor_no);
//        $this->response($layout);
        if(isset($layout['image']) && $layout['image']){
            $layout_image = array(
                'report_id'=>$report_id,
            );
            $layout_image = array_merge($layout_image,$layout['image']);
            $layout_image['image_data'] = json_encode($layout_image['image_data']);

            $this->db->replace('images',$layout_image);
        }
        $data = array('report_id'=>$report_id,"msg"=>"处理成功");
        $data['map'] = $layout['map'];
        $this->response(array('error'=>false,'data'=>$data));
    }

    function _layout($floor_no)
    {
        $areas = API("get/base/envs");
        $hall_info = array();
        if($areas['rows']){
            foreach ($areas['rows'] as $area) {
                if(isset($area['env_no'])&&$area['env_no'] == $floor_no){
                    $hall_info = $area;
                }
            }
        }
        $envs = array();
        $parent_env_nos = array($floor_no);
        $children = get_children($areas['rows'],$floor_no);
        if($children){
            foreach ($children as $k => $child) {
                if(isset($child['parent_env_no'])&&$child['parent_env_no'] == $floor_no){
                    $envs[] = array(
                        'env_no'=>$child['env_no'],
                        'name'=>$child['name'],
                        'locate'=>$child['locate']
                    );
                }
                $parent_env_nos[] = $child['env_no'];
            }
        }
        $report = $this->report;
        if(isset($report['report_time_range'])&&$report['report_time_range']){
            $time = explode("-",$report['report_time_range']);
            $stime = isset($time[0])?strtotime($time[0]):"";
            $etime = isset($time[1])?strtotime($time[1])+ 24*3600 -1:"";
        }else{
            $season = ceil((date('n'))/3)-1;//上季度是第几季度
            $stime = mktime(0, 0, 0,$season*3-3+1,1,date('Y'));
            $etime = mktime(23,59,59,$season*3,date('t',mktime(0, 0 , 0,$season*3,1,date("Y"))),date('Y'));
        }

        $all_equips = array();
        if($parent_env_nos){
            $equip_nos = API("get/env/common/equip_from_ds",array('env_no'=>implode(",",$parent_env_nos),'stime'=>$stime,'etime'=>$etime));
            $equips = API("get/env/equipments/manage/all_equip",array('equip_no'=>implode(",",$equip_nos)));

            if(isset($equips['rows'])){
                foreach ($equips['rows'] as $equip) {
                    $all_equips[] = array(
                        'equip_no'=>$equip['equip_no'],
                        'name'=>$equip['name'],
                        'equip_type'=>$equip['equip_type'],
                        'status'=>$equip['status'],
                        'locate'=>$equip['locate']
                    );
                }
            }
        }

        $data = array(
            'map'=>false,
            'width'=>"",
            'height'=>"",
            'equips'=>array(),
            'envs'=>array(),
        );

        if(isset($hall_info['map'])&&$hall_info['map']){
            $url = $_SERVER['DOCUMENT_ROOT'].$hall_info['map'];
            if(file_exists($url)){
                $data['map'] = $hall_info['map'];
                list($width, $height, $type, $attr) = getimagesize($url);
                $data['width'] = $width;
                $data['height'] = $height;
            }
        }

        if($all_equips){
            $data['equips'] = $all_equips;
        }
        if($envs){
            $data['envs'] = $envs;
        }
//return $envs;
        $image = array(
            'image_key'=>$hall_info['name']."平面图",
            'image_type'=>"layout",
            'image_data'=>$data,
        );

        return  array('map'=>$data['map'],"image"=>$image);
    }
}