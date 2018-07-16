#!/bin/bash
basepath=$(cd `dirname $0`;cd ..; pwd)
basename=$(basename $basepath)

kill -9 `ps ax|grep $basename|awk '{print $1}'`
echo $basepath" stop"
ps aux|grep $basepath