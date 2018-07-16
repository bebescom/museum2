var router = require('common/router');
var vm;
var nowTime;
var myChart;

//获取震动参数名称单位
var param_unit_name = window.web_config.param_unit_name.vibration;

exports.init = function () {

    $('#content').load('history.html?date=' + new Date() * 1, function () {

        vm = new Vue({
            el: '#content',
            data: {
                time_options: {//日期选择,设置日期快捷选择
                    shortcuts: [
                        {
                            text: '最近1个月',
                            value: function () {
                                return [new Date().setMonth(new Date().getMonth() - 1), +new Date()];
                            }
                        },
                        {
                            text: '最近3个月',
                            value: function () {
                                return [new Date().setMonth(new Date().getMonth() - 3), +new Date()];
                            }
                        },
                        {
                            text: '最近半年',
                            value: function () {
                                return [new Date().setMonth(new Date().getMonth() - 6), +new Date()];
                            }
                        },
                        {
                            text: '最近1年',
                            value: function () {
                                return [new Date().setMonth(new Date().getMonth() - 12), +new Date()];
                            }
                        }
                    ]
                },
                dataTime: [new Date().setMonth(new Date().getMonth() - 1), +new Date()]
            },
            methods: {
                changeTime: function () {
                    zd_init();
                }
            }
        });

        vm.$Loading.config({
            color: '#f0ebef',
            failedColor: '#f00',
            height: 2
        });

        $('#my_chart').height($('#left').height() - $('.Integrated .header').height() - 20);
        zd_init();

    });

};


function getData(callback, ecallback) {


    var stime = parseInt(new Date(vm.dataTime[0]) / 1000);
    var etime = parseInt(new Date(vm.dataTime[1]) / 1000);
    console.log(stime, etime);
    vm.$Loading.start();
    $.ajax({
        type: 'post',
        url: API('/env/vibration/getHistoryData'),
        data: {stime: stime, etime: etime},
        dataType: 'json',
        success: function (data) {
            vm.$Loading.finish();
            callback && callback(data);
        }, error: function () {
            vm.$Loading.finish();
            ecallback && ecallback();
        }
    });
}

var option = {
    useUTC: false,
    title: {
        text: null
    },
    // dataZoom: [
    //     {
    //         id: 'dataZoomX',
    //         type: 'slider',
    //         xAxisIndex: [0],
    //         filterMode: 'filter'
    //     }
    // ],
    toolbox: {
            left: 'right',
            feature: {
                dataZoom: {
                    yAxisIndex: 'none'
                },
                restore: {}
            }
        },
    grid: {
        left: '50',
        right: '50',
        bottom: '100',
    },
    xAxis: {
        type: 'time',
        splitLine: {
            show: false
        }
    },
    yAxis: {
        type: 'value',
        scale:true,
        splitLine: {
            show: false
        }
    },
    tooltip: {
        trigger: 'axis',
        axisPointer: {
            type: 'line',
        },
        formatter: function (params) {
            console.log(params);
            var str = '', min = '', max = '', avg = '', unit = '';
            var date = new Date(params[0].data[0]);
            str = date.getFullYear() + "-" + pad(date.getMonth()+1, 2) + '-' + pad(date.getDate(), 2) + ' ' + pad(date.getHours(), 2) + ':00';
            if (params.length > 2) {
                str += '<br/><span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:' + params[0].color + '"></span>';
                str += params[0].seriesName + ',';
                unit = params[0].data[2];
                min = params[0].data[1];
                max = params[1].data[1];
                avg = params[2].data[1];
                str += '范围:' + min + unit + '~' + (min + max).toFixed(2) + unit + ',均值:' + avg + unit;
            }
            if (params.length > 5) {
                str += '<br/><span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:' + params[3].color + '"></span>';
                str += params[3].seriesName + ',';
                unit = params[3].data[2];
                min = params[3].data[1];
                max = params[4].data[1];
                avg = params[5].data[1];
                str += '范围:' + min + unit + '~' + (min + max).toFixed(2) + unit + ',均值:' + avg + unit;
            }
            if (params.length > 8) {
                str += '<br/><span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:' + params[6].color + '"></span>';
                str += params[6].seriesName + ',';
                unit = params[6].data[2];
                min = params[6].data[1];
                max = params[7].data[1];
                avg = params[8].data[1];
                str += '范围:' + min + unit + '~' + (min + max).toFixed(2) + unit + ',均值:' + avg + unit;
            }
            return str;
        }
    },
    color: ["#639EE2", '#0D233A', '#8BBC21'],
    legend: {
        data: ['加速度', '速度', '位移'],
        align: 'left',
        bottom: '10'
    },
    backgroundColor: '#fff',
    animation: false,
};

