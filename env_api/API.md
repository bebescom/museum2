#  环境监测子系统API设计

描述博物馆2.0平台所有各子系统API信息，这里添加子系统大概的描述信息

---

1. [环境监测](#environment)
  1. [获取区域温湿度均值](#average)
  2. [获取环境最新数据](#lasted)
  3. [获取环境极值数据](#pole)
  4. [获取环境详细数据](#detail)
  5. [获取气象数据](#metero)
  6. [获取环境数据--箱线图](#metero)
  7. [获取环境达标率](#standard-reach)
2. [系统设置](#setting)
3. [设备管理](#equipmet)
4. [数据写入](#data)
     1. [终端上传数据写入](#datasensor)
     2. [路由数据写入](#route)
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/><br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/><br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>


<h2 id='average'>获取区域温湿度均值</h2>

###### 描述

根据环境编号查询用户基础信息

###### URI

~~~
GET /env/environment/average/:no
~~~

###### 参数
|  参数名  |  类型  |  描述  |
| ------------- | ------------- | ------------- |
|           no  |          string  | 环境编号  |
| Content Cell  | Content Cell  | Content Cell  |
| Content Cell  | Content Cell  | Content Cell  |
| Content Cell  | Content Cell  | Content Cell  |


<h2 id='average'>获取环境达标率</h2>

###### 描述

获取系统中微环境的达标率

###### URI

~~~
GET /env/environment/average/:no
~~~

###### 参数
|  参数名  |  类型  |  描述  |
| ------------- | ------------- | ------------- |
|           no  |          string  | 环境编号  |
| Content Cell  | Content Cell  | Content Cell  |
| Content Cell  | Content Cell  | Content Cell  |
| Content Cell  | Content Cell  | Content Cell  |

<h2 id='average'>终端上传数据写入</h2>

###### 描述

将监测终端上传的数据写入数据库并添加相应的设备

###### URI

~~~
POST /env/data/datasensor/data
~~~

###### 参数
|  参数名  |  类型  |  描述  |
| ------------- | ------------- | ------------- |
|           data  |          json  |  监测终端上传数据|