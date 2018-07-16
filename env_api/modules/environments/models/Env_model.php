<?php
/**
 * Created by PhpStorm.
 * User: HBJ_PC
 * Date: 16-4-27
 * Time: 下午1:26
 */

class Env_model extends MY_Model{

    function __construct(){
        $data = array();
    }

    function get_env_children($env_no,$level= 0){

        $envs = API('get/base/envs',array('parent_env_no'=>$env_no));

//        $data = array();
        if($envs['total']>0){
            foreach($envs['rows'] as $env){
                if(isset($env['env_no'])&&$env['env_no']){
                    $data[] = $env['env_no'];

                    while($level > 0){
                        $level--;
                        $this->get_env_children($env['env_no'],$level);
                    }
                }
            }
        }

//        return $data;
    }

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