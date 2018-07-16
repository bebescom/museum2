var tool = require('../lib/tool');
var config = require('../config');
var index = require('./index');

var client = require("../lib/redis").createClient();

var subClient = require("../lib/redis").createClient();

subClient.on("message", function (channel, message) {
    //console.log('socket/subscribe', channel, message);
    if (channel === config.redis.prefix + 'sensor') {
        var json = JSON.parse(message);
        switch (json.type) {
            case 'route':
                index.send_route(json.data);
                break;
            case 'sensor':
                index.send_sensor(json.data);
                break;
        }
    }

});

subClient.subscribe(config.redis.prefix + "sensor");


/**/

exports.sendToRoom = function (room, event, data) {
    var json = {
        type: 'room_emit',
        room: room,
        event: event,
        data: data
    };
    client.publish(config.redis.prefix + 'web', JSON.stringify(json));

};