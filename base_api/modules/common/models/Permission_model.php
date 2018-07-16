<?php

/**
 * Created by PhpStorm.
 * User: Hebj
 * Date: 2017/2/14
 * Time: 15:37
 */
class Permission_model extends MY_Model
{
    function check_permission($permission,$user){

        if($user['permissions'] == "administrator"){
           return true;
        }else {
            $permissions = array();
            foreach($user['permissions'] as $model=>$m_permission){
                $permissions[] = $model;
                if($m_permission){
                    foreach($m_permission as $value){
                        if(isset($value['val'])&&$value['val']){
                            $permissions[] = $value['val'];
                        }
                    }
                }
            }
            if(in_array($permission,$permissions)){
                return true;
            }
        }
        return false;
    }
}