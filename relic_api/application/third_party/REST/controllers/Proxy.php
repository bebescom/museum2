<?php defined('BASEPATH') OR exit('No direct script access allowed');

/**
 * /Proxy/get/base/config/111
 * Class Proxy
 */
class Proxy extends CI_Controller
{
    function _remap($method, $args)
    {
        if (count($args) < 2) {
            exit(zh_json_encode(array('error' => 'uri不完整')));
        }

        $uri = $method . '/' . join('/', $args);

        $get = $this->input->get();
        if (count($get) > 0) {
            $uri = $uri . '?' . http_build_query($get);
        }
        $post = $this->input->post();
        // var_dump($this->input->raw_input_stream);
        if ($this->input->raw_input_stream != '' && ($this->input->raw_input_stream{0} == '{'||$this->input->raw_input_stream{0} == '[')) {
            $raw = json_decode($this->input->raw_input_stream, true);
        } else {
            parse_str($this->input->raw_input_stream, $raw);
        }

        if (is_array($raw)) {
            $post = array_merge($post, $raw);
        }

//        print_r($uri);
        $this->load->library('rest_api');
        $this->rest_api->init($uri, $post);

        $result = $this->rest_api->exec_one();

//        var_dump($result);
        $http_code = $result['curl_info']['http_code'];
        if ($http_code) {
            $this->output->set_status_header($result['curl_info']['http_code']);
        }
        $data = $result['result'];
        if (!$data && isset($result['error'])) {
            $data = $result;
        }
//        print_r($data);
        $content_type_arr = explode(';', $result['curl_info']['content_type']);
        $content_type = $content_type_arr[0];
//        print_r($content_type);exit;
        if (strstr($content_type, 'html')) {
            $content_type = 'html';
        } elseif (strstr($content_type, 'javascript')) {
            $content_type = 'js';
        } elseif (strstr($content_type, 'xml')) {
            $content_type = 'xml';
        } else if (strstr($content_type, 'json')) {
            $content_type = 'json';
        }
        $this->output->set_content_type($content_type);
        if (is_array($data)) {
            $this->output->set_output(zh_json_encode($data));
        } else {
            $this->output->set_output($data);
        }

//        $this->output->enable_profiler(TRUE);
    }

}