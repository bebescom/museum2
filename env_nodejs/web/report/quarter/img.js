var API = require('../../../lib/api');
var tool = require('../../../lib/tool');
var ini = require('../../../lib/ini');
var mysql = require('../../../lib/mysql');
var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;
var cpuNum = require('os').cpus().length;
var _ = tool._;
exports.generate_img = function (report_id, callback) {

    var img_path = path.normalize(__dirname + '/../img/' + report_id);
    var img_file = path.normalize(img_path + '/img_file.json');

    mysql.query("select * from " + ini.get('MUSEUM_DB_NAME_PREFIX') + "_report.images where report_id=?", [report_id], function (err, docs) {
        if (err) throw err;
        if (!docs.length) {
            callback('images not find');
            return;
        }
        var images = [];
        _.each(docs, function (row) {
            try {
                fs.writeFileSync(path.normalize(img_path + '/img_' + row.id + '.json'), row.image_data);
            } catch (e) {

            }
            images.push({id: row.id, image_key: row.image_key, image_type: row.image_type});
        });
        console.log("img   ",images);
        try {
            fs.writeFileSync(img_file, JSON.stringify(images));
        } catch (e) {
            callback && callback();
            return;
        }

        var img_sh = path.normalize(__dirname + '/../img.sh');
        try {
            fs.statSync(img_sh);
        } catch (e) {
            console.error('img_sh.sh not find');
            callback && callback();
            return;
        }

        var ls = spawn('sh', [img_sh, report_id]);

        ls.stdout.on('data', function (data) {
            console.log(data.toString());
        });
        ls.stderr.on('data', function (data) {
            console.log(data.toString());
        });
        ls.on('close', function () {
            upload_img();
        });

    });


    function upload_img() {
        console.log('上传图片...');
        var imgs;
        try {
            imgs = JSON.parse(fs.readFileSync(img_file));
        } catch (e) {

        }
        if (!imgs) {
            console.log('没有找到图片数据');
            callback && callback();
            return;
        }

        var images_up_num = 0, images_keys = {}, repeat_images_keys = [], fail_images_keys = [];
        tool.async.forEachOfLimit(imgs, cpuNum, function (img, i, e_callback) {

            console.log('up', (i + 1) + '/' + imgs.length, img.image_file || img.image_key);
            if (images_keys[img.image_key]) {
                repeat_images_keys.push(img.image_key);
                e_callback();
                return;
            }
            if (!img.image_file) {
                fail_images_keys.push(img.image_key);
                console.log(img);
                e_callback();
                return;
            }
            images_keys[img.image_key] = img;

            var img_json = {};
            img_json.report_id = report_id;
            img_json.image_key = img.image_key;
            var image_files = img.image_file;
            var base_codes = [];
            _.each(image_files,function(image_file,n){
                var imageBuf = fs.readFileSync(img_path + '/' + image_file);
                base_codes.push(imageBuf.toString('base64'));
            });
            img_json.base_code = base_codes;

            API('post/report/images/upload', img_json, function (err,data) {
                if (err) {
                    console.error(err);
                    e_callback && e_callback();
                    return;
                }
                //console.log(data);
                images_up_num++;
                e_callback && e_callback();
            });

        }, function (err) {
            if (fail_images_keys.length) {
                console.warn(fail_images_keys.length + '张图片生成失败，可能无数据', fail_images_keys);
            }
            if (repeat_images_keys.length) {
                console.error('key重复', repeat_images_keys);
            }
            console.log('共上传' + images_up_num + '张图片');
            callback && callback();
        });
    }


};
