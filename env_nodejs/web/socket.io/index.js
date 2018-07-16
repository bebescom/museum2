var io = false;
var config = require('../../config');
var tool = require('../../lib/tool');
var down = require('./down');
var report = require('./report');

var UIDS = {};

exports.start = function (server) {

    io = require('socket.io')(server);

    io.sockets.on('connection', function (socket) {

        // console.log(socket.id + " connect.");

        socket.on('test', function (data) {
            console.log('test', data);
        });

        socket.on('sensor', function (data, callback) {
            socket.join('sensor');
        });
        socket.on('report', function (data, callback) {
            socket.join('report');
        });
        socket.on('report_pull', function (data, callback) {
            report.pull(socket);
        });
        socket.on('report_create', function (data, callback) {
            report.create(socket, data);
        });
        socket.on('report_stop', function (data, callback) {
            report.stop(socket);
        });

        socket.on('museum', function (user, callback) {
            socket.join('museum');
            if (!user) {
                return;
            }
            if (!UIDS[user.id]) {
                UIDS[user.id] = {};
            }
            socket.user_id = user.id;
            UIDS[user.id][socket.id] = socket;
            down.check_down_ack(socket);
        });

        /**
         * 异步下载设备数据
         */
        socket.on('downEquipData', function (data, callback) {
            down.downEquipData(data, socket);
        });
        /**
         * 收到消息确认数据
         */
        socket.on('downEquipDataAck', function (data, callback) {
            down.downEquipDataAck(data, socket);
        });

        /**
         * 立即下发
         */
        socket.on('nowSendDown', function (data, callback) {
            require('../redis').nowSendDown();
        });

        socket.on('disconnect', function () {
            if (UIDS[socket.user_id]) {
                delete UIDS[socket.user_id][socket.id];
            }
            require('./disconnect').index(socket);
        });

    });

    console.log('socket.io listening on express');

};

exports.roomEmit = function (room, event, data) {
    if (io) {
        io.sockets.in(room).emit(event, data);
    }
};

exports.allEmit = function (event, data) {
    if (io) {
        io.sockets.emit(event, data);
    }
};

exports.allSockets = function () {
    if (io) {
        return io.sockets.sockets;
    } else {
        return false;
    }
};
exports.allRooms = function () {
    if (io) {
        return io.sockets.manager.rooms;
    } else {
        return false;
    }
};

exports.idEmit = function (socketid, event, data) {
    if (io) {
        if (io.sockets.sockets[socketid]) {
            io.sockets.sockets[socketid].emit(event, data);
        }
    }
};

exports.uidEmit = function (uid, event, data) {
    if (io) {
        if (UIDS[uid]) {
            tool._.each(UIDS[uid], function (socket, id) {
                socket.emit(event, data);
            })
        }
    }
};