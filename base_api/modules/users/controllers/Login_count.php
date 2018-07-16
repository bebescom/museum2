<?php

class Login_count extends MY_Controller
{
    function index($user_id = '')
    {
        if ($user_id == '') {
            $user_id = $this->get_post('user_id');
        }
        $ktime = $this->get_post('ktime');
        $dtime = $this->get_post('dtime');
//        if (isset($ktime) && $ktime != '') {
//            $ktime = strtotime($ktime);
//        }
//        if (isset($dtime) && $dtime != '') {
//            $dtime = strtotime($dtime);
//        }
        $wherestr = "1=1";
        if ($ktime) {
            $wherestr .= " and login_time>" . $ktime;
        }
        if ($dtime) {
            $wherestr .= " and login_time<" . $dtime;
        }
        $uids = array();
        $u_wherestr = " level='工作人员'";
        if (isset($user_id) || $user_id != '') {
            $u_wherestr .= " and id in (" . $user_id . ")";
        }
        $m = M('user');
        $ulist = $m->fetAll($u_wherestr, "id", "sort desc,id asc ");
        if (count($ulist) == 0) {
            $this->response(array('error' => '没有找到任何工作人员'));
        }
        foreach ($ulist as $user) {
            $uids[$user['id']] = 0;
        }

        if (count($uids) > 0) {
            $wherestr .= " and user_id in (" . join('', array_keys($uids)) . ")";
        }

        $lm = M('user_login');
        $list = $lm->fetAll($wherestr, "user_id");

        foreach ($list as $row) {
            if ($row && $row['user_id']) {
                $uids[$row['user_id']]++;
            }
        }
        $rows = array();
        $user_count = 0;
        foreach ($uids as $uid => $count) {
            $rows[] = array(
                'user_id' => $uid,
                'user_count' => $count,
            );
            $user_count += $count;
        }
        $result = array(
            'total' => count($rows),
            'rows' => $rows,
            'total_user_count' => $user_count,
        );
        $this->response($result);
    }
}