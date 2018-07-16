/**
 * Created by Hebj on 2018/6/22.
 */
var _ = require('underscore');

exports.generate = function (data) {

    data.allData = data.allData || [];
    data.markLineData = data.markLineData || [];
    data.markLine = data.markLine | [];
    data.xAxis = data.xAxis || [];
    data.yAxis = data.yAxis || [];
    //data.color = data.color || ['#2f4554', '#61a0a8', '#91c7ae', '#749f83', '#ca8622', '#bda29a', '#6e7074', '#546570', '#c4ccd3'];

    var markLineOpt = {
        animation: false,
        label: {
            normal: {
                formatter: data.markLine,
                textStyle: {
                    align: 'right'
                }
            }
        },
        lineStyle: {
            normal: {
                type: 'solid',
                color:'#2F4F4F'
            }
        },
        tooltip: {
            formatter: data.markLine
        },
        data: [data.markLineData]
    };

    option = {
        title: {
            text: '散点图',
            x: 'center',
            y: 0
        },
        xAxis:data.xAxis,
        yAxis:data.yAxis,
        series: [
            {
                name: '散点图',
                type: 'scatter',
                data: data.allData,
                markLine: markLineOpt,
                symbolSize:5,
                itemStyle:{
                   normal:{
                       color:'#2F4F4F'
                   }
                }
            }
        ]
    };

    // console.log(JSON.stringify(option));

    return require('./echarts')({
        option: option,
        data: data,
        //height: one_height * total_calendar + 50,
    });
}