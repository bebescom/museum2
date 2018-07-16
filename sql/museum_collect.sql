/*
Navicat MySQL Data Transfer

Source Server         : localhost_3306
Source Server Version : 50617
Source Host           : localhost:3306
Source Database       : museum_collect

Target Server Type    : MYSQL
Target Server Version : 50617
File Encoding         : 65001

Date: 2017-08-29 14:32:35
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for `box`
-- ----------------------------
DROP TABLE IF EXISTS `box`;
CREATE TABLE `box` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tag_no` varchar(100) DEFAULT NULL,
  `serial_no` varchar(100) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `type` varchar(100) DEFAULT NULL,
  `desc` varchar(200) DEFAULT NULL,
  `material` varchar(100) DEFAULT NULL,
  `producer` varchar(100) DEFAULT NULL,
  `produce_time` bigint(11) DEFAULT NULL,
  `purchase_time` bigint(11) DEFAULT NULL,
  `timestamp` bigint(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `serial_no` (`serial_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='记录囊匣的基本信息';

-- ----------------------------
-- Records of box
-- ----------------------------

-- ----------------------------
-- Table structure for `box_location`
-- ----------------------------
DROP TABLE IF EXISTS `box_location`;
CREATE TABLE `box_location` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `box_no` varchar(100) DEFAULT NULL,
  `location_no` varchar(100) DEFAULT NULL,
  `timestamp` bigint(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='记录囊匣所在位置';

-- ----------------------------
-- Records of box_location
-- ----------------------------

-- ----------------------------
-- Table structure for `exception`
-- ----------------------------
DROP TABLE IF EXISTS `exception`;
CREATE TABLE `exception` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `relic_no` varchar(100) DEFAULT NULL,
  `box_no` varchar(100) DEFAULT NULL,
  `time` bigint(11) DEFAULT NULL,
  `process_result` varchar(200) DEFAULT NULL,
  `operator_username` varchar(100) DEFAULT NULL,
  `desc` text,
  `timestamp` bigint(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='记录异常情况';

-- ----------------------------
-- Records of exception
-- ----------------------------

-- ----------------------------
-- Table structure for `instock_record`
-- ----------------------------
DROP TABLE IF EXISTS `instock_record`;
CREATE TABLE `instock_record` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `relic_no` varchar(100) DEFAULT NULL,
  `box_no` varchar(100) DEFAULT NULL,
  `type` varchar(100) DEFAULT NULL,
  `time` bigint(11) DEFAULT NULL,
  `operator_username` varchar(100) DEFAULT NULL,
  `timestamp` bigint(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='记录文物每次入库情况';

-- ----------------------------
-- Records of instock_record
-- ----------------------------

-- ----------------------------
-- Table structure for `inventory_detail`
-- ----------------------------
DROP TABLE IF EXISTS `inventory_detail`;
CREATE TABLE `inventory_detail` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `task_id` int(11) DEFAULT NULL,
  `relic_no` varchar(100) DEFAULT NULL,
  `box_no` varchar(100) DEFAULT NULL,
  `time` bigint(11) DEFAULT NULL,
  `operator_username` varchar(100) DEFAULT NULL,
  `result` varchar(100) DEFAULT NULL,
  `timestamp` bigint(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='记录每次盘点的明细和结果';

-- ----------------------------
-- Records of inventory_detail
-- ----------------------------

-- ----------------------------
-- Table structure for `inventory_task`
-- ----------------------------
DROP TABLE IF EXISTS `inventory_task`;
CREATE TABLE `inventory_task` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `task_id` varchar(100) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `type` varchar(100) DEFAULT NULL,
  `total_num` int(11) DEFAULT NULL,
  `initiator_username` varchar(100) DEFAULT NULL,
  `operator_username` varchar(100) DEFAULT NULL,
  `start_time` bigint(11) DEFAULT NULL,
  `end_time` bigint(11) DEFAULT NULL,
  `desc` text,
  `result` text,
  `status` varchar(100) DEFAULT NULL,
  `timestamp` bigint(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='库房盘点任务';

-- ----------------------------
-- Records of inventory_task
-- ----------------------------

-- ----------------------------
-- Table structure for `operation_record`
-- ----------------------------
DROP TABLE IF EXISTS `operation_record`;
CREATE TABLE `operation_record` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `op_id` int(11) DEFAULT NULL,
  `task_id` int(11) DEFAULT NULL,
  `type` varchar(100) DEFAULT NULL,
  `time` bigint(11) DEFAULT NULL,
  `operator_username` varchar(100) DEFAULT NULL,
  `exception_picture_url` varchar(1000) DEFAULT NULL,
  `exception_desc` varchar(200) DEFAULT NULL,
  `exception_process` varchar(200) DEFAULT NULL,
  `timestamp` bigint(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='记录出入库、盘点流程中的操作';

-- ----------------------------
-- Records of operation_record
-- ----------------------------

-- ----------------------------
-- Table structure for `outstock_order`
-- ----------------------------
DROP TABLE IF EXISTS `outstock_order`;
CREATE TABLE `outstock_order` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `serial_no` varchar(100) DEFAULT NULL,
  `relic_no` varchar(100) DEFAULT NULL,
  `box_no` varchar(100) DEFAULT NULL,
  `time` int(11) DEFAULT NULL,
  `operator_username` varchar(100) DEFAULT NULL,
  `borrower` varchar(100) DEFAULT NULL,
  `timestamp` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='记录出库凭证上的出库信息';

-- ----------------------------
-- Records of outstock_order
-- ----------------------------

-- ----------------------------
-- Table structure for `outstock_record`
-- ----------------------------
DROP TABLE IF EXISTS `outstock_record`;
CREATE TABLE `outstock_record` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `relic_no` varchar(100) DEFAULT NULL,
  `box_no` varchar(100) DEFAULT NULL,
  `type` varchar(100) DEFAULT NULL,
  `time` bigint(11) DEFAULT NULL,
  `operator_username` varchar(100) DEFAULT NULL,
  `timestamp` bigint(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='记录每次的出库情况';

-- ----------------------------
-- Records of outstock_record
-- ----------------------------

-- ----------------------------
-- Table structure for `relic_box`
-- ----------------------------
DROP TABLE IF EXISTS `relic_box`;
CREATE TABLE `relic_box` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `relic_no` varchar(100) DEFAULT NULL,
  `box_no` varchar(100) DEFAULT NULL,
  `tag_no` varchar(100) DEFAULT NULL,
  `timestamp` bigint(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `relic_no` (`relic_no`,`box_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='记录文物存放在哪个囊匣中';

-- ----------------------------
-- Records of relic_box
-- ----------------------------

-- ----------------------------
-- Table structure for `relic_stat`
-- ----------------------------
DROP TABLE IF EXISTS `relic_stat`;
CREATE TABLE `relic_stat` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `relic_no` varchar(100) DEFAULT NULL,
  `box_no` varchar(100) DEFAULT NULL,
  `stat` varchar(100) DEFAULT NULL,
  `desc` text,
  `timestamp` bigint(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='记录文物状态：在库、展出、修复、借出等';

-- ----------------------------
-- Records of relic_stat
-- ----------------------------

-- ----------------------------
-- View structure for `inventory_detail_ext`
-- ----------------------------
DROP VIEW IF EXISTS `inventory_detail_ext`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`%` SQL SECURITY DEFINER VIEW `inventory_detail_ext` AS select `museum_collect`.`inventory_detail`.`id` AS `id`,`museum_collect`.`inventory_detail`.`operator_username` AS `operator_username`,`museum_collect`.`inventory_detail`.`relic_no` AS `relic_no`,`museum_collect`.`inventory_detail`.`result` AS `result`,`museum_collect`.`inventory_detail`.`task_id` AS `task_id`,`museum_collect`.`inventory_detail`.`time` AS `time`,`museum_collect`.`inventory_detail`.`timestamp` AS `timestamp`,`museum_collect`.`relic_box`.`tag_no` AS `tag_no`,`museum_relic`.`relic`.`name` AS `relic_name`,`museum_relic`.`relic`.`level` AS `relic_level`,`museum_relic`.`relic`.`material` AS `relic_material`,`museum_collect`.`inventory_detail`.`box_no` AS `box_no`,`museum_relic`.`relic`.`category` AS `relic_category`,`museum_relic`.`relic`.`age` AS `relic_age`,`museum_relic`.`relic`.`parent_env_no` AS `relic_env_no`,`museum_relic`.`relic`.`sort` AS `relic_sort`,`museum_relic`.`relic`.`image` AS `relic_image`,`museum_relic`.`relic`.`locate` AS `relic_locate` from ((`museum_collect`.`inventory_detail` left join `museum_collect`.`relic_box` on((`museum_collect`.`inventory_detail`.`relic_no` = `museum_collect`.`relic_box`.`relic_no`))) left join `museum_relic`.`relic` on((`museum_relic`.`relic`.`relic_no` = `museum_collect`.`inventory_detail`.`relic_no`))) ;
