#!/usr/bin/env node

var Canvas = require("canvas");
var echarts = require("echarts");
var fs = require("fs");
var path = require("path");
var _ = require('underscore');


process.exit();
return;

new Canvas.Font('arial', path.join(__dirname, "/echarts/arial.ttf"));
new Canvas.Font('msyhl', path.join(__dirname, "/echarts/msyhl.ttc"));


var data = {};
data.map = "3274439c80fbf7d202ef20b5a83a6aea.png";
data.width = 1630;
data.height = 1074;

data.equips = [
    {
        "id": "2260",
        "equip_no": "4340001000400000122",
        "name": "00400000122",
        "equip_type": "\u7f51\u5173",
        "status": "\u6b63\u5e38",
        "usage": "\u5728\u7528",
        "env_no": "43400010100302",
        "parameter": "",
        "parameter_val": "{\"voltage\":\"4.7\",\"rssi\":\"0\"}",
        "last_equip_time": "1527412604",
        "sleep": "900",
        "locate": "{\"area\":[\"301,466\"],\"width\":1256,\"height\":832}",
        "monitor_type": "\u7f51\u7edc\u8bbe\u5907",
        "ip_port": "::ffff:192.168.100.112:8000",
        "target": null,
        "image": null,
        "model": null,
        "manufacturer": null,
        "applicability": null,
        "remark": null,
        "effect": null
    }, {
        "id": "2308",
        "equip_no": "4340001000300000247",
        "name": "00300000247",
        "equip_type": "\u4e2d\u7ee7",
        "status": "\u6b63\u5e38",
        "usage": "\u5728\u7528",
        "env_no": "43400010100302",
        "parameter": "",
        "parameter_val": "{\"voltage\":\"4.6\",\"rssi\":\"-50\"}",
        "last_equip_time": "1527434017",
        "sleep": "900",
        "locate": "{\"area\":[\"980,349\"],\"width\":1256,\"height\":832}",
        "monitor_type": "\u7f51\u7edc\u8bbe\u5907",
        "ip_port": "::ffff:192.168.100.112:8000",
        "target": null,
        "image": null,
        "model": null,
        "manufacturer": null,
        "applicability": null,
        "remark": null,
        "effect": null
    }, {
        "id": "2366",
        "equip_no": "4340001000300000169",
        "name": "00300000169",
        "equip_type": "\u4e2d\u7ee7",
        "status": "\u6b63\u5e38",
        "usage": "\u5728\u7528",
        "env_no": "43400010100302",
        "parameter": "",
        "parameter_val": "{\"voltage\":\"4.7\",\"rssi\":\"-40\"}",
        "last_equip_time": "1527468755",
        "sleep": "900",
        "locate": "{\"area\":[\"528,92\"],\"width\":1256,\"height\":832}",
        "monitor_type": "\u7f51\u7edc\u8bbe\u5907",
        "ip_port": "::ffff:192.168.100.112:8000",
        "target": null,
        "image": null,
        "model": null,
        "manufacturer": null,
        "applicability": null,
        "remark": null,
        "effect": null
    }, {
        "id": "2371",
        "equip_no": "4340001000300000120",
        "name": "00300000120",
        "equip_type": "\u4e2d\u7ee7",
        "status": "\u6b63\u5e38",
        "usage": "\u5728\u7528",
        "env_no": "43400010100302",
        "parameter": "",
        "parameter_val": "{\"voltage\":\"4.7\",\"rssi\":\"-51\"}",
        "last_equip_time": "1527458631",
        "sleep": "900",
        "locate": "{\"area\":[\"678,524\"],\"width\":1256,\"height\":832}",
        "monitor_type": "\u7f51\u7edc\u8bbe\u5907",
        "ip_port": "::ffff:192.168.100.112:8000",
        "target": null,
        "image": null,
        "model": null,
        "manufacturer": null,
        "applicability": null,
        "remark": null,
        "effect": null
    }, {
        "id": "2543",
        "equip_no": "4340001001000000113",
        "name": "01000000113",
        "equip_type": "\u4e8c\u6c27\u5316\u78b3\u76d1\u6d4b\u7ec8\u7aef",
        "status": "\u6b63\u5e38",
        "usage": "\u5728\u7528",
        "env_no": "43400010100302",
        "parameter": "humidity,temperature,co2",
        "parameter_val": "{\"voltage\":\"3.6\",\"humidity\":\"66.60\",\"temperature\":\"24.45\",\"co2\":\"1394\",\"rssi\":\"-41\"}",
        "last_equip_time": "1527477328",
        "sleep": "900",
        "locate": "{\"area\":[\"804,807\"],\"width\":1256,\"height\":832}",
        "monitor_type": "\u4ec5\u76d1\u6d4b",
        "ip_port": "::ffff:192.168.100.112:8000",
        "target": null,
        "image": null,
        "model": null,
        "manufacturer": null,
        "applicability": null,
        "remark": null,
        "effect": null
    }, {
        "id": "2465",
        "equip_no": "4340001001200000173",
        "name": "01200000173",
        "equip_type": "\u6709\u673a\u6325\u53d1\u7269\u76d1\u6d4b\u7ec8\u7aef",
        "status": "\u6b63\u5e38",
        "usage": "\u5728\u7528",
        "env_no": "4340001010030201",
        "parameter": "humidity,temperature,voc",
        "parameter_val": "{\"voltage\":\"3.6\",\"humidity\":\"59.43\",\"temperature\":\"25.19\",\"voc\":\"77\",\"rssi\":\"-61\"}",
        "last_equip_time": "1527477305",
        "sleep": "900",
        "locate": "{\"area\":[\"564,43\"],\"width\":1610.03,\"height\":1064.83}",
        "monitor_type": "\u4ec5\u76d1\u6d4b",
        "ip_port": "::ffff:192.168.100.112:8000",
        "target": null,
        "image": null,
        "model": null,
        "manufacturer": null,
        "applicability": null,
        "remark": null,
        "effect": null
    }, {
        "id": "2547",
        "equip_no": "4340001000100001006",
        "name": "00100001006",
        "equip_type": "\u6e29\u6e7f\u5ea6\u76d1\u6d4b\u7ec8\u7aef",
        "status": "\u6b63\u5e38",
        "usage": "\u5728\u7528",
        "env_no": "4340001010030201",
        "parameter": "humidity,temperature",
        "parameter_val": "{\"voltage\":\"3.6\",\"humidity\":\"60.90\",\"temperature\":\"24.77\",\"rssi\":\"-45\"}",
        "last_equip_time": "1527477280",
        "sleep": "900",
        "locate": "{\"area\":[\"757,43\"],\"width\":1610.03,\"height\":1064.83}",
        "monitor_type": "\u4ec5\u76d1\u6d4b",
        "ip_port": "::ffff:192.168.100.112:8000",
        "target": null,
        "image": null,
        "model": null,
        "manufacturer": null,
        "applicability": null,
        "remark": null,
        "effect": null
    }, {
        "id": "2548",
        "equip_no": "4340001000100001212",
        "name": "00100001212",
        "equip_type": "\u6e29\u6e7f\u5ea6\u76d1\u6d4b\u7ec8\u7aef",
        "status": "\u6b63\u5e38",
        "usage": "\u5728\u7528",
        "env_no": "4340001010030201",
        "parameter": "humidity,temperature",
        "parameter_val": "{\"voltage\":\"3.5\",\"humidity\":\"61.25\",\"temperature\":\"24.82\",\"rssi\":\"-55\"}",
        "last_equip_time": "1527477275",
        "sleep": "900",
        "locate": "{\"area\":[\"660,43\"],\"width\":1610.03,\"height\":1064.83}",
        "monitor_type": "\u4ec5\u76d1\u6d4b",
        "ip_port": "::ffff:192.168.100.112:8000",
        "target": null,
        "image": null,
        "model": null,
        "manufacturer": null,
        "applicability": null,
        "remark": null,
        "effect": null
    }, {
        "id": "2642",
        "equip_no": "4340001000200000595",
        "name": "00200000595",
        "equip_type": "\u8c03\u6e7f\u673a",
        "status": "\u5907\u7528",
        "usage": "\u5907\u7528",
        "env_no": "4340001010030201",
        "parameter": "humidity",
        "parameter_val": "{\"voltage\":\"3.3\",\"humidity\":\"55.40\",\"rssi\":\"-49\"}",
        "last_equip_time": "1527477554",
        "sleep": "600",
        "locate": "{\"area\":[\"692,53\"],\"width\":1610.03,\"height\":1064.83}",
        "monitor_type": "\u4e3b\u52a8\u8c03\u63a7",
        "ip_port": "::ffff:192.168.100.112:8000",
        "target": "55",
        "image": null,
        "model": null,
        "manufacturer": null,
        "applicability": null,
        "remark": "",
        "effect": null
    }, {
        "id": "2549",
        "equip_no": "4340001000100001200",
        "name": "00100001200",
        "equip_type": "\u6e29\u6e7f\u5ea6\u76d1\u6d4b\u7ec8\u7aef",
        "status": "\u6b63\u5e38",
        "usage": "\u5728\u7528",
        "env_no": "4340001010030202",
        "parameter": "humidity,temperature",
        "parameter_val": "{\"voltage\":\"3.6\",\"humidity\":\"50.04\",\"temperature\":\"25.18\",\"rssi\":\"-69\"}",
        "last_equip_time": "1527477133",
        "sleep": "900",
        "locate": "{\"area\":[\"837,181\"],\"width\":1610.03,\"height\":1064.83}",
        "monitor_type": "\u4ec5\u76d1\u6d4b",
        "ip_port": "::ffff:192.168.100.112:8000",
        "target": null,
        "image": null,
        "model": null,
        "manufacturer": null,
        "applicability": null,
        "remark": null,
        "effect": null
    }, {
        "id": "2651",
        "equip_no": "4340001000200000507",
        "name": "00200000507",
        "equip_type": "\u8c03\u6e7f\u673a",
        "status": "\u5907\u7528",
        "usage": "\u5907\u7528",
        "env_no": "4340001010030202",
        "parameter": "humidity",
        "parameter_val": "{\"voltage\":\"3.3\",\"humidity\":\"59.10\",\"rssi\":\"-66\"}",
        "last_equip_time": "1527477175",
        "sleep": "600",
        "locate": "{\"area\":[\"837,128\"],\"width\":1610.03,\"height\":1064.83}",
        "monitor_type": "\u4e3b\u52a8\u8c03\u63a7",
        "ip_port": "::ffff:192.168.100.112:8000",
        "target": "55",
        "image": null,
        "model": null,
        "manufacturer": null,
        "applicability": null,
        "remark": "",
        "effect": null
    }, {
        "id": "2464",
        "equip_no": "4340001001200000179",
        "name": "01200000179",
        "equip_type": "\u6709\u673a\u6325\u53d1\u7269\u76d1\u6d4b\u7ec8\u7aef",
        "status": "\u6b63\u5e38",
        "usage": "\u5728\u7528",
        "env_no": "4340001010030203",
        "parameter": "humidity,temperature,voc",
        "parameter_val": "{\"voltage\":\"3.6\",\"humidity\":\"57.04\",\"temperature\":\"25.42\",\"voc\":\"305\",\"rssi\":\"-58\"}",
        "last_equip_time": "1527477198",
        "sleep": "900",
        "locate": "{\"area\":[\"531,341\"],\"width\":1610.03,\"height\":1064.83}",
        "monitor_type": "\u4ec5\u76d1\u6d4b",
        "ip_port": "::ffff:192.168.100.112:8000",
        "target": null,
        "image": null,
        "model": null,
        "manufacturer": null,
        "applicability": null,
        "remark": null,
        "effect": null
    }, {
        "id": "2546",
        "equip_no": "4340001000100000977",
        "name": "00100000977",
        "equip_type": "\u6e29\u6e7f\u5ea6\u76d1\u6d4b\u7ec8\u7aef",
        "status": "\u6b63\u5e38",
        "usage": "\u5728\u7528",
        "env_no": "4340001010030203",
        "parameter": "humidity,temperature",
        "parameter_val": "{\"voltage\":\"3.6\",\"humidity\":\"58.18\",\"temperature\":\"24.93\",\"rssi\":\"-70\"}",
        "last_equip_time": "1527477214",
        "sleep": "900",
        "locate": "{\"area\":[\"612,341\"],\"width\":1610.03,\"height\":1064.83}",
        "monitor_type": "\u4ec5\u76d1\u6d4b",
        "ip_port": "::ffff:192.168.100.112:8000",
        "target": null,
        "image": null,
        "model": null,
        "manufacturer": null,
        "applicability": null,
        "remark": null,
        "effect": null
    }, {
        "id": "2711",
        "equip_no": "4340001000200000506",
        "name": "00200000506",
        "equip_type": "\u8c03\u6e7f\u673a",
        "status": "\u5f02\u5e38",
        "usage": "\u5907\u7528",
        "env_no": "4340001010030203",
        "parameter": "humidity",
        "parameter_val": "{\"voltage\":\"3.3\",\"humidity\":\"55.30\",\"rssi\":\"-68\"}",
        "last_equip_time": "1527410897",
        "sleep": "600",
        "locate": "{\"area\":[\"676,341\"],\"width\":1610.03,\"height\":1064.83}",
        "monitor_type": "\u4e3b\u52a8\u8c03\u63a7",
        "ip_port": "::ffff:192.168.100.108:8000",
        "target": "55",
        "image": null,
        "model": null,
        "manufacturer": null,
        "applicability": null,
        "remark": null,
        "effect": null
    }, {
        "id": "2463",
        "equip_no": "4340001000100001144",
        "name": "00100001144",
        "equip_type": "\u6e29\u6e7f\u5ea6\u76d1\u6d4b\u7ec8\u7aef",
        "status": "\u6b63\u5e38",
        "usage": "\u5728\u7528",
        "env_no": "4340001010030204",
        "parameter": "humidity,temperature",
        "parameter_val": "{\"voltage\":\"3.6\",\"humidity\":\"67.04\",\"temperature\":\"24.72\",\"rssi\":\"-60\"}",
        "last_equip_time": "1527477649",
        "sleep": "900",
        "locate": "{\"area\":[\"950,362\"],\"width\":1610.03,\"height\":1064.83}",
        "monitor_type": "\u4ec5\u76d1\u6d4b",
        "ip_port": "::ffff:192.168.100.112:8000",
        "target": null,
        "image": null,
        "model": null,
        "manufacturer": null,
        "applicability": null,
        "remark": null,
        "effect": null
    }, {
        "id": "2462",
        "equip_no": "4340001000100001273",
        "name": "00100001273",
        "equip_type": "\u6e29\u6e7f\u5ea6\u76d1\u6d4b\u7ec8\u7aef",
        "status": "\u6b63\u5e38",
        "usage": "\u5728\u7528",
        "env_no": "4340001010030205",
        "parameter": "humidity,temperature",
        "parameter_val": "{\"voltage\":\"3.6\",\"humidity\":\"67.70\",\"temperature\":\"24.57\",\"rssi\":\"-42\"}",
        "last_equip_time": "1527477219",
        "sleep": "900",
        "locate": "{\"area\":[\"637,15\"],\"width\":768.031,\"height\":510.047}",
        "monitor_type": "\u4ec5\u76d1\u6d4b",
        "ip_port": "::ffff:192.168.100.112:8000",
        "target": null,
        "image": null,
        "model": null,
        "manufacturer": null,
        "applicability": null,
        "remark": null,
        "effect": null
    }, {
        "id": "2460",
        "equip_no": "4340001000100000988",
        "name": "00100000988",
        "equip_type": "\u6e29\u6e7f\u5ea6\u76d1\u6d4b\u7ec8\u7aef",
        "status": "\u6b63\u5e38",
        "usage": "\u5728\u7528",
        "env_no": "4340001010030206",
        "parameter": "humidity,temperature",
        "parameter_val": "{\"voltage\":\"3.6\",\"humidity\":\"65.34\",\"temperature\":\"24.65\",\"rssi\":\"-39\"}",
        "last_equip_time": "1527477158",
        "sleep": "900",
        "locate": "{\"area\":[\"975,346\"],\"width\":1189.03,\"height\":787.438}",
        "monitor_type": "\u4ec5\u76d1\u6d4b",
        "ip_port": "::ffff:192.168.100.112:8000",
        "target": null,
        "image": null,
        "model": null,
        "manufacturer": null,
        "applicability": null,
        "remark": null,
        "effect": null
    }, {
        "id": "2461",
        "equip_no": "4340001001200000149",
        "name": "01200000149",
        "equip_type": "\u6709\u673a\u6325\u53d1\u7269\u76d1\u6d4b\u7ec8\u7aef",
        "status": "\u6b63\u5e38",
        "usage": "\u5728\u7528",
        "env_no": "4340001010030206",
        "parameter": "humidity,temperature,voc",
        "parameter_val": "{\"voltage\":\"3.5\",\"humidity\":\"64.54\",\"temperature\":\"24.76\",\"voc\":\"400\",\"rssi\":\"-42\"}",
        "last_equip_time": "1527476933",
        "sleep": "900",
        "locate": "{\"area\":[\"975,488\"],\"width\":1189.03,\"height\":787.438}",
        "monitor_type": "\u4ec5\u76d1\u6d4b",
        "ip_port": "::ffff:192.168.100.112:8000",
        "target": null,
        "image": null,
        "model": null,
        "manufacturer": null,
        "applicability": null,
        "remark": null,
        "effect": null
    }, {
        "id": "2458",
        "equip_no": "4340001000100001001",
        "name": "00100001001",
        "equip_type": "\u6e29\u6e7f\u5ea6\u76d1\u6d4b\u7ec8\u7aef",
        "status": "\u6b63\u5e38",
        "usage": "\u5728\u7528",
        "env_no": "4340001010030207",
        "parameter": "humidity,temperature",
        "parameter_val": "{\"voltage\":\"3.6\",\"humidity\":\"61.89\",\"temperature\":\"24.59\",\"rssi\":\"-39\"}",
        "last_equip_time": "1527477616",
        "sleep": "900",
        "locate": "{\"area\":[\"674,379\"],\"width\":936.438,\"height\":621}",
        "monitor_type": "\u4ec5\u76d1\u6d4b",
        "ip_port": "::ffff:192.168.100.112:8000",
        "target": null,
        "image": null,
        "model": null,
        "manufacturer": null,
        "applicability": null,
        "remark": null,
        "effect": null
    }, {
        "id": "2459",
        "equip_no": "4340001000100000971",
        "name": "00100000971",
        "equip_type": "\u6e29\u6e7f\u5ea6\u76d1\u6d4b\u7ec8\u7aef",
        "status": "\u6b63\u5e38",
        "usage": "\u5728\u7528",
        "env_no": "4340001010030208",
        "parameter": "humidity,temperature",
        "parameter_val": "{\"voltage\":\"3.3\",\"humidity\":\"65.42\",\"temperature\":\"25.33\",\"rssi\":\"-52\"}",
        "last_equip_time": "1527477620",
        "sleep": "900",
        "locate": "{\"area\":[\"627,497\"],\"width\":936.438,\"height\":621}",
        "monitor_type": "\u4ec5\u76d1\u6d4b",
        "ip_port": "::ffff:192.168.100.112:8000",
        "target": null,
        "image": null,
        "model": null,
        "manufacturer": null,
        "applicability": null,
        "remark": null,
        "effect": null
    }, {
        "id": "2542",
        "equip_no": "4340001001300000039",
        "name": "01300000039",
        "equip_type": "\u7a7a\u6c14\u8d28\u91cf\u76d1\u6d4b\u7ec8\u7aef",
        "status": "\u6b63\u5e38",
        "usage": "\u5728\u7528",
        "env_no": "4340001010030209",
        "parameter": "humidity,temperature,organic,inorganic,sulfur",
        "parameter_val": "{\"voltage\":\"3.5\",\"humidity\":\"67.90\",\"temperature\":\"24.63\",\"organic\":\"8994105\",\"inorganic\":\"8995687\",\"sulfur\":\"8994328\",\"canbi\":\"8997509\",\"rssi\":\"-53\"}",
        "last_equip_time": "1527476827",
        "sleep": "900",
        "locate": "{\"area\":[\"496,571\"],\"width\":936.438,\"height\":621}",
        "monitor_type": "\u4ec5\u76d1\u6d4b",
        "ip_port": "::ffff:192.168.100.112:8000",
        "target": null,
        "image": null,
        "model": null,
        "manufacturer": null,
        "applicability": null,
        "remark": null,
        "effect": null
    }];


