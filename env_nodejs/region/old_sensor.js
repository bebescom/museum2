// node app.js old_sensor.js 2017-12-01

var API = require('../lib/api');
var tool = require('../lib/tool');
var http = require('http');
var fs = require('fs');
var ini = require('../lib/ini');
var mysql = require('../lib/mysql');
var UPAPI = require('./up');
var _ = tool._;
var Time = {};

exports.start = function (callback) {
    if (process.argv.length < 4) {
        console.log('argv.length<4', process.argv);
        return;
    }
    var argv = process.argv;
    console.log('start get old_sensor', argv[3]);
    Time.min_time = tool.time(argv[3] + ' 00:00:00');
    Time.max_run_time = tool.time() - 3600;
    if (process.argv.length > 4) {
        Time.max_run_time = tool.time(argv[4] + ' 23:59:00');
        if (argv[4].indexOf(' ') > -1) {
            Time.max_run_time = tool.time(argv[4]);
        }
    }

    tool.async.forever(function (next) {
        if (!Time.max_time) {
            Time.max_time = Time.min_time + 3600;
        } else {
            Time.max_time = Time.max_time + 3600;
        }

        if (Time.max_time && Time.max_time > Time.max_run_time) {
            next('end');
            return;
        }
        console.log('start', tool.date('Y-m-d H:i:s', Time.max_time * 1000));
        get_sensor(function (err, sensors) {
            if (err) throw err;
            if (!sensors) {
                next();
                return;
            }

            console.log('start up sensor', sensors.data.length);
            // fs.writeFileSync('sensors.json', JSON.stringify(sensors));
            var params = [];
            for (var i = 0, len = sensors.data.length; i < len; i += 1000) {
                params.push(sensors.data.slice(i, i + 1000));
            }

            tool.async.eachSeries(params, function (param, callback) {
                var _sensor = {};
                if (!param || !param.length) {
                    callback && callback();
                    return;
                }
                var last = _.last(param);
                if (!last) {
                    callback && callback();
                    return;
                }
                _sensor.posttime = last.collecttime;
                _sensor.data = param;
                UPAPI('post/env/data/sensor', {param: JSON.stringify(_sensor)}, function (err, result) {
                    if (err) throw err;
                    console.log('up sensor end', result);
                    callback && callback();
                });
            }, function () {
                next();
            });


        });
    }, function (err) {
        callback && callback();
    });

};

function get_sensor(callback) {
    var sensors = {};

    sensors.posttime = Time.max_time;
    sensors.data = [];

    var times = 'BETWEEN ' + (sensors.posttime - 3600) + ' and ' + sensors.posttime;

    var sql = "SELECT d.*,e.parameter FROM data_sensor d,equip e where d.equip_time " +
        times + " and e.equip_no=d.equip_no ";

    mysql.query(sql, function (err, result) {
        if (err) {
            console.error(this.sql);
            throw err;
        }
        var list = {};
        tool._.each(result, function (row) {
            var sensor = {};
            sensor.sensorno = row.equip_no;
            sensor.areano = row.env_no;
            sensor.collecttime = row.equip_time;
            sensor.param = {};
            sensor.alerts = row.alert_param;
            if (!row.parameter) {
                return;
            }
            var params = row.parameter.split(',');
            tool._.each(params, function (param) {
                sensor.param[param] = row[param];
            });

            list[row.equip_no + '_' + row.equip_time] = sensor;
        });
        sensors.data = tool._.values(list);
        if (!sensors.data.length) {
            console.warn('nothing data_sensor');
            callback(null);
            return;
        }
        callback(null, sensors);
    });

}