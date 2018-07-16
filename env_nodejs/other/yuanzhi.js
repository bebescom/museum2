var tool = require('../lib/tool');
var mysql = require('../lib/mysql');
var config = require('../config');
var start_time = 0;//tool.time('');

if (process.argv[2] === 'museum') {
    require('../lib/logs').nolog();
    startMuseum();
} else if (process.argv[2] === 'region') {
    require('../lib/logs').nolog();
    startRegion();
} else {
    require('../lib/logs').filelog('yuanzhi');
    startServer('museum');
    startServer('region');
}

function loginfo(str) {

    console.log("[32m(" + process.pid + ")" + tool.datetime('Y-m-d H:i:s.u') + " INFO[39m " + str);
}

function startServer(app) {
    loginfo('start ' + app + ' Server');

    var child_process = require('child_process');
    var server = child_process.spawn(process.execPath, [__filename, app]);
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
        loginfo(server.pid + app + ' Server exit code:' + code);
        server.kill(signal);
        setTimeout(function () {
            startServer(app);
        }, 5000);

    });
}

function startMuseum() {

    var lastReceiveTime = new Date().getTime();

    var connection = require('amqp').createConnection({url: config.rabbitMQUrl, heartbeat: 30}, {
        reconnect: true,
        reconnectBackoffTime: 500
    });

    connection.on('error', function (err) {
        console.error("Error from museum.amqp: ", err);
        // connection.disconnect();
        throw err;
    });

    connection.on('ready', function () {
        console.log('connect museum ready');
        connection.queue('upstream', {durable: true, autoDelete: false}, function (q) {
            // q.bind('#');
            console.log('upstream');
            q.subscribe({ack: true}, function (message, headers, deliveryInfo, messageObject) {
                lastReceiveTime = new Date().getTime();
                // Print messages to stdout
                console.log('receive', message);
                var json;
                try {
                    if (tool._.isObject(message) && message.data && !message.siteId) {
                        json = JSON.parse(message.data ? message.data.toString().replace(/\r\n/g, "") : '');
                    } else {
                        json = message;
                    }
                } catch (e) {
                    console.error(e);
                }

                if (!json) {//json解析错误
                    messageObject.acknowledge(false);
                    return;
                }
                console.log(json);
                if (tool._.isArray(json)) {
                    tool.async.each(json, function (msg, e_callback) {
                        addMsg(msg, lastReceiveTime, e_callback);
                    }, function () {
                        messageObject.acknowledge(false);
                    });
                } else if (tool._.isObject(json)) {
                    addMsg(json, lastReceiveTime, function (err) {
                        // console.log('ack');
                        messageObject.acknowledge(false);
                    });
                } else {
                    messageObject.acknowledge(false);
                }

            });
        });
    });

    var itime = setInterval(function () {
        if (tool.time() - parseInt(lastReceiveTime / 1000) > 30 * 60) {
            clearInterval(itime);
            connection.disconnect();
            throw 'timeout';
        }
    }, 120 * 1000);

}

function addMsg(msg, receive_time, end_callback) {

    if (!msg['siteId'] || !msg['eventType'] || !msg['resourceType'] || !msg['sourceId'] || !msg['data']) {
        end_callback && end_callback('msg param not find');
        return;
    }
    console.log('addMsg', msg);
    var yuanzhi_json = {
        siteId: msg.siteId,
        eventType: msg.eventType,
        resourceType: msg.resourceType,
        sourceId: msg.sourceId,
        data: JSON.stringify(msg.data),
        raw_data: JSON.stringify(msg),
        send: 0,
        server_time: receive_time,
    };

    mysql.query("insert ignore into _yuanzhi set ?", yuanzhi_json, function (err, result) {
        if (err) {
            console.error(err, this.sql);
            end_callback && end_callback(err);
            return;
        }

        var funcName = msg['resourceType'].toLowerCase() + '_' + msg['eventType'].toLowerCase();
        if (!tool._.has(resourceEvent, funcName)) {
            end_callback && end_callback(funcName + ' not find');
            return;
        }
        resourceEvent[funcName](msg, end_callback);

    });

}

var resourceEvent = {};

// resourceEvent.site_add = function (msg,end_callback) {
//     end_callback&&end_callback();
// };
// resourceEvent.site_update = function (msg,end_callback) {
//     end_callback&&end_callback();
// };
// resourceEvent.site_delete = function (msg,end_callback) {
//     end_callback&&end_callback();
// };