data.envs = [
    {
        "id": "273",
        "env_no": "4340001010030201",
        "parent_env_no": "43400010100302",
        "name": "展柜1",
        "type": "展柜",
        "map": null,
        "locate": "{\"area\":[\"476,7\",\"800,8\",\"800,58\",\"478,58\"],\"width\":1525.83,\"height\":1009.36}",
    }, {
        "id": "274",
        "env_no": "4340001010030202",
        "parent_env_no": "43400010100302",
        "name": "展柜2",
        "type": "展柜",
        "map": null,
        "locate": "{\"area\":[\"526,40\",\"536,40\",\"536,217\",\"526,217\"],\"width\":1020.64,\"height\":676.484}",
    }, {
        "id": "275",
        "env_no": "4340001010030203",
        "parent_env_no": "43400010100302",
        "name": "展柜3",
        "type": "展柜",
        "map": null,
        "locate": "{\"area\":[\"214,138\",\"305,138\",\"306,155\",\"213,154\"],\"width\":683.828,\"height\":454.563}",
    }, {
        "id": "276",
        "env_no": "4340001010030204",
        "parent_env_no": "43400010100302",
        "name": "展柜4",
        "type": "展柜",
        "map": null,
        "locate": "{\"area\":[\"364,146\",\"458,146\",\"457,159\",\"362,158\"],\"width\":683.828,\"height\":454.563}",
    }, {
        "id": "277",
        "env_no": "4340001010030205",
        "parent_env_no": "43400010100302",
        "name": "展柜5",
        "type": "展柜",
        "map": null,
        "locate": "{\"area\":[\"505,4\",\"654,4\",\"654,17\",\"506,17\"],\"width\":683.828,\"height\":454.563}",
    }, {
        "id": "278",
        "env_no": "4340001010030206",
        "parent_env_no": "43400010100302",
        "name": "展柜6",
        "type": "展柜",
        "map": null,
        "locate": "{\"area\":[\"557,170\",\"570,169\",\"570,375\",\"556,373\"],\"width\":683.828,\"height\":454.563}",
    }, {
        "id": "279",
        "env_no": "4340001010030207",
        "parent_env_no": "43400010100302",
        "name": "展柜7",
        "type": "展柜",
        "map": null,
        "locate": "{\"area\":[\"428,231\",\"500,230\",\"499,304\",\"488,303\",\"487,244\",\"426,244\"],\"width\":683.828,\"height\":454.563}",
    }, {
        "id": "280",
        "env_no": "4340001010030208",
        "parent_env_no": "43400010100302",
        "name": "展柜8",
        "type": "展柜",
        "map": null,
        "locate": "{\"area\":[\"426,353\",\"498,353\",\"498,367\",\"427,366\"],\"width\":683.828,\"height\":454.563}",
    }, {
        "id": "281",
        "env_no": "4340001010030209",
        "parent_env_no": "43400010100302",
        "name": "展柜9",
        "type": "展柜",
        "map": null,
        "locate": "{\"area\":[\"361,384\",\"372,385\",\"372,441\",\"359,440\"],\"width\":683.828,\"height\":454.563}",
    }];

