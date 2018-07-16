require('../../lib/logs').filelog('report');
var tool = require('../../lib/tool');
var fs = require('fs');

function loginfo(str) {
    console.log("[32m(" + process.pid + ")" + tool.datetime('Y-m-d H:i:s.u') + " INFO[39m " + str);
}

// console.log(process.argv);
var cli_args = process.argv.slice(2);
fs.writeFileSync(__dirname + '/run.pid', process.pid);
var img_path = __dirname + '/img';
try {
    fs.mkdirSync(img_path);
} catch (e) {

}

function startServer(name, exe, arg) {
    loginfo('start ' + name + ' Server');
    exe = exe || process.execPath;
    arg = arg || __dirname + '/' + name + '/app.js';
    var child_process = require('child_process');
    var spawn_arg = [arg];
    spawn_arg.push.apply(spawn_arg, cli_args);
    var server = child_process.spawn(exe, spawn_arg);
    server.stdout.on('data', function (data) {
        console.log(data.toString());
    });
    server.stderr.on('data', function (data) {
        console.error(data.toString());
    });
    server.on('error', function (err) {
        console.error(err);
    });
    server.on('exit', function (code, signal) {
        loginfo(server.pid + ' ' + name + ' Server exit code:' + code);
        fs.unlinkSync(__dirname + '/run.pid');

    });
}

startServer('quarter');


