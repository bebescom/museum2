<?php

/**
 * Created by PhpStorm.
 * User: Hebj
 * Date: 2017/5/3
 * Time: 10:22
 */
class Upload extends MY_Controller
{

    public function index_post()
    {
        $report_id = $this->get_post('report_id');
        $image_key = $old_image_key = $this->get_post('image_key');
        $base_code = $this->get_post("base_code");

        $img = base64_decode($base_code);
        $base_url = $_SERVER["DOCUMENT_ROOT"];
        $file_path = "/uploads/{$this->db->database}/{$report_id}/";
        $save_url = $base_url . $file_path;
        $suffix = "png";
        if (!is_dir($save_url)) {
            if (!is_dir($base_url . "/uploads")) {
                mkdir($base_url . "/uploads");
            }
            if (!is_dir($base_url . "/uploads/{$this->db->database}/")) {
                mkdir($base_url . "/uploads/{$this->db->database}/");
            }
            if (!is_dir($save_url)) {
                mkdir($save_url);
            }
        }
        if (strpos(PHP_OS, "WIN") !== false) {
            $image_key = mb_convert_encoding($image_key, "gbk", "utf-8");
        }

        $a = file_put_contents($save_url . str_replace('/', '_', $image_key) . "." . $suffix, $img);
//        $image_key = mb_convert_encoding($image_key,"utf-8","gbk");
        $image_url = $file_path . str_replace('/', '_', $old_image_key) . "." . $suffix;
        M("images")->update(array('image_url' => $image_url), 'report_id = ' . $report_id . ' and image_key = "' . $old_image_key . '"');

        $this->response(array('size' => $a, "image_url" => $image_url));
    }

    public function test_get()
    {
        $this->response(M("museum/data")->get_standard_deviation(array(1, 2, 3, 4, 5)));
    }
}