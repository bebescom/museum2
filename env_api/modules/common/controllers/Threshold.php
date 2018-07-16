<?php
/**
 * Created by PhpStorm.
 * User: HBJ_PC
 * Date: 16-9-12
 * Time: 上午10:06
 */

class Threshold extends MY_Controller{
	public function __construct(){
		parent::__construct();

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

	//获取对象阈值
	public function index_get($nos,$type=null)
    {
        $index = $this->get_post("index");
		$data = array(
            'index'=>$index
        );

        $thres_params = array('temperature','humidity','voc','co2','light','uv','organic','inorganic','sulfur','soil_temperature','soil_humidity','soil_salt','soil_conductivity');
        if($nos){
            $name = array();
            if($type == "env"){
                $envs = API('get/base/envs');
                //重命名--重名环境
                $env_info = M('common/env')->rename_repeat_env($envs['rows'],$nos);
            }

            $nos = explode(",",$nos);
            if(isset($env_info)&&$env_info){
                foreach($env_info as $env_no=>$env){
                    if(in_array($env_no,$nos)){
                        $name[$env_no] = $env['name'];
                    }
                }
            }
            foreach ($nos as $no) {
                $temp = array(
                    "no"=> $no,
                    "type"=> $type,
                    "name"=>  isset($name[$no])?$name[$no]:"",
                    "temperature"=> array(
                        "min"=> "",
                        "max"=> "",
                        "name"=> "温度",
                        "unit"=> "℃"
                    ),
                    "soil_temperature"=> array(
                        "min"=> "",
                        "max"=> "",
                        "name"=> "温度",
                        "unit"=> "℃"
                    ),
                    "temperature_range"=> array(
                        "max"=> "",
                        "name"=> "温度日波动",
                        "unit"=> "℃"
                    ),
                    "humidity"=> array(
                        "min"=>"",
                        "max"=> "",
                        "name"=> "相对湿度",
                        "unit"=> "%"
                    ),
                    "soil_humidity"=> array(
                        "min"=>"",
                        "max"=> "",
                        "name"=> "相对湿度",
                        "unit"=> "%"
                    ),
                    "soil_salt"=> array(
                        "min"=>"",
                        "max"=> "",
                        "name"=> "相对湿度",
                        "unit"=> "%"
                    ),
                    "humidity_range"=> array(
                        "max"=> "",
                        "name"=> "相对湿度日波动",
                        "unit"=> "%"
                    ),
                    "voc"=> array(
                        "max"=> "",
                        "name"=> "有机挥发物",
                        "unit"=> "ppb"
                    ),
                    "co2"=> array(
                        "max"=> "",
                        "name"=> "二氧化碳",
                        "unit"=> "ppm"
                    ),
                    "light"=> array(
                        "max"=> "",
                        "name"=> "光照",
                        "unit"=> "lx"
                    ),
                    "total_light"=> array(
                        "max"=> "",
                        "name"=> "累积照度",
                        "unit"=> "lx"
                    ),
                    "uv"=> array(
                        "max"=> "",
                        "name"=> "紫外",
                        "unit"=> "μw/cm²"
                    ),
                    "organic"=> array(
                        "max"=> "",
                        "name"=> "有机污染物",
                        "unit"=> "Hz"
                    ),
                    "inorganic"=> array(
                        "max"=> "",
                        "name"=> "无机污染物",
                        "unit"=> "Hz"
                    ),
                    "sulfur"=> array(
                        "max"=> "",
                        "name"=> "硫化污染物",
                        "unit"=> "Hz"
                    ),
                    "qcm_organic"=> array(
                        "max"=> "",
                        "name"=> "有机污染物30天累计当量",
                        "unit"=> "mg/m²"
                    ),
                    "qcm_inorganic"=> array(
                        "max"=> "",
                        "name"=> "无机污染物30天累计当量",
                        "unit"=> "mg/m²"
                    ),
                    "qcm_sulfur"=> array(
                        "max"=> "",
                        "name"=> "硫化污染物30天累计当量",
                        "unit"=> "mg/m²"
                    ),
                    "lock"=> "0"
                );
                if(isset($this->_user['data_scope'])&&$this->_user['data_scope']) {
                    $threshold = M("threshold")->find("no = '".$no."'");
                    if(!$threshold){
                        if($type){
                            if($type == "env"){//环境阈值,不存在时取其存放文物的阈值的交集
                                $relics = API("get/relic/relics/manage/relic_list",array("parent_env_no"=>$no));
                                if(isset($relics['rows'])&&$relics['rows']){
                                    $relic_nos = array();
                                    $relic_material = array();
                                    foreach ($relics['rows'] as $r){
                                        if(isset($r['relic_no'])&&$r['relic_no']){
                                            $relic_nos[] = $r['relic_no'];
                                            if(isset($r['material'])&&$r['material']){
                                                $relic_material[$r['relic_no']] = $r['material'];
                                            }
                                        }
                                    }
                                    if($relic_nos){
                                        $relic_thresholds = M("threshold")->fetAll("no in ('".implode("','",$relic_nos)."')");
                                        $thresholds = array();
                                        if($relic_thresholds){
                                            foreach($relic_thresholds as $relic_threshold){
                                                if(isset($relic_threshold['no'])&&$relic_threshold['no']){
                                                    $thresholds[$relic_threshold['no']] = $relic_threshold;
                                                }
                                            }
                                        }
                                        foreach ($relic_nos as $relic_no) {
                                            if(!isset($thresholds[$relic_no])){
                                                $relic_threshold = API("get/relic/common/relic_threshold",array("type"=>$relic_material[$relic_no]));
                                                if(!$relic_threshold['rows']){
                                                    $relic_threshold = API("get/relic/common/relic_threshold",array("type"=>"其他"));
                                                }
                                                if(isset($relic_threshold['rows'])&&$relic_threshold['rows']&&isset($relic_threshold['rows'][0])){
                                                    $thresholds[$relic_no] = $relic_threshold['rows'][0];
                                                }
                                            }
                                        }
                                        if($thresholds){
                                            $intersection = $this->intersection($thresholds);
                                            $intersection['no'] = $no;
                                            $intersection['lock'] = 1;
                                            $intersection['type'] = "env";
                                            M("threshold")->add($intersection);
                                        }
                                    }
                                }
                            }else{//文物阈值，不存在时根据文物材质设置阈值
                                $relic = API("get/relic/relics/manage/detail/".$no);
                                if(isset($relic['relic_no'])&&$relic['relic_no']){
                                    $name[$relic['relic_no']] = isset($relic['name'])?$relic['name']:"";
                                }
                                if(isset($relic['material'])&&$relic['material']){
                                    $relic_threshold = API("get/relic/common/relic_threshold",array("type"=>$relic['material']));
                                    if(!$relic_threshold['rows']){
                                        $relic_threshold = API("get/relic/common/relic_threshold",array("type"=>"其他"));
                                    }
                                    if(isset($relic_threshold['rows'])&&$relic_threshold['rows']){
                                        $up_threshold = $relic_threshold['rows'][0];
                                        unset($up_threshold['id']);
                                        $up_threshold['no'] = $no;
                                        $up_threshold['lock'] = 1;
                                        M("threshold")->add($up_threshold);
                                    }
                                }
                            }
                        }
                        $threshold = M("threshold")->find("no = '".$no."'");
                    }

                    $temp['no'] = isset($threshold['no'])?$threshold['no']:$no;
                    $temp['type'] =  isset($threshold['type'])?$threshold['type']:$type;
                    $temp['name'] = isset($name[$no])?$name[$no]:"";
                    if($this->param){
                        foreach($this->param as $p=>$un){
                            if(in_array($p,$thres_params)){
                                if($p == "temperature" || $p == "humidity"){
                                    $temp[$p] = array();
                                    $temp[$p]['min'] = isset($threshold[$p."_min"])?round($threshold[$p."_min"],2):'';
                                    $temp[$p]['max'] = isset($threshold[$p."_max"])?round($threshold[$p."_max"],2):'';
                                    $temp[$p] = array_merge($temp[$p],$un);
                                    $temp[$p.'_range'] = array(
                                        'max'=>"",
                                        'name'=>isset($un['name'])?$un['name']."日波动":"",
                                        "unit"=>isset($un['unit'])?$un['unit']:""
                                    );
                                    if(isset($threshold[$p.'_range'])){
                                        $temp[$p.'_range']['max'] = round($threshold[$p.'_range'],2);
                                    }
                                }else if($p == "soil_temperature"|| $p == "soil_humidity"){
                                    $temp[$p] = array();
                                    $temp[$p]['min'] = isset($threshold[$p."_min"])?round($threshold[$p."_min"],2):'';
                                    $temp[$p]['max'] = isset($threshold[$p."_max"])?round($threshold[$p."_max"],2):'';
                                    $temp[$p] = array_merge($temp[$p],$un);
                                }else{
                                    $temp[$p] = array();
                                    $temp[$p]['max'] = isset($threshold[$p."_max"])?round($threshold[$p."_max"],2):'';
                                    $temp[$p] = array_merge($temp[$p],$un);
                                    if($p == "light"){
                                        $temp['total_light'] = array(
                                            'max'=>"",
                                            'name'=>"累积照度",
                                            "unit"=>isset($un['unit'])?$un['unit']:""
                                        );
                                        if(isset($threshold['total_light'])){
                                            $temp['total_light']['max'] = round($threshold['total_light'],2);
                                        }
                                    }
                                    if(isset($threshold["qcm_".$p."_max"])){
                                        $temp["qcm_".$p]['max'] = $threshold["qcm_".$p."_max"];
                                    }
                                }
                            }
                        }
                        $temp['lock'] = isset($threshold['lock'])?$threshold['lock']:0;
                    }
                }
                
                $data[$no] = $temp;
            }
        }

		$this->response($data);
	}

    public function lock_post($no,$lock){
       if( M("threshold")->update(array('lock'=>$lock),"no = '".$no."'")){
           $this->response(array("result"=>true));
       }
        $this->response(array("result"=>false));
    }

	public function add_edit_post(){

		$threshold = $this->get_post();

		$result = array();
		$where = "1=1";
		if(isset($threshold['no'])&&$threshold['no']){
			$where .= " and no = '".$threshold['no']."'";
			if(isset($threshold['type'])&&$threshold['type']){
				$where .= " and type = '".$threshold['type']."'";
                if($threshold['type'] != 'env'){
                    if(!M("common/permission")->check_permission("设定阈值",$this->_user)){
                        $this->response(array('error' => '无权限设定文物阈值'));
                    }
                    $relic = API("get/relic/relics/relic_one/".$threshold['no']);
                }else{
                    if(!M("common/permission")->check_permission("修改阈值",$this->_user)){
                        $this->response(array('error' => '无权限修改环境阈值'));
                    }
                }
			}

			$thres = M("threshold")->fetOne($where);
			if($thres){
                if(isset($thres['lock'])&&$thres['lock']){
                    $result = array("result"=>false,"msg"=>"阈值已锁定，无法更改");
                    $this->response($result);
                }else{
                    $ret = M("threshold")->update($threshold,$where);
                }
			}else{
				$ret = M("threshold")->add($threshold);
			}
            //文物阈值变动，更改其环境的阈值
            if(isset($relic)&&$relic){
                if(isset($relic['parent_env_no'])&&$relic['parent_env_no']){
                    $relics = API('get/relic/relics',array('parent_env_no'=>$relic['parent_env_no'],"include_child"=>1));
                    $relic_nos = array();
                    if(isset($relics['rows'])&&$relics['rows']){
                        foreach ($relics['rows'] as $relic) {
                            if(isset($relic['relic_no'])&&$relic['relic_no']){
                                $relic_nos[] = $relic['relic_no'];
                            }
                        }
                    }
                    if($relic_nos){
                        $relic_thresholds = M("threshold")->fetAll(" no in ('".implode("','",$relic_nos)."')");
                        $inter_threshold = $this->intersection($relic_thresholds);
                        $inter_threshold['no'] = $relic['parent_env_no'];
                        $inter_threshold['type'] = "env";
                        $env_threshold =  M("threshold")->fetOne("no = '".$relic['parent_env_no']."'");
                        if($env_threshold){
                            if(isset($env_threshold['lock'])&&!$env_threshold['lock']){
                                M("threshold")->update($inter_threshold,"no = '".$relic['parent_env_no']."'");
                            }
                        }else{
                            M("threshold")->add($inter_threshold);
                        }
                    }
                }
            }
			if($ret){
				$result = array("result"=>true,"msg"=>"阈值编辑成功");
			}else{
				$result = array("result"=>false,"msg"=>"阈值编辑失败");
			}
		}else{
			$result = array("result"=>false,"msg"=>"对象编号为空");
		}

		$this->response($result);
	}

	public function delete_post($no,$type){
        if(!M("common/permission")->check_permission("清除阈值",$this->_user)){
            $this->response(array('error' => '无权限清除阈值'));
        }
		$where = "no = '".$no."' and type = '".$type."'";
		$thres = M("threshold")->fetOne($where);
		if(!$thres){
			$result = array("result"=>false,"msg"=>"阈值不存在");
			$this->response($result);
		}
		$ret = M("threshold")->delete($where);
		if($ret){
			$result = array("result"=>true,"msg"=>"阈值删除成功");
		}else{
			$result = array("result"=>false,"msg"=>"阈值删除失败");
		}

		$this->response($result);
	}


	public function intersection($arrays = array()){
	    $intersection = array();
	    if($arrays){
	        $merge = array();
	        foreach ($arrays as $key=>$array){
                foreach ($array as $k=>$v){
                    if(!isset($merge[$k])){
                        $merge[$k] = array();
                    }
                    $merge[$k][] = $v;
                }
            }

            if($merge){
                unset($merge['id']);
                unset($merge['type']);
                unset($merge['no']);


                foreach ($merge as $param=>$vs){
                    $params = explode('_',$param);
                    if(isset($params[0])&&$params[0]){
                        $p = $params[0];
                        if($p == "temperature"||$p == "humidity"){
                            if(isset($merge[$p."_min"])&&$merge[$p."_min"]){
                                $intersection[$p."_min"] = max($merge[$p."_min"]);
                            }
                            if(isset($merge[$p."_max"])&&$merge[$p."_max"]){
                                $intersection[$p."_max"] = min($merge[$p."_max"]);
                            }
                        }else{
                            if(isset($merge[$p."_max"])&&$merge[$p."_max"]){
                                $intersection[$p."_max"] = min($merge[$p."_max"]);
                            }
                        }
                    }

                }
            }
        }
        return $intersection;
    }
}
