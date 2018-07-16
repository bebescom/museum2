var tool = require('../../../lib/tool');
var mysql = require('../../../lib/mysql');
var getData = require('./get_data').getData;
var _ = tool._;

exports.box_gateways = function (req, res) {

    var sql = "SELECT DISTINCT(equip_no) as equip_no FROM _data_sensor where equip_no like '025%' order by equip_no asc";

    mysql.query(sql, function (err, docs) {
        if (err) {
            console.error(err);
            return;
        }
        res.send(docs);
    });

};

exports.box_map = function (req, res) {
    var equip_no = req.body.equip_no;
    var ktime = req.body.ktime;
    var dtime = req.body.dtime;
    if (!equip_no || !ktime) {
        res.send({error: '参数缺失'});
        return;
    }
    var where_str = "equip_no='" + equip_no + "' ", time_where_str = "";

    if (ktime) {
        var min_time = new Date(ktime).getTime() / 1000;
        time_where_str += " and equip_time >= " + min_time;
    }
    var max_time = dtime ? new Date(dtime).getTime() / 1000 : new Date().getTime() / 1000;
    time_where_str += " and equip_time <= " + max_time;

    var sql = "SELECT equip_time,lng,lat FROM _data_sensor where " + where_str + " " + time_where_str + " order by equip_time desc";

    mysql.query(sql, function (err, docs) {
        if (err) {
            console.error(this.sql, err);
            return;
        }
        if (!docs.length) {
            res.send({error: '无定位数据'});
            return;
        }

        res.send({data: docs});

    });

};

exports.box_data = function (req, res) {
    var equip_no = req.body.equip_no;
    var ktime = req.body.ktime;
    var dtime = req.body.dtime;
    if (!equip_no || !ktime) {
        res.send({error: '参数缺失'});
        return;
    }
    var where_str = "equip_no='" + equip_no + "' ", time_where_str = "";

    if (ktime) {
        var min_time = new Date(ktime).getTime() / 1000;
        time_where_str += " and equip_time >= " + min_time;
    }

    var max_time = dtime ? new Date(dtime).getTime() / 1000 : new Date().getTime() / 1000;
    time_where_str += " and equip_time <= " + max_time;


    var sql = "SELECT DISTINCT(ip_port) ip_port FROM _data_sensor where " + where_str + " " + time_where_str + "";

    mysql.query(sql, function (err, docs) {
        if (err) {
            console.error(this.sql, err);
            return;
        }
        if (!docs.length) {
            res.send({error: '无定位数据'});
            return;
        }
        // console.log(sql);
        var ip_port = [];
        _.each(docs, function (row) {
            ip_port.push(row.ip_port);
        });
        // console.log(ip_port);
        var sql2 = "SELECT equip_no,equip_time,server_time,humidity,temperature,voltage,rssi,move_alert,box_open_alert,box_status,box_sensitivity FROM _data_sensor where equip_no like '007%' " + time_where_str + " and ip_port in ('" + ip_port.join("','") + "')  order by equip_time desc";

        mysql.query(sql2, function (err, docs) {
            if (err) {
                console.error(this.sql, err);
                return;
            }
            // console.error(sql2);
            var equip_no = {}, result = [];
            _.each(docs, function (row, index) {
                if (!equip_no[row.equip_no]) {
                    equip_no[row.equip_no] = {index: result.length};
                    row.first_time = row.equip_time;
                    result.push(row);
                } else {
                    result[equip_no[row.equip_no].index].first_time = row.equip_time;
                }
            });

            res.send({data: result});
        });

    });

};