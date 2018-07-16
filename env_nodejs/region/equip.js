var API = require('../lib/api');
var tool = require('../lib/tool');
var http = require('http');
var fs = require('fs');
var ini = require('../lib/ini');
var UPAPI = require('./up');

var cache_equips = {};

exports.start = function (callback) {
    console.log('start get equip');
    get_equip(function (err, equips) {
        if (err) {
            console.error(err);
            callback && callback();
            return;
        }
        console.log('start up equip', equips.length);
        // fs.writeFileSync('equips.json', JSON.stringify(equips));
        if (JSON.stringify(cache_equips) === JSON.stringify(equips)) {
            console.log('nothing update env');
            callback && callback();
            return;
        }
        cache_equips = equips;

        UPAPI('post/env/equip/list', {param: JSON.stringify(equips)}, function (err, result) {
            if (err) {
                console.error(err);
                callback && callback();
                return;
            }
            console.log('up equip end', result);
            callback && callback();
        });
    });
};

function get_equip(callback) {

    API('get/env/equipments/manage/equip_list', {limit: 10000}, function (err, result) {
        if (err) {
            console.error(err);
            callback(1);
            return;
        }
        if (!result || !result.rows.length) {
            console.warn('equip.rows.length=0');
            callback(1);
            return;
        }
        var equips = [];
        tool.async.each(result.rows, function (row, e_callback) {
            var equip = {};
            equip.No = row.equip_no;
            equip.name = row.name;
            equip.type = row.equip_type;
            equip.envNo = row.env_no;
            equip.status = row.status;
            equip.parameter = row.parameter;
            equip.sleep = row.sleep;
            equip.factory = '智联';
            equip.note = '';
            equips.push(equip);
            e_callback && e_callback();
        }, function (err) {
            if (err) {
                console.error(err);
                return;
            }
            callback(null, equips);

        });
    });

}