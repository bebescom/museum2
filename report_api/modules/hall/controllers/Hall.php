<?php

class Hall extends MY_Controller
{
    protected $report;

    public function index_get(){
        $report_id = $this->get_post('report_id');
        $env_no = $this->get_post('env_no');
        $param = $this->get_post('param');

        // 环境数据
        $envinfo = API("get/base/envs/info/{$env_no}");
        if(empty($envinfo)){
            $this->response(array('error'=>'环境数据未找到'));
        }

        $envs = API("get/base/envs", array(
            'parent_env_no' => $env_no
        ));
        $envchildren = array(
            $envinfo['env_no']=>$envinfo
        );
        if($envs && isset($envs['rows'])){
            foreach ($envs['rows'] as $env) {
                $envchildren[$env['env_no']] = $env;
            }
        }
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

        $method = '';
        switch ($param) {
            case 'temperature':
                $method = 'temperature_humidity';
                define('PARAM_NAME', '温度');
                define('PARAM_UNIT', $params[$param]['unit']);
                break;
            case 'humidity':
                $method = 'temperature_humidity';
                define('PARAM_NAME', '湿度');
                define('PARAM_UNIT', $params[$param]['unit']);
                break;
            case 'regulation':
                $method = 'regulation';
                $param = 'humidity';
                define('PARAM_NAME', '调控设备');
                define('PARAM_UNIT', $params[$param]['unit']);
                break;
            case 'co2':
                $method = 'light_uv_co2_voc';
                define('PARAM_NAME', 'CO2');
                define('PARAM_UNIT', $params[$param]['unit']);
                define('PARAM_THRESHOLD', 1000);
                break;
            case 'light':
                $method = 'light_uv_co2_voc';
                define('PARAM_NAME', '光照');
                define('PARAM_UNIT',$params[$param]['unit']);
                define('PARAM_THRESHOLD', 300);
                break;
            case 'uv':
                $method = 'light_uv_co2_voc';
                define('PARAM_NAME', '紫外');
                define('PARAM_UNIT',$params[$param]['unit']);
                define('PARAM_THRESHOLD', 20);
                break;
            case 'voc':
                $method = 'light_uv_co2_voc';
                define('PARAM_NAME', 'VOC');
                define('PARAM_UNIT', $params[$param]['unit']);
                define('PARAM_THRESHOLD', 300);
                break;
            default:
                $method = 'has_data';
                $param = "temperature,humidity,co2,light,uv,voc";
                break;
        }
        define('DEFAULT_DATA', '-');
        define('PARAM', $param);
        define('HALL_NAME', $envinfo['name']);
        define('HALL_NO', $env_no);


        // 报告参数 
        $report = M("report")->fetOne('id = '.$report_id);
        $this->report = $report;
        if(isset($report['report_time_range'])&&$report['report_time_range']){
            $time = explode("-",$report['report_time_range']);
            $stime = isset($time[0])?strtotime($time[0]):"";
            $etime = isset($time[1])?strtotime($time[1])+ 24*3600 -1:"";
        }else{
            $season = ceil((date('n'))/3)-1;//上季度是第几季度
            $stime = mktime(0, 0, 0,$season*3-3+1,1,date('Y'));
            $etime = mktime(23,59,59,$season*3,date('t',mktime(0, 0 , 0,$season*3,1,date("Y"))),date('Y'));
        }

        // 数据
        if($method === "has_data"){
            $data_total = API("get/env/common/monitor_data/data_count",array(
                'env_no'=>HALL_NO,
                'time'=>$stime.",".$etime,
                'params'=>PARAM
            ));
        }else{
            $data_sensors = API("get/env/common/monitor_data",array(
                'env_no'=>HALL_NO,
                'time'=>$stime.",".$etime,
                'params'=>PARAM
            ));
        }

        // 过滤数据
        if(isset($data_sensors['rows'])&&$data_sensors['rows']){
            foreach ($data_sensors['rows'] as $k => $d) {
                if(HALL_NO!=$d['env_no'] && !isset($envchildren[$d['env_no']])){
                    unset($data_sensors['rows'][$k]);
                }
            }
        }
//        $this->response($data_sensors);

        // 参数方法存在
        if(method_exists($this, $method)){
            if($method === 'has_data'){//判定是否有数据
                if(isset($data_total)&&isset($data_total['total'])){
                    $res = $this->{$method}($data_total['total']);

                    //布局图
                    $layout = $this->_layout(HALL_NO);
                    $res['images'][] = $layout['image'];
//                    $this->response($layout);
                    // 写数据
                    $this->replace_data($report_id, $res);

                    $response = array(
                        'report_id' => $report_id,
                        'msg' => "处理成功",
                        'map'=>$layout['map']
                    );
                    $this->response(array('error'=>false,'data'=>$response));
                }
            }else{
                // 调用方法
                if(isset($data_sensors['rows'])){
                    $res = $this->{$method}($data_sensors['rows'], $envchildren);
//                    $this->response($res);
                    // 写数据
                    $this->replace_data($report_id, $res);
                }
            }
            // 返回数据（nodejs）
            $response = array(
                    'report_id' => $report_id,
                    'msg' => "处理成功"
                );
            $this->response(array('error'=>false,'data'=>$response));
        }else{
            $this->response(array('error'=>'参数方法不存在'));
        }
    }

