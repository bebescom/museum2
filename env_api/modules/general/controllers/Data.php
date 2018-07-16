<?php

/**
 * Created by PhpStorm.
 * User: Hebj
 * Date: 2016/11/9
 * Time: 14:31
 */
class Data extends MY_Controller
{
    public function __construct()
    {
        parent::__construct();
        $this->order_time = "equip_time";

        $sensor_param = M("equipments/equip")->get_parameters('sensor');
        $this->param = array();
        if($sensor_param){
            foreach($sensor_param as $sp){
                if(isset($sp['param'])&&$sp['param']){
                    $this->param[$sp['param']] = array("name"=>$sp['name'],"unit"=>$sp['unit']);
                }
            }
        }
    }

    public function th_pole_get()
    {
        $envs = API("get/base/envs",array("type"=>"展厅,库房,修复室,研究室"));

        $env_nos = array();
        if(isset($envs['rows'])&&$envs['rows']){
            foreach($envs['rows'] as $er){
                if(isset($er['env_no'])&&$er['env_no']){
                    if(isset($er['name'])&&$er['name']){
                        $env_nos[$er['env_no']] = $er['name'];
                    }
                }
            }
        }

        $sql = "select temperature,humidity,env_no,equip_time,server_time from data_sensor".
                  " where env_no in ('".implode("','",array_keys($env_nos))."') and ".$this->order_time." >=".strtotime("yesterday")." and ".$this->order_time." <".strtotime("today").
                    " and temperature is not null  and humidity is not null and temperature !='' and humidity !=''";
        $ytd_datas = $this->db->query($sql)->result_array();

        $bytd = strtotime("yesterday") - 24*3600;
        $bytd_sql = "select min(temperature) as min_temp,max(temperature) as max_temp,min(humidity) as min_hum,max(humidity) as max_hum from data_sensor".
            " where env_no in ('".implode("','",array_keys($env_nos))."') and ".$this->order_time." >=".$bytd." and ".$this->order_time." <".strtotime("yesterday");
        $bytd_pole = $this->db->query($bytd_sql)->row_array();

        $sort_data = array();
        $temp_sort = array();
        $hum_sort = array();
        $num = 0;
        if($ytd_datas){
            foreach ($ytd_datas as $ds) {
                if(isset($ds['env_no'])&&$ds['env_no']){
                    $sort_data[$ds['env_no'].$num] = $ds;
                    $num++;
                }
            }
            $temp_sort = $sort_data;
            $hum_sort = $sort_data;
            uasort($temp_sort,function($a,$b){
                if($a['temperature'] == $b['temperature']) return 0;
                return ($a['temperature'] > $b['temperature'])?1:-1;
            });
            uasort($hum_sort,function($a,$b){
                if($a['humidity'] == $b['humidity']) return 0;
                return ($a['humidity'] > $b['humidity'])?1:-1;
            });
        }

        $data = array('temperature'=>array(),'humidity'=>array());
        if($temp_sort){
            $min = current($temp_sort);
            if($min){
                $data['temperature']['min'] = array();
                if(isset($min['temperature'])){
                   while($min['temperature'] == "NaN"){
                       $min = next($temp_sort);
                   }
                    $data['temperature']['min']['val'] = deal_data_decimal('temperature',$min['temperature']);
                    $data['temperature']['min']['mark'] = 0;
                    if($bytd_pole&&isset($bytd_pole['min_temp'])){
                        $data['temperature']['min']['mark'] = deal_data_decimal('temperature',$min['temperature'] - $bytd_pole['min_temp']);
                    }
                    $data['temperature']['min']['time'] = date("H:i",$min[$this->order_time]);
                }
                if(isset($min['env_no'])&&$min['env_no']){
                    if(isset($env_nos[$min['env_no']])){
                        $data['temperature']['min']['env_name'] = $env_nos[$min['env_no']];
                    }
                }
            }

            $max = array_pop($temp_sort);
            if($max){
                $data['temperature']['max'] = array();
                if(isset($max['temperature'])){
                    if($max['temperature'] == "NaN"){
                        $max = array_pop($temp_sort);
                    }
                    $data['temperature']['max']['val'] = deal_data_decimal('temperature',$max['temperature']);
                    $data['temperature']['max']['mark'] = 0;
                    if($bytd_pole&&isset($bytd_pole['max_temp'])){
                        $data['temperature']['max']['mark'] = deal_data_decimal('temperature',$max['temperature'] - $bytd_pole['max_temp']);
                    }
                    $data['temperature']['max']['time'] = date("H:i",$max[$this->order_time]);
                }
                if(isset($max['env_no'])&&$max['env_no']){
                    if(isset($env_nos[$max['env_no']])){
                        $data['temperature']['max']['env_name'] = $env_nos[$max['env_no']];
                    }
                }
            }
            if(isset($this->param['temperature'])){
                $data['temperature'] = array_merge( $data['temperature'],$this->param['temperature']);
            }
        }

        if($hum_sort){
            $min = current($hum_sort);
            if($min){
                $data['humidity']['min'] = array();
                if(isset($min['humidity'])){
                    while($min['humidity'] == "NaN"){
                        $min = next($hum_sort);
                    }
                    $data['humidity']['min']['val'] = deal_data_decimal('humidity',$min['humidity']);
                    $data['humidity']['min']['mark'] = 0;
                    if($bytd_pole&&isset($bytd_pole['min_hum'])){
                        $data['humidity']['min']['mark'] = deal_data_decimal('humidity',$min['humidity'] - $bytd_pole['min_hum']);
                    }
                    $data['humidity']['min']['time'] = date("H:i",$min[$this->order_time]);
                }
                if(isset($min['env_no'])&&$min['env_no']){
                    if(isset($env_nos[$min['env_no']])){
                        $data['humidity']['min']['env_name'] = $env_nos[$min['env_no']];
                    }
                }
            }
            $max = array_pop($hum_sort);
            if($max){
                $data['humidity']['max'] = array();
                if(isset($max['humidity'])){
                    if($max['humidity'] == "NaN"){
                        $max = array_pop($hum_sort);
                    }
                    $data['humidity']['max']['val'] = deal_data_decimal('humidity',$max['humidity']);
                    $data['humidity']['max']['mark'] = 0;
                    if($bytd_pole&&isset($bytd_pole['max_hum'])){
                        $data['humidity']['max']['mark'] = deal_data_decimal('humidity',$max['humidity'] - $bytd_pole['max_hum']);
                    }
                    $data['humidity']['max']['time'] = date("H:i",$max[$this->order_time]);
                }
                if(isset($max['env_no'])&&$max['env_no']){
                    if(isset($env_nos[$max['env_no']])){
                        $data['humidity']['max']['env_name'] = $env_nos[$max['env_no']];
                    }
                }
            }
            if(isset($this->param['humidity'])){
                $data['humidity'] = array_merge( $data['humidity'],$this->param['humidity']);
            }
        }
        $this->response($data);

    }

