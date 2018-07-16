env_nodejs
=====

node run

# 生成评估报告

使用docker,具体查看 web/report/README.md

# apache代理nodejs

~~~
# httpd.conf
LoadModule proxy_module modules/mod_proxy.so
LoadModule proxy_http_module modules/mod_proxy_http.so
LoadModule proxy_wstunnel_module modules/mod_proxy_wstunnel.so #默认没有，添加

# 末尾加上
ProxyPass /8020/ http://ip:8020/
ProxyPassReverse /8020/ http://ip:8020/
#重启apache 即可访问/8020/,必须带最后的/
~~~


## v2.0.13 @2017-04-24

### 新增

    解析土壤含盐量

------------------

安装说明

1.安装nodejs >=4.0, /usr/local/ampps/nodejs/bin/node
软链
~~~
sudo ln -s /usr/local/ampps/nodejs/bin/node /usr/bin
sudo ln -s /usr/local/ampps/nodejs/bin/npm /usr/bin
~~~

2.安装依赖

~~~bash
npm i -d
~~~

3.编辑配置museum.ini

或将文件移动到上层或/usr/local/ampps/php/etc/php.d/museum.ini


4.启动

注意赋予执行权限

~~~bash
cd bin/
chmod +x *
~~~

~~~bash
sudo ./start.sh
~~~


5.停止

~~~bash
sudo ./stop.sh
~~~