docker
=============

# windows安装docker

- 在BIOS开启cpu虚拟化.可以安装64位虚拟机.
- 下载最新的[DockerToolbox-17.10.0-ce.exe](https://mirrors.aliyun.com/docker-toolbox/windows/docker-toolbox/)
- 打开桌面的Docker Quickstart Terminal,自动创建default虚拟主机,进入docker环境。default为virtualbox虚拟机名称.一切docker的操作都是在default虚拟主机里面.

## 离线创建default

下载最新的boot2docker可能失败,可以先断开网络,复制boot2docker.iso 到目录 C:\Users\\{USER}\\.docker\machine\cache,再重新打开Docker Quickstart Terminal,创建default,进入docker环境.

## 移动.docker目录

先新建系统环境变量MACHINE_STORAGE_PATH=f:\\.docker
再重新打开Docker Quickstart Terminal,或手动创建default.

~~~
docker-machine ls								#查看所有docker虚拟主机
docker-machine create -d virtualbox default     #创建default虚拟主机
docker-machine rm default                       #删除default虚拟主机
docker-machine start default                    #启动default虚拟主机,default可以省略
docker-machine stop default                     #停用default虚拟主机,default可以省略
docker-machine ssh default                      #进入default虚拟主机,default可以省略
~~~

## 选择加速器

docker官方可能很慢，可以选择各种加速器，如[阿里云加速器](https://cr.console.aliyun.com/#/accelerator)获取你的加速器地址。

先停止default,修改.docker\machines\default\config.js,

找到RegistryMirror,加入你的加速器地址,再启动default.

~~~
"RegistryMirror": [
    "https://ng0d7s68.mirror.aliyuncs.com"
],
~~~

## 文件、端口映射

一切docker都是在default虚拟机下面的，要映射真实主机的文件和端口，必须打开virtualbox管理器，停止default,设置网络-高级-端口转发，共享文件夹-固定分配指定路径到default的根目录下

# centos 6.9安装docker

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
~~~

## 加速器 

~~~
sudo vim /etc/sysconfig/docker

other_args="--registry-mirror=https://ng0d7s68.mirror.aliyuncs.com --graph=/usr/local/docker"
~~~
如根目录/空间不足,先建立目录/usr/local/docker,修改镜像容器位置(默认/var/lib/docker,可以删除).

如出现docker dead but subsys locked,检查/var/logs/docker,sudo docker -d启动看看.可能是配置错误/etc/sysconfig/docker里面的other_args

# docker 基本命令

~~~
docker info					#查看docker信息
docker images 		    	#列出所有镜像(images)
docker ps 			    	#列出正在运行的容器(containers)
docker ps -a		    	#列出所有容器(containers)
docker pull ubuntu 	    	#拉取镜像
docker search ubuntu    	#查找镜像,OFFICIAL列为[OK]的为官方镜像.
docker run -it ubuntu /bin/bash 	#加载镜像,进入容器,-d后台运行
docker stop 3f8ac 			#停止容器，3f8ac为容器id,可以不输完.
docker rmi ubuntu			#移除镜像
docker rm 3f8ac 			#删除容器
docker rm $(docker ps -aq)	#删除所有容器
~~~


# 下载镜像

docker pull lb1104/nodejs-canvas-echarts



