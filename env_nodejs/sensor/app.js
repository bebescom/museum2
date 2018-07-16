//process.on('uncaughtException', function (err) {
//    console.error(err);
//    console.log(err.stack);
//    throw err;
//});
require('../lib/logs').nolog();

var mysql = require('../lib/mysql');
var API = require('../lib/api');
var tool = require('../lib/tool');
var config = require('../config');


require('./index').start();

require('./redis');


console.log('sensor run...');

