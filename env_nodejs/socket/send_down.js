var mysql = require('../lib/mysql');
var tool = require('../lib/tool');
var redis = require('./redis');
var index = require('./index');
var instruct = require('./instruct');
var date = require('dateformatter');


//没有找到协议版本
exports.noFindVersion = function (data) {
    console.log('no find agreement version:' + data.version);
    _sendDown(data, new Buffer([0x00, 0x01]));
};

//55aa crc校验失败
exports.crcError = function (data) {

    var json = {
        sensor_no: data.sensor_no,
        raw_data: data.buf.toString('hex'),
        ip_port: data.ip_port,
        server_time: parseInt(data.time / 1000)
    };
    mysql.query("insert into _data_crc_error set ?", json, function (err) {
        if (err) {
            console.error(this.sql, err);
        }
    });

    _sendDown(data, new Buffer([0x00, 0x02]));
};

//接收id错误
exports.receiveNoError = function (data) {
    console.log('receive_no is not 0x00000000');
    _sendDown(data, new Buffer([0x00, 0x03]));
};

//下发时间同步
exports.sendTime = function (data) {
    var buf = new Buffer(5);
    buf[0] = 0x03;
    buf.writeUInt32BE(tool.time(), 1);

    _sendDown(data, buf);
};

//主动下发队列延迟100ms
var q = tool.async.queue(function (task, callback) {

    var buf = index.sendToAll({
        receive_no: task.sensor_no,
        data_buf: task.data_buf,
        frame_num: task.frame_num
    });

    setTimeout(callback, 100);

    save_send(task, buf);

}, 1);

var frame_num = 1;
//主动下发
exports.nowSendDown = function (equip_no, status) {
    status = status || 1;
    var sql = "select * from equip_operation where send_status='" + status + "' and send_type=2";
    if (equip_no) {
        sql = "select * from equip_operation where send_status='" + status + "' and send_type=2 and equip_no='" + equip_no + "'";
    }

    mysql.query(sql, function (err, rows) {
        if (err) {
            console.error(this.sql, err);
            return;
        }
        if (!rows || !rows.length) {//无指令下发
            // exports.nowSendDown(equip_no, 2);//重发
            return;
        }
        rows.forEach(function (row) {

            console.log('nowSendDown', row.equip_no, row.instruct, row.send_data);

            row.sensor_no = row.equip_no.slice(-11);

            _parseSend(row, function (buf) {

                if (!buf) {
                    return;
                }

                q.push({
                    sensor_no: row.sensor_no,
                    data_buf: buf,
                    frame_num: frame_num
                });
                frame_num++;
                if (frame_num > 255) {
                    frame_num = 0;
                }

            });

        });
    });

};

var EQUIPS = {};//no：{time:'',queue:[{type:'time',row:row}]}

//被动查询下发
exports.querySendDown = function (data, callback) {
    if (!EQUIPS[data.sensor_no]) {
        EQUIPS[data.sensor_no] = {time: 0, queue: []};
    }
    //有下发指令
    _querySendDown(data, 1, function (buf) {
        if (buf) {
            // console.log('_querySendDown');
            _sendDown(data, buf);
            callback && callback();
            return;
        }
        //有周期下发指令
        send_cycle(data, function (buf) {
            if (buf) {
                // console.log('send_cycle');
                _sendDown(data, buf);
                callback && callback();
                return;
            }
            //时间错误或当天第一帧同步时间
            syncTime(data, function (sendTime) {
                if (sendTime) {
                    // console.log('syncTime');
                    exports.sendTime(data);
                    callback && callback();
                    return;
                }
                //没有指令了，发送00
                if (data.sensor_tip !== '017' || Math.random() < 0.1) {
                    // console.log('nothing 00');
                    _sendDown(data, new Buffer([0x00, 0x00]));
                }
                callback && callback();
            });
        });
    });

};

