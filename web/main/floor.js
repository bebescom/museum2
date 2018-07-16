define('main/floor', function(require, exports, module) {
// 
// 
// 
// 
// 

var vm;
var router = require('common/router');

exports.open = function (env_no, floor_no) {

    if ($('#win_floor')[0]) {
        if (floor_no) {
            if (!select_floor_no(floor_no)) {
                return;
            }
        }
        return;
    }

    $.get('/2.2.05_P001/base_api/base/envs/info/' + env_no+'', function (data) {

        require('common/win').open({
            id: 'win_floor',
            title: data.name + '-楼层选择',
            width: '80%',
            height: '90%',
            url: 'floor.html',
            onComplete: function () {
                init(data, floor_no);
            }
        });

    });

};
var key=0;
function init(parent, floor_no) {

    vm = exports.vm = new Vue({
        el: '#win_floor',
        data: {
            parent_env_no: parent.env_no,
            parent_name: parent.name,
            floor_name: '',
            floor_list: [],
            floor_index: -1,
            floor_env_no: ''
        },
        methods: {
            select_floor: function (index) {
                this.floor_index = index;
                scroll_img();
                show_info();
                router.path('/floor/' + parent.env_no + '/' + this.floor_env_no);
            },
            prev_floor: function () {
                if (this.floor_index > 0) {
                    this.floor_index--;
                    this.select_floor(this.floor_index);
                }

            },
            next_floor: function () {
                if (this.floor_index < this.floor_list.length - 1) {
                    this.floor_index++;
                    this.select_floor(this.floor_index);
                }
            },
            removeBg:function(){
                key++;
                $('#floor_ul').css('background','none');
                if (key==this.floor_list.length) {
			        if (floor_no) {
			            if (!select_floor_no(floor_no)) {
			                return;
			            }
			        }
			        this.select_floor(this.floor_list.length > 1 ? 1 : 0);
                    key=0;
                }
            }
        },
        init: function () {
            getFloorList(parent, floor_no);
        }
    });

}

function getFloorList(parent, floor_no) {

    $.get('/2.2.05_P001/base_api/base/envs/tree/' + parent.env_no+'', function (data) {

        if (!data['children'] || data.children == 0) {
            console.error('楼层为空');
            return;
        }

        vm.$set('floor_list', data.children.reverse());

    }, 'json');

}

function select_floor_no(floor_no) {

    var _index = _.findIndex(vm.floor_list, function (row) {
        return row.env_no == floor_no;
    });
    if (_index > -1 && _index != vm.floor_index) {
        vm.select_floor(_index);
        return false;
    }
    return true;
}

function scroll_img() {

    var top = 0;
    if(vm.floor_index ==vm.floor_list.length-1){
    	top = '-' + (30 * (vm.floor_index - 2)) + '%';
    }else if (vm.floor_index > 1) {
        top = '-' + (30 * (vm.floor_index - 1)) + '%';
    }

    $('#floor_ul').animate({top: top})

}

function show_info() {
    $('#env_basic').css('background','none');
    $('#relic_basic').css('background','none');
    $('#sensor_basic').css('background','none');
    var row = vm.floor_list[vm.floor_index];

    vm.$set('floor_env_no', row.env_no);
    vm.$set('floor_name', row.name);

    $.get('/2.2.05_P001/base_api/base/envs', {parent_env_no: row.env_no}, function (data) {
        draw_hall(row.env_no, data);
    }, 'json');

	var env_chart=showLoad($('#env_basic')[0]);
    $.get('/2.2.05_P001/base_api/env/environments/floor/floor_halls/' + vm.floor_env_no+'', function (data) {
    	env_chart.hideLoading();
        env_basic(data,env_chart);
    }, 'json');

	var relic_chart=showLoad($('#relic_basic')[0]);
    $.get('/2.2.05_P001/base_api/relic/relics/count/relics_level/' + vm.floor_env_no+'', function (data) {
    	console.log(data)
    	var num=0;
    	relic_chart.hideLoading();
        var series_data=[];
        for(var i in data){
        	series_data.push({value:data[i],name:i});
        	num+=data[i];
        }
		if(num==0){
			$('#relic_basic+.tips').show();
			return;
		}
        relic_basic(series_data,relic_chart);
    }, 'json');

	var sensor_chart=showLoad($('#sensor_basic')[0]);
    $.get('/2.2.05_P001/base_api/env/environments/floor/floor_equips/' + vm.floor_env_no+'', function (data) {
    	sensor_chart.hideLoading();
    	sensor_basic(data,sensor_chart);
    }, 'json');


}

function showLoad(who){
	var my_chart = echarts.init(who);
	my_chart.showLoading('default',{
        color:'#5A9E6D',
        text:'正在努力加载ing...',
        textColor:'#5A9E6D',
        maskColor:'rgba(255, 255, 255, 0.4)'
    });
	return my_chart;
}

function env_basic(data,my_chart) {
	if(!$('#env_basic')[0]){
		return;
	}
    var y_data = [], series_data = [];

    var color = ['#c5bc79', '#ff8d30', '#5a9e6d', '#fd4444', '#c23531', '#2f4554', '#61a0a8', '#d48265', '#91c7ae',
        '#749f83', '#ca8622', '#bda29a', '#6e7074', '#546570', '#c4ccd3'];
    var color_i = 0;

    function get_color() {
        if (color_i >= color.length) {
            color_i = 0;
        }
        return color[color_i++];
    }
    _.each(data, function (row, env_no) {
        if (row && row['name']) {
        	if(row.rate){
            	y_data.push(row.name);
            	series_data.push({value: row.rate, itemStyle: {normal: {color: get_color()}}});
            }
        }
    });
    var str='';
	if(data=='[]'||series_data.length==0){
		str='暂无数据';
	}else{
		str='{b0} : </br>微环境达标率为{c0}%';
	}
	
    var option = {
        title: {
            text: '环境概况',
            textStyle: {
                color: '#141414',
                fontSize: 18,
                fontWeight: 400
            },
            left: '2%',
            top: '0%'
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            },
            formatter: str
        },
        grid: {
            show: false,
            left: '20%',
            top: '20%',
            bottom: '1%'
        },
        xAxis: {
            type: 'value',
//	        axisLine: {show:false},
            axisTick: {show: false},
            axisLabel: {show: false},
            splitLine: {show: false},
            nameGap: 5,
            max: 100,
            nameTextStyle: {
                color: '#8a8a89',
                fontSize: 12
            }
        },
        yAxis: {
            type: 'category',
            data: y_data,
            nameGap: 5,
            nameTextStyle: {
                color: '#9c9c96',
                fontSize: 14
            },
            axisTick: {
                show: false
            },
            axisLabel: {
                textStyle: {
                    color: '#828282',
                    fontSize: 12
                }
            },
            splitLine: false
        },
        series: [
            {
                type: 'bar',
                // barWidth:'5',
                label: {
                    normal: {
                        show: true,
                        position: 'right',
                        formatter: '{c}%'
                    }
                },
                barWidth: 14,
                data: series_data
            }
        ]
    };

    my_chart.setOption(option);
    $(window).on('resize', function () {
        my_chart.resize();
    });
}

function relic_basic(series_data,my_chart) {
	if(!$('#relic_basic')[0]){
		return;
	}

    var option = {
        title: {
            text: '文物概况',
            textStyle: {
                color: '#141414',
                fontSize: 18,
                fontWeight: 400
            },
            left: '2%',
            top: 0
        },
        tooltip: {
            formatter: '{b} : {c}件'
        },
        series: [
            {
                name: '概况',
                type: 'pie',
                radius: '70%',
                center: ['50%', '50%'],
                data: series_data,
                itemStyle: {
                    emphasis: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }
        ]
    };
    my_chart.setOption(option);
    $(window).on('resize', function () {
        my_chart.resize();
    });
}

function sensor_basic(data,my_chart) {
	if(!$('#sensor_basic')[0]){
		return;
	}

    var y_data = [], monitor_data = [], control_data = [], net_data = [];


    _.each(data, function (row, key) {
        if (key == 'total') {
            return;
        }
        if (row && row['name']) {
            y_data.push(row.name);
            monitor_data.push(row['监测设备']);
            control_data.push(row['调控设备']);
            net_data.push(row['网络设备']);
        }

    });


    var option = {
        title: {
            text: '设备概况',
            textStyle: {
                color: '#141414',
                fontSize: 18,
                fontWeight: 400
            },
            left: '2%',
            top: 0
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
            }
        },
        legend: {
            right: 0,
            top: '5%',
            data: ["监测设备", "调控设备", "网络设备"],
            formatter: function (name) {
                return name + '' + data.total[name] + '个';
            }
        },
        grid: {
            show: false,
            left: '20%',
            top: '20%',
            bottom: '1%'
        },
        xAxis: {
            type: 'value',
            splitLine: false
        },
        yAxis: {
            type: 'category',
            data: y_data,
            nameGap: 5,
            nameTextStyle: {
                color: '#9c9c96',
                fontSize: 14
            },
            axisTick: {
                show: false
            },
            axisLabel: {
                textStyle: {
                    color: '#828282',
                    fontSize: 12
                }
            },
            splitLine: false
        },
        series: [
            {
                name: "监测设备",
                type: 'bar',
                stack: "设备",
                data: monitor_data,
                itemStyle: {
                    normal: {
                        color: 'rgb(118,173,66)'
                    }
                },
                label: {
                    normal: {
                        show: true,
                        position: 'inside'
                    }
                }
            },
            {
                name: "调控设备",
                type: 'bar',
                stack: "设备",
                data: control_data,
                itemStyle: {
                    normal: {
                        color: 'rgb(145,199,175)'
                    }
                },
                label: {
                    normal: {
                        show: true,
                        position: 'inside'
                    }
                }
            },
            {
                name: "网络设备",
                type: 'bar',
                stack: "设备",
                data: net_data,
                barWidth: 24,
                itemStyle: {
                    normal: {
                        color: 'rgb(68,151,112)'
                    }
                },
                label: {
                    normal: {
                        show: true,
                        position: 'inside'
                    }
                }
            }
        ]
    };
    my_chart.setOption(option);

    $(window).on('resize', function () {
        my_chart.resize();
    });

}

function draw_hall(env_no, data) {
    if (!data['rows']) {
        return;
    }
    $('#floor_ul svg').html('');
    var $svg = $('#floor_svg_' + env_no);
    $svg.width($svg.siblings('img').width());
    var polygon_html = '';
    _.each(data.rows, function (row) {
        if (!row['locate'] || row.locate == '') {
            return;
        }
        var locate;
        try {
            locate = $.parseJSON(row.locate);
        } catch (e) {
            console.error(e, row.locate);
            return;
        }

        var svg_data = [];
        if (!locate || !locate.area || !locate.width) {
            return;
        }
        _.each(locate.area, function (v) {
            var points = v.split(',');
            points[0] = $svg.width() * points[0] / locate.width;
            points[1] = $svg.height() * points[1] / locate.height;
            svg_data.push(points[0].toFixed(0) + ',' + points[1].toFixed(0));
        });
        var style = [];
        if (locate['color']) {
            style.push('fill: ' + locate['color'] + ';');
        }
        if (style.length > 0) {
            style = " style='" + style.join('') + "'";
        }

        polygon_html += "<polygon data-title="+row.name+" data-no='" + row.env_no + "' points='" + svg_data.join(" ") + "' " + style + ">" +
            "</polygon>";
    });
    $svg.html(polygon_html);

    $svg.find('polygon').hover(function () {
        $(this).css('fill-opacity', 0.5);
    }, function () {
        $(this).css('fill-opacity', 0);
    }).click(function (e) {
        var $this = $(this), no = $this.attr('data-no');
        location.href = '../hall?env_no=' + no;
    });

    $(window).on('resize', function () {
        draw_hall(env_no, data);
    });
}
});