var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;
var index = require('./index');
var API = require('../../lib/api');
try {
    fs.unlinkSync(__dirname + '/../report/run.pid');
} catch (e) {

}

exports.pull = function (socket) {
    report_data('\n==============start==============\n');
    var pull_sh = path.normalize(__dirname + '/../../../pull.sh');
    try {
        fs.statSync(pull_sh);
    } catch (e) {
        report_data('pull.sh not find');
        return;
    }

    var ls = spawn('sh', [pull_sh]);

    ls.stdout.on('data', function (data) {
        report_data(data.toString());
    });
    ls.stderr.on('data', function (data) {
        report_data(data.toString());
    });
    ls.on('close', function () {
        report_data('\n==============end==============\n');
    });

};
var report_spawn;
exports.create = function (socket, data) {
    report_data('\n==============start==============\n');
    var times = data.times;
    if (!times) {
        report_data('times is null');
        return;
    }
    var run_pid = false;
    try {
        fs.statSync(path.normalize(__dirname + '/../report/run.pid'));
        run_pid = true;
    } catch (e) {

    }
    if (run_pid) {
        report_data('程序可能正在运行，请稍后或停止程序并删除run.pid');
        return;
    }
    var argv = times.split(' ');
    argv.unshift(__dirname + '/../report/run.js');
    report_spawn = spawn(process.execPath, argv);
    report_spawn.stdout.on('data', function (data) {
        report_data(data.toString());
    });
    report_spawn.stderr.on('data', function (data) {
        report_data(data.toString());
    });
    report_spawn.on('close', function () {
        report_data('\n==============end==============\n');
        index.roomEmit('report', 'report_reload');
        report_spawn = null;
        try {
            fs.unlinkSync(__dirname + '/../report/run.pid');
        } catch (e) {

        }

    });

};

exports.stop = function (socket) {
    if (report_spawn) {
        report_data('kill...');
        report_spawn.kill();
    } else {
        report_data('nothing...');
    }
};


function report_data(txt) {
    index.roomEmit('report', 'report_data', txt);
}