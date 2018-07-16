var tool = require('../lib/tool');
var config = require('../config');
var index = require('./index');
var send_down = require('./send_down');
var client = require("../lib/redis").createClient();

var subClient = require("../lib/redis").createClient();

subClient.on("message", function (channel, message) {
    //console.log('socket/subscribe', channel, message);
    if (channel === config.redis.prefix + 'socket') {
        var json = JSON.parse(message);
        switch (json.type) {
            case 'socket':
                exeSocket();
                break;
            case 'killOne':
                index.killOne(json.ip_port);
                break;
            case 'sendHex':
                index.sendHex(json);
                break;
            case 'nowSendDown':
                send_down.nowSendDown();
                break;
            case 'restart':
                console.log('restart socket');
                process.exit(0);
                break;
        }
    }

});

subClient.subscribe(config.redis.prefix + "socket");

function exeSocket() {
    if (exeSocket.isRuning) {
        return;
    }
    exeSocket.isRuning = true;
    client.llen(config.redis.prefix + 'socket', function (err, reply) {
        if (err) {
            console.error(err);
            return;
        }

        for (var i = 0; i < reply; i++) {
            client.rpop(config.redis.prefix + 'socket', function (err, reply) {
                if (err) throw err;
                if (reply) {
                    var json = JSON.parse(reply);
                    index.sendToOne(json);
                }
            });
        }
        exeSocket.isRuning = false;
    });

}

exeSocket.isRuning = false;

/*sensor*/

exports.addRoute = function (data) {
    client.publish(config.redis.prefix + 'sensor', JSON.stringify({type: 'route', data: data}));
};

exports.addSensor = function (data) {
    client.publish(config.redis.prefix + 'sensor', JSON.stringify({type: 'sensor', data: data}));
};

/**/

var Sockets = {};
client.del(config.redis.prefix + 'tcpSocket');
exports.addReceiveNum = function (ip_port) {
    if (Sockets[ip_port]) {
        Sockets[ip_port].num++;
        client.hset(config.redis.prefix + 'tcpSocket', ip_port, JSON.stringify(Sockets[ip_port]));
        exports.sendToRoom('sensor', 'online', '');
    }
};

exports.connect = function (ip_port) {
    Sockets[ip_port] = {time: tool.datetime(), ip_port: ip_port, num: 0, gateway_no: ''};
    client.hset(config.redis.prefix + 'tcpSocket', ip_port, JSON.stringify(Sockets[ip_port]));

    exports.sendToRoom('sensor', 'online', '');

};
exports.set_gateway_no = function (ip_port, gateway_no) {
    if (Sockets[ip_port]) {
        Sockets[ip_port].gateway_no = gateway_no;
        client.hset(config.redis.prefix + 'tcpSocket', ip_port, JSON.stringify(Sockets[ip_port]));
        exports.sendToRoom('sensor', 'online', '');
    }
};

exports.disconnect = function (ip_port) {

    client.hdel(config.redis.prefix + 'tcpSocket', ip_port);
    Sockets[ip_port].distime = tool.datetime();

    delete Sockets[ip_port];
    exports.sendToRoom('sensor', 'online', '');
};

/**/

exports.sendToRoom = function (room, event, data) {
    var json = {
        type: 'room_emit',
        room: room,
        event: event,
        data: data
    };
    client.publish(config.redis.prefix + 'web', JSON.stringify(json));

};


exports.addBySocket = function (data) {

    var json = {};
    json.server_time = parseInt((data.time || new Date().getTime()) / 1000);
    json.ip_port = data.ip_port;
    json.raw_data = data.buf.toString('hex');
    json.crc = data.crc;

    client.lpush(config.redis.prefix + 'socketData', JSON.stringify(json), function (err, res) {
        if (err) {
            console.error(err);
            return;
        }
        if (Math.random() < 0.1) {
            client.ltrim(config.redis.prefix + 'socketData', 0, 99999);
        }
        exports.sendToRoom('sensor', 'new', '');
    });

};

exports.addBySocketAll = function (buf, ip_port, time) {

    var json = {};
    json.server_time = parseInt((time || new Date().getTime()) / 1000);
    json.ip_port = ip_port;
    json.raw_data = buf.toString('hex');

    client.lpush(config.redis.prefix + 'allSocketData', JSON.stringify(json), function (err, res) {
        if (err) {
            console.error(err);
            return;
        }
        if (Math.random() < 0.1) {
            client.ltrim(config.redis.prefix + 'allSocketData', 0, 99999);
        }
    });

};

exports.addByLost = function (buf, ip_port, time) {

    var json = {};
    json.server_time = parseInt((time || new Date().getTime()) / 1000);
    json.ip_port = ip_port;
    json.raw_data = buf.toString('hex');

    client.lpush(config.redis.prefix + 'lostSocketData', JSON.stringify(json), function (err, res) {
        if (err) {
            console.error(err);
            return;
        }
        if (Math.random() < 0.1) {
            client.ltrim(config.redis.prefix + 'lostSocketData', 0, 99999);
        }
    });

};
exports.addRepeat = function (buf, ip_port, time) {

    var json = {};
    json.server_time = parseInt((time || new Date().getTime()) / 1000);
    json.ip_port = ip_port;
    json.raw_data = buf.toString('hex');

    client.lpush(config.redis.prefix + 'repeatData', JSON.stringify(json), function (err, res) {
        if (err) {
            console.error(err);
            return;
        }
        if (Math.random() < 0.1) {
            client.ltrim(config.redis.prefix + 'repeatData', 0, 99999);
        }
    });

};


//timeout
client.del(config.redis.prefix + 'timeout');

exports.timeoutConnect = function (sensor_no, time) {
    client.hset(config.redis.prefix + 'timeout', sensor_no, time);
};
exports.timeoutDisconnect = function (sensor_no) {
    client.hdel(config.redis.prefix + 'timeout', sensor_no);
};

exports.timeoutAll = function (cb) {
    client.hgetall(config.redis.prefix + 'timeout', function (err, list) {
        if (err) {
            console.error(err);
            return;
        }
        cb && cb(list);
    });
};


//autoSendTime
exports.autoSendTime = function (sensor_no, func) {

    client.hget(config.redis.prefix + 'autoSendTime', sensor_no, function (err, res) {
        if (err) {
            console.error(err);
            return;
        }
        var today = tool.date();
        if (res != today) {
            client.hset(config.redis.prefix + 'autoSendTime', sensor_no, today, function (err) {
                if (err) {
                    console.error(err);
                    return;
                }
                func && func(true);
            });
        } else {
            func && func(false);
        }
    });
};

exports.calibrate = function (id, func) {
    client.hget(config.redis.prefix + 'calibrate', id, function (err, res) {
        if (err) {
            console.error(err);
            return;
        }
        var today = tool.date();
        if (res != today) {
            client.hset(config.redis.prefix + 'calibrate', id, today, function (err) {
                if (err) {
                    console.error(err);
                    return;
                }
                func && func(true);
            });
        } else {
            func && func(false);
        }
    });
};