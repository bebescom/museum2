<?php

/**
 * Name: A.php
 * User: lrb
 * Date: 2016/3/29
 * Time: 9:34
 */
class B extends MY_Controller
{
    function index_get_nologin()
    {

        $this->response(array('bbbbbbbbbbb' => 1));
    }

    function index_post_nologin()
    {
        $this->response(array('bbbbbb' =>2));
    }
}