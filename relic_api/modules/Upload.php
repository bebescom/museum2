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

        $data['url'] = '/uploads/' . $path . '/' . $filename . '.' . $extension;
        $data['file'] = $file;
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
}