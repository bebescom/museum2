<?php

/**
 * Created by PhpStorm.
 * User: Hebj
 * Date: 2017/10/10
 * Time: 11:39
 */
class Env_model extends MY_Model
{

    /**
    *  重名环境处理
     */
    function rename_repeat_env($envs,$select_nos)
    {
        $env_nos = explode(',',$select_nos);
        $env_names = array();
        $env_info = array();
        if(isset($envs)&&$envs){
            foreach ($envs as $env) {
                $env_info[$env['env_no']] = $env;
                if(in_array($env['env_no'],$env_nos)){
                    if(!isset($env_names[$env['name']])){
                        $env_names[$env['name']] = array();
                    }
                    $env_names[$env['name']][] = $env['env_no'];
                }
            }
        }
        if($env_names){
            foreach ($env_names as $env_name=>$en_nos) {
                $env_diff = array();
                if(sizeof($en_nos)>1){
                    foreach($en_nos as $en_no){
                        $num = 0;
                        if(!isset($env_diff[$num])){
                            $env_diff[$num] = array();
                        }
                        if(!isset($env_diff[$num][$env_info[$en_no]['name']])){
                            $env_diff[$num][$env_info[$en_no]['name']] = array();
                        }
                        $env_diff[$num][$env_info[$en_no]['name']][] = $en_no;
                        $en_env = $env_info[$en_no];
                        while(isset($en_env['parent_env_no'])&&$en_env['parent_env_no']){
                            $num++;
                            if(!isset($env_diff[$num])){
                                $env_diff[$num] = array();
                            }
                            if(!isset($env_diff[$num][$env_info[$en_env['parent_env_no']]['name']])){
                                $env_diff[$num][$env_info[$en_env['parent_env_no']]['name']] = array();
                            }
                            $env_diff[$num][$env_info[$en_env['parent_env_no']]['name']][] = $en_no;
                            $en_env = $env_info[$en_env['parent_env_no']];
                        }
                    }
                    if($env_diff){
                        for($i = 1;$i<=sizeof($env_diff);$i++){
                            if(isset($env_diff[$i])){
                                foreach($env_diff[$i] as $d_name=>$d_nos){
                                    if(sizeof($d_nos)==1){
                                        if(!isset($env_info[$d_nos[0]]['is_edit'])||$env_info[$d_nos[0]]['is_edit'] == false){
                                            $env_info[$d_nos[0]]['name'] = $d_name.'-'.$env_name;
                                            $env_info[$d_nos[0]]['is_edit'] = true;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        return $env_info;
    }
}