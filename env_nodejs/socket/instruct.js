var tool = require('../lib/tool');
var params = require('../params');
var instruct = {};
var _ = tool._;
var param_arr = {};
_.each(params.params, function (row, key) {
    param_arr[row.en] = tool._.extend(row, {key: key});
});


instruct['01'] = function (send_data) {
    if (!send_data['model']) {
        return false;
    }
    var buf = new Buffer(2);
    buf[0] = 0x01;
    switch (send_data.model) {
        case '休眠':
            buf[1] = 0;
            break;
        case '工作':
            buf[1] = 1;
            break;
        case '校准':
            buf[1] = 2;
            break;
        case '复位':
            buf[1] = 0xff;
            break;
        default:
            return false;
            break;
    }
    return buf;
};

instruct['02'] = function (send_data) {
    if (!send_data['unit']) {
        return false;
    }
    var buf = new Buffer(2);
    buf[0] = 0x02;

    switch (send_data.unit) {
        case 'second':
            buf[1] = send_data.sleep_period * 1;
            break;
        case 'minute':
            buf[1] = send_data.sleep_period * 1 + 100;
            break;
        case 'hour':
            buf[1] = send_data.sleep_period * 1 + 200;
            break;
        default:
            return false;
            break;
    }
    return buf;
};

instruct['03'] = function (send_data) {

    var buf = new Buffer(5);
    buf[0] = 0x03;
    buf.writeUInt32BE(tool.time(), 1);
    return buf;
};

instruct['04'] = function (send_data) {
    var buf = new Buffer(5);
    buf[0] = 0x04;
    if (!send_data['equip_no']) {
        return false;
    }
    var tip = send_data.equip_no.slice(0, 3) * 1;
    var no = send_data.equip_no.slice(3) * 1;
    var hex = tool.toHex(tip, 2) + tool.toHex(no, 6);
    buf.write(hex, 1, 4, 'hex');

    return buf;
};
//
// instruct['05'] = function (send_data) {
//     var buf = new Buffer(9);
//     buf[0] = 0x05;
//     if (!send_data['area_no']) {
//         return false;
//     }
//     var tip = send_data.area_no.slice(0, 3) * 1;
//     var no = send_data.area_no.slice(3) * 1;
//     var hex = tool.toHex(tip, 2) + tool.toHex(no, 6);
//     buf.write(hex, 1, 4, 'hex');
//
//     return buf;
// };

instruct['10'] = function (send_data) {

    if (!_.has(send_data, 'range_param') || !_.has(send_data, 'range_value1')) {
        return false;
    }

    if (!param_arr[send_data.range_param]) {
        return false;
    }

    var buf = new Buffer(10);
    buf[0] = 0x10;
    buf[1] = param_arr[send_data.range_param].key;
    buf.writeFloatBE(send_data.range_value1 * 1 || 0, 2);
    buf.writeFloatBE(send_data.range_value2 * 1 || 0, 6);
    return buf;
};

instruct['11'] = function (send_data) {
    if (!_.has(send_data, 'alert_param') || !_.has(send_data, 'alert_value1')) {
        return false;
    }
    if (!param_arr[send_data.alert_param]) {
        return false;
    }

    var buf = new Buffer(10);
    buf[0] = 0x11;
    buf[1] = param_arr[send_data.alert_param].key;
    buf.writeFloatBE(send_data.alert_value1 * 1 || 0, 2);
    buf.writeFloatBE(send_data.alert_value2 * 1 || 0, 6);
    return buf;
};

instruct['12'] = function (send_data) {

    if (!_.has(send_data, 'f_rate') || !_.has(send_data, 'b_rate')) {
        return false;
    }

    var buf = new Buffer(3);
    buf[0] = 0x12;
    buf[1] = send_data.f_rate * 1;
    buf[2] = send_data.b_rate * 1;

    return buf;
};

instruct['20'] = function (send_data) {

    if (!_.has(send_data, 'correction') || !_.has(send_data, 'crt_value')) {
        return false;
    }
    if (!param_arr[send_data.correction]) {
        return false;
    }
    var crt_value = send_data['crt_value'].replace('，', ',').split(',');
    var buf = new Buffer(crt_value.length * 5 + 2);
    buf[0] = 0x20;
    buf[1] = param_arr[send_data.correction].key;
    // console.log(buf);
    _.each(crt_value, function (val, i) {
        console.log(val, i);
        buf[i * 5 + 2] = i + 1;
        buf.writeFloatBE(val, i * 5 + 3);
    });
    // console.log(buf);

    return buf;
};

instruct['21'] = function (send_data) {

    if (!_.has(send_data, 'correction') || !_.has(send_data, 'crt_value')) {
        return false;
    }
    if (!param_arr[send_data.correction]) {
        return false;
    }
    var crt_value = send_data['crt_value'].replace('，', ',').split(',');
    var buf = new Buffer(crt_value.length * 5 + 2);
    buf[0] = 0x21;
    buf[1] = param_arr[send_data.correction].key;
    // console.log(buf);
    _.each(crt_value, function (val, i) {
        console.log(val, i);
        buf[i * 5 + 2] = i + 1;
        buf.writeFloatBE(val, i * 5 + 3);
    });
    // console.log(buf);

    return buf;
};

