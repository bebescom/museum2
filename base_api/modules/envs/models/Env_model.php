<?php

class Env_model extends MY_Model
{
    function create_env_no($parent_no = "", $num = 0)
    {
        $this->load->driver('cache');
        $museum_no = app_config('museum_no');
        if (!$num) {
            $num = $this->cache->file->get('env_no_' . $parent_no);
            if (!$num) {
                $num = 0;
            }
        }
        $num++;
        $this->cache->file->save('env_no_' . $parent_no, $num, 0);
        $env_no = $parent_no . str_pad($num, 2, '0', STR_PAD_LEFT);
        $old = $this->find("env_no='" . $env_no . "'");
        if ($old) {//环境编号存在
            return $this->create_env_no($parent_no, $num);
        }
        return $env_no;
    }

    function check_env_no($parent_no = '', $env_no = '')
    {
        $old = $this->find("env_no='" . $env_no . "'");
        if (!$old) {//环境编号不存在
            return $env_no;
        }
        return $this->create_env_no($parent_no);
    }


}