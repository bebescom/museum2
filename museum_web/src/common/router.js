var cacheMethod = {};

var router = function (opt) {

    for (var uri in opt.when) {
        router.use(uri, opt.when[uri]);
    }

    router.start();

    if (!'onhashchange' in window) {
        console.error('window.onhashchange is not supports');
        return false;
    }

    window.onhashchange = router.start;

};

router.cacheMethod = cacheMethod;
router.changeing = false;
router.start = function () {
    // console.log(router.changeing);
    if (router.changeing) {
        return;
    }
    hashChange(location.hash.substr(1));
};

function hashChange(hashVal) {
    var arr = hashVal.split("/").slice(1);

    for (var i = 0; i <= arr.length; i++) {
        var uri = '/' + arr.slice(0, arr.length - i).join('/');
        // console.log(uri, i);
        if (cacheMethod[uri]) {
            var arg = arr.slice(arr.length - i);
            cacheMethod[uri].fn.apply(this, arg);
            // console.log(uri, arg);
            return;
        }
    }
}

function parseHash(hashVal) {
    var arr = hashVal.split("/");
    var ret = {};
    ret.method = '/' + arr[1];
    var arg = arr.slice(2);
    for (var i = 0; i < arg.length; i++) {
        if (arg[i] && arg[i] != '') {
            if (arg[i][0] != ':') {
                ret.method += '/' + arg[i];
            } else {
                ret.arg = arg[i];
            }
        }
    }

    return ret;
}

router.use = function (path, fn) {

    var ret = parseHash(path);
    cacheMethod[ret.method] = {fn: fn, arg: ret.arg};
    //console.log(ret);
};


router.path = function (uri) {
    var hash = location.hash.substr(1);
    if (!uri) {
        return hash;
    }
    if (uri == hash) {//onhashchange无法相同请求
        router.start();
    } else {
        location.hash = '#' + uri;
    }

};

router.get = function (name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
    var r = window.location.search.substr(1).match(reg);  //匹配目标参数
    if (r != null) return decodeURI(r[2]);
    return null; //返回参数值
};
router.set = function (hash) {//仅改变hash,不执行
    router.changeing = true;
    location.hash = '#' + hash;

    setTimeout(function () {//等待跳转，延迟改变
        router.changeing = false;
    }, 0);

};

module.exports = router;