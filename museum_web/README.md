# 博物馆综合管理平台2.0 PC端

# 部署
apache 开启mod_headers.so

~~~bash
cp gulpfile.default.js gulpfile.js
npm install gulp -gd #全局安装gulp
npm install -d #安装依赖
gulp prod min #生产环境编译并采用.min.js
~~~

# 开发
~~~bash
cp gulpfile.default.js gulpfile.js
npm install gulp -gd #全局安装gulp
npm install -d #安装依赖
gulp prod watch #开发环境编译,监听文件修改并编译，win无法监听新文件
~~~



# 变更日志
## v2.2.0 @ 2017-07-03
### 综述
    1.地图选取设备对比的功能。现在可以直接在地图上选择设备加入对比了。
    2.基础数据统计分析的性能优化。【环境监控】界面现在出统计结果的等待时间大幅缩短，并且可以选取较长时间进行数据分析了。
    3.设备数据批量下载。我们对设备批量下载的性能和细节（插入占位符，文件命名等）进行了优化，下载可以更愉快的下载设备数据了。
    4.文物管理。我们增强了文物管理板块的功能，使之能够进行简单的文物出入库及盘点管理。
    5.用户与权限管理。我们加入了用户管理与用户权限管理板块，现在可以对每位用户的权限进行设置了。
    6.设备状态判定优化。我们完善了设备各状态判定的机制，使得设备状态可以一目了然的得到。
### 问题修复
    1.【设备管理】震动传感器、土壤温湿度传感器显示问题。
    2.【设备管理】修复设备状态误判的问题。
    3.【全局】Bug修复。
### 功能改进
    1.【环境监控】基础数据统计分析性能优化。
    2.【设备管理】多设备数据导出性能优化与丢失数据站位。
    3.【环境详情】曲线样式及Y轴优化。
    4.【综合管理】室外气象站样式优化。
    5.【文物管理】文物展示从卡片式变为列表式，展示更多信息，更高效的同时方便筛选。
    6.【综合管理】展厅小环统计包含下属环境，之前只包括展厅小环境本身数据。
    7.【设备管理】格式风格依照UI设计图调整。
### 新增特性
    1.【地图详情】新增地图选设备并加入对比功能。
    2.【文物管理】新增文物入库、文物出库、文物盘点页面入口。
    3.【文物入库】本界面可以添加文物以及将选定的文物入库。
    4.【文物出库】本界面可以将已经入库的文物出库。
    5.【文物盘点】本界面可以创建盘点计划以及进行盘点工作记录。
    6.【用户管理】新增用户管理模块，可以分配用户功能权限与数据权限。
    7.【文物管理】新建文物板块新增添加文物图片功能。
    8.【文物详情】文物概况板块新增添加/修改文物图片功能，增添文物名称修改功能，新增删除文物功能。
    9.【设备管理】批量设置板块新增修改设备板块，可以批量调整设备位置和设备状态。
### 其他变更
    无

---
## v2.1.5 @ 2017-04-17
### 问题修复
    1.退出登录后，其余登录页面的操作不能跳转至登录页面
    2.综合管理,各列表详情页样式不一致
    3.设备管理,从设备管理的安装位置中点击相同环境名称中的某一个跳转至环境树中第一个环境
    4.设备管理,列表中第一次点击设备安装位置，跳转至环境详情与对比页面时，该环境未默认选中
    5.环境监控,环境对比与详情中报警曲线在点击参数时未按照对应阈值报警
    6.设备详情,tab切换高度不固定
    7.设备对比,无数据设备提示信息显示错误
    8.设备对比,有对比数据切换至无对比数据时,图形显示错误
    9.环境监控,环境对比与详情先多选环境后单选环境时未显示报警阈值和对应曲线
    10.环境监控,环境对比与详情曲线标点红蓝色错位
    11.设备管理,同柜设备跳转到对应的页面,跳转完无法获取数据
    12.综合管理,可视化热区放缩无法保持可视化颜色
    13.综合管理,环境对比与详情中曲线报警反选无法按照正常值域判断
    14.设备详情,修改设备状态为select样式
    15.设备详情,历史信息没有数据
    16.综合管理,展厅可视化字体距离,热区放缩后，选择筛选颜色条时不能正常显示
    17.综合管理,可视化热区湿度和温度颜色条相反
### 功能改进
    1.修改页面的时间选择插件
    2.地图视图默认显示展柜状态
    3.调整左侧全局导航对比度
    4.地图视图图标更新
### 新增特性
    1.设备对比功能
    2.环境报警功能
### 其他变更

---
## v2.1.1@2017-01-19
### 功能特性

    1.综合管理
    2.环境监控
    3.文物管理
    4.设备管理
    5.设置环境

---
## v2.0.6 @ 2016-06-26
### 问题修复

### 功能改进

### 新增特性
    1.页面、视觉等重新设计;
    2.表现层（页面）分视图体现,突出重点与个性需求;
    3.功能模块设计,专业性数据分析与展现增强;

### 其他变更

---


<div id="api_directory"></div>