    // 写入数据
    private function replace_data($report_id ,$data){
        foreach ($data as $t => $d) {   // 表循环
            if($this->db->table_exists($t)){ 
                $exdata = array('report_id'=>$report_id);
                switch ($t) {
                    case 'content':
                        $exdata['create_time'] = time();
                        break;
                }
                foreach ($d as $dd) { // 数据循环
                    if($t=='images'){
                        $dd['image_data'] = json_encode($dd['image_data']);
                    }
                    $this->db->replace($t, array_merge($dd, $exdata));    // replace 数据
                }
            }
        }
    }

    //判定是否有数据
    function has_data($data_total)
    {
        $result = array(
            'content'=>array(),
            'images'=>array()
        );
        $has_data = array(
            'content_key' => HALL_NAME,
            'content_value' =>1
        );

        if($data_total == 0){
            $has_data = array(
                'content_key' => HALL_NAME,
                'content_value' =>0
            );
        }
        $result['content'][] = $has_data;

        return $result;
    }

    // 温湿度
    private function temperature_humidity($rows, $children){
        $has_data = array(
            'content_key' => HALL_NAME.PARAM_NAME,
            'content_value' => 0
        );

        if(!empty($rows)){
            $has_data['content_value'] = 1;
        }

        // 排序 从大到小
        usort($rows, function($a, $b){
            return $a[PARAM] > $b[PARAM] ? -1 : 1;
        });

        // 展柜内/外数据
        $rows_in = array();
        $rows_out = array();
        $equip_nos = array();
        foreach ($rows as $row) {
            if(isset($row[PARAM])&&data_filter($row[PARAM],PARAM)){
                if($row['env_no'] == HALL_NO){
                    array_push($rows_out, $row);
                }else{
                    array_push($rows_in, $row);
                }
                $short_no = substr($row['equip_no'],-4);
                if(!isset($equip_nos[$short_no])){
                    $equip_nos[$short_no] = isset($children[$row['env_no']])&&HALL_NO!=$row['env_no']?$children[$row['env_no']]['name']:"小环境";
                }
            }
        }
        $total = count($rows);
        $total_in = count($rows_in);
        $total_out = count($rows_out);

        // 计算结果
        $result = array();
        $content = array();

        if($equip_nos){
            $content[] = array(
                'content_key' => HALL_NAME.PARAM_NAME."设备",
                'content_value' => json_encode($equip_nos)
            );
        }

        $content[] = $has_data;
//        return array($children,$rows_in[$total_in-1],$rows_in[0],$rows_out[$total_out-1],$rows_out[0]);
        $has_small_env = array(
            'content_key' => HALL_NAME."小环境".PARAM_NAME,
            'content_value' => 0
        );
        $has_micro_env = array(
            'content_key' => HALL_NAME."微环境".PARAM_NAME,
            'content_value' => 0
        );
        if($total_in){
            $has_micro_env['content_value'] = 1;
        }
        if($total_out){
            $has_small_env['content_value'] = 1;
        }
        $content[] = $has_small_env;
        $content[] = $has_micro_env;
        // 整体
        $content[] = array(
                'content_key' => HALL_NAME.PARAM_NAME."数量总数",
                'content_value' => $total
            );
        $content[] = array(
                'content_key' => HALL_NAME.PARAM_NAME."最小值",
                'content_value' => isset($rows[$total-1]) ? $rows[$total-1][PARAM] : DEFAULT_DATA
            );
        $content[] = array(
                'content_key' => HALL_NAME.PARAM_NAME."最大值",
                'content_value' => isset($rows[0]) ? $rows[0][PARAM] : DEFAULT_DATA
            );
        // 小环境
        if($rows_out){
            $content[] = array(
                'content_key' => HALL_NAME.'小环境'.PARAM_NAME."最小值",
                'content_value' => isset($rows_out[$total_out-1]) ? $rows_out[$total_out-1][PARAM] : DEFAULT_DATA
            );
            $content[] = array(
                'content_key' => HALL_NAME.'小环境'.PARAM_NAME."最大值",
                'content_value' => isset($rows_out[0]) ? $rows_out[0][PARAM] : DEFAULT_DATA
            );
            $content[] = array(
                'content_key' => HALL_NAME.'小环境'.PARAM_NAME."最小值环境",
                'content_value' => isset($rows_out[$total_out-1])&&isset($children[$rows_out[$total_out-1]['env_no']]) ? $children[$rows_out[$total_out-1]['env_no']]['name']."(".substr($rows_out[$total_out-1]['equip_no'],-4).")" : DEFAULT_DATA
            );
            $content[] = array(
                'content_key' => HALL_NAME.'小环境'.PARAM_NAME."最大值环境",
                'content_value' => isset($rows_out[0])&&isset($children[$rows_out[0]['env_no']]) ? $children[$rows_out[0]['env_no']]['name']."(".substr($rows_out[0]['equip_no'],-4).")" : DEFAULT_DATA
            );
        }

        // 微环境
        if($rows_in){
            $content[] = array(
                'content_key' => HALL_NAME.'微环境'.PARAM_NAME."最小值",
                'content_value' => isset($rows_in[$total_in-1]) ? $rows_in[$total_in-1][PARAM] : DEFAULT_DATA
            );
            $content[] = array(
                'content_key' => HALL_NAME.'微环境'.PARAM_NAME."最大值",
                'content_value' => isset($rows_in[0]) ? $rows_in[0][PARAM] : DEFAULT_DATA
            );
            $content[] = array(
                'content_key' => HALL_NAME.'微环境'.PARAM_NAME."最小值环境",
                'content_value' => isset($rows_in[$total_in-1])&&isset($children[$rows_in[$total_in-1]['env_no']]) ? $children[$rows_in[$total_in-1]['env_no']]['name'] : DEFAULT_DATA
            );
            $content[] = array(
                'content_key' => HALL_NAME.'微环境'.PARAM_NAME."最大值环境",
                'content_value' => isset($rows_in[0])&&isset($children[$rows_in[0]['env_no']]) ? $children[$rows_in[0]['env_no']]['name'] : DEFAULT_DATA
            );
        }

        $result['content'] = $content;

        // 描述性统计量
        $th_desc = $this->temperature_humidity_desc($rows, $children);
        $result = array_merge_recursive($result, $th_desc);

        // 日波动
        $th_wave = $this->temperature_humidity_wave($rows, $children);
        $result = array_merge_recursive($result, $th_wave);

        return $result;
    }

