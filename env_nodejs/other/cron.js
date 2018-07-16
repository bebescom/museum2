var mysql = require('../lib/mysql');
var tool = require('../lib/tool');
var API = require('../lib/api');
var config = require('../config');
var spawn = require('child_process').spawn;
var fs = require('fs');
var path = require('path');

var schedule = require("node-schedule");

exports.start = function () {

    if (!config.open_cron_check) {
        return;
    }
    schedule.scheduleJob('30 06 * * *', function () {
        removeOneDay();
    });
    schedule.scheduleJob('0 * * * *', function () {
        middleIndex();
        network_check();
    });
    schedule.scheduleJob('*/5 * * * *', function () {
        sensor_check();
    });
    schedule.scheduleJob('0 5 * * *', function () {
        report();
    });
    //每小时发送报警消息
    schedule.scheduleJob('1 * * * *', function () {
        alert_msg();
    });
    //每天12:20转换qcm数据
    schedule.scheduleJob('20 12 * * *', function () {
        qcm_convert();
    });
    //每天00:20转换qcm数据
    schedule.scheduleJob('20 0 * * *', function () {
        qcm_convert();
    });

};

function removeOneDay() {
    console.log('one day remove start');

    var today_time = tool.todaytime();
    var del_time = today_time - 30 * 24 * 60 * 60;

    var sqls = [];

    sqls.push("delete from _data_sensor_timeout where now_time<" + del_time);
    sqls.push("delete from _data_sensor_connect where connect_time<" + del_time * 1000);
    sqls.push("delete from data_route where server_time<" + del_time);
    sqls.push("delete from _data_route where server_time<" + del_time);
    sqls.push("delete from _data_api where start_time<" + del_time * 1000);
    // sqls.push("delete from _data_sensor where server_time<" + del_time);

    tool._.each(sqls, function (sql) {
        mysql.query(sql, function (err) {
            if (err) {
                console.error(err);
            }
        })
    });

}


function middleIndex() {
    console.time('middleIndex');
    API('get/env/cli/middleIndex', function (err, result) {
        console.timeEnd('middleIndex');
        if (err) {
            console.error(err);
            return;
        }
        console.log(result);
    });
}

function network_check() {
    console.time('network_check');
    API('get/env/cli/equip_check/network_check', function (err, result) {
        console.timeEnd('network_check');
        if (err) {
            console.error(err);
            return;
        }
        console.log(result);
    });
}

function sensor_check() {
    console.time('sensor_check');
    API('get/env/cli/equip_check/sensor_check', function (err, result) {
        console.timeEnd('sensor_check');
        if (err) {
            console.error(err);
            return;
        }
        console.log(result);
        require('./op').start();//上传设备信息
    });
}

function alert_msg() {
    console.time('alert_msg');
    API('get/env/cli/alert_msg', function (err, result) {
        console.timeEnd('alert_msg');
        if (err) {
            console.error(err);
            return;
        }
        console.log(result);
    });
}

function qcm_convert() {
    console.time('qcm_convert');
    API('get/env/cli/qcm_convert', function (err, result) {
        console.timeEnd('qcm_convert');
        if (err) {
            console.error(err);
            return;
        }
        console.log(result);
    });
}

function report() {
    console.log('==============start report==============');
    var run_pid = false;
    try {
        fs.statSync(path.normalize(__dirname + '/../web/report/run.pid'));
        run_pid = true;
    } catch (e) {
    }

    if (run_pid) {
        console.error('程序可能正在运行，请稍后或停止程序并删除run.pid');
        return;
    }
    var report = {};
    try {
        report = JSON.parse(fs.readFileSync(__dirname + '/../logs/report.json'));
    } catch (e) {
    }

    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth();
    var quarter = 1;
    if (month < 3) {//第一季度生成去年4季度
        year--;
        quarter = 4;
    } else if (month < 6) {//生成第一季度
        quarter = 1;
    } else if (month < 9) {//生成第二季度
        quarter = 2;
    } else if (month < 12) {//生成第三季度
        quarter = 3;
    }
    var $year_quarter = year + '' + quarter;
    if (report[$year_quarter]) {
        console.log($year_quarter + '已生成');
        return;
    }
    report[$year_quarter] = 1;
    var argv = [$year_quarter];
    argv.unshift(__dirname + '/../web/report/run.js');
    var report_spawn = spawn(process.execPath, argv);
    report_spawn.stdout.on('data', function (data) {
        // console.log(data.toString());
    });
    report_spawn.stderr.on('data', function (data) {
        // console.error(data.toString());
    });
    report_spawn.on('close', function () {
        console.log('==============end report==============');
        report_spawn = null;
        try {
            fs.unlinkSync(__dirname + '/../report/run.pid');
        } catch (e) {
        }
        fs.writeFileSync(__dirname + '/../logs/report.json', JSON.stringify(report, 2));
    });

}