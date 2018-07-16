// @require socket.io
// @require _

var socket;

var num=0;

exports.init = function () {

    var iourl = '';
    if (location.hostname.indexOf('192.168.') > -1 || location.hostname.indexOf('127.0.') > -1 || location.hostname.indexOf('local') > -1) {
        iourl = window.web_config.monitor_port;
    } else {
        var port_arr = window.web_config.monitor_port.split(':');
        iourl = 'http://' + location.hostname + ':' + port_arr[port_arr.length - 1];
    }

    socket = io.connect(iourl);

    socket.on('connect', function () {
        console.log('connect');
        socket.emit('museum', window.web_config.user);
    });

    socket.on('reconnecting', function () {
        console.log('reconnecting');
    });

    socket.on('connect_failed', function () {
        console.log('connect_failed');
        socket.socket.reconnect();
    });

    socket.on('disconnect', function () {
        console.log("disconnect");
    });
    //预警 
    socket.on('alert_msg', function (data) {
        if(!window.web_config.is_web_msg){
            return
        }
        var webMsg=data.env_name+'<br/>'+data.msg;
        window.header_vm.$Notice.config({
            top:150
        })
        window.header_vm.$Notice.warning({
            title:data.alert,
            desc: false? '' : webMsg,
            duration: 10
        });
        window.header_vm.warningNum();
    });

    socket.on('security_msg', function (data) {
        if(!window.web_config.is_web_msg){
            return
        }
        var webMsg=data.env_name+'<br/>'+data.msg;
        window.header_vm.$Notice.config({
            top:150
        })
        window.header_vm.$Notice.warning({
            title:data.alert,
            desc: false? '' : webMsg,
            duration: 10
        });
        window.header_vm.warningNum();
    });

    socket.on('env_msg', function (data) {
        if(!window.web_config.is_web_msg){
            return
        }
        var webMsg=data.env_name+'<br/>'+data.msg;
        window.header_vm.$Notice.config({
            top:150
        })
        window.header_vm.$Notice.warning({
            title:data.alert,
            desc: false? '' : webMsg,
            duration: 10
        });
        window.header_vm.warningNum();
        if(window.getData){
            window.getData();
        }
    });

    socket.on('equip_msg', function (data) {
        if(!window.web_config.is_web_msg){
            return
        }
        var webMsg=data.env_name+'<br/>'+data.msg;
        window.header_vm.$Notice.config({
            top:150
        })
        window.header_vm.$Notice.warning({
            title:data.alert,
            desc: false? '' : webMsg,
            duration: 10
        });
        window.header_vm.warningNum();
    });
       
   
    
    return socket;
};

exports.on = function (event, func) {
    socket.on(event, func);
};

exports.emit = function (event, func) {
    socket.emit(event, func);
};