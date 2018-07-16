/**
 * Created by Hebj on 2017/11/1.
 */
require('../lib/logs').filelog('cron', 1);

var API = require('../lib/api');
var tool = require('../lib/tool');

var schedule = require("node-schedule");

schedule.scheduleJob('30 9 * * *', function ()
{
    console.time('copy_data');
    API('get/env/cli/copy_data', function (err, result) {
        console.timeEnd('copy_data');
        if (err) {
            console.error(err);
            return;
        }
        console.log(result);
    });
});