function areaAddUpdate(json, end_callback) {
    console.log('areaAddUpdate', json);
    mysql.query("select * from _yuanzhi_env where env_no=?", [json.env_no], function (err, docs) {
        if (err) {
            console.error(err, this.sql);
            end_callback && end_callback(err);
            return;
        }
        var sql = "insert into _yuanzhi_env set ?";
        if (docs.length) {
            sql = "update _yuanzhi_env set ? where id=" + docs[0].id;
        }

        mysql.query(sql, json, function (err, docs) {
            if (err) {
                console.error(err, this.sql);
                end_callback && end_callback(err);
                return;
            }
            end_callback && end_callback(null);

        });

    });

}

resourceEvent.zone_add = function (msg, end_callback) {
    var json = {};
    json.env_no = 'Y' + msg.sourceId;
    json.name = msg.data.name;
    json.type = '区域';
    if (msg.data.parentId) {
        json.parent_env_no = 'Y' + msg.data.parentId;
    }

    areaAddUpdate(json, end_callback);

};
resourceEvent.zone_update = function (msg, end_callback) {
    resourceEvent.zone_add(msg, end_callback);
};
// resourceEvent.zone_delete = function (msg,end_callback) {
//     end_callback&&end_callback();
// };

resourceEvent.location_add = function (msg, end_callback) {
    var json = {};
    json.env_no = 'Y' + msg.sourceId;
    json.name = msg.data.name;
    json.type = '位置';

    if (msg.data.zoneId) {
        json.parent_env_no = 'Y' + msg.data.zoneId;
    }
    areaAddUpdate(json, end_callback);

};
resourceEvent.location_update = function (msg, end_callback) {
    resourceEvent.location_add(msg, end_callback);
};
// resourceEvent.location_delete = function (msg,end_callback) {
//     end_callback&&end_callback();
// };

// resourceEvent.device_add = function (msg,end_callback) {
//     end_callback&&end_callback();
// };
// resourceEvent.device_update = function (msg,end_callback) {
//     end_callback&&end_callback();
// };
// resourceEvent.device_delete = function (msg,end_callback) {
//     end_callback&&end_callback();
// };


resourceEvent.sensordata_add = function (msg, end_callback) {
    //console.log(msg.data);
    var json = {};
    json.name = 'Y' + msg.data.locationId;
    json.equip_no = 'Y' + msg.data.deviceId;
    json.param = {};
    json.time = parseInt(+new Date(msg.data.time) / 1000);

    msg.data.sensors.forEach(function (sensor) {
        if (param[sensor.sensorId]) {
            json.param[param[sensor.sensorId].en] = sensor.sensorValue;
        }
    });
    sensorAddUpdate(json, end_callback);

};
resourceEvent.sensordata_update = function (msg, end_callback) {
    resourceEvent.sensordata_add(msg, end_callback);
};
// resourceEvent.sensordata_delete = function (msg,end_callback) {
//     end_callback&&end_callback();
// };

function sensorAddUpdate(json, end_callback) {
    console.log('sensorAddUpdate', json);
    mysql.query("select * from equip where equip_no=?", [json.equip_no], function (err, docs) {
        if (err) {
            console.error(err, this.sql);
            end_callback && end_callback(err);
            return;
        }

        if (docs.length) {
            insert_sensor(docs[0], json, end_callback);
            return;
        }

        var equip = {};
        equip.equip_no = json.equip_no;
        equip.name = json.name;
        equip.equip_type = '温湿度监测终端';
        equip.monitor_type = '仅监测';
        equip.status = '备用';
        equip.usage = '备用';
        equip.parameter = tool._.keys(json.param).join(',');
        equip.sleep = 1200;
        if (tool._.has(json.param, 'co2')) {
            equip.equip_type = '二氧化碳监测终端';
        }
        if (tool._.has(json.param, 'light')) {
            equip.equip_type = '光照紫外监测终端';
        }
        if (tool._.has(json.param, 'voc')) {
            equip.equip_type = '有机挥发物监测终端';
        }
        if (tool._.has(json.param, 'organic')) {
            equip.equip_type = '空气质量监测终端';
        }

        mysql.query("insert into equip set ?", equip, function (err) {
            if (err) {
                console.error(err, this.sql);
                end_callback && end_callback(err);
                return;
            }
            insert_sensor(equip, json, end_callback);
        });

    });

}


