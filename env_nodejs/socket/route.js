var tool = require('../lib/tool');
var mysql = require('../lib/mysql');

exports.addRoute = function (data) {

    var json = {}, buf = data.buf;
    //console.log('addRoute', data);
    json.ip_port = data.ip_port;
    var gi = 1;
    var gateway_no = (buf[gi + 1] << 8 | buf[gi + 2]) << 8 | buf[gi + 3];//网关id
    json.gateway_no = tool.pad(buf[gi], 3) + tool.pad(gateway_no, 8);//前缀补0

    var r1i = 5;
    var relay1_no = (buf[r1i + 1] << 8 | buf[r1i + 2]) << 8 | buf[r1i + 3];//一级中继id
    json.relay1_no = tool.pad(buf[r1i], 3) + tool.pad(relay1_no, 8);//前缀补0

    var r2i = 9;
    var relay2_no = (buf[r2i + 1] << 8 | buf[r2i + 2]) << 8 | buf[r2i + 3];//二级中继id
    json.relay2_no = tool.pad(buf[r2i], 3) + tool.pad(relay2_no, 8);//前缀补0

    var r3i = 13;
    var relay3_no = (buf[r3i + 1] << 8 | buf[r3i + 2]) << 8 | buf[r3i + 3];//三级中继id
    json.relay3_no = tool.pad(buf[r3i], 3) + tool.pad(relay3_no, 8);//前缀补0

    var si = 17;
    var sensor_no = (buf[si + 1] << 8 | buf[si + 2]) << 8 | buf[si + 3];//终端id
    json.sensor_no = tool.pad(buf[si], 3) + tool.pad(sensor_no, 8);//前缀补0

    json.raw_data = buf.toString('hex');
    json.server_time = parseInt(data.time / 1000);

    // console.log(json);

    save(json);
};


function save(json) {

    mysql.query("insert into _data_route set ?", json, function (err) {
        if (err) {
            console.error(this.sql, err);
        }
        require('./redis').addRoute(json);
    });
}