    // 温湿度 - 描述性统计
    private function temperature_humidity_desc($rows, $children){
        $result = array();

        // 展柜数据分组
        $rows_group = array();
        foreach ($rows as $row) {
            if(isset($row[PARAM])&&data_filter($row[PARAM],PARAM)){
                $no = $row['env_no'].'-'.$row['equip_no'];
                if(!isset($rows_group[$no])){
                    $rows_group[$no] = array();
                }
                $rows_group[$no][] = (float)$row[PARAM];
            }
        }

        $table_data_desc = array(); // 描述性统计量表
        $images = array(); // 图片

        $image_boxplot = array(); // 箱型图
        $image_bar = array(); // 离群值数量图
        $image_peak_average_valley = array(); // 均峰图
        $image_peak_average_valley2 = array(); // 均峰图（已剔除离群值）
        $image_bar2 = array(); // 标准差条形图
        $image_bar3 = array(); // 标准差条形图（已剔除离群值）

        $std_data = array();//标准差描述数据

        $boxplot = array();
        $boxplot_in = array();
        $boxplot_out = array();
        $boxplot[] = calc_boxplot(array_column($rows, PARAM));
        $wave_in = array();//微环境全距
        $wave_out = array();//小环境全距

        // 遍历展柜
        foreach ($rows_group as $no => $d) {
            $do = remove_outliers($d); //剔除离群值
            list($env_no, $equip_no) = explode('-', $no);
            $env_name = isset($children[$env_no])&&($env_no != HALL_NO)?$children[$env_no]['name']:HALL_NAME;
            $item_name = $env_name."(".substr($equip_no, -4).")";

            // 描述性数据
            $desc = $table_data_desc[] = array(
                    'sheet_name' => HALL_NAME.PARAM_NAME.'数据描述性统计量',
                    'env_name' => $item_name,
                    'total_count' => count($d),
                    'range' => round(max($d)-min($d), 2),
                    'min' => min($d),
                    'max' => max($d),
                    'avg' => count($d) ? round(array_sum($d)/count($d), 2) : 0,
                    'std' => get_standard_deviation($d)
                );
            $desco = $table_data_desc[] = array(
                    'sheet_name' => HALL_NAME.PARAM_NAME.'数据描述性统计量（已剔除离群值）',
                    'env_name' => $item_name,
                    'total_count' => count($do),
                    'range' => round(max($do)-min($do), 2),
                    'min' => min($do),
                    'max' => max($do),
                    'avg' => count($do) ? round(array_sum($do)/count($do), 2) : 0,
                    'std' => get_standard_deviation($do)
                );

            // 箱线图数据
            $pl = $image_boxplot[$item_name] = calc_boxplot($d);
            $image_bar[$item_name] = isset($pl[5]) ? count($pl[5]) : 0;
            $image_peak_average_valley[$item_name] = array($desc['max'], $desc['min'], $desc['avg']);
            $image_peak_average_valley2[$item_name] = array($desco['max'], $desco['min'], $desco['avg']);
            $std_data[$item_name] = array('range'=>$desc['range'],'std'=>$desc['std']);
            $image_bar2[$item_name] = $desc['std'];
            $image_bar3[$item_name] = $desco['std'];
            if($env_no==HALL_NO){   // 外
                $boxplot_out[] = $pl;
                $wave_out[$item_name] = $desc['range'];
            }else{ // 内
                $boxplot_in[] = $pl;
                $wave_in[$item_name] = $desc['range'];
            }
        }
        $result['table_data_desc'] = $table_data_desc;

        // 图片        
        $images[] = array(
                'image_type' => 'box_plot',
                'image_key' => HALL_NAME.PARAM_NAME.'箱型图',
                'image_data' => array(
                    'unit'=>PARAM_UNIT,
                    'data'=>$image_boxplot
                )
            );
        $images[] = array(
                'image_type' => 'bar',
                'image_key' => HALL_NAME.PARAM_NAME.'离群值数量图',
                'image_data' => array(
                    'unit'=>PARAM_UNIT,
                    'data'=>$image_bar
                )
            );
        $images[] = array(
                'image_type' => 'peak_average_valley',
                'image_key' => HALL_NAME.PARAM_NAME.'均峰图',
                'image_data' =>array(
                    'unit'=>PARAM_UNIT,
                    'data'=>$image_peak_average_valley
                )
            );
        $images[] = array(
                'image_type' => 'peak_average_valley',
                'image_key' => HALL_NAME.PARAM_NAME.'均峰图（已剔除离群值）',
                'image_data' => array(
                    'unit'=>PARAM_UNIT,
                    'data'=>$image_peak_average_valley2
                )
            );
        $images[] = array(
                'image_type' => 'bar',
                'image_key' => HALL_NAME.PARAM_NAME.'标准差条形图',
                'image_data' => array(
                    'unit'=>"",
                    'data'=>$image_bar2
                )
            );
        $images[] = array(
                'image_type' => 'bar',
                'image_key' => HALL_NAME.PARAM_NAME.'标准差条形图（已剔除离群值）',
                'image_data' => array(
                    'unit'=>"",
                    'data'=>$image_bar3
                )
            );
        $result['images'] = $images;


        $content = array();
        $content[] = array(
                'content_key' => HALL_NAME.PARAM_NAME."描述",
                'content_value' => desc_judge($boxplot, PARAM)
            );
        if($boxplot_out){
            $content[] = array(
                'content_key' => HALL_NAME.'小环境'.PARAM_NAME."描述",
                'content_value' => desc_judge($boxplot_out, PARAM).desc_judge($wave_out,PARAM,"全距")
            );
        }
        if($boxplot_in){
            $content[] = array(
                'content_key' => HALL_NAME.'微环境'.PARAM_NAME."描述",
                'content_value' => desc_judge($boxplot_in, PARAM).desc_judge($wave_in,PARAM,"全距")
            );
        }
        $content[] = array(
                'content_key' => HALL_NAME.PARAM_NAME."标准差描述",
                'content_value' => desc_judge($std_data, PARAM, '标准差')
            );
        $result['content'] = $content;

        return $result;
    }

