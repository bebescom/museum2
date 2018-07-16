/*
Navicat MySQL Data Transfer

Source Server         : localhost_3307
Source Server Version : 50505
Source Host           : localhost:3307
Source Database       : museum_relic

Target Server Type    : MYSQL
Target Server Version : 50505
File Encoding         : 65001

Date: 2018-05-03 16:04:25
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for casket
-- ----------------------------
DROP TABLE IF EXISTS `casket`;
CREATE TABLE `casket` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id',
  `casket_no` varchar(50) DEFAULT NULL COMMENT '囊匣编号',
  `parent_env_no` varchar(50) DEFAULT NULL COMMENT '所属环境编号',
  `name` varchar(50) DEFAULT NULL COMMENT '囊匣名称',
  `type` varchar(50) DEFAULT NULL COMMENT '囊匣类型',
  `style` varchar(50) DEFAULT NULL COMMENT '囊匣样式',
  `spec` varchar(100) DEFAULT NULL COMMENT '规格型号',
  `size` varchar(100) DEFAULT NULL COMMENT '尺寸',
  PRIMARY KEY (`id`),
  UNIQUE KEY `casket_no` (`casket_no`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Records of casket
-- ----------------------------

-- ----------------------------
-- Table structure for config
-- ----------------------------
DROP TABLE IF EXISTS `config`;
CREATE TABLE `config` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id',
  `key` varchar(50) DEFAULT NULL COMMENT '键名',
  `val` text COMMENT '值',
  `group` varchar(50) DEFAULT NULL,
  `input_type` varchar(50) DEFAULT NULL COMMENT '类型',
  `sort` int(11) DEFAULT NULL COMMENT '排序',
  PRIMARY KEY (`id`),
  UNIQUE KEY `key` (`key`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Records of config
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Records of image
-- ----------------------------

-- ----------------------------
-- Table structure for log
-- ----------------------------
DROP TABLE IF EXISTS `log`;
CREATE TABLE `log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `username` varchar(50) DEFAULT NULL,
  `time` int(11) DEFAULT NULL,
  `content` text,
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
-- Table structure for relic
-- ----------------------------
DROP TABLE IF EXISTS `relic`;
CREATE TABLE `relic` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id',
  `relic_id` varchar(50) DEFAULT NULL COMMENT '文物总登记号',
  `relic_no` varchar(50) DEFAULT NULL COMMENT '文物编号',
  `name` varchar(50) DEFAULT NULL COMMENT '文物名称',
  `parent_env_no` varchar(50) DEFAULT NULL COMMENT '所在环境编号',
  `material` varchar(50) DEFAULT NULL COMMENT '材质',
  `category` varchar(50) DEFAULT NULL COMMENT '类别',
  `level` varchar(50) DEFAULT NULL COMMENT '文物等级',
  `age` varchar(50) DEFAULT NULL COMMENT '文物年代',
  `sort` int(11) DEFAULT '0',
  `describe` varchar(50) DEFAULT NULL COMMENT '文物描述',
  `image` varchar(100) DEFAULT NULL COMMENT '文物图片',
  `status` varchar(50) DEFAULT NULL COMMENT '文物状态',
  `locate` text COMMENT '位置坐标',
  PRIMARY KEY (`id`),
  UNIQUE KEY `relic_no` (`relic_no`) USING BTREE,
  KEY `parent_env_no` (`parent_env_no`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Records of relic
-- ----------------------------

-- ----------------------------
-- Table structure for relic_borrow
-- ----------------------------
DROP TABLE IF EXISTS `relic_borrow`;
CREATE TABLE `relic_borrow` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `relic_no` varchar(50) DEFAULT NULL COMMENT '文物编号',
  `borrow_time` int(11) DEFAULT NULL COMMENT '借入时间',
  `return_time` int(11) DEFAULT NULL COMMENT '归还时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Records of relic_borrow
-- ----------------------------

-- ----------------------------
-- Table structure for relic_show
-- ----------------------------
DROP TABLE IF EXISTS `relic_show`;
CREATE TABLE `relic_show` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `relic_no` varchar(50) DEFAULT NULL COMMENT '文物编号',
  `start_time` int(11) DEFAULT NULL COMMENT '开始展出时间',
  `end_time` int(11) DEFAULT NULL COMMENT '结束展出时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Records of relic_show
-- ----------------------------

-- ----------------------------
-- Table structure for threshold
-- ----------------------------
DROP TABLE IF EXISTS `threshold`;
CREATE TABLE `threshold` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id',
  `type` varchar(20) DEFAULT NULL COMMENT '文物类型',
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
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8 COMMENT='文物阈值-按类型';

-- ----------------------------
-- Records of threshold
-- ----------------------------
INSERT INTO `threshold` VALUES ('3', '石质', '16', '24', '30', '70', '', '300', '', '500', '', '300', '', '20', '', '9000000', '', '9000000', '', '9000000', null, null, null, '0');
INSERT INTO `threshold` VALUES ('4', '陶器', '16', '24', '30', '70', '', '300', '', '500', '', '300', '', '20', '', '9000000', '', '9000000', '', '9000000', null, null, null, '0');
INSERT INTO `threshold` VALUES ('5', '瓷器', '16', '24', '30', '70', '', '300', '', '500', '', '300', '', '20', '', '9000000', '', '9000000', '', '9000000', null, null, null, '0');
INSERT INTO `threshold` VALUES ('6', '铁质', '16', '24', '0', '45', '', '300', '', '500', '', '300', '', '20', '', '9000000', '', '9000000', '', '9000000', null, null, null, '0');
INSERT INTO `threshold` VALUES ('7', '青铜', '18.5', '24', '0', '45', '', '300', '', '500', '', '300', '', '20', '', '9000000', '', '9000000', '', '9000000', null, null, null, '0');
INSERT INTO `threshold` VALUES ('8', '纸质', '16', '24', '30', '70', '', '300', '', '500', '', '50', '', '20', '', '9000000', '', '9000000', '', '9000000', null, null, null, '0');
INSERT INTO `threshold` VALUES ('9', '壁画', '16', '24', '30', '70', '', '300', '', '500', '', '50', '', '20', '', '9000000', '', '9000000', '', '9000000', null, null, null, '0');
INSERT INTO `threshold` VALUES ('10', '纺织品', '16', '24', '30', '70', '', '300', '', '500', '', '50', '', '20', '', '9000000', '', '9000000', '', '9000000', null, null, null, '0');
INSERT INTO `threshold` VALUES ('11', '漆木器', '16', '24', '30', '70', '', '300', '', '500', '', '150', '', '20', '', '9000000', '', '9000000', '', '9000000', null, null, null, '0');
INSERT INTO `threshold` VALUES ('12', '其他', '16', '24', '30', '70', '', '300', '', '500', '', '150', '', '20', '', '9000000', '', '9000000', '', '9000000', null, null, null, '0');

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
  `user` text COMMENT '绑定用户json',
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Records of tokens
-- ----------------------------
