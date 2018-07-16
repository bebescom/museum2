<?php

/**
 * Created by PhpStorm.
 * User: Hebj
 * Date: 2017/4/25
 * Time: 13:55
 */
class Voc extends MY_Controller
{
    public function __construct()
    {
        parent::__construct();
        $this->museum_config = API('get/base/config');
    }

    public function index_get(){
        $report_id = $this->get_post('report_id');
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

        $data = array();
        $data['馆内VOC阈值'] = 300;
        $max = array();//极值点
        $min = array();//极小值点
        $pole_diff =  array();//全距
        $avg = array();//均值
        $box_plot = array();//箱线图
        $report = array(
            "report_id"=>$report_id,
            'msg'=>"处理失败"
        );
        $all_data = array(
            'all'=>array(),
            'good'=>array()
        );
        $all_envs = API("get/base/envs");
        $env_names = array();
        if(isset($all_envs['rows'])&&$all_envs['rows']){
            foreach ($all_envs['rows'] as $env) {
                $env_names[$env['env_no']] = $env['name'];
            }
        }
        $envs = API('get/base/envs',array('type'=>'展厅,库房,研究室,修复室'));
        if(isset($envs['rows'])&&$envs['rows']){
            foreach ($envs['rows'] as $row) {
                $data_sensors = array();
                $name = $row['name'];
                if(isset($row['env_no'])&&$row['env_no']){
                    $data_sensors = API("get/env/common/monitor_data",array(
                        'env_no'=>$row['env_no'],
                        'time'=>$stime.",".$etime,
                        'params'=>'voc'
                    ));
                    $pdata = array();
                    if(isset($data_sensors['rows'])&&$data_sensors['rows']){
                        foreach ($data_sensors['rows'] as $ds) {
//                           if($this->db->database == "jingzhou_report"){
//                               $env_name = $name;
//                           }
                            $env_name = isset($env_names[$ds['env_no']])?$env_names[$ds['env_no']]."(".substr($ds['equip_no'],-4).")":$name."(".substr($ds['equip_no'],-4).")";
                            //箱线图数据和极值数据
                            if(isset($ds['voc'])&&$ds['voc'] != "NaN"&&$ds['voc'] != ""&&$ds['voc'] != null&&data_filter($ds['voc'],"voc")){
                                $pdata[$env_name][] = $ds['voc']+0;
                                $all_data['all'][] = $ds['voc']+0;
                                if(data_filter($ds['voc'],'voc')){
                                    if($ds['voc'] < $data['馆内VOC阈值']){
                                        $all_data['good'][] = $ds['voc']+0;
                                    }
                                    if(!isset($max['value'])){
                                        $max['value'] = $ds['voc'];
                                        $max['name'] = $name;
                                    }else{
                                        if($ds['voc'] > $max['value']){
                                            $max['value'] = $ds['voc'];
                                            $max['name'] = $name;
                                        }
                                    }
                                    if(!isset($min['value'])){
                                        $min['value'] = $ds['voc'];
                                        $min['name'] = $name;
                                    }else{
                                        if($ds['voc'] < $min['value']){
                                            $min['value'] = $ds['voc'];
                                            $min['name'] = $name;
                                        }
                                    }
                                }
                            }
                        }
                    }
                    //统计信息表
                    if(isset($pdata)&&$pdata){
                        foreach($pdata as $e_name=>$value){
                            $temp = array();
                            $temp['env_name'] = $e_name;
                            $temp['total_count'] = sizeof($value);
                            $temp['min'] = round(min($value),2);
                            $temp['max'] = round(max($value),2);
                            $temp['range'] = round($temp['max'] - $temp['min'],2);
                            $pole_diff[] = $temp['range'];
                            $temp['avg'] = round(array_sum($value)/sizeof($value),2);
                            $avg[] = $temp['avg'];
                            $temp['std'] = get_standard_deviation($value);
                            $data['table'][$e_name] = $temp;

                            //箱型图计算
                            if(!isset($box_plot[$e_name])){
                                $box_plot[$e_name] = array();
                            }
                            $box_plot[$e_name] = calc_boxplot($value);
                        }
                    }
                    ob_flush();
                }
            }
        }
        //文字描述
        $data['馆内VOC最小值'] = isset($min['value'])?$min['value']:"";
        $data['馆内VOC最大值'] = isset($max['value'])?$max['value']:"";
        $data['馆内VOC最小值环境'] = isset($min['name'])?$min['name']:"";
        $data['馆内VOC最大值环境'] = isset($max['name'])?$max['name']:"";
        $data['馆内VOC全距最小值'] = $pole_diff?round(min($pole_diff),2):"";
        $data['馆内VOC全距最大值'] = $pole_diff?round(max($pole_diff),2):"";
        $data['馆内VOC均值最小值'] = $avg?round(min($avg),2):"";
        $data['馆内VOC均值最大值'] = $avg?round(max($avg),2):"";
        $data['馆内VOC描述'] = isset($data['table'])&&$data['table']?desc_judge($data['table'],'voc'):"";
        $data['馆内VOC阈值'] = 300;
        $data['馆内VOC阈值范围内的数据占比'] = $all_data['all']?round(sizeof($all_data['good'])/sizeof($all_data['all'])*100,2)."%":"";

//        $this->response($data);
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
                            $val['sheet_name'] = "各区域VOC数据描述性统计量";
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
        $image_data = array(
            'image_type'=>'box_plot',
            'image_key'=>"各区域VOC箱型图",
            'image_data'=>json_encode(array(
                'unit'=>$params['light']['unit'],
                'data'=>$box_plot
            )),
            'report_id'=>$report_id
        );

        $image = M("images")->fetOne('report_id = '.$report_id.' and image_key = "各区域VOC箱型图"');
        if($image){
            $ret = M("images")->update($image_data,'report_id = '.$report_id.' and image_key = "各区域VOC箱型图"');
        }else{
            $ret = M("images")->add($image_data);
        }
        if(isset($ret)&&$ret){
            $report['msg'] = "处理成功";
        }
        $this->response(array('data'=>$report));
    }
}