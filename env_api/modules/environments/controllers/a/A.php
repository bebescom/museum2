<?php 

class A extends MY_Controller{

	function index(){
		$m=M('app');
		var_dump($m);
		$user=$m->find(1);
		var_dump($user);

		// $this->load->model('a/user_model');
		// $this->user_model->get_user();
		// echo '<br/>';
		// echo __FILE__;
		// $this->session->set_userdata('some_name', 'some_value');

		// $this->session->userdata();

		$this->output->enable_profiler(true);
	}
	
	function add(){
		echo 'add';
	}

}