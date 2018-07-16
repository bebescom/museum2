var fs = require('fs');
var path = require('path');
var API = require('../../../lib/api');
var tool = require('../../../lib/tool');
var exec = require('child_process').exec;

exports.start = function (date, cl_param) {
    console.time('quarter');

    var urls = [];//要执行的

    urls.push({url: 'get/report/museum/temperature', param: 'temperature', name: 'museum_temperature'});
    urls.push({url: 'get/report/museum/humidity', param: 'humidity', name: 'museum_humidity'});
    urls.push({url: 'get/report/museum/light', param: 'light', name: 'museum_light'});
    urls.push({url: 'get/report/museum/uv', param: 'uv', name: 'museum_uv'});
    urls.push({url: 'get/report/museum/co2', param: 'co2', name: 'museum_co2'});
    urls.push({url: 'get/report/museum/voc', param: 'voc', name: 'museum_voc'});

    var start_time = new Date().getTime();
    get_report_tree(date, function (err, report) {
        if (err) {
            console.error(err);
            process.exit(1);
            return;
        }

        if (report.envs) {
            tool._.each(report.envs, function (env) {
                urls.push({url: 'get/report/hall', env_no: env.env_no, name: 'hall_' + env.env_no});
                urls.push({
                    url: 'get/report/hall',
                    param: 'th_analyze',
                    env_no: env.env_no,
                    name: 'hall_' + env.env_no + '_th_analyze'
                });
                urls.push({
                    url: 'get/report/hall',
                    param: 'temperature',
                    env_no: env.env_no,
                    name: 'hall_' + env.env_no + '_temperature'
                });
                urls.push({
                    url: 'get/report/hall',
                    param: 'humidity',
                    env_no: env.env_no,
                    name: 'hall_' + env.env_no + '_humidity'
                });
                urls.push({
                    url: 'get/report/hall',
                    param: 'light',
                    env_no: env.env_no,
                    name: 'hall_' + env.env_no + '_light'
                });
                urls.push({
                    url: 'get/report/hall',
                    param: 'uv',
                    env_no: env.env_no,
                    name: 'hall_' + env.env_no + '_uv'
                });
                urls.push({
                    url: 'get/report/hall',
                    param: 'co2',
                    env_no: env.env_no,
                    name: 'hall_' + env.env_no + '_co2'
                });
                urls.push({
                    url: 'get/report/hall',
                    param: 'voc',
                    env_no: env.env_no,
                    name: 'hall_' + env.env_no + '_voc'
                });
                urls.push({
                    url: 'get/report/hall',
                    param: 'regulation',
                    env_no: env.env_no,
                    name: 'hall_' + env.env_no + '_regulation'
                });
            });
        }
        if (report.storerooms) {
            tool._.each(report.storerooms, function (env) {
                urls.push({
                    url: 'get/report/storeroom/has_data',
                    floor_no: env.env_no,
                    name: 'storeroom_' + env.env_no + '_has_data'
                });
                urls.push({
                    url: 'get/report/storeroom',
                    type: '库房',
                    floor_no: env.env_no,
                    name: 'storeroom_' + env.env_no
                });
                urls.push({
                    url: 'get/report/storeroom/light_uv',
                    type: '库房',
                    floor_no: env.env_no,
                    name: 'storeroom_' + env.env_no + '_light_uv'
                });
                urls.push({
                    url: 'get/report/storeroom/voc_co2',
                    type: '库房',
                    floor_no: env.env_no,
                    name: 'storeroom_' + env.env_no + '_voc_co2'
                });
            });
        }

        tool.async.series([function (callback) {
            console.log('获取数据...', urls.length);
            require('./data').get_data(report, urls, function (err) {
                console.log('获取数据完成');
                callback(err);
            });
        }, function (callback) {
            console.log('生成图片...');
            require('./img').generate_img(report.id, function (err) {
                console.log('生成图片完成');
                callback(err);
            });
        }, function (callback) {
            console.log('生成word...');
            require('./docx').generate_docx(report.id, function (err, result) {

                if (result.file) {
                    report.report_file = result.file;
                }
                console.log('生成word完成');
                callback(err);
            });
        }], function (err) {
            if (err) {
                console.error(err);
            }

            var end_time = new Date().getTime();
            report.generate_total_time = parseInt((end_time - start_time) / 1000);
            report_end(err, report, function () {
                console.timeEnd('quarter');
                process.exit();
            });
        });

    });

};


