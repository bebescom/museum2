var express = require('express');
var config = require('../config');
var app = express();
var server = require('http').createServer(app);
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var compression = require('compression');

/*web socket.io*/
require('./socket.io/index').start(server);

app.set('port', config.web_port);

app.disable("x-powered-by");

app.set('views', __dirname + '/views');

app.engine('html', require('ejs').renderFile);

app.set('view engine', 'html');

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({extended: true})); // for parsing application/x-www-form-urlencoded

app.use(compression());
app.use(cookieParser());

var sessionConfig = {
    name: config.sid || 'web_',
    secret: config.secret,
    cookie: {securc: true},
    resave: true,
    saveUninitialized: true
};
var RedisStore = require('connect-redis')(session);
sessionConfig.store = new RedisStore();
app.use(session(sessionConfig));

app.use(express.static(__dirname + '/public', {maxAge: 0}));
//app.use(express.logger({format: 'dev', stream: {write: console.log}}));

app.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    next();
});

app.use('/', require('./modules'));

app.use(express.static(__dirname + '/views'));

server.listen(app.get('port'), function () {
    console.log('express listening on port ' + app.get('port'));
});
