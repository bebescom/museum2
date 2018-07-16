// node run vibration [2017]

require('../../lib/logs').nolog();
var mongodb = require('mongodb');
var mysql = require('../../lib/mysql');
var tool = require('../../lib/tool');
var config = require('../../config');

var MongoClient = mongodb.MongoClient;

var cli_args = process.argv.slice(2);

var $date = tool.date('Y');
if (cli_args.length) {
    $date = cli_args[0];
}


MongoClient.connect(config.mongodb_url, function (err, db) {

    console.log("============vibration==============");
    console.time('vibration');
    console.log($date);
    var vibration = db.collection('data.sensor.vibration.' + $date);
    vibration.findOne({}, {sort: {receivetime: 1}}, function (err, first) {
        if (err)throw err;
        console.log(first);
        var find_time = 5 * 3600;//查询1小时
        var Time = {
            first_time: first.receivetime,
            last_time: first.receivetime + find_time
        };

        tool.async.forever(function (next) {
            console.log(tool.date('Y-m-d H:i:s', Time.first_time * 1000), tool.date('Y-m-d H:i:s', Time.last_time * 1000));
            console.time('exe_' + Time.first_time);
            vibration.find({
                receivetime: {
                    $gte: Time.first_time,
                    $lt: Time.last_time
                }
            }).sort({receivetime: 1}).toArray(function (err, docs) {
                if (err)throw err;
                console.log(docs.length);
                if (!docs.length) {
                    next('nothing');
                    return;
                }

                var _ids = {};
                tool._.each(docs, function (row) {
                    _ids[row._id.toString()] = row;
                });

                mysql.query("select _id from data_sensor_vibration where _id in (?)", [tool._.keys(_ids)], function (err, docs) {
                    if (err)throw err;
                    // console.log(this.sql);
                    if (docs.length) {
                        tool._.each(docs, function (row) {
                            _ids[row._id] = null;
                        });
                    }
                    var data = {key: [], val: []};
                    tool._.each(_ids, function (row) {
                        if (!row) {
                            return;
                        }
                        var json = {};
                        json.equip_no = row.equip_id;
                        json.accel = row.param.accel;
                        json.speed = row.param.speed;
                        json.displacement = row.param.displacement;
                        json.voltage = row.voltage;
                        json.rssi = row.rssi;
                        json.equip_time = row.time;
                        json.equip_time = row.receivetime;
                        json.server_time = row.receivetime;
                        json.raw_data = row.socketstr;
                        json.ip_port = row.ip;
                        json.alert_param = row.alert_param || '';
                        json._id = row._id.toString();

                        data.key = tool._.keys(json);
                        data.val.push(tool._.values(json));

                    });

                    console.log('data', data.val.length);

                    if (!data.val.length) {
                        console.timeEnd('exe_' + Time.first_time);
                        Time.first_time = Time.last_time;
                        Time.last_time = Time.last_time + find_time;
                        next();
                        return;
                    }
                    mysql.query("insert into data_sensor_vibration (" + data.key.join(',') + ") values ?", [data.val], function (err) {
                        if (err)throw err;
                        console.timeEnd('exe_' + Time.first_time);
                        Time.first_time = Time.last_time;
                        Time.last_time = Time.last_time + find_time;
                        next();
                    });

                });

            });
        }, function (err) {
            console.error(err);
            console.timeEnd('vibration');
            process.exit();
        });

    });


    // db.close();
});