    public function equip_count_get(){
//        if(!M("common/permission")->check_permission("设备统计信息",$this->_user)){
//            $this->response(array('error' => '无权限查看设备统计信息'));
//        }

        $equip_types = equip_type('type');
        $sensor = array('温湿度监测终端','带屏温湿度监测终端','有机挥发物监测终端','光照紫外监测终端','二氧化碳监测终端','空气质量监测终端','土壤温湿度监测终端','安防监测终端','震动监测终端');
        if(isset($equip_types['监测终端'])){
            $sensor = $equip_types['监测终端'];
        }
        $controller = array('调湿机','调湿柜','调湿剂');
        if(isset($equip_types['调控设备'])){
            $controller = $equip_types['调控设备'];
        }
        $offline = array('手持式温湿度检测仪','手持式光照紫外检测仪','手持式有机挥发物检测仪','手持式二氧化碳检测仪','手持式甲醛检测仪');
        if(isset($equip_types['手持离线设备'])){
            $offline = $equip_types['手持离线设备'];
        }
        $box = array('智能囊匣');
        if(isset($equip_types['智能囊匣'])){
            $box = $equip_types['智能囊匣'];
        }
        $network = array('网关','中继');
        if(isset($equip_types['网络设备'])){
            $network = $equip_types['网络设备'];
        }

        $sql_str = "SELECT count(*) as count,equip_type FROM equip WHERE equip_type NOT IN ('".implode("','",$offline)."') GROUP BY equip_type";
        $equips = $this->db->query($sql_str)->result_array();
        $data = array(
            "equip_total"=>0,
            "sensor"=>0,
            "controller"=>0,
            "network"=>0
        );
        if($equips){
            foreach($equips as $equip){
                if(isset($equip['equip_type'])&&$equip['equip_type']){
                   if(in_array($equip['equip_type'],$network)){
                       $data['network'] += $equip['count'];
                       $data['equip_total'] += $equip['count'];
                   }else if(in_array($equip['equip_type'],$sensor)){
                       $data['sensor'] += $equip['count'];
                       $data['equip_total'] += $equip['count'];
                   }else if(in_array($equip['equip_type'],$controller)){
                       $data['controller'] += $equip['count'];
                       $data['equip_total'] += $equip['count'];
                   }
                }
            }
        }


        $data_total = $this->db->query('explain select count(*) as count from data_sensor')->row_array();
        $data['data_total'] = (int)$data_total['rows'];
        $this->response($data);
    }

    public function relic_count_get(){
        $envs = API("get/base/envs",array("type"=>"展厅,库房,展柜,存储柜,安防展柜,楼层,楼栋"));

        $show_env = array();
        $store_env = array();

        if(isset($envs['rows'])&&$envs['rows']){
            foreach($envs['rows'] as $er){
                if(isset($er['type'])){
                    if($er['type'] == "展厅"||$er['type'] == "展柜"||$er['type'] == "安防展柜"||$er['type'] == "楼层"||$er['type'] == "楼栋"){
                        if(isset($er['env_no'])&&$er['env_no']){
                            $show_env[] = $er['env_no'];
                        }
                    }else if($er['type'] == "库房"||$er['type'] == "存储柜"){
                        if(isset($er['env_no'])&&$er['env_no']){
                            $store_env[] = $er['env_no'];
                        }
                    }
                }
            }
        }
        $data = array(
            "total"=>0,
            "show"=>0,
            "store"=>0
        );
        $relics = API('get/relic/relics');
        if(isset($relics['rows'])&&$relics['rows']){
            foreach($relics['rows'] as $rr){
                $data['total']++;
                if(isset($rr['parent_env_no'])&&$rr['parent_env_no']){
                   if(in_array($rr['parent_env_no'],$store_env,true)){
                        $data['store']++;
                    }else if(in_array($rr['parent_env_no'],$show_env,true)){
                       $data['show']++;
                   }
                }
            }
        }

        $this->response($data);
    }
}