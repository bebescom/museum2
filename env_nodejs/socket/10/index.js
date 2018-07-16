var tool = require('../../lib/tool');
var mysql = require('../../lib/mysql');
var config = require('../../config');


exports.feedback_save = function (json, callback) {
    var row = {};
    row.instruct = json.instruct;
    row.sensor_no = json.sensor_no;
    row.ip_port = json.ip_port;
    row.status = json.status;
    row.feedback_time = json.feedback_time;
    row.raw_data = json.raw_data;
    row.feedback_data = JSON.stringify(json.feedback_data);

    var up_data = {};
    up_data.feedback_time = json.feedback_time;
    up_data.send_status = json.status;
    up_data.feedback_data = JSON.stringify(json.feedback_data);
    up_data.raw_data = json.raw_data;


    mysql.query("update equip_operation set ? where instruct=? and equip_no like '%" + row.sensor_no + "' and send_status=2 order by operation_time desc limit 1",
        [up_data, row.instruct], function (err) {
            if (err) {
                console.error(err);
                callback && callback(err);
                return;
            }

            mysql.query("insert into _data_feedback set ?", row, function (err) {
                if (err) {
                    console.error(err);
                    callback && callback(err);
                    return;
                }
                callback && callback();
            });

        });


};