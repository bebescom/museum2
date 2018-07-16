<?php

/**
* 执行日志
* 可变参数
*/
if(! function_exists("cli_logs")){
	function cli_logs(){
		$path = dirname(__FILE__)."/../logs/";
		$f = @fopen($path.date('Y').'.log', 'a');
		if($f){
			fwrite($f, "[".date('Y-m-d H:i:s')."]\t".implode("\t", func_get_args()).PHP_EOL);
			fclose($f);
		}
	}
}



