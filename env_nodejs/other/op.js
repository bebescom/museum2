var mysql = require('../lib/mysql');
var tool = require('../lib/tool');
var API = require('../lib/api');
var config = require('../config');
var fs = require('fs');
var request = require('request');
var querystring = require('querystring');

var op_option, web_config, envs;
exports.start = function () {

    op_option = {};
    var op_file = __dirname + '/../logs/op.json';
    try {
        op_option = JSON.parse(fs.readFileSync(op_file));
    } catch (e) {
    }
    op_option.equip_alert_id = op_option.equip_alert_id || 0;
    if (!op_option.equip_alert_fail_ids) {
        op_option.equip_alert_fail_ids = {};
    }

    API('get/base/config', function (err, result) {
        if (err) {
            console.error(err);
            return;
        }
        web_config = result;
        API('get/base/envs', function (err, data) {
            if (err) {
                console.error(err);
                return;
            }
            if (!data || !data.total) {
                return;
            }
            envs = {};
            tool._.each(data.rows, function (row) {
                envs[row.env_no] = row;
            });
            tool._.each(data.rows, function (row) {
                if (envs[row.parent_env_no]) {
                    envs[row.env_no].parent_env_name = envs[row.parent_env_no].name;
                }
            });
            sync_equip_alert(function (err) {
                if (err) {
                    return;
                }
                fs.writeFileSync(op_file, JSON.stringify(op_option, 2));
            });
        });

    });


};

function sync_equip_alert(callback) {
    mysql.query("select o.*,e.equip_no as equip_id,e.name,e.env_no as parent_env_no,e.equip_type,e.status,e.last_equip_time from equip_operation o,equip e where o.equip_no=e.equip_no and o.operator='后台系统' and o.id>? order by id asc limit 100", [op_option.equip_alert_id], function (err, docs) {
        if (err) {
            console.error(err);
            callback && callback(err);
            return;
        }
        if (!docs.length) {
            callback && callback('no');
            return;
        }

        tool.async.eachSeries(docs, function (row, e_callback) {
            if (!row.equip_id) {
                e_callback();
                return;
            }
            var json = {};

            json.equipNo = row.equip_no;
            json.name = row.name;
            json.museumNo = web_config.museum_no;
            json.equipType = row.equip_type;
            json.position="";
            if(envs[row.parent_env_no]){
                json.position = (envs[row.parent_env_no].parent_env_name ? envs[row.parent_env_no].parent_env_name + '>' : '') + envs[row.parent_env_no].name;
            }

            json.equipTime = row.last_equip_time * 1;
            json.status = row.status;
            if (row.remark.indexOf('正常=》异常') !== -1) {
                json.status = '异常';
            } else if (row.remark.indexOf('=》正常') !== -1) {
                json.status = '正常';
            } else if (row.remark.indexOf('设备电压变为低电') !== -1) {
                json.status = '低电';
            }
            if (json.status !== '正常') {
                json.alertTime = row.operation_time;
                json.alertRemark = row.remark;
                json.alertType = row.operation;
            }

            var option = {
                method: 'post',
                uri: 'http://mpecs.zillions.com.cn:10005/op/equipService/equips/add?' + querystring.stringify(json),
                headers: {
                    token: '60021539dfce93c49bb4c21c42e2c18b'
                },
                timeout: 10 * 1000,
            };

            console.log('zl_op send...', JSON.stringify(json));
            request(option, function (err, response, body) {
                console.log('zl_op send end...');
                if (err) {
                    console.error('zl_op err', err);
                    e_callback && e_callback(err);
                    return;
                }
                console.log('statusCode:', response && response.statusCode);

                var data;
                if (tool._.isString(body)) {
                    try {
                        data = JSON.parse(body);
                    } catch (e) {
                        //console.error(e, body);
                    }
                } else {
                    data = body;
                }

                if (!data || [0, 200, 500].indexOf(data.error_code) === -1) {
                    console.error('op no return data', option, body);
                    if (!op_option.equip_alert_fail_ids[row.id]) {
                        op_option.equip_alert_fail_ids[row.id] = 0;
                    }
                    op_option.equip_alert_fail_ids[row.id]++;
                    e_callback && e_callback('op no return data');
                    return;
                }
                op_option.equip_alert_id = row.id;

                e_callback();
            });

        }, function () {
            callback && callback();
        });


    });

}