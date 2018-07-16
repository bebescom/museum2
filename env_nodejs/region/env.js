var API = require('../lib/api');
var tool = require('../lib/tool');
var _ = tool._;
var http = require('http');
var fs = require('fs');
var ini = require('../lib/ini');
var UPAPI = require('./up');

var cache_envs = {};

exports.start = function (callback) {
    console.log('start get env');
    get_envs(function (err, envs) {
        if (err) {
            console.error(err);
            callback&&callback();
            return;
        }
        console.log('start up env', envs.length);

        // fs.writeFileSync('envs.json', JSON.stringify(envs));
        // callback();
        // return;
        if (JSON.stringify(cache_envs) === JSON.stringify(envs)) {
            console.log('nothing update env');
            callback&&callback();
            return;
        }
        cache_envs = envs;

        UPAPI('post/env/area/list', {param: JSON.stringify(envs)}, function (err, result) {
            if (err) {
                console.error('env', err);
                callback&&callback();
                return;
            }
            console.log('up env end', result);
            callback&&callback();

        });
    });
};

var types = {
    '楼栋': 'building',
    '楼层': 'floor',
    '展厅': 'hall',
    '库房': 'storage',
    '展柜': 'show_cabinet',
    '存储柜': 'store_cabinet',
};

function get_envs(callback) {
    var env_images = {};
    tool.async.auto({
        envs: function (a_callback) {
            API('get/base/envs', {limit: 10000}, function (err, result) {
                if (err) {
                    console.error(err);
                    a_callback(1);
                    return;
                }
                if (!result || !result.rows.length) {
                    console.warn('envs.rows.length=0');
                    a_callback(1);
                    return;
                }

                a_callback(null, result.rows);

            });
        },
        images: function (a_callback) {
            API('get/base/envs/images', function (err, result) {
                if (err) {
                    console.error(err);
                    a_callback(1);
                    return;
                }
                if (!result || !_.size(result)) {
                    a_callback(null);
                    return;
                }

                tool.async.eachOf(result, function (row, no, e_callback) {
                    if (!row || !row.home) {
                        e_callback(null);
                        return;
                    }

                    var host = 'http://' + ini.get('MUSEUM_WEB_HOST') + ':' + ini.get('MUSEUM_WEB_PORT');
                    var url = host + row.home;
                    http.get(url, function (res) {
                        var chunks = [];
                        var size = 0;
                        res.on('data', function (chunk) {
                            chunks.push(chunk);
                            size += chunk.length;
                        });
                        res.on('end', function (err) {
                            if (err) {
                                e_callback();
                                return;
                            }
                            var base64Img;
                            try {
                                var data = Buffer.concat(chunks, size);
                                base64Img = data.toString('base64');
                            } catch (e) {

                            }
                            if (base64Img) {
                                var img_type = _.last(url.split('.'));
                                env_images[no] = {img_type: img_type, base64_img: base64Img};
                            }
                            e_callback && e_callback();
                        });
                    });
                }, function (err) {
                    a_callback(null);
                });

            });
        }
    }, function (err, results) {
        if (err) {
            callback(1);
            return;
        }

        if (!results.envs) {
            callback(1);
            return;
        }

        var envs = [];
        tool.async.each(results.envs, function (row, e_callback) {
            var env = {};
            env.No = row.env_no;
            env.name = row.name;
            env.type = '';
            if (types[row.type]) {
                env.type = types[row.type];
            }
            env.parentNo = row.parent_env_no;
            env.photo = {};
            //env.children = [];
            if (env_images[row.env_no]) {
                env.photo.type = env_images[row.env_no].img_type;
                env.photo.byte = env_images[row.env_no].base64_img;
            }
            envs.push(env);
            e_callback && e_callback();

        }, function (err) {
            if (err) {
                console.error(err);
                callback(err);
                return;
            }
            callback(null, envs);
        });

    });


}
