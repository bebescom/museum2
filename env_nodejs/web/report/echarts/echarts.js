var echarts = require("echarts");
var Canvas = require("canvas");
var fs = require('fs');
var path = require('path');

new Canvas.Font('arial', path.join(__dirname, "arial.ttf"));
new Canvas.Font('msyhl', path.join(__dirname, "msyhl.ttc"));

module.exports = function (config) {

    var dft_width = config.width || 128;
    var dft_height = config.height || 150;
    if(dft_height < 128){
        dft_height = 128;
    }
    var ctx = new Canvas(dft_width, dft_height);
    echarts.setCanvasCreator(function () {
        return ctx;
    });

    var option = {
        title: {
            text: 'test'
        },
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
    config.width = config.width || config.data.width || 600;
    config.height = config.height || config.data.height || 500;
    config.option = config.option || option;
    // config.path = config.path || process.cwd() + '/test.png';

    config.option.backgroundColor = config.option.backgroundColor || '#fff';
    config.option.animation = false;
    // ctx.font = '12px';

    var chart = echarts.init(new Canvas(parseInt(config.width, 10), parseInt(config.height, 10)));
    chart.setOption(config.option);
    var base64_img = chart.getDataURL();

    if (config.path) {
        fs.writeFileSync(config.path, chart.getDom().toBuffer());
    }
    // fs.writeFileSync(config.path + '.json', config.option);
    // console.log("Create Img:" + config.path);

    chart.dispose();

    return {base64img: base64_img, option: config.option, data: config.data};

};