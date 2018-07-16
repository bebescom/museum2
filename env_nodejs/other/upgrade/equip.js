// node run equip

require('../../lib/logs').nolog();
var mongodb = require('mongodb');
var mysql = require('../../lib/mysql');
var tool = require('../../lib/tool');
var config = require('../../config');

var MongoClient = mongodb.MongoClient;

MongoClient.connect(config.mongodb_url, function (err, db) {
    console.log("============equip==============");
    console.time('equip');
    tool.async.auto({
        equip2: function (callback) {
            mysql.query("select * from equip ", function (err, docs) {
                if (err)throw err;
                var equips = {};
                tool._.each(docs, function (row) {
                    equips[row.equip_no] = row;
                });
                callback(null, equips);
            });
        },
        area: function (callback) {
            var area = db.collection('area.base');
            area.find({}).toArray(function (err, docs) {
                if (err)throw err;
                var envs = {};
                tool._.each(docs, function (row) {
                    envs[row._id.toString()] = row;
                });
                callback(null, envs);
            });
        },
        equip1: function (callback) {
            var equipment = db.collection('equipment');
            equipment.find({}).toArray(function (err, docs) {
                if (err)throw err;
                var equips = {};
                tool._.each(docs, function (row) {
                    equips[row.equip_id] = row;
                });
                callback(null, equips);
            });
        },
        new_equips: ['equip1', 'equip2', 'area', function (callback, results) {
            var data = {key: [], val: []};

            tool._.each(results.equip1, function (row) {
                if (!results.equip2[row.equip_id]) {
                    var json = {};
                    var sensor_tip = row.equip_id.slice(-11, -8);
                    json.equip_no = row.equip_id;
                    json.name = row.equip_name;
                    json.equip_type = row.equip_type;
                    json.monitor_type = row.type;
                    if (equip_types[sensor_tip]) {
                        json.equip_type = equip_types[sensor_tip].equip_type;
                        json.monitor_type = equip_types[sensor_tip].monitor_type;
                    } else if (equip_types[row.equip_type]) {
                        json.equip_type = equip_types[row.equip_type].equip_type;
                        json.monitor_type = equip_types[row.equip_type].monitor_type;
                    }

                    json.status = row.status;
                    // json.usage = row.use_situation;
                    json.env_no = '';
                    if (results.area[row.equip_position.toString()]) {
                        json.env_no = results.area[row.equip_position.toString()].No;
                    }

                    json.parameter = row.parameter.join(',');
                    json.sleep = row.sleep;
                    json.ip_port = row.ip;

                    data.key = tool._.keys(json);
                    data.val.push(tool._.values(json));

                    console.log(json);
                }
            });

            // console.log(data);
            if (!data.val.length) {
                callback && callback(null, data);
            }
            mysql.query("insert into equip (" + data.key.join(',') + ") values ?", [data.val], function (err) {
                if (err) {
                    console.log(this.sql);
                    throw err;
                }
                callback && callback(null, data);
            });


        }]
    }, function (err) {
        if (err) {
            console.error(err);
            return;
        }
        console.timeEnd('equip');
        process.exit();
    });

});

var equip_types = {
    '001': {equip_type: "温湿度传感器", monitor_type: "仅监测"},
    '002': {equip_type: "调湿机", monitor_type: "主动调控"},
    '003': {equip_type: "中继", monitor_type: "网络设备"},
    '004': {equip_type: "网关", monitor_type: "网络设备"},
    '007': {equip_type: "智能囊匣传感器", monitor_type: "智能囊匣"},
    '008': {equip_type: "智能展柜传感器", monitor_type: "主动调控"},
    '009': {equip_type: "带屏温湿度传感器", monitor_type: "仅监测"},
    '010': {equip_type: "二氧化碳传感器", monitor_type: "仅监测"},
    '011': {equip_type: "光照紫外传感器", monitor_type: "仅监测"},
    '012': {equip_type: "有机挥发物传感器", monitor_type: "仅监测"},
    'voc_sensor': {equip_type: "有机挥发物传感器", monitor_type: "仅监测"},
    '013': {equip_type: "空气质量传感器", monitor_type: "仅监测"},
    '014': {equip_type: "气象站", monitor_type: "仅监测"},
    '015': {equip_type: "土壤温湿度传感器", monitor_type: "仅监测"},
    '016': {equip_type: "充氮调湿柜", monitor_type: "调控设备"},
    '017': {equip_type: "震动传感器", monitor_type: "仅监测"},
    '018': {equip_type: "安防传感器", monitor_type: "仅监测"},
};
equip_types['th_sensor'] = equip_types['001'];
equip_types['controller'] = equip_types['002'];
equip_types['repeater'] = equip_types['003'];
equip_types['gateway'] = equip_types['004'];
equip_types['rfid'] = equip_types['005'];
equip_types['offline'] = equip_types['006'];
equip_types['box_sensor'] = equip_types['007'];
equip_types['sc_sensor'] = equip_types['008'];
equip_types['sth_sensor'] = equip_types['009'];
equip_types['co2_sensor'] = equip_types['010'];
equip_types['lu_sensor'] = equip_types['011'];
equip_types['voc_sensor'] = equip_types['012'];
equip_types['qcm_sensor'] = equip_types['013'];