var CONTAINER_WIDTH = 800;
//换算容器和画布未拉伸高度
var CONTAINER_HEIGHT = data.height * CONTAINER_WIDTH / data.width;

var EQUIP_WIDTH = 35;
var EQUIP_HEIGHT = 55;

var canvas = new Canvas(CONTAINER_WIDTH, CONTAINER_HEIGHT + EQUIP_HEIGHT);
ctx = canvas.getContext('2d');
ctx.fillStyle = '#E1E1E1';
ctx.fillRect(0, 0, canvas.width, canvas.height);

var img = new Canvas.Image();
img.src = fs.readFileSync(__dirname + '/' + data.map);
//先绘制出背景,在此基础上在图上绘制热区
ctx.drawImage(img, 0, EQUIP_HEIGHT, CONTAINER_WIDTH, CONTAINER_HEIGHT);


var equipImg = new Canvas.Image();
//设备图标应该按照设备类型字段进行匹配
equipImg.src = fs.readFileSync(__dirname + '/echarts/newTypeIcon.png');


_.each(data.envs, function (env) {
    if (!env.locate) {
        return;
    }
    var locate = JSON.parse(env.locate);
    var scaleX = (CONTAINER_WIDTH / locate.width).toFixed(2) * 1;
    var scaleY = (CONTAINER_HEIGHT / locate.height).toFixed(2) * 1;
    var x, y, startX = 0, startY = 0, len = locate.area.length;
    ctx.lineJoin = 'round';
    _.each(locate.area, function (str, index) {
        var xy = str.split(',');
        x = xy[0] * scaleX;
        y = xy[1] * scaleY + EQUIP_HEIGHT;
        if (index === 0) {
            //记录起点坐标
            startX = x;
            startY = y;
            // 第一个点,起笔
            ctx.beginPath();
            ctx.moveTo(x, y);
        } else if (index < len - 1) {
            ctx.lineTo(x, y);
        } else {
            ctx.lineTo(x, y);
            ctx.closePath();
            ctx.fillStyle = 'rgba(30, 177, 109, 0.5)';
            //ctx.strokeStyle = 'rgba(30, 177, 109, 0.5)';
            ctx.fill();
            //ctx.stroke();
            //在起点位置,增加环境名称
            ctx.font = '16px';
            var textWidth = ctx.measureText(env.name).width;
            ctx.fillStyle = 'rgba(0,0,0,1)';
            ctx.fillText(env.name, startX, startY);
        }
    });


});

