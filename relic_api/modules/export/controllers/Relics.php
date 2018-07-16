<?php

/**
 * Created by PhpStorm.
 * User: Hebj
 * Date: 2017/11/10
 * Time: 9:58
 */
class Relics extends MY_Controller
{
    public function __construct()
    {
        parent::__construct();
        $this->load->Library('excel');
    }

    public function index_get()
    {
        $relic_no = $this->get_post('relic_no');

        $where = "1=1";
        if($relic_no){
            $nos = explode(",",$relic_no);
            $where .= " and  relic_no in ('".implode("','",$nos)."')";
        }

        $total = M('relic')->count($where);
        $limit = 300;
        $offset = 0;

        $columns = array(
            'relic_id'=>"总登记号",
            'name'=>"名称",
            'age'=>"年代",
            'material'=>"质地",
            'category'=>"类别",
            'level'=>"级别",
            'status'=>"状态",
            'position'=>"位置",
            'image'=>"图片",
            'boxNo'=>"绑定囊匣号",
            'tagNo'=>"RFID标签号",
        );

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
                            $envs_info[$row['env_no']] = implode(' > ',$env_names);
                        }
                    }
                }
            }
        }

        $this->config->load("rest_api");
        $api_hosts = $this->config->item("api_hosts");

        $excelData = array();
        while($total) {
            $relics = M("relic")->fetAll($where, "relic_id,name,age,material,category,level,status,parent_env_no,image,relic_no", "", $offset, $limit);
            $relic_nos = array();
            if ($relics) {
                foreach ($relics as $key => $relic) {
                    if (isset($relic['relic_no']) && $relic['relic_no']) {
                        $relic_nos[] = $relic['relic_no'];

                        if(isset($relic['parent_env_no'])){
                            $relic['position'] = isset($envs_info[$relic['parent_env_no']])?$envs_info[$relic['parent_env_no']]:"";
                            unset($relic['parent_env_no']);
                        }
                        $excelData[$relic['relic_no']] = $relic;
                        unset($excelData[$relic['relic_no']]['relic_no']);
                    }
                }
            }
            if ($relic_nos) {
                $data = array(
                    "access_token"=>$this->_token,
                    "requestType"=>"pc",
                    'relicNo'=>json_encode($relic_nos)
                );
                $url = $api_hosts['relics']['api_url']."relicBox/list";
                $postdata = http_build_query($data);
                $boxes = json_decode(file_get_contents($url."?".$postdata,false),true);
                if(isset($boxes['error_code'])&&$boxes['error_code']){
                    $this->response($boxes);
                }
                $box_tags = array();
                if(isset($boxes['data'])){
//                    $this->response($boxes);
                    foreach ($boxes['data'] as $box) {
                        if(isset($box['relicNo'])&&$box['relicNo']){
                            $box_tags[$box['relicNo']] = $box;
                            if(isset($excelData[$box['relicNo']])&&$excelData[$box['relicNo']]){
                                if(isset($box['boxNo'])&&$box['boxNo']){
                                    $excelData[$box['relicNo']]['boxNo'] = $box['boxNo']."\t";
                                }
                                if(isset($box['tagNo'])&&$box['tagNo']){
                                    $excelData[$box['relicNo']]['tagNo'] = $box['tagNo'];
                                }
                            }
                        }
                    }
                }
            }
            $total -= sizeof($relics);
            $offset += sizeof($relics);
        }
        $filename = "藏品信息表".date("Ymd-His");
        $url = $this->excel->download2007($filename, $columns, array_values($excelData),'',array('position'=>80,'image'=>50));
//        if (strpos(PHP_OS, "WIN") !== false) {
//            $url = mb_convert_encoding($url, "GBK", "UTF-8");
//        }
//        $this->response($url);

        $download = API('get/base/download/', array("url" => $url, "from" => "relic"));
        $this->response($download);
    }
}