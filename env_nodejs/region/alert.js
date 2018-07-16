var API = require('../lib/api');
var tool = require('../lib/tool');
var http = require('http');
var fs = require('fs');
var ini = require('../lib/ini');
var mysql = require('../lib/mysql');
var UPAPI = require('./up');

exports.start = function (callback) {
    console.log('start get alert');
    get_alert(function (err, alerts) {
        if (err) {
            console.error(err);
            callback && callback();
            return;
        }
        console.log('start up alert', alerts.alert.length);
        // fs.writeFileSync('alerts.json', JSON.stringify(alerts));
        UPAPI('post/env/data/alert', {param: JSON.stringify(alerts)}, function (err, result) {
            if (err) {
                console.error(err);
                callback && callback();
                return;
            }
            console.log('up alert end', result);
            callback && callback();
        });
    });
};

function get_alert(callback) {
    var alerts = {};
    alerts.posttime = tool.time(tool.date('Y-m-d H') + ':' + tool.pad(parseInt(tool.date('i') / 10) * 10, 2) + ':00');//取整分钟10 20 30
    alerts.alert = [];

    var sql = "SELECT a.*,p.name as param_zh,p.unit FROM alert a,equip_param p where a.alert_time>" +
        (alerts.posttime - 600) + " and a.alert_time<=" + alerts.posttime + " and a.alert_param=p.param ";

    mysql.query(sql, function (err, docs) {
        if (err) {
            console.error(this.sql, err);
            callback(1);
            return;
        }
        tool.async.each(docs, function (row, e_callback) {
            var alert = {};
            alert.sensorno = row.equip_no;
            alert.areano = row.env_no;
            alert.desc = row.param_zh + '' + row.content + '' + row.unit;
            alert.alerttime = row.alert_time;
            alert.dealtime = row.clear_time;
            alert.dealnote = row.remark || '';
            API('get/base/envs/info/' + row.env_no, function (err, result) {
                if (err) {
                    console.log('get env err', err);
                    alerts.data.push(alert);
                    e_callback(null);
                    return;
                }
                alert.desc = result.name + alert.desc;
                alerts.alert.push(alert);
                e_callback(null);
            });

        }, function (err) {
            if (err) {
                return;
            }
            if (!alerts.alert.length) {
                console.warn('nothing alert');
                callback(1);
                return;
            }
            callback(null, alerts);
        });


    });

}