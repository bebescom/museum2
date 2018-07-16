<?php defined('BASEPATH') OR exit('No direct script access allowed');

class Config extends MY_Controller
{
    function index_get_nologin()
    {
        $result = array('app_name' => app_config('app_name'));
        $result['user'] = $this->_user;
        $result['token'] = $this->_token;

//        $this->output->enable_profiler(true);
        $this->response($result);
    }

    function index_post_nologin()
    {
        $result = array('error' => 'post', 'post' => $this->post(), 'get' => $this->get());
        $result['raw_args'] = $this->_raw_args;
        print_r($this->input->raw_input_stream);
        $this->response($result);
    }

    function index_put()
    {
        $this->response(array('error' => 'put'));
    }

    function index_delete()
    {
        $this->response(array('error' => 'delete'));
    }

    function test_get($aa = 0, $ab = 1)
    {

        $r = array();
        $r['aa'] = $aa;
        $r['ab'] = $ab;
        $r['ac'] = $this->get('ac');
        $r['a'] = $a = API_encode('user', 'user_c8g4w0ogwksw4osws0ggkk40gkwww0css8k4o0w4');

//        echo ',';
        $r['b'] = $b = API_decode('user', $a);

        $this->response($r);
    }

}