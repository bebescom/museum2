exports.load_data=function() {
    var This=this;
    console.log(window.vm)
    var dateTime = window.vm.map_view_data[1];
    var year = dateTime.getFullYear();
    var momth = dateTime.getMonth() + 1;
    var day = dateTime.getDate();
    var hour=dateTime.getHours();
    var minutes=dateTime.getMinutes();
    var thisTime=year+"-"+momth+"-"+day+" "+hour+":"+minutes;
    var $switch_change_text=$("#switch_change_text");
    var times=0;
    var intervalFont=setInterval(function () {//添加省略号，表示数据正在获取
        if(times==6){
            $switch_change_text.html("");
            times=0;
        }
        times++;
        $switch_change_text.append(".");
    },1000)
    console.log(This.map_view_data)
    var newIntervalTime=window.vm.map_view_data[0]/1000+','+window.vm.map_view_data[1]/1000;//时间范围，单位为秒
    $.get(API('/env/general/field'),{env_no:env_no,times:newIntervalTime,count_time:15},function(json){
        clearInterval(intervalFont);//数据获取完毕，清除定时器
        console.log(json.data)
        $("#switch_change_text").html("时刻："+thisTime);
        field_data=json;
        init();
    }).error(function () {
        clearInterval(intervalFont);//数据获取完毕，清除定时器
        $("#switch_change_text").html("读取数据失败");
    })
}

function getDotValue(x, y, equips) {
    // 权值和
    var wSum = 0;
    // 权值 与实际值成绩 和
    var wvSum = 0;
    for (var i in equips) {
        var e = equips[i];
        if (e.value === undefined) continue;
        var x2y2 = (x - e.x) * (x - e.x) + (y - e.y) * (y - e.y);
        if (x2y2 == 0) return e.value;
        var w = Math.pow(x2y2, -1);
        // 累加权值和
        wSum = wSum + w;
        // 计算权值 * 实际数据  并累加
        wvSum = wvSum + w * e.value;
    }
    return (wvSum / wSum).toFixed(1);
}

exports.init=function () {
    var field_data,time_data;
    var time = time_data[time_index];//时间
    // console.log(time);
    var equip_data = [];
    _.each(field_data.data[time], function (val, key) {
        var index = show_param === 'temperature' ? 0 : 1;//第一个参数温度，第二个参数为湿度
        if (val[index] !== null && val[index] !== undefined) {
            equip_data.push(_.extend(field_data.equips[key], {value: val[index]}));
        }
    });
    var date = new Date(time * 1000);
    $('#text').text(date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes());
    // console.log(time, field_data.data[time], equip_data);
    $('#now_data').val(JSON.stringify(equip_data, 2));

    var data = [];
    var max_x = parseInt(field_data.width / dot_size);
    var max_y = parseInt(field_data.height / dot_size);

    var dVal;

    for (var i = 0; i < max_x; i++) {
        for (var j = 0; j < max_y; j++) {
            dVal = getDotValue(i * dot_size, (max_y - j) * dot_size, equip_data);
            data.push([i, j, dVal]);
        }
    }
    var rgba_opacity = 0.5;//透明度

    var option = {
        tooltip: {
            formatter: function (params) {
                // console.log(params);
                return (params.data[3] || '估计值') + '：' + params.data[2] + ((show_param === 'temperature') ? '℃' : '%');
            },
        },
        backgroundColor: '',
        grid: {
            right: 0,
            left: 0,
            top: 0,
            bottom: 0,
        },
        xAxis:
            [
                {
                    // show: false,
                    max: max_x,
                },
                {
                    // show: false,
                    max: field_data.width
                }
            ],
        yAxis:
            [
                {
                    // show: false,
                    max: max_y,
                },
                {
                    // show: false,
                    max: field_data.height
                }
            ],
        visualMap: {
            // show: false,
            type: 'piecewise',
            min: field_data['min_' + show_param] * 1,
            max: field_data['max_' + show_param] * 1,
            splitNumber: 9,
            seriesIndex: 0,
            inRange: {
                color: [
                    'rgba(173,59,45,' + rgba_opacity + ')',
                    'rgba(226,85,66,' + rgba_opacity + ')',
                    'rgba(237,118,102,' + rgba_opacity + ')',
                    'rgba(236,156,145,' + rgba_opacity + ')',
                    'rgba(255,224,220,' + rgba_opacity + ')',
                    'rgba(193,222,242,' + rgba_opacity + ')',
                    'rgba(136,198,236,' + rgba_opacity + ')',
                    'rgba(66,155,210,' + rgba_opacity + ')',
                    'rgba(9,105,166,' + rgba_opacity + ')',
                ].reverse()
                //['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
            }
        },
        series: [
            {
                name: 'h',
                type: 'heatmap',
                data: data,
                progressive: 0,
                // animation: false
            },
            {
                name: 'd',
                symbolSize: 20,
                data: _.map(equip_data, function (value) {
                    return [value.x, field_data.height - value.y, value.value, value.name];
                }),
                type: 'scatter',
                xAxisIndex: 1,
                yAxisIndex: 1,
            }
        ],
        animation: false

    };
    console.log(option);
    if (!myChart) {
        myChart = echarts.init(document.getElementById('main'));
    }
    myChart.setOption(option);

}

var myChart;

exports.reset = function () {
    $('#main').empty();
    myChart = null;
    exports.init();
};
exports.dispose = function () {
    myChart.dispose();//环境场关闭，销毁echarts实例
    myChart = null;
};

