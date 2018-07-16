<?php

/**
 * Created by PhpStorm.
 * User: Hebj
 * Date: 2016/12/14
 * Time: 15:16
 */
class Monitor extends MY_Controller
{
    /**
     *环境监测--详情--文物
     */
    public function relic_get()
    {
        $env_no = $this->get_post("env_no");
        $no_name = $this->get_post("no_name");
        $relic_no = $this->get_post("relic_no");
        $age = $this->get_post("age");
        $material = $this->get_post("material");
        $category = $this->get_post("category");
        $level = $this->get_post("level");
        $status = $this->get_post("status");
        $limit = $this->get_post("limit");
        $page = $this->get_post("page");
        $index = $this->get_post("index");

        $where = "1=1";
        if(isset($no_name)&&$no_name != ""&&$no_name != null){
            $where .= " and (name like '%".$no_name."%' or relic_no like '%".$no_name."%')";
        }

        if(isset($age)&&$age){
            $where .= " and age in ('".implode("','",explode(",",$age))."')";
        }

        if(isset($material)&&$material){
            $where .= " and material in ('".implode("','",explode(",",$material))."')";
        }

        if(isset($relic_no)&&$relic_no){
            $where .= " and relic_no in ('".implode("','",explode(",",$relic_no))."')";
        }

        if(isset($category)&&$category){
            $where .= " and category in ('".implode("','",explode(",",$category))."')";
        }

        if(isset($level)&&$level){
            $where .= " and level in ('".implode("','",explode(",",$level))."')";
        }

        if(isset($status)&&$status){
            $where .= " and status in ('".implode("','",explode(",",$status))."')";
        }


        if(!$page){
            $page = 1;
        }
        if(!$limit){
            $limit = 10;
        }
        $offset = ($page-1)*$limit;

        $data = array(
            "index"=>$index,
            "total"=>0,
            "rows"=>array()
        );
        if(isset($this->_user['data_scope'])&&$this->_user['data_scope']){
            if(isset($env_no)&&$env_no){
                $env_nos = M("common/common")->get_children(explode(",",$env_no));
                if($this->_user['data_scope'] != "administrator"){
                    $env_nos = array_intersect($env_nos,$this->_user['data_scope']);
                }
                $where .= " and parent_env_no in ('".implode("','",$env_nos)."')";

                $navs = array();
                $relics = M("relic")->fetAll($where,"*","",$offset,$limit);
                $count = M("relic")->count($where);
                if($relics){
                    foreach ($relics as $k=>$rlc) {
                        if(isset($rlc['parent_env_no'])&&$rlc['parent_env_no']){
                            $relics[$k]['nav'] = false;
                            $relics[$k]['map'] = false;
                            if(isset($rlc['parent_env_no'])&&$rlc['parent_env_no']){
                                if(isset($navs[$rlc['parent_env_no']])){
                                    $relics[$k]['nav'] = $navs[$rlc['parent_env_no']];
                                }else{
                                    $nav = API('get/base/envs/navigation/'.$rlc['parent_env_no']);
                                    $relics[$k]['nav'] = isset($nav['rows'])?$nav['rows']:"";
                                    $navs[$rlc['parent_env_no']] = $nav['rows'];
                                }
                            }
                            if($navs[$rlc['parent_env_no']]){
                                foreach($navs[$rlc['parent_env_no']] as $n_r){
                                    if(isset($n_r['type'])&&in_array($n_r['type'],array("展厅","库房","研究室","修复室","楼层"))&&$n_r['env_no']==$rlc['parent_env_no']){
                                        if(isset($n_r['map'])&&$n_r['map']){
                                            $relics[$k]['map'] = $n_r['map'];
                                        }
                                    }else{
                                        if(isset($n_r['type'])&&in_array($n_r['type'],array("展厅","库房","研究室","修复室"))){
                                            if(isset($n_r['map'])&&$n_r['map']){
                                                $relics[$k]['map'] = $n_r['map'];
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        $relics[$k]['locate'] = false;
                        if(isset($rlc['locate'])&&$rlc['locate']){
                            $locate = json_decode($rlc['locate'],true);
                            if(isset($locate['area'])&&$locate['area']){
                                $area = explode(",",$locate['area'][0]);
                                $locate['x'] = isset($area[0])?$area[0]:0;
                                $locate['y'] = isset($area[1])?$area[1]:0;
                            }
                            if(isset($locate['area'])){
                                unset($locate['area']);
                            }

                            $relics[$k]['locate'] = $locate;
                        }
                    }
                }
                $data = array(
                    "index"=>$index,
                    "total"=>$count,
                    "rows"=>$relics
                );
            }
        }

        $this->response($data);
    }
}