    // 温湿度 - 日波动
    private function temperature_humidity_wave($rows, $children){
        $result = array();
        // 时间排序
        usort($rows, function($a, $b){
            return $a['equip_time'] > $b['equip_time'] ? 1 : -1;
        });

        $rows_wave = array();
        $calendar_wave = array();
        foreach ($rows as $row) {
            if(isset($row[PARAM])&&data_filter($row[PARAM],PARAM)){
                $no = $row['env_no'].'-'.$row['equip_no'];
                $day = date('m月d日', $row['equip_time']);
                $c_day = date('Y-m-d', $row['equip_time']);
                if(!isset($rows_wave[$no])){
                    $rows_wave[$no] = array();
                }
                if(!isset($rows_wave[$no][$day])){
                    $rows_wave[$no][$day] = array();
                }
                $rows_wave[$no][$day][] = (float)$row[PARAM];

                /************日历图*************/
                if(!isset($calendar_wave[$c_day])){
                    $calendar_wave[$c_day] = array();
                }
                if(!isset($calendar_wave[$c_day][$no])){
                    $calendar_wave[$c_day][$no] = array();
                }
                $calendar_wave[$c_day][$no][] = (float)$row[PARAM];
            }
        }
        
        $table_rang_std_day = array(); // 日波动及标准差统计表
        $table_rang_std_date = array(); // 日波动、标准差极值发生的日期列表
        $images = array(); // 图片

        $image_peak_average_valley3 = array(); // 日波动均峰图
        $image_peak_average_valley4 = array(); // 标准差均峰图

        $max_wave = array();
        $calendar_range = array();//日历图
        // 展柜遍历
        foreach ($rows_wave as $no => $row) {
            list($env_no, $equip_no) = explode('-', $no);
            $env_name = isset($children[$env_no])&&($env_no != HALL_NO)?$children[$env_no]['name']:HALL_NAME;
            $item_name = $env_name."(".substr($equip_no, -4).")";
            $range = array();    // 日波动
            $std = array(); // 日标准差
            foreach ($row as $day => $d) {
                $range[$day] = round(max($d)-min($d), 2);
                $std[$day] = get_standard_deviation($d);
            }
            $desc = $table_rang_std_day[] = array(
                    'sheet_name' => HALL_NAME.PARAM_NAME.'日波动及标准差统计表',
                    'env_name' => $item_name,
                    'range_min' => min($range),
                    'range_max' => max($range),
                    'range_avg' => count($range) ? round(array_sum($range)/count($range), 2) : 0,
                    'std_min' => min($std),
                    'std_max' => max($std),
                    'std_avg' => count($std) ? round(array_sum($std)/count($std), 2) : 0,
                );
            $table_rang_std_date[] = array(
                    'sheet_name' => HALL_NAME.PARAM_NAME.'日波动、标准差极值发生的日期列表',
                    'env_name' => $item_name,
                    'range_max_date' => array_search(max($range), $range),
                    'range_min_date' => array_search(min($range), $range),
                    'std_max_date' => array_search(max($std), $std),
                    'std_min_date' => array_search(min($std), $std),
                );
            $image_peak_average_valley3[$item_name] = array($desc['range_max'], $desc['range_min'], $desc['range_avg']);
            $image_peak_average_valley4[$item_name] = array($desc['std_max'], $desc['std_min'], $desc['std_avg']);

            $max_wave[$item_name] = $desc['range_max'];
        }

        /***************日历图*****************/
        $calendar_range = array();
        if($calendar_wave){
            foreach ($calendar_wave as $c_day=> $no_datas) {
                $temp_range = array();
                if($no_datas){
                    foreach ($no_datas as $no=>$datas) {
                        if($datas){
                            $temp_range[$no] = round(max($datas) - min($datas),2);
                        }
                   }
                }
                if($temp_range){
                    $calendar_range[$c_day] = round(array_sum($temp_range)/sizeof($temp_range), 2);
                }
            }
        }

        if($calendar_range){
            if(isset($calendar_range)&&$calendar_range){
                $calendar = $this->_calendar($calendar_range,HALL_NAME);
                $images[] = array(
                    'image_type' => 'calendar',
                    'image_key' => HALL_NAME.PARAM_NAME.'日波动日历图',
                    'image_data' => $calendar
                );
            }
        }



        $result['table_rang_std_day'] = $table_rang_std_day;
        $result['table_rang_std_date'] = $table_rang_std_date;

        // 图片
        $images[] = array(
                'image_type' => 'peak_average_valley',
                'image_key' =>HALL_NAME.PARAM_NAME.'日波动均峰图',
                'image_data' => array(
                    'unit'=>PARAM_UNIT,
                    'data'=>$image_peak_average_valley3
                )
            );
        $images[] = array(
                'image_type' => 'peak_average_valley',
                'image_key' => HALL_NAME.PARAM_NAME.'标准差均峰图',
                'image_data' => array(
                    'unit'=>"",
                    'data'=>$image_peak_average_valley4
                )
            );

        $result['images'] = $images;


        $content = array();
//        $this->response($image_peak_average_valley3);
        $content[] = array(
                'content_key' => HALL_NAME.PARAM_NAME."日波动描述",
                'content_value' => desc_judge($image_peak_average_valley3, PARAM, '日波动')
            );
//                $this->response(array($image_peak_average_valley3,$content));

        $content[] = array(
                'content_key' => HALL_NAME.PARAM_NAME."稳定性较好日期",
                'content_value' => desc_judge($table_rang_std_date, PARAM, '稳定性较好日期')
            );
        $content[] = array(
                'content_key' => HALL_NAME.PARAM_NAME."稳定性较差日期",
                'content_value' => desc_judge($table_rang_std_date, PARAM, '稳定性较差日期')
            );

        $result['content'] = $content;
        return $result;
    }

