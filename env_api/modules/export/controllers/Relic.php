<?php

/**
 * Created by PhpStorm.
 * User: Hebj
 * Date: 2017/2/22
 * Time: 15:13
 */
class Relic extends MY_Controller
{

    public function __construct(){
        parent::__construct();
        $this->load->Library("excel");

        $sensor_param = M("equipments/equip")->get_parameters('sensor');
        $this->param = array();
        if($sensor_param){
            foreach($sensor_param as $sp){
                if(isset($sp['param'])&&$sp['param']){
                    $this->param[$sp['param']] = array("name"=>$sp['name'],"unit"=>$sp['unit']);
                }
            }
        }

        $this->order_time = "equip_time";

        $this->fileds = array("equip_no" , "env_no" , "humidity" , "temperature" , "voc" , "co2" , "uv" , "light" , "organic" , "inorganic" , "sulfur" , "dip" , "acceleration" , "canbi" , "voltage" , "rssi" , "move_alert" , "box_open_alert" , "box_status" , "wind_speed" , "wind_direction" , "rain" , "air_presure" , "pm10" , "pm25" , "equip_time" , "server_time" , "ip_port" , "php_time" , "alert_param" , "status" , "soil_humidity" , "soil_temperature" , "soil_conductivity" , "broken" , "vibration" , "multi_wave" , "cascophen" );

    }
    /**
     * 文物列表导出
     */
    function relic_list_get()
    {
        $relic_no = $this->get('relic_no');
        $parent_env_no = $this->get('parent_env_no');
        $level = $this->get('level');
        $category = $this->get('category');
        $age = $this->get('age');
        $name = $this->get('name');
        $material = $this->get_post("material");
        $title = $this->get_post("title");

        $fieldsxml = M("export")->getFields("relic_list");
        $fields = $fieldsxml['fields'];
        $fname = $fieldsxml['fename'];
        $fchnname = $fieldsxml['fchnname'];

        $where = array();
        if(isset($env_nos)&&$env_nos){
            $where['parent_env_no'] = $parent_env_no;
        }

        if(isset($relic_no)&&$relic_no){
            $where['relic_no'] = $relic_no;
        }

        if(isset($level)&&$level){
            $where['level'] = $level;
        }
        if(isset($category)&&$category){
            $where['category'] = $category;
        }
        if(isset($material)&&$material){
            $where['material'] = $material;
        }
        if(isset($age)&&$age){
            $where['age'] = $age;
        }

        if(isset($name)&&$name){
            $where['name'] = $name;
        }

        $relics = API('get/relic/relics',$where);
        $navs = array();
        $data = array();
        if(isset($relics['rows'])&&$relics['rows']){
            foreach($relics['rows'] as $k=>$relic){
                unset($relic['id']);
                unset($relic['sort']);
                unset($relic['image']);
                unset($relic['locate']);
                if(isset($relic['parent_env_no'])&&$relic['parent_env_no']){
                    if(isset($navs[$relic['parent_env_no']])){
                        $relic['nav'] = $navs[$relic['parent_env_no']];
                    }else{
                        $nav_name = array();
                        $nav = API('get/base/envs/navigation/'.$relic['parent_env_no'].'');
                        if(isset($nav['rows'])&&$nav['rows']){
                            foreach($nav['rows'] as $nr){
                                $nav_name[] = $nr['name'];
                            }
                        }
                        $navs[$relic['parent_env_no']] = implode(">>",$nav_name);
                        $relic['nav'] = $navs[$relic['parent_env_no']];
                    }
                    unset($relic['parent_env_no']);
                }
                if(isset($relic['relic_no'])&&$relic['relic_no']){
                    $relic['relic_no'] .= "\t";
                }
                $data[] = $relic;
            }
        }
        if(!isset($title)||!$title){
            $title = $fchnname.'_'.date("Ymd");
        }
        try{
            $url = $this->excel->download2007($title, $fields, $data);
            $download = API('get/base/download/',array("url"=>$url,"from"=>"env"));
            $this->response($download);
        }catch(Exception $e){
            $this->response($e);
        }

        $this->response($data);
    }

}