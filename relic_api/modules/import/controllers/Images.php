<?php

/**
 * Created by PhpStorm.
 * User: Hebj
 * Date: 2017/11/9
 * Time: 11:26
 */
class Images  extends MY_Controller
{
    public function __construct()
    {
        parent::__construct();
    }

    public function index_post_nologin()
    {
        if (empty( $_POST['file'])) {
            $this->response(array('error'=>"无上传文件!",$_POST));
        }

        $relics = M("relic")->fetAll();
        $relic_images = array();
        if($relics){
            foreach ($relics as $relic) {
                if(isset($relic['image'])&&$relic['image']){
                    $images = explode("/",$relic['image']);
                    $image_name = array_pop($images);
                    $relic_images[] = $image_name;
                }
            }
        }

        $upload = upload($_POST['file'],'zip');
        if(isset($upload['error'])){
            $this->response($upload);
        }
        if(isset($upload['save_path'])&&$upload['save_path']){
            $image_path = $_SERVER['DOCUMENT_ROOT'] ."/uploads/relic/";
//            $cmd = "unzip -o {$upload['save_path']} -d ".$image_path;
//
//            exec($cmd,$retval,$status);
//            if($status){
//                $this->response(array($retval,$status));
//            }
            if(!is_dir($image_path)){
                mkdir($image_path);
            }
            $files =array();
            $zip = zip_open($upload['save_path']);
            while($zip_entry = zip_read($zip)){
                $zip_name = zip_entry_name($zip_entry);
                $file_size = zip_entry_filesize($zip_entry);
                if(zip_entry_open($zip,$zip_entry,"r")){
                    if(is_dir($zip_name)){
                        $this->response(array("error"=>"文件夹"));
                    }else{
                        $file_types = explode('.',$zip_name);
                        $suffix = $file_types[sizeof($file_types) - 1];
                        if(in_array(strtolower($suffix),array('png','jpg','jpeg','gif'))){
                            $file_names = explode('/',$zip_name);
                            $file_name = $file_names[sizeof($file_names) - 1];
                            if(in_array($file_name,$relic_images)){
                                $save_path = $image_path.$file_name;

                                $fstream = zip_entry_read($zip_entry,$file_size);
                                file_put_contents($save_path,$fstream);
                            }
                        }
                    }
                }
                zip_entry_close($zip_entry);
            }
            zip_close($zip);
            unlink($upload['save_path']);
            $this->response(array('result'=>true,"msg"=>"图片上传成功"));
        }
    }
}