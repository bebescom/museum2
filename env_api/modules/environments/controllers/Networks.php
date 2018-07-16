<?php
class Networks extends MY_Controller{

	function index_get_nologin(){
		$m=M("equipments/equip");

        $env = M('env');
        $this->response(array($m->get_parameters()));
	}

	/**
	 * 楼层，4. 基础网络，设备统计
	 * 分类统计网络设备
	 * @floor_no 楼层/展厅编号
	 */
    function network_counts_get($floor_no){

        $envs = API('get/base/envs',array('parent_env_no'=>$floor_no));

        $env_nos = array($floor_no);
        if($envs['total']>0){
            foreach($envs['rows'] as $env){
                if(isset($env['env_no'])&&$env['env_no']){
                    if(in_array($env['type'],array("展厅","库房","修复室","研究室","楼层"))){
//                        $small_env[] = $env['env_no'];
                        $env_nos[] = $env['env_no'];
                        $cabinet = API('get/base/envs',array('parent_env_no'=>$env['env_no']));
                        if($cabinet['total']>0){
                            foreach($cabinet['rows'] as $c){
                                if(isset($c['env_no'])&&$c['env_no']){
//                                    $micro_env[] = $c['env_no'];
                                    $env_nos[] = $c['env_no'];
                                }
                            }
                        }
                    }else if(in_array($env['type'],array("展柜","存储柜","安防展柜"))){
//                        $micro_env[] = $env['env_no'];
                        $env_nos[] = $env['env_no'];
                    }
                }
            }
        }

        $network = array('中继','网关');
       if($env_nos){
           $networks = $this->db->select("equip_type,count(*) as count")->where_in('equip_type',$network)->where_in('env_no',$env_nos)
               ->group_by('equip_type')->get('equip')->result_array();
       }

        $data = array();
       if(isset($networks)&&$networks){
           foreach($networks as $nt){
               $data[$nt['equip_type']] = $nt['count'];
           }
       }
        $this->response($data);
    }

	/**
	 * 楼层，4. 基础网络，设备列表
	 * 获取网络设备列表及其信号强度
	 * @floor_no 楼层/展厅编号
	 */
    function network_lists_get($floor_no){
        $envs = API('get/base/envs',array('parent_env_no'=>$floor_no));

        $env_nos = array($floor_no);
        if($envs['total']>0){
            foreach($envs['rows'] as $env){
                if(isset($env['env_no'])&&$env['env_no']){
                    if(in_array($env['type'],array("展厅","库房","修复室","研究室","楼层"))){
//                        $small_env[] = $env['env_no'];
                        $env_nos[] = $env['env_no'];
                        $cabinet = API('get/base/envs',array('parent_env_no'=>$env['env_no']));
                        if($cabinet['total']>0){
                            foreach($cabinet['rows'] as $c){
                                if(isset($c['env_no'])&&$c['env_no']){
//                                    $micro_env[] = $c['env_no'];
                                    $env_nos[] = $c['env_no'];
                                }
                            }
                        }
                    }else if(in_array($env['type'],array("展柜","存储柜","安防展柜"))){
//                        $micro_env[] = $env['env_no'];
                        $env_nos[] = $env['env_no'];
                    }
                }
            }
        }

        $network = array('中继','网关');
        if($env_nos){
            $networks = $this->db->select("*")->where_not_in('status',array("停用"))->where_in('equip_type',$network)->where_in('env_no',$env_nos)->get('equip')->result_array();

        }
        $data = array(
            '中继'=>array(
                'total'=>0,
                'rows'=>array()
            ),
            '网关'=>array(
                'total'=>0,
                'rows'=>array()
            )
        );
	    $data_order = "equip_time";
	    $config = API("get/base/config/museum_config",array("keys"=>"data_order"));
	    if($config){
		    if(isset($config['data_order'])&&$config['data_order']){
			    $data_order = $config['data_order'];
		    }
	    }
        if(isset($networks)&&$networks){
            foreach($networks as $nt){
                $temp = array(
                    'equip_no'=>$nt['equip_no'],
                    'name'=>$nt['name'],
                    'rssi'=>''
                );
                $ds = M('data_sensor')->find(array('equip_no'=>$nt['equip_no']),'rssi,equip_no,'.$data_order,$data_order.' DESC');
                if(isset($ds['rssi']) && $ds['rssi']){
                    $rssi = abs($ds['rssi']);
                   if($rssi <= 30){
                       $temp['rssi'] = 5;
                   }else if($rssi >= 100){
                       $temp['rssi'] = 0;
                   }else{
                       $temp['rssi'] = 5 - round(($rssi - 30)/14);
                   }
                }
                $data[$nt['equip_type']]['total']++;
                $data[$nt['equip_type']]['rows'][] = $temp;
            }
        }

        $this->response($data);
    }
}