    // 调控设备
    private function regulation($rows, $children){
        // 时间排序
        usort($rows, function($a, $b){
            return $a['equip_time'] > $b['equip_time'] ? 1 : -1;
        });

        // 调湿机列表
        $equip_list = API("get/env/equipments/manage/all_equip", array(
                'equip_type' => '调湿机',
                'usage'=>"在用,已删除"
            ));
        $equips = array();
        foreach ($equip_list['rows'] as $row) {
            $equips[$row['equip_no']] = $row;
        }
        // 环境分组(放有调湿机的环境)
        $rows_group = array();
        $equip_nos = array();
        // 提取调湿机数据
        foreach ($rows as $key => $row) {
            $no = $row['equip_no'];
            if($no == HALL_NO) continue;
            if(!in_array($row['equip_no'], array_keys($equips))) continue;
            if(!isset($rows_group[$no])){
                $rows_group[$no] = array();
            }
            $rows_group[$no][] = $row;
            $short_no = substr($row['equip_no'],-4);
            if(!isset($equip_nos[$short_no])){
                $equip_nos[$short_no] = isset($children[$row['env_no']])&&HALL_NO!=$row['env_no']?$children[$row['env_no']]['name']:"小环境";
            }
        }

        $content[] = array(
            'content_key' => HALL_NAME."湿度调控目标值",
            'content_value' => 0
        );

        // 计算结果
        $result = array();
        $content = array();
        $images = array();
        $table_data_desc = array();
        $diff_avg_target = array();
        // 遍历环境
        foreach ($rows_group as $no => $rows) {
            $equip = $equips[$no];
            $env_no = $equip['env_no'];
            $env_name = isset($children[$env_no])&&($env_no != HALL_NO)?$children[$env_no]['name']:'小环境';
//            $env_name = '小环境';
            $equip_no = '';

            $data_name = HALL_NAME.$env_name."(".substr($no,-4).")";

            $dd = array();
            $image_line = array();
            $date_data = array();
            foreach ($rows as $row) {
               if(isset($row['humidity'])&&data_filter($row['humidity'],'humidity')){
                   if(!isset($image_line[$data_name])){
                       $image_line[$data_name] = array();
                   }
                   $image_line[$data_name][] = array($row['equip_time']*1000, (float)$row['humidity']);
                   $dd[] = (float)$row['humidity'];
                   $equip_no = $row['equip_no'];
                   $date = date("Y-m-d",$row['equip_time']);
                   if(!isset($date_data[$date])){
                       $date_data[$date] = array();
                   }
                   $date_data[$date][] = (float)$row['humidity'];
               }
            }
            // 图片
            $images[] = array(
                    'image_type' => 'line',
                    'image_key' => $data_name.'湿度曲线图',
                    'image_data' => array(
                        'unit'=>PARAM_UNIT,
                        "data"=>$image_line
                    )
                );

            $pole_avg_data = array(
                "极大值"=>array(),
                "极小值"=>array(),
                "湿度平均值"=>array(),
                "调湿目标值"=>array(),
            );
            $date_wave = array();
            $pre_avg = "";
            if($date_data){
                foreach ($date_data as $dt=>$dv) {
                    if($dv&&is_array($dv)){
                        $max = deal_data_decimal("humidity",max($dv));
                        $min = deal_data_decimal("humidity",min($dv));
                        $avg = deal_data_decimal("humidity",array_sum($dv)/sizeof($dv));
                        $pole_avg_data['极大值'][] = array(strtotime($dt) * 1000,$max);
                        $pole_avg_data['极小值'][] = array(strtotime($dt) * 1000,$min);
                        $pole_avg_data['平均值'][] = array(strtotime($dt) * 1000,$avg);
                        if(isset($equip['target'])&&$equip['target']){
                            $pole_avg_data['调控目标值'][] = array(strtotime($dt) * 1000,$equip['target']);
                            $diff_avg_target[] = abs($avg - $equip['target']);
                        }
                        if(!$pre_avg){
                            $date_wave[] = array(strtotime($dt) * 1000,0);
                            $pre_avg = $avg;
                            continue;
                        }
                        $date_wave[] = array(strtotime($dt) * 1000,abs($avg - $pre_avg));
                        $pre_avg = $avg;
                    }

                }
            }
            $images[] = array(
                'image_type' => 'peak_line',
                'image_key' => $data_name.'日均峰图',
                'image_data' => array(
                    'unit'=>PARAM_UNIT,
                    "data"=>$pole_avg_data
                )
            );

            if(isset($equip['target'])&&$equip['target']){
                $content[] = array(
                    'content_key' => HALL_NAME."湿度调控目标值",
                    'content_value' => 1
                );
            }
            $images[] = array(
                'image_type' => 'line',
                'image_key' => $data_name.'波动指数',
                'image_data' => array(
                    'unit'=>PARAM_UNIT,
                    "data"=>array(
                        '湿度波动指数'=>$date_wave
                    )
                )
            );

            // 描述性统计量
            $table_data_desc[] = array(
                    'sheet_name' =>HALL_NAME.'湿度调控设备数据描述性统计量',
                    'env_name' => $env_name."(".substr($no,-4).")",
                    'total_count' => count($dd),
                    'range' => round(max($dd)-min($dd), 2),
                    'min' => min($dd),
                    'max' => max($dd),
                    'avg' => count($dd) ? round(array_sum($dd)/count($dd), 2) : 0,
                    'target' => $equip['target'] ? $equip['target'] : "",
                    'std' => get_standard_deviation($dd)
                );
            $dd = remove_outliers($dd); //剔除离群值
            $table_data_desc[] = array(
                    'sheet_name' => HALL_NAME.'湿度调控设备数据描述性统计量（已剔除离群值）',
                    'env_name' => $env_name."(".substr($no,-4).")",
                    'total_count' => count($dd),
                    'range' => round(max($dd)-min($dd), 2),
                    'min' => min($dd),
                    'max' => max($dd),
                    'avg' => count($dd) ? round(array_sum($dd)/count($dd), 2) : 0,
                    'target' => $equip['target'] ? $equip['target'] : "",
                    'std' => get_standard_deviation($dd)
                );

            // 描述性数据
            $content[] = array(
                    'content_key' => $env_name."湿度调控目标值",
                    'content_value' => $equips[$equip_no]['target']
                );
        }
        if($equip_nos){
            $content[] = array(
                'content_key' => HALL_NAME.PARAM_NAME,
                'content_value' => json_encode($equip_nos)
            );
        }
        if($diff_avg_target){
            $content[] = array(
                'content_key' => HALL_NAME."调控设备均值与目标值距离最小值",
                'content_value' => min($diff_avg_target)
            );
            $content[] = array(
                'content_key' => HALL_NAME."调控设备均值与目标值距离最大值",
                'content_value' => max($diff_avg_target)
            );
        }
        $result['images'] = $images;
        $result['content'] = $content;
        $result['table_data_desc'] = $table_data_desc;
//        $this->response($result);

        return $result;
    }

