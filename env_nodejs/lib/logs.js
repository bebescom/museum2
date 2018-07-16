var log4js = require('log4js');
var config = require('../config');
var fs = require('fs');
var layout = {
    "type": "pattern",
    "pattern": "%m",//"%[ %d{ABSOLUTE} %p%] %m",
    "tokens": {
        "pid": function () {
            return process.pid;
        }
    }
};

var log_path = __dirname + '/../logs';
try {
    fs.mkdirSync(log_path);
} catch (e) {

}


exports.filelog = function (name, t, filename) {

    name = name || 'app';

    if (t) {
        layout.pattern = "%[(%x{pid})%d %p%] %m";
    }

    filename = filename || log_path + '/' + name + '.log';

    log4js.configure({
        appenders: [
            {type: 'console', layout: layout},
            {
                type: "dateFile",
                //type: "file",
                filename: filename,
                maxLogSize: config.maxLogSize * 1000 * 1000,//50M
                backups: config.backups,
                pattern: "-yyyy-MM-dd.log",
                alwaysIncludePattern: true,
                layout: layout
            }
        ],
        replaceConsole: true
    });

};

exports.nolog = function () {
    layout.pattern = "%[(%x{pid})%d %p%] %m";
    log4js.configure({
        appenders: [
            {type: 'console', layout: layout}
        ],
        replaceConsole: true
    });

};