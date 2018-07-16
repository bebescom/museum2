define('common/detail/common', function(require, exports, module) {
//
//
//
//
//
//

var vm = new Vue({});

//获取参数单位名称
var param_unit_name = window.web_config.param_unit_name.sensor;

//确定drag是否显示
function dragUse(drag, array) {
    if (array.length > 6) {
        drag.style.display = 'block';
    } else {
        drag.style.display = 'none';
    }
    $(drag).parent().css('height', '138px');
}

//往下展开列表
function drag_down(drag, key) {
    var a = parseInt($(this).prev().css('height'));
    if (!key) {
        $(this).parent().animate({'height': 63 + a + 'px'});
    } else {
        $(this).parent().animate({'height': '138px'});
    }
}


exports.equip_relic=function(env_no,vm){
    //同柜文物,:env_no为展柜编号
    drag();
    $.get('/2.2.05_P001/base_api/env/environments/cabinet/relics/' + env_no+'', function (data) {
        if(data.error){
            vm.$Message.error(data.error);
            return;
        }
        if (data.total==0) {
            // $('.relic_equip.one').css('display','none');
            return;
        }
        $('.relic_equip.one').show();
        var rows=data.rows;
        filter_relic(rows);
        vm.relic_list=rows;
        vm.all_relic=rows;
    });
    //同柜文物-end

    //柜内设备-start
    $.get('/2.2.05_P001/base_api/env/environments/cabinet/equips/' + env_no+'', function (data) {
        if(data.error){
            vm.$Message.error(data.error);
            return;
        }
        if (data.controller.total+data.sensor.total==0) {
            // $('.relic_equip.two').css('display','none');
            return;
        }
        $('.relic_equip.two').show();
        var controller=data.controller.rows;
        var sensor=data.sensor.rows;
        vm.all_controller=controller;
        vm.controller=controller;
        vm.all_sensor=sensor;
        vm.sensor=sensor;

        filter_equip(controller,'controller');
        filter_equip(sensor,'sensor');
    });
    //柜内设备-end

    function filter_relic(rows){  //填补filter框
        var material=[],age=[],category=[];
        for(var i=0,len=rows.length;i<len;i++){
            if(material.indexOf(rows[i].material)==-1){
                material.push(rows[i].material);
            }
            if(category.indexOf(rows[i].age)==-1){
                age.push(rows[i].age);
            }
            if(category.indexOf(rows[i].category)==-1){
                category.push(rows[i].category);
            }
        }
        vm.relic={
            material:material,
            age:age,
            category:category
        };
    }
    function filter_equip(rows,type){  //填补filter框
        var row=[];
        for(var i=0,len=rows.length;i<len;i++){
            if(row.indexOf(rows[i].equip_type)==-1){
                row.push(rows[i].equip_type);
            }
        }
        vm.$set('equip.'+type,row);
    }

    function drag(){
        $('.filter .font').click(function(e){
            e.stopPropagation();
        }).hover(function(){
            $(this).find('ul').css('display','block').animate({'height':$(this).find('li').size()*23});
        },function(){
            $(this).find('ul').stop().animate({'height':0},function(){
                $(this).css('display','none');
            });
        });
    }
};

//展柜位置图,展柜编号
exports.cabinet_position_image = function (env_no) {
    $.get("/2.2.05_P001/base_api/base/envs/position_image/" + env_no+"", function (data) {
        if(data.error){
            vm.$Message.error(data.error);
            return;
        }
        if (!data || !data['url']) {
            $('.left .position').css('display','none');
            return;
        }
        var img = new Image();
        img.src = data.url;
        img.onload = function () {
            $('.position').append(this);
        }
    }, 'json');
};

// 展柜内部位置图
exports.cabinet_show_image = function (env_no) {
    $.get("/2.2.05_P001/base_api/base/envs/show_image/" + env_no+"", function (data) {
        if(data.error){
            vm.$Message.error(data.error);
            return;
        }
        var $roomView = $('.roomView'),
            $barnar = $roomView.find('.barnar'),
            $imgArr = data.images,
            $leftNav = $roomView.find('.leftNav'),
            $rightNav = $roomView.find('.rightNav'),
            timer;
        if (!_.isArray($imgArr)) {
            $('.left .roomView').css('display','none');
            return;
        }
        for (var i = 0; i < $imgArr.length; i++) {
            $barnar.append('<img src="' + $imgArr[i] + '">');
        }

        $barnar.css('width', $imgArr.length * 330);
        (function () {
            var i = 0;
            $rightNav.click(function () {
                i--;
                i = i % ($imgArr.length);
                $barnar.animate({'left': i * 330});
            });
            $leftNav.click(function () {
                i++;
                if (i > 0) {
                    i = (-$imgArr.length + 1)
                }

                $barnar.animate({'left': i * 330});
            });

            function start() {
                i--;
                i = i % ($imgArr.length);
                $barnar.animate({'left': i * 330});
                timer = setTimeout(start, 2000);
            }

            start();
            $roomView.mouseover(function () {
                clearTimeout(timer);
            }).mouseleave(function () {
                start();
            });
        })();
    });
};

//微环境监控-start
function showLoad(myChart){
    myChart.showLoading('default',{
        color:'#5A9E6D',
        text:'正在努力加载ing...',
        textColor:'#5A9E6D',
        maskColor:'rgba(255, 255, 255, 0.4)'
    });
}

var new_data_api,sel_param_list=[];
exports.chart_new_data = function (env_no, equip_no,vm) {
	new_data_api = '/2.2.05_P001/base_api/env/environments/cabinet/new_data/' + env_no+'';
    if (equip_no) {
    	new_data_api = '/2.2.05_P001/base_api/env/equipments/new_data/' + equip_no+'';
    }
    var myChartArea = echarts.init($('.monitor .echartsArea')[0]);
    $('.echartsArea').css('background','none');
    showLoad(myChartArea);
    var $view = $('.monitor .view');
    //请求环境下的左侧复选框参数
    $.get(new_data_api, function (data) {
        if(data.error){
            vm.$Message.error(data.error);
            return;
        }
        console.log(data);
		myChartArea.hideLoading();
		var count=0;
        for (var i in data) {
        	count++;
            if (param_unit_name[i]) {
                // console.log(data[i].value);
                var value = Math.round(data[i].value);
                $view.append('<label><input data-key="' + i + '" type="checkbox" />' +
                    '<p>' + param_unit_name[i].name + ' : <span>' + value + (data[i].unit||'') + '</span></p>' +
                    '</label>');
            }
        }
		if(count>6){
			$view.addClass('active');
		}else{
			$view.removeClass('active');
		}
        create_chart();//创建echarts框架

        $('.diy_date button').on('click', function () {
            getLine();
        });
        $('.monitor .chooceTime>span').on('click', function () {
            $(this).addClass('ower').siblings().removeClass('ower');
            var timeL = $(this).attr('data-time');
            var $diy = $('.chooceTime .diy'),
                $diy_date = $('.diy_date');
            if (timeL == 'diy') {
                if ($('#start_date').val() == '') {
                    $('#start_date').val(laydate.now('-30'));
                    $('#end_date').val(laydate.now());
                }
                $diy_date.css({left: $diy.position().left, top: $diy.position().top}).show();
            } else {
                getLine(timeL);
                $diy_date.hide();
            }
            reset();
        });

        sel_param_bind();//绑定选择参数事件
        $view.find('input:first').click();
        
        function reset(){
	    	$.get(new_data_api, function (data) {
	    		$view.html('');
	    		var check;
	    		var count=0;
		        for (var i in data) {
		        	count++;
		        	if(sel_param_list.indexOf(i)!=-1){
		        		check='checked';
		        	}else{
		        		check='';
		        	}
		            if (param_unit_name[i]) {
		                $view.append('<label><input '+check+' data-key="' + i + '" type="checkbox" />' +
		                    '<p>' + param_unit_name[i].name+'' + ' : <span>' + data[i].value + (data[i].unit||'') + '</span></p>' +
		                    '</label>');
		            }
		        }
		        if(count>6){
					$view.addClass('active');
				}else{
					$view.removeClass('active');
				}
	      	});
	    }
        reset();
    });

    sel_param_bind=function(){
		$view.bind('click',function(e){
			var element=e.target||e.srcElement;
			if(!element.getAttribute('data-key'))return;
			
			var $this = $(element);
			var data_key=$this.attr('data-key');
			if ($this.is(':checked')) {
                sel_param_list.push(data_key);
            } else {
                if (sel_param_list.length != 1) {
                    var key = sel_param_list.indexOf(data_key);
                    if (key != -1) {
                        sel_param_list.splice(key, 1);
                    }
                } else {
                    $this.prop('checked', 'checked');
                }
            }

            if (sel_param_list.length > 3) {
                var item = sel_param_list.shift();
                $view.find('input').each(function () {
                    if ($(this).attr('data-key') == item) {
                        $(this).prop('checked', '');
                    }
                });
            }
            getLine();
		})
    }

    function getLine(timeL) {
        showLoad(myChartArea);
        // 默认值是'24h'
        var timeL = timeL||vm.$data.timeArr.join(',');
        if (timeL == 'diy') {
            timeL = $('#start_date').val() + ',' + $('#end_date').val();
            if (timeL == ',') {
                return;
            }
        }
        var param_lines_api = '/2.2.05_P001/base_api/env/environments/cabinet/param_lines/' + env_no + '/' + timeL+'',data={};
        if (equip_no) {
            param_lines_api = '/2.2.05_P001/base_api/env/equipments/param_lines/' + equip_no + '/' + timeL+'';
        }

        var search=location.search.slice(1);
        var searchList=search.split('=');
        if(searchList[0]=="relic_no"){
            data.relic_no=searchList[1];
        }

        $('.message').hide();
        $.ajax({
            type: "get",
            dataType: 'json',
            url: param_lines_api,
            data:data,
            success: function (data) {
                myChartArea.hideLoading();
                if(typeof data!='object'){
                	$('.message').show();
                	myChartArea.clear();
                	return;
                }
                var series = [], first_param,key=true;
                _.each(sel_param_list, function (param, i) {
                    if (!data[param]) {
                        return;
                    }
                    if (i == 0) {
                        first_param = param;
                    }
                    data[param].keyName=param;
                    series.push(data[param]);
                    if (data[param].value) {
                        key=false;
                    }
                });
                if(key){
                    if (sel_param_list.length == 1) {
                        one_option(first_param, series[0]);
                    } else {
                    	if(series.length==0){
                    		$('.message').show();
                			myChartArea.clear();
                			return;
                    	}
                        many_option(series);
                    }
                }else{
                    equip_option(series);
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                // console.error(this, arguments);
                vm.$Message.error('数据获取异常');
                // alert('数据获取异常');
            }
        });
    }

    var default_option;

    function create_chart() {
        default_option = {
            tooltip: {
                trigger: 'axis',
            },
            legend: {
                show: false
            },
            dataZoom: [
                {
                    show: true,
                    realtime: true,
                    xAxisIndex: [0]
                },
                {
                    type: 'inside',
                    realtime: true,
                    xAxisIndex: [0]
                }
            ],
            grid: {
                left: 40,
                right: 90,
                top: '15%',
                bottom: '15%'
            },
            xAxis: {
                show: false,
                type: 'time',
                boundaryGap: false,
                axisLabel: {
                    textStyle: {
                        color: "#9fa6ac",
                        fontFamily: "微软雅黑"
                    }
                }
            },
            yAxis: {
                type: 'value',
                axisTick: {
                    show: false
                },
                axisLabel: {
                    show:true,
                    inside: false
                },
                min:'dataMin',
                scale:true
            },
            series: []
        };
        myChartArea.setOption(default_option);
        $(window).bind('resize', function () {
            myChartArea.resize();
        });
    }

    function one_option(param, data) {
        if(!data){
            return;                 //没有数据就return
        }
        if(data.threshold){
            var min=data.threshold.min;
            var max=data.threshold.max;
        }
        var thresholdLine=[];
        min&&thresholdLine.push({yAxis:+min});
        max&&thresholdLine.push({yAxis:+max});

        var unit=data.unit;         //获取单位
        if (!data.max && !data.min && !data.average) {
            data.max = data.value;      //最大值
            data.min = data.value;         //最小值
            data.average = data.value;      //平均值
        }

        if (data.max) {
            data.max = data.max.map(function (val, i) {
                return [val[0],(val[1] - data.min[i][1]).toFixed(2)];       //对最大值进行变化减去最小值,因为减法的不精确，toFixed舍入
            });
        }
        var option = _.clone(default_option);                   //取公共不变化部分
       
        // option.yAxis.max=data.range.max;
        // option.yAxis.min=data.range.min;
       
        option.yAxis.name=data.name;                            //对y轴编号
        option.yAxis.axisLine= {                                //Y轴颜色
                        lineStyle: {
                            color: params_color[data.keyName].color
                        }
                    };
        option.series= [
            {
                showSymbol: false,
                smooth: true,
                name: '最小值',
                type: 'line',
                lineStyle: {normal: {color: '#818d94', opacity: '0'}},
                symbolSize: 6,
                stack: 'tiled',
                data: data.min
            },
            {
                showSymbol: false,
                smooth: true,
                name: '最大值',
                type: 'line',
                lineStyle: {
                    normal: {
                        color: '#818d94',
                        opacity: '0'
                    }
                },
                areaStyle: {
                    normal: {
                        color: '#ccc',
                        opacity: '0.3'
                    }
                },
                symbolSize: 6,
                stack: 'tiled',
                data: data.max
            },
            {
                showSymbol: false,
                smooth: true,
                name: '平均值',
                type: 'line',
                lineStyle: {normal: {color: params_color[param].color || '#818d94'}},
                itemStyle: {normal: {color: params_color[param].color || '#818d94'}},
                symbolSize: 6,
                data: data.average,
                markLine: {
                    silent: true,
                    data: thresholdLine
            	}
            }
        ];
        option.tooltip.formatter=function(params){
            var str=data+'<br/>';
            var date = new Date(params[0].value[0]);
            data = date.getFullYear() + '-'
                   + (date.getMonth() + 1) + '-'
                   + date.getDate() + ' '
                   + date.getHours() + ':'
                   + date.getMinutes();

            for(var i=0;i<3;i++){
                var vaule=params[i].value[1];
                if(i==1){
                    vaule=(Number(params[1].value[1])+Number(params[0].value[1])).toFixed(2);       //还原max真实数据
                }
                str += params[i].seriesName+':'+ vaule+unit+'</br>';
            }
            return str;
        };
        myChartArea.setOption(option,true);
    }

    function many_option(datas) {
		var key=0,
            unit=[],
        	option = _.clone(default_option);
        	
        option.series = [];
        option.yAxis=[];
        _.each(datas, function (data) {
            var position='';
            if(key!=0){
                position='right'
            }
            if (!data.average) {
                data.average = data.value;
            }
            option.series.push({
                showSymbol: false,
                smooth: true,
                name: data.name,
                type: 'line',
                lineStyle: {normal: {color: params_color[data.keyName].color}},
                itemStyle: {normal: {color: params_color[data.keyName].color}},
                symbolSize: 6,
                data: data.average,
                yAxisIndex:key
            });
            unit.push(data.unit);
            option.yAxis.push({
                type: 'value',
                name:data.name,
                min:'dataMin',
                axisLine: {
                    lineStyle: {
                        color: params_color[data.keyName].color
                    }
                },
                position:position,
                offset: (key!=0)?50*(key-1):0,
                splitLine:{show:(key!=0)?false:true}
            });

            key++;
        });
        option.tooltip.formatter=function(params){
            var str='';
            for(var i=0;i<key;i++){
                var date = new Date(params[i].value[0]);
                data = date.getFullYear() + '-'
                       + (date.getMonth() + 1) + '-'
                       + date.getDate() + ' '
                       + date.getHours() + ':'
                       + date.getMinutes();
                str += data+'<br/>'
                       + params[i].seriesName+':'+ params[i].value[1]+unit[i]+'</br>';
            }
            return str;
        };
        myChartArea.setOption(option, true);
    }

    function equip_option(datas){
        var key=0,
            unit=[],
            option = _.clone(default_option);
        
        option.yAxis=[];
        option.series = [];
        _.each(datas, function (aldata) {
            var position='';
            if(key!=0){
                position='right'
            }
            var value=aldata.value;
        	var arr=[];
	        for(var j in value){
	        	arr=arr.concat(value[j])
	        }
        	
        	
            option.series.push({
                showSymbol: false,
                smooth: true,
                name: aldata.name,
                type: 'line',
                lineStyle: {normal: {color: params_color[aldata.keyName].color}},
                itemStyle: {normal: {color: params_color[aldata.keyName].color}},
                symbolSize: 6,
                data: arr,
                yAxisIndex:key
            });
            unit.push(aldata.unit);
            option.yAxis.push({
                type: 'value',
                name:aldata.name,
                min:'dataMin',
                axisLine: {
                    lineStyle: {
                        color: params_color[aldata.keyName].color
                    }
                },
                position:position,
                offset: (key!=0)?50*(key-1):0,
                splitLine:{show:(key!=0)?false:true}
            });
            key++;
        });
        
        option.tooltip.formatter=function(params){
            var str='';
            for(var i=0;i<key;i++){
                var date = new Date(params[i].value[0]);
                data = date.getFullYear() + '-'
                       + (date.getMonth() + 1) + '-'
                       + date.getDate() + ' '
                       + date.getHours() + ':'
                       + date.getMinutes();
                str += data+'<br/>'
                       + params[i].seriesName+':'+ params[i].value[1]+unit[i]+'</br>';
            }
            return str;
        };
        myChartArea.setOption(option, true);
    }
};
//微环境监控-end

//仪表盘和雷达图-start
exports.echarts_gauge_radar = function (env_no,vm) {
    // console.log(vm.$data.timeArr.join(','));
    var myChartGauge = echarts.init($('.echartsGauge')[0]);
    $('.echartsGauge').css('background','none');
    create_gauge();//创建chart
    get_gauge_data();

    function get_gauge_data(timeL) {
        //echarts图标显示loading
        showLoad(myChartGauge);
        //默认时间不传入时显示'24h'
        timeL = timeL || vm.$data.timeArr.join(',');
        // //如果选择时间方式为自定义
        // if (timeL == 'diy') {
        //     if (!$('#start_date')[0]) {
        //         //如果自定义起始时间
        //         this.$Message.error('起始时间错误!');
        //         return;
        //     }
        //     timeL = $('#start_date').val() + ',' + $('#end_date').val();
        //     if (timeL == ',') {
        //         return;
        //     }
        // }
        myChartGauge.setOption({
            series: [{
                data: [{value: 0, name: '达标率'}]
            }]
        });
        $.get('/2.2.05_P001/base_api/env/environments/cabinet/standard/' + env_no + '/' + timeL+'', function (data) {
            myChartGauge.hideLoading();
            myChartGauge.setOption({
                series: [{
                    data: [{value: data.rate, name: '达标率'}]
                }]
            });
        }, 'json');
    }

    function create_gauge() {
        var option = {
            tooltip: {
                formatter: "{a} <br/>{b} : {c}%"
            },
            series: [
                {
                    name: '环境',
                    center: ['50%', '55%'], 
                    radius: '70%',
                    type: 'gauge',
                    data: [{value: 0, name: '达标率'}],
                    axisTick: {
                        show: false
                    },
                    pointer: {
                        width: 4
                    },
                    axisLine: {
                        lineStyle: {
                            width: 10,
                            color: [[0.6, '#e83428'],[0.8, '#0d6fb8'], [1, '#14ae67']]
                            // color: [[0.2, '#14ae67'], [0.8, '#0d6fb8'], [1, '#e83428']]
                        }
                    },
                    splitLine: {
                        length: 8
                    },
                    detail: {
                        width: 48,
                        height: 17,
                        textStyle: {
                            fontSize: 14
                        },
                        formatter: '{value}%',
                        offsetCenter: [0, '23%']
                    },
                    title: {
                        textStyle: {
                            color: '#9fa6ac',
                            fontSize: 12
                        }
                    }
                }
            ]
        };
        myChartGauge.setOption(option);

    }

    var myChartRadar = window['myChartRadar'] = echarts.init($('.echartsRadar')[0]);
    get_radar_data();
    function get_radar_data(timeL) {
        showLoad(myChartRadar);
        timeL = timeL || vm.$data.timeArr.join(',');
        // if (timeL == 'diy') {
        //     if (!$('#start_date')[0]) {
        //         return;
        //     }
        //     timeL = $('#start_date').val() + ',' + $('#end_date').val();
        //     if (timeL == ',') {
        //         return;
        //     }
        // }

        $.get('/2.2.05_P001/base_api/env/environments/cabinet/param_standard/' + env_no + '/' + timeL+'', function (data) {
    		create_radar(data);
            myChartRadar.hideLoading();
            var a = [];
            for (var i in data) {
                a.push(data[i]);
            }

            myChartRadar.setOption({
                series: [{
                    data: [{value: a, name: '参数达标率 : '}]
                }]
            });
        }, 'json');
    }

    function create_radar(data) {
        var option = {
            tooltip: {
                trigger: 'item'
            },
            radar: [
                {
                    center: ['50%', '50%'],
                    indicator: (function(){
                    	var a=[];
                    	for (var i in data) {
			                a.push({text: changeName[i], max: 100});
			            }
                    	return a;
                    })(),
                    axisLine: {
                        lineStyle: {
                            width: 2
                        }
                    },
                    radius: 80
                }
            ],
            series: [
                {
                    type: 'radar',
                    areaStyle: {
                        normal: {
                            color: 'green',
                            opacity: '0.3'
                        }
                    },
                    itemStyle: {
                        normal: {
                            color: '#72828d'
                        }
                    },
                    data: []
                }
            ]
        };
        
        myChartRadar.setOption(option);
        
        $('.echartsRadar').css('background','none');
    }

    //温湿度稳定性-start
    function get_stable(timeL) {
        timeL = timeL || vm.$data.timeArr.join(',');
        // if (timeL == 'diy') {
        //     if (!$('#start_date')[0]) {
        //         return;
        //     }
        //     timeL = $('#start_date').val() + ',' + $('#end_date').val();
        //     if (timeL == ',') {
        //         return;
        //     }
        // }

        $.get('/2.2.05_P001/base_api/env/environments/cabinet/stable/' + env_no + '/' + timeL+'', function (data) {
            var _lineView = $('.diyLine .lineView');
            var _word = $('.diyLine .word');

            _lineView.find('.temperature span').css('width', 10*data.temperature + '%');
            _lineView.find('.humidity span').css('width', 10*data.humidity + '%');

            _word.find('.temperature').html(data.temperature);
            _word.find('.humidity').html(data.humidity);
        }, 'json');
    }

    get_stable();

    //温湿度稳定性-end

    //为时间选择控件绑定事件
    // $('.monitor .chooceTime>span').bind('click', function () {
    //     //如果点击的是自定义按钮,则返回
    //     if($(this).attr('class')=='diy'){
    //         return;
    //     }
    //     var timeL = $(this).attr('data-time');
    //     get_gauge_data(timeL);
    //     get_radar_data(timeL);
    //     get_stable(timeL);
    // });
    //点击自定义时间下的确定按钮
    // $('.diy_date button').on('click', function () {
    //     var timeL='';
    //     get_gauge_data(timeL);
    //     get_radar_data(timeL);
    //     get_stable(timeL);
    // });
    $(window).bind('resize', function () {
        if (myChartGauge) {
            myChartGauge.resize();
        }
        if (myChartRadar) {
            myChartRadar.resize();
        }
    });
    
    
};

//仪表盘和雷达图-end

$('body').tooltip({key:true});

var changeName={
	co2:'co2',
	humidity:'湿度',
	inorganic:'无机',
	organic:'有机',
	sulfur:'含硫',
	temperature:'温度'
};


var params_color = {
    temperature: {color: '#3db38c'},
    humidity: {color: '#2495ff'},
    voc: {color: '#ae9a2e'},
    co2: {color: '#99351f'},
    light: {color: '#ff9000'},
    uv: {color: '#ff5fdb'},
    organic:{color: '#677c0e'},
	inorganic:{color: '#94b046'},
	sulfur:{color: '#b6bf8e'},
	soil_humidity:{color: '#b24d08'},
	soil_temperature:{color: '#b5733c'},
	soil_conductivity :{color: '#8c6239'},
	broken:{color: '#ed1e79'},
	vibration :{color: '#6c3cd9'},
	multi_wave:{color: '#a415ff'}
};

});