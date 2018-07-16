// 设备主动上传参数：[4/采集时间][1/参数总数][1/参数编号1][4/参数值1][1/参数编号2][4/参数值2]*；

var tool = require('../../lib/tool');
var mysql = require('../../lib/mysql');
var params = require('../../params');
var _ = tool._;

exports.addData = function (data, callback) {

    var json = {};

    json.sensor_no = data.sensor_no;
    json.ip_port = data.ip_port;
    json.equip_time = data.data_buf.readUInt32BE(1);

    json.raw_data = data.raw_data;
    json.server_time = parseInt(data.time / 1000);

    //设备时间大于服务器时间
    //|| json.equip_time < tool.time('2015-01-01 00:00:00')
    // if (json.equip_time > json.server_time) {
    //     json.equip_time = json.server_time;
    // }

    json.param = {};

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
                    if (j < params_buf.length - 3) {
                        val = params_buf.readFloatBE(j + 1);
                    }
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
                if (val == '0.0' || val == '0.00') {
                    val = 0;
                }
            }
        } catch (e) {
            console.error(e);
            break;
        }
        // console.log(param.en, val, tool._.isNaN(val));
        if ((val && val !== Infinity && val !== 'Infinity' && val !== 'NaN') || val === 0) {
            // console.log(param.en, val);
            if (json.param[param.en]) {
                if (tool._.isArray(json.param[param.en])) {
                    json.param[param.en].push(val);
                } else {
                    json.param[param.en] = [json.param[param.en], val];
                }
            } else {
                json.param[param.en] = val;
            }
        }

        j += ji;

    }

    if (data.sensor_tip === '003' || data.sensor_tip === '004') {//网关中继移除其他信息
        var rep_param = {};
        if (_.has(json.param, 'voltage')) {
            rep_param.voltage = json.param.voltage;
        }
        if (_.has(json.param, 'rssi')) {
            rep_param.rssi = json.param.rssi;
        }
        json.param = rep_param;
    }

    if (data.sensor_tip === '015') {//土壤
        var soil_conductivity = json.param.soil_conductivity * 1;
        json.param.soil_salt = (get_soil_salt(soil_conductivity) * soil_conductivity).toFixed(1);
    }

    if (data.sensor_tip === '017') {//震动
        json.equip_time = json.server_time;
        vibration_save(json, callback);
        return;
    }

    console.log(json);

    save(json, callback);

};

function save(json, callback) {

    var row = {};
    row.equip_no = json.sensor_no;
    row.equip_time = json.equip_time;
    row.server_time = json.server_time;
    row.raw_data = json.raw_data;
    row.ip_port = json.ip_port;
    row.php_time = tool.time();

    tool._.each(json.param, function (v, k) {
        row[k] = v;
    });
    row.status = 1;

    mysql.query("insert into _data_sensor set ?", row, function (err, result) {
        if (err) {
            console.error(err);
        }
        json.id = result.insertId;
        if (tool._.isEmpty(json.param) || row.equip_time > json.server_time + 3600) {
            console.warn('php not handle, param is {} or equip_time>server_time+3600');
            callback && callback();
            return;
        }
        require('../redis').addSensor(json);

        callback && callback();
    });
}


function get_soil_salt(soil_conductivity) {
    var salt = 0;
    if (soil_conductivity > 0 && soil_conductivity < 1.0) {
        salt = 0.275;
    } else if (soil_conductivity >= 1.0 && soil_conductivity < 1.5) {
        salt = 0.295;
    } else if (soil_conductivity >= 1.5 && soil_conductivity < 2.0) {
        salt = 0.31;
    } else if (soil_conductivity >= 2.0 && soil_conductivity < 5.0) {
        salt = 0.3325;
    } else if (soil_conductivity >= 5.0 && soil_conductivity < 10.0) {
        salt = 0.35875;
    } else if (soil_conductivity >= 10.0 && soil_conductivity < 50.0) {
        salt = 0.405;
    } else if (soil_conductivity >= 50.0 && soil_conductivity < 100.0) {
        salt = 0.45625;
    } else if (soil_conductivity >= 100.0 && soil_conductivity < 500.0) {
        salt = 0.5175;
    } else if (soil_conductivity >= 500.0 && soil_conductivity < 1000.0) {
        salt = 0.58;
    } else if (soil_conductivity >= 1000.0 && soil_conductivity < 1500.0) {
        salt = 0.61375;
    } else if (soil_conductivity >= 1500.0 && soil_conductivity < 2000.0) {
        salt = 0.6375;
    } else if (soil_conductivity >= 2000.0 && soil_conductivity < 3000.0) {
        salt = 0.66125;
    } else if (soil_conductivity >= 3000.0 && soil_conductivity < 5000.0) {
        salt = 0.695;
    } else if (soil_conductivity >= 5000.0) {
        salt = 0.74125;
    }

    return salt;
}

function vibration_save(json, callback) {

    var row = {};
    row.equip_no = json.sensor_no;
    row.equip_time = json.equip_time;
    row.server_time = json.server_time;
    row.raw_data = json.raw_data;
    row.ip_port = json.ip_port;
    row.accel = json.param.accel;
    row.speed = json.param.speed;
    row.displacement = json.param.displacement;
    row.voltage = json.param.voltage;
    row.rssi = json.param.rssi;

    mysql.query("insert into data_sensor_vibration set ?", row, function (err) {
        if (err) {
            console.error(err);
        }
        callback && callback();
    });

}