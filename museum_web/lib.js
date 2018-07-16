var Stream = require('stream');
var path = require('path');
var fs = require("fs");
var map = require("./map");
var _ = require('underscore');

var default_options = {
    root: './src',//根路径
    isMod: false,//是否mod
    api_url: '',//api地址
    java_api:'',//java api地址
    prod: false,//生产运行环境
    test_url: '/test/',//json地址
    min: false,//使用.min.js
    version:'2.1'
};

exports.set = function (key, val) {
    default_options[key] = val;
    if (key == 'min') {
        map.set_min();
    }
};

exports.build = function (options) {
    options = options || {};
    options = _.defaults(options, default_options);

    var stream = new Stream.Transform({objectMode: true});

    stream._transform = function (file, unused, callback) {
        if (file.isNull()) {
            return callback(null, file);
        }
        if (file.isBuffer()) {
            file.contents = new Buffer(parse(file, options));
        }
        callback(null, file);
    };
    return stream;

};


//解析
function parse(file, options) {

    var content = file.contents.toString();
    options.ext = path.extname(file.path).toLowerCase();

    options.module_id = parseModuleId(file.path, options.root);
    if (options.ext != '.js') {
        options.module_path = path.dirname(options.module_id);
    } else {
        options.module_path = options.module_id;
    }

    map.init(options, file);

    content = inlineFile(content, options, file);//内联文件
    content = replaceUri(content, options, file);//uri处理
    // content = repace_java_api(content, options, file);//APIJAVA处理
    content = replaceAPI(content, options, file);//API处理
    content = analyseDeps(content, options, file);//解析依赖

    if (options.isMod && options.ext == '.js') {
        if (!/^\s*define\s*\(/.test(content)) {//已含有define(
            content = "define('" + options.module_id + "', function(require, exports, module) {\n" + content + "\n});";
        }
    }
    if (options.ext == '.html') {
        content = parseDep(content, options, file);//依赖注入html
    }
    return content;
}

/*
 根据root路径解析当前模块的相对id
 */
function parseModuleId(filepath, transportBase) {
    transportBase = transportBase.replace(/\\/g, "/");
    filepath = filepath.replace(/\\/g, "/");
    var id;
    var index = filepath.indexOf(transportBase);
    if (transportBase && index > -1) {
        id = filepath.substr(index + transportBase.length);
    } else {
        id = path.basename(filepath);
    }
    if (id.match(/^([^\/]+)\/\1\.js$/g)) {//main/main.js 只返回main
        id = RegExp.$1;
    }
    return id.replace('.js', "");
}

//内联处理
function inlineFile(content, options, file) {
    var reg = /__inline\s*\(\s*([^\)]+)\s*\)/ig;//处理其中的 __inline("../common/header.html")
    content = content.replace(reg, function (s, p, i) {
        var inline_content = '';
        var info = stringQuote(p);
        var jp = info.uri;
        if (!jp) {
            return inline_content;
        }
        var filepath;
        if (jp[0] == '/') {//相对于当前根路径
            filepath = path.join(options.root, jp);
        } else {//相对于当前html路径
            filepath = path.join(path.dirname(file.path), jp);
        }
        //读取内联的文件内容
        if (fs.existsSync(filepath)) {
            inline_content += fs.readFileSync(filepath, 'utf-8') + '\n';
            if (inline_content.indexOf('__inline') != -1) {
                inline_content = inlineFile(inline_content, options, {path: filepath});
            }
        }
        return inline_content;
    });

    return content;
}

