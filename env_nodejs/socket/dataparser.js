var tool = require('../lib/tool');
var redis = require('./redis');


function dataParser(conn) {
    var self = this;
    self.conn = conn;
    var list = [];
    var prev_buf;

    var heatsize = 7;
    var routesize = 22;

    self.add = function (buf, time) {
        list.push({buf: buf, time: time});
        read_frame();
        if (prev_buf) {
            console.log(self.conn.ip_port + ' prev_buf:', prev_buf);
        }
    };

    function read_frame() {
        if (!list.length) {
            return;
        }
        var row = list.shift();
        if (!row || !row.buf) {
            return;
        }
        var time = row.time;
        var buf = row.buf;
        if (prev_buf) {
            buf = Buffer.concat([prev_buf, row.buf]);
        }

        for (var i = 0; i < buf.length;) {
            if (buf[i] === 0x55 && buf[i + 1] === 0xaa) {
                prev_buf = null;
                var sensorsize = buf[i + 2];
                var sensorlast = i + sensorsize - 1;
                if (sensorsize && buf[sensorlast] !== undefined) {
                    var sensor = buf.slice(i, sensorlast + 1);
                    self.conn.emit('sensor', sensor, time);
                    i = sensorlast;
                } else {
                    prev_buf = buf.slice(i);
                    i = buf.length;
                }
            } else if (buf[i] === 0xde && buf[i + 1] === 0x04) {
                var heatlast = i + heatsize - 1;
                if (buf[heatlast] !== undefined && buf[heatlast] === 0xcc) {
                    if (buf[heatlast + 2] !== undefined) {
                        if (
                            (buf[heatlast + 1] === 0x55 && buf[heatlast + 2] === 0xaa)
                            ||
                            (buf[heatlast + 1] === 0xdd && buf[heatlast + 2] === 0x04)
                            ||
                            (buf[heatlast + 1] === 0xde && buf[heatlast + 2] === 0x04)
                        ) {
                        } else {
                            heatlast += 2;
                        }
                    }
                    var heartbeat = buf.slice(i, heatlast + 1);
                    self.conn.emit('heartbeat', heartbeat, time);
                    i = heatlast;
                } else {
                    prev_buf = buf.slice(i);
                    i = buf.length;
                }
            } else if (buf[i] === 0xdd && buf[i + 1] === 0x04) {
                var routelast = i + routesize - 1;
                if (buf[routelast] !== undefined && buf[routelast] === 0xcc) {
                    if (buf[routelast + 2] !== undefined) {
                        if (
                            (buf[routelast + 1] === 0x55 && buf[routelast + 2] === 0xaa)
                            ||
                            (buf[routelast + 1] === 0xdd && buf[routelast + 2] === 0x04)
                            ||
                            (buf[routelast + 1] === 0xde && buf[routelast + 2] === 0x04)
                        ) {
                        } else {
                            routelast += 2;
                        }
                    }
                    var route = buf.slice(i, routelast + 1);
                    self.conn.emit('route', route, time);
                    i = routelast;
                } else {
                    prev_buf = buf.slice(i);
                    i = buf.length;
                }
            } else {
                i++;
            }
        }

        read_frame();

    }

}

module.exports = dataParser;