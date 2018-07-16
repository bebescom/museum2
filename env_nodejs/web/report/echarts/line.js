exports.generate = function (data) {
    data.name = data.name || '';
    data.color = data.color || ['#2f4554', '#61a0a8', '#91c7ae', '#749f83', '#ca8622', '#bda29a', '#6e7074', '#546570', '#c4ccd3'];
    data.unit = data.unit || '';
//时间参数可以为时间戳
    data.lineData = data.lineData || [
        // ['2017-04-20', 80],
    ];

    data.interval = data.interval || 1000 * 60 * 60 * 24 * 3;

    var option = {
        backgroundColor: '#E1E1E1',
        grid: {
            left: '10%',
            right: '10%',
            bottom: '10%'
        },
        legend: {
            data: [data.name],
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
                name: '曲线展示参数',
                showSymbol: false,
                data: data.lineData,
                smooth: true,
                lineStyle: {
                    normal: {
                        width: 0.5
                    }
                }
            }
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