//替换文件中的__uri路径
function replaceUri(content, options, file) {

    var regs = [
        /__uri\s*\(\s*([^\)]+)\s*\)/ig,//处理其中的__uri函数路径
        /\<link\s*[^\>]*?href\s*=\s*['|"]([^'"]+)['|"][^\>]*?[\/]?\>/ig,//处理<link href=""> 这种url方式。
        /\<script\s*[^\>]*?src\s*=\s*['|"]([^'"]+)['|"][^\>]*?[\/]?\>\s*?(\<\/script\>)?/ig,//处理<script src=""> 这种src方式。
        /\<a\s*[^\>]*?href\s*=\s*['|"]([^'"]+)['|"][^\>]*?[\/]?\>\s*?(\<\/a\>)?/ig,//处理<a href=""></a> 这种src方式。
        /\<img\s*[^\>]*?src\s*=\s*['|"]([^'"]+)['|"][^\>]*?[\/]?\>/ig, //处理<img src=""> 这种src方式。
    ];

    regs.forEach(function (reg, k) {
        content = content.replace(reg, function (s, p, i) {
            var newp = replaceUrlHandler(p, options, file);
            if (k == 0) {
                return newp;
            }
            //console.log(s, newp);
            return s.replace(p, newp);
        });
    });

    return content;
}
var rFile = /\.[^\.]+$/;
//处理需要替换url的地址，切换root的相对路径，返回相对路径
function replaceUrlHandler(p, options, file) {
    var info = stringQuote(p);
    var fpath, filepath = file.path;
    if (info.uri[0] == '/') {
        fpath = path.normalize(path.join(options.root, info.uri));
    } else if (info.uri.indexOf('http:') > -1) {
        return p;
    } else {
        fpath = path.normalize(path.join(path.dirname(filepath), info.uri));
    }

    if (rFile.test(filepath)) {//文件
        filepath = path.dirname(filepath);
    }
    var url = path.relative(filepath, fpath);
    // console.log(filepath, fpath, url);
    url = url.replace(/\\/g, '/');
    //console.log(filepath, fpath, url);
    return info.quote + url + info.quote;
}

/**
 * 分析注释中依赖用法
 * @param content
 * @param options
 * @param file
 * @returns {*}
 */
