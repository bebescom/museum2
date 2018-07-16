<?php
class Equipment extends MY_Controller
{
    public function __construct()
    {
        parent::__construct();
        $this->load->Library("excel");

        $sensor_param = M("equipments/equip")->get_parameters('sensor');
        $this->param = array();
        if ($sensor_param) {
            foreach ($sensor_param as $sp) {
                if (isset($sp['param']) && $sp['param']) {
                    $this->param[$sp['param']] = array("name" => $sp['name'], "unit" => $sp['unit']);
                }
            }
        }

        $this->order_time = "equip_time";

        $this->fileds = array("equip_no", "env_no", "humidity", "temperature", "voc", "co2", "uv", "light", "organic", "inorganic", "sulfur", "dip",
            "acceleration", "canbi", "voltage", "rssi", "move_alert", "box_open_alert", "box_status", "wind_speed", "wind_direction", "rain", "air_presure",
            "pm10", "pm25", "equip_time", "server_time", "ip_port", "php_time", "alert_param", "status", "soil_humidity", "soil_temperature", "soil_conductivity",
            "broken", "vibration", "multi_wave", "cascophen");

    }

    /**
     * export the equipment information
     * 导出设备信息
     */
    public function equip_list_get_nologin()
    {
        $parameter = $this->param;
        $fieldsxml = M("export")->getFields("equipment");
        $fields = $fieldsxml['fields'];
        $select = "*";
        if ($fields) {
            $s_fields = $fields;
            unset($s_fields["first"]);
            unset($s_fields["second"]);
            unset($s_fields["third"]);
            $select = implode(",", array_keys($s_fields));
        }
        //获取查询条件
        $status = $this->get_post("status");
        $env_no = $this->get_post("env_no");
        $equip_nos = $this->get_post("equip_no");
        $equip_type = $this->get_post("equip_type");
        $name = $this->get_post("name");
        $title = $this->get_post("title");

        //环境信息
        $envs = API("get/base/envs");

        $where = "1=1";
        if (isset($name) && $name) {
            $where .= " and name like '%" . $name . "%'";
        }

        if (isset($equip_nos) && $equip_nos) {
            $where .= " and equip_no in ('" . implode("','", explode(",", $equip_nos)) . "')";
        }

        if (isset($equip_type) && $equip_type) {
            $where .= " and equip_type in ('" . implode("','", explode(",", $equip_type)) . "')";
        }

        if (isset($status) && $status) {
            $where .= " and status in ('" . implode("','", explode(",", $status)) . "')";
        }

        if (isset($env_no) && $env_no) {
            $env_nos = M("box/box")->all_children($env_no);
            $where .= " and env_no in ('" . implode("','", $env_nos) . "')";
        }

        if (isset($id) && $id) {
            $where .= " and (equip_no like '%" . $id . "%' or name like '%" . $id . "%')";
        }

        $equips = M("equip")->fetAll($where, $select, "env_no desc");
        $navs = array();
        if ($equips) {
            foreach ($equips as $key => $equip) {
                unset($equip[$key]["id"]);
                if (isset($equip['env_no']) && $equip['env_no']) {
                    $nav_name = array();
                    if (!isset($navs[$equip['env_no']])) {
                        $nav = M('common/common')->navigation($envs['rows'],$equip['env_no']);
                        if (isset($nav) && $nav) {
                            foreach ($nav as $nr) {
                                $nav_name[] = $nr['name'];
                            }
                        }
                        $navs[$equip['env_no']] = implode(">>", $nav_name);
                    }
                    if (isset($navs[$equip['env_no']])) {
                        $equips[$key]['env_no'] = $navs[$equip['env_no']];
                    }
                }

                if (isset($equip['parameter_val']) && $equip['parameter_val']) {
                    $temp_data = json_decode($equip['parameter_val']);
                    $new_data = array();
                    foreach($temp_data as $temp_param=>$temp_val){
                        if(isset($this->param[$temp_param])&&$this->param[$temp_param]){
                            $param_name = $this->param[$temp_param]['name'];
                            $param_unit = $this->param[$temp_param]['unit'];
                            $new_data[] = $param_name.":".$temp_val." {$param_unit}";
                        }
                    }
                    $equips[$key]['parameter_val'] = implode(',',$new_data);
                }
                if (isset($equip['name']) && $equip['name']) {
                    $equips[$key]['name'] = $equip['name'] . "\t";
                }
                if (isset($equip['equip_no']) && $equip['equip_no']) {
                    $equips[$key]['equip_no'] = $equip['equip_no'] . "\t";
                }
                if (isset($equip['last_equip_time']) && $equip['last_equip_time']) {
                    $equips[$key]['last_equip_time'] = date("Y-m-d H:i",$equip['last_equip_time']);
                }
                $equip_records = M('equipments/equip')->equip_record($equip['equip_no'],3);
                if($equip_records){
                    $num = 1;
                    $num_key = array(
                        '1'=>'first',
                        '2'=>'second',
                        '3'=>'third',
                    );
                    foreach ($equip_records as $equip_record) {
                        if(isset($equip_record['type'])&&$equip_record['type'] == '参数下发'){
                            if(isset($equip_record['alert_remark'])&&$equip_record['alert_remark']){
                                $str_split = explode(':',$equip_record['alert_remark']);
                                if(isset($str_split[0])&&$str_split[0]){
                                    $equip_record['type'] = $str_split[0];
                                }
                            }
                        }
                        $equips[$key][$num_key[$num]] = $equip_record['type'];
                        $num++;
                    }
                }
            }
        }
        $fname = $fieldsxml['fename'];
        $fchnname = $fieldsxml['fchnname'];
        if (!isset($title) || !$title) {
            $title = $fchnname . '_' . date("Ymd");
        }
        $column_size = array();
        try {
            $column_size['parameter_val'] = '100';
            $column_size['equip_no'] = '50';
            $column_size['env_no'] = '60';
            $url = $this->excel->download2007($title, $fields, $equips, "", $column_size);
            $download = API('get/base/download/', array("url" => $url, "from" => "env"));
            $this->response($download);
        } catch (Exception $e) {
            $this->response($e);
        }

    }


