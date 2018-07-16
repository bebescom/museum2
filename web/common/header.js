define('common/header', function(require, exports, module) {
// 
// 
// 
// 
// 
// 
// 
// 


function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
}

var sso_code = getQueryString('code');
// 单点登录
if (sso_code) {
    $.ajax({
        type: "POST",
        url: '/2.2.05_P001/base_api/base/users/sso',
        data: {auth_code: code},
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
            }
        }
    });
}
var op_token = getQueryString('op_token');
// 运维登录
if (op_token) {
    $.ajax({
        type: "POST",
        url: '/2.2.05_P001/base_api/base/users/op',
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
                location.search = '';
            }
        }
    });
}

var ajaxOption = {
    error: function (XMLHttpRequest, textStatus, errorThrown) {
        console.log(XMLHttpRequest);
        //ajax 异步请求错误处理
        if (XMLHttpRequest && XMLHttpRequest.responseJSON && XMLHttpRequest.responseJSON.error === '没有登录') {
            vm.$Message.error(XMLHttpRequest.responseJSON.error + ',即将返回登录界面...', 3, function () {//当没有登录时,提示并跳转到首页
                store.session.clear();
                window.location.href = '../login' + '?url=' + location.href;
            });
        } else if (XMLHttpRequest && XMLHttpRequest.responseJSON && XMLHttpRequest.responseJSON.error) {
            vm.$Message.error('网络错误!');
        }
    }
};

if ('/2.2.05_P001/base_api'[0] != '/' && store.session('museum_token')) {//跨域
    ajaxOption.headers = {
        'access_token': store.session('museum_token')
    };
}


$.ajaxSetup(ajaxOption);

window.web_config = store.session('web_config');

if (!window.web_config) {
    $.ajax({
        type: "GET",
        url: '/2.2.05_P001/base_api/base/config',
        dataType: "json",
        async: false,//同步获取
        success: function (data) {
            if (data && data['error']) {
                document.write(data.error);
                return;
            }
            if (!data['user']) {
                store.session('museum_token');
                document.body.innerHTML = '';
                window.location.href = '../login' + '?url=' + location.href;
                return;
            }
            window.web_config = data;
            store.session('museum_token', data.token);
            store.session('web_config', data);
        }
    });
}

window.my_store = store.namespace('m_' + window.web_config.user.id);

document.title = window.web_config.app_name;

window.socket = require('common/socket.io').init();

require('common/permission');//权限

window.web_config.language = store('language') || 'chinese';
if (['chinese', 'tibetan', 'english'].indexOf(window.web_config.language) === -1) {
    window.web_config.language = 'chinese';
}
$('head').append('<' + 'link rel="stylesheet" href="../common/language_pack/' + window.web_config.language + '/lang.css"></script>')
    .append('<' + 'script type="text/javascript" src="../common/language_pack/' + window.web_config.language + '/lang.js"></script>');

window.get_language = function (param) {

    if (param) {
        window.languages[param];
    }
    return window.languages;
};

var vm = exports.vm = window.header_vm = new Vue({
    el: '#header',
    data: {
        web_config: window.web_config,
        all_num: 0,//新增预警消息的数量
        warn_times: 0

    },
    ready: function () {
        var This = this;
        $.get('/2.2.05_P001/base_api/env/monitor/alerts/alert_unknown', function (data) {//之前未清除消息
            This.all_num = data.total;
        });
    },
    methods: {
        paramSetting: function () {
            location.href = '../paramSetting';
        },
        exit: exit,
        userManagement: function (user) {
            location.href = '../userManagement';
        },
        change_language: function (params) {
            store('language', params);
            window.location.reload();
        },//改变语言
        warningList: function () {
            window.location.href = '../capsule/#!/environment/Environmental_levels';
            var This = this;
            $.post('/2.2.05_P001/base_api/base/users/active/alert_activity', {alert_type: 'env'}, function (data) {//更新消息的查看状态
                console.log(data)
            })
        },
        warningNum: function () {
            var This = this;
            this.warn_times++;//每次预警，次数加一
            $.get('/2.2.05_P001/base_api/env/monitor/alerts/alert_unknown', {index: this.warn_times}, function (data) {//之前未清除消息

                if (data.index == This.warn_times) {//当前预警和ajax返回的次数一致时，此时数据为最后一次请求数据
                    This.all_num = data.total;
                }
            });
        }
    }
});

function exit() {
    vm.$Loading.start();
    $.post('/2.2.05_P001/base_api/base/users/logout', function (data) {
        vm.$Loading.finish();
        if (data && data['error']) {
            // console.error(data);
            vm.$Message.error(data.error);
            return;
        }
        if (data['is_exit']) {
            //store.session('web_config',null);
            store.session.clear();
            window.location.href = '../login';
        }
    });
}

var param_unit_name = store('param_unit_name');
//当本地存储配置文件出错时,重新登录
if (!param_unit_name) {
    vm.$Message.error('配置文件异常,请重新登录!', 3, function () {
        exit();
    });
} else {
    window.web_config.param_unit_name = param_unit_name;
}

window.get_param_unit_name = function (param) {
    var _obj = {
        key: param,
        name: '',
        unit: '',
        status: store(param + '_status') || 'default',//自定义user-defined
        min: store(param + '_min') || null,
        max: store(param + '_max') || null,
    };
    if (param_unit_name.sensor[param]) {
        _obj.unit = param_unit_name.sensor[param].unit;
        _obj.name = param_unit_name.sensor[param].name;
    } else if (param_unit_name.vibration[param]) {
        _obj.unit = param_unit_name.vibration[param].unit;
        _obj.name = param_unit_name.vibration[param].name;
    } else if (param_unit_name.weather[param]) {
        _obj.unit = param_unit_name.weather[param].unit;
        _obj.name = param_unit_name.weather[param].name;
    } else {
        return false;
    }
    return _obj;
};

exports.limitLength = function () {
    if (vm.downLoadingLen > 4) {
        return false;
    } else {
        return true;
    }
};

});