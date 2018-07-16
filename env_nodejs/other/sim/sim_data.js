// node sim_data [2016-07-01]

var tool = require('../lib/tool');
var mysql = require('../lib/mysql');
var cli_args = process.argv.slice(2);

var $date = tool.date('Y-m-d');
if (cli_args.length) {
    $date = cli_args[0];
}

var Time = {};
Time.start_time = tool.time($date + ' 00:00:00');
Time.end_time = tool.time() - 3600;
Time.day = Math.ceil((Time.end_time - Time.start_time) / 60 / 60 / 24);
Time.num = 0;

mysql.query("select * from equip where equip_type!='震动传感器' and monitor_type in ('仅监测','主动调控') and parameter is not null and status='异常'", function (err, docs) {
    if (err) throw err;

    console.time('equips');
    Time.total = docs.length;
    console.log(Time);
    tool.async.eachSeries(docs, each_equip, function (err) {
        console.timeEnd('equips');
        console.log('insert', Time.num);
        process.exit();
    });

});


function each_equip(row, callback) {
    // console.log(row.equip_no);
    row.params = row.parameter.split(',');

    //每天运行一次
    tool.async.timesSeries(Time.day, function (n, day_next) {
        var first_time = Time.start_time + n * 60 * 60 * 24;
        console.log(row.equip_no, n, tool.date('Y-m-d', first_time * 1000));

        var data = {key: [], val: []};

        tool.async.times(24 * 6, function (i, next) {
            var equip_time = first_time + i * 60 * 10;

            if (equip_time > Time.end_time) {
                next();
                return;
            }
            // console.log(tool.date('Y-m-d H:i:s', equip_time * 1000), tool.date('Y-m-d H:i:s', Time.end_time * 1000));

            mysql.query("select count(1) as count from data_sensor where equip_no=? and equip_time>? and equip_time<?",
                [row.equip_no, equip_time - 5 * 60, equip_time + 5 * 60], function (err, results) {
                    if (err) throw err;
                    if (results[0].count) {
                        next();
                        return;
                    }

                    var json = {};
                    json.equip_no = row.equip_no;
                    json.env_no = row.env_no;

                    tool._.each(row.params, function (param) {
                        if (param === 'temperature') {
                            json[param] = floatRand(20, 30);
                        } else if (param === 'humidity') {
                            json[param] = floatRand(50, 60);
                        } else if (param === 'co2') {
                            json[param] = intRand(100, 200);
                        } else if (param === 'light') {
                            json[param] = intRand(0, 100);
                        } else if (param === 'uv') {
                            json[param] = floatRand(0, 1);
                        } else {
                            json[param] = intRand(100, 1000);
                        }
                    });
                    json.voltage = floatRand(2.5, 3.5);
                    json.rssi = intRand(-100, -60);
                    json.equip_time = equip_time;
                    json.server_time = equip_time;
                    json.status = '正常';
                    Time.num++;
                    data.key = tool._.keys(json);
                    data.val.push(tool._.values(json));
                    next();
                });
        }, function (err) {
            if (!data.val.length) {
                day_next();
                return;
            }
            mysql.query("insert into data_sensor (" + data.key.join(',') + ") values ?", [data.val], function (err) {
                if (err) throw err;
                day_next();
            });

        });

    }, function (err) {
        if (err) console.error(err);
        // console.log(jsons.length);
        callback();
    });

}


function floatRand(Min, Max) {

    var Range = Max - Min;
    var Rand = Math.random();
    var rval = Min + Math.round(Rand * Range) + Math.random();
    rval = rval.toFixed(2);
    //console.log(rval);
    return rval;

}


function intRand(Min, Max) {

    var Range = Max - Min;
    var Rand = Math.random();
    var rval = Min + Math.round(Rand * Range);
    // console.log(rval);
    return rval;
}