//设置功能参数
instruct['22'] = function (send_data) {
    console.log(send_data);
    if (!_.has(send_data, 'parameter') || !_.has(send_data, 'func')) {
        return false;
    }

    var set_funcs = {
        '清历史数据': 0x01,
        '终端重启': 0x02,
        '进入标定流程': 0x03,
        '退出标定流程': 0x04,
        '终端发送数据类型': 0x05,
        '设置除湿目标值': 0x06,
        '设置除湿时间': 0x07,
        '终端传感器预热时间': 0x08,
        '清除标定数据': 0x09,
        '终端全范围湿度补偿开关': 0x0a,
        '终端校正数值开关': 0x0b,
        '终端全范围湿度补偿值': 0x0c,
        '终端循环发送帧数': 0x0d,
    };
    if (!set_funcs[send_data.func]) {
        return false;
    }

    var set_value_length = 0;
    var vals = [];
    if (send_data.set_value) {
        vals = send_data.set_value.replace(' ', '').replace('，', ',').split(',');
        set_value_length = 4 * vals.length;
        if (send_data.func === "设置除湿时间" || send_data.func === '终端传感器预热时间') {
            set_value_length = 1;
        }
    }
    var buf = new Buffer(3 + set_value_length);
    buf[0] = 0x22;
    buf[1] = send_data.parameter === "--" ? 0 : param_arr[send_data.parameter].key;
    buf[2] = set_funcs[send_data.func];
    if (send_data.set_value && send_data.func === "设置除湿时间" || send_data.func === '终端传感器预热时间') {
        switch (send_data.set_unit) {
            case 'second':
                buf[3] = send_data.set_value * 1;
                break;
            case 'minute':
                buf[3] = send_data.set_value * 1 + 100;
                break;
            case 'hour':
                buf[3] = send_data.set_value * 1 + 200;
                break;
            default:
                return false;
                break;
        }
    } else if (vals.length) {
        _.each(vals, function (val, i) {
            buf.writeFloatBE(val, i * 4 + 3);
        });

    }

    // console.log(buf);

    return buf;
};


instruct['30'] = function (send_data) {
    var buf = new Buffer(2);
    buf[0] = 0x30;
    if (!_.has(send_data, 'c_model')) {
        return false;
    }
    switch (send_data.c_model) {
        case '停止':
            buf[1] = 0;
            break;
        case '启动':
            buf[1] = 1;
            break;
        default:
            return false;
            break;
    }
    return buf;
};
instruct['31'] = function (send_data) {
    var buf = new Buffer(10);
    buf[0] = 0x31;
    if (!_.has(send_data, 'control') || !_.has(send_data, 'max') || !_.has(send_data, 'min')) {
        return false;
    }
    if (!param_arr[send_data.control]) {
        return false;
    }
    buf[1] = param_arr[send_data.control].key;
    buf.writeFloatBE(send_data['max'], 2);
    buf.writeFloatBE(send_data['min'], 6);

    return buf;
};
instruct['32'] = function (send_data) {
    var buf = new Buffer(7);
    buf[0] = 0x32;
    if (!_.has(send_data, 'control_inner') || !_.has(send_data, 'c_order') || !_.has(send_data, 'c_value')) {
        return false;
    }
    if (!param_arr[send_data.control_inner]) {
        return false;
    }
    buf[1] = param_arr[send_data.control_inner].key;
    buf[2] = send_data.c_order;
    buf.writeFloatBE(send_data['c_value'], 3);

    return buf;
};
instruct['86'] = function (send_data) {

    var buf = new Buffer(9);
    buf[0] = 0x86;
    buf[1] = 1;
    buf[2] = 0;
    buf[3] = 0;
    buf[4] = 0;
    buf[5] = 0;
    buf[6] = 2;
    buf[7] = 0;
    buf[8] = 0;

    return buf;
};
instruct['other'] = function (send_data) {
    if (!send_data.other) {
        return false;
    }
    var hex = send_data.other.replace(' ', '');
    if (hex.length % 2 !== 0) {
        return false;
    }
    return new Buffer(hex.toLowerCase(), 'hex');

};

instruct['box01'] = function (send_data) {
    if (!send_data['box_model']) {
        return false;
    }
    var buf = new Buffer(2);
    buf[0] = 0x01;
    switch (send_data.box_model) {
        case '运输模式':
            buf[1] = 0;
            break;
        case '正常模式':
            buf[1] = 1;
            break;
        case '休眠关机':
            buf[1] = 2;
            break;
        default:
            return false;
            break;
    }
    return buf;
};

instruct['box09'] = function (send_data) {
    if (!send_data['box_sensitivity']) {
        return false;
    }
    var buf = new Buffer(2);
    buf[0] = 0x09;
    buf[1] = send_data.box_sensitivity * 1;
    return buf;
};

module.exports = instruct;