var equip_icons = {
    def: [140, 495],
    温湿度监测终端: [0, 55],
    手持式温湿度检测仪: [0, 220],
    带屏温湿度监测终端: [35, 55],
    光照紫外监测终端: [70, 55],
    手持式光照紫外检测仪: [70, 220],
    二氧化碳监测终端: [105, 55],
    手持式二氧化碳检测仪: [105, 220],
    有机挥发物监测终端: [140, 55],
    有机挥发物检测仪: [140, 220],
    手持式有机挥发物检测仪: [140, 220],
    空气质量监测终端: [175, 55],
    震动监测终端: [210, 55],
    气象站: [280, 55],
    土壤温湿度监测终端: [315, 55],
    安防监测终端: [350, 55],
    网关: [0, 275],
    中继: [35, 275],
    调湿机: [70, 275],
    智能囊匣: [175, 275],
    充氮调湿柜: [210, 275],
    智能展柜: [245, 275],
    灯光调控终端: [280, 275],
    调控材料: [315, 275],
    一级文物: [0, 495],
    二级文物: [35, 495],
    三级文物: [70, 495],
    一般文物: [105, 495],
    未定级文物: [140, 495],
    其他文物: [175, 495],
    甲醛监测终端: [636, 387],
    甲醛检测仪: [636, 552],
    手持式甲醛检测仪: [636, 552],
    二氧化硫监测终端: [671, 387],
    分体式多参数监测终端: [706, 387],
    氧化氮物监测终端: [741, 390],
    臭氧监测终端: [776, 387],
    智能存储柜: [811, 387],
};