    // CO2 光照 紫外 VOC
    private function light_uv_co2_voc($rows, $children){
        $has_data = array(
            'content_key' => HALL_NAME.PARAM_NAME,
            'content_value' => 0
        );

        if(!empty($rows)){
            $has_data['content_value'] = 1;
        }
        // 时间排序
        usort($rows, function($a, $b){
            return $a['equip_time'] > $b['equip_time'] ? 1 : -1;
        });

        // 展柜数据分组
        $all_data = array();
        $rows_group = array();
        $equip_nos = array();
        foreach ($rows as $row) {
            if(isset($row[PARAM])&&data_filter($row[PARAM],PARAM)){
                $no = $row['env_no'].'-'.$row['equip_no'];
                if(!isset($rows_group[$no])){
                    $rows_group[$no] = array();
                }
                $rows_group[$no][] = array($row['equip_time']*1000, (float)$row[PARAM]);
                $all_data[] = (float)$row[PARAM];
                $short_no = substr($row['equip_no'],-4);
                if(!isset($equip_nos[$short_no])){
                    $equip_nos[$short_no] = isset($children[$row['env_no']])&&HALL_NO!=$row['env_no']?$children[$row['env_no']]['name']:"小环境";
                }
            }
        }

        // 计算结果
        $result = array();
        $content = array();   // 描述 
        $images = array();   // 图片 
        $table_data_desc = array(); // 描述性统计量表
        $image_boxplot = array(); // 箱型图

        $content[] = $has_data;//是否有数据

        // 遍历展柜
        foreach ($rows_group as $no => $d) {
            list($env_no, $equip_no) = explode('-', $no);
            $env_name = isset($children[$env_no])&&($env_no != HALL_NO)?$children[$env_no]['name']:'小环境';
//            $env_name = '小环境';
            $hep_name = HALL_NAME.PARAM_NAME;
            $item_name = HALL_NAME.$env_name."(".substr($equip_no, -4).")";
            $images[] = array(
                'image_type' => 'line',
                'image_key' => $item_name.PARAM_NAME.'曲线图',
                'image_data' => array(
                    'unit'=>PARAM_UNIT,
                    'data'=>array(
                        $item_name=>$d
                    )
                )
            );

            $dd = array_column($d, 1);
            // 描述性数据
            $table_data_desc[] = array(
                    'sheet_name' =>$hep_name.'数据描述性统计量',
                    'env_name' => HALL_NAME."(".substr($no,-4).")",
                    'total_count' => count($dd),
                    'range' => round(max($dd)-min($dd), 2),
                    'min' => min($dd),
                    'max' => max($dd),
                    'avg' => count($dd) ? round(array_sum($dd)/count($dd), 2) : 0,
                    'std' => get_standard_deviation($dd)
                );

            // 箱线图数据
            $image_boxplot[$item_name] = calc_boxplot($dd);

            // 达标率
            $good = array_filter($dd, function($x){
                    return $x<PARAM_THRESHOLD;
                });
            $ratio = $dd ? round(100*count($good)/count($dd), 2) : 100;

            $content[] = array(
                    'content_key' => $item_name.PARAM_NAME."最大值",
                    'content_value' => count($dd) ? max($dd) : DEFAULT_DATA
                );
            $content[] = array(
                    'content_key' => $item_name.PARAM_NAME."最小值",
                    'content_value' => count($dd) ? min($dd) : DEFAULT_DATA
                );
            $content[] = array(
                    'content_key' => $item_name.PARAM_NAME."均值",
                    'content_value' => count($dd) ? round(array_sum($dd)/count($dd),2) : DEFAULT_DATA
                );

            $content[] = array(
                    'content_key' => $item_name.PARAM_NAME."阈值范围内的数据占比",
                    'content_value' => $ratio."%"
                );
            $content[] = array(
                    'content_key' => $item_name.PARAM_NAME."阈值",
                    'content_value' => PARAM_THRESHOLD
                );

        }

        if($equip_nos){
            $content[] = array(
                'content_key' => HALL_NAME.PARAM_NAME."设备",
                'content_value' => json_encode($equip_nos)
            );
        }

        // 达标率
        $all_good = array_filter($all_data, function($x){
            return $x<PARAM_THRESHOLD;
        });
        $all_ratio = $all_data ? round(100*count($all_good)/count($all_data), 2) : 100;

        $describle = '描述';
        if(PARAM_NAME == 'VOC'){
            $describle = '状况描述';
        }
       if(in_array(PARAM,array('light','uv'))){
           $content[] = array(
               'content_key' => HALL_NAME.PARAM_NAME.$describle,
               'content_value' => desc_judge($all_data, PARAM)
           );
       }else{
           $content[] = array(
               'content_key' => HALL_NAME.PARAM_NAME.$describle,
               'content_value' => desc_judge($table_data_desc, PARAM)
           );
       }

        $images[] = array(
                'image_type' => 'box_plot',
                'image_key' => HALL_NAME.PARAM_NAME.'箱型图',
                'image_data' =>  array(
                    'unit'=>PARAM_UNIT,
                    'data'=>$image_boxplot
                )
            );
        $result['images'] = $images;
        $result['content'] = $content;
        $result['table_data_desc'] = $table_data_desc;

        return $result;
    }

