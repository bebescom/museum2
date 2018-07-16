<?php

/**
 * Created by PhpStorm.
 * User: Hebj
 * Date: 2017/5/2
 * Time: 10:00
 */
class Generate extends MY_Controller
{
    public function __construct()
    {
        parent::__construct();
        $this->museum_config = API('get/base/config');
        $this->save_path = $_SERVER["DOCUMENT_ROOT"]."/uploads/";
    }

    public function index_post()
    {
        $report_type = $this->get_post('report_type');
        $report_time_range = $this->get_post('report_time_range');
        $report_name = $this->get_post('report_name');
        $generate_status = $this->get_post('generate_status');
        $generate_time = $this->get_post('generate_time');
        $generate_total_time  = $this->get_post('generate_total_time');
        $report_file  = $this->get_post('report_file');
        $del_all = $this->get_post('del_all');

        if(!$report_name){
            $this->response(array('error'=>"报表名称不能为空"));
        }

        $report = M("report")->fetOne('report_name = "'.$report_name.'"');
        $data = array(
        );

        if(isset($report_name)&&$report_name){
            $data['report_name'] = $report_name;
        }
        if(isset($generate_status)&&$generate_status){
            $data['generate_status'] = $generate_status;
        }
        if(isset($generate_time)&&$generate_time){
            $data['generate_time'] = $generate_time;
        }
        if(isset($report_type)&&$report_type){
            $data['report_type'] = $report_type;
        }
        if(isset($report_time_range)&&$report_time_range){
            $data['report_time_range'] = $report_time_range;
        }
        if(isset($report_file)&&$report_file){
            $data['report_file'] = $report_file;
        }
        $data['generate_total_time'] = 0;
        if(isset($generate_total_time)&&$generate_total_time){
            $data['generate_total_time'] = $generate_total_time;
        }
        if(isset($this->museum_config['museum_name'])&&$this->museum_config['museum_name']){
            $data['museum_name'] = $this->museum_config['museum_name'];
        }

        if(!$report){
           if(sizeof($data)){
               M("report")->add($data);
           }
        }else{
            if(sizeof($data)){
                M("report")->update($data,'report_name = "'.$report_name.'"');
            }
        }
        $report = M("report")->fetOne('report_name = "'.$report_name.'"');
        $save_url = $this->save_path."{$this->db->database}/{$report['id']}/";
        if(!is_dir($save_url)){
            if(!is_dir( $this->save_path)){
                mkdir($this->save_path);
            }
            if(!is_dir( $this->save_path."{$this->db->database}/")){
                mkdir( $this->save_path."{$this->db->database}/");
            }
            if(!is_dir($save_url)){
                mkdir($save_url);
            }
        }
        if($del_all){
            $this->_clear_data($report['id'],$save_url);
        }

        $this->response($report);
    }

    /**
    *   删除上一次生成的数据
     * @param $report_id  报表id
     **/
    protected  function _clear_data($report_id,$dirName)
    {
        if($report_id){
            //删除content表
            M('content')->delete('report_id = '.$report_id);
            //删除content表
            M('images')->delete('report_id = '.$report_id);
            //删除content表
            M('table_data_desc')->delete('report_id = '.$report_id);
            //删除content表
            M('table_rang_std_date')->delete('report_id = '.$report_id);
            //删除content表
            M('table_rang_std_day')->delete('report_id = '.$report_id);

            //删除生成的文件
            if(file_exists($dirName) && $handle=opendir($dirName)){
                while(false!==($item = readdir($handle))){
                    if($item!= "." && $item != ".."){
                        if(file_exists($dirName.'/'.$item) && is_dir($dirName.'/'.$item)){
                            delFile($dirName.'/'.$item);
                        }else{
                            if(unlink($dirName.'/'.$item)){
//                                return true;
                            }
                        }
                    }
                }
                closedir( $handle);
            }

        }
    }
}