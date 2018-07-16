var tool = require('../lib/tool');
var config = require('../config');
var redis = require('./redis');
var send_down = require('./send_down');

var sensorFrame = {};

exports.addSensor = function (data) {
    var buf = data.buf;
    data.raw_data = buf.toString('hex');
    data.frame_num = buf[3];//帧序号
    data.version = buf.toString('hex', 4, 5);//通讯协议版本编号

    var rk = 5;
    var receive_no = (buf[rk + 1] << 8 | buf[rk + 2]) << 8 | buf[rk + 3];//接收端ID唯一编号
    receive_no = tool.pad(buf[rk], 3) + '' + tool.pad(receive_no, 8);//前缀补0

    var sk = 9;
    var sensor_no = (buf[sk + 1] << 8 | buf[sk + 2]) << 8 | buf[sk + 3];//发送端设备唯一编号
    data.sensor_tip = tool.pad(buf[sk], 3);
    data.sensor_no = data.sensor_tip + '' + tool.pad(sensor_no, 8);//前缀补0

    data.instruct = buf.toString('hex', 13, 14);//指令

    if (!tool._.contains(config.versons, data.version)) {//检查协议版本不存在
        send_down.noFindVersion(data);
        return;
    }
    if (receive_no !== '00000000000') {//非服务器接收
        send_down.receiveNoError(data);
        return;
    }

    data.repeat = 0;

    var buf_str = buf.toString('hex');
    if (sensorFrame[data.sensor_no]) {
        if (sensorFrame[data.sensor_no].buf_str === buf_str) {
            console.log('repeat frame', buf_str);
            redis.addRepeat(buf, data.ip_port, data.time);
            data.repeat = 1;
        }
    }

    sensorFrame[data.sensor_no] = {buf_str: buf_str};

    require('./timeout').checkSensorTimeOut(data);//检查设备超时无数据上传

    if (data.repeat === 1) {//重复帧不处理
        send_down.querySendDown(data);//查询下发数据
        return;
    }

    // console.log('sensor_no', data.sensor_no);

    data.data_buf = buf.slice(13, buf.length - 2);//截取数据段
    //console.log('data_buf', data.data_buf.toString('hex'));

    if (!tool._.contains(config.instructs, data.instruct)) {//检查指令不存在
        console.warn('no find instruct', data.instruct, data.raw_data);
        return;
    }

    var handle = require('./' + data.version + '/' + data.instruct);

    handle.addData(data, function () {
        send_down.querySendDown(data, function () {
            var time = new Date().getTime() - data.time;
            console.log('sensor_' + data.sensor_no + '_end:' + time + 'ms');
        });//查询下发数据
    });//处理指令函数


};