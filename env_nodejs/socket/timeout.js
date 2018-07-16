var tool = require('../lib/tool');
var config = require('../config');
var redis = require('./redis');
var mysql = require('../lib/mysql');

exports.checkSensorTimeOut = function (data) {

    redis.timeoutConnect(data.sensor_no, parseInt(data.time/1000));
    connect(data);
};


setInterval(function () {

    redis.timeoutAll(function (list) {
        tool._.each(list, function (prev_time, sensor_no) {
            var now_time = tool.time();
            var time_out = config.sensor_timeout;
            var sensor_tip = sensor_no.slice(0, 3);
            if (sensor_tip == '003' || sensor_tip == '004') {//中继/网关25小时
                time_out = 25 * 60 * 60;
            }
            if (now_time - prev_time > time_out) {
                timeout(sensor_no, prev_time, now_time);
                redis.timeoutDisconnect(sensor_no);
            }
        });
    });

}, 10000);

function timeout(sensor_no, prev_time, out_time) {

    var json = {
        sensor_no: sensor_no,
        now_time: tool.time(),
        out_time: out_time,
        prev_time: prev_time
    };

    mysql.query("insert into _data_sensor_timeout set ?", json, function (err) {
        if (err) {
            console.error(this.sql,err);
            return;
        }
        console.log(sensor_no + ' timeout ');
        redis.sendToRoom('sensor', 'sensor_timeout', '');
    });

}

var sensorCache = {};

function connect(data) {
    data.lost_frame = 0;
    data.lost = 0;
    var now_time = tool.time();

    if (sensorCache[data.sensor_no]) {
        if (data.frame_num == 0) {
            if (sensorCache[data.sensor_no].frame != 0xff) {
                data.lost_frame = 1;
            }
        } else if (data.frame_num != sensorCache[data.sensor_no].frame + 1) {
            data.lost_frame = 1;
        }

        if (now_time - sensorCache[data.sensor_no].time > config.sensor_timeout) {
            data.lost = 1;
        }

    }

    sensorCache[data.sensor_no] = {frame: data.frame_num, time: now_time};

    var json = {
        sensor_no: data.sensor_no,
        connect_time: new Date().getTime(),
        ip_port: data.ip_port,
        repeat: data.repeat,
        lost_frame: data.lost_frame,
        lost: data.lost
    };
    json.raw_data = data.buf.toString('hex');

    mysql.query("insert into _data_sensor_connect set ?", json, function (err) {
        if (err) {
            console.error(this.sql,err);
            return;
        }
        redis.sendToRoom('sensor', 'sensor_connect', '');
    });

}

exports.gateway_disconnect = function (conn) {
    var json = {};
    json.ip_port = conn.ip_port;
    json.connect_time = conn.connect_time;
    json.disconnect_time = tool.datetime();
    json.status = conn.connect_status;
    json.gateway_no = conn.gateway_no;

    mysql.query('insert into _data_gateway_disconnect set ?', json, function (err) {
        if (err) {
            console.error(this.sql,err);
        }
    });
};