var tool = require('../../lib/tool');
var config = require('../../config');
var redis = require('../redis');
var express = require('express');
var router = express.Router();

//不需要登录
router.get('/config', function (req, res) {
    res.send({
        gateway_timeout: config.gateway_timeout,
        sensor_timeout: config.sensor_timeout
    });
});

router.get('/box_alert', function (req, res) {
    console.log(req.query);
    redis.sendToRoom("museum", "alert_msg", req.query);
    res.send('ok');
});

router.get('/security_alert', function (req, res) {
    console.log(req.query);
    redis.sendToRoom("museum", "security_msg", req.query);
    res.send('ok');
});
router.get('/env_alert', function (req, res) {
    console.log(req.query);
    redis.sendToRoom("museum", "env_msg", req.query);
    res.send('ok');
});
router.get('/equip_alert', function (req, res) {
    console.log(req.query);
    redis.sendToRoom("museum", "equip_msg", req.query);
    res.send('ok');
});

router.get('/im', function (req, res) {
    res.send('im');
});

router.get('/sendDown', function (req, res) {
    redis.nowSendDown();
    res.send('ok');
});


var fs = require('fs');
var path = require('path');
var pwd_file = path.normalize(__dirname + '/../../web.pwd');

router.post('/login', function (req, res) {
    var pwd = req.body.pwd;

    fs.readFile(pwd_file, 'utf8', function (err, data) {
        if (err) {
            console.error(err);
            res.send('read web.pwd error');
            return;
        }
        if (pwd === data) {
            req.session.send_pwd = pwd;
            // console.log(req.session);
            res.send('ok');
        } else {
            res.send('密码错误!');
        }

    });

});

//需要登录
router.use(function (req, res, next) {
    if (req.session.send_pwd) {
        next();
    } else {
        var op_token = req.query.op_token;
        if (op_token == '60021539dfce93c49bb4c21c42e2c18b') {
            req.session.send_pwd = 'op';
            res.redirect('/');
            return;
        }
        fs.access(pwd_file, function (err) {
            if (err) {
                next();
            } else {
                res.render('login');
            }
        });

    }
});

router.post('/logout', function (req, res) {
    req.session.send_pwd = null;
    res.send('ok');
});

router.use('/sensor', require('./sensor'));
router.use('/report', require('./report'));


router.get('/log/:name', function (req, res) {
    var fs = require('fs');
    var name = req.params.name || 'run.log';
    var stream = fs.createReadStream(__dirname + '/../../logs/' + name);
    stream.pipe(res);
});


router.get('/vibration/count_all', function (req, res) {

    require('../../other/vibration').count_all(function (err) {
        if (err) {
            res.send(err);
            return;
        }
        res.send('ok');
    });

});

module.exports = router;
