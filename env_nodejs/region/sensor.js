var API = require('../lib/api');
var tool = require('../lib/tool');
var http = require('http');
var fs = require('fs');
var ini = require('../lib/ini');
var mysql = require('../lib/mysql');
var UPAPI = require('./up');

exports.start = function (callback) {
    console.log('start get sensor');
    get_sensor(function (err, sensors) {
        if (err) {
            console.error(err);
            callback && callback();
            return;
        }
        console.log('start up sensor', sensors.data.length);
        // fs.writeFileSync('sensors.json', JSON.stringify(sensors));
        UPAPI('post/env/data/sensor', {param: JSON.stringify(sensors)}, function (err, result) {
            if (err) {
                console.error(err);
                callback && callback();
                return;
            }
            console.log('up sensor end', result);
            callback && callback();
        });
    });
};

function get_sensor(callback) {
    var sensors = {};
    sensors.posttime = tool.time(tool.date('Y-m-d H') + ':' + tool.pad(parseInt(tool.date('i') / 10) * 10, 2) + ':00');//取整分钟10 20 30
    sensors.data = [];


    var sql = "SELECT d.*,e.parameter FROM data_sensor d,equip e where d.equip_time> " + (sensors.posttime - 600)
        + " and d.equip_time<=" + sensors.posttime
        + " and e.equip_no=d.equip_no ";

    mysql.query(sql, function (err, result) {
        if (err) {
            console.error(this.sql, err);
            callback(1);
            return;
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
            callback(1);
            return;
        }
        callback(null, sensors);
    });

}