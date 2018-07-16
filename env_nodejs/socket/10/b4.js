//读取：调控内部参数表：[1/调控参数编号]，[1/调控系数序号][4/调控值？]

var tool = require('../../lib/tool');

exports.addData = function (data,callback) {

    var json = {};
    try {
        json.instruct = data.instruct;
        json.sensor_no = data.sensor_no;
        json.ip_port = data.ip_port;
        json.status = 3;
        json.feedback_time = parseInt(data.time/1000);
        json.raw_data = data.raw_data;

        var no = data.data_buf[1];
        var num = data.data_buf[2];
        var val = data.data_buf.readFloatBE(3).toFixed(2);
        json.feedback_data = {调控参数编号: no, 调控系数序号: num, 调控值: val};

    } catch (e) {
        console.error(e);
    }

    //console.log(json);

    require('./index').feedback_save(json,callback);

};