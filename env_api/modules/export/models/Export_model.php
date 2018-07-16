<?php
/**
 * Created by PhpStorm.
 * User: HBJ_PC
 * Date: 16-9-27
 * Time: 下午2:51
 */

class Export_model extends MY_Model{

	/**
	 * 读取字段
	 */
	public function getFields($dbtable){
		$xml = simplexml_load_file('application/config/dbtable.xml');
		$fields = array();  //字段
		$fname = "default"; //文件名
		foreach($xml->tablename as $tablename){
			$en = (array)$tablename->attributes()->en;
			$chn = (array)$tablename->attributes()->chn;
			if($en[0] != $dbtable) continue;    //判断对应数据表

			$fchnname = $chn[0]?$chn[0]:$dbtable;
			$fename = $dbtable;
			foreach ($tablename->field as $f) {
				$en = (array)$f->attributes()->en;
				$chn = (array)$f->attributes()->chn;
				$fields[$en[0]] = $chn[0]?$chn[0]:$en[0];
			}
			break;
		}
		return array('fields'=>$fields,'fename'=>$fename,'fchnname'=>$fchnname);
	}
} 