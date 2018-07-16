<?php

/**
 * Created by PhpStorm.
 * User: Hebj
 * Date: 2017/10/19
 * Time: 9:27
 */
//namespace import;
class Relics  extends MY_Controller
{
    function __construct()
    {
        parent::__construct();
        $this->load->Library('excel');
    }

    public function index_post()
    {
        $column = array('relic_id','name','age','material','category','level','status','parent_env_no','image','boxNo','tagNo');
        $new_relics = array();
        $update_relics = array();
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

        $relic_ids = array();
        $exist_relics = M("relic")->fetAll("","relic_id,relic_no");
        if($exist_relics){
            foreach ($exist_relics as $exist_relic) {
                if(isset($exist_relic['relic_no'])&&$exist_relic['relic_no'] &&
                      isset($exist_relic['relic_id'])&&$exist_relic['relic_id']){
                    $relic_ids[$exist_relic['relic_no']] = $exist_relic['relic_id'];
                }
            }
        }

        if (!empty( $_POST['file'])) {
            $upload = upload($_POST['file'],'excel');

            if(isset($upload['error'])){
                $this->response($upload);
            }
            if(isset($upload['save_path'])&&$upload['save_path']){
                $datas = $this->excel->readExcel($upload['save_path'],'','./upload_file/relics');
                $total = sizeof($datas);
                $relic_nos = M("relics/relics")->relic_code($total);
                foreach ($datas as $key=>$data) {
                    if($key == 1) continue;
                    $relic = array();
                    foreach ($data as $k=>$val) {
                        if(isset($column[$k])&&$column[$k]){
                            if($column[$k] == 'image'){
                                $new_name = $relic['relic_id'].".jpg";
                                $save_path = "/uploads/relic/".$new_name;
                                if($val){
                                    $file_types = explode('.',$val);
                                    $suffix = $file_types[count($file_types) -1];
                                    $new_name = $relic['relic_id'].".".$suffix;
                                    $save_path = "/uploads/relic/".$new_name;
                                    if(copy($val,$_SERVER['DOCUMENT_ROOT'] . $save_path)){
                                        unlink($val);
                                    }
                                }
                                $val = $save_path;
                                $relic[$column[$k]] = $val;
                            }else if($column[$k] == 'parent_env_no'){
                                if($val){
                                    $val = str_replace(" ","",$val);
                                    $env_no = array_search($val,$envs_info);
                                    if($env_no){
                                        $relic[$column[$k]] = $env_no;
                                    }
                                    $relic[$column[$k]] = isset($env_no)&&$env_no?$env_no:"";
                                }else{
                                    $relic[$column[$k]] = $val;
                                }

                            }else{
                                $relic[$column[$k]] = $val;
                            }
                        }
                    }
                    if($relic){
                        if(!in_array($relic['relic_id'],array_values($relic_ids))){
                            if(isset($relic_nos[$key-2])&&$relic_nos[$key-2]){
                                $relic['relic_no'] = $relic_nos[$key-2];
                            }else{
                                $nos = M("relics/relics")->relic_code();
                                $relic['relic_no'] = $nos[0];
                            }
                            $new_relics[] = $relic;
                        }else{
                            $relic['relic_no'] = array_search($relic['relic_id'],$relic_ids);
                            $update_relics[] = $relic;
                        }
                    }
                }
            }
            $tags = array();//盘点标签
            if($new_relics){
                $relics_split = array_chunk($new_relics,100);
                foreach($relics_split as $rlc_split){
                    $columns = "";
                    $values = array();
                    if($rlc_split){
                        foreach($rlc_split as $rlc_sp){
                            $tag = array();
                            if(isset($rlc_sp['tagNo'])){
                                $tag['tagNo'] = $rlc_sp['tagNo'];
                                unset($rlc_sp['tagNo']);
                            }
                            if(isset($rlc_sp['boxNo'])){
                                $tag['boxNo'] = $rlc_sp['boxNo'];
                                unset($rlc_sp['boxNo']);
                            }
                            if(isset($rlc_sp['relic_no'])){
                                $tag['relicNo'] = $rlc_sp['relic_no'];
                            }
                            $keys = array_keys($rlc_sp);
                            $vals = array_values($rlc_sp);
                            $columns = "(`".implode("`,`",$keys)."`)";
                            $values[] = "('".implode("','",$vals)."')";
                            $tags[] = $tag;
                        }
                    }
                    $insert_sql = "insert into relic ".$columns." values ".implode(",",$values);
                    $ret = $this->db->query($insert_sql);
                }
            }

            if($update_relics){
                $relics_split = array_chunk($update_relics,100);
                foreach($relics_split as $rlc_split) {
                    if ($rlc_split) {
                        foreach ($rlc_split as $rlc_sp) {
                            $tag = array();
                            if (isset($rlc_sp['tagNo'])) {
                                $tag['tagNo'] = $rlc_sp['tagNo'];
                                unset($rlc_sp['tagNo']);
                            }
                            if (isset($rlc_sp['boxNo'])) {
                                $tag['boxNo'] = $rlc_sp['boxNo'];
                                unset($rlc_sp['boxNo']);
                            }
                            if (isset($rlc_sp['relic_no'])) {
                                $tag['relicNo'] = $rlc_sp['relic_no'];
                                unset($rlc_sp['relic_no']);
                            }
                            if(isset($rlc_sp['relic_id'])&&$rlc_sp['relic_id']){
                                $relci_id = $rlc_sp['relic_id'];
                                unset($rlc_sp['relic_id']);
                                M("relic")->update($rlc_sp,"relic_id = '".$relci_id."'");
                                $tags[] = $tag;
                            }
                        }
                    }
                }
            }
            unlink($upload['save_path']);
            if($tags){
                $data = array(
                    "access_token"=>$this->_token,
                    "requestType"=>"pc",
                    'dataBody'=>json_encode($tags)
                );
                $this->config->load("rest_api");
                $api_hosts = $this->config->item("api_hosts");
                $url = $api_hosts['relics']['api_url']."/relicBox/importFromJson";
                M('import')->relic_box($url,$data);

            }
            $this->response(array('result'=>true,'msg'=>'导入完毕'));
        }
        $this->response(array('error'=>'文件不存在，上传失败！'));
    }

}