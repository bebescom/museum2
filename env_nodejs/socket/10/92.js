//读取：采集参数：[4/采集时间？][1/参数总数],[1/参数编号]，[4/参数值？]；……[1/参数编号]，[4/参数值？]


var tool = require('../../lib/tool');
var params = require('../../params');

exports.addData = function (data,callback) {

    var json = {};

    json.instruct = data.instruct;
    json.sensor_no = data.sensor_no;
    json.ip_port = data.ip_port;
    json.status = 3;
    json.feedback_time = parseInt(data.time/1000);
    json.raw_data = data.raw_data;

    json.equip_time = data.data_buf.readUInt32BE(1);

    json.feedback_data = {采集时间: tool.date('Y-m-d H:i:s', json.equip_time * 1000)};

    json.feedback_data.param = {};

    var params_buf = data.data_buf.slice(6);

    var param, val;

    for (var j = 0; j <= params_buf.length;) {
        val = 0;
        if (!params.params[params_buf[j]]) {
            break;
        }
        param = params.params[params_buf[j]];
        var ji = 5;
        try {
            switch (param.ty) {
                case 'float':
                    val = params_buf.readFloatBE(j + 1);
                    break;
                case 'int32':
                    val = params_buf.readUInt32LE(j + 1);
                    break;
                case 'float.round':
                    val = Math.round(params_buf.readFloatBE(j + 1));
                    break;
                case 'int16':
                    val = params_buf.readInt16BE(j + 1);
                    ji = 3;
                    break;
                case 'int8':
                    val = params_buf.readUInt8(j + 1);
                    ji = 2;
                    break;
            }
            switch (param.special) {
                case '>0':
                    if (val < 0) {
                        val = 0;
                    }
                    break;
                case '1667':
                    if (val != 0) {
                        val = 16777215 * 100000000 / val;
                    }
                    break;
            }
            if (param['decimal'] !== null) {
                val = val.toFixed(param.decimal);
            }
        } catch (e) {
            console.error(e);
            break;
        }

        if (json.feedback_data.param[param.en]) {
            if (tool._.isArray(json.feedback_data.param[param.en])) {
                json.feedback_data.param[param.en].push(val);
            } else {
                json.feedback_data.param[param.en] = [json.feedback_data.param[param.en], val];
            }
        } else {
            json.feedback_data.param[param.en] = val;
        }

        j += ji;

    }

    //console.log(json);

    require('./index').feedback_save(json,callback);

};
