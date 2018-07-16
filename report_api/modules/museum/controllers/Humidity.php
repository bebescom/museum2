<?php

/**
 * Created by PhpStorm.
 * User: Hebj
 * Date: 2017/4/25
 * Time: 13:55
 */
class Humidity extends MY_Controller
{
    public function __construct()
    {
        parent::__construct();
        $this->museum_config = API('get/base/config');
    }

    public function index_get(){
        $report_id = $this->get_post('report_id');

        //获取报表信息
        $report = M("report")->fetOne('id = '.$report_id);
        if(isset($report['report_time_range'])&&$report['report_time_range']){
            $time = explode("-",$report['report_time_range']);
            $stime = isset($time[0])?strtotime($time[0]):"";
            $etime = isset($time[1])?strtotime($time[1]):"";
        }else{
            $season = ceil((date('n'))/3)-1;//上季度是第几季度
            $stime = mktime(0, 0, 0,$season*3-3+1,1,date('Y'));
            $etime = mktime(23,59,59,$season*3,date('t',mktime(0, 0 , 0,$season*3,1,date("Y"))),date('Y'));
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

        //定义变量
        $data = array();
        $max = array();//极值点
        $min = array();//极小值点
        $pole_diff =  array();//全距
        $avg = array();//均值
        $box_plot = array();//箱线图
        $std_array = array();//标准差
        $report = array(
            "report_id"=>$report_id,
            'msg'=>"处理成功"
        );
        $all_data = array(
            'all'=>array(),
            'wave'=>array()
        );
        $envs = API('get/base/envs',array('type'=>'展厅,库房,研究室,修复室'));//获取展厅库房环境信息
        if(isset($envs['rows'])&&$envs['rows']){
            foreach ($envs['rows'] as $row) {
                $data_sensors = array();
                $name = $row['name'];
                if(isset($row['type'])){
                    $env_type = $row['type'];
                }
                if(isset($row['env_no'])&&$row['env_no']){
//                    if(strpos($row['env_no'],'61001400010103') !== false&&$this->db->database == "jinsha_report"){
//                        $env_type = "遗址坑";
//                    }else if(strpos($row['env_no'],'4340200009') !== false&&$this->db->database == "jingzhou_report"){
//                        $env_type = "考古整理楼";
//                    }
                    $data_sensors = API("get/env/common/monitor_data",array(
                        'env_no'=>$row['env_no'],
                        'time'=>$stime.",".$etime,
                        'params'=>'humidity'
                    ));
                    $pdata = array();
                    if(isset($data_sensors['rows'])&&$data_sensors['rows']){
                        foreach ($data_sensors['rows'] as $ds) {
                            if($ds['env_no'] == $row['env_no']){
                                $env_name = $name."小环境";
                            }else{
                                $env_name = $name."微环境";
                            }
                            //箱线图数据和极值数据
                            if(isset($ds['humidity'])&&$ds['humidity'] != "NaN"&&$ds['humidity'] != ""&&$ds['humidity'] != null&&data_filter($ds['humidity'],"humidity")){
                                if(data_filter($ds['humidity'],'humidity')){
                                    if(!isset($pdata[$env_name])){
                                        $pdata[$env_name] = array();
                                    }
                                    $pdata[$env_name][] = $ds['humidity']+0;
                                    if(!isset($all_data['all'][$env_type])){
                                        $all_data['all'][$env_type] = array();
                                    }
                                    $all_data['all'][$env_type][] = $ds['humidity']+0;
                                    if(!isset($max[$env_type])){
                                        $max[$env_type] = array();
                                    }
                                    if(!isset($min[$env_type])){
                                        $min[$env_type] = array();
                                    }

                                    if(!isset($max[$env_type]['value'])){
                                        $max[$env_type]['value'] = $ds['humidity'];
                                        $max[$env_type]['name'] = $name;
                                    }else{
                                        if($ds['humidity'] > $max[$env_type]['value']){
                                            $max[$env_type]['value'] = $ds['humidity'];
                                            $max[$env_type]['name'] = $name;
                                        }
                                    }
                                    if(!isset($min[$env_type]['value'])){
                                        $min[$env_type]['value'] = $ds['humidity'];
                                        $min[$env_type]['name'] = $name;
                                    }else{
                                        if($ds['humidity'] < $min[$env_type]['value']){
                                            $min[$env_type]['value'] = $ds['humidity'];
                                            $min[$env_type]['name'] = $name;
                                        }
                                    }
                                }
                            }
                        }
                    }
                    //统计信息表
                    if(!isset($pole_diff[$env_type])){
                        $pole_diff[$env_type] = array();
                    }
                    if(!isset($avg[$env_type])){
                        $avg[$env_type] = array();
                    }
                    if(!isset($std_array[$env_type])){
                        $std_array[$env_type] = array();
                    }
                    if(isset($pdata)&&$pdata){
                        foreach($pdata as $e_name=>$value){
                            $temp = array();
                            $temp['env_name'] = $e_name;
                            $temp['total_count'] = sizeof($value);
                            $temp['min'] = round(min($value),2);
                            $temp['max'] = round(max($value),2);
                            $temp['range'] = round($temp['max'] - $temp['min'],2);
                            $pole_diff[$env_type][] = $temp['range'];
                            $temp['avg'] = round(array_sum($value)/sizeof($value),2);
                            $avg[$env_type][] = $temp['avg'];
                            $temp['std'] = get_standard_deviation($value);
                            $std_array[$env_type][] = $temp['std'];
                            $data['table'][$e_name] = $temp;
                            if(!isset($all_data['wave'][$env_type])){
                                $all_data['wave'][$env_type] = array();
                            }
                            $all_data['wave'][$env_type][$e_name] = $temp['range'];
                            //箱型图计算
                            if(!isset($box_plot[$env_type])){
                                $box_plot[$env_type] = array();
                            }
                            if(!isset($box_plot[$env_type][$e_name])){
                                $box_plot[$env_type][$e_name] = array();
                            }
                            $box_plot[$env_type][$e_name] = calc_boxplot($value);
                        }
                    }
                    ob_flush();
                }
            }
        }
        //文字描述
        if($max){
            foreach($max as $ty=>$val){
                $data[$ty.'湿度最大值'] = isset($val['value'])?$val['value']:"";
                $data[$ty.'湿度最大值环境'] = isset($val['name'])?$val['name']:"";
            }
        }
        if($min){
            foreach($min as $ty=>$val){
                $data[$ty.'湿度最小值'] = isset($val['value'])?$val['value']:"";
                $data[$ty.'湿度最小值环境'] = isset($val['name'])?$val['name']:"";
            }
        }
        if($pole_diff){
            foreach($pole_diff as $ty=>$val){
               if($val){
                   $data[$ty.'湿度全距最小值'] = round(min($val),2);
                   $data[$ty.'湿度全距最大值'] = round(max($val),2);
               }
            }
        }
        if($std_array){
            foreach($std_array as $ty=>$val){
              if($val){
                  $data[$ty.'湿度标准差最小值'] = round(min($val),2);
                  $data[$ty.'湿度标准差最大值'] = round(max($val),2);
              }
            }
        }
        if($avg){
            foreach($avg as $ty=>$val){
                if($val){
                    $data[$ty.'湿度均值最小值'] = round(min($val),2);
                    $data[$ty.'湿度均值最大值'] = round(max($val),2);
                }
            }
        }
        //描述性判定
        if(isset($box_plot)){
            foreach($box_plot as $ty=>$val){
                $data[$ty.'湿度描述'] = desc_judge($val,"humidity");
                if(isset($all_data['wave'][$ty])){
                    $data[$ty.'湿度描述'] .= desc_judge($all_data['wave'][$ty],"humidity",'全距');
                }
            }
        }
//$this->response($data);

        //写入数据库
        if($data){
            $sql_val = array();
            foreach ($data as $key=>$value) {
                if($key != 'table'){
                    $sql_val[] = '('.$report_id.',"'.$key.'","'.$value.'",'.time().')';
                }else{
                    if($value){
                        $table_val = array();
                        foreach($value as $val){
                            $val['report_id'] = $report_id;
                            $val['sheet_name'] = "各区域湿度数据描述性统计量";
                            $table_key = array_keys($val);
                            $table_val[] = '("'.implode('","',array_values($val)).'")';
                        }
                        $table_sql = "replace into table_data_desc (`".implode('`,`',$table_key)."`) values ".implode(',',$table_val);
                        $this->db->query($table_sql);
                    }
                }
            }

            $sql = " replace into content (`report_id`,`content_key`,`content_value`,`create_time`) VALUES ".implode(',',$sql_val);
            $this->db->query($sql);
        }
        if($box_plot){
            foreach($box_plot as $type=>$bp_data){
                $image_key = "各".$type."湿度箱型图";
//                if($type == "展厅"){
//                    $image_key = "展厅湿度箱型图";
//                }else if($type == "库房"){
//                    $image_key = "库房湿度箱型图";
//                }else{
//                    $image_key = "考古整理楼湿度箱型图";
//                }
                $bp_image = array(
                    'image_type'=>'box_plot',
                    'image_key'=>$image_key,
                    'image_data'=>json_encode(array(
                        'unit'=>$params['humidity']['unit'],
                        'data'=>$bp_data
                    )),
                    'report_id'=>$report_id
                );
                $image = M("images")->fetOne('report_id = '.$report_id.' and image_key = "'.$image_key.'"');
                if($image){
                    $ret = M("images")->update($bp_image,'report_id = '.$report_id.' and image_key = "'.$image_key.'"');
                }else{
                    $ret = M("images")->add($bp_image);
                }
            }
        }
        if(isset($ret)&&$ret){
            $report['msg'] = "处理成功";
        }

        $this->response(array('data'=>$report));
    }
}