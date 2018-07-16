var net = require('net');
var tool = require('../lib/tool');
var config = require('../config');
var redis = require('./redis');
var dataparser = require('./dataparser');

var connects = {};

var client;

function client_pipe() {

    client = net.connect({port: config.forward_port, host: config.forward_host || '127.0.0.1'}, function () {

    });
    client.on('end', function () {
        client_pipe();
    });

}

if (config['forward_port']) {
    client_pipe();
}

exports.start = function () {

    var server = net.createServer(function (conn) {
        conn.ip_port = conn.remoteAddress + ':' + conn.remotePort;
        conn.connect_time = tool.datetime();
        conn.gateway_no = '';

        connects[conn.ip_port] = conn;

        console.log('CONNECTED: ' + conn.ip_port);

        var parseData = new dataparser(conn);

        redis.connect(conn.ip_port);

        conn.last_time = new Date().getTime();

        conn.on('data', function (buf) {
            conn.last_time = new Date().getTime();
            console.log(conn.ip_port + ' receive socket data:', tool.hexToString(buf));
            parseData.add(buf, conn.last_time);//解包

            redis.addBySocketAll(buf, conn.ip_port, conn.last_time);

            if (client) {
                client.write(buf);
            }

        });

        conn.on('sensor', function (buf, time) {
            console.log('sensor:', tool.hexToString(buf));
            var data = {buf: buf, time: time, ip_port: conn.ip_port};
            data.crc = checkCrc('sensor', data);
            redis.addBySocket(data);
            if (data.crc) {
                require('./sensor').addSensor(data);
            }
            redis.addReceiveNum(data.ip_port);

        });

        conn.on('route', function (buf, time) {
            console.log('route:', tool.hexToString(buf));
            var data = {buf: buf, time: time, ip_port: conn.ip_port};
            data.crc = checkCrc('route', data);
            redis.addBySocket(data);
            if (data.crc) {
                require('./route').addRoute(data);
                conn.gateway_no = getGatewayNo(buf);
                redis.set_gateway_no(conn.ip_port, conn.gateway_no);
            }
        });

        conn.on('heartbeat', function (buf, time) {
            console.log('heartbeat:', tool.hexToString(buf));
            var data = {buf: buf, time: time, ip_port: conn.ip_port};
            data.crc = checkCrc('heartbeat', data);
            redis.addBySocket(data);
            if (data.crc) {
                conn.emit('send_down', buf);
                conn.gateway_no = getGatewayNo(buf);
                redis.set_gateway_no(conn.ip_port, conn.gateway_no);
            }
        });

        conn.on('send_down', function (buf) {
            var data = {buf: buf, ip_port: 'To-' + conn.ip_port, time: new Date().getTime()};
            redis.addBySocket(data);
            redis.addBySocketAll(data.buf, data.ip_port, data.time);
            conn.write(buf);
            console.log('To-' + conn.ip_port, tool.hexToString(buf));
        });

        conn.on('close', function () {
            console.log('DISCONNECTED', conn.ip_port);
            redis.disconnect(conn.ip_port);
            require('./timeout').gateway_disconnect(conn);
            delete connects[conn.ip_port];
        });

        conn.connect_status = '正常断开';

        conn.on('error', function (err) {
            console.error(conn.ip_port, err);
            conn.connect_status = '异常断开';
            conn.destroy();
        });

        conn.setTimeout(config.gateway_timeout * 1000, function () {
            console.log(conn.ip_port + ' timeout');
            conn.connect_status = config.gateway_timeout + 's超时断开';
            conn.destroy();
        });

    });

    server.listen(config.net_port, function () {
        console.log("tcp socket listen on port " + config.net_port);
    });

};

//指定给某个连接发
exports.sendToOne = function (data) {

    if (!data || !data['ip_port'] || !connects[data['ip_port']]) {
        console.log('sendToOne fail', data);
        return false;
    }
    var buf = packDataToBuf(data);
    if (buf && connects[data.ip_port]) {
        connects[data.ip_port].emit('send_down', buf);
    }

    return buf;
};

//给所有人发
exports.sendToAll = function (data) {

    var buf = packDataToBuf(data);

    if (buf) {
        for (var i in connects) {
            connects[i].emit('send_down', buf);
        }
    }

    return buf;

};

//组装数据帧
function packDataToBuf(data) {//{data_buf,frame_num,receive_no}

    if (!data['receive_no']) {
        return false;
    }

    var databuf = new Buffer(data.data_buf);
    var size = databuf.length + 15;
    var buf = new Buffer(size);
    buf[0] = 0x55;
    buf[1] = 0xaa;
    buf[2] = size;//帧长
    buf[3] = data.frame_num;//帧序
    buf[4] = 0x10;//版本

    var pre = parseInt(data.receive_no.slice(0, 3));
    var jid = parseInt(data.receive_no.slice(3));

    var jidhex = tool.toHex(pre, 2) + tool.toHex(jid, 6);
    //console.log(data.receive_no, pre, jid, jidhex);

    buf.write(jidhex, 5, 4, 'hex');//接收端
    buf.write('00000000', 9, 4, 'hex');//发出端

    databuf.copy(buf, 13);

    var crcbuf = tool.crc16(buf, size - 2);
    buf.write(crcbuf, buf.length - 2, 2, 'hex');
    return buf;
}

exports.killOne = function (ip_port) {
    if (connects[ip_port]) {
        console.log('kill ' + ip_port);
        connects[ip_port].destroy();
    }
};

function checkCrc(type, data) {
    var buf = data.buf;
    data.crc = true;
    if (type === 'route' && buf.length === 22) {

    } else if (type === 'heartbeat' && buf.length === 7) {

    } else {
        var crc_str = buf.toString('hex', buf.length - 2);//获取crc校验码
        var crc_buf_str = tool.crc16(buf, buf.length - 2);//计算crc校验码
        data.crc = (crc_str === crc_buf_str);
    }

    if (data.crc === false) {
        console.error('check crc-16 error', tool.hexToString(buf), crc_buf_str);
        if (type === 'sensor') {
            var sk = 9;
            var send_no = (buf[sk + 1] << 8 | buf[sk + 2]) << 8 | buf[sk + 3];//发送端设备唯一编号
            data.sensor_tip = tool.pad(buf[sk], 3);
            data.sensor_no = data.sensor_tip + '' + tool.pad(send_no, 8);//前缀补0
            data.frame_num = buf[3];//帧序号

            require('./send_down').crcError(data);
        }
    }

    return data.crc;
}

exports.sendHex = function (json) {

    if (json['ip_port'] && json['hex']) {
        var buf = new Buffer(json.hex, 'hex');
        if (connects[json.ip_port]) {
            connects[json.ip_port].emit('send_down', buf);
        }
    }
};


function getGatewayNo(buf) {

    var gi = 1;
    var gateway_no = (buf[gi + 1] << 8 | buf[gi + 2]) << 8 | buf[gi + 3];//网关id
    return tool.pad(buf[gi], 3) + tool.pad(gateway_no, 8);//前缀补0
}