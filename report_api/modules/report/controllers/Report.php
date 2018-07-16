<?php

/**
 * Created by PhpStorm.
 * User: Hebj
 * Date: 2017/5/4
 * Time: 9:46
 */
class Report extends MY_Controller
{

    public function index(){
        $report_type = $this->get_post('report_type');
        $report_name = $this->get_post('report_name');
        $page = $this->get_post('page');
        $limit = $this->get_post('limit');

        $where = "1=1";
        if($report_name){
            $where .= " and report_name like '%{$report_name}%";
        }
        if($report_type){
            $where .= ' and report_type = "'.$report_type.'"';
        }

        if(!$page){
            $page = 1;
        }
        if(!$limit){
            $limit = 10;
        }
        $offset = ($page - 1)*$limit;
        $total = M("report")->count($where);
        $reports = M("report")->fetAll($where,"*",'generate_time desc',$offset,$limit);
        if($reports){
            foreach($reports as $key=>$report){
                if(isset($report['generate_time'])&&$report['generate_time']){
                    $reports[$key]['generate_time'] = date("Y-m-d H:i:s",$report['generate_time']);
                }

                if(!$report['report_file'] || !file_exists($_SERVER['DOCUMENT_ROOT'].$report['report_file'])){
                    unset($reports[$key]);
                    $total--;
                }
            }
        }

        $data = array(
            'total'=>$total,
            'rows'=>$reports
        );

        $this->response($data);
    }
}