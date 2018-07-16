var _ = require('underscore');

exports.generate = function (data) {

    data.calendarData = data.calendarData || [];
    data.topData = data.topData || [];
    data.legend = data.legend | [];
    data.range = data.range || [];
    data.ch_size = data.ch_size || 2;

    var option = {
        backgroundColor: '#E1E1E1',
        tooltip: {
            //trigger: 'item'
        },
        legend: {
            top: '30',
            left: '100',
            data: data.legend,
            textStyle: {
                color: '#000'
            }
        },
        calendar: [],
        series: [
            {
                name: data.legend[0],
                type: 'scatter',
                coordinateSystem: 'calendar',
                data: data.calendarData,
                symbolSize: function (val) {
                    return val[1] * data.ch_size;
                },
                itemStyle: {
                    normal: {
                        color: '#ddb926'
                    }
                }
            },
            {
                name: data.legend[1] || '',
                type: 'effectScatter',
                coordinateSystem: 'calendar',
                data: data.topData,
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
            }
        ]
    };

    var start_date = new Date(data.range[0]);
    var end_date = new Date(data.range[1]);
    var intervalMonth = Math.abs((start_date.getFullYear() * 12 + start_date.getMonth() + 1) - (end_date.getFullYear() * 12 + end_date.getMonth() + 1));

    var total_calendar = Math.ceil((intervalMonth + 1) / 3);
    if (start_date.getFullYear() !== end_date.getFullYear()) {
        total_calendar++;
    }
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

        // console.log(i,$end_month, range);
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
                color: '#000',
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

    // console.log(JSON.stringify(option));

    return require('./echarts')({
        option: option,
        data: data,
        height: one_height * total_calendar + 50,
    });
}