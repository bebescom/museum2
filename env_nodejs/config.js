// 尽量不修改config.js,修改sgdzl.ini,且移动到 PHP_INI_SCAN_DIR
var ini = require('./lib/ini');

var config = {};
//同台服务器上多个应用必须修改sid
config.sid = ini.get('MUSEUM_NT_SID', 'env_');

config.secret = config.sid + "secret_sgdzl_nodejs";

//1.0 mongo连接，导数据时需要
config.mongodb_url = "mongodb://";
if (ini.get('MUSEUM_DB_MONGODB_USER')) {
    config.mongodb_url += ini.get('MUSEUM_DB_MONGODB_USER') + ":" + ini.get('MUSEUM_DB_MONGODB_PWD') + '@';
}
config.mongodb_url += ini.get('MUSEUM_DB_HOST') + ":" + ini.get('MUSEUM_DB_MONGODB_PORT') + "/" + ini.get('MUSEUM_DB_MONGODB_NAME');

//2.0 mysql连接
config.mysql = {
    host: ini.get('MUSEUM_DB_HOST'),
    user: ini.get('MUSEUM_DB_USER'),
    password: ini.get('MUSEUM_DB_PWD'),
    database: ini.get('MUSEUM_DB_NAME_PREFIX') + '_env',
    port: ini.get('MUSEUM_DB_PORT'),
    timezone: 'PRC',
    connectionLimit: 50
};
//web服务端口
config.web_port = ini.get('MUSEUM_NT_WEB_PORT', 8020) * 1;
//接收硬件数据端口
config.net_port = ini.get('MUSEUM_NT_SOCKET_PORT', 8021) * 1;
//转发socket接收到的数据,如8031
config.forward_port = ini.get('MUSEUM_NT_FORWARD_PORT', 0) * 1;
config.forward_host = ini.get('MUSEUM_NT_FORWARD_HOST', '127.0.0.1');

//local 删除api_hosts
if (ini.get('MUSEUM_NT_API')) {

    config.api_url = 'http://' + ini.get('MUSEUM_WEB_HOST') + ':' + ini.get('MUSEUM_WEB_PORT') + '/' + ini.get('MUSEUM_WEB_VERSION') + '/env_api/';
    config.api_key = ini.get('MUSEUM_WEB_ENV_API_KEY');
    config.api_user = ini.get('MUSEUM_NT_API_USER', "sgdzl");
    config.api_pwd = ini.get('MUSEUM_NT_API_PWD', "sgdzl_admin");
}

//55aa协议版本库
config.versons = ['10'];
//55aa协议指令
config.instructs = [
    '01', '02', '03', '04', '05', '06', '07', '08', '09',
    '10', '11', '12',
    '20', '21', '22',
    '30', '31', '32',
    '81', '82', '83', '84', '85', '86',
    '90', '91', '92', '93', '94',
    'a0', 'a1', 'a2', 'a3',
    'b0', 'b1', 'b2', 'b3', 'b4',
    'c1'];

// 保存100个每个日志20M
config.maxLogSize = ini.get('MUSEUM_NT_MAXLOGSIZE', 50);
config.backups = ini.get('MUSEUM_NT_BACKUPS', 100);

config.redis = {
    host: '127.0.0.1',
    port: '6379',
    prefix: config.sid
};

//与元智交互数据
config.rabbitMQUrl = ini.get('MUSEUM_NT_RABBIT_MQ_URL');//amqp://microwise:microwise@192.168.8.13:5672//galaxy';
//站点ID/监测站ID,暂时没有使用
config.siteId = ini.get('MUSEUM_NT_SITE_ID');//'50010601';
//区域中心
config.region_rabbitMQUrl = ini.get('MUSEUM_NT_REGION_RABBIT_MQ_URL');//amqp://microwise:microwise@192.168.8.13:5672//galaxy';

//终端发送数据超时时间(s)
config.sensor_timeout = ini.get('MUSEUM_NT_SENSOR_TIMEOUT', 17 * 60) * 1;
//网关心跳包超时间隔(s)
config.gateway_timeout = ini.get('MUSEUM_NT_GATEWAY_TIMEOUT', 100 * 60) * 1;
//重复帧判定时间(s)
config.repeat_time = ini.get('MUSEUM_NT_REPEAT_TIME', 1800) * 1;

//定义多少秒查询一次数据库env表(s)
config.weatherEnvQueryTime = ini.get('MUSEUM_NT_WEATHER_ENV_QUERY_TIME', 60) * 1;
//定义多少秒去读取实时气象数据(s)
config.weatherSensorTime = ini.get('MUSEUM_NT_WEATHER_SENSOR_TIME', 60) * 1;

//定时各种设备检测任务
config.open_cron_check = ini.get('MUSEUM_NT_OPEN_CRON_CHECK', true);

module.exports = config;