var equip_locate = {};
var xy_equips = {};
_.each(data.equips, function (equip) {
    if (!equip.locate) {
        return;
    }
    var locate = equip.locate;
    if (_.isString(locate)) {
        locate = JSON.parse(equip.locate);
    }
    var scaleX = (CONTAINER_WIDTH / locate.width);
    var scaleY = (CONTAINER_HEIGHT / locate.height);

    var xy = locate.area[0].split(',');
    var x = (xy[0] * scaleX - EQUIP_WIDTH / 2).toFixed(2) * 1;
    var y = (xy[1] * scaleY).toFixed(2) * 1;

    var name = equip.equip_no.slice(-4);

    if (['网关', '中继'].indexOf(equip.equip_type) > -1) {
        var textWidth = ctx.measureText(name).width;
        ctx.fillStyle = 'rgba(0,0,0,1)';
        loadImg(equip, x, y);
        ctx.fillText(name, x + EQUIP_WIDTH / 2 - textWidth / 2, y);
        return;
    }

    //网格化聚合显示
    var key = Math.round(x / EQUIP_WIDTH) + '_' + Math.round(y / EQUIP_HEIGHT);

    console.log(key, name);
    if (equip_locate[key]) {
        equip_locate[key].count++;
        equip_locate[key].name.push(name);
        return;
    }
    equip_locate[key] = {
        count: 1,
        x: x,
        y: y,
        name: [name]
    };
    loadImg(equip, x, y);

});

