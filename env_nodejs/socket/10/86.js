//读取：设备工作参数：[1/参数编号0x01][4/工作电压][1/参数编号0x02][2/RSSI值]


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
        
        var el = data.data_buf[1];
        var rssi = data.data_buf[6];
        if (el === 1) {
            el = data.data_buf.readFloatBE(2).toFixed(2);
        }
        if (rssi === 2) {
            rssi = data.data_buf.readInt16BE(7);
        }

        json.feedback_data = {工作电压: el, RSSI: rssi};
        
    } catch (e) {
        console.error(e);
    }

    //console.log(json);

    require('./index').feedback_save(json,callback);

};

