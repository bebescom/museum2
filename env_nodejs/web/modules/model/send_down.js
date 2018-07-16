var tool = require('../../../lib/tool');
var mysql = require('../../../lib/mysql');

var getData = require('./get_data').getData;


exports.equip_operation = function (req, res) {

    var equip_no = req.body.equip_no;

    var where = [];

    if (equip_no) {
        where.push("equip_no like '%" + equip_no + "%'");
    }

    getData({req: req, table: 'equip_operation', where: where}, function (err, result) {
        if (err) {
            console.error(err);
            return;
        }
        res.send(result);
    });
};
exports.equips = function (req, res) {
    var table = req.body.table;

    if (!table) {
        table = '_data_sensor';
    }
    var sql = "SELECT DISTINCT(equip_no) as equip_no FROM " + table + " order by equip_no asc";

    mysql.query(sql, function (err, docs) {
        if (err) {
            console.error(err);
            return;
        }
        res.send(docs);
    });
};

exports.batch_send_down = function (req, res) {

    var equips = req.body.equips;
    var send_type = req.body.send_type;
    if (!tool._.isArray(equips)) {
        res.send({error: '设备为空'});
    }

    tool.async.eachSeries(equips, function (row, callback) {

        var json = {};
        json.equip_no = row.equip_no;
        json.instruct = row.instruct;
        json.operation = row.operation;
        json.send_data = JSON.stringify(row.send_data);
        json.remark = '8020下发,' + (row.remark || '');
        json.send_type = send_type || 1;
        json.send_status = 1;
        json.uid = -1;
        json.operation_time = tool.time();

        mysql.query("select id from equip_operation where equip_no=? and instruct=? and send_status in (1,2) order by operation_time desc limit 1", [row.equip_no, row.instruct], function (err, docs) {
            if (err) {
                console.error(this.sql, err);
                callback(err);
                return;
            }
            if (docs.length) {
                mysql.query("update equip_operation set ? where equip_no=? and instruct=? and send_status in (1,2)", [{send_status: 5}, row.equip_no, row.instruct], function (err) {
                    if (err) {
                        console.error(this.sql, err);
                        callback(err);
                        return;
                    }
                    insert_operation();
                });
                return;
            }
            insert_operation();

            function insert_operation() {
                mysql.query("insert into equip_operation set ?", json, function (err) {
                    if (err) {
                        console.error(err);
                        callback(err);
                        return;
                    }
                    callback();
                });
            }


        });

    }, function (err) {
        if (send_type == 2) {
            require('../../redis').nowSendDown();
        }

        res.send({msg: '指令已保存,等待数据下发'});
    });


};


exports.send_log = function (req, res) {

    var equip_no = req.body.equip_no;

    var where = ["send_type in (1,2,3)"];

    if (equip_no) {
        where.push("equip_no like '%" + equip_no + "%'");
    }

    getData({req: req, table: 'equip_operation', where: where}, function (err, result) {
        if (err) {
            console.error(err);
            return;
        }
        res.send(result);
    });
};

exports.cancel_down = function (req, res) {
    var id = req.body.id;
    if (!id) {
        res.send({error: '参数不全'});
        return;
    }
    mysql.query("update equip_operation set send_status=5 where id=?", [id], function (err, result) {
        if (err) {
            console.error(err);
            return;
        }
        res.send({msg: '取消成功'});
    });

};