_.each(equip_locate, function (row) {
    var text = row.count,
        textWidth = ctx.measureText(text).width;
    //设置绘制角标的延时,确保角标层位于图层顶部
    // 画一个白色底,绿色边框的圆圈
    var x = row.x + EQUIP_WIDTH - textWidth, y = row.y + 10;
    if (text > 1) {
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#1BBC9B';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2, true);
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
        ctx.fillStyle = '#1BBC9B';
        ctx.font = "bold 10px";
        if (text < 10) {
            ctx.fillText(text, x - 3, y + 4);
        } else {
            ctx.fillText(text, x - 6, y + 4);
        }
    }
    text = row.name.join(',');
    textWidth = ctx.measureText(text).width;
    ctx.fillStyle = 'rgba(0,0,0,1)';
    ctx.fillText(text, row.x + EQUIP_WIDTH / 2 - textWidth / 2, row.y);

});


function loadImg(equip, x, y) {

    var icon = equip_icons.def;
    if (equip_icons[equip.equip_type]) {
        icon = equip_icons[equip.equip_type];
    }
    ctx.drawImage(equipImg, icon[0], icon[1], EQUIP_WIDTH, EQUIP_HEIGHT, x, y, EQUIP_WIDTH, EQUIP_HEIGHT);
}

// console.log('<img src="' + canvas.toDataURL() + '" />');

