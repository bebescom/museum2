var _path = location.pathname.split('/');
_path.pop();

var socket = io(location.origin, {path: _path.join('/') + '/socket.io'});

socket.on('connect', function () {
    console.log('connect');
    $('#sensorText').empty();
});

socket.on('reconnecting', function () {
    console.log('reconnecting');
    $('#sensorText').html('连接丢失,正在尝试重新连接...' +
        '长时间未连接请<a href="javascript:window.location.reload();">刷新页面</a>');
});

socket.on('connect_failed', function () {
    console.log('connect_failed');
    socket.socket.reconnect();
});

socket.on('disconnect', function () {
    $('#sensorText').text('已断开连接!');
});