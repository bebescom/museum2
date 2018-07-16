var sensor = require('./model/sensor');
var sensorRedis = require('./model/sensor-redis');
var sensorGrid = require('./model/sensor-grid');
var send_down = require('./model/send_down');
var connect = require('./model/connect');
var box = require('./model/box');

var tool = require('../../lib/tool');
var config = require('../../config');

var router = require('express').Router();


router.get('/gridParams', function (req, res) {
    res.send(sensorGrid.params);
});


router.all('/allUsers', sensorRedis.getAllUsers);

router.post('/socketList', sensorRedis.socketList);
router.post('/allSocket', sensorRedis.allSocket);

router.post('/lostSocket', sensorRedis.lostSocket);
router.post('/repeatList', sensorRedis.repeatList);
router.post('/killOne', sensorRedis.killOne);

router.post('/sendDown', sensorRedis.sendDown);

router.post('/sensorList', sensor.sensorList);
router.post('/routeList', sensor.routeList);
router.post('/feedbackList', sensor.feedbackList);

router.post('/crcErrorList', sensor.crcErrorList);
router.post('/apiList', sensor.apiList);

router.post('/connectShow', connect.connectShow);
router.post('/connectList', connect.connectList);
router.post('/connectTimeOutList', connect.connectTimeOutList);
router.post('/edit_timeout', connect.editTimeout);


router.post('/gateway', sensor.gateway);

router.post('/calc', require('./model/calc').calc);


router.post('/gridList', sensorGrid.gridList);

router.post('/equip_operation', send_down.equip_operation);

router.post('/equips', send_down.equips);
router.post('/batch_send_down', send_down.batch_send_down);
router.post('/send_log', send_down.send_log);
router.post('/cancel_down', send_down.cancel_down);

router.post('/box_map', box.box_map);
router.post('/box_gateways', box.box_gateways);
router.post('/box_data', box.box_data);



module.exports = router;
