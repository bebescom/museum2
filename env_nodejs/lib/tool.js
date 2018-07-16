var date = require('dateformatter'),
    crypto = require('crypto'),
    _ = require('underscore');

exports._ = _;

exports.async = require('async');

exports.crc16 = function (buf, length) {
    var crc = require('crc'), crcval;
    length = length || buf.length;
    if (buf.length > length) {
        buf = buf.slice(0, length);
    }
    crcval = crc.crc16xmodem(buf);//CRC-CCITT (XModem) 0x1021
    //crcval=crc.crc16(buf.toString());//CRC-16 0x8005
    //crcval = crc.crc16modbus(buf);//CRC-16 Modbus
//    console.log(crcval.toString(16));
    //crcval = (crcval << 8) & 0xff00 | (crcval >> 8) & 0x00ff;//高低位互换
    crcval = exports.toHex(crcval, 4);
    return crcval;
};


exports.crc16_modbus = function (buf, length) {
    var crc = require('crc'), crcval;
    length = length || buf.length;
    if (buf.length > length) {
        buf = buf.slice(0, length);
    }
    // crcval = crc.crc16xmodem(buf);//CRC-CCITT (XModem) 0x1021
    //crcval=crc.crc16(buf.toString());//CRC-16 0x8005
    crcval = crc.crc16modbus(buf);//CRC-16 Modbus
//    console.log(crcval.toString(16));
    //crcval = (crcval << 8) & 0xff00 | (crcval >> 8) & 0x00ff;//高低位互换
    crcval = exports.toHex(crcval, 4);
    return crcval;
};

exports.toHex = function (uint32value, optionalMinLength) {
    optionalMinLength = optionalMinLength || 8;
    var result = uint32value.toString(16);
    if (result.length < optionalMinLength) {
        result = new Array(optionalMinLength - result.length + 1).join('0') + result;
    }
    return result;
};

var md5 = exports.md5 = function (str) {
    var buf = new Buffer(str);
    var str = buf.toString("binary");
    return crypto.createHash('md5').update(str).digest('hex');
};

var base64_encode = exports.base64_encode = function (str) {
    var b = new Buffer(str);
    return b.toString('base64');
};

var base64_decode = exports.base64_decode = function (str) {
    var b = new Buffer(str, 'base64');
    return b.toString();
};

exports.escape = function (str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/\n/g, '<br/>');
};

exports.unescape = function (str) {
    return String(str).replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
};

/**
 *
 * @param obj
 * @returns {boolean}
 */
exports.isEmptyObject = function (obj) {
    var name;
    for (name in obj) {
        return false;
    }
    return true;
};
/**
 *
 * @returns {number}
 */
var time = exports.time = function (date) {
    if (date) {
        date = new Date(date);
    } else {
        date = new Date();
    }
    var unixtime_ms = date.getTime();
    return parseInt(unixtime_ms / 1000);
};
/**
 *
 * @returns {number}
 */
exports.todaytime = function () {
    var unixtime_ms = new Date(date.format('Y-m-d 00:00:00')).getTime();
    return parseInt(unixtime_ms / 1000);
};
/**
 *
 * @returns {*|exports.format}
 */
exports.datetime = function (format, timestamp) {
    format = format || 'Y-m-d H:i:s';
    return date.format(format, timestamp);
};

/**
 * @param format 格式化日期
 * @param timestamp 时间戳(毫秒)
 * @returns {*|ServerResponse}
 */
exports.date = function (format, timestamp) {
    format = format || 'Y-m-d';
    return date.format(format, timestamp);
};

var microtime = exports.microtime = function (get_as_float) {
    var unixtime_ms = new Date().getTime();
    var sec = parseInt(unixtime_ms / 1000);
    return get_as_float ? (unixtime_ms / 1000) : (unixtime_ms - (sec * 1000)) / 1000 + ' ' + sec;
};


var authcode = exports.authcode = function (str, operation, key, expiry) {
    str = str || '';
    operation = operation || 'DECODE';
    key = key || 'authcodekey101.250';
    expiry = expiry || 0;

    var ckey_length = 4;
    key = md5(key);

    // 密匙a会参与加解密
    var keya = md5(key.substr(0, 16));
    // 密匙b会用来做数据完整性验证
    var keyb = md5(key.substr(16, 16));
    // 密匙c用于变化生成的密文
    var keyc = ckey_length ? (operation == 'DECODE' ? str.substr(0, ckey_length) : md5(microtime()).substr(-ckey_length)) : '';
    // 参与运算的密匙
    var cryptkey = keya + md5(keya + keyc);

    var strbuf;
    if (operation == 'DECODE') {
        str = str.substr(ckey_length);
        strbuf = new Buffer(str, 'base64');
        //string = b.toString();
    }
    else {
        expiry = expiry ? expiry + time() : 0;
        var tmpstr = expiry.toString();
        if (tmpstr.length >= 10)
            str = tmpstr.substr(0, 10) + md5(str + keyb).substr(0, 16) + str;
        else {
            var count = 10 - tmpstr.length;
            for (var i = 0; i < count; i++) {
                tmpstr = '0' + tmpstr;
            }
            str = tmpstr + md5(str + keyb).substr(0, 16) + str;
        }
        strbuf = new Buffer(str);
    }


    var box = [];
    for (var i = 0; i < 256; i++) {
        box[i] = i;
    }
    var rndkey = [], tmp;
    // 产生密匙簿
    for (var i = 0; i < 256; i++) {
        rndkey[i] = cryptkey.charCodeAt(i % cryptkey.length);
    }
    // 用固定的算法，打乱密匙簿，增加随机性，好像很复杂，实际上对并不会增加密文的强度
    for (var j = i = 0; i < 256; i++) {
        j = (j + box[i] + rndkey[i]) % 256;
        tmp = box[i];
        box[i] = box[j];
        box[j] = tmp;
    }


    // 核心加解密部分
    var s = '';
    for (var a = j = i = 0; i < strbuf.length; i++) {
        a = (a + 1) % 256;
        j = (j + box[a]) % 256;
        tmp = box[a];
        box[a] = box[j];
        box[j] = tmp;
        // 从密匙簿得出密匙进行异或，再转成字符
        //s += String.fromCharCode(string[i] ^ (box[(box[a] + box[j]) % 256]));
        strbuf[i] = strbuf[i] ^ (box[(box[a] + box[j]) % 256])
    }

    if (operation == 'DECODE') {
        s = strbuf.toString();
//        s = iconv.decode(strbuf, 'gbk');
        if ((s.substr(0, 10) == 0 || s.substr(0, 10) - time() > 0) && s.substr(10, 16) == md5(s.substr(26) + keyb).substr(0, 16)) {
            s = s.substr(26);
        } else {
            s = '';
        }
    }
    else {
        s = strbuf.toString('base64');

        var regex = new RegExp('=', "g");
        s = s.replace(regex, '');
        s = keyc + s;
    }

    return s;

};

exports.my_encode = function ($arr) {
    return base64_encode(authcode(base64_encode(JSON.stringify($arr)), 'ENCODE'));
};
exports.my_decode = function ($str) {
    var code = base64_decode(authcode(base64_decode($str), 'DECODE'));
    var rt = false;
    try {
        rt = JSON.parse(code);
    } catch (e) {
        console.log(e);
    }
    return rt;
};

/* 质朴长存法  by lifesinger */
exports.pad = function (num, n) {
    var len = num.toString().length;
    while (len < n) {
        num = "0" + num;
        len++;
    }
    return num.toString();
};

exports.hexToString = function (buf) {
    return buf.toString('hex').replace(/(.{2})/g, "$1 ");
};