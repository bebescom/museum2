<?php

/**
 * Created by PhpStorm.
 * User: Hebj
 * Date: 2016/12/21
 * Time: 11:41
 */
class Map extends  MY_Controller
{

    public function index_get(){
        $env_nos = $this->get_post("env_no");
        $index = $this->get_post("index");

        $data = array(
            "index"=>$index,
            "env"=>array()
        );
        if($env_nos){
            $envs = API("get/base/envs",array("env_no"=>$env_nos));
            if(isset($envs['rows'])&&$envs['rows']){
                foreach($envs['rows'] as $env){
                    if(isset($env['env_no'])&&$env['env_no']){
                        $data['env'][$env['env_no']] = array();
                    }
                    if(isset($env['name'])&&$env['name']){
                        $data['env'][$env['env_no']]['name'] = $env['name'];
                    }
                    if(isset($env['type'])&&$env['type']){
                        if(in_array($env['type'],array("展柜","存储柜","安防展柜","囊匣"))){
                            if(isset($env['parent_env_no'])&&$env['parent_env_no']){
                                $parent_env = API("get/base/envs/info/".$env['parent_env_no']);
                                if($parent_env){
                                    if(isset($parent_env['map'])&&$parent_env['map']){
                                        $data['env'][$env['env_no']]['map'] = $parent_env['map'];
                                    }
                                }
                            }
                            if(isset($env['locate'])&&$env['locate']){
                                $locate = json_decode($env['locate'],true);
                                if(isset($locate['area'])){
                                   if($locate['area']){
                                       $point = $locate['area'][0];
                                       $point_xy = explode(",",$point);
                                       $locate['x'] = isset($point_xy[0])?$point_xy[0]:0;
                                       $locate['y'] = isset($point_xy[1])?$point_xy[1]:0;
                                   }
                                    unset($locate['area']);
                                }
                                $data['env'][$env['env_no']]['locate'] = $locate;
                            }else{
                                $data['env'][$env['env_no']]['locate'] = false;
                            }
                        }else{
                            if(isset($env['map'])&&$env['map']){
                                $data['env'][$env['env_no']]['map'] = $env['map'];
                            }
                            $data['env'][$env['env_no']]['locate'] = false;
                        }
                    }
                }
            }
        }
        $this->response($data);
    }
}