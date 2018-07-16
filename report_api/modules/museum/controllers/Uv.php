<?php

/**
 * Created by PhpStorm.
 * User: Hebj
 * Date: 2017/4/25
 * Time: 13:55
 */
class Uv extends MY_Controller
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
        $max = array();//极值点
        $min = array();//极小值点
        $pole_diff =  array();//全距
        $avg = array();//均值
        $avg_pole = array();//均峰图
        $report = array(
            "report_id"=>$report_id,
            'msg'=>"处理失败"
        );
        $all_data = array(
            'all'=>array(),
            'wave'=>array()
        );
        $envs = API('get/base/envs',array('type'=>'展厅,库房,研究室,修复室'));
        if(isset($envs['rows'])&&$envs['rows']){
            foreach ($envs['rows'] as $row) {
                $data_sensors = array();
                $name = $row['name'];
                if(isset($row['env_no'])&&$row['env_no']){
                    $data_sensors = API("get/env/common/monitor_data",array(
                        'env_no'=>$row['env_no'],
                        'time'=>$stime.",".$etime,
                        'params'=>'uv'
                    ));
                    $pdata = array();
                    if(isset($data_sensors['rows'])&&$data_sensors['rows']){
                        foreach ($data_sensors['rows'] as $ds) {
                            $env_name = $name."(".substr($ds['equip_no'],-4).")";
                            //箱线图数据和极值数据
                            if(isset($ds['uv'])&&$ds['uv'] != "NaN"&&$ds['uv'] != ""&&$ds['uv'] != null&&data_filter($ds['uv'],"uv")){
                                if(data_filter($ds['uv'],'uv')){
                                    $pdata[$env_name][] = $ds['uv']+0;
                                    $all_data['all'][] = $ds['uv']+0;
                                    if(!isset($max['value'])){
                                        $max['value'] = $ds['uv'];
                                        $max['name'] = $name;
                                    }else{
                                        if($ds['uv'] > $max['value']){
                                            $max['value'] = $ds['uv'];
                                            $max['name'] = $name;
                                        }
                                    }
                                    if(!isset($min['value'])){
                                        $min['value'] = $ds['uv'];
                                        $min['name'] = $name;
                                    }else{
                                        if($ds['uv'] < $min['value']){
                                            $min['value'] = $ds['uv'];
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

                            $avg_pole[$env_name] = array($temp['max'],$temp['min'],$temp['avg']);
                        }
                    }
                    ob_flush();
                }
            }
        }

        //文字描述
        $data['馆内最低紫外'] = isset($min['value'])?$min['value']:"";
        $data['馆内最高紫外'] = isset($max['value'])?$max['value']:"";
        $data['馆内紫外最小值环境'] = isset($min['name'])?$min['name']:"";
        $data['馆内紫外最大值环境'] = isset($max['name'])?$max['name']:"";
        $data['馆内紫外全距最小值'] = $pole_diff?round(min($pole_diff),2):"";
        $data['馆内紫外全距最大值'] = $pole_diff?round(max($pole_diff),2):"";
        $data['馆内紫外均值最小值'] = $avg?round(min($avg),2):"";
        $data['馆内紫外均值最大值'] = $avg?round(max($avg),2):"";
        $data['馆内紫外描述'] = $all_data['all']?desc_judge($all_data['all'],'uv'):"";
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
                            $val['sheet_name'] = "各区域紫外数据描述性统计量";
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
            'image_type'=>'peak_average_valley',
            'image_key'=>"各区域紫外均峰图",
            'image_data'=>json_encode(array(
                'unit'=>$params['uv']['unit'],
                'data'=>$avg_pole
            )),
            'report_id'=>$report_id
        );

        $image = M("images")->fetOne('report_id = '.$report_id.' and image_key = "各区域紫外均峰图"');
        if($image){
            $ret = M("images")->update($image_data,'report_id = '.$report_id.' and image_key = "各区域紫外均峰图"');
        }else{
            $ret = M("images")->add($image_data);
        }
        if(isset($ret)&&$ret){
            $report['msg'] = '处理成功';
        }
        $this->response(array('data'=>$report));
    }
}