fs.writeFileSync(__dirname + '/out.png', canvas.toBuffer());
console.log('end');

process.exit();
return;


var image_data = {
    "data": [["2017-01-18", 0.85], ["2017-10-19", 1.15], ["2017-10-20", 0.85], ["2017-10-21", 0.7], ["2017-10-22", 0.57], ["2017-10-23", 0.78], ["2017-10-24", 1.42], ["2017-10-25", 0.56], ["2017-10-26", 0.72], ["2017-10-27", 0.58], ["2017-11-13", 0.89], ["2017-11-14", 1.57], ["2017-11-15", 1.36], ["2017-11-16", 0.62], ["2017-11-17", 1.6], ["2017-11-18", 1.27], ["2017-11-19", 1.48], ["2017-11-20", 1.25], ["2017-11-21", 0.97], ["2017-11-22", 0.88], ["2017-11-23", 4.82], ["2017-11-24", 2.73], ["2017-11-25", 2.27], ["2017-11-26", 2.4], ["2017-11-27", 1.3], ["2017-11-28", 0.98], ["2017-11-29", 1.55], ["2017-11-30", 1.12], ["2017-12-01", 1.14], ["2017-12-02", 0.7], ["2017-12-03", 0.48], ["2017-12-04", 1.73], ["2017-12-05", 1.29], ["2017-12-06", 1.39], ["2017-12-07", 1.34], ["2017-12-08", 1.04], ["2017-12-09", 3.93], ["2017-12-10", 0.79], ["2017-12-11", 1.6], ["2017-12-12", 1.33], ["2017-12-13", 1.19], ["2017-12-14", 1.41], ["2017-12-15", 1.34], ["2017-12-16", 1.56], ["2017-12-17", 1.36], ["2017-12-18", 3.23], ["2017-12-19", 4.96], ["2017-12-20", 7.29], ["2017-12-21", 10.27], ["2017-12-22", 7.74], ["2017-12-23", 2.24], ["2017-12-24", 2.61], ["2017-12-25", 6.89], ["2017-12-26", 6.53], ["2017-12-27", 5.91], ["2017-12-28", 6.55], ["2017-12-29", 3.92], ["2017-12-30", 1.88], ["2017-12-31", 2.66]],
    "top": [["2017-12-21", 10.27], ["2017-12-22", 7.74], ["2017-12-20", 7.29], ["2017-12-25", 6.89], ["2017-12-28", 6.55], ["2017-12-26", 6.53], ["2017-12-27", 5.91], ["2017-12-19", 4.96], ["2017-11-23", 4.82], ["2017-12-09", 3.93], ["2017-12-29", 3.92], ["2017-12-18", 3.23], ["2017-11-24", 2.73], ["2017-12-31", 2.66], ["2017-12-24", 2.61], ["2017-11-26", 2.4], ["2017-11-25", 2.27], ["2017-12-23", 2.24], ["2017-12-30", 1.88], ["2017-12-04", 1.73], ["2017-12-11", 1.6], ["2017-11-17", 1.6], ["2017-11-14", 1.57], ["2017-12-16", 1.56]],
    "env_name": "壮丽三峡",
    "range": ["2017-04-01", "2018-04-31"],
    "top_len": 24,
    "ch_size": 1.947
};

var data = {
    range: image_data.range,//日历范围
    calendarData: image_data.data,//每日数据
    topData: image_data.top,//top数据
    legend: ['日波动', 'Top ' + image_data.top_len],//top点个数
    ch_size: image_data.ch_size//标记点size变化倍数
};

var option = {
    backgroundColor: '#404a59',
    tooltip: {
        trigger: 'item'
    },
    legend: {
        top: '10',
        left: '110',
        data: data.legend,
        textStyle: {
            color: '#fff'
        }
    },
    calendar: [
        // {
        //     top: 50,
        //     left: 'center',
        //     range: data.range,
        //     splitLine: {
        //         show: true,
        //         lineStyle: {
        //             color: '#000',
        //             width: 4,
        //             type: 'solid'
        //         }
        //     },
        //     yearLabel: {
        //         formatter: '{start}  第' + (1) + '季度',
        //         fontSize: 12,
        //     },
        //     monthLabel: {
        //         nameMap: 'cn'
        //     },
        //     dayLabel: {
        //         nameMap: 'cn'
        //     },
        //     cellSize: 22,
        //     itemStyle: {
        //         normal: {
        //             color: '#323c48',
        //             borderWidth: 1,
        //             borderColor: '#111'
        //         }
        //     }
        // }
    ],
    series: [
        // {
        //     name: data.legend[0],
        //     type: 'scatter',
        //     coordinateSystem: 'calendar',
        //     calendarIndex: 0,
        //     data: data.calendarData,
        //     symbolSize: function (val) {
        //         return val[1] * data.ch_size;
        //     },
        //     itemStyle: {
        //         normal: {
        //             color: '#ddb926'
        //         }
        //     }
        // },
        // {
        //     name: data.legend[1] || '',
        //     type: 'effectScatter',
        //     coordinateSystem: 'calendar',
        //     calendarIndex: 0,
        //     data: data.topData,
        //     symbolSize: function (val) {
        //         return val[1] * data.ch_size;
        //     },
        //     showEffectOn: 'render',
        //     rippleEffect: {
        //         brushType: 'stroke'
        //     },
        //     hoverAnimation: true,
        //     itemStyle: {
        //         normal: {
        //             color: '#f4e925',
        //             shadowBlur: 10,
        //             shadowColor: '#333'
        //         }
        //     },
        //     zlevel: 1
        // }
    ]
};

