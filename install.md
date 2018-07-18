安装说明
=============

# 前置

前置安装ampps,tomcat(监听8080),node,gulp,npm

启动apache,mysql.

------------

# 升级数据库

停止env_nodejs服务。

升级数据库(base,env,relic,collect)，使用navicat结构对比功能，注意base.config表加了唯一索引key,删除重复的key

------------

## 处理数据

使用navicat对比数据库，或使用该数据库对应版本的升级sql脚本.
	
	base
		config,修改对应数据。先将原config改名为config_old,在修改对应项。
		permission,原来没有的就加上
		role,原来没有的就加上
		user,处理role_ids(角色id),status(默认为'正常'),level(默认为'用户'),sgdzl为服务端
	env
		equip_param,覆盖
		equip_type,覆盖
	relic
		threshold,原来没有的就加上
	collect
		增加一个视图,注意数据库名要改成博物馆的前缀



## 增加用户名sgdzl，level:服务端，密码为sgdzl_admin

------------

# 安装node

将node,npm,gulp 命令软链到 /usr/bin/

~~~bash
sudo ln -s /usr/local/ampps/nodejs/bin/node /usr/bin/
sudo ln -s /usr/local/ampps/nodejs/bin/npm /usr/bin/
npm i -gd gulp
sudo ln -s /usr/local/ampps/nodejs/bin/gulp /usr/bin/
~~~

# 解压安装 

注意该zip包里面包含museum2文件夹

~~~bash
unzip 2.2.05.zip
mv museum2 /usr/local/ampps/www/2.2.05
~~~

删除多余文件，如museum.ini,sql/


## 全局唯一配置项 museum.ini

主要修改
~~~
	MUSEUM_WEB_HOST =192.168.100.12 		# web服务器ip
	MUSEUM_DB_HOST  =192.168.100.11  		# 数据库服务器ip
	MUSEUM_DB_NAME_PREFIX =museum  			# 数据库前缀 museum_base,museum_env
	MUSEUM_NT_HOST  =192.168.100.10 		# 通信服务器ip

	MUSEUM_WEB_VERSION		=2.2.05 		# 最新版本号,nt服务器上也要更新
~~~

### linux

先检查是否配置/usr/local/ampps/php/etc/php.d/museum.ini
如不存在时，移动museum.ini到指定位置
如存在则删除2.2.05/museum.ini

~~~
cd 2.2.05/
mv museum.ini /usr/local/ampps/php/etc/php.d/  #不存在才移动,否则删除当前museum.ini。
~~~

### window

单服务器或测试window上面museum.ini里面的IP修改为127.0.0.1

或设置环境变量 PHP_INI_SCAN_DIR 

放在版本目录下面： 
~~~
/2.2.02/museum.ini
~~~

java在windows下只访问了各项目内的文件，如
~~~
cp museum.ini museum_app/WEB-INF/classes/museum.ini
~~~

## linux软链java项目,然后重启tomcat或者reload项目

~~~bash
ln -s /usr/local/ampps/www/2.2.02/museum_relics_api /usr/local/ampps/tomcat8/webapps/
ln -s /usr/local/ampps/www/2.2.02/museum_app /usr/local/ampps/tomcat8/webapps/
~~~

# 定时任务

已全部放入env_nodejs处调度执行。删除crontab -e里面的php middleIndex


## 统计历史环境监控数据.手动执行

~~~bash
/usr/local/ampps/php/bin/php /usr/local/ampps/www/2.2.02/env_api/index.php cli middleIndex 2017-01-01 #至今天
/usr/local/ampps/php/bin/php /usr/local/ampps/www/2.2.02/env_api/index.php cli middleIndex 2017-01-01 2017-05-01 #指定日期段
~~~


# php配置

编辑 php.ini 文件

~~~

sudo vim /usr/local/ampps/php/etc/php.ini

# 开启以下扩展,不存在则加上去

extension=sockets.so
extension=zip.so
extension=zlib.so
extension=ctype.so
extension=openssl.so
extension=iconv.so
extension=mcrypt.so

~~~

 需重启apache生效，可以配置完成后在重启apache


# apache配置

开启gzip、设置缓存过期时间、隐藏apache版本号

编辑 http.conf 文件

~~~
sudo vim /usr/local/ampps/apache/conf/http.conf

# 开启以下模块

LoadModule headers_module modules/mod_headers.so
LoadModule expires_module modules/mod_expires.so
LoadModule deflate_module modules/mod_deflate.so
LoadModule filter_module modules/mod_filter.so

# 文件末尾加上

<IfModule mod_deflate.c>
	AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/x-javascript application/javascript application/json 
</IfModule>


# 隐藏apache版本号

ServerTokens ProductOnly
ServerSignature Off

~~~

需重启apache生效


# 重启apache

~~~bash
sudo /usr/local/ampps/apache/bin/apachectl restart
~~~


# 软链web目录

~~~
cd /usr/local/ampps/www
rm web 
ln -s 2.2.05/web .
~~~

window下直接复制web/目录到www/下


# 启动env_nodejs

打包env_nodejs,上传到nt服务器

原有env_nodejs 先备份 

~~~
mv env_nodejs env_nodejs_old
~~~

在nt服务器上，同样配置museum.ini

注意 museum.ini，node将把数据发到这个版本下。

MUSEUM_WEB_VERSION		=2.2.05

~~~
mv museum.ini /usr/local/ampps/php/etc/php.d/  #不存在才移动,否则删除当前museum.ini。

# 赋予执行权限，启动脚本

chmod +x env_nodejs/bin/*.sh
sudo /usr/local/ampps/env_nodejs/bin/start.sh

# 停止所有env_nodejs下的脚本
sudo /usr/local/ampps/env_nodejs/bin/stop.sh

~~~

## 添加自启动项
/usr/local/ampps/env_nodejs/bin/start.sh 添加到/etc/rc.local里面。

## 查看运行

查看env_nodejs/logs/run.log 看是否有异常错误抛出 error

打开8020,默认密码sgdzl,可删除web.pwd则无密码，正式博物馆不能删除。

查看local解析数据和php解析数据，都有数据则升级完毕了。


## 在nt服务器上安装docker

- centos6.5似乎无法运行，需要升级yum update，6.7-6.9可以。uname -a;cat /etc/redhat-release

~~~
#切换源，安装epel
sudo mv /etc/yum.repos.d/CentOS-Base.repo /etc/yum.repos.d/CentOS-Base.repo.backup
sudo wget -O /etc/yum.repos.d/CentOS-Base.repo http://mirrors.aliyun.com/repo/Centos-6.repo
sudo wget -O /etc/yum.repos.d/epel.repo http://mirrors.aliyun.com/repo/epel-6.repo
sudo yum install docker-io -y
sudo service docker start
sudo service docker status
sudo docker images
#检查自启动
sudo chkconfig|grep docker
sudo chkconfig docker on
#免sudo
sudo groupadd docker
sudo gpasswd -a ${USER} docker
sudo service docker restart
#退出登录，重新登录后生效

#加速器
sudo vim /etc/sysconfig/docker

other_args="--registry-mirror=https://ng0d7s68.mirror.aliyuncs.com --graph=/usr/local/docker"
~~~
