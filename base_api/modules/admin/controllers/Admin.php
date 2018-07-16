<?php

class Admin extends MY_Controller
{

    function index_get_nologin($a = '1')
    {
        $a = API('get/base/admin/b');
        $b = API('post/base/admin/b');
        $c = API('get/base/config');

        $this->response(array($a,$b,$c));
    }

    function test_get_nologin($a = '1')
    {

        $a = array('123' => 'aaa');
        $code = API_encode('base', $a);
        $da = API_decode('base', $code);
        //$a = API(array(array('get/base/admin/b'),array('post/base/admin/b')));
        $a = array($code, $da);
        $a[] = API('get/base/config');
        $this->response($a);
    }

}