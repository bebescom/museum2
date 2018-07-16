<?php

class Docx extends MY_Controller
{

    function index_get($report_id = '')
    {
        $m = M('report');
        $report = $m->find($report_id);
        if (!$report) {
            $this->response(array('error' => '没有找到该报告'));
        }

        $base_url = $_SERVER["DOCUMENT_ROOT"];
        $save_url = $base_url . "/uploads/{$this->db->database}/";
        if (!is_dir($save_url)) {
            if (!is_dir($base_url . "/uploads")) {
                mkdir($base_url . "/uploads");
            }
            if (!is_dir($save_url)) {
                mkdir($save_url);
            }
        }

        $filename = $report['museum_name'] . '预防性保护评估报告(' . $report['report_name'] . ')';
        $os_name = PHP_OS;
        $real_filename = $filename;
        if (strpos($os_name, "WIN") !== false) {
            $real_filename = mb_convert_encoding($filename, "gbk", "utf-8");
        }
        $qm = M('quarter');
        $rt = $qm->write_docx($report, $save_url . $real_filename . '.docx');

        $file_path = "/uploads/{$this->db->database}/" . $filename . '.docx';
        if ($rt === true) {
            $m->save(array('report_file' => $file_path), $report_id);
            $this->response(array('file' => $file_path));
        }
        $this->response(array('error' => $rt));


    }

}