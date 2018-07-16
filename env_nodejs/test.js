/**
 * Created by USER on 2017-3-28.
 */
var tool = require('./lib/tool');

var echarts = require("echarts");
var Canvas = require("canvas-prebuilt");
var fs = require('fs');
var path = require('path');

var config = {path: 'test.png'};

//new Canvas.Font('msyhl', path.join(__dirname, "msyhl.ttc"));

echarts.setCanvasCreator(function () {
    return ctx;
});
var ctx = new Canvas(128, 128);
var chart, option = {
    backgroundColor: '#F0F0F0',
    title: {
        text: '重启'
    },
    tooltip: {},
    legend: {
        data: ['test']
    },
    xAxis: {
        data: ["a", "b", "c", "d", "f", "g"]
    },
    yAxis: {},
    series: [{
        name: 'test',
        type: 'bar',
        data: [5, 20, 36, 10, 10, 20]
    }]
};
config.width = config.width || 500;
config.height = config.height || 500;

option.animation = false;
chart = echarts.init(new Canvas(parseInt(config.width, 10), parseInt(config.height, 10)));
chart.setOption(option);
if (config.path) {
    try {
        fs.writeFileSync(config.path, chart.getDom().toBuffer());
        console.log("Create Img:" + config.path)
    } catch (err) {
        console.error("Error: Write File failed" + err.message)
    }
} else {
    return chart.getDom().toBuffer()
}
