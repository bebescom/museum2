//读取：设备编号：[3/馆内设备编号值？]

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

        var device_no = (data.data_buf[2] << 8 | data.data_buf[3]) << 8 | data.data_buf[4];//馆内设备编号值
        device_no = tool.pad(data.data_buf[1], 3) + '' + tool.pad(device_no, 8);//前缀补0

        json.feedback_data = {馆内设备编号值: device_no};

    } catch (e) {
        console.error(e);
    }

    //console.log(json);

    require('./index').feedback_save(json,callback);

};