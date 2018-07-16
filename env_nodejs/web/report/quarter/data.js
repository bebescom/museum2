var API = require('../../../lib/api');
var tool = require('../../../lib/tool');
var ini = require('../../../lib/ini');
var _ = tool._;
var fs = require('fs');
var path = require('path');
var cpuNum = require('os').cpus().length;
var request = require('request');

exports.get_data = function (report, urls, callback) {
    var report_path = __dirname + '/../img/' + report.id;
    var runs = {};
    if (cpuNum > 4) {
        cpuNum = 4;
    }
    if (ini.get('MUSEUM_DB_NAME_PREFIX') === 'cb') {
        cpuNum = 2;
    }
    var total = urls.length;
    var dbs = [];
    tool.async.forEachOfLimit(urls, cpuNum, function (row, i, e_callback) {
        var index = i + 1;
        console.log('start', index + '/' + total, row.name);
        row.report_id = report.id;

        runs[index] = {
            name: row.name,
            start_time: tool.time(),
        };

        API(row.url, row, function (err, json) {

            row.total_time = (tool.time() - runs[index].start_time);

            console.log('end', index + '/' + total, row.name, row.total_time + 's');

            row.json = json;

            if (err) {
                console.error('get_data err', row, err);
            }
            dbs.push(row);
            delete runs[index];

            if (json && json.data && json.data.map) {
                var $url = 'http://' + ini.get('MUSEUM_WEB_HOST') + ':' + ini.get('MUSEUM_WEB_PORT') + json.data.map;
                var file_name = path.basename(json.data.map);
                try {
                    request($url).pipe(fs.createWriteStream(path.normalize(report_path + '/' + file_name)));
                } catch (e) {
                    //console.error(e);
                }

            }

            e_callback(err);
        });

    }, function (err) {
        try {
            fs.writeFileSync(path.normalize(report_path + '/db.json'), JSON.stringify(dbs, null, 2));
        } catch (e) {
            console.error(e);
        }

        clearInterval($time);
        callback(err);

    });

    var $time = setInterval(function () {
        var now_runs = [];
        tool._.each(runs, function (run) {
            var time = tool.time() - run.start_time;
            if (time > 30) {
                var runtime = time + 's';
                if (time > 60) {
                    runtime = parseInt(time / 60) + 'm' + parseInt(time % 60) + 's';
                }
                now_runs.push({name: run.name, runtime: runtime});
            }
        });
        if (now_runs.length) {
            console.log('等待数据...', now_runs);
        }
    }, 30000);

};