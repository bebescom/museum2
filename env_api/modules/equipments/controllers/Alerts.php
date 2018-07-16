<?php

/**
 * Created by PhpStorm.
 * User: Hebj
 * Date: 2017/8/8
 * Time: 16:18
 */
class Alerts extends MY_Controller
{
    public function __construct()
    {
        parent::__construct();
    }

    public function alert_list_get()
    {
        $equip_no = $this->get_post('equip_no');
        $equip_type = $this->get_post('equip_type');
        $env_no = $this->get_post('env_no');
        $alert_time = $this->get_post('alert_time');
        $clear_time = $this->get_post('clear_time');
        $id = $this->get_post('id');
        $type = $this->get_post('type');
        $index = $this->get_post('index');
        $page = $this->get_post('page');
        $limit = $this->get_post('limit');

        $envs = API("get/base/envs");//获取所以环境
        $equip_where = "1=1";
        if($equip_type){
            $equip_where .= " and equip_type in ('".implode("','",explode(",",$equip_type))."')";
        }
        $equips = M('equip')->fetAll($equip_where,'equip_no,equip_type');
        $equip_types = array();
        $sel_nos = array();
        if($equips){
            foreach ($equips as $equip) {
                if(isset($equip['equip_no'])&&isset($equip['equip_type'])){
                    $equip_types[$equip['equip_no']] = $equip['equip_type'];
                    $sel_nos[] = $equip['equip_no'];
                }
            }
        }

        $where = "1=1";
        if(isset($equip_no)&&$equip_no){
            $equip_nos = explode(',',$equip_no);
            $sel_nos = array_intersect($equip_nos,$sel_nos);
        }
        if($sel_nos){
            $where .= " and equip_no in ('".implode("','",$sel_nos)."')";
        }

        if(isset($env_no)&&$env_no){
            $env_nos = explode(',',$env_no);
            $where .= " and env_no in ('".implode("','",$env_nos)."')";
        }

        if(isset($type)&&$type){
            $types = explode(',',$type);
            $where .= " and `type` in ('".implode("','",$types)."')";
        }

        if(isset($id)&&$id){
            $where .= " and (equip_no like '%{$id}%' or name like '%{$id}%')";
        }

        if(isset($alert_time)&&$alert_time){
            $alert_time = explode(',',$alert_time);
            if(isset($alert_time[0])){
                $alert_time_s = $alert_time[0];
                $where .= " and alert_time >= {$alert_time_s}";
            }
            if(isset($alert_time[1])){
                $alert_time_end = $alert_time[1];
                $where .= " and alert_time <= {$alert_time_end}";
            }
        }
        if(isset($clear_time)&&$clear_time){
            $clear_time = explode(',',$clear_time);
            if(isset($clear_time[0])){
                $clear_time_s = $clear_time[0];
                $where .= " and alert_time >= {$clear_time_s}";
            }
            if(isset($clear_time[1])){
                $clear_time_end = $clear_time[1];
                $where .= " and alert_time <= {$clear_time_end}";
            }
        }

        if(!isset($page)||!$page){
            $page = 1;
        }
        if(!isset($limit)||!$limit){
            $limit = 10;
        }
        $offset = ($page - 1)*$limit;
        $alerts = M('equip_alert')->fetAll($where,'*','alert_time desc',$offset,$limit);
        $total = M('equip_alert')->count($where);
        $navs = array();
        if($alerts){
            foreach ($alerts as $k => $alert) {
                if(isset($alert['alert_time'])&&$alert['alert_time']){
                    $alerts[$k]['alert_time'] = date("Y-m-d H:i",$alert['alert_time']);
                }
                if(isset($alert['clear_time'])&&$alert['clear_time']){
                    $alerts[$k]['clear_time'] = date("Y-m-d H:i",$alert['clear_time']);
                }
                if(isset($alert['equip_no'])&&$alert['equip_no']){
                    if(isset($equip_types[$alert['equip_no']])){
                        $alerts[$k]['equip_type'] = $equip_types[$alert['equip_no']];
                    }
                }
                if(isset($alert['env_no'])&$alert['env_no']){
                    if(isset($navs[$alert['env_no']])){
                        $alerts[$k]['nav'] = $navs[$alert['env_no']];
                    }else{
                        $nav = M('common/common')->navigation($envs['rows'],$alert['env_no']);
                        $alerts[$k]['nav'] = $nav;
                        $navs[$alert['env_no']] = $nav;
                    }

                    if($navs[$alert['env_no']]){
//								array_reverse($navs[$equip['env_no']]);
                        foreach($navs[$alert['env_no']] as $n_r){
                            if(isset($n_r['type'])&&in_array($n_r['type'],array("展厅","库房","修复室","研究室","楼层"))&&$alert['env_no'] == $n_r['env_no']){
                                if(isset($n_r['map'])&&$n_r['map']){
                                    $alerts[$k]['map'] = $n_r['map'];
                                    continue;
                                }
                            }else {
                                if (isset($n_r['type']) && in_array($n_r['type'], array("展厅", "库房", "修复室", "研究室"))) {
                                    if (isset($n_r['map']) && $n_r['map']) {
                                        $alerts[$k]['map'] = $n_r['map'];
                                        continue;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        $data = array(
            'index'=>$index,
            'total'=>$total,
            'rows'=>$alerts
        );

        $this->response($data);
    }

    public function alert_count_get()
    {
        $clear = $this->get_post('clear');
        $where = "1=1";
        if($clear){
            $where .= " and clear_time is null";
        }
        $sql = "select `type`,count(*) as type_count from equip_alert where {$where} group by `type`";
        $param_count = $this->db->query($sql)->result_array();

        $data = array(
            'param'=>array(),
            'alert_time'=>array()
        );
        if($param_count){
            foreach ($param_count as $count) {
                if(isset($count['type'])&&isset($count['type_count'])){
                    $data['param'][] = array(
                        'name'=>$count['type'],
                        'count'=>(int)$count['type_count']
                    );
                }
            }
        }

        //时间统计
        //昨天
        $yesterday_count = M("equip_alert")->count($where." and alert_time >= ".strtotime('yesterday')." and alert_time < ".strtotime('today'));
        //今天
        $today_count = M("equip_alert")->count($where." and alert_time >= ".strtotime('today'));
        //本周
        $today = date("Y-m-d");
        $week_start = strtotime($today ."-".(date('w',strtotime($today)) ? date('w',strtotime($today)) - 1 : 6).' days');
        $week_end = time();
        $week_count = M("equip_alert")->count($where." and alert_time >= ".$week_start." and alert_time <= ".$week_end);
        //本月
        $month_end  = time();
        $month_start = mktime(0,0,0,date("m"),1,date("Y"));
        $month_count = M("equip_alert")->count($where." and alert_time >= ".$month_start." and alert_time <= ".$month_end);

        if($yesterday_count){
            $data['alert_time'][] = array(
                'name'=>'yesterday',
                'count'=>$yesterday_count
            );
        }
        if($today_count){
            $data['alert_time'][] = array(
                'name'=>'today',
                'count'=>$today_count
            );
        }
        if($week_count){
            $data['alert_time'][] = array(
                'name'=>'week',
                'count'=>$week_count
            );
        }
        if($month_count){
            $data['alert_time'][] = array(
                'name'=>'month',
                'count'=>$month_count
            );
        }

        //设备类型统计
        $equip_nos = $this->db->select('equip_no')->distinct('equip_no')->where($where)->get('equip_alert')->result_array();
        $equip_nos = array_column($equip_nos,'equip_no');
        if($equip_nos){
          $equip_types = $this->db->select("count(*) as count,equip_type as name")->where_in('equip_no',$equip_nos)->group_by('equip_type')->get('equip')->result_array();
            if(!isset($data['equip_type'])){
                $data['equip_type'] = array();
            }
            $data['equip_type'] = $equip_types;
        }

        $this->response($data);
    }
}