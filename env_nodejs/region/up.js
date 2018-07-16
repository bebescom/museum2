var request = require("request");
var tool = require('../lib/tool');
var ini = require('../lib/ini');
var API = require('../lib/api');
var _ = tool._;

var q = tool.async.queue(function (task, callback) {
    new send(task, callback);
}, 1);

function UP($uri, $data, callback) {
    if (!callback && _.isFunction($data)) {
        callback = $data;
        $data = {};
    }
    var $root = ini.get('MUSEUM_REGION_ROOT');

    if (!$root) {
        callback && callback('not setting MUSEUM_REGION_ROOT');
        return;
    }

    var uris = $uri.split('/');
    var $method = uris.shift().toLowerCase();
    var $api = uris.join('/').toLowerCase();

    if (!_.contains(['get', 'post'], $method)) {
        console.log('method not allow', $uri);
        callback && callback('method not allow');
        return;
    }
    var $roots;
    if ($root.indexOf(',') > -1) {
        $roots = $root.split(',');
    } else {
        $roots = [$root];
    }
    $roots = _.uniq($roots);

    var token = des_ecb(ini.get('MUSEUM_NO'), ini.get('MUSEUM_REGION_KEY'));
    var results = {};
    tool.async.each($roots, function (root, e_callback) {
        var option = {
            method: $method,
            $uri: $uri,
            $data: $data,
            uri: root + '/' + $api,
            headers: {},
            formData: $data,
            start_time: new Date().getTime(),
            timeout: 2 * 3600 * 1000,
            body: '',
            api_id: '',
        };
        option['headers']['token'] = $data['token'] || token;
        q.push(option, function (err, result) {
            if (err) {
                results[root] = err;
            } else {
                results[root] = result;
            }
            e_callback && e_callback();
        });
    }, function (err) {
        callback && callback(err, results);
    });


}

var crypto = require('crypto');

function des_ecb($str, $key) {

    $key = new Buffer($key);
    var iv = new Buffer(0);
    var cipher = crypto.createCipheriv('des-ecb', $key, iv);
    cipher.setAutoPadding(true);
    var ciph = cipher.update($str, 'utf8', 'base64');
    ciph += cipher.final('base64');
    return ciph;
}

function send(option, callback) {

    save_api(option, function (err, api_id) {
        if (err) {
            console.error(option, err);
            callback && callback(err);
            return;
        }
        option.api_id = api_id;

        request(option, function (err, response, body) {
            option.body = body;
            option.end_time = new Date().getTime();
            option.exe_time = option.end_time - option.start_time;

            save_api(option);

            if (err) {
                console.error(option, err);
                callback && callback(err);
                return;
            }

            var data;
            if (tool._.isString(option.body)) {
                try {
                    data = JSON.parse(option.body);
                } catch (e) {
                    console.error(e, option.body);
                }
            } else {
                data = option.body;
            }
            if (!data) {
                callback && callback('data parse failed', body);
                return;
            }
            // console.log(option, body);
            if (_.isObject(data) && !_.isArray(data) && data.error) {
                callback && callback(data.error, data);
                return;
            }
            callback && callback(null, data);

        });

    });

}

module.exports = UP;

var mysql = require('../lib/mysql');

function save_api(option, callback) {
    var json, sql = "";
    // console.log(option);
    if (option.api_id) {
        if (!option.body) {
            callback && callback(null);
            return;
        }
        json = [{}, option.api_id];
        json[0].end_time = option.end_time;
        json[0].exe_time = option.exe_time;
        json[0].body = JSON.stringify(option.body);
        sql = "update _data_api set ? where id=?";
    } else {
        json = {};
        json.method = option.method;
        json.uri = option.uri;
        json.headers = JSON.stringify(option.headers);
        json.json = JSON.stringify(option.json);
        json.start_time = option.start_time;
        sql = "insert into _data_api set ?";
    }
    // console.log(sql, json);

    mysql.query(sql, json, function (err, result) {
        if (err) {
            console.error(err);
            callback && callback(err);
            return;
        }
        callback && callback(null, result.insertId);
    });
}