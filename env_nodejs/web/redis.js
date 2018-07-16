var tool = require('../lib/tool');
var config = require('../config');

var client = require("../lib/redis").createClient();

var subClient = require("../lib/redis").createClient();

subClient.on("message", function (channel, message) {

    if (channel === config.redis.prefix + 'web') {
        var json = JSON.parse(message);
        switch (json.type) {
            case 'room_emit':
                require('./socket.io/index').roomEmit(json.room, json.event, json.data);
                break;
        }
    }

});
subClient.subscribe(config.redis.prefix + "web");

exports.getTcpSockets = function (callback) {
    client.hgetall(config.redis.prefix + 'tcpSocket', function (err, replay) {
        if (err) throw err;
        callback(replay);
    });
};

exports.getSensorData = function (start, end, callback) {
    client.llen(config.redis.prefix + 'socketData', function (err, total) {
        if (err) throw err;
        client.lrange(config.redis.prefix + 'socketData', start, end, function (err, replay) {
            if (err) throw err;
            callback(total, replay);
        });
    });
};

exports.getAllSocketData = function (start, end, callback) {
    client.llen(config.redis.prefix + 'allSocketData', function (err, total) {
        if (err) throw err;
        client.lrange(config.redis.prefix + 'allSocketData', start, end, function (err, replay) {
            if (err) throw err;
            callback(total, replay);
        });
    });
};

exports.getLostSocketData = function (start, end, callback) {
    client.llen(config.redis.prefix + 'lostSocketData', function (err, total) {
        if (err) throw err;
        client.lrange(config.redis.prefix + 'lostSocketData', start, end, function (err, replay) {
            if (err) throw err;
            callback(total, replay);
        });
    });
};

exports.getRepeatData = function (start, end, callback) {
    client.llen(config.redis.prefix + 'repeatData', function (err, total) {
        if (err) throw err;
        client.lrange(config.redis.prefix + 'repeatData', start, end, function (err, replay) {
            if (err) throw err;
            callback(total, replay);
        });
    });
};

exports.nowSendDown = function () {

    var json = {
        type: 'nowSendDown'
    };
    client.publish(config.redis.prefix + 'socket', JSON.stringify(json));

};

exports.killOne = function (ip_port) {

    var json = {
        type: 'killOne',
        ip_port: ip_port
    };
    client.publish(config.redis.prefix + 'socket', JSON.stringify(json));
};

exports.sendHex = function (ip_port, hex) {
    var json = {
        type: 'sendHex',
        ip_port: ip_port,
        hex: hex
    };
    client.publish(config.redis.prefix + 'socket', JSON.stringify(json));

};

exports.sendToRoom = function (room, event, data) {

    require('./socket.io/index').roomEmit(room, event, data);

};


exports.restartSocket = function (room, event, data) {

    var json = {
        type: 'restart'
    };
    client.publish(config.redis.prefix + 'socket', JSON.stringify(json));

};

