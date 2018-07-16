var API = require('../lib/api');
var tool = require('../lib/tool');
var http = require('http');
var fs = require('fs');
var ini = require('../lib/ini');
var mysql = require('../lib/mysql');
var UPAPI = require('./up');
var params = require('../params');
var PARAMS = {};

tool._.each(params.params, function (row) {
    PARAMS[row.en] = row;
});

exports.start = function (callback) {
    console.log('start get statistics');
    get_statistics(function (err, statistics) {
        if (err) {
            console.error(err);
            callback && callback();
            return;
        }
        console.log('start up statistics');
        // fs.writeFileSync('statistics.json', JSON.stringify(statistics));
        UPAPI('post/base/statistics', {param: JSON.stringify(statistics)}, function (err, result) {
            if (err) {
                console.error(err);
                callback && callback();
                return;
            }
            console.log('up statistics end', result);
            callback && callback();
        });
    });
};

function get_statistics(callback) {
    var statistic = {};
    statistic.stattime = tool.time(tool.date('Y-m-d H') + ':' + tool.pad(parseInt(tool.date('i') / 10) * 10, 2) + ':00');//取整分钟10 20 30
    statistic.inside = {};
    statistic.outside = {};
    statistic.runstatus = {};
    statistic.relicinfo = {
        relic_show: 0,
        relic_lend_back: 0,
        relic_move: 0,
        relic_repair: 0,
    };

    tool.async.auto({
        inside: get_inside,
        outside: get_outside,
        runstatus: get_runstatus,

    }, function (err) {
        if (err) {
            callback(err);
            return;
        }
        callback(null, statistic);
    });

    function get_inside(a_callback) {

        mysql.query("select * from data_sensor where equip_time>? and equip_time<=?", [tool.todaytime(), statistic.stattime], function (err, result) {
            if (err) {
                console.error(this.sql, err);
                a_callback(1);
                return;
            }
            if (!result.length) {
                console.log('data_sensor.length=0');
                a_callback(1);
                return;
            }
            var params = {'humidity': {}, 'temperature': {}, 'voc': {}, 'co2': {}, 'light': {}, 'uv': {}};

            tool._.each(result, function (row) {
                tool._.each(params, function (val, param) {
                    params[param].value = row[param];
                    if (!params[param].value && params[param].value !== 0) {
                        return;
                    }
                    if (PARAMS[param]) {
                        params[param].value = (row[param] * 1).toFixed(PARAMS[param].decimal) * 1;
                    }
                    if ((!params[param].max && params[param].max !== 0) || params[param].value > params[param].max) {
                        params[param].max = params[param].value;
                    }
                    if ((!params[param].min && params[param].min !== 0) || params[param].value < params[param].min) {
                        params[param].min = params[param].value;
                    }
                });
            });
            tool._.each(params, function (val, param) {
                if (params[param].max || params[param].max === 0) {
                    statistic.inside[param + '_max'] = params[param].max;
                }
                if (params[param].min || params[param].min === 0) {
                    statistic.inside[param + '_min'] = params[param].min;
                }
            });

            a_callback(null);

        });
    }

    function get_outside(a_callback) {
        API('get/env/environments/overviews/weather/weathers', function (err, result) {
            if (err) {
                console.error(err);
                a_callback(1);
                return;
            }
            // console.log(result);
            if (!result) {
                a_callback(1);
                return;
            }
            if (result.humidity || result.humidity === 0) {
                statistic.outside.humidity = result.humidity.val;
            }
            if (result.temperature || result.temperature === 0) {
                statistic.outside.temperature = result.temperature.val;
            }

            if (result.wind_speed) {
                statistic.outside.windspeed = result.wind_speed.val;
            }
            if (result.wind_direction) {
                statistic.outside.winddirection = result.wind_direction.val;
            }
            if (result.pm10) {
                statistic.outside.PM10 = result.pm10.val;
            }
            if (result.pm25) {
                statistic.outside.PM25 = result.pm25.val;
            }
            if (result.co2) {
                statistic.outside.co2 = result.co2.val;
            }
            if (result.condition) {
                statistic.outside.condition = result.condition.val;
            }
            if (result.aqi) {
                statistic.outside.aqi = result.aqi.level;
            }
            if (result.air_presure) {
                statistic.outside.air_presure = result.air_presure.val;
            }
            if (result.light) {
                statistic.outside.light = result.light.val;
            }
            if (result.rain) {
                statistic.outside.rain = result.rain.val;
            }
            if (result.uv) {
                statistic.outside.uv = result.uv.val;
            }
            if (result.voc) {
                statistic.outside.voc = result.voc.val;
            }

            a_callback(null);

        });
    }

    function get_runstatus(a_callback) {
        var times = 'alert_time>' + tool.todaytime() + ' and alert_time<=' + tool.time();
        var sql = [];
        sql.push("SELECT count(*) as count FROM alert where " + times);
        sql.push("SELECT count(*) as count FROM alert where remark is null and " + times);
        sql.push("SELECT count(*) as count FROM equip ");
        sql.push("SELECT count(*) as count FROM equip where status='异常'");

        mysql.query(sql.join(' union all '), function (err, result) {
            if (err) {
                console.error(this.sql, err);
                a_callback(1);
                return;
            }
            statistic.runstatus.alert_total = result[0].count;
            statistic.runstatus.alert_not_handle = result[1].count;
            statistic.runstatus.equip_total = result[2].count;
            statistic.runstatus.equip_not_handle = result[3].count;

            a_callback(null);
        });
    }


}