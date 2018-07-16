//process.on('uncaughtException', function (err) {
//    console.error(err);
//    console.log(err.stack);
//    throw err;
//});
require('../lib/logs').nolog();

var mysql = require('../lib/mysql');
var tool = require('../lib/tool');
var API = require('../lib/api');
var config = require('../config');

require('./redis');

require('./web');

console.log('web run...');

