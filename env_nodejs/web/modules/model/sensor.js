var tool = require('../../../lib/tool');
var mysql = require('../../../lib/mysql');
var getData = require('./get_data').getData;

exports.sensorList = function (req, res) {

    var table = req.body.table || 'data_sensor';
    var no = req.body.no;

    var no_repeat = req.body.no_repeat;

    var where = [];

    var ktime = req.body.ktime;
    var dtime = req.body.dtime;
    var time_type = req.body.time_type;

    if (!time_type) {
        time_type = "server_time";
    }

    if (ktime) {
        var min_time = tool.time(ktime);
        where.push(time_type + " >= " + min_time);
    }
    if (dtime) {
        var max_time = tool.time(dtime);
        where.push(time_type + " <= " + max_time);
    }

    if (no) {
        where.push("equip_no like '%" + no + "%'");
    }

    if (no_repeat) {
        var where_str = ' 1=1 ';

        if (where.length > 0) {
            where_str = where.join(' and ');
        }
        var sql = "select * from (select * from " + table + " where " + where_str + " order by " + time_type + " desc) s group by equip_no ";
        //console.log(sql);
        mysql.query(sql,
            function (err, docs) {
                if (err) {
                    console.error(err);
                    return;
                }
                res.send(docs);
            });
        return;
    }

    getData({
        req: req,
        table: table,
        where: where,
        order: time_type + ' desc'
    }, function (err, result) {
        if (err) {
            console.error(err);
            return;
        }
        res.send(result);
    });

};
exports.routeList = function (req, res) {

    var table = req.body.table || 'data_route';

    var sensor_no = req.body.sensor_no;

    var where = [];

    if (sensor_no) {
        where.push("concat_ws(gateway_no,relay1_no,relay2_no,relay3_no,sensor_no) like '%" + sensor_no + "%'");
    }

    var ktime = req.body.ktime;
    var dtime = req.body.dtime;

    if (ktime) {
        var min_time = tool.time(ktime);
        where.push("server_time >=" + min_time);
    }
    if (dtime) {
        var max_time = tool.time(dtime);
        where.push("server_time <=" + max_time);
    }

    getData({req: req, table: table, where: where}, function (err, result) {
        if (err) {
            console.error(err);
            return;
        }
        res.send(result);
    });

};


exports.gateway = function (req, res) {

    var gatewayNo = req.body.gatewayNo;

    var where = [];

    if (gatewayNo) {
        where.push("gatewayNo like '%" + gatewayNo + "%'");
    }

    getData({req: req, table: '_data_gateway_disconnect', where: where}, function (err, result) {
        if (err) {
            console.error(err);
            return;
        }
        res.send(result);
    });
};


exports.crcErrorList = function (req, res) {

    var sensor_no = req.body.sensor_no;
    var where = [];


    var ktime = req.body.ktime;
    var dtime = req.body.dtime;

    if (ktime) {
        var mintime = tool.time(ktime);
        where.push("server_time >=" + mintime);
    }
    if (dtime) {
        var maxtime = tool.time(dtime);
        where.push("server_time <=" + maxtime);
    }

    if (sensor_no) {
        where.push("sensor_no like '%" + sensor_no + "%'");
    }

    getData({req: req, table: '_data_crc_error', where: where}, function (err, result) {
        if (err) {
            console.error(err);
            return;
        }
        res.send(result);
    });

};


exports.feedbackList = function (req, res) {

    var sensor_no = req.body.no;
    var ip = req.body.ip;
    var where = [];

    if (sensor_no) {
        where.push("sensor_no like '%" + sensor_no + "%'");
    }
    if (ip) {
        where.push("ip_port like '" + ip + "'");
    }

    getData({req: req, table: '_data_feedback', where: where}, function (err, result) {
        if (err) {
            console.error(err);
            return;
        }
        res.send(result);
    });
};
exports.apiList = function (req, res) {

    var log_date = req.body.log_date;
    var show_error = req.body.show_error;

    var where = [];

    if (log_date) {
        where.push("start_time between " + tool.time(log_date + ' 00:00:00') * 1000 + ' and ' + tool.time(log_date + ' 23:59:59') * 1000);
    }
    if (show_error) {
        where.push("body like '%error%'");
    }

    getData({
        req: req,
        table: '_data_api',
        where: where,
        order: 'start_time desc'
    }, function (err, result) {
        if (err) {
            console.error(err);
            return;
        }
        res.send(result);
    });
};
