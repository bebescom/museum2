//设置：预警范围：[1/参数编号]，[4/最小值]，[4/最大值]


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
        json.feedback_data = {参数编号: no};
        json.feedback_data.最小值 = data.data_buf.readFloatBE(2).toFixed(2);
        json.feedback_data.最大值 = data.data_buf.readFloatBE(6).toFixed(2);

        
    } catch (e) {
        console.error(e);
    }

    //console.log(json);

    require('./index').feedback_save(json,callback);

};
