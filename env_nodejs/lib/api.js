var request = require("request");
var tool = require('./tool');
var config = require('../config');
var _ = tool._;

// var q = tool.async.queue(function (task, callback) {
//     new send(task, callback);
// }, 100);


function API($uri, $data, callback) {

    if (!_.has(config, 'api_url')) {
        callback && callback('config.js not find api_url');
        return;
    }
    if (!callback && _.isFunction($data)) {
        callback = $data;
        $data = {};
    }

    var _uris = $uri.split('/');
    var $method = _uris.shift().toLowerCase();

    if (!_.contains(['get', 'post'], $method)) {
        console.log('method not allow', $uri);
        callback && callback('method not allow');
        return;
    }

    var option = {
        method: $method,
        $uri: $uri,
        $data: $data,
        uri: config.api_url + '' + $uri,
        headers: {},
        json: $data,
        start_time: new Date().getTime(),
        timeout: 4 * 3600 * 1000,
        body: '',
        api_id: '',
    };

    gen_token(function (err, token) {
        if (err) {
            console.error('get token err', err);
            callback && callback('get token err');
            return;
        }
        option['headers']['access_token'] = $data['access_token'] || token;

        // if (callback) {
        send(option, callback);
        // } else {
        //     q.push(option);
        // }

    });

}

function send(option, callback) {

    save_api(option, function (err, api_id) {
        if (err) {
            console.error(err);
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
                console.error(err);
                callback && callback(err, body);
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
                callback && callback('JSON.parse fail');
                return;
            }
            // console.log(option.json, body);
            if (data.error && (data.error + '').indexOf('没有登录') > -1) {
                API._token = null;
                API(option.$uri, option.$data, callback);
                return;
            }
            callback && callback(null, body);

        });

    });

}

module.exports = API;
API._token = null;
API._token_lasttime = tool.time();
API._loging = false;

function gen_token(callback) {
    if (API._token && (tool.time() - API._token_lasttime < 8 * 3600)) {
        callback && callback(null, API._token);
        return;
    }
    if (!API._token && API._loging) {
        setTimeout(function () {
            gen_token(callback);
        }, 100);
        return;
    }
    API._loging = true;
    var option = {
        method: 'post',
        uri: config.api_url + '/base/users/login',
        headers: {},
        json: {
            user: config.api_user,
            pwd: config.api_pwd,
        },
        start_time: +new Date()
    };
    console.log('api login...');
    request(option, function (err, response, body) {
        API._loging = false;
        if (err) {
            console.error('request login err', err);
            callback && callback(err);
            return;
        }
        option.body = body;
        option.end_time = +new Date();
        option.exe_time = option.end_time - option.start_time;

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
        if (data) {
            // console.log(option.json, body);
            API._token = data.token;
            API._token_lasttime = tool.time();
            callback && callback(null, API._token);
        } else {
            callback && callback('data is null');
        }
    });

}

var mysql = require('./mysql');

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
            console.error(this.sql);
            throw err;
        }
        callback && callback(null, result.insertId);
    })
}