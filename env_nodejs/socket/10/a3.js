//读取：校正系数：[1/参数编号]，[1/校准系数编号]，[4/系数值？]


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
        var xno = data.data_buf[2];
        var val = data.data_buf.readFloatBE(3).toFixed(2);
        json.feedback_data = {参数编号: no, 校准系数编号: xno, 系数值: val};
        
    } catch (e) {
        console.error(e);
    }

    //console.log(json);

    require('./index').feedback_save(json,callback);

};
