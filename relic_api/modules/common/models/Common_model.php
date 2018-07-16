<?php

/**
 * Created by PhpStorm.
 * User: Hebj
 * Date: 2017/1/5
 * Time: 15:46
 */
class Common_model extends MY_Model
{
    public function get_children($env_no = array()){
        $envs = API("get/base/envs",array("sort_by"=>"id asc"));
        $env_nos = $env_no;
        $box_parents = array();
        if(isset($envs['rows'])&&$envs['rows']){
            foreach ($envs['rows'] as $env) {
                if($env_nos){
                    if(isset($env['parent_env_no'])&&$env['parent_env_no']&&in_array($env['parent_env_no'],$env_nos)){
                        $env_nos[] = $env['env_no'];
                    }
                }else{
                    $env_nos[] = $env['env_no'];
                }
                if(isset($env['type'])&&in_array($env['type'],array("展厅","库房","修复室","研究室","楼层"))){
                    $box_parents[] = $env['env_no'];
                }
            }
        }

        if($box_parents){
            $boxes = API("get/base/envs/boxes",array('parent_env_no'=>implode(",",$box_parents)));
            if(isset($boxes['rows'])&&$boxes['rows']){
                foreach($boxes['rows'] as $box){
                    if(isset($box['env_no'])&&$box['env_no']){
                        $env_nos[] = $box['env_no'];
                    }
                }
            }
        }

        return $env_nos;
    }

    function navigation($envs,$env_no)
    {
        $env_nos = array();
        $navs = array();
        foreach ($envs as $env) {
            if(isset($env['env_no'])&&$env['env_no']){
                $env_nos[$env['env_no']] = $env;
            }
        }
        if(isset($env_nos[$env_no])){
            $temp = $env_nos[$env_no];
            $navs[] = $temp;
            while(isset($temp['parent_env_no'])){
                $temp = isset($env_nos[$temp['parent_env_no']])?$env_nos[$temp['parent_env_no']]:array();
                if($temp){
                    $navs[] = $temp;
                }
            }
            $navs = array_reverse($navs);
        }

        return $navs;
    }
}