<?php

/**
 * Created by PhpStorm.
 * User: Hebj
 * Date: 2016/11/9
 * Time: 14:31
 */
class Field extends MY_Controller
{

    public function index()
    {
        $env_no = $this->get_post('env_no');
        $times = $this->get_post('times');
        $count_time = $this->get_post('count_time');

        if (!isset($env_no) || !isset($times)) {
            $this->response(array('error' => '参数不全'));
        }

        $times = explode(',', trim($times));
        if(is_numeric($times[0])){
			$start_time = $times[0];
       		$end_time = $times[1];
        }else{
        	$start_time = strtotime($times[0] . ' 00:00:00');
        	$end_time = strtotime($times[1] . ' 23:59:59');
        }
        

        if ($start_time > $end_time) {
            $this->response(array('error' => '开始时间不能大于结束时间'));
        }

        if (empty($count_time)) {
            $count_time = 15;//统计间隔时间
        }
        $count_time = $count_time * 60;

        $env = API("get/base/envs/tree/" . $env_no);

        if (!is_array($env) || $env['env_no'] != $env_no) {
            $this->response(array('error' => '没有找到该环境', 'env' => $env));
        }
        $env_nos = array($env_no);
        if (isset($env['children'])) {
            foreach ($env['children'] as $er) {
                if (isset($er['env_no']) && $er['env_no']) {
                    $env_nos[] = $er['env_no'];
                }
            }
        }
        if (empty($env['map'])) {
            $this->response(array('error' => '无布局图'));
        }
        $img_url = $env['map'];
        if ($env['map'][0] == '/') {
            $img_url = $_SERVER['DOCUMENT_ROOT'] . $env['map'];
            if (!file_exists($img_url)) {
                $this->response(array('error' => '布局图片' . $env['map'] . '未找到'));
            }
        }

        list($width, $height) = getimagesize($img_url);

        $query = $this->db->query("SELECT * FROM equip where env_no in ('" . join("','", $env_nos) . "')");
        $equips = array();
        foreach ($query->result_array() as $row) {
            $drow = array('name' => $row['name']);
            if (empty($row['locate'])) {
                continue;
            }
            $locate = json_decode($row['locate'], true);
            $xy = explode(',', $locate['area'][0]);
            $drow['x'] = intval($width * $xy[0] / $locate['width']);
            $drow['y'] = intval($height * $xy[1] / $locate['height']);

            $equips[$row['equip_no']] = $drow;
        }

        $sql = "select equip_no,equip_time,temperature,humidity from data_sensor where equip_no in ('" . join("','", array_keys($equips)) . "') and equip_time>=" . $start_time . " and equip_time<" . $end_time . " order by equip_time asc";
// echo $sql;
        $result = $this->db->query($sql);

        if (!$result->num_rows()) {
            $this->response(array('error' => '该时间段内无数据'));
        }

        $spec_time = $start_time;

        $data_sensor = $temperatures = $humidity = array();

        while ($row = $result->unbuffered_row('array')) {
            // $data_sensor[]=$row;
            if (!isset($equips[$row['equip_no']])) {
                continue;
            }
            //$drow=$equips[$row['equip_no']];
            $row['date'] = date('Y-m-d H:i:s', $row['equip_time']);
            if ($row['equip_time'] >= $spec_time + $count_time) {
                $spec_time += $count_time;
            }

            $key = intval($spec_time);//date('Y-m-d H:i:s',$spec_time);
            if (!isset($data_sensor[$key])) {
                $data_sensor[$key] = array();
            }
            $temperature=null;
            if (!is_null($row['temperature']) && $row['temperature'] != '') {
                $temperatures[] =$temperature= $row['temperature'] * 1;
            }
            $humidity=null;
            if (!is_null($row['humidity']) && $row['humidity'] != '') {
                $humiditys[] = $humidity=$row['humidity'] * 1;
            }
            if ((!is_null($row['temperature']) && $row['temperature'] != '') || (!is_null($row['humidity']) && $row['humidity'] != '')) {
                $data_sensor[$key][$row['equip_no']] = array(!is_null($temperature)?$row['temperature'] * 1:null, !is_null($humidity)?$row['humidity'] * 1:null);
            }

        }

// echo json_encode($data_sensor);
// exit;

        if (!count($data_sensor)) {
            $this->response(array('error' => '组装数据为空'));
        }

        $result = array(
            'width' => $width,
            'height' => $height,
            'max_temperature' => max($temperatures) * 1,
            'min_temperature' => min($temperatures) * 1,
            'max_humidity' => max($humiditys) * 1,
            'min_humidity' => min($humiditys) * 1,
            'data' => $data_sensor,
            'time_data'=>array_keys($data_sensor),
            'equips' => $equips,
            'count_time' => $count_time,
        );

        $this->response($result);

    }

}