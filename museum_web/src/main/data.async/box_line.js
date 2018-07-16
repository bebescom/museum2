define('data.async/box_line', function (require, exports) {

    var select_hum = 'temperature',
        my_chart,
        $right='',
        hum = {
            temperature: {title: '温\n度', name: '温度', color: '#3CB38B'},
            humidity: {title: '相\n对\n湿\n度', name: '湿度', color: '#2595FB'}
        };
    var $data_box_line;
    exports.init = function () {
        $data_box_line=$('#data_box_line');
        $right=$data_box_line.find('.right');
        $right.append('<ul class="humiture_switch">' +
            '<li class="active" data-hum="temperature">温度</li>' +
            '<li data-hum="humidity">湿度</li>' +
            '</ul>');
        $data_box_line.find('.box').append('<div id="box_line_chart" style="height: 180px;"></div>');

        my_chart = echarts.init($('#box_line_chart')[0]);

        getData(null,null,keyaa);

        $data_box_line.find('.humiture_switch li').click(function () {
            var $this = $(this);
            $this.addClass('active').siblings().removeClass('active');
            select_hum = $this.attr('data-hum');
            getData();
        });
    };

    function set_get(num,chart,time){
        select_hum=num;
        getData(chart,time);
    }

    function keyaa(){
        $right.find('span').css('display','inline').click(function(){
            createAlert($right,my_chart,set_get);
        });
    }

    function getData(chart,time,fn) {
         $.get(API('/env/environments/overviews/box_plots/' + select_hum)+'?time='+(time?time:''), function (data) {
            $data_box_line.css('background','#F5F2DE').find('.box').css('opacity','1');
            if (data=='[]') {
                $data_box_line.find('.right').children().unbind();
                $data_box_line.find('.box').html('暂无数据').css({'text-align':'center','line-height':175+'px'});
                return;
            }
            var polt_data = [], min_y;

            _.each(data, function (list) {

                var list_sort = list.sort(function (a, b) {
                    return a - b;
                });

                var q1 = list_sort[Math.floor(list_sort.length * .25)-1] * 1;
                var q2 = list_sort[Math.floor(list_sort.length * .5)-1] * 1;
                var q3 = list_sort[Math.floor(list_sort.length * .75)-1] * 1;
                var iqr = q3 - q1;
                var min = q1 - 1.5 * iqr;

                var polt_row = [];
                polt_row.push(min);
                polt_row.push(q1);
                polt_row.push(q2);
                polt_row.push(q3);
                polt_row.push(q3 + 1.5 * iqr);

                polt_data.push(polt_row);
                if (!min_y || polt_row[0] < min_y) {
                    min_y = polt_row[0];
                }
            });
            chart_init(polt_data, _.keys(data), (min_y / 1.05).toFixed(0),'',chart);
            if(fn)fn();
        }, 'json');
    }



    function chart_init(data, name, min_y, color,chart) {
        var key={};
        if (data.length>=6) {
            key={
                x0:30,
                x1:70
            }
        }
        var option = {
            color: ['rgb(61,180,141)', 'rgb(45,154,255)'],
            title: {
                text: hum[select_hum].title,
                left: "1.7284%",
                top: "middle",
                textStyle: {
                    color: "#616161",
                    fontSize: 14,
                    fontFamily: "微软雅黑"
                }
            },
            dataZoom: [
                {
                    show: true,
                    realtime: true,
                    start: key.x0||0,
                    end: key.x1||100,
                    xAxisIndex: [0]
                },
                {
                    type: 'inside',
                    realtime: true,
                    xAxisIndex: [0]
                }
            ],
            grid: {
                left: "12%",
                top: "5%",
                // bottom:'40%',
                right: "10%"
            },
            xAxis: {
                type: 'category',
                axisTick: {
                    show: false
                },
                splitLine: {
                    show: false
                },
                splitArea: {
                    show: false
                },
                data: name
            },
            yAxis: {
                splitLine: {
                    show: false
                },
                splitArea: {
                    show: false
                },
                type: 'value',
                axisLabel: {
                    formatter: function (value, index) {
                        return value
                    }
                },
                min: min_y,
                axisTick: {
                    show: false
                }
            },
            tooltip: {
                position: ['50%', '50%'],
                formatter: function (param) {

                    return [param.name + '的' + param.seriesName + ': ',
                        '上限(max): ' + param.data[4].toFixed(2),
                        '上四分位(Q3): ' + param.data[3].toFixed(2),
                        '中位数(Q2): ' + param.data[2].toFixed(2),
                        '下四分位(Q1): ' + param.data[1].toFixed(2),
                        '下限(min): ' + param.data[0].toFixed(2)
                    ].join('<br/>');
                }
            },
            series: [
                {
                    type: "boxplot",
                    name:hum[select_hum].name,
                    layout: "vertical",
                    data: data,
                    boxWidth: [15, 40],
                    itemStyle: {
                        normal: {
                            borderColor: hum[select_hum].color
                        }
                    }
                }
            ]
        };

        if (chart) {
            chart.setOption(option,true);
        }else{
            my_chart.setOption(option,true);
        }
        $(window).on('resize', function () {
            my_chart.resize();
        });
    }

    function createAlert($title,myChart,fn){
        createBody();

        var option=myChart.getOption(),
            $data_scroll=$('#data_scroll'),
            $showBox=$data_scroll.find('.cover,.showBox'),
            $echartsArea=$showBox.find('.echartsArea'),
            $humiture_switch=$showBox.find('.humiture_switch'),
            $timeInput=$showBox.find('input'),
            name,time;

            $showBox.find('.button').unbind('click');
            $humiture_switch.find('li').unbind('click');

        $showBox.css('display','block');
        $timeInput.val('').click(function(){
            laydate({istime: true, format: 'YYYY-MM-DD hh:mm:ss'});
        });

        //弹出框echarts图
        var myChart=echarts.init($echartsArea[0]);
        myChart.setOption(option);

        //title名字设置
        $showBox.find('.title :last').html($title.parent().children('span').html());

        //关闭按钮
        $showBox.find('.close').click(function(){
            $showBox.remove();
        });

        //根据时间获得数据
        $showBox.find('.button').bind('click',function(){
        	var startTime=$timeInput.eq(0).val();
        	var endTime=$timeInput.eq(1).val();
        	if(!startTime||!endTime){
        		alert('起止时间不能为空');
        		return;
        	}
            time=startTime+','+endTime;
            if (time==',') {time=''};
            fn(name,myChart,time);
        });

        $(window).bind('resize',function(){
            myChart.resize();
        });

        $humiture_switch.css('display','block');

        //确定给哪个span加'active'
        var index;
        $title.find('.humiture_switch li').each(function(i){
            if ($(this).attr('class')=='active') {
                index=i;
                name=$(this).attr('data-hum');
            }
        });

        $humiture_switch.find('li').eq(index).addClass('active').siblings().removeClass('active');

        //span点击切换数据
        $humiture_switch.find('li').click(function(){
            $(this).addClass('active').siblings().removeClass('active');
            name=$(this).attr('data-hum');
            fn(name,myChart,time);
        });
    }

    function createBody(){
        $('#data_scroll').append(
        '<div class="showBox">'+
            '<p class="title"><span class="close"></span><span></span></p>'+
            '<div class="wrapper">'+
                '<div class="time_box">'+
                    '<span>起止时间</span>'+
                    '<input placeholder="请输入日期" class="laydate-icon">'+
                    '<input placeholder="请输入日期" class="laydate-icon">'+
                    '<div class="button">确定</div>'+
                '</div>'+
            '</div>'+
            '<div class="echartsArea"></div>'+
            '<ul class="humiture_switch"><li data-hum="temperature">温度</li><li data-hum="humidity">湿度</li></ul>'+
        '</div>'+
        '<div class="cover"></div>');
    }
});

