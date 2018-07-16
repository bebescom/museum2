var tool = require('../lib/tool');
var mysql = require('../lib/mysql');
var API = require('../lib/api');
var params = require('../params');


var q = tool.async.queue(function (task, callback) {
    API(task.url, task.json, callback);
}, 30);


exports.send_route = function (json) {

    q.push({url: 'post/env/datas/data_route', json: json});

};

exports.send_sensor = function (json, callback) {
    // console.log('send_sensor', json);
    q.push({url: 'post/env/datas/data_sensor', json: json}, function (err) {
        if (!err && json.id) {
            mysql.query("update _data_sensor set status=2 where id=?", json.id, function (err) {
                if (err) throw err;
                callback && callback();
            });
        } else {
            callback && callback();
        }
    });

};

exports.start = function () {

    mysql.query("select * from _data_sensor where status=1 order by equip_time asc", function (err, docs) {
        if (err) throw err;
        if (!docs.length) {
            return;
        }
        tool.async.each(docs, function (row, callback) {
            var json = {};
            json.id = row.id;
            json.sensor_no = row.equip_no;
            json.ip_port = row.ip_port;
            json.equip_time = row.equip_time;
            json.raw_data = row.raw_data;
            json.server_time = row.server_time;
            json.param = {};
            tool._.each(params.params, function (param) {
                if (row[param.en] !== null && row[param.en] !== undefined && row[param.en] !== '') {
                    json.param[param.en] = row[param.en];
                }
            });
            exports.send_sensor(json, callback);

        }, function (err) {

        });
    });

};