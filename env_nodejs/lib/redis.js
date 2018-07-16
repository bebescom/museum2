var cluster = require('cluster');
var redis = require("redis");
var config = require("../config");
var workClient;

exports.createClient = function () {

    if (!global['isapp'] && cluster.isMaster) {
        return createClient();
    } else {
        if (!workClient) {
            workClient = createClient();
        }
    }

    return workClient;

};

function createClient() {
    var client = redis.createClient(config.redis.port,config.redis.host);
    client.on('connect', function () {
        console.log('redis connect')
    });
//    client.on("error", function (err) {
//        //console.error("redis Error ",err);
//        console.error('redis error');
//    });
    client.on("end", function () {
        console.error("redis end");
    });
    return client;
}
