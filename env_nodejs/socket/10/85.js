//读取：位置编号：[4/读取时间]，[8/馆内区域编号值？]


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

        var area_no = (data.data_buf[1] << 8 | data.data_buf[2]) << 8 | data.data_buf[3];//馆内区域编号值
        area_no = tool.pad(area_no, 7);//前缀补0
        json.feedback_data = {馆内区域编号值: area_no};

    } catch (e) {
        console.error(e);
    }

    //console.log(json);

    require('./index').feedback_save(json,callback);

};
