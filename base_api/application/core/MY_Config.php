<?php
(defined('BASEPATH')) OR exit('No direct script access allowed');

/**
 * Class MY_Config
 */
class MY_Config extends CI_Config
{
    function __construct()
    {
        parent::__construct();
    }
}

/**
 * 读取ini配置文件
 * @param $name
 * @param string $default_val
 * @return string
 */
function get_ini_var($name, $default_val = '')
{
    static $_api_config_var;
    if ($_api_config_var) {
        if (isset($_api_config_var[$name])) {
            return $_api_config_var[$name];
        } else {
            return $default_val;
        }
    }

    $ini_files = array(
        __DIR__ . '/../../../museum.ini',
        '/usr/local/ampps/php/etc/php.d/museum.ini',
        getenv('PHP_INI_SCAN_DIR') . '/museum.ini'
    );
//    print_r($ini_files);
    foreach ($ini_files as $ini_file) {
        $ini_file = realpath($ini_file);
//        print_r($ini_file);
        if (file_exists($ini_file)) {
            $_api_config_var = parse_ini_file($ini_file);
            break;
        }
    }

    if (isset($_api_config_var[$name])) {
        return $_api_config_var[$name];
    }
    return $default_val;

}