function analyseDeps(content, options, file) {

    var reg = /(@require\s+)('[^']+'|"[^"]+"|[^\s;!@#%^&*()]+)/g;

    content = content.replace(reg, function (m, prefix, reqfile) {//@require a.css
        reqfileUri(options, reqfile, file);
        return "";
    });

    reg = /(require)\(('[^']+'|"[^"]+"|[^\s;!@#%^&*()]+)\)/g; //js require('main/data');
    content = content.replace(reg, function (m, prefix, reqfile) {
        var uri = reqfileUri(options, reqfile, file);
        return m.replace(reqfile.replace(/['"]/g, ""), uri);
    });

    //content = content.replace(/\/\/\s[\r\n]|\/\*\s*\*\/|\<\!\-\-\s*\-\-\>/g, '');//移除空注释 // /* */ <!-- -->

    return content;
}

function reqfileUri(options, reqfile, file) {
    var uri = reqfile.replace(/['"]/g, "");
    var fpath, filepath = file.path;
    if (uri[0] == '/') {
        fpath = path.normalize(path.join(options.root, uri));
    } else if (uri[0] == '.') {
        fpath = path.normalize(path.join(path.dirname(filepath), uri));
        uri = fpath.replace(path.normalize(options.root), '');
    } else {
        fpath = path.normalize(path.join(path.dirname(filepath), uri));
    }
    var ext = path.extname(fpath).toLowerCase();
    if (ext && fs.existsSync(fpath)) {//有后缀并存在
        uri = fpath.replace(path.normalize(options.root), '');
    }
    uri = uri.replace(/\\/g, '/');
    if (uri.match(/^([^\/]+)\/\1$/g)) {//main/main 只返回main
        uri = RegExp.$1;
    }
    //console.log(reqfile, uri);
    map.add(options.module_id, uri);
    return uri;
}

/**
 * 依赖注入
 * @param content
 * @param options
 * @param file
 * @returns {*}
 */
function parseDep(content, options, file) {
    fs.writeFile(options.root + '../map.json', JSON.stringify(map.getAll(), null, 4), function (err) {
        if (err)throw err;
    });
    var deps = map.getDepAll(options.module_id, file);
    if (!deps || deps.length == 0) {
        return content;
    }
    var css = [], js = [];
    deps.unshift('mod');
    deps = _.uniq(deps);
    _.each(deps, function (mod_id) {
        var mod = map.get(mod_id);
        var uri = mod_id;
        if (mod) {
            uri = mod.uri;
        }
        var ext = path.extname(uri).toLowerCase();
        if (ext == '.css') {
            css.push('  <link rel="stylesheet" href="' + depUri(options, uri, file) + '?v='+options.version+'" />\n');
        } else if (ext == '.js') {
            js.push('<script type="text/javascript" src="' + depUri(options, uri, file) + '?v='+options.version+'" ></script>\n');
        }
    });
    if (css.length > 0) {
        content = content.replace('</head>', css.join("") + "</head>");
    }
    if (js.length > 0) {
        content = content.replace('<script', js.join("") + "<script");
    }
    return content;
}

function depUri(options, uri, file) {
    var fpath, filepath = file.path;
    fpath = path.normalize(path.join(options.root, uri));
    if (rFile.test(filepath)) {//文件
        filepath = path.dirname(filepath);
    }
    var url = path.relative(filepath, fpath);
    url = url.replace(/\\/g, '/');
    //console.log(url);
    return url;
}

function replaceAPI(content, options, file) {
    var reg = /API\s*\(\s*([^\)]+)\s*\)/g;//处理其中的 API("/base/config")
    content = content.replace(reg, function (s, p, i) {
        var info = stringQuote(p);
        if (options.prod) {
            return info.quote + options.api_url + info.uri + info.quote;
        } else {
            var api = info.uri.replace(/\W/ig, '_');
            var url = api + '.json';
            var real_file = options.root + '..' + '/test/' + url;
            fs.stat(real_file, function (err, stats) {
                if (err || !stats) {
                    fs.writeFile(real_file, '{}', function (err) {
                        if (err) throw err;
                        console.log('write file', real_file);
                    });
                }
            });
            return info.quote + options.test_url + url + info.quote;
        }

    });

    return content;
}

// function repace_java_api(content, options, file){
//     var reg = /java_api\s*\(\s*([^\)]+)\s*\)/g;//处理其中的 API("/base/config")
//     content = content.replace(reg, function (s, p, i) {
//         var info = stringQuoteJava(p);
//         // stringQuoteJava(p);
//         if (options.prod) {
//             return info.quote + options.java_api + info.uri + info.quote;
//         } else {
//             var api = info.uri.replace(/\W/ig, '_');
//             var url = api + '.json';
//             var real_file = options.root + '..' + '/test/' + url;
//             fs.stat(real_file, function (err, stats) {
//                 if (err || !stats) {
//                     fs.writeFile(real_file, '{}', function (err) {
//                         if (err) throw err;
//                         console.log('write file', real_file);
//                     });
//                 }
//             });
//             return info.quote + options.test_url + url + info.quote;
//         }
//     });
//
//     return content;
// }

/**
 * 提取字符串中的引号和一对引号包围的内容
 * @param  str    待处理字符串
 * @param  quotes 初始引号可选范围，缺省为[',"]
 * @return Object        {
 *                           raw: 源字符串
 *                           uri: 引号包围的文字内容
 *                           quote: 引号类型
 *                         }
 */
function stringQuote(str, quotes) {
    var info = {
        raw: str,
        uri: str = str.trim(),
        quote: ''
    };
    if (str) {
        quotes = quotes || '\'"';
        var strLen = str.length - 1;
        for (var i = 0, len = quotes.length; i < len; i++) {
            var c = quotes[i];
            if (str[0] === c) {
                info.quote = c;
                if (str[strLen] === c) {
                    info.uri = str.substring(1, strLen);
                } else {//不是引号结尾，可能存在js变量
                    info.uri = str.substr(1) + "+" + c + "";
                }
                break;
            }
        }
    }
    return info;
}
/**
 * 提取字符串中的引号和一对引号包围的内容
 * @param  str    待处理字符串
 * @param  quotes 初始引号可选范围，缺省为[',"]
 * @return Object        {
 *                           raw: 源字符串
 *                           uri: 引号包围的文字内容
 *                           quote: 引号类型
 *                         }
 *
*  请求末尾默认添加requestType='pc'
 */
function stringQuoteJava(str, quotes) {
    var info = {
        raw: str,
        uri: str = str.trim(),
        quote: ''
    };
    if (str) {
        quotes = quotes || '\'"';
        var strLen = str.length - 1;
        for (var i = 0, len = quotes.length; i < len; i++) {
            var c = quotes[i];
            if (str[0] === c) {
                info.quote = c;
                //如果最后一个分隔符是引号,则URL不带参数
                if (str[strLen] === c) {
                    info.uri = str.substring(1, strLen)+"?requestType=pc";
                } else {//不是引号结尾，可能存在js变量
                    info.uri = str.substr(1) + "+" + c + "?requestType=pc";
                }
                break;
            }
        }
    }
    return info;
}