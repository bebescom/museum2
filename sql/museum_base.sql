/*
Navicat MySQL Data Transfer

Source Server         : localhost_3307
Source Server Version : 50505
Source Host           : localhost:3307
Source Database       : museum_base

Target Server Type    : MYSQL
Target Server Version : 50505
File Encoding         : 65001

Date: 2018-05-03 16:03:55
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for app_token
-- ----------------------------
DROP TABLE IF EXISTS `app_token`;
CREATE TABLE `app_token` (
  `token_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `token` varchar(255) DEFAULT NULL,
  `login_time` int(11) DEFAULT NULL,
  PRIMARY KEY (`token_id`),
  KEY `token` (`token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='移动端用token值';

-- ----------------------------
-- Records of app_token
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='环境表';

-- ----------------------------
-- Records of box
-- ----------------------------

-- ----------------------------
-- Table structure for config
-- ----------------------------
DROP TABLE IF EXISTS `config`;
CREATE TABLE `config` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id',
  `key` varchar(50) DEFAULT NULL COMMENT '键名',
  `val` text COMMENT '值',
  `text` text COMMENT '描述',
  `group` varchar(50) DEFAULT NULL COMMENT '分组',
  `input_type` varchar(50) DEFAULT NULL COMMENT 'input类型',
  `sort` int(11) DEFAULT NULL COMMENT '排序',
  PRIMARY KEY (`id`),
  UNIQUE KEY `key` (`key`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8 COMMENT='系统设置';

-- ----------------------------
-- Records of config
-- ----------------------------
INSERT INTO `config` VALUES ('1', 'app_name', '预防性保护演示系统', '系统名称', 'system', 'text', '99');
INSERT INTO `config` VALUES ('6', 'region_no', 'R61007200', '区域中心编号', 'system', 'text', null);
INSERT INTO `config` VALUES ('7', 'museum_no', '62500000', '博物馆编号(限定8位)', 'system', 'text', null);
INSERT INTO `config` VALUES ('8', 'museum_name', '博物馆', '博物馆短名称', 'system', 'text', null);
INSERT INTO `config` VALUES ('9', 'monitor_port', 'http://192.168.8.13:8020', '消息通信接口', 'system', 'text', null);
INSERT INTO `config` VALUES ('10', 'auto_insert_equip', '1', '允许设备上传后自动插入设备表', 'system', 'bool', null);
INSERT INTO `config` VALUES ('12', 'monitor_time', '900', '时间轴间隔', 'system', 'int', null);
INSERT INTO `config` VALUES ('13', 'data_order', 'equip_time', '排序时间', 'system', 'text', null);
INSERT INTO `config` VALUES ('29', 'city', '重庆', '所在城市', 'system', 'text', null);
INSERT INTO `config` VALUES ('31', 'weather_key', 'f5f086e7b78d478684c1b2eb49b5315f', '气象信息api_key', 'system', 'text', null);
INSERT INTO `config` VALUES ('35', 'app_port', 'http://61.128.209.70:10006', 'app的服务端端口', 'app', 'text', null);
INSERT INTO `config` VALUES ('37', 'vibration', '0', '震动功能开关', 'extend', 'bool', null);
INSERT INTO `config` VALUES ('38', 'yuanzhi', '0', '元智接入开关', 'extend', 'bool', null);
INSERT INTO `config` VALUES ('39', 'max_acquisition_time_interval', '1800', '最大采集时间间隔', 'system', 'int', null);
INSERT INTO `config` VALUES ('40', 'max_transmission_time_interval', '1800', '最大传输时间间隔', 'system', 'int', null);
INSERT INTO `config` VALUES ('41', 'data_mutation_bounds', '2', '数据突变界限', 'system', 'int', null);
INSERT INTO `config` VALUES ('42', 'data_minimum_time_interval', '60', '数据最小时间间隔', 'system', 'int', null);
INSERT INTO `config` VALUES ('43', 'capsule', '1', '囊匣功能开关', 'extend', 'bool', null);
INSERT INTO `config` VALUES ('44', 'email_msg', '0', '邮件推送功能开关', 'system', 'bool', null);
INSERT INTO `config` VALUES ('45', 'email_user', '0', '邮件推送用户', 'system', 'text', null);
INSERT INTO `config` VALUES ('46', 'web_msg', '0', null, 'system', null, null);
INSERT INTO `config` VALUES ('47', 'phone_msg', '0', null, 'system', null, null);
INSERT INTO `config` VALUES ('48', 'web_user', '', null, 'system', null, null);
INSERT INTO `config` VALUES ('49', 'phone_user', '', null, 'system', null, null);
INSERT INTO `config` VALUES ('50', 'email_time', '01:00-23:00', null, 'system', null, null);
INSERT INTO `config` VALUES ('51', 'phone_time', '01:00-23:00', null, 'system', null, null);

-- ----------------------------
-- Table structure for env
-- ----------------------------
DROP TABLE IF EXISTS `env`;
CREATE TABLE `env` (
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
  UNIQUE KEY `env_no` (`env_no`),
  KEY `type` (`type`),
  KEY `parent_env_no` (`parent_env_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='环境表';

-- ----------------------------
-- Records of env
-- ----------------------------

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='图片表';

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
  `content` text COMMENT '记录内容',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='日志表';

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='api访问日志';

-- ----------------------------
-- Records of logs
-- ----------------------------

-- ----------------------------
-- Table structure for permission
-- ----------------------------
DROP TABLE IF EXISTS `permission`;
CREATE TABLE `permission` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id',
  `name` varchar(100) DEFAULT NULL COMMENT '权限名',
  `val` varchar(100) DEFAULT NULL COMMENT '权限值',
  `group` varchar(50) DEFAULT NULL COMMENT '权限分组',
  `app` varchar(50) DEFAULT NULL COMMENT '所属子系统',
  `sort` int(11) DEFAULT NULL COMMENT '排序',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name,val` (`name`,`val`)
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8 COMMENT='权限表';

-- ----------------------------
-- Records of permission
-- ----------------------------
INSERT INTO `permission` VALUES ('1', '环境监控', '环境监控', '环境监控', 'env', '1');
INSERT INTO `permission` VALUES ('2', '用户管理', '用户管理', '用户管理', 'base', '2');
INSERT INTO `permission` VALUES ('9', '综合管理', '综合管理', '综合管理', 'env', null);
INSERT INTO `permission` VALUES ('10', '设置环境', '设置环境', '综合管理', 'env', null);
INSERT INTO `permission` VALUES ('12', '导出报告', '导出报告', '环境监控', 'env', null);
INSERT INTO `permission` VALUES ('13', '阈值报警', '阈值报警', '环境监控', 'env', null);
INSERT INTO `permission` VALUES ('14', '处理报警', '处理报警', '环境监控', 'env', null);
INSERT INTO `permission` VALUES ('15', '修改阈值', '修改阈值', '环境监控', 'env', null);
INSERT INTO `permission` VALUES ('16', '文物管理', '文物管理', '文物管理', 'relic', null);
INSERT INTO `permission` VALUES ('17', '添加文物', '添加文物', '文物管理', 'relic', null);
INSERT INTO `permission` VALUES ('18', '设定阈值', '设定阈值', '文物管理', 'relic', null);
INSERT INTO `permission` VALUES ('19', '设备管理', '设备管理', '设备管理', 'env', null);
INSERT INTO `permission` VALUES ('20', '批量设置', '批量设置', '设备管理', 'env', null);
INSERT INTO `permission` VALUES ('21', '导出设备数据', '导出设备数据', '设备管理', 'env', null);
INSERT INTO `permission` VALUES ('22', '添加设备', '添加设备', '设备管理', 'env', null);
INSERT INTO `permission` VALUES ('23', '删除设备', '删除设备', '设备管理', 'env', null);
INSERT INTO `permission` VALUES ('24', '添加用户', '添加用户', '用户管理', 'base', null);
INSERT INTO `permission` VALUES ('25', '角色设置', '角色设置', '用户管理', 'base', null);
INSERT INTO `permission` VALUES ('26', '修改用户', '修改用户', '用户管理', 'base', null);
INSERT INTO `permission` VALUES ('27', '删除用户', '删除用户', '用户管理', 'base', null);
INSERT INTO `permission` VALUES ('29', '拓扑图', '拓扑图', '设备管理', 'env', null);
INSERT INTO `permission` VALUES ('30', '导出环境数据', '导出环境数据', '环境监控', 'env', null);
INSERT INTO `permission` VALUES ('31', '修改文物信息', '修改文物信息', '文物管理', 'relic', null);
INSERT INTO `permission` VALUES ('32', '修改设备信息', '修改设备信息', '设备管理', 'env', null);
INSERT INTO `permission` VALUES ('33', '震动监测', '震动监测', '震动监测', 'env', null);
INSERT INTO `permission` VALUES ('34', '智能囊匣', '智能囊匣', '智能囊匣', 'env', null);

-- ----------------------------
-- Table structure for role
-- ----------------------------
DROP TABLE IF EXISTS `role`;
CREATE TABLE `role` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id',
  `parent_id` int(11) DEFAULT NULL COMMENT '上级角色id',
  `name` varchar(50) DEFAULT NULL COMMENT '角色名',
  `permissions` text COMMENT '权限值列表,以","分割',
  `data_scope` text COMMENT '数据范围(环境编号列表)',
  `sort` int(11) DEFAULT NULL COMMENT '排序',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8 COMMENT='角色表';

-- ----------------------------
-- Records of role
-- ----------------------------
INSERT INTO `role` VALUES ('1', '0', '管理员', '环境监控,用户管理,综合管理,设置环境,导出报告,阈值报警,处理报警,修改阈值,文物管理,添加文物,设定阈值,设备管理,批量设置,导出设备数据,添加设备,删除设备,添加用户,角色设置,修改用户,删除用户,拓扑图,导出环境数据,修改文物信息,修改设备信息,震动监测,智能囊匣', '', null);
INSERT INTO `role` VALUES ('2', '0', '领导', '环境监控,用户管理,综合管理,设置环境,导出报告,阈值报警,处理报警,修改阈值,文物管理,添加文物,设定阈值,设备管理,批量设置,导出设备数据,添加设备,删除设备,添加用户,角色设置,修改用户,删除用户,拓扑图,导出环境数据,修改文物信息,修改设备信息,震动监测,智能囊匣', '', null);
INSERT INTO `role` VALUES ('3', '0', '工作人员', '环境监控,综合管理,设置环境,导出报告,阈值报警,处理报警,修改阈值,文物管理,添加文物,设定阈值,设备管理,批量设置,导出设备数据,添加设备,删除设备,添加用户,角色设置,修改用户,删除用户,拓扑图,导出环境数据,修改文物信息,修改设备信息,震动监测,智能囊匣', '', null);

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='token身份认证';

-- ----------------------------
-- Records of tokens
-- ----------------------------

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id',
  `username` varchar(50) DEFAULT NULL COMMENT '用户名',
  `password` varchar(50) DEFAULT NULL COMMENT '密码',
  `role_ids` text COMMENT '角色id列表',
  `status` varchar(20) DEFAULT NULL COMMENT '状态',
  `level` varchar(50) DEFAULT NULL COMMENT '用户级别(领导、研究者、工作人员)',
  `real_name` varchar(50) DEFAULT NULL COMMENT '真实姓名',
  `tel` varchar(50) DEFAULT NULL COMMENT '电话',
  `email` varchar(100) DEFAULT NULL,
  `department` varchar(50) DEFAULT NULL COMMENT '部门',
  `position` varchar(50) DEFAULT NULL COMMENT '职位',
  `sort` int(11) DEFAULT NULL COMMENT '排序',
  `favorite` text COMMENT '偏好设置json',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8 COMMENT='用户表';

-- ----------------------------
-- Records of user
-- ----------------------------
INSERT INTO `user` VALUES ('1', 'admin', 'f6fdffe48c908deb0f4c3bd36c032e72', '1', '正常', '超级管理员', '超级管理员', '', null, null, null, null, '');
INSERT INTO `user` VALUES ('2', 'sgdzl', '000f76f5a829b535f8d0c6cd8a86e583', '1', '正常', '服务端', '后端api', null, null, null, null, null, null);

-- ----------------------------
-- Table structure for user_active
-- ----------------------------
DROP TABLE IF EXISTS `user_active`;
CREATE TABLE `user_active` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uid` int(11) DEFAULT NULL COMMENT '用户id',
  `route` varchar(100) DEFAULT NULL COMMENT '路径',
  `key` varchar(50) DEFAULT NULL COMMENT '关键字',
  `value` text COMMENT '值(json)',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='用户行为表';

-- ----------------------------
-- Records of user_active
-- ----------------------------

-- ----------------------------
-- Table structure for user_feedback
-- ----------------------------
DROP TABLE IF EXISTS `user_feedback`;
CREATE TABLE `user_feedback` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uid` int(11) NOT NULL,
  `content` varchar(1000) NOT NULL,
  `time` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of user_feedback
-- ----------------------------

-- ----------------------------
-- Table structure for user_follow
-- ----------------------------
DROP TABLE IF EXISTS `user_follow`;
CREATE TABLE `user_follow` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id',
  `user_id` int(11) DEFAULT NULL COMMENT '用户id',
  `name` varchar(50) DEFAULT NULL COMMENT '对象名称',
  `no` varchar(50) DEFAULT NULL COMMENT '对象编号',
  `type` varchar(50) DEFAULT NULL COMMENT '对象类型',
  `sort` int(11) DEFAULT '0' COMMENT '排序',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='用户关注表';

-- ----------------------------
-- Records of user_follow
-- ----------------------------

-- ----------------------------
-- Table structure for user_ip
-- ----------------------------
DROP TABLE IF EXISTS `user_ip`;
CREATE TABLE `user_ip` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `token` varchar(100) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `login_time` int(11) DEFAULT NULL,
  `city` varchar(50) DEFAULT NULL COMMENT '登陆城市',
  `ip` varchar(50) DEFAULT NULL COMMENT '登录ip',
  `pass` varchar(50) DEFAULT NULL COMMENT '是否通过验证（是/否）',
  `code` varchar(10) DEFAULT NULL COMMENT '短信验证码',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='用户登陆ip表';

-- ----------------------------
-- Records of user_ip
-- ----------------------------

-- ----------------------------
-- Table structure for user_login
-- ----------------------------
DROP TABLE IF EXISTS `user_login`;
CREATE TABLE `user_login` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `login_time` int(11) DEFAULT NULL,
  `city` varchar(50) DEFAULT NULL COMMENT '登陆城市',
  `ip` varchar(50) DEFAULT NULL COMMENT '登录ip',
  `pass` varchar(50) DEFAULT NULL COMMENT '是否通过验证（是/否）',
  `code` varchar(10) DEFAULT NULL COMMENT '短信验证码',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='用户登录记录';

-- ----------------------------
-- Records of user_login
-- ----------------------------
