exports.generate = function (data) {

    data.yAxisData = data.yAxisData || [];
    data.color = data.color || ['#2f4554', '#61a0a8', '#91c7ae', '#749f83', '#ca8622', '#bda29a', '#6e7074', '#546570', '#c4ccd3'];
    data.barData = data.barData || [];
    data.unit = data.unit || '';

    var yAxis = [];
    var bp_data = [];
    for (var i =0;i < data.barData.length;i+=25){
        bp_data.push(data.barData.slice(i,i+25));
        yAxis.push(data.yAxisData.slice(i,i+25));
    }

    var bar_img = [];
    for(var n in bp_data){
        var ydata = yAxis[n];
        var b_data = bp_data[n];
        var height = ydata.length * 25 + 80;

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
                //动态数据生成Y轴,通常对应环境名称
                data: ydata,
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
                    show: false,
                    alignWithLabel: true
                },
            },
            xAxis: {
                type: 'value',
                position: 'top',
                name: data.unit,
                //动态数据生成Y轴名称,通常对应参数名称
                splitArea: {
                    show: false
                },
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: ['#D9D9D9']
                    }
                },
                axisTick: {
                    show: false,
                    alignWithLabel: true
                },
                scale: true,
                axisLine: {
                    show: true
                },
                axisLabel: {
                    show: true,
                    textStyle: {
                        color: '#595959'
                    }
                }
            },
            //动态数据生成图表
            series: [
                {
                    name: '数据名称',
                    type: 'bar',
                    barWidth: '15',
                    data: b_data,
                    // label: {
                    //     normal: {
                    //         show: true,
                    //         position: 'inside'
                    //     }
                    // }
                }
            ]
        };

        var img =  require('./echarts')({
            option: option,
            data: data,
            height: height
        });
        bar_img.push(img);
    }

    return bar_img;
};
