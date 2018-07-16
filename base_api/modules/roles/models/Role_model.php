<?php

class Role_model extends MY_Model
{
    public function get_role($id = 0)
    {
        static $_roles = array();
        if (isset($_roles[$id])) {
            return $_roles[$id];
        }
        $list = $this->fetAll();
        foreach ($list as $row) {
            $_roles[$row['id']] = $row;
        }

        if (isset($_roles[$id])) {
            return $_roles[$id];
        }
        return false;
    }

}