<?php

class Admin extends MY_Controller
{

    function index_get_nologin($a = '1')
    {
        echo __FILE__;
        echo '<br/>';
        print_r($a);
        $e = API_encode('base', array('a' => $a));
        echo $e;
        echo '<br/>';
        print_r(API_decode('base', $e));
    }

    function test_get($a = '1')
    {

        $a = API(array(array('get/base/a/b'),array('post/base/a/b')));
        $this->response($a);
    }
}