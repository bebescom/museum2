/*
Navicat MySQL Data Transfer

Source Server         : 192.168.8.13_3306
Source Server Version : 50625
Source Host           : 192.168.8.13:3306
Source Database       : sgdzl_env

Target Server Type    : MYSQL
Target Server Version : 50625
File Encoding         : 65001

Date: 2018-05-07 10:55:05
*/

SET FOREIGN_KEY_CHECKS=0;

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
