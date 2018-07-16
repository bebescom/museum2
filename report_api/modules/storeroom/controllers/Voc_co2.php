<?php

/**
 * Created by PhpStorm.
 * User: Hebj
 * Date: 2017/4/25
 * Time: 13:55
 */
class Voc_co2 extends MY_Controller
{
    public function __construct()
    {
        parent::__construct();
        $this->museum_config = API('get/base/config');
    }

    public function index_get(){
        $report_id = $this->get_post('report_id');
        $floor_no = $this->get_post('floor_no');
        $type = $this->get_post('type');

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


        //设备参数信息
        $parameters = API("get/env/equipments/equip_parameters/sensor");
        $params = array();
        if(isset($parameters['sensor'])&&$parameters['sensor']){
            foreach($parameters['sensor'] as $p=>$parameter){
                if($p == "humidity"){
                    $parameter['name'] = "湿度";
                }else if($p == 'co2'){
                    $parameter['name'] = "CO2";
                }else if($p == 'voc'){
                    $parameter['name'] = "VOC";
                }
                $params[$p] = $parameter;
            }
        }

        //环境信息
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

        $data_params = array('voc','co2');
        $contents = array();//描述性值
        $table = array();//表格
        $max = array();//极值点
        $min = array();//极小值点
        $pole_diff =  array();//全距
        $avg = array();//均值
        $box_plot = array();//箱线图
        $line = array();
        $result = array(
            "report_id"=>$report_id,
            'msg'=>"处理失败"
        );
        $all_data = array();
        $equip_nos = array();

        foreach($data_params as $data_param){
            $param_name = $params[$data_param]['name'];
            $contents["{$floor['name']}{$param_name}"] = 0;
        }

        if(isset($storerooms['rows'])&&$storerooms['rows']){
            foreach ($storerooms['rows'] as $row) {
                $data_sensors = array();
                if(isset($row['env_no'])&&$row['env_no']){
                    $env_no = $row['env_no'];
                    $name = $row['name'];
                    $env_names[$env_no] = $name;
                    $sheet_name = $floor['name'];
                    if($this->db->database == 'sx_report'){
                        $sheet_name = $name;
                    }

                    if(!isset($box_plot[$sheet_name])){
                        $box_plot[$sheet_name] = array();
                    }
                    if(!isset($table[$sheet_name])){
                        $table[$sheet_name] = array();
                    }
                    $data_sensors = API("get/env/common/monitor_data",array(
                        'env_no'=>$row['env_no'],
                        'time'=>$stime.",".$etime,
                        'params'=>implode(',',$data_params)
                    ));
                    $pdata = array();
                    if(isset($data_sensors['rows'])&&$data_sensors['rows']){

                        foreach ($data_sensors['rows'] as $ds) {
                            $short_no = substr($ds['equip_no'],-4);
                            if($ds['env_no'] == $env_no){
//                                $env_type = "小环境";
                                $e_name = "小环境";
                            }else{
//                                $env_type = "微环境";
                                $e_name = isset($env_info[$ds['env_no']])?$env_info[$ds['env_no']]['name']:"小环境";
                            }
                            $env_type = "小环境";
                            $env_name = $sheet_name.$env_type."(".$short_no.")";
                            if(!isset($pdata[$env_name])){
                                $pdata[$env_name] = array();
                            }
                            if(!isset($line[$env_name])){
                                $line[$env_name] = array();
                            }
                            if(!isset($all_data[$sheet_name])){
                                $all_data[$sheet_name] = array();
                            }
                            foreach ($data_params as $data_param) {
                                $param_name = $params[$data_param]['name'];
                                if(!isset($all_data[$sheet_name][$data_param])){
                                    $all_data[$sheet_name][$data_param] = array();
                                }
                                if(!isset($equip_nos[$param_name])){
                                    $equip_nos[$param_name] = array();
                                }
                                //箱线图数据和极值数据
                                if(isset($ds[$data_param])&&$ds[$data_param] != "NaN"&&$ds[$data_param] != ""&&$ds[$data_param] != null){
                                    if(data_filter($ds[$data_param],$data_param)){
                                        $contents["{$floor['name']}{$param_name}"] = 1;
                                        if(!isset($equip_nos[$data_param][$short_no])){
                                            $equip_nos[$param_name][$short_no] = $e_name;
                                        }
                                        if(!isset($line[$env_name][$data_param])){
                                            $line[$env_name][$data_param] = array();
                                        }
                                        if(!isset($pdata[$env_name][$data_param])){
                                            $pdata[$env_name][$data_param] = array();
                                        }
                                        $line[$env_name][$data_param][] = array($ds['equip_time']*1000,$ds[$data_param]);
                                        $pdata[$env_name][$data_param][] = $ds[$data_param]+0;
                                        $all_data[$sheet_name][$data_param][] = $ds[$data_param]+0;
                                    }
                                }
                            }
                        }
                    }
                    //统计信息表
                    if(isset($pdata)&&$pdata){
                        foreach ($pdata as $e_name=>$pd_datas) {
                            if($pd_datas){
                                foreach ($pd_datas as $pd_param=>$pd_data) {
                                    $temp = array();
                                    $temp['env_name'] = $e_name;
                                    $temp['total_count'] = sizeof($pd_data);
                                    $temp['min'] = round(min($pd_data),2);
                                    $temp['max'] = round(max($pd_data),2);
                                    $temp['range'] = round($temp['max'] - $temp['min'],2);
                                    $pole_diff[] = $temp['range'];
                                    $temp['avg'] = round(array_sum($pd_data)/sizeof($pd_data),2);
                                    $avg[] = $temp['avg'];
                                    $temp['std'] = get_standard_deviation($pd_data);
                                    if(!isset($table[$sheet_name][$pd_param])){
                                        $table[$sheet_name][$pd_param] = array();
                                    }
                                    $table[$sheet_name][$pd_param][] = $temp;

                                    $contents[$e_name.$params[$pd_param]['name'].'最小值'] = $temp['min'];
                                    $contents[$e_name.$params[$pd_param]['name'].'最大值'] = $temp['max'];
                                    $contents[$e_name.$params[$pd_param]['name'].'均值'] = $temp['avg'];

                                    // 达标率
                                    switch ($pd_param) {
                                        case 'co2':
                                            $param_thresold = 700;
                                            break;
                                        case 'light':
                                        case 'voc':
                                            $param_thresold = 300;
                                            break;
                                        case 'uv':
                                            $param_thresold = 20;;
                                            break;
                                        default:
                                            break;
                                    }
                                    $all_good = array();
                                    foreach ($pd_data as $pdd) {
                                        if($pdd<$param_thresold){
                                            $all_good[] = $pdd;
                                        }
                                    }
                                    $all_ratio = $pd_data ? round(100*count($all_good)/count($pd_data), 2) : 100;
                                    $contents[$e_name.$params[$pd_param]['name'].'阈值范围内的数据占比'] = $all_ratio;
                                    $contents[$e_name.$params[$pd_param]['name'].'阈值'] = $param_thresold;
                                    //箱型图计算
                                    if(!isset($box_plot[$sheet_name][$pd_param])){
                                        $box_plot[$sheet_name][$pd_param] = array();
                                    }
                                    $box_plot[$sheet_name][$pd_param][$e_name] = calc_boxplot($pd_data);
                                }
                            }
                        }
                    }
                }
            }
        }
        if($equip_nos){
            foreach ($equip_nos as $equip_no_param=>$equip_no) {
                $contents["{$floor['name']}{$equip_no_param}设备"] = implode(',',$equip_no);
            }
        }

//        $this->response($table);
        if($all_data){
            foreach ($table as $sht_name=>$ads) {
                if($ads){
                    foreach ($ads as $ad_p=>$ad) {
                        //文字描述
                        $describle = '描述';
                        if($ad_p == 'voc'){
                            $describle = '状况描述';
                        }
                        $contents[$sht_name.$params[$ad_p]['name'].$describle] = $ad?desc_judge($ad,$ad_p):"";
                    }
                }
            }
        }
        $sql_val = array();

        //写入content
        if($contents){
            foreach ($contents as $key=>$content) {
                $sql_val[] = "(".$report_id.",'".$key."','".$content."',".time().")";
            }

            $sql = " replace into content (`report_id`,`content_key`,`content_value`,`create_time`) VALUES ".implode(',',$sql_val);
            $this->db->query($sql);
        }

        //写入table_data_desc
        if($table){
            foreach ($table as $sht_name=>$tb_datas) {
                if($tb_datas){
                    foreach ($tb_datas as $tb_param=>$tb_data) {
                        if($tb_data){
                            foreach ($tb_data as $tb) {
                                $tb['report_id'] = $report_id;
                                $tb['sheet_name'] = $sht_name.$params[$tb_param]['name']."数据描述性统计量";
                                $table_key = array_keys($tb);
                                $table_val[] = '("'.implode('","',array_values($tb)).'")';

                                $table_sql = "replace into table_data_desc (`".implode('`,`',$table_key)."`) values ".implode(',',$table_val);
                                $this->db->query($table_sql);
                            }
                        }
                    }
                }
            }
        }
        $images = array();
        if($line){
            foreach($line as $sht_name=>$line_datas){
                if($line_datas){
                    foreach ($line_datas as $line_param=>$line_data) {
                        $image = array(
                            'image_type'=>'line',
                            'image_key'=>$sht_name.$params[$line_param]['name']."曲线图",
                            'image_data'=>json_encode(array(
                                "unit"=>$params[$line_param]['unit'],
                                'data'=>array(
                                    $sheet_name=>$line_data
                                )
                            )),
                            'unit'=>isset($params[$line_param]['unit'])?$params[$line_param]['unit']:""
                        );
                        $images[] = $image;
                    }
                }
            }
        }

        if($box_plot){
            foreach($box_plot as $sht_name=>$bp_datas){
              if($bp_datas){
                  foreach ($bp_datas as $bp_param=>$bp_data) {
                      $image = array(
                          'image_type'=>'box_plot',
                          'image_key'=>$sht_name.$params[$bp_param]['name']."箱型图",
                          'image_data'=>json_encode(array(
                              "unit"=>$params[$data_param]['unit'],
                              'data'=>$bp_data
                          )),
                          'unit'=>isset($params[$data_param]['unit'])?$params[$data_param]['unit']:""
                      );
                      $images[] = $image;
                  }
              }
            }
        }
//        $this->response($images);

        if($images){
            foreach($images as $image_item){
                unset($image_item['unit']);
                $image_item['report_id'] = $report_id;
                $image = M("images")->fetOne('report_id = '.$report_id.' and image_key = "'.$image_item['image_key'].'"');
                if($image){
                    $ret = M("images")->update($image_item,'report_id = '.$report_id.' and image_key = "'.$image_item['image_key'].'"');
                }else{
                   $ret = M("images")->add($image_item);
                }
            }
        }
        if(isset($ret)&&$ret){
            $result['msg'] = "处理成功";
        }
        $this->response(array('data'=>$result));
    }
}