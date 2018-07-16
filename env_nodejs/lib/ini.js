var fs = require('fs')
    , path = require('path')
    , ini = require('ini');
var tool = require('./tool');
var ini_content, ini_path;

try {
    ini_path = path.normalize(__dirname + '/../museum.ini');
    fs.statSync(ini_path);
} catch (e) {
    try {
        ini_path = path.normalize(__dirname + '/../../museum.ini');
        fs.statSync(ini_path);
    } catch (e) {
        try {
            ini_path = path.normalize('/usr/local/ampps/php/etc/php.d/museum.ini');
            fs.statSync(ini_path);
        } catch (e) {
            try {
                ini_path = path.normalize(process.env.PHP_INI_SCAN_DIR + '/museum.ini');
                fs.statSync(ini_path);
            } catch (e) {

            }
        }
    }
}

console.log('read ini', ini_path);
if (!ini_path) {
    console.error('ini not find');
    process.exit(1);
}

ini_content = fs.readFileSync(ini_path, 'utf-8');
var config = {}, config_ini = ini.parse(ini_content);
// console.log(config);
tool._.each(config_ini, function (row, group) {
    tool._.each(row, function (val, key) {
        config[key] = val;
    });
});
// console.log(config);
// console.log(get_config('MUSEUM_DB_HOST', 'sss'));

function get_config(name, default_val) {
    if (tool._.has(config, name)) {
        return config[name];
    }
    if (default_val === undefined) {
        return '';
    }
    return default_val;
}

function set_config(group, key, val) {
    config_ini[group][key] = val;
}

function save_config(ini_file) {
    fs.writeFileSync(ini_file || ini_path, ini.stringify(config_ini))
}

exports.get = get_config;
exports.set = set_config;
exports.save = save_config;

