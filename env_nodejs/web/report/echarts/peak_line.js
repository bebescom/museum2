exports.generate = function (data) {

    data.color = data.color || ["","#4F81BD", "#9BBB59", "#8064A1"];
    data.unit = data.unit || '';
//时间参数可以为时间戳
    data.minData = data.minData || [];
    data.peakData = data.peakData || [];
    data.avgData = data.avgData || [];
    data.targetData = data.targetData || [];

    // data.interval = data.interval || 1000 * 60 * 60 * 24 * 3;

    var option = {
        backgroundColor: '#F0F0F0',
        grid: {
            left: '10%',
            right: '10%',
            bottom: 70
        },
        legend: {
            data: ['平均值', '调控目标值'],
            bottom: 10
        },
        color: data.color,
        xAxis: {
            type: 'time',
            nameGap: 30,
            splitArea: {
                show: false
            },
            splitNumber: 6,
            axisLabel: {
                // rotate: 90,
                // interval: 0,
                margin: 5,
                textStyle: {
                    fontSize: 10,
                    align: 'left',
                    baseline: 'top'
                },
                formatter: function (value, index) {
                    // 格式化成月/日，只在第一个刻度显示年份
                    var date = new Date(value);
                    return ' ' + (date.getMonth() + 1) + '-' + date.getDate() + ' ';
                }
            },
            splitLine: {
                show: false
            },
            axisTick: {
                show: false,
                alignWithLabel: true
            },
            //可以通过手动设置间隔,时间轴'time'传入参数为毫秒数
            //间隔3天
            // interval: data.interval
        },
        yAxis: {
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
                show: false
            },
            scale: true,
            axisLine: {
                show: false
            },
            axisLabel: {
                show: true,
                textStyle: {
                    color: '#595959'
                }
            },
        },
        series: [
            {
                type: 'line',
                name: '最小值(基础值)',
                showSymbol: false,
                stack: '均峰图',
                smooth: true,
                data: data.minData,
                lineStyle: {
                    normal: {
                        opacity: 0
                    }
                },
            },
            {
                type: 'line',
                name: '堆叠值(范围区间值)',
                showSymbol: false,
                stack: '均峰图',
                smooth: true,
                data: data.peakData,
                lineStyle: {
                    normal: {
                        opacity: 0
                    }
                },
                areaStyle: {
                    normal: {
                        color: '#4F81BD'
                    }
                },
            },
            {
                type: 'line',
                name: '平均值',
                showSymbol: false,
                smooth: true,
                data: data.avgData,
                lineStyle: {
                    normal: {
                        color: '#9BBB59'
                    }
                },
            }, {
                type: 'line',
                name: '调控目标值',
                showSymbol: false,
                smooth: true,
                data: data.targetData,
                lineStyle: {
                    normal: {
                        color: '#8064A1'
                    }
                },
            },
        ]
    };
    if (data.unit) {
        option.yAxis.name = '单位：' + data.unit;
    }

    return require('./echarts')({
        option: option,
        data: data
    });

};