function syncTime(data, callback) {
    if (data.sensor_tip === '017') {//振动传感器
        callback();
        return;
    }
    var _send_time = false;
    if (data.instruct === 'c1') {//判断c1后面时间
        var time = data.buf.readUInt32BE(14);
        var now_time = tool.time();

        //当前数据时间小于上次数据时间，历史数据
        if (EQUIPS[data.sensor_no].time < time) {
            // console.log('history', time, EQUIPS[data.sensor_no].time);
        } else {
            //与当前时间相差超过1天的数据则同步时间
            if (Math.abs(time - now_time) > 24 * 3600) {
                _send_time = true;
            }
            EQUIPS[data.sensor_no].time = now_time;
        }
        if (time - now_time > 60 || time < tool.time('2015-01-01 00:00:00')) {
            _send_time = true;
        }
    }
    if (_send_time) {
        redis.autoSendTime(data.sensor_no);//记录当天已同步时间
        callback(true);
        return;
    }
    //当天第一次
    redis.autoSendTime(data.sensor_no, function (firstTime) {
        if (firstTime) {
            console.log('first send time');
        }
        callback(firstTime);
    });

}

function _querySendDown(data, status, callback) {
    status = status || 1;

    mysql.query('select * from equip_operation ' +
        'where equip_no like "%' + data.sensor_no.toString() + '" and send_type in (1,2) and send_status=? order by id desc limit 1',
        [status],
        function (err, rows) {

            if (err) {
                console.error(this.sql, err);
                callback && callback();
                return;
            }

            if (!rows.length) {//无指令下发
                if (status === 1 && data.instruct === 'c1') {
                    _querySendDown(data, 2, callback);//未回复下发指令，重发
                } else {
                    callback && callback();
                }
                return;
            }

            var row = rows[0];

            console.log('send_down', row.equip_no, row.instruct, row.send_data);

            _parseSend(row, callback);

        });

}


function _parseSend(row, callback) {
    var buf;
    if (instruct[row.instruct]) {
        var send_data = {};
        try {
            send_data = JSON.parse(row.send_data);
        } catch (e) {
            console.error(e, row.send_data);
        }
        buf = instruct[row.instruct](send_data);
    }

    var up_data = {send_status: 2, send_time: tool.time()};
    if (!buf) {
        console.error('send_down parse fail');
        up_data.send_status = 4;
    }
    up_data.send_count = (row.send_count || 0) + 1;

    if (row.send_type != 3 && up_data.send_count > 5) {
        up_data.send_status = 0;
        buf = null;
    }

    mysql.query("update equip_operation set ? where id=?", [up_data, row.id], function (err) {
        if (err) {
            console.error(this.sql, err);
        }
        callback && callback(buf);

    });

}


function _sendDown(data, data_buf) {

    var buf = index.sendToOne({
        ip_port: data.ip_port,
        receive_no: data.sensor_no,
        frame_num: data.frame_num,
        data_buf: data_buf
    });

    save_send(data, buf);
}

function save_send(data, buf) {
    if (!buf) {
        return;
    }
    var json = {};
    json.sensor_no = data.sensor_no;
    json.connect_time = new Date().getTime();
    json.ip_port = data.ip_port || '';
    json.raw_data = buf.toString('hex');
    json.type = 'down';
    mysql.query("insert into _data_sensor_connect set ? ", json, function (err) {
        if (err) {
            console.error(this.sql, err);
        }
    });

}

function send_cycle(data, callback) {

    if (tool.date('H') != 0) {
        callback && callback();
        return;
    }

    mysql.query('select * from equip_operation ' +
        'where equip_no like "%' + data.sensor_no.toString() + '" and send_type=3 and send_status in (1,2,3) and send_cycle in (1,2,3) order by id desc limit 1',
        function (err, rows) {

            if (err) {
                console.error(this.sql, err);
                callback && callback();
                return;
            }
            if (!rows.length) {//无指令下发
                callback && callback();
                return;
            }
            var row = rows[0];
            var _send = false;
            if (row.send_cycle == 3 && tool.date('d') == 1) {//每月1日
                _send = true;
            } else if (row.send_cycle == 2 && tool.date('w') != 1) {//每周一
                _send = true;
            } else if (row.send_cycle == 1) {//每天
                _send = true;
            }
            if (!_send) {
                callback && callback();
                return;
            }

            console.log('cycle_send_down', row.equip_no, row.instruct, row.send_data);

            redis.calibrate(row.id, function (firstTime) {
                if (!firstTime) {
                    callback && callback();
                    return;
                }
                _parseSend(row, callback);
            });

        });
}