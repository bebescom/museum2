var tool = require('../../lib/tool');
var config = require('../../config');
var mysql = require('../../lib/mysql');
var API = require('../../lib/api');
var ini = require('../../lib/ini');
var fs = require('fs');
var path = require('path');

var getData = require('./model/get_data').getData;

var router = require('express').Router();

module.exports = router;

router.all('/db', function (req, res) {

    mysql.query("SELECT `SCHEMA_NAME` as db_name FROM `information_schema`.`SCHEMATA` where SCHEMA_NAME like '%_report'", function (err, docs) {
        if (err) throw err;

        mysql.query("SELECT max(equip_time) as max_equip_time,min(equip_time) as min_equip_time FROM `data_sensor` where equip_time<?", [tool.time()], function (err, results) {
            if (err) throw err;

            API('get/base/config', function (err, json) {
                if (err) throw err;

                res.send({
                    list: docs,
                    now: ini.get('MUSEUM_DB_NAME_PREFIX') + '_report',
                    max_equip_time: results[0].max_equip_time,
                    min_equip_time: results[0].min_equip_time,
                    museum_name: json.museum_name,
                });
            });

        });
    });

});
router.all('/list', function (req, res) {


    mysql.query("select * from " + ini.get('MUSEUM_DB_NAME_PREFIX') + "_report.report order by generate_time desc", function (err, docs) {
        if (err) throw err;
        res.send(docs);
    });

});

router.all('/change_db', function (req, res) {

    var db = req.body.db;
    if (!db) {
        res.send({'error': '参数不足'});
    }
    mysql.query("SELECT `SCHEMA_NAME` as db_name FROM `information_schema`.`SCHEMATA` where SCHEMA_NAME like '%_report'", function (err, docs) {
        if (err) throw err;
        if (docs.length <= 1) {
            res.send({'error': '不能切换数据源'});
            return;
        }

        ini.set('MUSEUM_DB', 'MUSEUM_DB_NAME_PREFIX', db.replace('_report', ''));
        ini.save();

        res.send('ok');

        setTimeout(function () {
            process.exit(1);
        }, 1000);

    });


});

router.all('/down', function (req, res) {
    if (!req.query.file) {
        res.send('null');
        return;
    }
    var $url = 'http://' + ini.get('MUSEUM_WEB_HOST') + ':' + ini.get('MUSEUM_WEB_PORT') + req.query.file;
    var file_name = path.basename(req.query.file);
    // res.send(url);
    res.attachment(file_name);
    require('request').get(encodeURI($url)).pipe(res);

});

router.all('/image', function (req, res) {
    if (!req.query.file) {
        res.send('null');
        return;
    }
    var $url = 'http://' + ini.get('MUSEUM_WEB_HOST') + ':' + ini.get('MUSEUM_WEB_PORT') + req.query.file;
    require('request').get(encodeURI($url)).pipe(res);

});

router.all('/info', function (req, res) {
    var key = req.body.key;
    var table = req.body.table;
    var report_id = req.body.report_id;
    if (!report_id || !table) {
        res.send({'error': '参数不足'});
        return;
    }
    var where = [];
    where.push("report_id=" + report_id);

    var tables = {
        'content': {key: 'content_key', filed: ''},
        'images': {key: 'image_key', filed: ''},
        'table_data_desc': {key: 'CONCAT_WS(sheet_name,env_name)', filed: ''},
        'table_rang_std_date': {key: 'CONCAT_WS(sheet_name,env_name)', filed: ''},
        'table_rang_std_day': {key: 'CONCAT_WS(sheet_name,env_name)', filed: ''}
    };
    if (!tables[table]) {
        res.send({'error': '参数不足'});
        return;
    }
    if (key) {
        where.push(tables[table].key + " like '%" + key + "%'");
    }

    getData({
        req: req,
        table: ini.get('MUSEUM_DB_NAME_PREFIX') + '_report.' + table,
        where: where,
        order: 'id desc'
    }, function (err, result) {
        if (err) {
            console.error(err);
            return;
        }
        res.send(result);
    });

});
