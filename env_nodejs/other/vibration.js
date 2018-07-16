/**
 * Created by lrb on 2017-2-10.
 */
var mysql = require('../lib/mysql');
var tool = require('../lib/tool');
var API = require('../lib/api');
var config = require('../config');

exports.start = function () {
    API('get/base/config', function (err, result) {
        if (err) {
            console.error(err);
            return;
        }
        if (result.vibration) {
            count();
        }
    });
};

setInterval(exports.start, 10 * 60 * 1000);

exports.count_all = function (callback) {

    mysql.query("select server_time from data_sensor_vibration order by id asc limit 1", function (err, docs) {
        if (err) {
            console.error(err);
            callback && callback(err);
            return;
        }
        if (!docs.length) {
            callback && callback(null);
            return;
        }
        var num = Math.ceil((tool.time() - docs[0].server_time) / 60 / 60);//计算小时数
        console.log(num, tool.time() - docs[0].server_time);
        count(num, function (err) {
            if (err) {
                console.error(err);
            }
            console.log('count_all end');
            //process.exit();
            callback && callback(null);
        });

    });

};


function count(num, callback) {
    num = num || 3;

    tool.async.timesSeries(num, function (n, next) {
        count_data(n, function (err) {
            next(err);
        });
    }, function (err) {
        if (err) {
            console.error(err);
            callback && callback(err);
            return;
        }
        callback && callback(null);
    });

}

function count_data(num, callback) {

    var count_date = tool.date("Y-m-d H:00:00");
    var count_time = parseInt(new Date(count_date).getTime() / 1000 - num * 3600);
    // console.log(count_date, count_time);

    mysql.query("select * from data_sensor_vibration where server_time>? and server_time<?", [count_time, count_time + 3600], function (err, docs) {
        if (err) {
            callback && callback(err);
            return;
        }
        // console.log(docs);
        if (!docs.length) {
            callback && callback(null);
            return;
        }
        var data = {accel_sum: 0, speed_sum: 0, displacement_sum: 0};
        var json = {};

        tool._.each(docs, function (row) {
            // console.log(row.param.accel);
            if (tool._.has(data, 'accel')) {
                json.accel_max = tool._.max([data.accel, row.accel, json.accel_max]);
                json.accel_min = tool._.min([data.accel, row.accel, json.accel_min]);
                json.speed_max = tool._.max([data.speed, row.speed, json.speed_max]);
                json.speed_min = tool._.min([data.speed, row.speed, json.speed_min]);
                json.displacement_max = tool._.max([data.displacement, row.displacement, json.displacement_max]);
                json.displacement_min = tool._.min([data.displacement, row.displacement, json.displacement_min]);
            } else {
                json.accel_max = row.accel;
                json.accel_min = row.accel;
                json.speed_max = row.speed;
                json.speed_min = row.speed;
                json.displacement_max = row.displacement;
                json.displacement_min = row.displacement;
            }
            data.accel = row.accel;
            data.speed = row.speed;
            data.displacement = row.displacement;
            data.accel_sum += row.accel * 1;
            data.speed_sum += row.speed * 1;
            data.displacement_sum += row.displacement * 1;

        });
        json.accel_average = (data.accel_sum / docs.length).toFixed(2);
        json.speed_average = (data.speed_sum / docs.length).toFixed(2);
        json.displacement_average = (data.displacement_sum / docs.length).toFixed(2);
        json.count_time = count_time;
        // console.log(json);
        var sql = "replace into data_sensor_vibration_count (" + tool._.keys(json).join(',') + ") values ('" + tool._.values(json).join("','") + "')";
        mysql.query(sql, function (err) {
            if (err) {
                callback && callback(err);
                return;
            }
            callback && callback(null);
        });
    });

}