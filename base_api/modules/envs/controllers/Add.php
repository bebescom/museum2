<?php

class Add extends MY_Controller
{

    function index_post()
    {
//        if(!M("common/permission")->check_permission("添加环境",$this->_user)){
//            $this->response(array('error' => '无权限添加环境'));
//        }
        $env_no = $this->post('env_no');
        $parent_env_no = $this->post('parent_env_no');
        $name = $this->post('name');
        $type = $this->post('type');
        $map = $this->post('map');
        $locate = $this->post('locate');
        $sort = $this->post('sort');

        if (!isset($env_no)) {
            $this->response(array('error' => '没有找到环境编号'));
        }
        if (!isset($name)) {
            $this->response(array('error' => '没有找到环境名称'));
        }
        $m = M('env');
        $env_no = $m->check_env_no($parent_env_no, $env_no);
        $data = array(
            'env_no' => $env_no,
            'name' => $name,
        );
        if (isset($parent_env_no)) $data['parent_env_no'] = $parent_env_no;
        if (isset($type)) $data['type'] = $type;
        if (isset($map)) $data['map'] = $map;
        if (isset($locate)) $data['locate'] = $locate;
        if (isset($sort)) $data['sort'] = $sort;

        $id = $m->add($data);
        if (!$id) {
            $this->response(array('error' => '添加失败!'));
        }
        if(isset($this->_user['id'])&&$this->_user['data_scope']!='administrator'){
            $user = M('user')->fetOne('id = '.$this->_user['id']);
            if(isset($user['role_ids'])){
                $role_ids = explode(',',$user['role_ids']);
                foreach ($role_ids as $role_id) {
                    $role = M('role')->fetOne('id = '.$role_id);
                    if(isset($role['data_scope'])){
                        $data_scope = explode(',',$role['data_scope']);
                        $data_scope[] = $data['env_no'];
                        $ret = M('role')->update(array('data_scope'=>implode(',',$data_scope)),'id = '.$role['id']);
                    }
                }
                $data_scope = M('users/user')->get_scope($user['id'], $user['role_ids']);
                $permissions = M('users/user')->get_permissions($user['id'], $user['role_ids']);
                $user_row = array(
                    'id' => $user['id'],
                    'username' => $user['username'],
                    'level' => $user['level'],
                    'real_name' => $user['real_name'],
                    'permissions' => $permissions,
                    'data_scope' =>$data_scope,
                    'token' => $this->_token,
                    'token_level' => 1,
                    'ip'=>$this->_ip,
                );
                $api_hosts = config_item('api_hosts');
                $api_list = array();
                foreach ($api_hosts as $app => $api) {
                    $api_list[] = array('post/' . $app . '/sync/login', array('auth_code' => API_encode($app, $user_row)));
                }
                $result['results'] = API($api_list);//批量发出
            }
        }
        $this->response(array('env_no' => $data['env_no'], 'msg' => '添加成功!'));

    }

    function index_get($parent_env_no = '')
    {
        $m = M('env');
        $env_no = $m->create_env_no($parent_env_no);
        $parent_type = '';
        if ($parent_env_no != '') {
            $prow = $m->find("env_no='" . $parent_env_no . "'");
            if ($prow) {
                $parent_type = $prow['type'];
            }
        }

        $this->response(array('env_no' => $env_no, 'parent_type' => $parent_type));
    }

}