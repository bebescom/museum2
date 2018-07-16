define('data.async/env_param', function (require, exports) {

    var select_hum = 'temperature',
        my_chart,
        $right,
        hum = {
            temperature: {title: '温\n度', name: '温度', color: '#3CB38B'},
            humidity: {title: '相\n对\n湿\n度', name: '湿度', color: '#2595FB'}
        };
    var $data_env_param;
    exports.init = function () {
        $data_env_param=$('#data_env_param');
        $right=$data_env_param.find('.right');
        $right.append('<ul class="humiture_switch">' +
            '<li class="active" data-hum="temperature">温度</li>' +
            '<li data-hum="humidity">湿度</li>' +
            '</ul>');
        $data_env_param.find('.box').append('<div id="env_param_chart" style="height: 180px;"></div>');

        my_chart = echarts.init($('#env_param_chart')[0]);

        getData(null,null,keyaa);

        $data_env_param.find('.humiture_switch li').click(function () {
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

        $.get(API('/env/environments/overviews/env_averages/' + select_hum)+'?time='+(time?time:''), function (data) {
            console.log(API('/env/environments/overviews/env_averages/' + select_hum))
            $data_env_param.css('background','#F5F2DE').find('.box').css('opacity','1');
            if (data=='[]') {
                $data_env_param.find('.right').children().unbind();
                $data_env_param.find('.box').html('暂无数据').css({'text-center':'center','line-height':175});
                return;
            }
            var chart_data = {min: [], max: [], avg: []};
            chart_data.min = data.min;
            chart_data.x_data = data.time;
            chart_data.max = data.max;
            chart_data.avg = data.average;

            for(var i=0;i<chart_data.max.length;i++){
                chart_data.max[i]=chart_data.max[i]-chart_data.min[i];
            }
            chart_init(chart_data,chart);
            if(fn)fn();
        }, 'json');
    }


    function chart_init(data,chart) {
        var option = {
            color: ['#828E95', '#a3a5ab'],
            grid: {
                left: '5%',
                bottom: '5%',
                width: "90%",
                height: "90%"
            },
            xAxis: {
                show: false,
                data: data.x_data,
                boundaryGap: ['5%', '5%']
            },
            yAxis: {
                type: "value",
                axisLine: {
                    show: false
                },
                axisTick: {
                    show: false
                },
                axisLabel: {
                    margin: 3
                },
                min:'dataMin'
            },
            tooltip: {
                trigger: 'axis',
                formatter: function (params) {
                    return '时间 : ' + params[0].name + '</br>' +
                        '最大值' + ((params[1].value*1+params[0].value*1).toFixed(2) || '') + '</br>' +
                        '平均值' + ((params[2].value*1).toFixed(2)||'') + '</br>' +
                        '最小值' + ((params[0].value*1).toFixed(2) || '');
                },
                position: 'right'
            },
            series: [
                {
                    showSymbol: false,
                    symbolSize: 6,
                    name: "最小值",
                    type: 'line',
                    data: (function(arr){
                        for(var i=0,len=arr.length;i<len;i++){
                            if (arr[i]==null||isNaN(arr[i])) {
                                arr[i]='-';
                            }
                        }
                        return arr;
                    })(data.min),
                    lineStyle: {
                        normal: {
                            color: '#D4D2C4'
                        }
                    },
                    smooth: true,
                    stack: 'confidence-band'
                },
                {
                    showSymbol: false,
                    symbolSize: 6,
                    type: 'line',
                    name: "最大值",
                    data: (function(arr){
                        for(var i=0,len=arr.length;i<len;i++){
                            if (arr[i]==null||isNaN(arr[i])) {
                                arr[i]='-';
                            }
                        }
                        return arr;
                    })(data.max),
                    areaStyle: {
                        normal: {
                            color: "#e0e0e0"
                        }
                    },
                    lineStyle: {
                        normal: {
                            color: '#D4D2C4'
                        }
                    },
                    smooth: true,
                    stack: 'confidence-band'
                },
                {
                    type: 'line',
                    name: "平均值",
                    data: (function(arr){
                        for(var i=0,len=arr.length;i<len;i++){
                            if (arr[i]==null||isNaN(arr[i])) {
                                arr[i]='-';
                            }
                        }
                        return arr;
                    })(data.avg),
                    symbolSize: 7,
                    showSymbol: false,
                    smooth: true,
                    lineStyle: {
                        normal: {
                            color: hum[select_hum].color
                        }
                    }
                }
            ]
        };

        if (chart) {
            chart.setOption(option);
        }else{
            my_chart.setOption(option);
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