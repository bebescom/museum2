var tool = require('../lib/tool');
//var mongodb = require('../lib/mongodb');
var config = require('../config');
var API = require('../lib/api');

    var net = require('net');

    if (process.argv[2] == 'app') {
        require('../lib/logs').nolog();
        startWeather();
    } else {
        require('../lib/logs').filelog('weather');
        startServer();
    }

    function loginfo(str) {

        console.log("[32m(" + process.pid + ")" + tool.datetime('Y-m-d H:i:s.u') + " INFO[39m " + str);
    }

    function startServer() {
        loginfo('start Server');

        var child_process = require('child_process');
        var server = child_process.spawn(process.execPath, [__filename, 'app']);
        server.stdout.on('data', function (data) {
            console.log(data.toString());
        });
        server.stderr.on('data', function (data) {
            console.error(data.toString());
        });
    server.on('error', function (err) {
        console.error(err);
    });
    server.on('exit', function (code, signal) {
        loginfo(server.pid + ' Server exit code:' + code);
        server.kill(signal);
        setTimeout(function () {
            startServer();
        }, 5000);

    });
}

function startWeather() {

    envForEach();
    setInterval(envForEach, config.weatherEnvQueryTime * 1000);

}

function envForEach() {

    API('get/env/common/weather_station',"",function(err,rows){
        if(err){
            console.error(err);
            return;
        }
        rows = eval(rows);
        if(rows.length == 0){
            return;
        }
        rows.forEach(getSensor);
    });
}

var intervals = {};

var sensorInstruct = new Buffer([0x01, 0x03, 0x00, 0x00, 0x00, 0x10, 0x44, 0x06]);
//01 03 00 00 00 10 44 06
function getSensor(env) {

    if (intervals[env.ip]) {
        return;
    }

    var port = env['port'] || 51000;

    var client = net.connect({host: env.ip, port: port}, function () {
        console.log(env.ip + ' connected');

        client.emit('send', sensorInstruct);
        intervals[env.ip] = setInterval(function () {
            client.emit('send', sensorInstruct);
        }, config.weatherSensorTime * 1000);

        client.setTimeout(600 * 1000, function () {
            console.log(env.ip + ' timeout');
            client.destroy();
        });

    });

    client.on('data', function (data) {
        console.log('receive:', data);
        addSensor(data, env, tool.time());
    });

    client.on('send', function (buf) {
        console.log('send:', buf);
        client.write(buf);
    });

    client.on('close', function () {
        console.log(env.ip + ' disconnected');
        clearInterval(intervals[env.ip]);
        delete intervals[env.ip];
    });

    client.on('error', function (err) {
        console.error(env.ip, err);
    });
}

var channelField = {
    湿度: {field: 'humidity', num: 0.1, unit: '%', range: '0%-100%'},
    雨量: {field: 'rain', num: 0.2, unit: 'mm', range: '0mm-100mm'},
    气温: {field: 'temperature', num: 0.1, unit: '℃', range: '-50℃-80℃'},
    二氧化碳: {field: 'co2', num: 1, unit: 'ppm', range: '0ppm-2000ppm'},
    紫外线: {field: 'uv', num: 1, unit: 'μw/cm²', range: '0μw/cm²-200μw/cm²'},
    风速: {field: 'wind_speed', num: 0.1, unit: 'm/s', range: '0m/s-60m/s'},
    风向: {field: 'wind_direction', num: 1, unit: '°', range: '0°-359°'},
    粉尘: {field: 'pm10', num: 1, unit: 'ug/m3', range: '0ug/m3-500ug/m3'},
    气压: {field: 'air_presure', num: 1, unit: 'hpa', range: '0hpa-1250hpa'},
    照度: {field: 'light', num: 10, unit: 'lx', range: '0lx-200000lx'}
};

var channelId = {
    'channel1': '湿度',
    'channel2': '雨量',
    'channel9': '气温',
    'channel10': '二氧化碳',
    'channel11': '紫外线',
    'channel12': '风速',
    'channel13': '风向',
    'channel14': '粉尘',
    'channel15': '气压',
    'channel16': '照度'
};

function addSensor(buf, env, time) {


    if (buf.length == 38 && buf[0] == 0x01 && buf[1] == 0x03) {
        var crcstr = buf.toString('hex', buf.length - 2);//获取crc校验码
        var crcbufstr = crc16(buf, buf.length - 2);//计算crc校验码
        //console.log(crcstr, crcbufstr);
        if (crcstr != crcbufstr) {
            console.log('crc-16 error', crcbufstr);
            return;
        }
        var data = {
            equip_time: time,
            server_time:time,
            ip_port: env.ip,
            sensor_no: env.weather_no.substr(8),
            raw_data:buf.toString()
        };
        data.param = {};
        var id = 1;
        for (var i = 0; i < 32;) {
            if (!env['channel' + id] && channelId['channel' + id]) {
                env['channel' + id] = channelId['channel' + id];
            }
            var channel = channelField[env['channel' + id]];

            if (env['channel' + id] && channel) {
                var val;
                if (buf[4 + i] == 0x7f && buf[4 + i + 1] == 0xff) {
                    val='';
                }else{
                    val = buf.readUInt16BE(4 + i);
                    val = parseFloat(channel.num * val);
                    val = val.toFixed(channel.num < 1 ? 1 : 0);
                }

                data.param[channel['field']] = val;
            }

            i = i + 2;
            id++;
        }
        //console.log(data);
        API('post/env/datas/data_sensor', data);

    }


}

function crc16(buf, length) {
    var crc = require('crc'), crcval;
    length = length || buf.length;
    if (buf.length > length) {
        buf = buf.slice(0, length);
    }
    //console.log(buf);
    //crcval = crc.buffer.crc16(buf);//CRC-CCITT (XModem) 0x1021
    //crcval=crc.crcArc(buf.toString());//CRC-16 0x8005
    crcval = crc.crc16modbus(buf);//CRC-16 Modbus
//    console.log(crcval.toString(16));
    crcval = (crcval << 8) & 0xff00 | (crcval >> 8) & 0x00ff;//低位在前
    crcval = tool.toHex(crcval, 4);
    return crcval;
}