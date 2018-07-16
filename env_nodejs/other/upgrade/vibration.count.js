// node run vibration.count

require('../../lib/logs').nolog();
var mongodb = require('mongodb');
var mysql = require('../../lib/mysql');
var tool = require('../../lib/tool');
var config = require('../../config');

var MongoClient = mongodb.MongoClient;


MongoClient.connect(config.mongodb_url, function (err, db) {

    console.log("============vibration.count==============");
    console.time('vibration_count');
    var vibration = db.collection('data.sensor.vibration.count');
    vibration.count({}, function (err, count) {
        if (err)throw err;

        console.log(count);
        vibration.find({}).toArray(function (err, docs) {
            if (err)throw err;
            console.log(docs.length);
            var $i = 1;
            tool.async.eachSeries(docs, function (row, callback) {

                var json = {};

                json.accel_max = row.accel_max;
                json.accel_min = row.accel_min;
                json.speed_max = row.speed_max;
                json.speed_min = row.speed_min;
                json.displacement_max = row.displacement_max;
                json.displacement_min = row.displacement_min;

                json.accel_average = row.accel_average;
                json.speed_average = row.speed_average;
                json.displacement_average = row.displacement_average;
                json.count_time = row.count_time;
                // console.log(json);

                var sql = "replace into data_sensor_vibration_count (" + tool._.keys(json).join(',') + ") values ('" + tool._.values(json).join("','") + "')";

                mysql.query(sql, function (err) {
                    if (err) throw err;
                    console.log($i + '/' + count);
                    $i++;
                    callback(null);
                });

            }, function (err) {
                if (err) {
                    console.error(err);
                    return;
                }
                console.timeEnd('vibration_count');
                process.exit();
            });

        });

    });


    // db.close();
});