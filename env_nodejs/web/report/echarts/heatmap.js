/**
 * Created by Hebj on 2018/6/22.
 */
//var _ = require('underscore');

exports.generate = function (data) {

    data.allData = data.allData || [];
    data.range = data.range ||{min:0,max:10000};
    data.xAxis = data.xAxis || [];
    data.yAxis = data.yAxis || [];

    data.allData = data.allData.map(function (item) {
        return [item[1], item[0], item[2] || '-'];
    });

    //console.log("heatmap: ",data);
    option = {
        tooltip: {
            position: 'top'
        },
        animation: false,
        grid: {
            height: '50%',
            y: '10%'
        },
        xAxis: data.xAxis,
        yAxis:data.yAxis,
        visualMap: {
            min: data.range.min,
            max: data.range.max,
            calculable: true,
            orient: 'horizontal',
            left: 'center',
            bottom: '20%',
            type:"continuous",
            inRange:{
                color:['#5F9EA0','#2F4F4F']
            }
        },
        series: [{
            name: '温湿度数据量热力图',
            type: 'heatmap',
            data: data.allData,
            label: {
                normal: {
                    show: true
                }
            },
            itemStyle: {
                emphasis: {
                    shadowBlur: 10,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            }
        }]
    };
     //console.log(JSON.stringify(option));

    return require('./echarts')({
        option: option,
        data: data,
        //height: one_height * total_calendar + 50,
    });
}