//依赖
// @require iview.css
// @require login.css
// @require vue
// @require iview
// @require $
// @require _
// @require qrcode
// @require store2

function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
}

var op_token = getQueryString('op_token');
// 运维登录
if (op_token) {
    $.ajax({
        type: "POST",
        url: API('/base/users/op'),
        data: {op_token: op_token},
        dataType: "json",
        async: false,//同步获取
        success: function (data) {
            if (data && data['error']) {
                // console.error(data);
                document.write(data.error);
                return;
            }
            if (data['is_login']) {
                store.session('museum_token', data.token);
                getParamUnit();
            }
        }
    });
}


var ajaxOption = {
    error: function (XMLHttpRequest, textStatus, errorThrown) {
        console.error(this, arguments);
    }
};

if (API('')[0] != '/' && store.session('museum_token')) {//跨域
    ajaxOption.headers = {
        'access_token': store.session('museum_token')
    };
}

$.ajaxSetup(ajaxOption);

var vm = new Vue({
    el: '#login',
    data: {
        app_name: '',
        app_login: '',
        msg: '',
        user: '',
        pwd: '',
        check_box: 0
    },
    methods: {
        login: login
    }
});

if (!window['localStorage'] || !window['sessionStorage']) {
    vm.$Message.error('当前浏览器不能使用本地存储，请更换chrome谷歌浏览器或火狐浏览器等现代浏览器!', 0);
}

$.get(API('/base/config#nologin'), function (data) {
    if (data.error) {
        vm.$Message.error(data.error);
        return;
    }
    store.session('museum_token', data.token);

    if (data['user']) {
        document.body.innerHTML = '';
        window.location.href = __uri('/capsule');
        return;
    }
    vm.app_name = data.app_name;
    vm.app_login = data.app_login;
    document.title = data.app_name;

    var app_ip = data.app_ip || '', app_port = data.app_port;
    if (data.app_port && data.app_port.indexOf(':') > -1) {
        var tmp_arr = data.app_port.match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}):([0-9]{1,5})/);
        app_port = tmp_arr.pop();
        app_ip = tmp_arr.pop();
    } else if (app_ip) {
        app_ip = location.host;
    }
    var apk_url = 'http://mpecs.zillions.com.cn:10005/appUpdate/museum.apk?ip=' + app_ip + '&port=' + app_port;

    jQuery('#QR_code').qrcode({
        width: 151, height: 151,
        text: apk_url
    });

});

function login() {

    if (!vm.user) {
        vm.msg = "请输入用户名!";
        return;
    }
    if (!vm.pwd) {
        vm.msg = "请输入密码!";
        return;
    }
    // if (!vm.check_box) {
    //     vm.$set('msg', "请勾选'我同意该系统保密协议所有规定'");
    //     return;
    // }
    vm.msg = "登录中...";
    $.post(API('/base/users/login'), {user: vm.user.trim(), pwd: vm.pwd.trim()}, function (data) {
        console.log(data);
        if (data['error']) {
            vm.msg = data.error;
            return;
        }
        vm.msg = data.msg;

        if (data['is_login']) {
            store.session('museum_token', data.token);

            var url = __uri('/capsule');
            if (location.href.indexOf('url=') > -1) {
                var url_str = location.href.split('url=')[1];
                if (url_str.indexOf('&') > -1) {
                    url = url_str.split('&')[0];
                } else {
                    url = url_str;
                }
            }
            // window.location.href = url;
            $.ajaxSetup({
                headers: {
                    'access_token': data.token
                }
            });
            getParamUnit(url);
        }
    });

}


function getParamUnit(url) {
    $.get(API('/env/equipments/equip_parameters'), function (res) {
        if (res.error) {
            vm.$Message.error(res.error);
            return false;
        }
        store('param_unit_name', res);
        window.location.href = url || __uri('/capsule');
    }).error(function (res) {
        vm.$Message.error(res);
    });
}