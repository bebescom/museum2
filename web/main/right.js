define('main/right', function(require, exports, module) {
// 
// 
// 
// 
// 

var vm;
exports.init = function () {
    vm = exports.vm = new Vue({
        el: '#main_right',
        data: {
            th_btn: 'temperature',
            env_list: [],
            showroom_list: []
        },
        methods: {
            th_change: function () {
                this.th_btn = (this.th_btn == 'temperature') ? 'humidity' : 'temperature';
                getData();
            }
        }
    });

    getData();

    $.get('/2.2.05_P001/base_api/env/environments/homepage/hall_overview', function (data) {
        $('#area_view').css('background','none').bind('mousewheel',function(e){
            e.stopPropagation();
        });
        vm.$set('env_list', data.rows);
        if(data.rows.length<=3){
        	$('#area_view').bind('mousewheel',function(e){
        		e.preventDefault();
        	});
        }else{
        	$('#area_view').css('right','0');
        }
        _area_scroll();
    });
    $.get('/2.2.05_P001/base_api/base/envs/fast_enter', function (data) {

        data.sort(function(a,b){
            return a.sort-b.sort;
        });

        for(var i =0,len=data.length;i<len;i++){
            var array=data[i].children;

            array&&array.sort(function(a,b){
                return a.sort-b.sort;
            });
        }

        vm.$set('showroom_list', data);
        _quick_animate();
    });
};

function getData() {
    var myChart = echarts.init(document.getElementById('my_chart'));
    myChart.showLoading('default',{
        color:'#5A9E6D',
        text:'正在努力加载ing...',
        textColor:'#ccc',
        maskColor:'rgba(255, 255, 255, 0.2)'
    });
    $.get('/2.2.05_P001/base_api/env/environments/homepage/overview_average/' + vm.th_btn+'', function (data) {
        myChart.hideLoading();
        _echarts(data,myChart);
    });
}




function _echarts(opt,myChart) {

    opt = opt || {};
    opt = _.defaults(opt, {
        max: [1],
        min: [1],
        time: [1],
        average: [1],
        unit: '℃'
    });
    opt.time = _.map(opt.time, function (time) {
        var date = new Date(time);
        return date.getHours() + ':' + (date.getMinutes() > 9 ? date.getMinutes() : '0' + date.getMinutes());
    });
    if (vm.th_btn == 'humidity') {
        opt.unit = '%';
    }
    for(var i=0;i<opt.max.length;i++){
        opt.max[i]=opt.max[i]-opt.min[i];
    }

    var options = {
        title: {
            text: '温湿度曲线图',
            textStyle: {
                color: '#5b9d6d',
                fontSize: 16
            },
            right: 10,
            paddding: 5
        },
        color: ['#4f545f', '#a3a5ab'],
        tooltip: {
            trigger: 'axis',
            formatter: function (params) {
                return '时间 : ' + (params[0].name || '') + '<br/>' +
                    '最大值 : ' + ((params[1].value*1+params[0].value*1).toFixed(2) || '') + opt.unit + '<br/>' +
                    '平均值 : ' + ((params[2].value*1).toFixed(2) || '' )+ opt.unit + '<br/>' +
                    '最小值 : ' + ((params[0].value*1).toFixed(2) || '' )+ opt.unit;
            },
            position:function (point, params, dom) {
                // 固定在顶部
                return [point[0]-140, '20%'];
            }
        },
        grid: {
            x: 56,
            y: 73,
            x2: 50,
            y2: 40,
            width: '78.9%',
            height: '50%',
            borderWidth: 1,
            borderColor: '#81878e'
        },
        calculable: false,
        xAxis: [
            {
                show: true,
                type: 'category',
                boundaryGap: false,
                data: opt.time,
                splitLine: {
                    lineStyle: {
                        color: "rgba(0,0,0,0)"
                    }
                },
                axisLabel: {
                    textStyle: {
                        color: "#9fa6ac",
                        fontFamily: "微软雅黑"
                    },
                    margin: 3
                }
            }
        ],
        yAxis: [
            {
                show: true,
                type: 'value',
                scale:true,
                axisLabel: {
                    textStyle: {
                        color: "#9fa6ac",
                        fontFamily: "微软雅黑"
                    }
                },
                splitLine: {
                    lineStyle: {
                        color: "rgba(0,0,0,0)"
                    }
                }
            }
        ],
        series: [
            {
                showSymbol: false,
                name: '最低气温',
                smooth: true,
                type: 'line',
                stack: 'area',
                data:opt.min,
                markPoint: {
                    symbol: 'image://images/right/rgcon1.png',
                    label: {
                        normal: {
                            show: false
                        }
                    },
                    symbolSize: 10,
                    data: [
                        {type: 'min', name: '最小值'}
                    ],
                    tooltip: {
                        formatter: '最小值：{c}'
                    }
                }
            },
            {
                showSymbol: false,
                name: '最高气温',
                smooth: true,
                type: 'line',
                lineStyle: {normal: {color: 'rgba(133,137,145,0.3)'}},
                areaStyle: {
                    normal: {
                        color: 'rgba(133,137,145,0.5)'
                    }
                },
                stack: 'area',
                data: opt.max,
                markPoint: {
                    symbol: 'image://images/right/rgcon1.png',
                    symbolSize: 10,
                    label: {
                        normal: {
                            show: false
                        }
                    },
                    data: [
                        {name: '最大值', type: 'max'}
                    ],
                    tooltip: {
                        formatter: '最大值：{c}'
                    }
                }
            },
            {
                showSymbol: false,
                symbolSize: 6,
                name: '平均值',
                type: 'line',
                data: opt.average,
                lineStyle: {
                    normal: {color: 'rgb(163,166,173)'}
                }
            }
        ]
    };
    myChart.setOption(options);

}

function _area_scroll() {
    var ul = $('#show_data_ul'), drag_area = $('#drag_area'), slider = $('#drag_area_slider'), box = $('#show_data');
    var max_top, max_scrollTop, max_slider, scale;
    var timer = true;

    function init() {
        max_top = ul.height() - box.height();
        max_slider = drag_area.height() - slider.height();
        max_scrollTop = max_top;
        scale = max_slider / max_top;
    }

    box.scroll(function () {
        init();
        var top = box.scrollTop();
        if (top < 0) {
            top = 0;
        }
        if (top > max_top) {
            top = max_top;
        }
        slider.css({top: top * scale});
        return false;
    });

    $('#top_btn').mousedown(function () {
        init();
        var timer;
        function move() {
            var cur = box.scrollTop();//Math.abs(parseInt(ul.css('top')));
            cur--;
            _scroll(cur);
            if (cur >= 0) {
                timer=setTimeout(move, 1);
            }
        }

        move();

        $('#top_btn').one('mouseup',function(){
            clearTimeout(timer);
        });
    });
    $('#bom_btn').mousedown(function () {

        init();
        var timer;
        function move() {
            var cur = box.scrollTop();//Math.abs(parseInt(ul.css('top')));
            cur++;
            _scroll(cur);
            if (cur <= max_top) {
                timer=setTimeout(move, 1);
            }
        }

        move();

        $('#bom_btn').one('mouseup',function(){
            clearTimeout(timer);
        });
    });


    slider.mousedown(function (e) {
        init();
        var old_y = e.clientY;
        var cur = box.scrollTop();//Math.abs(parseInt(ul.css('top')));

        function doc_mousemove(ev) {
            _scroll(cur + (ev.clientY - old_y) / scale);
            ev.stopPropagation();
            return false;
        }

        $(document).bind('mousemove', doc_mousemove);

        $(document).one('mouseup', function () {
            $(document).unbind('mousemove', doc_mousemove);
        });
        e.stopPropagation();
        return false;
    });


    function _scroll(top) {
        if (top < 0) {
            top = 0;
        }
        if (top > max_top) {
            top = max_top;
        }

        //ul.css({top: -1 * top});
        box.scrollTop(top);
        slider.css({top: top * scale});
    }

    init();
}

function _quick_animate() {

    var $showroom_menu=$('#showroom_menu'),
        height=$(window).height();

    $('#quick_into').bind('mousewheel',function(e){
        e.stopPropagation();
    }).hover(function(){
        $showroom_menu.stop().animate({'right':0});
        $showroom_menu.find('>li').hover(function(){
            $(this).find('ol').css('bottom',height-$(this).offset().top-29);
        });
    },function(){
        $showroom_menu.stop().animate({'right':-122});
    });

    $(window).bind('resize',function(){
        height=$(window).height();
    });
}
});