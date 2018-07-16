文物管理后端api
=============

# 变更日志

## v2.2.01 @ 2017-08-07

### 功能改进
   1. 统一配置项 museum.ini,优先读取上一级目录下的museum.ini，不存在则读取/usr/local/ampps/php/etc/php.d/museum.ini。不存在则读取环境变量PHP_INI_SCAN_DIR下的museum.ini;


## v2.1.5 @ 2017-04-18

### 功能改进
  1.文物管理：文物统计优化，文物列表优化，子环境查询优化

### 新增特性


## v2.0.6.1 @ 2016-07-01

### Bug修复
	+文物等级，文物数量为空时，返回结果解析错误


## v2.0.6-beta @ 2016-06-26

### 功能改进
  1.架构重构,总体采用RESTful架构;
  2.Node层业务剥离,业务处理由后端(Php,Java...)处理;
  3.后端业务模块化,分系统处理;
  4.前端工程构建,模块化设计;

### 新增特性
  1.页面、视觉等重新设计;
  2.表现层（页面）分视图体现,突出重点与个性需求;
  3.功能模块设计,专业性数据分析与展现增强;


### v1.0.0 @ 2016-03-30

* 配置好数据库,179mysql的museum_base   
* 修改 application/config/rest_api.php     local_api和api_hosts对应子系统名和地址   
* 访问 /get/base/config/test/a1/a2?ac=a3   
  实际访问代码位置application/controllers/Config.php/test_get   
  如果test_get为未建立，则指向index_get,test及其后面的作为参数   
* 模块化HMVC 在/modules/admin/controllers/Admin.php   
  /get/base/admin/test/a1/a2?ac=a3  
* 所有结果都是返回json格式   
* 所有的controller extends MY_Controller ,controller文件名首字母大写
* function index_get() index_post() index_put() index_get_nologin(不验证token的用户登录)...
* 最后 $this->response($result);//输出json,$result为数组
* 统一错误 $this->response(array('error'=>'详细的错误提示'));


-----------

 * 基于ci3.0.6   
 * 增加必要文件
 	* application/
   		* config/rest_api.php   
  		* controllers/Proxy.php|Sync.php
  		* core/MY_Controller.php|MY_Loader.php|MY_Model.php|MY_Router.php
  		* helper/api_helper.php|global_help.php|model_helper.php
  		* libraries/Rest_api.php|Rest_des.php|Rest_token.php

 * 修改autoload.php
  	* $autoload['libraries'] = array('database', 'session');
  	* $autoload['helper'] = array('global', 'url', 'api', 'model');
  	* $autoload['config'] = array('rest_api');
