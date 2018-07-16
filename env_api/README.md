环境监测调控系统后端api
=============

# 变更日志

## v2.2.05_P001 @ 2018-07-09

### 功能改进
   1. 停用设备不在直接显示在业务操作功能，涉及功能：
        + 综合管理--地图视图页面---图例（env/environments/legends/legend_classifies）；
        + 综合管理--地图视图页面---布局图设备（env/environments/legends/legend_detail/）；
        + 综合管理--地图视图页面---环境监控--设备（env/environments/floor_sensors）；
        + 综合管理--地图视图页面---网络设备（env/environments/networks/network_lists）；
        + 环境监测--环境详情与对比--设备（env/monitor/equip）；
        + 设备管理--设备详情--同环境设备（env/environments/cabinet/equips）；
        + 综合管理—设置环境---编辑布局图--未设置设备（env/setting/no_locate）
        + 综合管理—设置环境---编辑布局图--已设置设备（env/setting/equip_locate）

## v2.2.01 @ 2017-08-07

### 功能改进
   1. 统一配置项 museum.ini,优先读取上一级目录下的museum.ini，不存在则读取/usr/local/ampps/php/etc/php.d/museum.ini。不存在则读取环境变量PHP_INI_SCAN_DIR下的museum.ini;
   2. 添加设备异常检测,被动：数据上传时对设备电压和数据进行验证，过滤数据错误、电压预警、数据突变等异常；主动:：主动对设备进行传输时间检测，超过设定时间未上传数据，则对设备进行异常预警；

   
## v2.1.5 @ 2017-04-18


### 功能改进
	1.环境监测：环境曲线性能优化，特征值性能优化，环境特征值导出排序,时间边界统一.
	2.通用：阈值功能优化.
	3.综合管理：气象站优化.
	4.设备管理：设备数据导出优化.


### 代码结构改进


### 新增特性


## v2.0.7-beta @ 2016-07-13

### 代码结构改进
	1.首页功能：区域概况，温湿度曲线，评分五星图，微环境分项达标率 由Overview.php 抽离到 Homepage.php.
	2.楼层选择功能：环境概况，文物概况，设备概况，以及展厅信息 由 Environments.php 抽离到 Floor.php.
	3.楼层/展厅详情功能：图例切换，图例详情 由 Environments.php 抽离到 Legends.php;
						网络设备统计，网络设备列表 由 Environments.php 抽离到 Networks.php


### 新增特性
	设备详情：添加箱线图，稳定功能


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



## v1.0.2.2 @ 2016-06-25

### 新增功能
   + [环境监测]
    [展柜（svg）概览]
    [展柜（svg）概览--温湿度曲线]

   <br/>

### 功能优化

###  Bug修复

## v1.0.2.1 @ 2016-06-21

### 新增功能
   + [环境监测]
    [首页，区域概况]
   + [设备管理]
     [获取设备]
   + [数据写入]
     1. [终端上传数据写入]
     2. [路由数据写入]
   <br/>

### 功能优化
    [展厅--参数达标率]

###  Bug修复


### v1.0.1 @ 2016-06-01

### 新增功能
   + [环境监测]
    [展柜，展柜概况--柜体概况]
    [展柜，展柜概况--环境要求]
    [展柜，展柜概况--柜内文物]
    [展柜，环境监控，达标率--仪表]
    [展柜，环境监控，达标率--雷达图]
    [展柜，环境监控，温湿度稳定性]
    [展柜，环境监控，参数选择器]
    [展柜，环境监控，曲线]
    [展柜，环境监控，设备]
   + [设备管理]
     [获取设备]
   + [数据写入]
     1. [终端上传数据写入]
     2. [路由数据写入]
   <br/>

### 功能优化

###  Bug修复


## v1.0.1 @ 2016-05-30

### 新增功能
   + [环境监测]
     1. [获取环境数据--箱线图]
     2. [获取微环境达标率--饼图]
     3. [获取微环境各参数达标率--雷达图]
     4. [特别关注]
     5. [文物展出状况]
     6. [温湿度概览]
     7. [温湿度极值]
     8. [温湿度均峰值]
     9. [区域湿度稳定性]
     10. [气象站数据]
     11. [五星图]
   + [设备管理]
     1. [获取设备列表]
     2. [获取设备信息]
   + [数据写入]
     1. [终端上传数据写入]
     2. [路由数据写入]
   <br/>

### 功能优化


###  Bug修复
  + [数据写入]
     1. [预警数据写入]

## v1.0.1 @ 2016-04-21

### 新增功能
   + [环境监测]
     1. [获取环境数据--箱线图]
     2. [获取微环境达标率--饼图]
     3. [获取微环境各参数达标率--雷达图]
     4. [特别关注]
     5. [文物展出状况]
     6. [温湿度概览]
     7. [温湿度极值]
     8. [温湿度均峰值]
     9. [区域湿度稳定性]
     10. [气象站数据]
     11. [五星图]
   + [设备管理]
     1. [获取设备列表]
     2. [获取设备信息]
   + [数据写入]
     1. [终端上传数据写入]
     2. [路由数据写入]
   <br/>

### 功能优化


###  Bug修复



## v1.0.0 @ 2016-03-30


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
