# report_api

报表子系统后端api
=======

变更日志
-----------


v2.1.5 @ 2017-04-25
---------
## 初始化报表子系统





v1.0.0 @ 2016-03-30
---------

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
