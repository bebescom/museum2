<?php

/**
 * Created by PhpStorm.
 * User: Hebj
 * Date: 2017/3/30
 * Time: 13:57
 */
class Weather_station extends MY_Controller
{
    public function __construct()
    {
        parent::__construct();
    }

    public function index_get_nologin(){
        $stations = M("weather")->fetAll();
        $this->response($stations);
    }
}