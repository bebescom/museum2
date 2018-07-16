var tool = require('../../../lib/tool');

exports.calc = function (req, res) {
    var ty = req.body.ty;
    var old = req.body.old;
    var result = 'nothing';
    if (old) {
        old = old.replace(/\s/g, '');
    }
    //console.log(i, old);
    if (tys[ty]) {
        result = tys[ty](old);
    }
    res.send({result: result});

};

var tys = {};
tys['readFloatBE'] = function (old) {
    var buf;
    try {
        buf = new Buffer(old, 'hex');
    } catch (e) {
        console.error(e);
    }
    if (!buf) {
        return false;
    }
    return buf.readFloatBE(0);
};
tys['readUInt32LE'] = function (old) {
    var buf;
    try {
        buf = new Buffer(old, 'hex');
    } catch (e) {
        console.error(e);
    }
    if (!buf) {
        return false;
    }
    return buf.readUInt32LE(0);
};
tys['readUInt32BE'] = function (old) {
    var buf;
    try {
        buf = new Buffer(old, 'hex');
    } catch (e) {
        console.error(e);
    }
    if (!buf) {
        return false;
    }
    return buf.readUInt32BE(0);
};

tys['readInt16BE'] = function (old) {
    var buf;
    try {
        buf = new Buffer(old, 'hex');
    } catch (e) {
        console.error(e);
    }
    if (!buf) {
        return false;
    }
    return buf.readInt16BE(0);
};
tys['datetime'] = function (old) {
    var buf;
    try {
        buf = new Buffer(old, 'hex');
    } catch (e) {
        console.error(e);
    }
    if (!buf) {
        return false;
    }
    return tool.datetime(null, buf.readUInt32BE(0) * 1000);
};
tys['crc'] = function (old) {
    var buf;
    try {
        buf = new Buffer(old, 'hex');
    } catch (e) {
        console.error(e);
    }
    if (!buf) {
        return false;
    }
    return tool.crc16(buf, buf.length);//计算crc校验码
};