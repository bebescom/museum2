require('../lib/logs').nolog();

var API = require('../lib/api');
var tool = require('../lib/tool');
var ini = require('../lib/ini');
var root = ini.get('MUSEUM_REGION_ROOT');
var _ = tool._;

if (!root) {
    return;
}

console.log('region run...');

var argv = process.argv;
if (argv.length > 2) {
    require('./' + argv[2]).start(function () {
        process.exit(0);
    });
    return;
}
var schedule = require("node-schedule");
schedule.scheduleJob('*/10 * * * *', function () {
    setTimeout(function () {
        require('./env').start();//每10分钟执行一次
    }, _.random(0, 100) * 1000);
    setTimeout(function () {
        require('./equip').start();//每10分钟执行一次
    }, _.random(0, 100) * 1000);
    setTimeout(function () {
        require('./sensor').start();//每10分钟执行一次
    }, _.random(0, 100) * 1000);
    setTimeout(function () {
        require('./alert').start();//每10分钟执行一次
    }, _.random(0, 100) * 1000);
});

schedule.scheduleJob('0 * * * *', function () {
    setTimeout(function () {
        require('./statistic').start();//每小时执行一次
    }, _.random(0, 100) * 1000);

});