    function _calendar($ranges,$env_name)
    {

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
        $date = array_keys($ranges);
        $start_date = date("Y-m-d",$stime);
        $end_date = date("Y-m-d",$etime);

        $month = array();
        //列出月份
        $add_time = strtotime($start_date);
        $month[] = date("Y-m",$add_time);
        while(($add_time = strtotime('+1 month', $add_time)) < strtotime($end_date)){
            if(!in_array(date("Y-m",$add_time),$month)){
                $month[] = date("Y-m",$add_time);
            }
        }
        $calendar = array(
            'data'=>array(),
            'top'=>array(),
            'env_name'=>$env_name,
            'range'=>array($start_date,$end_date),
            'top_len'=>2*sizeof($month),
            'ch_size'=>1
        );

        foreach ($ranges as $day=>$range) {
            $calendar['data'][] = array($day,$range);
        }

        uasort($ranges,function($a,$b){
            if ($a == $b) return 0;
            return ($a > $b) ? -1 : 1;
        });
        $top = array_slice($ranges,0,2*sizeof($month));
        if($top){
            foreach ($top as $d=>$v) {
                $calendar['top'][] = array($d,$v);
            }
        }
        $cld_max = max(array_values($top));
        $calendar['ch_size'] = $cld_max?round(20/$cld_max,3):1;

        return $calendar;
    }

    function _layout($hall_no)
    {
        $areas = API("get/base/envs",array("select"=>"env_no,parent_env_no,name,map,locate"));
        $hall_info = array();
        if($areas['rows']){
            foreach ($areas['rows'] as $area) {
                if(isset($area['env_no'])&&$area['env_no'] == $hall_no){
                    $hall_info = $area;
                }
            }
        }
        $children = array();
        $parent_env_nos = array($hall_no);
        $children = get_children($areas['rows'],$hall_no);
        $envs = array();
        if($children){
            foreach ($children as $k => $child) {
                if(isset($child['parent_env_no'])&&$child['parent_env_no'] == $hall_no){
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
//            return $equips;
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

        $image = array(
            'image_key'=>HALL_NAME."平面图",
            'image_type'=>"layout",
            'image_data'=> $data,
        );

        return  array('map'=>$data['map'],"image"=>$image);
    }

}