    /**
     * 导出多设备设备监测数据
     */
    public function equip_data_post_nologin()
    {
        // 参数
        if (!M("common/permission")->check_permission("导出设备数据", $this->_user)) {
            $this->response(array('error' => '无权限导出设备数据'));
        }
        $equip_no = explode(',', $this->get_post("equip_no"));
        $time = $this->get_post("time");
        $deal_time = $this->deal_time($time);
        $stime = $deal_time['s_time'];
        $etime = $deal_time['e_time'];

        $strtime = date('Y-m-d', $stime) . '--' . date('Y-m-d', $etime);

        $path = "downloads/" . $this->_user['id'] . "/";
        if (!file_exists($path)) {
            mkdir($path, 0777, TRUE);
        }

        // 字段配置
        $fields = array();
        $post_fields = explode(',', $this->get_post("param"));
        // 查询字段
        $list_fields = $this->db->list_fields('data_sensor');

        $select = array_intersect($post_fields, $list_fields);
        // excel字段
        $parameter = $this->db->where("type", "sensor")->get("equip_param")->result_array();
        foreach ($parameter as $p => $v) {
            $fields[$v['param']] = $v['name'] . "(" . $v['unit'] . ")";
        }
        $fields = array_merge(array(
            'equip_time' => '数据采集时间',
            'server_time' => '数据传输时间',
            'status' => '设备状态',
            'equip_position' => '设备位置',
            'voltage' => '设备电压'
        ), $fields);
        foreach ($fields as $k => $v) { // 过滤
            if (!in_array($k, $post_fields)) {
                unset($fields[$k]);
            }
        }

        $fill = array_combine(array_keys($fields), array_fill(0, sizeof($fields), '-'));

        // 设备
        $equipments = $this->db->where_in('equip_no', $equip_no)->get("equip")->result_array();

        //所有环境
        $envs = API("get/base/envs");

        // 设备遍历
        $url = array();
        $navs = array();
        foreach ($equipments as $equip) {
            $this->db->select($select);
            $this->db->where("equip_time >", $stime);
            $this->db->where("equip_time <=", $etime);
            $this->db->order_by("equip_time ASC");
            $this->db->where("equip_no", $equip['equip_no']);
            $data = $this->db->get("data_sensor")->result_array();
            // 设备位置
            if(isset($equip['env_no'])&&$equip['env_no']){
                if(!isset($navs[$equip['env_no']])){
                    $nav = M('common/common')->navigation($envs['rows'],$equip['env_no']);
                    $navs[$equip['env_no']] = $nav;
                }
            }

            // 数据处理
            $step = $equip['sleep'];
            $fill_data = array();
            foreach ($data as $k => $d) {
                $dot = $d['equip_time']; // 以时间为键，防止重复
                if (isset($data[$k + 1])) {
                    $dot1 = $data[$k + 1]['equip_time'];
                    $dt = $dot1 - $dot;
                    if ($dt > $step * 1.1) { // 允许偏差10%
                        for ($i = $dot; $i < $dot1; $i += $step) {
                            $fill['equip_time'] = date('Y-m-d H:i', $i);
                            $fill_data[$i] = $fill;
                        }
                    }
                }
                $d['equip_time'] = date('Y-m-d H:i', $dot);   // 数据采集时间
                if (in_array('server_time', $post_fields)) {  // 数据上传时间
                    $d['server_time'] = date('Y-m-d H:i', $d['server_time']);
                }

                if (in_array('equip_position', $post_fields)) {  // 设备位置
                    if(isset($navs[$equip['env_no']])&&$navs[$equip['env_no']]){
                        $d['equip_position'] = implode(' 》 ', array_column($navs[$equip['env_no']], "name"));
                    }
                }
                $fill_data[$dot] = $d;
            }

            // 时间排序
            ksort($fill_data);

            // 文件名称
            $envpath = array();
            if (isset($navs[$equip['env_no']]) && is_array($navs[$equip['env_no']])) {
                foreach (array_slice($navs[$equip['env_no']], -2, 2) as $env) {
                    array_push($envpath, $env['name']);
                }
            }
            $envpath = implode('-', $envpath);
            $envpath = str_replace("/","-",$envpath);
            $filename = $this->_user['id'] . "/{$envpath}_{$equip['equip_type']}_{$equip['equip_no']}_{$strtime}";
            $u = $this->excel->download2007($filename, $fields, array_values($fill_data));
            if (strpos(PHP_OS, "WIN") !== false) {
                $u = mb_convert_encoding($u, "GBK", "UTF-8");
            }
            array_push($url, $u);
        }
        // 打包压缩
        $zipname = $this->get_post("file_name");
        if (empty($zipname)) {
            $zipname = count($equipments) . "设备_{$strtime}";
        }
        $file = $path . $zipname . ".zip";
        if (strpos(PHP_OS, "WIN") !== false) {
            $file = mb_convert_encoding($file, "GBK", "UTF-8");
        }
        $file = judgeRename($file);  // 重名判断
        $zip = new ZipArchive;
        if ($zip->open($file, ZipArchive::CREATE) === TRUE) {
            foreach ($url as $u) {
                $us = explode("/", $u);
                $add_file = array_pop($us);
//                print_r(mb_check_encoding($add_file));
                if (mb_check_encoding($add_file,'UTF-8')) {
                    $add_file = mb_convert_encoding($add_file, 'GBK', 'UTF-8');
                }
                $t = $zip->addFile($u, $add_file);
            }
            $zip->close();
        }

        if (strpos(PHP_OS, "WIN") !== false) {
            $file = mb_convert_encoding($file, "UTF-8", "GBK");
        }
        $download = API('get/base/download/', array("url" => $file, "from" => "env"));
        // 删除文件
        foreach ($url as $u) {
            @unlink($u);
        }
        $this->response($download);
    }

