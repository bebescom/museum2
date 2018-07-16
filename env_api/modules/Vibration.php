<?php if (!defined('BASEPATH')) exit('No direct script access allowed');

class Vibration extends MY_controller{

	function index(){


	}

	public function getData($time = null)
    {
        $gtime = $this->get_post('gtime');
        if (!isset($gtime)) {
            $gtime = 600;
        }
        if ($time == null) {
            $time = time() - $gtime;
        }

        $data = array('accel' => array(), 'speed' => array(), 'displacement' => array());
        $data['time'] = time();
        $vm=M('data_sensor_vibration');

        $zd_data = $vm->fetAll("server_time>=".($time*1)." and server_time<".($data['time'] * 1)." ",
        	"server_time,accel,speed,displacement","server_time asc");

        $data['total'] = count($zd_data);

        if ($data['total'] == 0) {
            $data['time'] = $time;
        }
        $epm=M('equip_param');
        $param_list=$epm->fetAll("type='vibration'");
        $sensor_parameter=array();
        foreach ($param_list as $row) {
        	$sensor_parameter[$row['param']]=$row;
        }

        $data['accel_unit'] = isset($sensor_parameter['accel']['unit'])?$sensor_parameter['accel']['unit']:'';
        $data['speed_unit'] = isset($sensor_parameter['speed']['unit'])?$sensor_parameter['speed']['unit']:'';
        $data['displacement_unit'] = isset($sensor_parameter['displacement']['unit'])?$sensor_parameter['displacement']['unit']:'';
        $times = array();
        foreach ($zd_data as $row) {
            if (!isset($times[$row['server_time']])) {
                $times[$row['server_time']] = array();
            }
            $times[$row['server_time']][] = 1;

            $time = $row['server_time'] * 1000 + 100 * count($times[$row['server_time']]);

            $data['accel'][] = $accel = array($time, $row['accel'] * 1,$sensor_parameter['accel']['unit']);
            $data['speed'][] = $speed = array($time, $row['speed'] * 1,$sensor_parameter['speed']['unit']);
            $data['displacement'][] = $displacement = array($time, $row['displacement'] * 1,$sensor_parameter['displacement']['unit']);
        }

        echo json_encode($data);

    }

    function getHistoryData(){

    	$stime = $this->get_post('stime');
        $etime = $this->get_post('etime');

        if (empty($stime)) {
            $stime = strtotime('-1 month');//date('Y-m-d', strtotime('-1 month'));
        }
        if (empty($etime)) {
            $etime = time();//date('Y-m-d');
        }

        $data = array(
        	'accel_ranges' => array(), 
        	'accel_averages' => array(), 
        	'speed_ranges' => array(), 
        	'displacement_ranges' => array(),
        	'accel_min'=>array(),
        	'accel_max'=>array(),
        	'speed_min'=>array(),
        	'speed_max'=>array(),
        	'displacement_min'=>array(),
        	'displacement_max'=>array(),
        	);

        $epm=M('equip_param');
        $param_list=$epm->fetAll("type='vibration'");
        $sensor_parameter=array();
        foreach ($param_list as $row) {
        	$sensor_parameter[$row['param']]=$row;
        }

        $data['accel_unit'] = $sensor_parameter['accel']['unit'];
        $data['speed_unit'] = $sensor_parameter['speed']['unit'];
        $data['displacement_unit'] = $sensor_parameter['displacement']['unit'];


		$vm=M('data_sensor_vibration_count');

        $zd_data = $vm->fetAll("count_time>=".strtotime(date('Y-m-d',$stime).' 00:00:00')." and count_time<".strtotime(date('Y-m-d',$etime) . ' 23:59:59')." ",
        	"*","count_time asc");

        foreach ($zd_data as $row) {
            $time = $row['count_time'] * 1000;
            $data['accel_ranges'][] = array($time, $row['accel_min'] * 1, $row['accel_max'] * 1,$sensor_parameter['accel']['unit']);
            $data['accel_min'][] = array($time, $row['accel_min'] * 1, $sensor_parameter['accel']['unit']);
            $data['accel_max'][] = array($time, $row['accel_max'] * 1, $sensor_parameter['accel']['unit']);

            $data['speed_ranges'][] = array($time, $row['speed_min'] * 1, $row['speed_max'] * 1,$sensor_parameter['speed']['unit']);
            $data['speed_min'][] = array($time, $row['speed_min'] * 1, $sensor_parameter['speed']['unit']);
            $data['speed_max'][] = array($time, $row['speed_max'] * 1, $sensor_parameter['speed']['unit']);

            $data['displacement_ranges'][] = array($time, $row['displacement_min'] * 1, $row['displacement_max'] * 1,$sensor_parameter['displacement']['unit']);
            $data['displacement_min'][] = array($time, $row['displacement_min'] * 1, $sensor_parameter['displacement']['unit']);
             $data['displacement_max'][] = array($time, $row['displacement_max'] * 1,$sensor_parameter['displacement']['unit']);


            $data['accel_averages'][] = array($time, $row['accel_average'] * 1,$sensor_parameter['accel']['unit']);
            $data['speed_averages'][] = array($time, $row['speed_average'] * 1,$sensor_parameter['speed']['unit']);
            $data['displacement_averages'][] = array($time, $row['displacement_average'] * 1,$sensor_parameter['displacement']['unit']);
        }

        echo json_encode($data);


    }

}

