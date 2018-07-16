var im = require('../socket.io/index'),
    tool = require('../../lib/tool'),
    redis = require('../redis');

var router = require('express').Router();

router.get('/', function (req, res) {
    res.send('im');
});


module.exports = router;