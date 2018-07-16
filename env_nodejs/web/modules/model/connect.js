var tool = require('../../../lib/tool');
var mysql = require('../../../lib/mysql');
var getData = require('./get_data').getData;

exports.connectList = function (req, res) {
    var ktime = req.body.ktime;
    var dtime = req.body.dtime;
    var ksensor_no = req.body.ksensor_no;
    var dsensor_no = req.body.dsensor_no;
    var page = parseInt(req.body.page) || 1;
    var rows = parseInt(req.body.rows) || 10;

    var where = [], connect_time_where = [];

    var str;
    if (ktime) {
        str = "connect_time >= " + new Date(ktime).getTime();
        where.push(str);
        connect_time_where.push(str);
    }
    if (dtime) {
        str = "connect_time <= " + new Date(dtime).getTime();
        where.push(str);
        connect_time_where.push(str);
    }

    if (ksensor_no) {
        where.push("sensor_no >=" + ksensor_no);
    }
    if (dsensor_no) {
        where.push("sensor_no <=" + dsensor_no);
    }

    var offset = (page - 1) * rows;

    var result = {total: 0, rows: []};

    var where_str = ' 1=1 ', connect_time_where_str = ' 1=1 ';

    if (where.length > 0) {
        where_str = where.join(' and ');
    }
    if (connect_time_where.length > 0) {
        connect_time_where_str = connect_time_where.join(' and ');
    }
    var dsql = "select * from " +
        "(select sensor_no,max(connect_time) as connect_time from _data_sensor_connect where " + connect_time_where_str + " group by sensor_no order by connect_time desc) as t" +
        " where " + where_str + " order by connect_time desc";

    // console.log(dsql);
    // console.time('dsql');
    mysql.query(dsql,
        function (err, docs) {
            if (err) {
                console.error(err);
                return;
            }
            // console.timeEnd('dsql');
            if (!docs.length) {
                res.send(result);
                return;
            }

            result.total = docs.length;

            docs = docs.slice(offset, offset + rows);
            var ids = [];
            tool._.each(docs, function (doc) {
                ids.push(doc.sensor_no);
            });
            var sql = "select id,type,sensor_no,`repeat`,lost_frame,lost,connect_time" +
                " from _data_sensor_connect " +
                "where sensor_no in ('" + ids.join("','") + "') and " + connect_time_where_str + "" +
                " order by connect_time desc";
            // console.log(sql);
            // console.time('sql_row');
            mysql.query(sql, function (err, sensors) {
                if (err) {
                    console.error(err);
                    return;
                }
                // console.timeEnd('sql_row');
                if (!sensors.length) {
                    res.send(result);
                    return;
                }
                var datas = {};
                sensors.forEach(function (row) {

                    if (!datas[row.sensor_no]) {
                        datas[row.sensor_no] = {
                            sensor_no: row.sensor_no,
                            connect_time: row.connect_time,
                            total: 0,
                            total_no_repeat: 0,
                            total_repeat: 0,
                            total_lost_frame: 0
                        };
                    }
                    if (row.type === 'up') {
                        datas[row.sensor_no].total++;

                        if (!row.repeat) {
                            datas[row.sensor_no].total_no_repeat++;
                            if (row.lost_frame) {
                                datas[row.sensor_no].total_lost_frame++;
                            }
                        } else {
                            datas[row.sensor_no].total_repeat++;
                        }
                    }
                });
                result.rows = tool._.values(datas);
                res.send(result);
            });

        });


};

exports.connectTimeOutList = function (req, res) {

    var ktime = req.body.ktime;
    var dtime = req.body.dtime;
    var ksensor_no = req.body.ksensor_no;
    var dsensor_no = req.body.dsensor_no;

    var where = [];

    if (ktime) {
        var mintime = tool.time(ktime);
        where.push("out_time >=" + mintime);
    }
    if (dtime) {
        var maxtime = tool.time(dtime);
        where.push("out_time <=" + maxtime);
    }

    if (ksensor_no) {
        where.push("sensor_no >=" + ksensor_no);
    }
    if (dsensor_no) {
        where.push("sensor_no <=" + dsensor_no);
    }

    getData({req: req, table: '_data_sensor_timeout', where: where}, function (err, result) {
        if (err) {
            console.error(err);
            return;
        }
        res.send(result);
    });

};

exports.connectShow = function (req, res) {
    var sensor_no = req.body.sensor_no;
    var ktime = req.body.ktime;
    var dtime = req.body.dtime;
    var type = req.body.type;

    var where = [];

    if (ktime) {
        var mintime = new Date(ktime).getTime();//tool.time(ktime);
        where.push("connect_time >=" + mintime);
    }
    if (dtime) {
        var maxtime = new Date(dtime).getTime();//tool.time(dtime);
        where.push("connect_time <=" + maxtime);
    }
    if (type) {
        where.push("type ='" + type + "'");
    }

    where.push("sensor_no='" + sensor_no + "'");

    getData({
        req: req,
        table: '_data_sensor_connect',
        where: where,
        order: 'connect_time desc'
    }, function (err, result) {
        if (err) {
            console.error(err);
            return;
        }
        res.send(result);
    });

};


exports.editTimeout = function (req, res) {
    var time = req.body.time * 1;

    if (!tool._.isNumber(time)) {
        res.send({error: '超时时间必须为整数'});
        return;
    }

    var ini = require('../../../lib/ini');

    ini.set('MUSEUM_NT', 'MUSEUM_NT_SENSOR_TIMEOUT', time);
    ini.save();

    require('../../redis').restartSocket();

    setTimeout(function () {
        process.exit(0);
    }, 1000);

    res.send('ok');

};