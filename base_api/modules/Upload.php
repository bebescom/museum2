<?php

/**
 * Created by PhpStorm.
 * User: USER
 * Date: 2017/1/10
 * Time: 10:25
 */
class Upload extends MY_Controller
{

    function index()
    {

        $data = array();
        $data['path'] = $path = $this->post('path');
        $file = $this->post('upload_file');

        if (empty($file['tmp_name'])) {
            $this->response(array('error' => '上传文件失败.'));
        }
        if (stripos($data['path'], '.') !== false) {
            $this->response(array('error' => 'path 不允许使用.'));
        }

        $pinfo = pathinfo($file['name']);
        $extension = $pinfo['extension'];
        if (in_array($extension, array('php'))) {
            $this->response(array('error' => '不允许上传' . $extension . '文件'));
        }

        $new_path = $_SERVER['DOCUMENT_ROOT'] . "/uploads/" . $path;
        // phpinfo();exit;
        if (!is_dir($new_path)) {
            mkdir($new_path, 0766, true);
        }
        if(!file_exists($file['tmp_name'])){
            $this->response(array('error' => 'tmp_name '.$file['tmp_name'].' not find'));
        }
        $filename = md5_file($file['tmp_name']);
        $file['up_file'] = str_replace('/', DIRECTORY_SEPARATOR, $new_path . '/' . $filename . '.' . $extension);
        $do = rename($file['tmp_name'], $file['up_file']);
        if (!$do) {
            $this->response(array('error' => '移动上传文件失败.', 'file' => $file));
        }

        //图片压缩
        if(file_exists($file['up_file'])&&filesize($file['up_file'])>200*1024){
            $percent = 200*1024/filesize($file['up_file']);
            $this->_compressImg($file['up_file'],$percent);
        }
        $data['url'] = '/uploads/' . $path . '/' . $filename . '.' . $extension;
//        $data['file'] = $file;
        $this->response($data);
    }

    function show($path = '', $file = '')
    {
        $data['path'] = $path;
        $pinfo = pathinfo($file);
        $extension = $pinfo['extension'];
        $file = $_SERVER['DOCUMENT_ROOT'] . "/uploads/" . $path . '/' . $file;
        if (!is_file($file)) {
            $this->response(array('error' => '没有找到该文件'));
        }
        $this->output
            ->set_content_type($extension)
            ->set_output(file_get_contents($file));
    }

    function _compressImg($file,$percent){
        list($width, $height) = getimagesize($file); //获取原图尺寸
//缩放尺寸
        $newwidth=$this->input->get_post('width');
        if(empty($newwidth)){
        	$newwidth = 300;
        }
        $newheight=$this->input->get_post('height');
        if(empty($newheight)){
        	$newheight = 200;
        }
        
        if( false !== @imagecreatefromjpeg($file)) {
            $extension = "jpg";
            $src_im = imagecreatefromjpeg($file);
        }else  if( false !== @imagecreatefrompng($file)) {
            $extension = "png";
            $src_im = imagecreatefrompng($file);
        }else if( false !== @imagecreatefromgif($file)) {
            $extension = "gif";
            $src_im = imagecreatefromgif($file);
        }else if( false !== @imagecreatefromwbmp($file)) {
            $extension = "bmp";
            $src_im = imagecreatefromwbmp($file);
        }else{
            $src_im = imagecreatefromstring($file);
            $extension = "string";
        }
        $dst_im = imagecreatetruecolor($newwidth, $newheight);
        ImageCopyResampled($dst_im, $src_im, 0, 0, 0, 0, $newwidth, $newheight, $width, $height);
        imagejpeg($dst_im,$file); //输出压缩后的图片
        if($extension == "pjpeg"||$extension == "jpg"|$extension == "jpeg") {
            imagejpeg($dst_im,$file);
        }elseif($extension == "png"){
            imagepng($dst_im,$file);
        }elseif($extension == "gif"){
            imagegif($dst_im,$file);
        }else if($extension == 'bmp'){//默认jpg
            imagewbmp($dst_im,$file);
        }else{
            imagestring($dst_im,$file);
        }
        imagedestroy($dst_im);
        imagedestroy($src_im);
    }
}