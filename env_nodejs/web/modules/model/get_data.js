var tool = require('../../../lib/tool');
var mysql = require('../../../lib/mysql');


exports.getData = function (options, callback) {

    options = tool._.defaults(options, {
        page: 1,
        rows: 10,
        table: '',
        where: [],
        fields: '*',
        order: 'id desc',
        near_total: 0
    });

    if (options['req']) {
        options.page = parseInt(options.req.body.page) || 1;
        options.rows = parseInt(options.req.body.rows) || 10;
        options.near_total = options.req.body.near_total;
    }

    var offset = (options.page - 1) * options.rows;

    var result = {total: 0, rows: []};

    var where_str = ' 1=1 ';
    if (tool._.isString(options.where)) {
        where_str = options.where;
    } else if (tool._.isArray(options.where)) {
        if (options.where.length > 0) {
            where_str = options.where.join(' and ');
        }
    }
    var sqlc = "select count(1) as total from " + options.table + " where " + where_str;
    if (options.near_total) {
        sqlc = 'explain ' + sqlc;
    }
    // console.log(sqlc);
    // console.time('sqlc' + options.table);
    mysql.query(sqlc,
        function (err, records) {
            if (err) {
                console.log(this.sql);
                callback(err);
                return;
            }
            //console.timeEnd('sqlc' + options.table);
            result.total = records[0].total;
            if (!result.total) {
                result.total = records[0].rows;
            }

            var sql = "select " + options.fields + " from " + options.table + " where " + where_str
                + " order by " + options.order + " limit " + offset + "," + options.rows;

            if (offset > 5000 && offset > result.total / 2) {
                sql = "select " + options.fields + " from " + options.table + " where "
                    + " id in (select * from (select id from " + options.table + " where " + where_str + " order by " + options.order
                    + " limit " + offset + "," + options.rows + ") as t)" +
                    " order by " + options.order;
            }
            // console.log(sql);
            // console.time('sql' + options.table);
            mysql.query(sql, function (err, records) {
                if (err) {
                    console.error(this.sql);
                    callback(err);
                    return;
                }
                //console.timeEnd('sql' + options.table);
                result.rows = records;

                callback(null, result);
            })
        });
};