function get_report_tree(date, callback) {
    // callback(null, 1);
    // return;
    if (!date || !/^[0-9-]{4,}$/g.test(date)) {
        callback('date formatter error ' + date);
        return;
    }
    var report_json = {};
    var $date, $year, $month;

    switch (date.length) {
        case 4://年度 2017
            report_json.report_name = date + '年';
            report_json.report_type = '年度报表';
            report_json.report_time_range = date + '0101-' + date + '1231';

            break;
        case 5://季度 2017[1-4]

            $year = date.slice(0, 4);
            var $quarter = date[4] * 1;
            var quarters = ['', '一', '二', '三', '四'];
            if (!quarters[$quarter]) {
                callback('季度错误:' + $quarter);
                return;
            }
            report_json.report_name = $year + '年第' + quarters[$quarter] + '季度';
            report_json.report_type = '季度报表';
            report_json.report_time_range = $year + '' + tool.pad($quarter * 3 - 2, 2) + '01' +
                '-' +
                $year + '' + tool.pad($quarter * 3, 2) + '' + (($quarter === 2 || $quarter === 3) ? '30' : '31');

            break;
        case 6://月度 201705,年月

            $date = new Date(date.slice(0, 4), date.slice(4), 0);
            $year = $date.getFullYear();
            $month = $date.getMonth() + 1;
            report_json.report_name = $year + '年' + $month + '月';
            report_json.report_type = '月度报表';
            report_json.report_time_range = $year + '' + tool.pad($month, 2) + '01' +
                '-' +
                $year + '' + tool.pad($month, 2) + '' + $date.getDate();

            break;
        case 17://20170501-20170601  指定日期
            report_json.report_name = date;
            report_json.report_type = '自定义时间';
            report_json.report_time_range = date;

            break;
        default:
            callback('not allow date:' + date);
            return;
    }

    report_json.generate_status = '生成中';
    report_json.generate_time = tool.time();
    report_json.generate_total_time = 0;
    report_json.del_all = 1;

    var report = {};
    tool.async.auto({
        generate: function (a_callback) {
            API('post/report/report/generate', report_json, function (err, json) {
                if (err) {
                    a_callback(err);
                    return;
                }
                if (json.error) {
                    a_callback(json.error);
                    return;
                }
                if (!json.id) {
                    a_callback('report_id not find');
                    return;
                }
                console.log('report_id', json.id);

                var img_path = path.normalize(__dirname + '/../img/' + json.id);
                exec("rm -rf " + img_path + '&&mkdir ' + img_path, function (err) {
                    if (err) {
                        console.error(err);
                        a_callback('mkdir fail');
                        return;
                    }
                    report = json;
                    a_callback(null);
                });

            });
        },
        get_envs: ['generate', function (a_callback) {

            API("post/base/envs", {type: "展厅"}, function (err, rt) {
                if (err) {
                    a_callback(err);
                    return;
                }
                if (rt.error) {
                    a_callback(rt);
                    return;
                }
                if (!rt.total) {
                    console.warn('envs.total is 0');
                    a_callback();
                    return;
                }
                var envs = {};
                tool._.each(rt.rows, function (row) {
                    envs[row.name] = row;
                });
                report.envs = envs;
                a_callback();

            });

        }],
        get_units: ['generate', function (a_callback) {

            API("get/env/equipments/equip_parameters", {}, function (err, rt) {
                if (err) {
                    a_callback(err);
                    return;
                }
                if (rt.error) {
                    a_callback(rt);
                    return;
                }
                if (!rt.sensor) {
                    a_callback('units.sensor not find', rt);
                    return;
                }

                var unit = {};
                tool._.each(rt.sensor, function (row, param) {
                    if (param) {
                        unit[param] = row.unit;
                    }
                });
                report.unit = unit;
                a_callback();

            });

        }],
        get_storerooms: ['generate', function (a_callback) {

            API("post/base/envs", {type: "楼层"}, function (err, rt) {
                if (err) {
                    a_callback(err);
                    return;
                }
                if (rt.error) {
                    a_callback(rt);
                    return;
                }
                if (!rt.total) {
                    console.warn('storerooms.total is 0');
                    a_callback();
                    return;
                }
                var envs = {};
                tool._.each(rt.rows, function (row) {
                    envs[row.name] = row;
                });
                report.storerooms = envs;
                a_callback();

            });

        }]
    }, function (err) {
        if (err) {
            // console.error(err);
            callback(err);
            return;
        }

        callback(null, report);

    });

}


//生成报表完成
function report_end(err, report, callback) {
    var report_json = {};
    report_json.report_name = report.report_name;
    report_json.generate_status = err ? '生成失败' : '已生成';
    report_json.generate_time = tool.time();
    report_json.generate_total_time = report.generate_total_time;
    if (report.report_file) {
        report_json.report_file = report.report_file;
    }
    // console.log(report_json);
    API('post/report/report/generate', report_json, function (err, json) {
        if (err) {
            console.error(err);
            callback();
            return;
        }
        if (json.error) {
            console.error(json.error);
            callback();
            return;
        }
        if (!json.id) {
            console.error('report_id not find');
            callback();
            return;
        }
        console.log('报告生成完成');
        callback();
    });

}


//
// setInterval(function () {
//     console.log(process.memoryUsage());
// }, 1000);
