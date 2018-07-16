exports.generate = function (data) {

    data.xAxisData = data.xAxisData || [];
    data.color = data.color || ['transparent', '#2f4554', '#ffffff'];
    data.unit = data.unit || '';
//峰值数据(有色柱状堆叠,扣除最小值)
    data.peakData = data.peakData || [
        //20 - 120, 302 - 132, 301 - 101, 334 - 134, 390 - 90, 330 - 230, 320 - 210
    ];
//最小值(透明柱状基础)
    data.minData = data.minData || [
        //120, 132, 101, 134, 90, 230, 210
    ];
//均值数据(白色散点)
    data.avgData = data.avgData || [
        //140, 150, 150, 170, 200, 260, 300
    ];

    var xAxis = [];
    var bp_data = [];
    var avg_datas = [];
    var min_datas = [];
    for (var i =0;i < data.peakData.length;i+=25){
        bp_data.push(data.peakData.slice(i,i+25));
        xAxis.push(data.xAxisData.slice(i,i+25));
        min_datas.push(data.minData.slice(i,i+25));
        avg_datas.push(data.avgData.slice(i,i+25));
    }

    var pav_img = [];
    for(var n in bp_data){
        var xdata = xAxis[n];
        var b_data = bp_data[n];
        var min_data = min_datas[n];
        var avg_data = avg_datas[n];
        var height = b_data.length * 25 + 130;

        var option = {
            backgroundColor: '#E1E1E1',
            grid: {
                left: '25%',
                right: '10%',
                bottom: 50
            },
            color: data.color,
            legend: {
                data: ['均值'],
                itemWidth: 6,
                itemHeight: 6,
                bottom: 10
            },
            yAxis: {
                type: 'category',
                data: xdata,
                boundaryGap: true,
                nameGap: 30,
                splitArea: {
                    show: false
                },
                axisLabel: {
                    // interval: 0,
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
                },
                position: 'top'
            },
            series: [
                //设置堆叠柱状图
                {
                    type: 'bar',
                    name: '最小值(基础值)',
                    stack: '均峰图',
                    data: min_data,
                    barWidth: '15'
                },
                {
                    type: 'bar',
                    name: '堆叠值(范围区间值)',
                    stack: '均峰图',
                    //堆叠区间需要扣除基础值部分,以确保区间显示正确
                    data: b_data
                },
                {
                    type: 'scatter',
                    name: '均值',
                    data: avg_data,
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

        var img =  require('./echarts')({
            option: option,
            data: data,
            height: height
        });

        pav_img.push(img);
    }

    return pav_img;
};

