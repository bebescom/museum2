//读取：调控范围：[4/读取时间]，[1/调控参数编号]，[4/最大值？]，[4/最小值？]

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

        var time = data.data_buf.readUInt32BE(1);
        var val = data.data_buf[5];
        json.feedback_data = {读取时间: tool.date('Y-m-d H:i:s', time * 1000), 调控参数编号: val};
        json.feedback_data.最大值 = data.data_buf.readFloatBE(6).toFixed(2);
        json.feedback_data.最小值 = data.data_buf.readFloatBE(10).toFixed(2);

    } catch (e) {
        console.error(e);
    }

    //console.log(json);

    require('./index').feedback_save(json,callback);

};
