<?php

/**
 * Created by PhpStorm.
 * User: Hebj
 * Date: 2017/4/26
 * Time: 9:30
 */
class Data_model extends MY_Model
{
    function get_standard_deviation($data){
        $sd = 0;
        if($data){
            $sum = array_sum($data);
            $n = sizeof($data);
            $average = $sum/$n;

            $pow_sum = 0;
            foreach($data as $d){
                $pow_sum += pow($d - $average,2);
            }

            $sd = round(pow($pow_sum/$n,0.5),2);
        }

        return $sd;
    }
}