function zd_init() {
    $('#Integrated .shadow').show();
    $('#my_chart').empty();
    myChart = echarts.init(document.getElementById('my_chart'));
    $(window).bind('resize', function () {//窗口放缩自适应
        myChart.resize();
    });
    nowTime = null;
    getData(function (data) {
        option.series = [
            {
                type: 'line',
                name: '加速度',
                data: data.accel_min,

                stack: 'confidence-band-accel',
                showSymbol: false,
                lineStyle: {
                    normal: {
                        opacity: 0
                    }
                }
            },
            {
                type: 'line',
                name: '加速度',
                data: data.accel_max.map(function (item, index) {
                    item[1] = (item[1] - data.accel_min[index][1]).toFixed(2) * 1;
                    return item;
                }),
                stack: 'confidence-band-accel',
                showSymbol: false,
                lineStyle: {
                    normal: {
                        opacity: 0
                    }
                },
                areaStyle: {
                    normal: {
                        color: '#639EE2'
                    }
                },
            },
            {
                type: 'line',
                name: '加速度',
                data: data.accel_averages,
                lineStyle: {
                    normal: {
                        color: '#2F7ED8'
                    }
                },
                showSymbol: false
            },
            {
                type: 'line',
                name: '速度',
                data: data.speed_min,
                stack: 'confidence-band-speed',
                showSymbol: false,
                lineStyle: {
                    normal: {
                        opacity: 0
                    }
                }
            },
            {
                type: 'line',
                name: '速度',
                data: data.speed_max.map(function (item, index) {
                    item[1] = (item[1] - data.speed_min[index][1]).toFixed(2) * 1;
                    return item;
                }),
                stack: 'confidence-band-speed',
                showSymbol: false,
                lineStyle: {
                    normal: {
                        opacity: 0
                    }
                },
                areaStyle: {
                    normal: {
                        color: '#9ac1e0'
                    }
                },
            },
            {
                type: 'line',
                name: '速度',
                data: data.speed_averages,
                showSymbol: false,
                lineStyle: {
                    normal: {
                        color: '#0D233A'
                    }
                },
            },
            {
                type: 'line',
                name: '位移',
                data: data.displacement_min,
                stack: 'confidence-band-displacement',
                showSymbol: false,
                lineStyle: {
                    normal: {
                        opacity: 0
                    }
                }
            },
            {
                type: 'line',
                name: '位移',
                data: data.displacement_max.map(function (item, index) {
                    item[1] = (item[1] - data.displacement_min[index][1]).toFixed(2) * 1;
                    return item;
                }),
                stack: 'confidence-band-displacement',
                showSymbol: false,
                lineStyle: {
                    normal: {
                        opacity: 0
                    }
                },
                areaStyle: {
                    normal: {
                        color: '#b9d076'
                    }
                },
            },
            {
                type: 'line',
                name: '位移',
                data: data.displacement_averages,
                showSymbol: false,
                lineStyle: {
                    normal: {
                        color: '#8BBC21'
                    }
                },
            }
        ];
        nowTime = data.time;
        myChart.setOption(option);
        $('#Integrated .shadow').hide();
    }, function () {
        vm.$Message.error('获取数据失败');
    });


}


function pad(num, n) {
    var len = num.toString().length;
    while (len < n) {
        num = "0" + num;
        len++;
    }
    return num.toString();
}
