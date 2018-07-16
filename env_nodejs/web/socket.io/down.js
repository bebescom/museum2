var tool = require('../../lib/tool'),
    API = require('../../lib/api'),
    mysql = require('../../lib/mysql'),
    config = require('../../config'),
    im = require('./index');

var DOWNS = {};

var q = tool.async.queue(function (data, callback) {
    if (!DOWNS[data.user_id]) {
        DOWNS[data.user_id] = {};
    }
    console.time('start_down_' + data.msg_id);
    data.start_time = tool.time();
    down_start(data);

    API(data.api_url||'post/env/export/equipment/equip_data', data, function (err, json) {
        console.timeEnd('start_down_' + data.msg_id);
        data.end_time = tool.time();
        if (err) {
            console.error(err);
            data.result = false;
            data.error = '生成失败';
            data.error_info = err;
        } else {
            data.result = json.result;
            data.url = json.url;
        }
        // if (Math.random() < 0.1) {
        //     data.result = false;
        //     data.error = '生成失败';
        // }
        data.exe_time = data.end_time - data.start_time;
        down_end(data, err, json);
        im.uidEmit(data.user_id, 'downEquipDataEnd', data);
        DOWNS[data.user_id][data.msg_id] = data;

        callback && callback();
    });

}, 10);


setInterval(function () {
    tool._.each(DOWNS, function (msgs, uid) {
        if (!msgs) {
            return;
        }
        tool._.each(msgs, function (data, msg_id) {
            if (!data) {
                return;
            }
            if (data.end_time && new Date().getTime() - data.end_time > 2 * 3600 * 1000) {
                delete DOWNS[uid][msg_id];
            }
        });

    });
}, 10 * 60 * 1000);

exports.downEquipData = function (data, socket) {
    console.log('downEquipData', data);
    if (!data.access_token || !data.msg_id) {
        console.warn('downEquipData access_token is null or msg_id is null', data);
        return;
    }
    data.user_id = socket.user_id;
    q.push(data);

};

exports.downEquipDataAck = function (data, socket) {
    console.log('downEquipDataAck', socket.user_id, data);
    if (!DOWNS[socket.user_id]) {
        return;
    }

    if (DOWNS[socket.user_id][data.msg_id]) {
        down_ack(data);
        delete DOWNS[socket.user_id][data.msg_id];
    }

};
exports.check_down_ack = function (socket) {
    if (!DOWNS[socket.user_id]) {
        return;
    }
    var down_count = tool._.size(DOWNS[socket.user_id]);
    if (!down_count) {
        return;
    }
    tool._.each(DOWNS[socket.user_id], function (row) {
        im.uidEmit(socket.user_id, 'downEquipDataEnd', row);
    });

};

down_all();//重启时重新发起请求；

function down_all() {

    mysql.query("select * from equip_down where status='正在生成'", function (err, docs) {
        if (err) {
            console.error(err);
            return;
        }
        if (!docs.length) {
            return;
        }
        tool.async.eachLimit(docs, 3, function (row, callback) {
            row.user_id = row.uid;
            q.push(row, callback);

        }, function (err) {

        });

    });
}


function down_start(data) {

    var json = {};
    json.msg_id = data.msg_id;
    json.uid = data.user_id;
    json.file_name = data.file_name;
    json.equip_no = data.equip_no;
    json.time = data.time;
    json.param = data.param;
    json.access_token = data.access_token;
    json.status = '正在生成';
    json.start_time = data.start_time;
    var up_json = {};
    up_json.start_time = data.start_time;

    mysql.query("insert into equip_down set ? ON DUPLICATE KEY UPDATE ?", [json, up_json], function (err) {
        if (err) {
            console.error(err);
            return;
        }
    });

}


function down_end(data, err, body) {

    var json = {};
    json.status = '生成完毕';
    json.file_url = data.url || '';
    if (!data.result) {
        json.status = '生成失败';
    }

    json.body = JSON.stringify([err, body]);

    json.end_time = data.end_time;

    mysql.query("update equip_down set ? where msg_id=?", [json, data.msg_id], function (err) {
        if (err) {
            console.error(err);
            return;
        }

    });

}

function down_ack(data) {

    var json = {};
    json.status = '已下载';
    json.ack = 1;
    json.ack_time = tool.time();

    mysql.query("update equip_down set ? where msg_id=? and status='生成完毕'", [json, data.msg_id], function (err) {
        if (err) {
            console.error(err);
            return;
        }

    });

}