    public function data_table_get_nologin()
    {
        $env_no = $this->get_post("env_no");
        $equip_no = $this->get_post("equip_no");
        $time = $this->get_post("time");
        $title = $this->get_post("title");

        $fieldsxml = M("export")->getFields("data_table");
        $fields = $fieldsxml['fields'];
        $fname = $fieldsxml['fename'];
        $fchnname = $fieldsxml['fchnname'];
        $select = "*";
        if ($fields) {
            $s_fields = $fields;
            unset($s_fields['env_name']);
            $select = implode(",", array_keys($s_fields));
        }

        $deal_time = $this->deal_time($time);
        $s_time = $deal_time['s_time'];
        $e_time = $deal_time['e_time'];

        $filename = "";

        $data = array();
        $where = "1=1";
        if (isset($env_no) && $env_no) {
            $env_nos = explode(",", $env_no);
            $where .= " and env_no in ('" . implode("','", $env_nos) . "')";
            $env_info = API("get/base/envs/info/" . $env_no);
            if ($env_info) {
                if (isset($env_info['name']) && $env_info['name']) {
                    $filename = $env_info['name'];
                }
            }
        }
        if (isset($equip_no) && $equip_no) {
            $equip_nos = explode(",", $equip_no);
            $where .= " and equip_no in ('" . implode("','", $equip_nos) . "')";
            if (!$filename) {
                $filename = $equip_no;
            }
        }

        $where .= " and " . $this->order_time . " between " . $s_time . " and " . $e_time;
        $count = M("data_sensor")->count($where);

        $data_sensor = M("data_sensor")->fetAll($where, $select, $this->order_time . " asc");
        $navs = array();
        if ($data_sensor) {
            foreach ($data_sensor as $ds) {
                if (isset($ds['equip_no']) && $ds['equip_no']) {
                    $ds['equip_no'] = $ds['equip_no'] . "\t";
                }

                $ds['env_name'] = "";
                if (isset($ds['env_no']) && $ds['env_no']) {
                    $nav_name = array();
                    if (!isset($navs[$ds['env_no']])) {
                        $nav = API('get/base/envs/navigation/' . $ds['env_no'] . '');
                        if (isset($nav['rows']) && $nav['rows']) {
                            foreach ($nav['rows'] as $nr) {
                                $nav_name[] = $nr['name'];
                            }
                        }
                        $navs[$ds['env_no']] = implode(">>", $nav_name);
                    }

                    if (isset($navs[$ds['env_no']])) {
                        $ds['env_name'] = $navs[$ds['env_no']];
                    }
                    $ds['env_no'] .= "\t";
                }

                if (isset($ds['equip_time']) && $ds['equip_time']) {
                    $ds['equip_time'] = date("Y-m-d H:i", $ds['equip_time']);
                }

                if (isset($ds['server_time']) && $ds['server_time']) {
                    $ds['server_time'] = date("Y-m-d H:i", $ds['server_time']);
                }

                $data[] = $ds;
            }
        }
        if (!isset($title) || !$title) {
            $title = $filename . '_' . date("Ymd");
        }
        try {
            $url = $this->excel->download2007($title, $fields, $data);
            $download = API('get/base/download/',  array("url" => $url, "from" => "env"));
            $this->response($download);
        } catch (Exception $e) {
            $this->response($e);
        }
    }


    public function deal_time($time)
    {
        if (isset($time) && $time) {
            switch ($time) {
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
                    $e_time = $s_time + 24 * 3600;
                    break;
                case 'week':
                    $today = date("Y-m-d");
                    $week = date('w', strtotime($today));
                    $s_time = strtotime($today . "-" . ($week ? $week - 1 : 6) . ' days');
                    $e_time = time();
                    break;
                case 'month':
                    $e_time = time();
                    $s_time = mktime(0, 0, 0, date("m"), 1, date("Y"));
                    break;
                default:
                    $time_array = explode(',', $time);
                    $s_time = $time_array[0];
                    $e_time = $time_array[1];
                    break;
            }
        } else {
            $e_time = time();
            $s_time = $e_time - 24 * 3600;
        }

        return array('s_time' => $s_time, 'e_time' => $e_time);
    }
}


