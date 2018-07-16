#!/bin/sh
# toolbox 设置virtualBox共享文件夹路径d盘，共享文件夹名称为d

fold_path=$(cd `dirname $0`; pwd)
#echo $fold_path

report_id=$1  #带参数1

docker_run="docker run -v $fold_path:/work --privileged --rm lb1104/nodejs-canvas-echarts node --max-old-space-size=4096 /work/test.js $report_id"

dockerpath=$(which docker)

if [ "$dockerpath" == "" ]; then
    node --max-old-space-size=4096 $fold_path/test.js $report_id
else
    docker_info=`docker info 2>&1`
    # 判断是否在docker环境下
    if [ $? -ne 0 ]; then
    	docker-machine start
    	docker-machine ssh default "$docker_run"
    else
    	$docker_run
    fi
fi

