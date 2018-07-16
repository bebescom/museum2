var fs = require('fs');
try {
    fs.mkdirSync(__dirname + '/logs');
} catch (e) {
}

require('./lib/logs').filelog('run');
var tool = require('./lib/tool');
//process.on('uncaughtException', function (err) {
//    console.error(tool.datetime(), err);
//    console.error(err.stack);
//    process.exit(1);
//});

function loginfo(str) {

    console.log("[32m(" + process.pid + ")" + tool.datetime('Y-m-d H:i:s.u') + " INFO[39m " + str);
}

function startServer(name, exe, arg) {
    loginfo('start ' + name + ' Server');
    exe = exe || process.execPath;
    arg = arg || __dirname + '/' + name + '/app.js';
    var child_process = require('child_process');
    var server = child_process.spawn(exe, [arg]);
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
        setTimeout(function () {
            startServer(name);
        }, 1000);

    });
}

startServer('web');
startServer('socket');
startServer('sensor');
startServer('other');

var ini = require('./lib/ini');
var root = ini.get('MUSEUM_REGION_ROOT');
if (root) {
    startServer('region');
}


