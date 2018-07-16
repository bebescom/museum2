/*
Navicat MySQL Data Transfer

Source Server         : localhost_3307
Source Server Version : 50505
Source Host           : localhost:3307
Source Database       : museum_env

Target Server Type    : MYSQL
Target Server Version : 50505
File Encoding         : 65001

Date: 2018-05-03 17:01:00
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for alert
-- ----------------------------
DROP TABLE IF EXISTS `alert`;
CREATE TABLE `alert` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id',
  `env_no` varchar(50) DEFAULT NULL COMMENT '环境编号',
  `relic_no` varchar(50) DEFAULT NULL COMMENT '文物编号',
  `equip_no` varchar(50) DEFAULT NULL COMMENT '设备编号',
  `alert_type` varchar(50) DEFAULT NULL COMMENT '报警类型',
  `level` varchar(50) DEFAULT NULL COMMENT '报警级别',
  `content` text COMMENT '报警消息',
  `alert_time` int(11) DEFAULT NULL COMMENT '初次报警时间',
  `clear_time` int(11) DEFAULT NULL COMMENT '清除时间',
  `alert_count` int(11) DEFAULT NULL COMMENT '报警次数',
  `alert_param` varchar(50) DEFAULT NULL COMMENT '报警参数',
  `alert_val` varchar(50) DEFAULT NULL COMMENT '报警极值',
  `remark` varchar(100) DEFAULT NULL COMMENT '备注',
  PRIMARY KEY (`id`),
  KEY `env_no` (`env_no`) USING BTREE,
  KEY `relic_no` (`relic_no`) USING BTREE,
  KEY `equip_no` (`equip_no`,`alert_param`,`env_no`,`clear_time`) USING BTREE,
  KEY `clear_time` (`clear_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Records of alert
-- ----------------------------

-- ----------------------------
-- Table structure for box
-- ----------------------------
DROP TABLE IF EXISTS `box`;
CREATE TABLE `box` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id',
  `env_no` varchar(50) DEFAULT NULL COMMENT '环境编号',
  `parent_env_no` varchar(50) DEFAULT NULL COMMENT '上级环境编号',
  `name` varchar(50) DEFAULT NULL COMMENT '环境名称',
  `type` varchar(50) DEFAULT NULL COMMENT '环境类型',
  `model` int(3) DEFAULT '0' COMMENT '模式',
  `map` text COMMENT '环境地图',
  `locate` text COMMENT '热区（在上级环境地图下）',
  `sort` int(11) DEFAULT '0',
  `size` varchar(50) DEFAULT NULL COMMENT '尺寸',
  `volume` varchar(50) DEFAULT NULL COMMENT '体积',
  `alert_status` int(11) DEFAULT '0',
  `box_status` int(11) DEFAULT '1',
  `alert_param` varchar(50) DEFAULT NULL COMMENT '预警参数',
  PRIMARY KEY (`id`),
  UNIQUE KEY `env_no` (`env_no`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Records of box
-- ----------------------------

-- ----------------------------
-- Table structure for box_auth
-- ----------------------------
DROP TABLE IF EXISTS `box_auth`;
CREATE TABLE `box_auth` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `box_no` varchar(50) DEFAULT NULL COMMENT '囊匣编号',
  `start_time` int(11) DEFAULT NULL COMMENT '开始时间',
  `end_time` int(11) DEFAULT NULL COMMENT '结束时间',
  `user_id` int(11) DEFAULT NULL COMMENT '操作人员',
  `auth_time` int(11) DEFAULT NULL COMMENT '授权时间',
  `auth_type` varchar(50) DEFAULT NULL COMMENT '授权类型',
  `remark` text COMMENT '备注',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Records of box_auth
-- ----------------------------

-- ----------------------------
-- Table structure for config
-- ----------------------------
DROP TABLE IF EXISTS `config`;
CREATE TABLE `config` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id',
  `key` varchar(50) DEFAULT NULL COMMENT '键名',
  `val` text COMMENT '值',
  `group` varchar(50) DEFAULT NULL COMMENT '分组',
  `input_type` varchar(50) DEFAULT NULL COMMENT 'input类型',
  `sort` int(11) DEFAULT NULL COMMENT '排序',
  PRIMARY KEY (`id`),
  UNIQUE KEY `key` (`key`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Records of config
-- ----------------------------

-- ----------------------------
-- Table structure for control_record
-- ----------------------------
DROP TABLE IF EXISTS `control_record`;
CREATE TABLE `control_record` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `equip_no` varchar(50) DEFAULT NULL COMMENT '设备编号',
  `control_time` int(11) DEFAULT NULL COMMENT '调控时间',
  `target` varchar(50) DEFAULT NULL COMMENT '目标值',
  `env_no` varchar(50) DEFAULT NULL COMMENT '环境编号',
  `replace_time` int(11) DEFAULT NULL COMMENT '计划更换时间',
  `quantity` varchar(50) NOT NULL COMMENT '用量',
  `unit` varchar(10) DEFAULT NULL COMMENT '单位',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Records of control_record
-- ----------------------------

-- ----------------------------
-- Table structure for data_route
-- ----------------------------
DROP TABLE IF EXISTS `data_route`;
CREATE TABLE `data_route` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id',
  `gateway_no` varchar(50) DEFAULT NULL COMMENT '网关编号',
  `relay1_no` varchar(50) DEFAULT NULL COMMENT '1级中继',
  `relay2_no` varchar(50) DEFAULT NULL COMMENT '2级中继',
  `relay3_no` varchar(50) DEFAULT NULL COMMENT '3级中继',
  `sensor_no` varchar(50) DEFAULT NULL COMMENT '终端编号',
  `raw_data` text COMMENT '原始数据',
  `server_time` int(11) DEFAULT NULL COMMENT '服务器时间',
  `ip_port` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `server_time` (`server_time`) USING BTREE,
  KEY `sensor_no` (`sensor_no`) USING BTREE,
  KEY `gateway_no` (`gateway_no`) USING BTREE,
  KEY `relay1_no` (`relay1_no`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Records of data_route
-- ----------------------------

-- ----------------------------
-- Table structure for data_send_down
-- ----------------------------
DROP TABLE IF EXISTS `data_send_down`;
CREATE TABLE `data_send_down` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id',
  `equip_no` varchar(50) DEFAULT NULL COMMENT '设备编号',
  `instruct` varchar(50) DEFAULT NULL COMMENT '下发指令',
  `send_data` text COMMENT '下发数据json',
  `type` tinyint(1) DEFAULT NULL COMMENT '类型：1被动下发,2主动下发',
  `status` tinyint(1) DEFAULT '1' COMMENT '状态,1等待,2已发,3已反馈,0下发失败',
  `create_time` int(11) DEFAULT NULL COMMENT '创建时间',
  `send_time` int(11) DEFAULT NULL COMMENT '下发时间',
  `send_count` int(11) DEFAULT '0' COMMENT '下发次数',
  `remark` text COMMENT '备注',
  `uid` int(11) DEFAULT NULL COMMENT '用户id',
  `feedback_time` int(11) DEFAULT NULL COMMENT '反馈时间',
  `feedback_data` text COMMENT '反馈数据json',
  `raw_data` text COMMENT '反馈原始数据',
  PRIMARY KEY (`id`),
  KEY `instruct` (`instruct`,`equip_no`) USING BTREE,
  KEY `equip_no` (`equip_no`,`status`) USING BTREE,
  KEY `create_time` (`create_time`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Records of data_send_down
-- ----------------------------

-- ----------------------------
-- Table structure for data_sensor
-- ----------------------------
DROP TABLE IF EXISTS `data_sensor`;
CREATE TABLE `data_sensor` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id',
  `equip_no` varchar(50) NOT NULL COMMENT '设备编号',
  `env_no` varchar(50) DEFAULT NULL COMMENT '环境编号',
  `humidity` varchar(50) DEFAULT NULL COMMENT '湿度',
  `temperature` varchar(50) DEFAULT NULL COMMENT '温度',
  `voc` varchar(50) DEFAULT NULL COMMENT 'voc',
  `co2` varchar(50) DEFAULT NULL COMMENT 'co2',
  `uv` varchar(50) DEFAULT NULL COMMENT '紫外',
  `light` varchar(50) DEFAULT NULL COMMENT '光照',
  `organic` varchar(50) DEFAULT NULL COMMENT '有机污染物',
  `inorganic` varchar(50) DEFAULT NULL COMMENT '无机污染物',
  `sulfur` varchar(50) DEFAULT NULL COMMENT '含硫污染物',
  `dip` varchar(50) DEFAULT NULL COMMENT '倾角',
  `acceleration` varchar(50) DEFAULT NULL COMMENT '加速度',
  `canbi` varchar(50) DEFAULT NULL COMMENT '参比',
  `voltage` varchar(50) DEFAULT NULL COMMENT '电压',
  `rssi` varchar(50) DEFAULT NULL COMMENT '信号强度',
  `move_alert` varchar(50) DEFAULT NULL COMMENT '移动报警',
  `box_open_alert` varchar(50) DEFAULT NULL COMMENT '囊匣打开报警',
  `box_status` varchar(50) DEFAULT NULL COMMENT '囊匣状态值',
  `wind_speed` varchar(50) DEFAULT NULL COMMENT '风速',
  `wind_direction` varchar(50) DEFAULT NULL COMMENT '风向',
  `rain` varchar(50) DEFAULT NULL COMMENT '雨量',
  `air_presure` varchar(50) DEFAULT NULL COMMENT '气压',
  `pm10` varchar(50) DEFAULT NULL COMMENT 'PM1.0',
  `pm25` varchar(50) DEFAULT NULL COMMENT 'PM2.5',
  `equip_time` int(11) NOT NULL COMMENT '设备时间',
  `server_time` int(11) NOT NULL COMMENT '服务器时间',
  `raw_data` text COMMENT '原始数据',
  `ip_port` varchar(50) DEFAULT NULL COMMENT 'ip:端口',
  `php_time` int(11) DEFAULT NULL,
  `alert_param` text COMMENT '报警参数',
  `status` varchar(20) DEFAULT NULL COMMENT '状态',
  `soil_humidity` varchar(50) DEFAULT NULL COMMENT '土壤含水率',
  `soil_temperature` varchar(50) DEFAULT NULL COMMENT '土壤温度',
  `soil_conductivity` varchar(50) DEFAULT NULL COMMENT '土壤电导率',
  `soil_salt` varchar(50) DEFAULT NULL COMMENT '土壤含盐量',
  `broken` varchar(50) DEFAULT NULL COMMENT '玻璃破碎检测量',
  `vibration` varchar(50) DEFAULT NULL COMMENT '震动检测量',
  `multi_wave` varchar(50) DEFAULT NULL COMMENT '多维驻波检测量',
  `cascophen` varchar(50) DEFAULT NULL COMMENT '甲醛',
  `lighting` varchar(50) DEFAULT NULL COMMENT '灯光',
  `so2` varchar(50) DEFAULT NULL COMMENT '二氧化硫',
  `lng` varchar(50) DEFAULT NULL,
  `lat` varchar(50) DEFAULT NULL,
  `no` varchar(50) DEFAULT NULL COMMENT '氮氧化物',
  `o3` varchar(50) DEFAULT NULL COMMENT '臭氧',
  `oxygen` varchar(50) DEFAULT NULL COMMENT '氧气浓度',
  PRIMARY KEY (`id`),
  KEY `server_time-equip_no` (`server_time`,`equip_no`) USING BTREE,
  KEY `equip_time-equip_no` (`equip_time`,`equip_no`) USING BTREE,
  KEY `env_no` (`env_no`,`equip_time`) USING BTREE,
  KEY `equip_no` (`equip_no`,`equip_time`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Records of data_sensor
-- ----------------------------

-- ----------------------------
-- Table structure for data_sensor_exception
-- ----------------------------
DROP TABLE IF EXISTS `data_sensor_exception`;
CREATE TABLE `data_sensor_exception` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id',
  `equip_no` varchar(50) NOT NULL COMMENT '设备编号',
  `env_no` varchar(50) DEFAULT NULL COMMENT '环境编号',
  `humidity` varchar(50) DEFAULT NULL COMMENT '湿度',
  `temperature` varchar(50) DEFAULT NULL COMMENT '温度',
  `voc` varchar(50) DEFAULT NULL COMMENT 'voc',
  `co2` varchar(50) DEFAULT NULL COMMENT 'co2',
  `uv` varchar(50) DEFAULT NULL COMMENT '紫外',
  `light` varchar(50) DEFAULT NULL COMMENT '光照',
  `organic` varchar(50) DEFAULT NULL COMMENT '有机污染物',
  `inorganic` varchar(50) DEFAULT NULL COMMENT '无机污染物',
  `sulfur` varchar(50) DEFAULT NULL COMMENT '含硫污染物',
  `dip` varchar(50) DEFAULT NULL COMMENT '倾角',
  `acceleration` varchar(50) DEFAULT NULL COMMENT '加速度',
  `canbi` varchar(50) DEFAULT NULL COMMENT '参比',
  `voltage` varchar(50) DEFAULT NULL COMMENT '电压',
  `rssi` varchar(50) DEFAULT NULL COMMENT '信号强度',
  `move_alert` varchar(50) DEFAULT NULL COMMENT '移动报警',
  `box_open_alert` varchar(50) DEFAULT NULL COMMENT '囊匣打开报警',
  `box_status` varchar(50) DEFAULT NULL COMMENT '囊匣状态值',
  `wind_speed` varchar(50) DEFAULT NULL COMMENT '风速',
  `wind_direction` varchar(50) DEFAULT NULL COMMENT '风向',
  `rain` varchar(50) DEFAULT NULL COMMENT '雨量',
  `air_presure` varchar(50) DEFAULT NULL COMMENT '气压',
  `pm10` varchar(50) DEFAULT NULL COMMENT 'PM1.0',
  `pm25` varchar(50) DEFAULT NULL COMMENT 'PM2.5',
  `equip_time` int(11) NOT NULL COMMENT '设备时间',
  `server_time` int(11) NOT NULL COMMENT '服务器时间',
  `raw_data` text COMMENT '原始数据',
  `ip_port` varchar(50) DEFAULT NULL COMMENT 'ip:端口',
  `php_time` int(11) DEFAULT NULL,
  `alert_param` text COMMENT '报警参数',
  `status` varchar(20) DEFAULT NULL COMMENT '状态',
  `soil_humidity` varchar(50) DEFAULT NULL COMMENT '土壤含水率',
  `soil_temperature` varchar(50) DEFAULT NULL COMMENT '土壤温度',
  `soil_conduitivity` varchar(50) DEFAULT NULL COMMENT '土壤电导率',
  `soil_salt` varchar(50) DEFAULT NULL COMMENT '土壤含盐量',
  `remark` text COMMENT '备注',
  `broken` varchar(50) DEFAULT NULL COMMENT '玻璃破碎检测量',
  `vibration` varchar(50) DEFAULT NULL COMMENT '震动检测量',
  `multi_wave` varchar(50) DEFAULT NULL COMMENT '多维驻波检测量',
  `cascophen` varchar(50) DEFAULT NULL COMMENT '甲醛',
  `lighting` varchar(50) DEFAULT NULL,
  `so2` varchar(50) DEFAULT NULL,
  `lng` varchar(50) DEFAULT NULL,
  `lat` varchar(50) DEFAULT NULL,
  `no` varchar(50) DEFAULT NULL COMMENT '氮氧化物',
  `o3` varchar(50) DEFAULT NULL COMMENT '臭氧',
  `oxygen` varchar(50) DEFAULT NULL COMMENT '氧气浓度',
  PRIMARY KEY (`id`),
  KEY `server_time-equip_no` (`server_time`,`equip_no`) USING BTREE,
  KEY `equip_time-equip_no` (`equip_time`,`equip_no`) USING BTREE,
  KEY `env_no` (`env_no`,`equip_time`) USING BTREE,
  KEY `equip_no` (`equip_no`,`equip_time`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Records of data_sensor_exception
-- ----------------------------

-- ----------------------------
-- Table structure for data_sensor_vibration
-- ----------------------------
DROP TABLE IF EXISTS `data_sensor_vibration`;
CREATE TABLE `data_sensor_vibration` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id',
  `equip_no` varchar(50) NOT NULL COMMENT '设备编号',
  `accel` varchar(50) DEFAULT NULL COMMENT '加速度',
  `speed` varchar(50) DEFAULT NULL COMMENT '速度',
  `displacement` varchar(50) DEFAULT NULL COMMENT '位移',
  `voltage` varchar(50) DEFAULT NULL COMMENT '电压',
  `rssi` varchar(50) DEFAULT NULL COMMENT '信号强度',
  `equip_time` int(11) NOT NULL COMMENT '设备时间',
  `server_time` int(11) NOT NULL COMMENT '服务器时间',
  `raw_data` text COMMENT '原始数据',
  `ip_port` varchar(50) DEFAULT NULL COMMENT 'ip:端口',
  `alert_param` text,
  `_id` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `_id` (`_id`) USING BTREE,
  KEY `server_time-equip_no` (`server_time`,`equip_no`) USING BTREE,
  KEY `equip_time-equip_no` (`equip_time`,`equip_no`) USING BTREE,
  KEY `env_no` (`equip_time`) USING BTREE,
  KEY `equip_no` (`equip_no`,`equip_time`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Records of data_sensor_vibration
-- ----------------------------

-- ----------------------------
-- Table structure for data_sensor_vibration_count
-- ----------------------------
DROP TABLE IF EXISTS `data_sensor_vibration_count`;
CREATE TABLE `data_sensor_vibration_count` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `equip_no` varchar(50) DEFAULT NULL,
  `count_time` int(11) NOT NULL COMMENT '时间',
  `accel_max` varchar(50) DEFAULT NULL,
  `accel_min` varchar(50) DEFAULT NULL,
  `accel_average` varchar(50) DEFAULT NULL,
  `speed_max` varchar(50) DEFAULT NULL,
  `speed_min` varchar(50) DEFAULT NULL,
  `speed_average` varchar(50) DEFAULT NULL,
  `displacement_max` varchar(50) DEFAULT NULL,
  `displacement_min` varchar(50) DEFAULT NULL,
  `displacement_average` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `count_time` (`equip_no`,`count_time`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Records of data_sensor_vibration_count
-- ----------------------------

-- ----------------------------
-- Table structure for equip
-- ----------------------------
DROP TABLE IF EXISTS `equip`;
CREATE TABLE `equip` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id',
  `equip_no` varchar(50) DEFAULT NULL COMMENT '设备编号',
  `name` varchar(50) DEFAULT NULL COMMENT '设备名称',
  `equip_type` varchar(50) DEFAULT NULL COMMENT '设备类型',
  `status` varchar(50) DEFAULT NULL COMMENT '设备状态',
  `usage` varchar(50) DEFAULT NULL COMMENT '使用情况',
  `env_no` varchar(50) DEFAULT NULL COMMENT '环境编号',
  `parameter` text COMMENT '传感器探头(参数)',
  `parameter_val` text COMMENT '传感器探头(参数值)',
  `last_equip_time` int(11) DEFAULT NULL COMMENT '最后数据时间',
  `sleep` int(11) DEFAULT NULL COMMENT '休眠周期',
  `locate` text COMMENT '设备定位(上级环境中)',
  `monitor_type` varchar(50) DEFAULT NULL COMMENT '监控类型',
  `ip_port` varchar(50) DEFAULT NULL COMMENT '网关ip',
  `target` varchar(50) DEFAULT NULL COMMENT '目标值',
  `image` varchar(100) DEFAULT NULL COMMENT '图片',
  `model` varchar(100) DEFAULT NULL COMMENT '产品型号',
  `manufacturer` varchar(100) DEFAULT NULL COMMENT '厂家',
  `applicability` text COMMENT '适用条件',
  `remark` text COMMENT '备注',
  `effect` varchar(200) DEFAULT NULL COMMENT '调控规格',
  PRIMARY KEY (`id`),
  UNIQUE KEY `equip_no` (`equip_no`) USING BTREE,
  KEY `equip_type` (`equip_type`) USING BTREE,
  KEY `env_no` (`env_no`) USING BTREE,
  KEY `status` (`status`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Records of equip
-- ----------------------------

-- ----------------------------
-- Table structure for equip_alert
-- ----------------------------
DROP TABLE IF EXISTS `equip_alert`;
CREATE TABLE `equip_alert` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `equip_no` varchar(50) NOT NULL DEFAULT '' COMMENT '设备编号',
  `name` varchar(50) NOT NULL COMMENT '设备名称',
  `type` varchar(20) NOT NULL COMMENT '报警类型',
  `env_no` varchar(50) DEFAULT NULL COMMENT '设备位置',
  `alert_time` int(11) NOT NULL COMMENT '报警时间',
  `alert_count` int(11) NOT NULL DEFAULT '0' COMMENT '报警次数',
  `alert_remark` text COMMENT '情况说明',
  `clear_time` int(11) DEFAULT NULL COMMENT '清除时间',
  `clear_remark` text COMMENT '清除备注',
  PRIMARY KEY (`id`),
  KEY `equip_no` (`equip_no`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Records of equip_alert
-- ----------------------------

-- ----------------------------
-- Table structure for equip_code
-- ----------------------------
DROP TABLE IF EXISTS `equip_code`;
CREATE TABLE `equip_code` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` varchar(50) DEFAULT NULL COMMENT '设备类型',
  `code` varchar(50) DEFAULT NULL COMMENT '类型编号',
  `num` int(5) DEFAULT '0' COMMENT '计数',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Records of equip_code
-- ----------------------------

-- ----------------------------
-- Table structure for equip_down
-- ----------------------------
DROP TABLE IF EXISTS `equip_down`;
CREATE TABLE `equip_down` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `msg_id` varchar(100) NOT NULL,
  `uid` int(11) NOT NULL,
  `file_name` varchar(100) NOT NULL,
  `equip_no` text,
  `time` varchar(50) DEFAULT NULL,
  `param` text,
  `access_token` varchar(100) DEFAULT NULL,
  `status` varchar(10) DEFAULT NULL,
  `start_time` int(11) DEFAULT NULL,
  `file_url` varchar(100) DEFAULT NULL,
  `end_time` int(11) DEFAULT NULL,
  `body` text,
  `ack` tinyint(1) DEFAULT '0',
  `ack_time` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `msg_id` (`msg_id`) USING BTREE,
  KEY `uid` (`uid`,`file_name`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Records of equip_down
-- ----------------------------

-- ----------------------------
-- Table structure for equip_operation
-- ----------------------------
DROP TABLE IF EXISTS `equip_operation`;
CREATE TABLE `equip_operation` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id',
  `equip_no` varchar(50) DEFAULT NULL COMMENT '设备编号',
  `env_no` varchar(50) DEFAULT NULL COMMENT '环境编号',
  `operation` varchar(50) DEFAULT NULL COMMENT '操作类型',
  `uid` int(11) DEFAULT NULL,
  `operator` varchar(50) DEFAULT NULL COMMENT '操作人员',
  `operation_time` int(11) DEFAULT NULL COMMENT '操作时间',
  `remark` text COMMENT '备注',
  `instruct` varchar(10) DEFAULT NULL COMMENT '下发指令',
  `send_data` text COMMENT '下发数据json',
  `send_type` tinyint(1) DEFAULT NULL COMMENT '类型：1被动下发,2主动下发,3周期性下发',
  `send_cycle` tinyint(1) DEFAULT NULL COMMENT '周期性下发,1每天0点，2每周一0点，3每月1日0点',
  `send_status` tinyint(1) DEFAULT NULL COMMENT '状态,1等待,2已发,3已反馈,0下发失败',
  `send_time` int(11) DEFAULT NULL COMMENT '下发时间',
  `send_count` int(11) DEFAULT '0' COMMENT '下发次数',
  `send_frame_num` int(11) DEFAULT NULL COMMENT '下发帧序号',
  `feedback_time` int(11) DEFAULT NULL COMMENT '反馈时间',
  `feedback_data` text COMMENT '指令反馈结果',
  `raw_data` text COMMENT '反馈原始数据',
  PRIMARY KEY (`id`),
  KEY `equip_no` (`equip_no`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Records of equip_operation
-- ----------------------------

-- ----------------------------
-- Table structure for equip_param
-- ----------------------------
DROP TABLE IF EXISTS `equip_param`;
CREATE TABLE `equip_param` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id',
  `param` varchar(50) DEFAULT NULL COMMENT '参数',
  `name` varchar(50) DEFAULT NULL COMMENT '名称',
  `unit` varchar(50) DEFAULT NULL COMMENT '单位',
  `type` varchar(50) DEFAULT NULL COMMENT '传感器,调控设备',
  `sort` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8 COMMENT='设备参数表';

-- ----------------------------
-- Records of equip_param
-- ----------------------------
INSERT INTO `equip_param` VALUES ('1', 'temperature', '温度', '℃', 'sensor', '1');
INSERT INTO `equip_param` VALUES ('2', 'humidity', '相对湿度', '%', 'sensor', '2');
INSERT INTO `equip_param` VALUES ('3', 'voc', '有机挥发物', 'ppb', 'sensor', '3');
INSERT INTO `equip_param` VALUES ('4', 'co2', '二氧化碳', 'ppm', 'sensor', '4');
INSERT INTO `equip_param` VALUES ('5', 'light', '光照', 'lx', 'sensor', '5');
INSERT INTO `equip_param` VALUES ('6', 'uv', '紫外', 'μW/cm²', 'sensor', '6');
INSERT INTO `equip_param` VALUES ('7', 'organic', '有机污染物', 'Hz', 'sensor', '7');
INSERT INTO `equip_param` VALUES ('8', 'inorganic', '无机污染物', 'Hz', 'sensor', '8');
INSERT INTO `equip_param` VALUES ('9', 'sulfur', '含硫污染物', 'Hz', 'sensor', '9');
INSERT INTO `equip_param` VALUES ('10', 'temperature', '温度', '℃', 'weather', '20');
INSERT INTO `equip_param` VALUES ('11', 'humidity', '相对湿度', '%', 'weather', '21');
INSERT INTO `equip_param` VALUES ('12', 'voc', '有机挥发物', 'ppb', 'weather', '22');
INSERT INTO `equip_param` VALUES ('13', 'co2', '二氧化碳', 'ppm', 'weather', '23');
INSERT INTO `equip_param` VALUES ('14', 'light', '光照', 'lx', 'weather', '24');
INSERT INTO `equip_param` VALUES ('15', 'uv', '紫外', 'μW/cm²', 'weather', '25');
INSERT INTO `equip_param` VALUES ('19', 'pm25', 'PM2.5', 'μg/m³', 'weather', '29');
INSERT INTO `equip_param` VALUES ('20', 'pm10', 'PM1.0', 'μg/m³', 'weather', '30');
INSERT INTO `equip_param` VALUES ('21', 'wind_direction', '风向', '°', 'weather', '31');
INSERT INTO `equip_param` VALUES ('22', 'wind_speed', '风速', 'm/s', 'weather', '32');
INSERT INTO `equip_param` VALUES ('23', 'rain', '降雨强度', 'mm/min', 'weather', '33');
INSERT INTO `equip_param` VALUES ('24', 'air_presure', '气压', 'hPa', 'weather', '34');
INSERT INTO `equip_param` VALUES ('25', 'cascophen', '甲醛', 'ppb', 'sensor', '10');
INSERT INTO `equip_param` VALUES ('26', 'broken', '玻璃破碎检测量', null, 'sensor', '11');
INSERT INTO `equip_param` VALUES ('27', 'vibration', '震动检测量', null, 'sensor', '12');
INSERT INTO `equip_param` VALUES ('28', 'multi_wave', '多维驻波检测量', null, 'sensor', '13');
INSERT INTO `equip_param` VALUES ('29', 'soil_temperature', '土壤温度', '℃', 'sensor', '14');
INSERT INTO `equip_param` VALUES ('30', 'soil_humidity', '土壤含水率', '%', 'sensor', '15');
INSERT INTO `equip_param` VALUES ('31', 'soil_conductivity', '土壤电导率', 'μs/cm', 'sensor', '16');
INSERT INTO `equip_param` VALUES ('32', 'accel', '加速度', 'm/s²', 'vibration', '18');
INSERT INTO `equip_param` VALUES ('33', 'speed', '速度', 'mm/s', 'vibration', '19');
INSERT INTO `equip_param` VALUES ('34', 'displacement', '位移', 'mm', 'vibration', '20');
INSERT INTO `equip_param` VALUES ('35', 'soil_salt', '土壤含盐量', 'mg/L', 'sensor', '17');
INSERT INTO `equip_param` VALUES ('36', 'lighting', '灯光亮度', '%', 'sensor', '21');
INSERT INTO `equip_param` VALUES ('37', 'so2', '二氧化硫', 'ppb', 'sensor', '22');
INSERT INTO `equip_param` VALUES ('38', 'no', '氮氧化物', 'ppb', 'sensor', '22');
INSERT INTO `equip_param` VALUES ('39', 'o3', '臭氧', 'ppb', 'sensor', '23');
INSERT INTO `equip_param` VALUES ('40', 'oxygen', '氧气浓度', 'ppb', 'sensor', '34');

-- ----------------------------
-- Table structure for equip_qcm
-- ----------------------------
DROP TABLE IF EXISTS `equip_qcm`;
CREATE TABLE `equip_qcm` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `equip_no` varchar(50) DEFAULT NULL COMMENT '设备编号',
  `env_no` varchar(50) DEFAULT NULL COMMENT '环境编号',
  `equip_time` int(11) DEFAULT NULL COMMENT '设备时间',
  `sulfur` varchar(50) DEFAULT NULL COMMENT '含硫污染物',
  `organic` varchar(50) DEFAULT NULL COMMENT '有机污染物',
  `inorganic` varchar(50) DEFAULT NULL COMMENT '无机污染物',
  PRIMARY KEY (`id`),
  UNIQUE KEY `equip_no_2` (`equip_no`,`equip_time`) USING BTREE,
  KEY `equip_no` (`equip_no`,`env_no`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Records of equip_qcm
-- ----------------------------

-- ----------------------------
-- Table structure for equip_type
-- ----------------------------
DROP TABLE IF EXISTS `equip_type`;
CREATE TABLE `equip_type` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(3) DEFAULT NULL COMMENT '设备编号前缀',
  `equip_type` varchar(50) DEFAULT NULL COMMENT '设备具体类型',
  `type` varchar(50) DEFAULT NULL COMMENT '设备大类',
  `sort` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8 COMMENT='设备类型表';

-- ----------------------------
-- Records of equip_type
-- ----------------------------
INSERT INTO `equip_type` VALUES ('1', '001', '温湿度监测终端', '监测终端', '1');
INSERT INTO `equip_type` VALUES ('2', '009', '带屏温湿度监测终端', '监测终端', '2');
INSERT INTO `equip_type` VALUES ('3', '010', '二氧化碳监测终端', '监测终端', '3');
INSERT INTO `equip_type` VALUES ('4', '012', '有机挥发物监测终端', '监测终端', '4');
INSERT INTO `equip_type` VALUES ('5', '011', '光照紫外监测终端', '监测终端', '5');
INSERT INTO `equip_type` VALUES ('6', '013', '空气质量监测终端', '监测终端', '6');
INSERT INTO `equip_type` VALUES ('7', '015', '土壤温湿度监测终端', '监测终端', '7');
INSERT INTO `equip_type` VALUES ('8', '018', '安防监测终端', '监测终端', '8');
INSERT INTO `equip_type` VALUES ('10', '017', '震动监测终端', '监测终端', '9');
INSERT INTO `equip_type` VALUES ('11', '002', '调湿机', '调控设备', '1');
INSERT INTO `equip_type` VALUES ('12', '016', '智能存储柜', '调控设备', '2');
INSERT INTO `equip_type` VALUES ('13', '998', '调控材料', '调控设备', '3');
INSERT INTO `equip_type` VALUES ('14', '003', '中继', '网络设备', '2');
INSERT INTO `equip_type` VALUES ('15', '004', '网关', '网络设备', '1');
INSERT INTO `equip_type` VALUES ('16', '005', '手持式温湿度检测仪', '移动手持设备', '1');
INSERT INTO `equip_type` VALUES ('17', '005', '手持式二氧化碳检测仪', '移动手持设备', '2');
INSERT INTO `equip_type` VALUES ('18', '005', '手持式有机挥发物检测仪', '移动手持设备', '3');
INSERT INTO `equip_type` VALUES ('19', '005', '手持式光照紫外检测仪', '移动手持设备', '4');
INSERT INTO `equip_type` VALUES ('20', '005', '手持式甲醛检测仪', '移动手持设备', '5');
INSERT INTO `equip_type` VALUES ('22', '007', '智能囊匣', '智能囊匣', '1');
INSERT INTO `equip_type` VALUES ('27', '008', '智能展柜', '调控设备', '4');
INSERT INTO `equip_type` VALUES ('28', '019', '灯光调控终端', '调控设备', '5');
INSERT INTO `equip_type` VALUES ('29', '999', '其他设备', '其他', '1');
INSERT INTO `equip_type` VALUES ('30', '014', '气象站', '气象站', '1');
INSERT INTO `equip_type` VALUES ('31', '005', '自定义手持检测仪', '移动手持设备', '6');
INSERT INTO `equip_type` VALUES ('32', '020', '甲醛监测终端', '监测终端', '10');
INSERT INTO `equip_type` VALUES ('33', '021', '二氧化硫监测终端', '监测终端', '11');
INSERT INTO `equip_type` VALUES ('34', '022', '分体式多参数监测终端', '监测终端', '12');
INSERT INTO `equip_type` VALUES ('35', '023', '氮氧化物监测终端', '监测终端', '13');
INSERT INTO `equip_type` VALUES ('36', '024', '臭氧监测终端', '监测终端', '14');

-- ----------------------------
-- Table structure for image
-- ----------------------------
DROP TABLE IF EXISTS `image`;
CREATE TABLE `image` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `no` varchar(50) DEFAULT NULL COMMENT '编号',
  `type` varchar(50) DEFAULT NULL COMMENT '类型',
  `url` text COMMENT '图片地址',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Records of image
-- ----------------------------

-- ----------------------------
-- Table structure for log
-- ----------------------------
DROP TABLE IF EXISTS `log`;
CREATE TABLE `log` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id',
  `user_id` int(11) DEFAULT NULL COMMENT '用户id',
  `username` varchar(50) DEFAULT NULL COMMENT '用户名',
  `time` int(11) DEFAULT NULL COMMENT '记录时间',
  `ip` varchar(50) DEFAULT NULL COMMENT 'IP',
  `content` text COMMENT '记录内容',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Records of log
-- ----------------------------

-- ----------------------------
-- Table structure for logs
-- ----------------------------
DROP TABLE IF EXISTS `logs`;
CREATE TABLE `logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uri` varchar(255) NOT NULL,
  `method` varchar(6) NOT NULL,
  `params` text,
  `token` varchar(40) NOT NULL,
  `ip_address` varchar(45) NOT NULL,
  `start_time` varchar(20) NOT NULL,
  `exec_time` varchar(10) DEFAULT NULL,
  `user` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Records of logs
-- ----------------------------

-- ----------------------------
-- Table structure for middle_index
-- ----------------------------
DROP TABLE IF EXISTS `middle_index`;
CREATE TABLE `middle_index` (
  `id` int(10) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `env_no` varchar(50) DEFAULT NULL COMMENT '环境编号',
  `parameter` varchar(20) DEFAULT NULL COMMENT '参数',
  `date` date DEFAULT NULL COMMENT '日期',
  `max` float(15,2) DEFAULT NULL COMMENT '最大值',
  `min` float(15,2) DEFAULT NULL COMMENT '最小值',
  `sum` float(20,2) DEFAULT NULL COMMENT '数据总和',
  `count` int(10) DEFAULT NULL COMMENT '数据总量',
  `count_well` int(10) DEFAULT NULL COMMENT '合格值总量',
  PRIMARY KEY (`id`),
  KEY `env_no` (`env_no`,`date`,`parameter`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Records of middle_index
-- ----------------------------

-- ----------------------------
-- Table structure for param_standard
-- ----------------------------
DROP TABLE IF EXISTS `param_standard`;
CREATE TABLE `param_standard` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `param` varchar(50) NOT NULL COMMENT '参数',
  `standard_reach` varchar(10) DEFAULT NULL COMMENT '达标率',
  `cv` varchar(10) DEFAULT NULL COMMENT '变异系数',
  `average` varchar(10) DEFAULT NULL COMMENT '平均值',
  `max` varchar(10) DEFAULT NULL COMMENT '极大值',
  `min` varchar(10) DEFAULT NULL COMMENT '极小值',
  `extremum_diff` varchar(10) DEFAULT NULL,
  `fluctuate` varchar(10) DEFAULT NULL COMMENT '日平均波动',
  `cumulate_light` varchar(10) DEFAULT NULL COMMENT '累积光照',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Records of param_standard
-- ----------------------------

-- ----------------------------
-- Table structure for threshold
-- ----------------------------
DROP TABLE IF EXISTS `threshold`;
CREATE TABLE `threshold` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id',
  `no` varchar(50) DEFAULT NULL COMMENT '编号',
  `type` varchar(20) DEFAULT NULL COMMENT '类型(环境、文物)',
  `temperature_min` varchar(10) DEFAULT NULL COMMENT '温度低值',
  `temperature_max` varchar(10) DEFAULT NULL COMMENT '温度高值',
  `humidity_min` varchar(10) DEFAULT NULL COMMENT '湿度低值',
  `humidity_max` varchar(10) DEFAULT NULL COMMENT '湿度高值',
  `voc_min` varchar(10) DEFAULT NULL COMMENT 'voc低值',
  `voc_max` varchar(10) DEFAULT NULL COMMENT 'voc高值',
  `co2_min` varchar(10) DEFAULT NULL COMMENT 'co2低值',
  `co2_max` varchar(10) DEFAULT NULL COMMENT 'co2高值',
  `light_min` varchar(10) DEFAULT NULL COMMENT '光照低值',
  `light_max` varchar(10) DEFAULT NULL COMMENT '光照高值',
  `uv_min` varchar(10) DEFAULT NULL COMMENT '紫外低值',
  `uv_max` varchar(10) DEFAULT NULL COMMENT '紫外高值',
  `organic_min` varchar(10) DEFAULT NULL COMMENT '有机污染物低值',
  `organic_max` varchar(10) DEFAULT NULL COMMENT '有机污染物高值',
  `inorganic_min` varchar(10) DEFAULT NULL COMMENT '无机污染物低值',
  `inorganic_max` varchar(10) DEFAULT NULL COMMENT '无机污染物高值',
  `sulfur_min` varchar(10) DEFAULT NULL COMMENT '硫化污染物低值',
  `sulfur_max` varchar(10) DEFAULT NULL COMMENT '硫化污染物高值',
  `temperature_range` varchar(10) DEFAULT NULL COMMENT '平均温度日波动阈值',
  `humidity_range` varchar(10) DEFAULT NULL COMMENT '平均湿度日波动阈值',
  `total_light` varchar(10) DEFAULT NULL COMMENT '累积照度',
  `lock` tinyint(1) DEFAULT '0' COMMENT '锁定1',
  `soil_temperature_min` varchar(10) DEFAULT NULL COMMENT '土壤温度下限',
  `soil_temperature_max` varchar(10) DEFAULT NULL COMMENT '土壤温度上限',
  `soil_humidity_min` varchar(10) DEFAULT NULL COMMENT '土壤湿度下限',
  `soil_humidity_max` varchar(10) DEFAULT NULL COMMENT '土壤湿度上限',
  `soil_salt_min` varchar(10) DEFAULT NULL COMMENT '土壤含盐量下限',
  `soil_salt_max` varchar(10) DEFAULT NULL COMMENT '土壤含盐量上限',
  `soil_conductivity_min` varchar(10) DEFAULT NULL COMMENT '土壤电导率下限',
  `soil_conductivity_max` varchar(10) DEFAULT NULL COMMENT '土壤电导率上限',
  `qcm_sulfur_min` varchar(10) DEFAULT NULL COMMENT '30天累计含硫污染物当量最小值',
  `qcm_sulfur_max` varchar(10) DEFAULT NULL COMMENT '30天累计含硫污染物当量最大值',
  `qcm_organic_min` varchar(10) DEFAULT NULL COMMENT '30天累计有机污染物当量最小值',
  `qcm_organic_max` varchar(10) DEFAULT NULL COMMENT '30天累计有机污染物当量最大值',
  `qcm_inorganic_min` varchar(10) DEFAULT NULL COMMENT '30天累计无机污染物当量最小值',
  `qcm_inorganic_max` varchar(10) DEFAULT NULL COMMENT '30天累计无机污染物当量最大值',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Records of threshold
-- ----------------------------

-- ----------------------------
-- Table structure for tokens
-- ----------------------------
DROP TABLE IF EXISTS `tokens`;
CREATE TABLE `tokens` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id',
  `token` varchar(100) DEFAULT NULL COMMENT 'token字符串',
  `level` tinyint(2) DEFAULT NULL COMMENT '级别',
  `ip` varchar(20) DEFAULT NULL COMMENT 'ip',
  `create_time` int(11) DEFAULT NULL COMMENT '创建时间',
  `last_activity` int(11) DEFAULT NULL COMMENT '最后存活时间',
  `user` text COMMENT '绑定用户json,包含用户及权限信息',
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Records of tokens
-- ----------------------------

-- ----------------------------
-- Table structure for weather
-- ----------------------------
DROP TABLE IF EXISTS `weather`;
CREATE TABLE `weather` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id',
  `weather_no` varchar(50) DEFAULT NULL COMMENT '气象站编号',
  `name` varchar(50) DEFAULT NULL COMMENT '名称',
  `address` varchar(100) DEFAULT NULL COMMENT '安装地址',
  `ip` varchar(50) DEFAULT NULL COMMENT 'IP',
  `port` varchar(50) DEFAULT NULL COMMENT '端口',
  `config` text COMMENT '配置json',
  PRIMARY KEY (`id`),
  UNIQUE KEY `weather_no` (`weather_no`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Records of weather
-- ----------------------------

-- ----------------------------
-- Table structure for weather_data
-- ----------------------------
DROP TABLE IF EXISTS `weather_data`;
CREATE TABLE `weather_data` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id',
  `weather_no` varchar(50) DEFAULT NULL COMMENT '气象站编号',
  `equip_time` int(11) DEFAULT NULL COMMENT '设备时间',
  `server_time` int(11) DEFAULT NULL COMMENT '服务器时间',
  `humidity` varchar(50) DEFAULT NULL COMMENT '湿度',
  `temperature` varchar(50) DEFAULT NULL COMMENT '温度',
  `rain` varchar(50) DEFAULT NULL COMMENT '雨量',
  `voc` varchar(50) DEFAULT NULL COMMENT 'VOC',
  `co2` varchar(50) DEFAULT NULL COMMENT '二氧化碳',
  `light` varchar(50) DEFAULT NULL COMMENT '光照',
  `pm25` varchar(50) DEFAULT NULL COMMENT 'PM2.5',
  `air_presure` varchar(50) DEFAULT NULL COMMENT '气压',
  `inorganic` varchar(50) DEFAULT NULL COMMENT '无机污染物',
  `sulfur` varchar(50) DEFAULT NULL COMMENT '硫化污染物',
  `dip` varchar(50) DEFAULT NULL COMMENT '倾角',
  `acceleration` varchar(50) DEFAULT NULL COMMENT '加速度',
  `pm10` varchar(50) DEFAULT NULL COMMENT 'PM1.0',
  `canbi` varchar(50) DEFAULT NULL COMMENT '参比',
  `wind_speed` varchar(50) DEFAULT NULL COMMENT '风速',
  `wind_direction` varchar(50) DEFAULT NULL COMMENT '风向',
  `uv` varchar(50) DEFAULT NULL COMMENT '紫外',
  `organic` varchar(50) DEFAULT NULL,
  `voltage` varchar(50) DEFAULT NULL COMMENT '电压',
  `raw_data` text COMMENT '原始数据',
  `ip_port` varchar(50) DEFAULT NULL COMMENT 'ip端口',
  `php_time` int(11) DEFAULT NULL,
  `rssi` varchar(50) DEFAULT NULL COMMENT '信号强度',
  PRIMARY KEY (`id`),
  KEY `equip_time` (`equip_time`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Records of weather_data
-- ----------------------------

-- ----------------------------
-- Table structure for _data_api
-- ----------------------------
DROP TABLE IF EXISTS `_data_api`;
CREATE TABLE `_data_api` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `method` varchar(10) DEFAULT NULL,
  `uri` text,
  `headers` text,
  `json` text,
  `body` text,
  `start_time` bigint(15) DEFAULT NULL,
  `end_time` bigint(15) DEFAULT NULL,
  `exe_time` int(10) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `start_time` (`start_time`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Records of _data_api
-- ----------------------------

-- ----------------------------
-- Table structure for _data_crc_error
-- ----------------------------
DROP TABLE IF EXISTS `_data_crc_error`;
CREATE TABLE `_data_crc_error` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sensor_no` varchar(50) DEFAULT NULL,
  `raw_data` text,
  `ip_port` varchar(50) DEFAULT NULL,
  `server_time` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Records of _data_crc_error
-- ----------------------------

-- ----------------------------
-- Table structure for _data_feedback
-- ----------------------------
DROP TABLE IF EXISTS `_data_feedback`;
CREATE TABLE `_data_feedback` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `instruct` varchar(10) DEFAULT NULL,
  `sensor_no` varchar(50) DEFAULT NULL,
  `ip_port` varchar(50) DEFAULT NULL,
  `status` tinyint(1) DEFAULT NULL,
  `feedback_time` int(11) DEFAULT NULL,
  `raw_data` text,
  `feedback_data` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Records of _data_feedback
-- ----------------------------

-- ----------------------------
-- Table structure for _data_gateway_disconnect
-- ----------------------------
DROP TABLE IF EXISTS `_data_gateway_disconnect`;
CREATE TABLE `_data_gateway_disconnect` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ip_port` varchar(50) DEFAULT NULL,
  `connect_time` varchar(50) DEFAULT NULL,
  `disconnect_time` varchar(50) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `gateway_no` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Records of _data_gateway_disconnect
-- ----------------------------

-- ----------------------------
-- Table structure for _data_route
-- ----------------------------
DROP TABLE IF EXISTS `_data_route`;
CREATE TABLE `_data_route` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id',
  `gateway_no` varchar(50) DEFAULT NULL COMMENT '网关编号',
  `relay1_no` varchar(50) DEFAULT NULL COMMENT '1级中继',
  `relay2_no` varchar(50) DEFAULT NULL COMMENT '2级中继',
  `relay3_no` varchar(50) DEFAULT NULL COMMENT '3级中继',
  `sensor_no` varchar(50) DEFAULT NULL COMMENT '终端编号',
  `raw_data` text COMMENT '原始数据',
  `server_time` int(11) DEFAULT NULL COMMENT '服务器时间',
  `ip_port` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Records of _data_route
-- ----------------------------

-- ----------------------------
-- Table structure for _data_sensor
-- ----------------------------
DROP TABLE IF EXISTS `_data_sensor`;
CREATE TABLE `_data_sensor` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id',
  `equip_no` varchar(50) NOT NULL COMMENT '设备编号',
  `env_no` varchar(50) DEFAULT NULL COMMENT '环境编号',
  `humidity` varchar(50) DEFAULT NULL COMMENT '湿度',
  `temperature` varchar(50) DEFAULT NULL COMMENT '温度',
  `voc` varchar(50) DEFAULT NULL COMMENT 'voc',
  `co2` varchar(50) DEFAULT NULL COMMENT 'co2',
  `uv` varchar(50) DEFAULT NULL COMMENT '紫外',
  `light` varchar(50) DEFAULT NULL COMMENT '光照',
  `organic` varchar(50) DEFAULT NULL COMMENT '有机污染物',
  `inorganic` varchar(50) DEFAULT NULL COMMENT '无机污染物',
  `sulfur` varchar(50) DEFAULT NULL COMMENT '含硫污染物',
  `dip` varchar(50) DEFAULT NULL COMMENT '倾角',
  `acceleration` varchar(50) DEFAULT NULL COMMENT '加速度',
  `canbi` varchar(50) DEFAULT NULL COMMENT '参比',
  `voltage` varchar(50) DEFAULT NULL COMMENT '电压',
  `rssi` varchar(50) DEFAULT NULL COMMENT '信号强度',
  `move_alert` varchar(50) DEFAULT NULL COMMENT '移动报警',
  `box_open_alert` varchar(50) DEFAULT NULL COMMENT '囊匣打开报警',
  `box_status` varchar(50) DEFAULT NULL COMMENT '囊匣状态值',
  `wind_speed` varchar(50) DEFAULT NULL COMMENT '风速',
  `wind_direction` varchar(50) DEFAULT NULL COMMENT '风向',
  `rain` varchar(50) DEFAULT NULL COMMENT '雨量',
  `air_presure` varchar(50) DEFAULT NULL COMMENT '气压',
  `pm10` varchar(50) DEFAULT NULL COMMENT 'PM1.0',
  `pm25` varchar(50) DEFAULT NULL COMMENT 'PM2.5',
  `equip_time` int(11) NOT NULL COMMENT '设备时间',
  `server_time` int(11) NOT NULL COMMENT '服务器时间',
  `raw_data` text NOT NULL COMMENT '原始数据',
  `ip_port` varchar(50) DEFAULT NULL COMMENT 'ip:端口',
  `php_time` int(11) DEFAULT NULL,
  `alert_param` varchar(100) DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL,
  `soil_humidity` varchar(50) DEFAULT NULL COMMENT '土壤含水率',
  `soil_temperature` varchar(50) DEFAULT NULL COMMENT '土壤温度',
  `soil_conductivity` varchar(50) DEFAULT NULL COMMENT '土壤电导率',
  `soil_salt` varchar(50) DEFAULT NULL COMMENT '土壤含盐量',
  `broken` varchar(50) DEFAULT NULL COMMENT '玻璃破碎检测量',
  `vibration` varchar(50) DEFAULT NULL COMMENT '震动检测量',
  `multi_wave` varchar(50) DEFAULT NULL COMMENT '多维驻波检测量',
  `cascophen` varchar(50) DEFAULT NULL COMMENT '甲醛',
  `lighting` varchar(50) DEFAULT NULL,
  `so2` varchar(50) DEFAULT NULL,
  `lng` varchar(50) DEFAULT NULL,
  `lat` varchar(50) DEFAULT NULL,
  `no` varchar(50) DEFAULT NULL COMMENT '氮氧化物',
  `o3` varchar(50) DEFAULT NULL COMMENT '臭氧',
  `oxygen` varchar(50) DEFAULT NULL COMMENT '氧气浓度',
  PRIMARY KEY (`id`),
  KEY `equip_time-equip_no` (`equip_time`,`equip_no`) USING BTREE,
  KEY `server_time-equip_no` (`server_time`,`equip_no`) USING BTREE,
  KEY `equip_no` (`equip_no`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Records of _data_sensor
-- ----------------------------

-- ----------------------------
-- Table structure for _data_sensor_connect
-- ----------------------------
DROP TABLE IF EXISTS `_data_sensor_connect`;
CREATE TABLE `_data_sensor_connect` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` varchar(10) DEFAULT 'up' COMMENT '上传或下发',
  `sensor_no` varchar(50) NOT NULL,
  `connect_time` bigint(15) NOT NULL,
  `ip_port` varchar(50) DEFAULT NULL,
  `repeat` tinyint(1) DEFAULT '0',
  `lost_frame` tinyint(1) DEFAULT '0',
  `lost` tinyint(1) DEFAULT '0',
  `raw_data` text,
  PRIMARY KEY (`id`),
  KEY `sensor_no-connect_time` (`sensor_no`,`connect_time`) USING BTREE,
  KEY `connect_time-sensor_no` (`connect_time`,`sensor_no`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Records of _data_sensor_connect
-- ----------------------------

-- ----------------------------
-- Table structure for _data_sensor_timeout
-- ----------------------------
DROP TABLE IF EXISTS `_data_sensor_timeout`;
CREATE TABLE `_data_sensor_timeout` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sensor_no` varchar(50) DEFAULT NULL,
  `now_time` int(11) DEFAULT NULL,
  `out_time` int(11) DEFAULT NULL,
  `prev_time` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Records of _data_sensor_timeout
-- ----------------------------

-- ----------------------------
-- Table structure for _yuanzhi
-- ----------------------------
DROP TABLE IF EXISTS `_yuanzhi`;
CREATE TABLE `_yuanzhi` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `old_id` int(11) DEFAULT NULL,
  `siteId` varchar(50) NOT NULL,
  `eventType` varchar(50) NOT NULL,
  `resourceType` varchar(50) NOT NULL,
  `sourceId` varchar(50) NOT NULL,
  `data` text NOT NULL,
  `raw_data` text NOT NULL,
  `send` tinyint(1) NOT NULL DEFAULT '0',
  `server_time` bigint(15) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sourceId` (`sourceId`) USING BTREE,
  KEY `server_time` (`server_time`) USING BTREE,
  KEY `send` (`send`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Records of _yuanzhi
-- ----------------------------

-- ----------------------------
-- Table structure for _yuanzhi_env
-- ----------------------------
DROP TABLE IF EXISTS `_yuanzhi_env`;
CREATE TABLE `_yuanzhi_env` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id',
  `env_no` varchar(50) DEFAULT NULL COMMENT '环境编号',
  `parent_env_no` varchar(50) DEFAULT NULL COMMENT '上级环境编号',
  `name` varchar(50) DEFAULT NULL COMMENT '环境名称',
  `type` varchar(50) DEFAULT NULL COMMENT '环境类型',
  `map` text COMMENT '环境地图',
  `locate` text COMMENT '热区（在上级环境地图下）',
  `sort` int(11) DEFAULT '0',
  `size` varchar(50) DEFAULT NULL COMMENT '尺寸',
  `volume` varchar(50) DEFAULT NULL COMMENT '体积',
  `tag_no` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `env_no` (`env_no`) USING BTREE,
  KEY `type` (`type`) USING BTREE,
  KEY `parent_env_no` (`parent_env_no`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Records of _yuanzhi_env
-- ----------------------------
