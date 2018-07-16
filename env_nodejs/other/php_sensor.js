//node php_sensor.js "2017-12-01 00:00:00" "2017-12-01 10:00:00"

var API = require('../lib/api');
var tool = require('../lib/tool');
var mysql = require('../lib/mysql');


var argv = process.argv;

if (argv.length < 3) {
    return;
}

$start_time = tool.time(argv[2]);
$end_time = tool.time();
if (argv[2].indexOf(' ') === -1) {
    $start_time = tool.time(argv[2] + ' 00:00:00');
}
if (argv.length > 3) {
    $end_time = tool.time(argv[3]);
    if (argv[3].indexOf(' ') === -1) {
        $end_time = tool.time(argv[3] + ' 23:59:59');
    }
}
if (!$start_time || !$end_time) {
    return;
}
var insert_total = 0;

API('get/base/config/museum_config', function (err, web_config) {
    if (err) throw err;

    mysql.query("select * from _data_sensor where equip_time>? and equip_time<?", [$start_time, $end_time], function (err, docs) {
        if (err) throw err;
        console.log('docs.length', docs.length);
        var total = docs.length;
        tool.async.timesSeries(total, function (n, callback) {
            console.log(n + '/' + total);
            var row = docs.shift();
            var equip_no = web_config.museum_no + '' + row.equip_no;
            var sensor_tip = row.equip_no.slice(0, 3);

            if (sensor_tip === '014') {
                weather_data(equip_no, row, callback);
            } else {
                data_sensor(equip_no, row, callback);
            }

        }, function (err) {
            console.log('insert_total', insert_total);
            process.exit(0);
        });


    });


});

function data_sensor(equip_no, row, callback) {

    mysql.query("select count(1) as count from data_sensor where equip_no=? and equip_time=? " +
        "union (select env_no as count from equip where equip_no=?)", [equip_no, row.equip_time, equip_no], function (err, equips) {
        if (err) throw err;

        if (equips[0].count && equips[0].count !== '0') {
            callback && callback(null);
            return;
        }

        var env_no = equips[1].count;
        var data_sensor = tool._.clone(row);
        delete data_sensor['id'];
        data_sensor.equip_no = equip_no;
        data_sensor.env_no = env_no;
        if (data_sensor.humidity) {
            data_sensor.humidity = (data_sensor.humidity * 1).toFixed(0);
            if (data_sensor.humidity < 0 || data_sensor.humidity > 110) {
                callback && callback(null);
                return;
            }
        }
        if (data_sensor.temperature) {
            data_sensor.temperature = (data_sensor.temperature * 1).toFixed(1);
            if (data_sensor.temperature < -50 || data_sensor.temperature > 80) {
                callback && callback(null);
                return;
            }
        }

        // console.log(data_sensor);
        // callback && callback(1);
        mysql.query("insert into data_sensor set ?", data_sensor, function (err, result) {
            if (err) throw err;
            console.log('insert 1');
            insert_total++;
            callback && callback(null);
        });
    });

}

function weather_data(equip_no, row, callback) {

    mysql.query("select * from weather_data where weather_no=? and equip_time=? ", [equip_no, row.equip_time], function (err, equips, fields) {
        if (err) throw err;

        if (equips.length) {
            callback && callback(null);
            return;
        }

        var data_sensor = tool._.clone(row);
        delete data_sensor['id'];
        data_sensor.weather_no = equip_no;

        if (row.humidity) {
            data_sensor.humidity = (row.humidity * 1).toFixed(0);
            if (data_sensor.humidity < 0 || data_sensor.humidity > 100) {
                callback && callback(null);
                return;
            }
        }
        if (row.temperature) {
            data_sensor.temperature = (row.temperature * 1).toFixed(1);
            if (data_sensor.temperature < -50 || data_sensor.temperature > 80) {
                callback && callback(null);
                return;
            }
        }
        var data_sensor_keys = tool._.keys(data_sensor);
        var weather_sensor = {};
        tool._.each(fields, function (field) {
            if (tool._.contains(data_sensor_keys, field.name)) {
                weather_sensor[field.name] = data_sensor[field.name];
            }
        });

        mysql.query("insert into weather_data set ?", weather_sensor, function (err, result) {
            if (err) throw err;
            console.log('insert weather 1');
            insert_total++;
            callback && callback(null);
        });
    });

}