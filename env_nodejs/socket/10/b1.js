//读取：调控参数总数：[1/调控参数总数？]

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

        var val = data.data_buf[1];
        json.feedback_data = {调控参数总数: val};

    } catch (e) {
        console.error(e);
    }

    //console.log(json);

    require('./index').feedback_save(json,callback);

};
