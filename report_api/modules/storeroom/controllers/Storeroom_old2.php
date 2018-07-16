<?php

/**
 * Created by PhpStorm.
 * User: Hebj
 * Date: 2017/5/4
 * Time: 17:17
 */
class Storeroom_old2 extends MY_Controller{
    public function __construct()
    {
        parent::__construct();

    }

    public function index_get(){
        $report_id = $this->get_post('report_id');
        $param = $this->get_post('param');
        $type = $this->get_post('type');
        $floor_no = $this->get_post('floor_no');

        if(!$param){
            $param = 'temperature,humidity';
        }
        $param = explode(',',$param);
        //设备参数信息
        $parameters = API("get/env/equipments/equip_parameters/sensor");
        $params = array();
        if(isset($parameters['sensor'])&&$parameters['sensor']){
            foreach($parameters['sensor'] as $p=>$parameter){
                if($p == "humidity"){
                    $parameter['name'] = "湿度";
                }
                $params[$p] = $parameter;
            }
        }
        // 报告参数
        $report = M("report")->fetOne('id = '.$report_id);
        if(isset($report['report_time_range'])&&$report['report_time_range']){
            $time = explode("-",$report['report_time_range']);
            $stime = isset($time[0])?strtotime($time[0]):"";
            $etime = isset($time[1])?strtotime($time[1])+ 24*3600 -1:"";
        }else{
            $season = ceil((date('n'))/3)-1;//上季度是第几季度
            $stime = mktime(0, 0, 0,$season*3-3+1,1,date('Y'));
            $etime = mktime(23,59,59,$season*3,date('t',mktime(0, 0 , 0,$season*3,1,date("Y"))),date('Y'));
        }
//        $stime = strtotime('2017-4-1');
//        $etime = strtotime('2017-4-7');

        $floor = API("get/base/envs/info/".$floor_no);
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

        //定义变量
        $content = array();//内容
        $table_data_desc = array();//统计表格数据
        $table_range_std_date = array();//日波动，标准差极值日期数据
        $table_range_std_day = array();//日波动，标准差极值表格数据
        $all_data = array();//所有数据
        $env_names = array();
        $boxplot = array();//箱型图
        $avg_pole = array();//均峰图
        $avg_pole_rm_outliner = array();//均峰图(剔除离群值)
        $std_data = array();//标准差
        $std_data_rm_outliner = array();//标准差(剔除离群值)
        $outliner = array();//离群点
        $day_range = array();//日波动均峰图
        $day_std = array();//标准差均峰图
        $calendar = array();//日历图
        $images = array();//图表数据
        $month = array(date("Y-m",$stime));//时间内的月份
        $all = array();//
        $floor_data = array();//整层数据统合-------为日历图做准备
        $env_data_by_type = array();
        //列出月份
        $add_time = $stime;
        while(($add_time = strtotime('+1 month', $add_time)) < $etime){
            $month[] = date("Y-m",$add_time);
        }
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
                            'micro'=>array(),//微环境
                            'small'=>array()//小环境
                        );
                    }
                    if(isset($row['type'])&&$row['type'] == $type){
                        //原始数据
                        $data_sensor =  API("get/env/common/monitor_data",array(
                            'env_no'=>$env_no,
                            'time'=>$stime.",".$etime,
                            'params'=>implode(',',$param)
                        ));
                        $pdata = array();
                        $day_data = array();
                        if(isset($data_sensor['rows'])&&$data_sensor['rows']){
//                            $this->response($data_sensor);
                            foreach($data_sensor['rows'] as $ds_row){
                                $date = date("m月d日",$ds_row['equip_time']);
                                $calendar_date = date("Y-m-d",$ds_row['equip_time']);
                                if(isset($ds_row['env_no'])&&$ds_row['env_no']){
                                    if(isset($env_info[$ds_row['env_no']])){
                                        $name = $env_info[$ds_row['env_no']]['name'];
                                    }
                                    $row_name = $name.substr($ds_row['equip_no'],-4);
                                    //整合所有数据--按监测点分类(环境+设备编码后四位)
//                                $all_data[$sheet_name][] = $ds_row;
                                    if($ds_row['env_no'] == $env_no){
                                        $env_data_by_type[$sheet_name]['micro'][] = $ds_row;
                                    }else{
                                        $env_data_by_type[$sheet_name]['small'][] = $ds_row;
                                    }

                                    foreach ($param as $p) {
                                        //统合温度数据
                                        if(isset($ds_row[$p])&&$ds_row[$p] != null&&$ds_row[$p] != "NaN"&&$ds_row[$p] != ""){
                                            //所有数据
                                            if(!isset($pdata[$p])){
                                                $pdata[$p] = array();
                                            }
                                            if(!isset($pdata[$p][$row_name])){
                                                $pdata[$p][$row_name] = array();
                                            }
                                            $pdata[$p][$row_name][$ds_row['equip_time']] = $ds_row[$p];

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
                            if($pdata){
                                foreach($pdata as $p=>$datas){
                                    /**********初始化**********/
                                    if(!isset($boxplot[$p])){
                                        $boxplot[$p] = array();
                                    }
                                    if(!isset($boxplot[$p][$sheet_name])){
                                        $boxplot[$p][$sheet_name] = array();
                                    }
                                    if(!isset($outliner[$p])){
                                        $outliner[$p] = array();
                                    }
                                    if(!isset($outliner[$p][$sheet_name])){
                                        $outliner[$p][$sheet_name] = array();
                                    }
                                    if(!isset($avg_pole[$p])){
                                        $avg_pole[$p] = array();
                                    }
                                    if(!isset($avg_pole[$p][$sheet_name])){
                                        $avg_pole[$p][$sheet_name] = array();
                                    }
                                    if(!isset($avg_pole_rm_outliner[$p])){
                                        $avg_pole_rm_outliner[$p] = array();
                                    }
                                    if(!isset($avg_pole_rm_outliner[$p][$sheet_name])){
                                        $avg_pole_rm_outliner[$p][$sheet_name] = array();
                                    }
                                    if(!isset($std_data[$p])){
                                        $std_data[$p] = array();
                                    }
                                    if(!isset($std_data[$p][$sheet_name])){
                                        $std_data[$p][$sheet_name] = array();
                                    }
                                    if(!isset($std_data_rm_outliner[$p])){
                                        $std_data_rm_outliner[$p] = array();
                                    }
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

                                            //均峰图
                                            $min = round(min($d),2);
                                            $max = round(max($d),2);
                                            $avg = round(array_sum($d)/sizeof($d),2);
                                            $avg_pole[$p][$sheet_name][$monitor_point] = array($max,$min,$avg);

                                            //标准差
                                            $std = get_standard_deviation($d);
                                            $std_data[$p][$sheet_name][$monitor_point] = $std;

                                            $table_data_desc[] = array(
                                                'report_id'=>$report_id,
                                                'sheet_name' =>"{$sheet_name}{$params[$p]['name']}数据描述性统计量",
                                                'env_name' => $monitor_point,
                                                'total_count' => count($d),
                                                'range' => round($max - $min, 2),
                                                'min' => $min,
                                                'max' => $max,
                                                'avg' => $avg ?$avg : 0,
                                                'std' => $std
                                            );

                                            $d_rm_outliner = remove_outliers($d);//剔除离群值
                                            //均峰图--剔除离群值
                                            $min_ro = round(min($d_rm_outliner),2);
                                            $max_ro = round(max($d_rm_outliner),2);
                                            $avg_rm_outliner = round(array_sum($d_rm_outliner)/sizeof($d_rm_outliner),2);
                                            $avg_pole_rm_outliner[$p][$sheet_name][$monitor_point] = array($max_ro,$min_ro,$avg_rm_outliner);

                                            //标准差
                                            $std_outliner = get_standard_deviation($d_rm_outliner);
                                            $std_data_rm_outliner[$p][$sheet_name][$monitor_point] = $std_outliner;

                                            $table_data_desc[] =  array(
                                                'report_id'=>$report_id,
                                                'sheet_name' => "{$sheet_name}{$params[$p]['name']}数据描述性统计量（已剔除离群值）",
                                                'env_name' => $monitor_point,
                                                'total_count' => count($d_rm_outliner),
                                                'range' => round($max_ro-$min_ro, 2),
                                                'min' => $min_ro,
                                                'max' => $max_ro,
                                                'avg' => $avg_rm_outliner ? $avg_rm_outliner : 0,
                                                'std' => $std_outliner
                                            );
                                        }
                                    }
                                }
                            }

                            //各监测点的波动数据
                            if($day_data){
                                foreach ($day_data as $p=>$d_data) {
                                    if($d_data){
                                        foreach ($d_data as $monitor_point=>$date_data) {
                                            if($date_data){
                                                $range = array();
                                                $std_array = array();
                                                foreach ($date_data as $day=>$dd) {
                                                    $range[$day] = round(max($dd) - min($dd),2);
                                                    $std_array[$day] = get_standard_deviation($dd);
                                                }

                                                $table_range_std = $table_range_std_day[] = array(
                                                    'report_id'=>$report_id,
                                                    'sheet_name' => $sheet_name.$params[$p]['name'].'日波动及标准差统计表',
                                                    'env_name' => $monitor_point,
                                                    'range_min' => round(min($range),2),
                                                    'range_max' => round(max($range),2),
                                                    'range_avg' => count($range) ? round(array_sum($range)/count($range), 2) : 0,
                                                    'std_min' => round(min($std_array),2),
                                                    'std_max' => round(max($std_array),2),
                                                    'std_avg' => count($std_array) ? round(array_sum($std_array)/count($std_array), 2) : 0,
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
                                                    'sheet_name' =>$sheet_name.$params[$p]['name'].'日波动、标准差极值发生的日期列表',
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
                            }
                        }
                    }
                }
            }
        }
        //整层波动数据
        if($floor_data){
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
                                $floor_range[$row_name] = round(max($fd_vals) - min($fd_vals),2);
                            }
                            if($floor_range){
                                $temp_range = round(array_sum($floor_range)/sizeof($floor_range),2);
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

        }
//        $this->response($env_info);
        //文字性参数
        if($env_data_by_type){
            foreach ($env_data_by_type as $sht_name=>$ed_datas) {
                if($ed_datas){
                    foreach ($ed_datas as $ed_env=>$ed_data) {
                        if($ed_env == 'micro'){
                            $env_type = "微环境";
                        }else {
                            $env_type = "小环境";
                        }
                        foreach ($param as $ed_param) {
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

                            if($ed_data){
                                $min_temp = array_shift($ed_data);
                                while(is_null($min_temp[$ed_param])){
                                    $min_temp = array_shift($ed_data);
                                }
                                $max_temp = array_pop($ed_data);
                                while(is_null($max_temp[$ed_param])){
                                    $max_temp = array_shift($ed_data);
                                }

                                $content["{$sht_name}{$env_type}{$params[$ed_param]['name']}最小值"] = isset($min_temp[$ed_param])?$min_temp[$ed_param]:'';
                                $content["{$sht_name}{$env_type}{$params[$ed_param]['name']}最小值环境"] = isset($env_info[$min_temp['env_no']])?$env_info[$min_temp['env_no']]['name']:'';
                                $content["{$sht_name}{$env_type}{$params[$ed_param]['name']}最大值"] = isset($max_temp[$ed_param])?$max_temp[$ed_param]:"";
                                $content["{$sht_name}{$env_type}{$params[$ed_param]['name']}最大值环境"] = isset($env_info[$max_temp['env_no']])?$env_info[$max_temp['env_no']]['name']:'';
                                $content["{$sht_name}{$env_type}{$params[$ed_param]['name']}描述"] = '';
                                if(isset($boxplot[$ed_param])&&isset($boxplot[$ed_param][$sht_name])){
                                    $content["{$sht_name}{$env_type}{$params[$ed_param]['name']}描述"] = desc_judge($boxplot[$ed_param][$sht_name],$ed_param);
                                }

                                if(isset($std_data[$ed_param])&&isset($std_data[$ed_param][$sht_name])){
                                    $content["{$sht_name}{$env_type}{$params[$ed_param]['name']}标准差描述"] = desc_judge($std_data[$ed_param][$sht_name],$ed_param,"标准差");
                                }
                                $date_judge = $this->judge_date(array_filter($table_range_std_date,function($x){
                                    return strpos($x['sheet_name'],"温度") !== false;
                                }));
                                $content["{$sht_name}{$params[$ed_param]['name']}稳定性较差日期"] = isset($date_judge['bad'])?$date_judge['bad']:'';
                                $content["{$sht_name}{$params[$ed_param]['name']}稳定性较好日期"] = isset($date_judge['good'])?$date_judge['good']:'';
                                if($content){
                                    $content_col = "`report_id`,`content_key`,`content_value`,`create_time`";
                                    $content_val = array();
                                    foreach($content as $key=>$val){
                                        $content_val[] = '('.$report_id.',"'.$key.'","'.$val.'",'.time().')';
                                    }
                                    $sql = 'replace into content ('.$content_col.') value '.implode(',',$content_val);
                                    $this->db->query($sql);
                                }
                            }
                        }
                    }
                }
            }
        }
        /****************图表数据写入数据库***************/
        if($table_data_desc){
            $col = "`report_id`,`sheet_name`,`env_name`,`total_count`,`range`,`min`,`max`,avg,`std`";
            $val = array();
            foreach ($table_data_desc as $item) {
                $val[] = '("'.implode('","',array_values($item)).'")';
            }
            $sql = 'replace into table_data_desc ('.$col.') values '.implode(',',$val);
            $this->db->query($sql);
        }
        if($table_range_std_day){
            $col = "`report_id`,`sheet_name`,`env_name`,`range_min`,`range_max`,`range_avg`,`std_min`,`std_max`,`std_avg`";
            $val = array();
            foreach ($table_range_std_day as $item) {
                $val[] = '("'.implode('","',array_values($item)).'")';
            }
            $sql = 'replace into table_rang_std_day ('.$col.') values '.implode(',',$val);
            $this->db->query($sql);
        }
        if($table_range_std_date){
            $col = "`report_id`,`sheet_name`,`env_name`,`range_max_date`,`range_min_date`,`std_max_date`,`std_min_date`";
            $val = array();
            foreach ($table_range_std_date as $item) {
                $val[] = '("'.implode('","',array_values($item)).'")';
            }
            $sql = 'replace into table_rang_std_date ('.$col.') values '.implode(',',$val);
            $this->db->query($sql);
        }
        $image_val = array();
        //箱型图
        if($boxplot){
            foreach ($boxplot as $bp_p=>$bp_datas) {
                if($bp_datas){
                    foreach ($bp_datas as $sht_name=>$bp_data) {
                        $image_key = "{$sht_name}{$params[$bp_p]['name']}箱型图";
                        $image = array(
                            'type'=>'box_plot',
                            'image_key'=>$image_key,
                            'data'=>$bp_data,
                            'unit'=>isset($params[$bp_p]['unit'])?$params[$bp_p]['unit']:""
                        );
                        $image_val[] = array('report_id'=>$report_id,'image_key'=>$image_key,'image_data'=>json_encode($bp_data));
                        $images[] = $image;
                    }
                }
            }
        }

        //均峰图
        if($avg_pole){
            foreach ($avg_pole as $avg_p=>$avg_datas) {
                if($avg_datas){
                    foreach ($avg_datas as $sht_name=>$avg_data) {
                        $image_key = "{$sht_name}{$params[$avg_p]['name']}均峰图";
                        $image = array(
                            'type' => 'peak_average_valley',
                            'image_key' => $image_key,
                            'image_data' => $avg_data,
                            'unit'=>isset($params[$avg_p]['unit'])?$params[$avg_p]['unit']:""
                        );
                        $image_val[] = array('report_id'=>$report_id,'image_key'=>$image_key,'image_data'=>json_encode($avg_data));
                        $images[] = $image;
                    }
                }
            }
        }
        //均峰图（已剔除离群值）
        if($avg_pole_rm_outliner){
            foreach ($avg_pole_rm_outliner as $avg_pro_p=>$avg_pro_datas) {
                foreach ($avg_pro_datas as $sht_name=>$avg_pro__data) {
                    $image_key = "{$sht_name}{$params[$avg_pro_p]['name']}均峰图（已剔除离群值）";
                    $image = array(
                        'image_key'=>$image_key,
                        'type' => 'peak_average_valley',
                        'image_data' => $avg_pro__data,
                        'unit'=>isset($params[$avg_pro_p]['unit'])?$params[$avg_pro_p]['unit']:""
                    );
                    $image_val[] = array('report_id'=>$report_id,'image_key'=>$image_key,'image_data'=>json_encode($avg_pro__data));
                    $images[] = $image;
                }
            }
        }

        //标准差条形图
        if($std_data){
            foreach ($std_data as $std_p=>$std_vals) {
                if($std_vals){
                    foreach ($std_vals as $sht_name=>$std_val) {
                        $image_key = "{$sht_name}{$params[$std_p]['name']}标准差条形图";
                        $image = array(
                            'image_key'=>$image_key,
                            'type' => 'bar',
                            'image_data' => $std_val,
                            'unit'=>isset($params[$std_p]['unit'])?$params[$std_p]['unit']:""
                        );
                        $image_val[] = array('report_id'=>$report_id,'image_key'=>$image_key,'image_data'=>json_encode($std_val));
                        $images[] = $image;
                    }
                }
            }
        }
        //标准差条形图（已剔除离群值）
        if($std_data_rm_outliner){
            foreach ($std_data_rm_outliner as $std_p=>$std_dros) {
                if($std_dros){
                    foreach ($std_dros as $sht_name=>$std_drotd) {
                        $image_key = "{$sht_name}{$params[$std_p]['name']}标准差条形图（已剔除离群值）";
                        $image = array(
                            'image_key'=>$image_key,
                            'type' => 'bar',
                            'image_data' => $std_drotd,
                            'unit'=>isset($params[$std_p]['unit'])?$params[$std_p]['unit']:""
                        );
                        $image_val[] = array('report_id'=>$report_id,'image_key'=>$image_key,'image_data'=>json_encode($std_drotd));
                        $images[] = $image;
                    }
                }
            }
        }
        //日波动均峰图
        if($day_range){
            foreach ($day_range as $d_p=>$d_ranges) {
                if($d_ranges){
                    foreach ($d_ranges as $sht_name=>$d_range) {
                        $image_key = "{$sht_name}{$params[$d_p]['name']}日波动均峰图";
                        $image = array(
                            'image_key'=>$image_key,
                            'type' => 'peak_average_valley',
                            'image_data' => $d_range,
                            'unit'=>isset($params[$d_p]['unit'])?$params[$d_p]['unit']:""
                        );
                        $image_val[] = array('report_id'=>$report_id,'image_key'=>$image_key,'image_data'=>json_encode($d_range));
                        $images[] = $image;
                    }
                }
            }
        }
        //标准差均峰图
        if($day_std){
            foreach ($day_std as $ds_p=>$sd_datas) {
                if($sd_datas){
                    foreach ($sd_datas as $sht_name=>$sd_data) {
                        $image_key = "{$sht_name}{$params[$ds_p]['name']}标准差均峰图";
                        $image = array(
                            'image_key'=>$image_key,
                            'type' => 'peak_average_valley',
                            'image_data' => $sd_data,
                            'unit'=>isset($params[$ds_p]['unit'])?$params[$ds_p]['unit']:""
                        );
                        $image_val[] = array('report_id'=>$report_id,'image_key'=>$image_key,'image_data'=>json_encode($sd_data));
                        $images[] = $image;
                    }
                }
            }
        }

        //离群值数量图
        if($outliner){
            foreach ($outliner as $outl_p=>$outl_datas) {
                if($outl_datas){
                    foreach ($outl_datas as $sht_name=>$outl_data) {
                        $image_key = "{$sht_name}{$params[$outl_p]['name']}离群值数量图";
                        $image = array(
                            'image_key'=>$image_key,
                            'type' => 'bar',
                            'image_data' => $outl_data,
                            'unit'=>isset($params[$outl_p]['unit'])?$params[$outl_p]['unit']:""
                        );
                        $image_val[] =  array('report_id'=>$report_id,'image_key'=>$image_key,'image_data'=>json_encode($outl_data));
                        $images[] = $image;
                    }
                }
            }
        }

        //日历图
        if($calendar){
            foreach ($calendar as $cld_param=>$cld_datas) {
                if($cld_datas){
                    $image_key = "{$cld_datas['sheet_name']}{$params[$cld_param]['name']}日波动日历图";
                    $image = array(
                        'image_key'=>$image_key,
                        'type' => 'calendar',
                        'image_data' => $cld_datas,
                        'unit'=>isset($params[$cld_param]['unit'])?$params[$cld_param]['unit']:""
                    );
                    $image_val[] =  array('report_id'=>$report_id,'image_key'=>$image_key,'image_data'=>json_encode($cld_datas));
                    $images[] = $image;
                }
           }
        }

        if($image_val){
            foreach ($image_val as $item) {
                $image = M("images")->fetOne('report_id = '.$item['report_id'].' and image_key = "'.$item['image_key'].'"');
                if($image){
                    M("images")->update($item,'report_id = '.$item['report_id'].' and image_key = "'.$item['image_key'].'"');
                }else{
                    M("images")->add($item);
                }
           }
        }
        $this->response(array('data'=>array('report_id'=>$report_id,"images"=>$images)));
    }

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

    function judge_date($data){
        $bad_dates = array_count_values(array_merge(array_column($data, 'range_max_date'), array_column($data, 'std_max_date')));
        $bad_date = array_search(max($bad_dates),$bad_dates);
        $good_dates = array_count_values(array_merge(array_column($data, 'range_min_date'), array_column($data, 'std_min_date')));
        $good_date = array_search(max($good_dates),$good_dates);
        return array('bad'=>$bad_date,'good'=>$good_date);
    }

}