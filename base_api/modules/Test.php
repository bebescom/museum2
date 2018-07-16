<?php

class TEST extends MY_Controller
{

	function index_nologin(){

		phpinfo();
		$this->response($this->input->ip_address());

	}

}