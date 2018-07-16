var tool = require('../../../lib/tool');

var redis = require('../../redis');

exports.socketList = function (req, res) {

    var page = parseInt(req.body.page) || 1;
    var rows = parseInt(req.body.rows) || 10;
    var offset = (page - 1) * rows;

    var result = {total: 0, rows: []};

    redis.getSensorData(offset, offset + rows, function (total, replay) {
        result.total = total;
        for (var i in replay) {
            result.rows.push(JSON.parse(replay[i]));
        }
        res.send(result);
    });
};

exports.allSocket = function (req, res) {

    var page = parseInt(req.body.page) || 1;
    var rows = parseInt(req.body.rows) || 10;
    var offset = (page - 1) * rows;

    var result = {total: 0, rows: []};

    redis.getAllSocketData(offset, offset + rows, function (total, replay) {
        result.total = total;
        for (var i in replay) {
            result.rows.push(JSON.parse(replay[i]));
        }
        res.send(result);
    });
};


exports.lostSocket = function (req, res) {

    var page = parseInt(req.body.page) || 1;
    var rows = parseInt(req.body.rows) || 10;
    var offset = (page - 1) * rows;

    var result = {total: 0, rows: []};

    redis.getLostSocketData(offset, offset + rows, function (total, replay) {
        result.total = total;
        for (var i in replay) {
            result.rows.push(JSON.parse(replay[i]));
        }
        res.send(result);
    });

};
exports.repeatList = function (req, res) {

    var page = parseInt(req.body.page) || 1;
    var rows = parseInt(req.body.rows) || 10;
    var offset = (page - 1) * rows;

    var result = {total: 0, rows: []};

    redis.getRepeatData(offset, offset + rows, function (total, replay) {
        result.total = total;
        for (var i in replay) {
            result.rows.push(JSON.parse(replay[i]));
        }
        res.send(result);
    });

};

exports.getAllUsers = function (req, res) {

    redis.getTcpSockets(function (replay) {
        var json = {total: 0, rows: []};
        if (replay) {
            for (var i in replay) {
                json.total++;
                json.rows.push(JSON.parse(replay[i]));
            }
        }
        res.send(json);
    });

};

exports.killOne = function (req, res) {

    var ip_port = req.body.ip_port;
    if (ip_port) {
        redis.killOne(ip_port);
    }
    res.send('ok');
};

exports.sendDown = function (req, res) {

    var send_ip_port = req.body.send_ip_port;
    var send_hex = req.body.send_hex;

    var result = 'error';

    send_hex = send_hex.replace(/\s/g, '');
    try {
        var buf = new Buffer(send_hex, 'hex');
        redis.sendHex(send_ip_port, send_hex);
        result = 'ok';
    } catch (e) {
        console.error(e);
    }

    res.send(result);
};