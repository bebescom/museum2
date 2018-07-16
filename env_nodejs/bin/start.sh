#!/bin/bash
basepath=$(cd `dirname $0`;cd ..; pwd)
nodepath=$(which node)


if [ "$nodepath" == "" ]
 then
 	nodepath=/usr/local/ampps/nodejs/bin/node
fi

#echo $basepath
#echo $nodepath

nohup $nodepath $basepath/run.js >/dev/null 2>&1 &
echo $basepath" start"
ps aux|grep $basepath