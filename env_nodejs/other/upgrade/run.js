require('../../lib/logs').filelog('upgrade', null, __dirname + '/upgrade.log');

var tool = require('../../lib/tool');
var cli_args = process.argv.slice(2);

function startServer(name, exe, arg) {
    console.log('start ' + name + ' Server');
    exe = exe || process.execPath;
    arg = arg || __dirname + '/' + name + '.js';
    var child_process = require('child_process');
    var spawn_arg = [arg];
    spawn_arg.push.apply(spawn_arg, cli_args.slice(1));
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
        console.warn(server.pid + ' ' + name + ' Server exit code:' + code);
        server.kill(signal);
        if (code) {
            setTimeout(function () {
                startServer(name);
            }, 3000);
        }

    });
}

startServer(cli_args[0].replace('.js', ''));