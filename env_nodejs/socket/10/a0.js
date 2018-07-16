//读取：标定：[1/参数编号]，[1/目标值总数？]

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
        var val = data.data_buf[2];
        json.feedback_data = {参数编号: no, 目标值总数: val};

    } catch (e) {
        console.error(e);
    }

    //console.log(json);

    require('./index').feedback_save(json,callback);

};
