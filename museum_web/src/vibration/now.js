// @require echarts
var router = require('common/router');
var vm;
var nowTime;
var stime;
var myChart;

//获取震动参数名称单位
var param_unit_name = window.web_config.param_unit_name.vibration;

exports.init = function () {

    $('#content').load('now.html?date=' + new Date() * 1, function () {

        vm = new Vue({
            el: '#content',
            data: {},
            methods: {
                go_history: function () {
                    clearInterval(stime);
                    location.href = "#/history";
                }
            }
        });
        $('#my_chart').height($('#left').height() - $('.Integrated .header').height() - 20);
        zd_init();


    });

};

function getData(callback, ecallback) {
    var gtime = $('#gtime').val();
    $.ajax({
        type: 'post',
        url: API('/env/vibration/getData') + '/' + (nowTime ? nowTime : ''),
        data: {gtime: gtime},
        dataType: 'json',
        success: function (data) {
            callback && callback(data);
        }, error: function () {
            ecallback && ecallback();
        }
    });
}

function loadData() {

    getData(function (data) {
        if (data.total == 0) {
            return;
        }

        nowTime = data.time;
        var point_shift = true;
        if (option.series[0].data.length < 2000) {
            point_shift = false;
        }

        $.each(data.accel, function (i, n) {
            if (point_shift) {
            option.series[0].data.shift();
            option.series[1].data.shift();
            option.series[2].data.shift();
            }
            option.series[0].data.push(data.accel[i]);
            option.series[1].data.push(data.speed[i]);
            option.series[2].data.push(data.displacement[i]);

        });
        myChart.setOption({
            series: option.series
        });


    });
}


var option = {
    useUTC: false,
    title: {
        text: null
    },
    grid: {
        left: '50',
        right: '50',
    },
    toolbox: {
            left: 'right',
            feature: {
                dataZoom: {
                    yAxisIndex: 'none'
                },
                restore: {}
            }
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
        // shared: true,
        trigger: 'axis',
        axisPointer: {
            type: 'line',
        }
    },
    color:["#639EE2",'#0D233A','#8BBC21'],
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
                data: data.accel,
                showSymbol: false,
                lineStyle: {
                    normal: {
                        color: '#2F7ED8'
                    }
                },
            },
            {
                type: 'line',
                name: '速度',
                data: data.speed,
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
                data: data.displacement,
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
        stime = setInterval(loadData, 1000);
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
