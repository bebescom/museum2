var tool = require('../lib/tool');


if (process.argv[2] == 'app') {
    require('../lib/logs').nolog();
    startReceive();
} else {
    require('../lib/logs').filelog('message');
    startServer();
}

function loginfo(str) {
    console.log("[32m(" + process.pid + ")" + tool.datetime('Y-m-d H:i:s.u') + " INFO[39m " + str);
}

function startServer() {
    loginfo('start Server');

    var child_process = require('child_process');
    var server = child_process.spawn(process.execPath, [__filename, 'app']);
    server.stdout.on('data', function (data) {
        console.log(data.toString());
    });
    server.stderr.on('data', function (data) {
        console.error(data.toString());
    });
    server.on('error', function (err) {
        console.error(err);
    });
    server.on('exit', function (code, signal) {
        loginfo(server.pid + ' Server exit code:' + code);
        server.kill(signal);
        setTimeout(startServer, 5000);
    });
}

function startReceive() {
    mongodb.open(function(db){
        db.collection("config").findOne({}, function(err, row){
            if(err) throw err;
            // 'amqp://microwise:microwise@192.168.8.169:5672//galaxy'
            var mqurl = 'amqp://'+row.mq.name+':'+row.mq.pass+'@'+row.mq.host+':'+row.mq.port+'//'+row.mq.vhost;
            var RabbitMQ = require("rabbitmq").createConnect(mqurl).RabbitMQ;
            var upstreamQueue = new RabbitMQ(row.mq.queue, {durable: true, autoDelete: false});
            upstreamQueue.subscribe(function (msgObj) {
                if(msgObj.message && msgObj.message.sender != row.system.museum_id){ // 自身发送的消息
                    handleMsg(msgObj.message);  // 处理数据
                    // require('./sensor/redis').sendtoroom('museum', 'transaction', json); //页面推送
                }
                msgObj.acked();
            }, function () {
                loginfo('rabbitMQ success subscribe - ['+row.mq.queue+']...');
            }, true);
        });
    });
}

function handleMsg(msg) {
    mongodb.open(function(db){
        if(msg.type=='message' || msg.type=='notice'){
            db.collection("message").insert(msg, function(err){
                if(err) throw err;
            });
        }else if(msg.type=='reply'){
            var msgid = msg['msgid'];
            delete msg.msgid;
            delete msg.type;
            db.collection("message").update({msgid:msgid}, {'$push':{'reply':msg}}, function(err, result){
                if(err) throw err;
            });
        }
    });
}
