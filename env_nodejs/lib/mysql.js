var mysql = require('mysql');
var config = require('../config');

var _poll = mysql.createPool(config.mysql);

_poll.on('end', function (err) {
    if (err) throw err;
});
_poll.on('connection', function () {
    console.log('connect mysql');
});


module.exports = _poll;