+ [gulp使用](#__gulp)
+ [内联文件](#__inline)
+ [转换地址](#__uri)
+ [API转换](#__api)
+ [定义依赖全局别名](#__map)
+ [解析依赖](#__deps)
+ [依赖注入](#__html_deps)
+ [js模块化](#__js_module)


---

### gulp <span id="__gulp"></span>

[前端构建工具gulpjs的使用介绍及技巧](http://www.cnblogs.com/2050/p/4198792.html)

1.全局安装gulp

~~~bash
$ npm install gulp -gd
~~~

2.安装依赖：

~~~bash
$ npm install -d
~~~

3.运行 

~~~bash
$ gulp
~~~

3.或者监视文件修改并自动生成(仅监听文件改变，新建windows下无法监听)

~~~bash
$ gulp watch
~~~

4.生产环境,与后端api通信 

~~~bash
$ gulp prod 
~~~

4.生产环境监视文件并自动生成

~~~bash
$ gulp prod watch
~~~

5.最终发布

~~~bash
$ gulp prod min
~~~



# 语法

---

## 内联文件 <span id="__inline"></span>

可在.htm,.html,.js里面使用，将该文件内容加载替换此处

~~~
__inline("/common/header.htm")
~~~

在内联文件内的路径全部写根目录为src的绝对路径,否则转换地址时找不到。

common/header.htm

~~~html
<a href="/main/index.html"></a>
<img src="/common/images/txtbtn1.png" >
~~~


---

## 转换地址 <span id="__uri"></span>

该文件中的链接转换为 目标链接地址与当前文件的相对路径

转换地址在内联文件之后，也就是说先加载内联文件内容，再对所有地址转换为相对路径。

仅转换： __uri(),link:href,script:src,a:href,img:src

~~~js

//login/login.js中
var $a=__uri('/main'); // => '../main' (引号会一起返回)
var $a="__uri(/main)";// => ../main (也可以不带)

//login/a/a.js中
var $a=__uri("/main"); // => "../../main"
~~~


~~~html
<!-- main/index.html  -->
__inline('../common/header.html')

<!-- header.html -->
<a href="/main/index.html"></a>  
<img src="/common/images/txtbtn1.png" > 

<!-- 最终main/index.html内 -->
<a href="index.html"></a> 
<img src="../common/images/txtbtn1.png" >

~~~


---

## API转换 <span id="__api"></span>

在开发环境中将api_uri转换为/test/api_uri.json,其中特殊字符/#等全部转为_

根目录绝对路径,gulpfile.js=> lib.set('test_url',''),默认截取www后面的路径

API("/base/config") => "/museum_base/web/test/_base_config.json"

而生产环境(prod),则会转换为api地址，需要在gulpfile.js中

~~~js
lib.set('api_url', "/museum_base/api");//api地址,prod才启用
~~~

API("/base/config") => "/museum_base/api/base/config"



---

## 定义依赖全局别名 <span id="__map"></span>

/map.js

~~~js
var alias = {
    mod: '/js/mod.js',
    jquery: '/js/jquery-1.8.3.min.js',
    echarts: '/js/echarts.min.js',
    angular: '/js/angular.min.js',
    qrcode: '/js/jquery.qrcode.min.js',
    laydate: '/js/laydate/laydate.js',
    public: '/js/public.js',
};
~~~

修改map.js必须重启gulp watch






---

## 解析依赖 <span id="__deps"></span>

支持在html,js注释中定义依赖, @require 引入css和其他js库文件

htm文件为动态加载，不会解析依赖

~~~html
<!-- @require css/main.css -->
<!-- @require angular -->
~~~

~~~js
// @require css/data.css
// @require angular
/*
   @require jquery
*/

require("common/header");
require("./data");
require("../a");
~~~

在common/header.js中也可以定义依赖，同样有效

~~~js
// @require css/header.css
~~~

require中使用相对路径 ./ ../ 会替换成模块名全称

~~~js
require("common/header"); // => require('common/header');
require("./data"); // => require('main/data');
require("../a"); // => require('a');
~~~






---

## 依赖注入 <span id="__html_deps"></span>

针对html文件

htm文件为动态加载，不会解析依赖

查找当前require的模块的依赖+html可能定义的依赖，最后引入所有依赖（在第一个 &lt;script 之前插入js,在&lt;/head&gt;之前插入css）。

/js/mod.js为自动引入，不需要定义依赖,并始终保持第一个引入。

原html文件

~~~html
<script type="text/javascript">
    require('main');
</script>
~~~

注入后

~~~html

  <link rel="stylesheet" href="css/main.css" />
  <link rel="stylesheet" href="css/data.css" />
  <link rel="stylesheet" href="../common/css/header.css" />
</head>

<script type="text/javascript" src="../js/mod.js" ></script>
<script type="text/javascript" src="main.js" ></script>
<script type="text/javascript" src="../js/angular.min.js" ></script>
<script type="text/javascript" src="../js/jquery-1.8.3.min.js" ></script>
<script type="text/javascript" src="../a.js" ></script>
<script type="text/javascript" src="../common/header.js" ></script>
<script type="text/javascript" src="data.js" ></script>
<script type="text/javascript">
    require('main');
</script>
~~~

最后生成依赖文件 /map.json







---

## js模块化 <span id="__js_module"></span>

所有src目录下js文件默认都会在编译时加上,也可以自定义define

~~~js
    content = "define('" + options.module_id + "', function(require, exports, module) {\n" + content + "\n});";
~~~

module_id为模块名,文件夹路径+文件名,一级文件夹名与文件名相同将只保留文件名，例：

~~~
main/main.js => main
main/data.js => main/data
login/login.js => login
main/main/a.js => main/main/a
~~~

定义接口

~~~js
//data.js
exports.init=function(){}
//a.js
exports.show=function(aaa){}
//main.js
exports.get_info=function(asd){}
~~~

使用模块

~~~js
require("common/header");
var data=require("./data");
data.init();
var a=require("../a");
a.show('aaa');
require('main').get_info('asd');
~~~

require执行模块内的代码(只执行一次)，可以使用exports提供对外接口.

上面都会预加载js文件,下面异步加载js,需要手动定义define,必须与async一致(可去掉.js).

~~~js
// /main/data.js
require.async('data/a.js',function(a){
   a.init(); 
});

// /main/data/a.js
define('data/a', function (require, exports) {

  exports.init=function(){

  };
  
});

~~~