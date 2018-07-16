var tool = require('../../../lib/tool');
var mysql = require('../../../lib/mysql');
var params = require('../../../params');
var _ = tool._;
var param_arr = {};
_.each(params.params, function (row) {
    param_arr[row.en] = row.name;
});
exports.params = param_arr;

exports.gridList = function (req, res) {

    var table = req.body.table || '_data_sensor';
    var no = req.body.no;

    var result = {total: 0, rows: []};

    if (!no || no == '') {
        res.send(result);
        return;
    }
    no = no.replace('，', ',').trim();

    var nos = no.replace(' ', '').split(",");
    if (nos.length == 0) {
        res.send(result);
        return;
    }
    _.each(nos, function (row, index) {
        nos[index] = row.trim();
    });


    var where_str = " equip_no in ('" + nos.join("','") + "')";

    var ktime = req.body.ktime;
    var dtime = req.body.dtime;
    var timeType = req.body.timeType;//计算时间类型
    timeType = timeType || 'server_time';

    if (ktime) {
        var min_time = new Date(ktime).getTime() / 1000;
        where_str += " and " + timeType + " >= " + min_time;
    }
    if (dtime) {
        var max_time = new Date(dtime).getTime() / 1000;
        where_str += " and " + timeType + " <= " + max_time;
    }

    var intervalTime = req.body.intervalTime;//间隔时间(分钟)
    intervalTime = intervalTime || 10;

    var sql = "select * from " + table + " where " + where_str + " order by " + timeType + " asc";
    //console.log(sql);
    mysql.query(sql, function (err, docs) {
        if (err) {
            console.error(err);
        }
        result.total = docs.length;
        _.each(param_arr, function (name, en) {
            result[en] = {};
        });
        // var rows = tool._.sortBy(docs, timeType);
        tool._.each(docs, function (row) {
            var equip_no = row.equip_no;
            _.each(param_arr, function (name, en) {
                if (row[en] != null) {
                    if (!result[en][equip_no]) {
                        result[en][equip_no] = [];
                    }
                    if (result[en][equip_no].length > 0 &&
                        Math.abs(row[timeType] - _.last(result[en][equip_no])[0] / 1000) > intervalTime * 60) {
                        result[en][equip_no].push([row[timeType] * 1000, null]);
                    }
                    result[en][equip_no].push([row[timeType] * 1000, row[en] * 1, row.id]);
                }
            });
        });

        res.send(result);

    });


};
