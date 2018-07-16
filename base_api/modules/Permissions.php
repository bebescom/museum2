<?php

class Permissions extends MY_Controller
{
    /**
     * 对外提供本系统所有拥有的权限列表，以便设置用户权限
     */
    function index()
    {

        $sql= "select * from permission group by `group`";
        $permissions = $this->db->query($sql)->result_array();
        $this->response($permissions);
        $permissions = array(
            '用户' => array(//权限分组
                '查询用户列表|查询用户列表|99',//权限名|权限值|排序，可以只写一个为权限值
                '获取单个用户基本信息|90',
                '添加用户',
                '修改用户',
                '删除用户',
            ),
            '角色' => array(
                '获取角色列表',
                '获取角色树',
                '获取单个角色信息',
                '添加角色',
                '修改角色',
                '删除角色',
            ),
            '权限' => array(
                '获取权限列表',
                '添加权限',
                '修改权限',
                '删除权限',
            ),
            '环境' => array(
                '获取环境列表',
                '获取环境树',
                '获取单个环境信息',
                '添加环境',
                '修改环境',
                '删除环境',
            ),
            '其他' => array(
                '独立权限1|999',
                '独立权限2',
            )
        );
        $this->response($permissions);
    }

    function test_post_nologin()
    {
        $this->response(array('get' => $this->get()));
    }
}