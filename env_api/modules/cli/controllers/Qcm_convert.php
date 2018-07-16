<?php

/**
 * Created by PhpStorm.
 * User: Hebj
 * Date: 2018/4/24
 * Time: 13:45
 */
class Qcm_convert extends MY_Controller
{
    public function index($deal_before=false)
    {
        $qcm_equips = M('equip')->fetAll("equip_type ='空气质量监测终端'","equip_no,env_no,sleep");
        if(empty($qcm_equips)){
            $this->response(array('error'=>"无空气质量传感器"));
        }
        $select = "equip_no,env_no,equip_time,organic,inorganic,sulfur";
        $params = array("organic","inorganic","sulfur");
        $datas = array();

        foreach ($qcm_equips as $qcm_equip) {
            $convert_datas = array();
            if(isset($qcm_equip['equip_no'])&&$qcm_equip['equip_no']){
                $equip_no = $qcm_equip['equip_no'];
                //第一个数据
                if($deal_before){
                    $first_data = M('data_sensor')->fetOne("equip_no = '{$equip_no}' and equip_time > 0",$select,"equip_time asc");
                }else{
                    $stime = strtotime('today');
                    $today = date("Y-m-d");
                    if(time() > strtotime($today." 12:00")){
                        $stime = strtotime($today." 12:00");
                    }
                    $first_data = M('data_sensor')->fetOne("equip_no = '{$equip_no}' and equip_time > ".strtotime('today'),$select,"equip_time asc");
                }
                if(isset($first_data['equip_time'])&&$first_data['equip_time']){
                    $first_time = $first_data['equip_time'];//起始时间
                    $date = date("Y-m-d",$first_time);
                    $new_date_time = strtotime($date);

                    while($new_date_time < strtotime('now')){
                        $new_date = date("Y-m-d",$new_date_time);
                        if($first_data){
//                            $datas[] = $first_data;
                            $new_date = date("Y-m-d",$new_date_time);
                            $middle_time = strtotime($new_date." 12:00");
                            $convert_data = array(
                                'equip_no'=>$equip_no,
                                'equip_time'=>$first_data['equip_time'],
                                'env_no'=>''
                            );
                            $where = "equip_no = '{$equip_no}'";
                            if(isset($first_data['env_no'])&&$first_data['env_no']){
                                $where .= " and env_no = '{$first_data['env_no']}'";
                                $convert_data['env_no'] = $first_data['env_no'];
                            }
                            $where .= " and equip_time >= ".strtotime($new_date.'-30 days');
                            $before_data = M('data_sensor')->fetOne($where,$select,"equip_time asc");

                            //计算时间差
                            if(isset($before_data['equip_time'])&&$before_data['equip_time']){
                                $diff_time = $first_data['equip_time'] - $before_data['equip_time'];
                                $diff_minutes = $diff_time/60;
                                $diff_days = $diff_time/(24*3600);

                                foreach ($params as $param) {
                                    if(isset($first_data[$param])&&$first_data[$param]&&isset($before_data[$param])&&$before_data[$param]){
                                        $diff_param = $before_data[$param] - $first_data[$param];
                                        if($diff_param < 0){
                                            $diff_param = 0;
                                        }
                                        if($diff_time == 0){
                                            $convert_val = 0;
                                            $convert_data[$param] = $convert_val;
                                        }else{
                                            $convert_val = 2359.88*$diff_param/$diff_minutes;
                                            $convert_data[$param] = round($convert_val,2);
                                        }
                                    }
                                }
                                $convert_datas[] = $convert_data;
                            }
                            //第二个点
                            if($first_time < $middle_time){
                                $second_where = "equip_no = '{$equip_no}' and equip_time >= {$middle_time} and equip_time <".strtotime($new_date." +1 days");
                                $second_data = M('data_sensor')->fetOne($second_where,$select,"equip_time asc");
                                if($second_data){
                                    $convert_data = array(
                                        'equip_no'=>$equip_no,
                                        'equip_time'=>$second_data['equip_time'],
                                        'env_no'=>''
                                    );
//                                    $datas[] = $second_data;
                                    $second_where_before =  "equip_no = '{$equip_no}'";
                                    if(isset($second_data['env_no'])&&$second_data['env_no']){
                                        $second_where_before .= " and env_no = '{$second_data['env_no']}'";
                                        $convert_data['env_no'] = $second_data['env_no'];
                                    }

                                    $second_where_before .= "and equip_time >= ".strtotime($new_date.'12:00 -30 days');
                                    $second_data_before = M('data_sensor')->fetOne($second_where_before,$select,"equip_time asc");
                                    //计算时间差
                                    if(isset($second_data_before['equip_time'])&&$second_data_before['equip_time']){
                                        $diff_time = $second_data['equip_time'] - $second_data_before['equip_time'];
                                        $diff_minutes = $diff_time/60;
                                        $diff_days = $diff_time/(24*3600);

                                        foreach ($params as $param) {
                                            if(isset($second_data[$param])&&$second_data[$param]&&isset($second_data_before[$param])&&$second_data_before[$param]){
                                                $diff_param = $second_data_before[$param] - $second_data[$param];
                                                if($diff_param < 0){
                                                    $diff_param = 0;
                                                }
                                                $convert_val = 2359.88*$diff_param/$diff_minutes;
                                                $convert_data[$param] = round($convert_val,2);
                                            }
                                        }
                                        $convert_datas[] = $convert_data;
                                    }
                                }
                            }
//                        $this->response(array($first_data,$before_data,$second_data,$second_data_before));
                        }
                        $new_date_time = strtotime($new_date." +1 days");
                        $new_date_time_end = $new_date_time + 24*3600 - 1;
                        if($new_date_time&&$new_date_time_end){
                            $new_where = "equip_no = '{$equip_no}' and equip_time between {$new_date_time} and {$new_date_time_end}";
                            $first_data = M('data_sensor')->fetOne($new_where,$select,"equip_time asc");
                        }
                    }
                }
                if($convert_datas){
                    $values = array();
                    foreach ($convert_datas as $convert_data) {
                        $column = array_keys($convert_data);
                        $value = array_values($convert_data);
                        $value_str = "('".implode("','",$value)."')";
                        $values[] = $value_str;
                    }
                    if($values){
                        $column_str = "(`".implode("`,`",$column)."`)";
                        $rep_sql = " replace into equip_qcm {$column_str} VALUES ".implode(',',$values);
                        $ret = $this->db->query($rep_sql);
                        $datas[$equip_no] = $ret;
                    }
                }
            }
        }
        $this->response($datas);

    }
}