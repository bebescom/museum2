//读取：调控内部参数：[1/调控参数编号][1/调控系数总数？]

var tool = require('../../lib/tool');

exports.addData = function (data, callback) {

    var json = {};
    try {
        json.instruct = data.instruct;
        json.sensor_no = data.sensor_no;
        json.ip_port = data.ip_port;
        json.status = 3;
        json.feedback_time = parseInt(data.time/1000);
        json.raw_data = data.raw_data;

        var no = data.data_buf[1];
        var total = data.data_buf[2];
        json.feedback_data = {调控参数编号: no, 调控系数总数: total};

    } catch (e) {
        console.error(e);
    }

    //console.log(json);

    require('./index').feedback_save(json, callback);

};
