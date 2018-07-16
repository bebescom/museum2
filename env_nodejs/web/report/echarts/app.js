//本文件在docker 下运行
var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var echarts = require('./echarts');

var cli_args = process.argv.slice(2);

var report_id = cli_args[0];

var img_path = path.normalize(__dirname + '/../img/' + report_id);
var img_file = path.normalize(img_path + '/img_file.json');
var imgs;
try {
    imgs = JSON.parse(fs.readFileSync(img_file));
} catch (e) {
    return;
}

if (!imgs || !imgs.length) {
    return;
}
var images_keys = {};
_.each(imgs, function (img, i) {

    console.log((i + 1) + '/' + imgs.length, img.image_key);
    if (images_keys[img.image_key]) {
        return;
    }

    var image_data = null;
    try {
        image_data = JSON.parse(fs.readFileSync(img_path + '/img_' + img.id + '.json'));
    } catch (e) {
    }

    if (!image_data) {
        return;
    }
    var file_name = img.image_key.replace(/(\/|\\)/gi, '_');

    var rts = require('./generate').get_base64(img.image_type, image_data, report_id);
    var image_files = [];
    if(Array.isArray(rts)){
        for (var n in rts){
            var rt = rts[n];
            if (!rt || !rt.base64img || rt.base64img.length < 20) {
                continue;
            }
            var img_base64 = rt.base64img.replace('data:image/png;base64,', '');

            var new_file_name = file_name+ '_' + n;
            fs.writeFileSync(img_path + '/' + new_file_name + '.png',new Buffer(img_base64, 'base64'));
            image_files.push(new_file_name + '.png');
            rt.option && fs.writeFileSync(img_path + '/' + new_file_name + '.option.json', JSON.stringify(rt.option));
        }
    }else{
        if (!rts || !rts.base64img || rts.base64img.length < 20) {
            return;
        }
        var img_base64 = rts.base64img.replace('data:image/png;base64,', '');

        fs.writeFileSync(img_path + '/' + file_name + '.png', new Buffer(img_base64, 'base64'));
        rts.option && fs.writeFileSync(img_path + '/' + file_name + '.option.json', JSON.stringify(rts.option));
        image_files.push(file_name + '.png');
    }

    imgs[i].image_file = image_files;
    images_keys[img.image_key] = img;
});

fs.writeFileSync(img_file, JSON.stringify(imgs));

