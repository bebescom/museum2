//读取：工作模式：[4/读取时间]，[1/模式值？]

var tool = require('../../lib/tool');

var cycles = ['休眠', '工作', '校准'];

exports.addData = function (data, callback) {
    var size = 5;

    var json = {};
    try {
        json.instruct = data.instruct;
        json.sensor_no = data.sensor_no;
        json.ip_port = data.ip_port;
        json.status = 3;
        json.feedback_time = parseInt(data.time/1000);
        json.raw_data = data.raw_data;
        
        var time = data.data_buf.readUInt32BE(1);
        var val = cycles[data.data_buf[5]];

        json.feedback_data = {读取时间: tool.date('Y-m-d H:i:s', time * 1000), 模式值: val};

    } catch (e) {
        console.error(e);
    }

    //console.log(json);

    require('./index').feedback_save(json,callback);

};