var start_date = new Date(data.range[0]);
var end_date = new Date(data.range[1]);
var intervalMonth = Math.abs((start_date.getFullYear() * 12 + start_date.getMonth()) - (end_date.getFullYear() * 12 + end_date.getMonth()));
var total_calendar = Math.ceil((intervalMonth + 1) / 3);
console.log(data.range, total_calendar);
var one_height = 190;
for (var i = 0; i < total_calendar; i++) {
    var range = ['', ''];
    var $start_month = (start_date.getMonth() + i * 3);

    var $quarter = Math.floor(($start_month + 3) / 3);//第几季度,1,2,3,4
    var $quarter_start_month = ($quarter - 1) * 3;//某季度开始月:0,3,6,9
    var $end_month = $quarter_start_month + 3;

    var $start_date = new Date(start_date.getFullYear(), $quarter_start_month, 1, 0, 0, 0);

    range[0] = $start_date.getFullYear() + '-' + ($start_date.getMonth() + 1) + '-' + $start_date.getDate();

    var $end_date = new Date(start_date.getFullYear(), $end_month, 0, 23, 59, 59);

    range[1] = $end_date.getFullYear() + '-' + ($end_date.getMonth() + 1) + '-' + $end_date.getDate();

    console.log(i, $end_month, range);
    // start_date.setMonth(start_date.getMonth() + 3);
    var $now_quarter = Math.floor(($start_date.getMonth() + 3) / 3);
    option.calendar.push({
        top: one_height * i + 50,
        left: 'center',
        range: range,
        splitLine: {
            show: true,
            lineStyle: {
                color: '#000',
                width: 4,
                type: 'solid'
            }
        },
        yearLabel: {
            formatter: '{start}  第' + $now_quarter + '季度',
            fontSize: 12,
        },
        monthLabel: {
            nameMap: 'cn'
        },
        dayLabel: {
            nameMap: 'cn'
        },
        cellSize: 22,
        itemStyle: {
            normal: {
                color: '#323c48',
                borderWidth: 1,
                borderColor: '#111'
            }
        }
    });

    var calendar_data = _.filter(data.calendarData, function (row) {
        return new Date(row[0] + ' 00:00:00').getTime() >= $start_date.getTime() && new Date(row[0]).getTime() <= $end_date.getTime();
    });
    var top_data = _.filter(data.topData, function (row) {
        return new Date(row[0] + ' 00:00:00').getTime() >= $start_date.getTime() && new Date(row[0]).getTime() <= $end_date.getTime();
    });
    option.series.push({
        name: data.legend[0],
        type: 'scatter',
        // label: {
        //     normal: {
        //         show: true,
        //         formatter: function (params) {
        //             var d = echarts.number.parseDate(params.value[0]);
        //             return d.getDate();
        //         },
        //         color: '#fff'
        //
        //     }
        // },
        coordinateSystem: 'calendar',
        calendarIndex: i,
        data: calendar_data || [],
        symbolSize: function (val) {
            return val[1] * data.ch_size;
        },
        itemStyle: {
            normal: {
                color: '#ddb926'
            }
        }
    });
    option.series.push({
        name: data.legend[1] || '',
        type: 'effectScatter',
        coordinateSystem: 'calendar',
        calendarIndex: i,
        data: top_data,
        symbolSize: function (val) {
            return val[1] * data.ch_size;
        },
        showEffectOn: 'render',
        rippleEffect: {
            brushType: 'stroke'
        },
        hoverAnimation: true,
        itemStyle: {
            normal: {
                color: '#f4e925',
                shadowBlur: 10,
                shadowColor: '#333'
            }
        },
        zlevel: 1
    });
}
// return;

new Canvas.Font('msyhl', path.join(__dirname + '/echarts/', "msyhl.ttc"));
var ctx = new Canvas(128, 128);
echarts.setCanvasCreator(function () {
    return ctx;
});

option.backgroundColor = option.backgroundColor || '#fff';
option.animation = false;

var chart = echarts.init(new Canvas(600, one_height * total_calendar + 50));
chart.setOption(option);
var png = __dirname + "/test.png";
fs.writeFileSync(png, chart.getDom().toBuffer());
console.log("Create Img:" + png);

chart.dispose();
