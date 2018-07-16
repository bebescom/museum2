<?php

/**
 * Created by PhpStorm.
 * User: Hebj
 * Date: 2017/12/14
 * Time: 14:40
 */
class Import extends MY_Controller
{
    public function __construct()
    {
        parent::__construct();
        $sensor_param = M("equipments/equip")->get_parameters('sensor');
        $this->param = array();
        if($sensor_param){
            foreach($sensor_param as $sp){
                if(isset($sp['param'])&&$sp['param']){
                    $this->param[$sp['param']] = array("name"=>$sp['name'],"unit"=>$sp['unit']);
                }
            }
        }

        $this->load->library('excel');
    }

    public function import_from_input_post()
    {
        $equip_no = $this->get_post('equip_no');
        $env_no = $this->get_post('env_no');
        $datas = $this->get_post('datas');

        $equip = M("equip")->fetOne("equip_no = '{$equip_no}'");
        if(!$equip){
            $this->response(array('error'=>'设备不存在!'));
        }

        $values = array();
        $column  = array();
        if($datas){
            foreach ($datas as $data) {
                $data['equip_no'] = $equip_no;
                $data['env_no'] = $env_no;
                foreach ($data as $key=>$val) {
                    if($key == "equip_time"){
                        $data['server_time'] = $data['php_time'] = (int)$val;
                    }else if(in_array($key,array_keys($this->param))){
                        $data[$key] = deal_data_decimal($key,$val);
                    }
                }
                if(!$column){
                    $column = array_keys($data);
                }
                $values[] = "('".implode("','",array_values($data))."')";
            }
        }
        if($column&&$values){
            $insert_sql = "insert into data_sensor (`".implode("`,`",$column)."`) values ".implode(',',$values);
            $ret = $this->db->query($insert_sql);
            if($ret){
                $this->_update_new_data($equip_no,$equip['parameter']);
            }
        }

        $result = isset($ret)&&$ret?array('result'=>true,'msg'=>"录入成功"):array('result'=>false,'msg'=>"录入失败");
        $this->response($result);
    }

    public function import_from_excel_post()
    {
        $equip_no = $this->get_post('equip_no');

        $equip = M("equip")->fetOne("equip_no = '{$equip_no}'");
        if(!$equip){
            $this->response(array('error'=>'设备不存在!'));
        }

        $column_name = array(
            'equip_time'=>"时间",
            'env_no'=>"位置",
            'temperature'=>"温度",
            'humidity'=>"相对湿度",
            'co2'=>"二氧化碳",
            'voc'=>"有机挥发物",
            'light'=>"光照",
            'uv'=>"紫外",
            'equip_no'=>"设备编号"
        );

        /************环境信息，用于位置比对*****************/
        $envs = API("get/base/envs");
        $envs_info = array();
        if(isset($envs['rows'])&&$envs['rows']){
            foreach ($envs['rows'] as $row) {
                if(isset($row['name'])&&$row['name']){
                    if(isset($row['env_no'])&&$row['env_no']){
                        $nav = M('common/common')->navigation($envs['rows'],$row['env_no']);
                        $env_names = array();
                        if($nav){
                            foreach ($nav as $nv) {
                                if(isset($nv['name'])&&$nv['name']){
                                    $env_names[] = $nv['name'];
                                }
                            }
                        }
                        if($env_names){
                            $envs_info[$row['env_no']] = implode('>',$env_names);
                        }
                    }
                }
            }
        }

        /************读取excel数据,并写入数据库****************/
        $column = array();
        $values = array();
        if (!empty( $_POST['file'])) {
            $upload = upload($_POST['file'], 'excel');

            if (isset($upload['error'])) {
                $this->response($upload);
            }
            if (isset($upload['save_path']) && $upload['save_path']) {
                $datas = $this->excel->readExcel($upload['save_path'], '', './upload_file/relics');
                if($datas){
                    foreach ($datas as $line=>$data) {
                        $val = array();
                        foreach ($data as $n=>$d) {
                            if($line == 1){
                                $col = array_search($d,$column_name);
                                if($col){
                                    $column[$n] = $col;
                                }
                            }else{
                                $val['equip_no'] = $equip_no;
                                if(isset($column[$n])&&$column[$n]){
                                    switch($column[$n]){
                                        case "equip_time":
                                            $val['server_time'] = $val['php_time'] = $val["equip_time"] = strtotime($d);
                                            break;
                                        case "env_no":
                                            $d =  str_replace(" ","",$d);
                                            $val['env_no'] = array_search($d,$envs_info);
                                            break;
                                        default:
                                            $val[$column[$n]] = $d;
                                            break;
                                    }

                                }
                            }
                        }
                        if($val){
                            $values[] = $val;
                        }
                    }
                }
            }
        }
        if($values){
            $insert_value = array();
            foreach ($values as $value) {
                $column = array_keys($value);
                $insert_value[] = "('".implode("','",array_values($value))."')";
            }
            $insert_sql = "insert into data_sensor (`".implode("`,`",$column)."`) values ".implode(",",$insert_value);
            $ret = $this->db->query($insert_sql);
            if($ret){
                $this->_update_new_data($equip_no,$equip['parameter']);
            }
        }

        $result = isset($ret)&&$ret?array('result'=>true,'msg'=>"录入成功"):array('result'=>false,'msg'=>"录入失败");
        $this->response($result);
    }

    function _update_new_data($equip_no,$params)
    {
        $new_data = M('data_sensor')->fetOne("equip_no = '{$equip_no}'","equip_time,{$params}","equip_time desc");
        $update_data   = array();
        if(isset($new_data['equip_time'])&&$new_data['equip_time']){
            $update_data['last_equip_time'] = $new_data['equip_time'];
            unset($new_data['equip_time']);
        }
        $update_data['parameter_val'] = json_encode($new_data);

        M('equip')->update($update_data,"equip_no = '{$equip_no}'");
    }

    public function template_get($equip_no)
    {
        $equip = M("equip")->fetOne("equip_no = '{$equip_no}'");
        if(!$equip){
            $this->response(array('error'=>'设备不存在!'));
        }
        $fields = array(
            'equip_time'=>"时间",
            'env_no'=>'位置'
        );
        $export_data = array();
        if(isset($equip['parameter'])&&$equip['parameter']){
            $parameters = explode(',',$equip['parameter']);
            foreach ($parameters as $param) {
                if(isset($this->param[$param])&&$this->param[$param]){
                    $fields[$param] = $this->param[$param]['name'];
                }
            }
        }

        $filename = "手持设备_{$equip_no}_数据导入模板";
        $url = $this->excel->download2007($filename, $fields, $export_data,'');
//        if (strpos(PHP_OS, "WIN") !== false) {
//            $url = mb_convert_encoding($url, "GBK", "UTF-8");
//        }
        $download = API('get/base/download/', array("url" => $url, "from" => "env"));
        if(isset($download['error'])){
            $this->response(array($download,$url));
        }
        $this->response($download);
    }
}