function insert_sensor(equip, json, end_callback) {

    console.log('insert into ', json);
    var sensor = {};
    sensor.equip_no = equip.equip_no;
    sensor.equip_time = json.time;
    sensor.server_time = json.time;
    sensor.env_no = equip.env_no;
    tool._.each(json.param, function (val, param) {
        sensor[param] = val;
    });

    mysql.query("select * from data_sensor where equip_no=? and equip_time=? limit 1", [sensor.equip_no, sensor.equip_time], function (err, docs) {
        if (err) {
            console.error(err, this.sql);
            end_callback && end_callback(err);
            return;
        }
        if (docs.length) {
            end_callback && end_callback();
            return;
        }
        mysql.query("insert into data_sensor set ?", sensor, function (err) {
            if (err) {
                console.error(err, this.sql);
                end_callback && end_callback(err);
                return;
            }
            var equip_upjson={};
            equip_upjson.last_equip_time=json.time;
            equip_upjson.parameter_val=JSON.stringify(json.param);

            mysql.query("update equip set ? where equip_no=?", [equip_upjson,sensor.equip_no], function (err) {
                if (err) {
                    console.error(err, this.sql);
                    end_callback && end_callback(err);
                    return;
                }
                end_callback && end_callback();
            });
        });

    });


}

function startRegion() {

    // var lastReceiveTime = tool.time();

    if (!config.region_rabbitMQUrl) {
        return;
    }

    var connection = require('amqp').createConnection({url: config.region_rabbitMQUrl, heartbeat: 30}, {
        reconnect: true,
        reconnectBackoffTime: 500
    });
    connection.on('error', function (err) {
        console.error("Error from region.amqp: ", err);
        // connection.disconnect();
        throw err;
    });
    connection.my_exchange = null;
    connection.on('ready', function () {
        console.log('connect region ready');
        connection.exchange('', {confirm: true}, function (exchange) {
            connection.my_exchange = exchange;
            _send();
        });

    });

    function _send() {
        get_yuanzhi_data(function (err, docs) {
            if (err) {
                setTimeout(_send, 5 * 1000);
                return;
            }
            if (!docs.length) {
                setTimeout(_send, 5 * 1000);
                return;
            }
            console.log('send region', docs.length);

            tool.async.each(docs, function (row, e_callback) {
                var timeout = setTimeout(function () {
                    timeout = null;
                    e_callback && e_callback('publish timeout ' + row.id);
                }, 10000);
                connection.my_exchange.publish('upstream', row.raw_data, {}, function (err) {
                    if (!timeout) {
                        return;
                    }
                    clearTimeout(timeout);
                    if (err) {
                        console.error(err);
                        e_callback && e_callback('publish error ' + row.id);
                        return;
                    }
                    console.log('send_region 1');
                    send_region_end(row, 1, function () {
                        e_callback && e_callback();
                    });
                });

            }, function (err, is) {
                if (err) {
                    console.error(err);
                }
                setTimeout(_send, 1000);
            });
        });
    }

}

function send_region_end(msg, send, callback) {

    mysql.query("update _yuanzhi set send=? where id=?", [send, msg.id], function (err) {
        if (err) {
            console.error(err, this.sql);
        }
        callback && callback(err);
    });

}

function get_yuanzhi_data(callback) {

    mysql.query("select * from _yuanzhi where send=0 order by server_time asc,id asc limit 500", function (err, docs) {
        if (err) {
            console.error(err, this.sql);
            callback && callback(err);
            return;
        }
        callback && callback(null, docs);
    });

}


var param = {
    0x1000: {name: '温度', en: 'temperature', type: 'int2'},
    0x1001: {name: '温度', en: 'temperature', type: 'ieee754'},
    0x1002: {name: '大气相对湿度', en: 'humidity', type: 'int2'},
    0x1003: {name: '大气相对湿度', en: 'humidity', type: 'ieee754'},
    0x1004: {name: '光照度', en: 'light', type: 'uint4'},
    0x1005: {name: '光照度', en: 'light', type: 'uint2'},
    0x1006: {name: '光照度', en: 'light', type: 'ieee754'},
    0x1007: {name: '紫外线强度', en: 'uv', type: 'ieee754'},
    0x1008: {name: '紫外线强度', en: 'uv', type: 'uint4'},
    0x1009: {name: '紫外线强度', en: 'uv', type: 'uint2'},
    0x100a: {name: '二氧化碳浓度', en: 'co2', type: 'ieee754'},
    0x100b: {name: '二氧化碳浓度', en: 'co2', type: 'uint2'},
    0x100c: {name: '有机挥发物总量', en: 'voc', type: 'ieee754'},
    0x100d: {name: '有机挥发物总量', en: 'voc', type: 'uint2'},
    0x100e: {name: '有机污染物环境质量综合评估(当量浓度)', en: 'organic', type: 'ieee754'},
    0x100f: {name: '无机污染物环境质量综合评估(当量浓度) ', en: 'inorganic', type: 'ieee754'},
    0x1010: {name: '含硫污染物环境质量综合评估(当量浓度) ', en: 'sulfur', type: 'ieee754'}
};