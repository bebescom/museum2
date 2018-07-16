<?php

/**
 * Created by PhpStorm.
 * User: Hebj
 * Date: 2017/8/23
 * Time: 11:09
 */
class Weather_model extends MY_Model
{
    function wind_direction($wind_direction){
        if($wind_direction != ''&&$wind_direction != "NaN")
        {
            $w_direct = $wind_direction;
            if ($w_direct >= 348.76 || $w_direct <= 11.25) {
                $wind_direction = '北风';
            } else if ($w_direct >= 11.26 && $w_direct <= 33.75) {
                $wind_direction = '东北偏北风';
            } else if ($w_direct >= 33.76 && $w_direct <= 56.25) {
                $wind_direction = '东北风';
            } else if ($w_direct >= 56.26 && $w_direct <= 78.75) {
                $wind_direction = '东北偏东风';
            } else if ($w_direct >= 78.76 && $w_direct <= 101.25) {
                $wind_direction = '东风';
            } else if ($w_direct >= 101.26 && $w_direct <= 123.75) {
                $wind_direction = '东南偏东风';
            } else if ($w_direct >= 123.76 && $w_direct <= 146.25) {
                $wind_direction = '东南风';
            } else if ($w_direct >= 146.26 && $w_direct <= 168.75) {
                $wind_direction = '东南偏南风';
            } else if ($w_direct >= 168.76 && $w_direct <= 191.25) {
                $wind_direction = '南风';
            } else if ($w_direct >= 191.26 && $w_direct <= 213.75) {
                $wind_direction = '西南偏南风';
            } else if ($w_direct >= 213.76 && $w_direct <= 236.25) {
                $wind_direction = '西南风';
            } else if ($w_direct >= 236.26 && $w_direct <= 258.75) {
                $wind_direction = '西南偏西风';
            } else if ($w_direct >= 258.76 && $w_direct <= 281.25) {
                $wind_direction = '西风';
            } else if ($w_direct >= 281.26 && $w_direct <= 303.75) {
                $wind_direction = '西北偏西风';
            } else if ($w_direct >= 303.76 && $w_direct <= 326.25) {
                $wind_direction = '西北风';
            } else if ($w_direct >= 326.26 && $w_direct <= 348.75) {
                $wind_direction = '西北偏北风';
            }
        }
        return $wind_direction;
    }

    function wind_level($wind_speed)
    {
        if($wind_speed!= ''&&$wind_speed != "NaN"){
            $w_speed = $wind_speed;
            if ($w_speed >= 61.3) {
                $wind_speed = '十七级以上';
            } else if ($w_speed >= 56.1) {
                $wind_speed =  '十七级';
            } else if ($w_speed >= 51.0) {
                $wind_speed =  '十六级';
            } else if ($w_speed >= 46.2) {
                $wind_speed =  '十五级';
            } else if ($w_speed >= 41.5) {
                $wind_speed =  '十四级';
            } else if ($w_speed >= 37.0) {
                $wind_speed =  '十三级';
            } else if ($w_speed >= 32.7) {
                $wind_speed =  '十二级';
            } else if ($w_speed >= 28.5) {
                $wind_speed =  '十一级';
            } else if ($w_speed >= 24.5) {
                $wind_speed =  '十级';
            } else if ($w_speed >= 20.8) {
                $wind_speed =  '九级';
            } else if ($w_speed >= 17.2) {
                $wind_speed =  '八级';
            } else if ($w_speed >= 13.9) {
                $wind_speed =  '七级';
            } else if ($w_speed >= 10.8) {
                $wind_speed =  '六级';
            } else if ($w_speed >= 8.0) {
                $wind_speed =  '五级';
            } else if ($w_speed >= 5.5) {
                $wind_speed =  '四级';
            } else if ($w_speed >= 3.4) {
                $wind_speed =  '三级';
            } else if ($w_speed >= 1.6) {
                $wind_speed =  '二级';
            } else if ($w_speed >= 0.3) {
                $wind_speed =  '一级';
            } else {
                $wind_speed =  '零级';
            }
        }
        return $wind_speed;
    }

    function pm25_level($pm25)
    {
        if($pm25){
            if($pm25<35){
                $pm25 = '优';
            }else if($pm25>=35 && $pm25 < 75){
                $pm25 = '良';
            }else if($pm25>=75 && $pm25 < 115){
                $pm25 = '轻度污染';
            }else if($pm25>=115 && $pm25 < 150){
                $pm25 = '中度污染';
            }else if($pm25>=150 && $pm25 < 250){
                $pm25 = '重度污染';
            }else if($pm25>=250){
                $pm25 = '严重污染';
            }
        }
        return $pm25;
    }
}