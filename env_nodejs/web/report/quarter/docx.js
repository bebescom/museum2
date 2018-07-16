var API = require('../../../lib/api');
var tool = require('../../../lib/tool');
var fs = require('fs');

exports.generate_docx = function (report_id, callback) {

    API('get/report/docx/' + report_id, function (err, json) {
        if (err) {
            console.error(err);
            callback && callback(err);
            return;
        }
        console.log(json);
        callback && callback(null, json);
    });

};