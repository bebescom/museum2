<?php 

class Equip_model extends MY_Model{

	function get_parameters($equip_type = null)
	{
        $type = array(
            'sensor' => array('温湿度监测终端','带屏温湿度监测终端','VOC监测终端','二氧化碳监测终端','光照紫外监测终端','QCM监测终端'),
            'controller'=> array('调湿机','调湿剂'),
            'weather'=>array('weather')
        );

        $e_type = 'sensor';
        foreach($type as $ty=>$v){
            if(in_array($equip_type,$v)){
                $e_type = $ty;
                continue;
            }
        }

        $parameters = $this->db->where(array('type'=>$e_type))->order_by("sort","asc")->order_by('id','asc')->get('equip_param')->result_array();

        return $parameters;
    }

	function equip_code($type,$id="")
	{
		$type_code = $this->db->where(array("type"=>$type))->get("equip_code")->row_array();
		$equip_code = equip_type('code');
		$code = isset($equip_code[$type])?$equip_code[$type]:$equip_code['其他设备'];
		if(!$type_code){
			//insert network counter
			$e_code = array();
			$e_code["type"] = $type;
			$e_code["code"] = $code;
			$e_code["num"] = 0;

			if($e_code){
				$this->db->insert("equip_code",$e_code);
			}
		}else{
			if(!$type_code['code']||$type_code['code'] != $code){
				$this->db->update("equip_code",array('code'=>$code),"id = ".$type_code['id']);
			}
		}
		$type_code = $this->db->where(array("type"=>$type))->get("equip_code")->row_array();

		if($id){
			$num = $id;
		}else{
			if(isset($type_code['num'])){
				$num=$type_code['num'];
				$num++;
			}else{
				$type_code['num'] = 1;
				$num= $type_code['num'];
			}

			//编号补零

			$num = str_pad($num,8,"0",STR_PAD_LEFT);
			$up_data['num']=$num;
			$this->db->update("equip_code",$up_data,array("type"=>$type));
		}
		$data = array();
		$data['code'] = $type_code['code'];
		$data['num'] = $num;

		return $data;
	}


	function equip_operation($operation = array())
	{
		$operation['operation_time'] = time();
		$ret = M("equip_operation")->add($operation);

		return $ret;
	}

	function get_time($time="")
	{
		if(isset($time)&&$time){
			switch($time){
				case '24h':
					$e_time = time();
					$s_time = $e_time - 24 * 3600;
					break;
				case 'today':
					$s_time = strtotime('today');
					$e_time = time();
					break;
				case 'yesterday':
					$s_time = strtotime('yesterday');
					$e_time = $s_time + 24*3600;
					break;
				case 'week':
					$today = date("Y-m-d");
					$week = date('w',strtotime($today));
					$s_time = strtotime($today ."-".($week ? $week - 1 : 6).' days');
					$e_time = time();
					break;
				case 'month':
					$e_time = time();
					$s_time = mktime(0,0,0,date("m"),1,date("Y"));
					break;
				default:
					$time_array = explode(',',$time);
					$s_time = $time_array[0];
					$e_time = $time_array[1];
					break;
			}
		}else{
			$e_time = time();
			$s_time = $e_time - 24 * 3600;
		}

		return array("s_time"=>$s_time,"e_time"=>$e_time);
	}


	function equip_record($equip_no,$need=null,$page=1,$limit=10)
	{
		$offset = ($page - 1)*$limit;
		$sub_limit = "";
		$alert_where = " WHERE equip_no = '{$equip_no}' ";
		$opt_where = " WHERE equip_no = '{$equip_no}' ";
		if($need){
			$sub_limit = "LIMIT 0,{$need}";
			$time = time() - 7 * 24 * 3600;
			$alert_where .= " and alert_time >".$time." ";
			$opt_where .= " and operation_time >".$time." and operator != '后台系统'";
			$limit = $need;
		}

		$sql = "SELECT * FROM (
                    SELECT * FROM (SELECT *,null as operator FROM `equip_alert` {$alert_where} ORDER BY alert_time DESC {$sub_limit}) e_alert
                    UNION ALL
                    SELECT * FROM
                    (SELECT id,equip_no,null as name,operation as type,null as env_no,operation_time as alert_time,
                        null as alert_cout ,remark as alert_remark,null as clear_time,null as clear_remark,operator  FROM equip_operation
                        {$opt_where} ORDER BY operation_time desc {$sub_limit}) e_opt )
                union_table ORDER BY union_table.alert_time desc  LIMIT {$offset},{$limit}";

		$equip_records = $this->db->query($sql)->result_array();

		return array_reverse($equip_records);
	}

}
