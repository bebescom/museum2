<?php

/**
 * Created by PhpStorm.
 * User: Hebj
 * Date: 2016/12/6
 * Time: 16:32
 */
class Download extends MY_Controller
{
    /**
     * 返回下载文件的最终地址
     * @url 源文件的文件地址(url)
     * @from 源文件的服务器标识（from）
     */
    function index_get_nologin(){
        $file_url = $this->get_post("url");
        $file_from = $this->get_post("from");
        $this->config->load("rest_api");
        $api_hosts = $this->config->item("api_hosts");
        if($file_url&&$file_from){
            $server = $api_hosts[$file_from]['api_url'];
            $file = explode("/",$file_url);
            $filename = $file[sizeof($file) - 1];
            $url = $server.$file_url;
            $save_dir='./downloads/';
            $this->_getFile($url,$save_dir,$filename);
            if(isset($get_file['error'])){
                $this->response($get_file);
            }
            $this->response(array("result"=>true,"url"=>$save_dir.$filename));
        }
        $this->response(array("result"=>false,"url"=>"文件下载失败"));
    }

    /**
     * 从相应的服务器获取所需的文件以供下载
     * @url 源文件所在地址
     * @save_dir 抓取文件后存放地址
     * @filename 源文件名
     */
    function _getFile($url,$save_dir="",$filename){
        // maximum execution time in seconds
        if(!$save_dir){
            $save_dir = './downloads/';
        }
        if(!is_dir($save_dir)){
            mkdir('./downloads/');
        }

        $os_name = PHP_OS;
        if(strpos($os_name,"WIN")!==false){
            $filename = mb_convert_encoding($filename,"gbk","utf-8");
        }
        $newfname = $save_dir.$filename;
        if (!@fopen ($url, "rb")) {
            $this->response(array('error'=>"下载文件失败"));
        }
        $file = fopen ($url, "rb");
        $newf = fopen ($newfname, "wb");
        if ($newf){
            while(!feof($file)) {
                fwrite($newf, fread($file, 1024 * 8 ), 1024 * 8 );
            }
        }
        if ($file) {
            fclose($file);
        }
        if (isset($newf)) {
            fclose($newf);
        }
    }

    /**
     * 未使用
     */
    function down2($save_dir='',$filename=''){
        $os_name = PHP_OS;
        if(strpos($os_name,"WIN")!==false){
            $filename = mb_convert_encoding($filename,"gbk","utf-8");
        }
        if(!$save_dir){
            $save_dir='./downloads/';
        }
        $file_path= $save_dir.$filename;//文件名
        if(!file_exists($file_path)){
            return array("result"=>false,"msg"=>"文件不存在"); //直接退出
        }
        header('Content-Description: File Transfer');
        header('Content-Type: application/octet-stream');
        header('Content-Disposition: attachment; filename='.$filename);
        header('Content-Transfer-Encoding: binary');
        header('Expires: 0');
        header('Cache-Control:must-revalidate, post-check=0, pre-check=0');
        header('Pragma: public');
        header('Content-Length: ' . filesize($file_path));
        readfile($file_path);
        return $file_path;
    }
}