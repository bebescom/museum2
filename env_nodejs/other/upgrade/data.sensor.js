// node run data.sensor [2017]

require('../../lib/logs').nolog();
var mongodb = require('mongodb');
var mysql = require('../../lib/mysql');
var tool = require('../../lib/tool');
var config = require('../../config');
var cli_args = process.argv.slice(2);

var $date = tool.date('Y');
if (cli_args.length) {
    $date = cli_args[0];
}

var MongoClient = mongodb.MongoClient;
var Time = {};
Time.find_time = 24 * 3600;//一次查询10小时

MongoClient.connect(config.mongodb_url, function (err, db) {

    console.log("============data.sensor==============");
    var sensor_coll = db.collection('data.sensor.' + $date);
    console.time('data_sensor');
    console.log($date);
    tool.async.auto({
        first: function (callback) {
            sensor_coll.findOne({}, {sort: {receivetime: 1}}, function (err, first) {
                if (err)throw err;
                if (!first) {
                    callback('find first is null');
                    return;
                }
                console.log(first);
                Time.first_time = first.receivetime;
                Time.last_time = first.receivetime + Time.find_time;
                callback();
            });

        },
        equips: function (callback) {
            mysql.query("select * from equip", function (err, docs) {
                if (err)throw err;
                var equips = {};
                tool._.each(docs, function (row) {
                    equips[row.equip_no] = row;
                });
                callback(null, equips);
            });
        },
        each_data: ['first', 'equips', function (a_callback, results) {

            tool.async.forever(function (next) {
                console.log(tool.date('Y-m-d H:i:s', Time.first_time * 1000), tool.date('Y-m-d H:i:s', Time.last_time * 1000));
                console.time('exe_' + Time.first_time);
                sensor_coll.find({
                    receivetime: {
                        $gte: Time.first_time,
                        $lt: Time.last_time
                    }
                }).sort({receivetime: 1}).toArray(function (err, docs) {
                    if (err)throw err;
                    console.log('find', docs.length);
                    if (!docs.length) {
                        console.timeEnd('exe_' + Time.first_time);
                        if (Time.last_time < tool.time()) {//未到当前时间，无数据的情况下进入下一个循环
                            Time.first_time = Time.last_time;
                            Time.last_time = Time.last_time + Time.find_time;
                            next();
                            return;
                        }
                        next('nothing');//退出循环
                        return;
                    }
                    var data = {key: [], val: []};

                    tool.async.each(docs, function (row, callback) {
                        if (row.sendidtip == '014') {
                            callback();
                            return;
                        }
                        mysql.query("select 1 from data_sensor where equip_no=? and equip_time=?", [row.equip_id, row.time], function (err, docs) {
                            if (err)throw err;
                            if (docs.length) {
                                callback();
                                return;
                            }
                            if (!row.param) {
                                callback();
                                return;
                            }
                            var json = {};
                            json.equip_no = row.equip_id;
                            json.env_no = '';
                            if (results.equips[row.equip_id]) {
                                json.env_no = results.equips[row.equip_id].env_no;
                            }
                            json.humidity = row.param.humidity || null;
                            json.temperature = row.param.temperature || null;
                            json.voc = row.param.voc || null;
                            json.co2 = row.param.co2 || null;
                            json.uv = row.param.uv || null;
                            json.light = row.param.light || null;
                            json.organic = row.param.organic || null;
                            json.inorganic = row.param.inorganic || null;
                            json.sulfur = row.param.sulfur || null;
                            json.dip = row.param.dip || null;
                            json.acceleration = row.param.acceleration || null;
                            json.canbi = row.param.canbi || null;

                            json.voltage = row.voltage || null;
                            json.rssi = row.rssi || null;
                            json.move_alert = row.movealert || null;
                            json.box_open_alert = row.boxopenalert || null;
                            json.box_status = row.boxstatus || null;
                            json.wind_speed = row.param.windspeed || null;
                            json.wind_direction = row.param.winddirection || null;
                            json.rain = row.param.rain || null;
                            json.air_presure = row.param.airpresure || null;
                            json.pm10 = row.param.PM10 || null;
                            json.pm25 = row.param.PM25 || null;

                            json.raw_data = row.socketstr || null;
                            json.ip_port = row.ip || null;
                            json.php_time = row.exestarttime || null;
                            json.soil_humidity = row.param.soil_humidity || null;
                            json.soil_temperature = row.param.soil_temperature || null;
                            json.soil_conductivity = row.param.soil_conductivity || null;
                            json.soil_salt = row.param.soil_salt || null;
                            json.broken = row.param.broken || null;
                            json.vibration = row.param.vibration || null;
                            json.multi_wave = row.param.multi_wave || null;
                            json.cascophen = row.param.cascophen || null;

                            json.equip_time = row.time;
                            json.server_time = row.receivetime;

                            data.key = tool._.keys(json);
                            data.val.push(tool._.values(json));
                            callback();
                        });

                    }, function (err) {
                        if (err) {
                            console.error(err);
                            return;
                        }

                        if (!data.val.length) {
                            console.timeEnd('exe_' + Time.first_time);
                            Time.first_time = Time.last_time;
                            Time.last_time = Time.last_time + Time.find_time;
                            next();
                            return;
                        }
                        mysql.query("insert into data_sensor (" + data.key.join(',') + ") values ?", [data.val], function (err) {
                            if (err) {
                                console.error(err);
                                return;
                            }
                            console.timeEnd('exe_' + Time.first_time);
                            Time.first_time = Time.last_time;
                            Time.last_time = Time.last_time + Time.find_time;
                            next();

                        });
                    });

                });
            }, function (err) {
                console.error(err);
                a_callback();
            });

        }]

    }, function (err) {
        if (err) {
            console.error(err);
        }
        console.timeEnd('data_sensor');
        process.exit();

    });

});