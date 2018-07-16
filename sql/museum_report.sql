/*
Navicat MySQL Data Transfer

Source Server         : localhost_3307
Source Server Version : 50505
Source Host           : localhost:3307
Source Database       : museum_report

Target Server Type    : MYSQL
Target Server Version : 50505
File Encoding         : 65001

Date: 2018-06-20 10:44:17
*/

SET FOREIGN_KEY_CHECKS=0;

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
-- Table structure for content
-- ----------------------------
DROP TABLE IF EXISTS `content`;
CREATE TABLE `content` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `report_id` int(11) DEFAULT NULL,
  `content_key` varchar(255) DEFAULT NULL,
  `content_value` varchar(255) DEFAULT NULL,
  `create_time` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `report_id` (`report_id`,`content_key`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Table structure for images
-- ----------------------------
DROP TABLE IF EXISTS `images`;
CREATE TABLE `images` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `report_id` int(11) DEFAULT NULL,
  `image_key` varchar(50) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `image_type` varchar(50) DEFAULT NULL COMMENT '图片类型',
  `image_data` longtext,
  PRIMARY KEY (`id`),
  UNIQUE KEY `report_id` (`report_id`,`image_key`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

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
-- Table structure for report
-- ----------------------------
DROP TABLE IF EXISTS `report`;
CREATE TABLE `report` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `museum_name` varchar(255) DEFAULT NULL COMMENT '博物馆名称',
  `report_type` varchar(255) DEFAULT NULL COMMENT '报表类型',
  `report_name` varchar(100) DEFAULT NULL COMMENT '报表名称',
  `report_time_range` varchar(255) DEFAULT NULL COMMENT '报表时间范围',
  `generate_time` int(11) DEFAULT NULL COMMENT '生成时间',
  `generate_status` varchar(10) DEFAULT NULL COMMENT '生成状态',
  `generate_total_time` int(11) DEFAULT NULL COMMENT '生成报表所执行的时间秒数',
  `report_file` varchar(200) DEFAULT NULL COMMENT '文件地址',
  PRIMARY KEY (`id`),
  UNIQUE KEY `report_name` (`report_name`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Table structure for table_data_desc
-- ----------------------------
DROP TABLE IF EXISTS `table_data_desc`;
CREATE TABLE `table_data_desc` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `report_id` int(11) DEFAULT NULL,
  `sheet_name` varchar(255) DEFAULT NULL COMMENT '表格标题',
  `env_name` varchar(255) DEFAULT NULL COMMENT '环境名称',
  `total_count` varchar(255) DEFAULT NULL,
  `range` varchar(255) DEFAULT NULL COMMENT '极差',
  `min` varchar(255) DEFAULT NULL,
  `max` varchar(255) DEFAULT NULL,
  `avg` varchar(255) DEFAULT NULL COMMENT '标准差',
  `std` varchar(255) DEFAULT NULL,
  `target` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `report_id` (`report_id`,`sheet_name`,`env_name`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Table structure for table_key_name
-- ----------------------------
DROP TABLE IF EXISTS `table_key_name`;
CREATE TABLE `table_key_name` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sheet_key` varchar(50) DEFAULT NULL,
  `sheet_name` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sheet_key` (`sheet_key`) USING BTREE,
  UNIQUE KEY `sheet_name` (`sheet_name`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Table structure for table_rang_std_date
-- ----------------------------
DROP TABLE IF EXISTS `table_rang_std_date`;
CREATE TABLE `table_rang_std_date` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `report_id` int(11) DEFAULT NULL,
  `sheet_name` varchar(255) DEFAULT NULL COMMENT '表格标题',
  `env_name` varchar(255) DEFAULT NULL,
  `range_max_date` varchar(255) DEFAULT NULL COMMENT '日波动最大日期',
  `range_min_date` varchar(255) DEFAULT NULL COMMENT '日波动最小日期',
  `std_min_date` varchar(255) DEFAULT NULL COMMENT '标准差最小值日期',
  `std_max_date` varchar(255) DEFAULT NULL COMMENT '标准差最大值日期',
  PRIMARY KEY (`id`),
  UNIQUE KEY `report_id` (`report_id`,`sheet_name`,`env_name`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Table structure for table_rang_std_day
-- ----------------------------
DROP TABLE IF EXISTS `table_rang_std_day`;
CREATE TABLE `table_rang_std_day` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `report_id` int(11) DEFAULT NULL,
  `sheet_name` varchar(255) DEFAULT NULL,
  `env_name` varchar(255) DEFAULT NULL COMMENT '环境名称',
  `range_min` varchar(255) DEFAULT NULL COMMENT '日波动最小值',
  `range_max` varchar(255) DEFAULT NULL COMMENT '日波动最大值',
  `range_avg` varchar(255) DEFAULT NULL COMMENT '日波动平均值',
  `std_min` varchar(255) DEFAULT NULL COMMENT '标准差最小值',
  `std_max` varchar(255) DEFAULT NULL COMMENT '标准差最大值',
  `std_avg` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `report_id` (`report_id`,`sheet_name`,`env_name`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

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
