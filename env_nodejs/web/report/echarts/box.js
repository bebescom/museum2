exports.generate = function (data) {

    data.xAxisData = data.xAxisData || ['环境1'];
    data.color = data.color || ['#2f4554', '#61a0a8', '#91c7ae', '#749f83', '#ca8622', '#bda29a', '#6e7074', '#546570', '#c4ccd3'];
    data.boxplotData = data.boxplotData || [

    ];
    data.scatterData = data.scatterData || [

    ];
    var xAxis = [];
    var bp_data = [];
    var sct_data = [];
    for (var i =0;i < data.boxplotData.length;i+=25){
        bp_data.push(data.boxplotData.slice(i,i+25));
        xAxis.push(data.xAxisData.slice(i,i+25));
        sct_data.push(data.scatterData.slice(i,i+25));
    }

    data.unit = data.unit || '';
    var box_imgs = [];
    for(var key in bp_data){
        var b_data = bp_data[key];
        var x_data = xAxis[key];
        var s_data = sct_data[key];

        var height = 32 * b_data.length + 80;
        var option = {
            backgroundColor: '#E1E1E1',
            grid: {
                left: '25%',
                right: '10%',
                bottom: '10%'
            },
            color: data.color,
            yAxis: {
                type: 'category',
                data: x_data,
                boundaryGap: true,
                nameGap: 30,
                splitArea: {
                    show: false
                },
                axisLabel: {
                    interval: 0,
                    //rotate: 55,
                    margin: 5,
                    textStyle: {
                        fontSize: 10,
                        align: 'right',
                        baseline: 'top'
                    },
                    //formatter: function (value, index) {
                    //    if (value.length > 10) {
                    //        return value.substring(0, 10) + '...';
                    //    } else {
                    //        return value;
                    //    }
                    //}
                },
                splitLine: {
                    show: false
                },
                axisTick: {
                    alignWithLabel: true
                }
            },
            xAxis: {
                type: 'value',
                splitArea: {
                    show: false
                },
                // interval:1,
                splitLine: {
                    show: false
                },
                // min:'dataMin',
                // max:'dataMax'
                scale: true,
                position: 'top'
            },
            series: [
                {
                    name: 'boxplot',
                    type: 'boxplot',
                    data: b_data,
                    boxWidth: ['20', '25']
                },
                {
                    name: '离群值',
                    type: 'scatter',
                    data: s_data,
                    symbolSize: 6
                }
            ]
        };

        if (data.unit) {
            option.title = {
                subtext: '单位：' + data.unit,
                right: 50,
                top: 0,
                subtextStyle: {
                    color: '#000'
                }
            }
        }

        var img = require('./echarts')({
            option: option,
            data: data,
            height: height
        });
        box_imgs.push(img);
    }
    return box_imgs;
};

exports.echarts_prepareBoxplotData = function (boxplotData) {
    var echarts = require('echarts');
    require('echarts/dist/extension/dataTool');
    return echarts.dataTool.prepareBoxplotData(boxplotData);
};