//@require $
//@require _
var vm,
    $svg_map,
    $svg_div;

//获取参数单位名称
var param_unit_name = window.web_config.param_unit_name.sensor;

exports.init = function (env_no, opt) {
    opt = _.defaults(opt, {
        show_small_env: true,
        show_micro_env: true,
        show_network: true,
        show_relic: true,
        svg_map: ''//svg selector
    });
    $svg_map = $(opt.svg_map);
    $svg_div = $(opt.svg_map + '_div');

    vm = exports.vm = new Vue({
        el: '#map_switch',
        data: {
            i: 0,
            show_small_env: opt.show_small_env,
            small_sensor_total: 0,
            small_sensor_list: {},
            small_controller_total: 0,
            small_controller_list: {},
            small_offline_total: 0,
            small_offline_list: {},

            show_micro_env: opt.show_micro_env,
            micro_sensor_total: 0,
            micro_sensor_list: {},
            micro_controller_total: 0,
            micro_controller_list: {},
            micro_offline_total: 0,
            micro_offline_list: {},

            show_network: opt.show_network,
            network_list: {},
            network_total: 0,

            show_relic: opt.show_relic,
            relic_list: {},
            relic_total: 0,
            contrast_no_list: [],
            contrast_no: '',
            configLanguage: window.languages,
        },
        ready: function () {
            localStorage.removeItem('contrast_no_list');
            this.addRightTabContrast();
        },
        methods: {
            show_map: function (legend, type) {
                var $box = $('#' + legend);
                var $icon = $box.find('.type.' + type);
                if (!$icon.hasClass('now')) {
                    $icon.addClass('now');
                    add_point(env_no, legend, type);
                } else {
                    $icon.removeClass('now');
                    remove_point(env_no, legend, type);
                }
                if ($box.find('.type').length == $box.find('.type.now').length) {
                    $box.find('input:checkbox').prop('checked', true);
                } else {
                    $box.find('input:checkbox').prop('checked', false);
                }
            },
            sel_all: function (legend) {
                var $box = $('#' + legend);
                if ($box.find('input:checkbox:checked')[0]) {
                    $box.find('.type').addClass('now');
                    add_all_point(env_no, legend);
                } else {
                    $box.find('.type').removeClass('now');
                    remove_all_point(env_no, legend);
                }
            },
            move: function (e) {
                if ($('.icon_').size() == 0 || this.i != 0) {
                    return;
                }
                this.i++;
            },
            resetName: function (name) {
                return name_list[name];
            },
            addRightTabContrast: function () {//添加右侧清空，对比按钮，并绑定事件
                var text = '开始对比';
                $("#contrast_box .panel-body").append('<div class="contrast_button">' + text + '<span class="contrast_length" ></span></div>' + '<div class="clearAll">清空</div>');//添加设备对比tab中清空按钮
                $(".clearAll").on("click", function () {
                    $(".contrast_panel").remove();
                    $(".panel-body hr").remove();
                    localStorage.removeItem('contrast_no_list');
                    $(".innerList .close").css("display", "none");
                    $(".innerList a").css("color", "#999999");
                    $(".innerList a>h4>span").css("color", "#999999");
                    $(".innerList li").removeAttr('contrast_key');
                    $("i.firstI").css('display', 'none');
                    var divType = $('.left_top_box');
                    divType.each(function () {//全部清空时，隐藏未聚合的svg数量
                        if ($(this)[0].childNodes.length < 4) {
                            var $id = $(this).attr('id');
                            $("div[id=" + $id + "]").find("span.count").css('display', 'none');
                        }
                    });
                    vm.contrast_no_list = [];
                });
                $(".contrast_button").on("click", function () {
                    if (!localStorage.contrast_no_list) {
                        vm.$Message.warning('请选择设备!');
                        return;
                    }
                    var no_list = localStorage.contrast_no_list.split(',');
                    if (no_list.length < 2) {
                        vm.$Message.warning('设备数量小于2,不能进行对比!');
                        return;
                    }
                    window.location.href = '../capsule/#!/environment/environment_details/' + no_list.join(',');
                });
            }
        }
    });

    // $('.sel_all').click();
    $.get(API('/env/environments/legends/legend_classifies/' + env_no), function (data) {
        //权限全局判断
        //设置生成图例和页面同时控制
        if (checkPermissions({name: '设备管理'})) {
            set_small_env(data, opt);			//小环境
            set_micro_env(data, opt);			//微环境
            set_network(data, opt);				//网络设备
        }
        if (checkPermissions({name: '文物管理'})) {
            set_relic(data, opt);				//文物,将文物信息图例进行初始化
        }
        function setTime() {
            // console.log($(".sel_all").eq(0));
            var $sel_all = $(".sel_all[data-init]");
            if ($sel_all.eq(0).prop("checked")) {
                //如果已经被选中,勾选两次
                $sel_all.click();
                $sel_all.click();
                return;
            }
            //初始化时,文物不初始化
            $sel_all.click();
            setTimeout(setTime, 200);
        }
        $(".sel_all[data-init]").prop('checked',true);
        vm.sel_all('small_env');
        vm.sel_all('micro_env');
        vm.sel_all('network');
        // setTime();
    }, 'json');
};
var name_list = {
    co2_sensor: '二氧化碳传感器',
    qcm_sensor: '空气质量传感器',
    lu_sensor: '光照紫外传感器',
    th_sensor: '湿度传感器',
    sth_sensor: '带屏温湿度传感器',
    voc_sensor: '有机挥发物传感器',
    "soil_sensor": "土壤温湿度传感器",
    "security_sensor": "安防传感器",
    "vibration_sensor": "震动传感器",
    "offline_th": "手持式温湿度检测仪",
    "offline_casco": "手持式甲醛检测仪",
    "offline_light": "手持式光照紫外检测仪",
    "offline_co2": "手持式二氧化碳检测仪",
    "offline_voc": "手持式有机挥发物检测仪",
    "cabinet_sensor": "智能展柜传感器",
    hum_machine: '调湿机',
    hum_agent: '调湿剂',
    "nitrogen_controller": "充氮调湿柜",

    repeater: '中继',
    gateway: '网关',

    '一级文物': '一级文物',
    '二级文物': '二级文物',
    '三级文物': '三级文物',
    '一般文物': '一般文物',
    '未设定文物': '未设定文物',
};

function set_network(data, opt) {
    if (!opt.show_network || !data['network']) {
        return;
    }
    if (data.network.total > 0) {
        //筛选剔除total字段
        vm.$set('network_list', _.omit(data.network, 'total'));
        vm.$set('network_total', data.network.total);
    }
}

function set_small_env(data, opt) {
    if (!opt.show_small_env || !data['small_env']) {
        return;
    }
    if (data.small_env.sensor && data.small_env.sensor.total > 0) {
        vm.$set('small_sensor_total', data.small_env.sensor.total);
        vm.$set('small_sensor_list', _.omit(data.small_env.sensor, 'total'));
    }
    if (data.small_env.controller && data.small_env.controller.total > 0) {
        vm.$set('small_controller_total', data.small_env.controller.total);
        vm.$set('small_controller_list', _.omit(data.small_env.controller, 'total'));
    }
    if (data.small_env.offline && data.small_env.offline.total > 0) {
        vm.$set('small_offline_total', data.small_env.offline.total);
        vm.$set('small_offline_list', _.omit(data.small_env.offline, 'total'));
    }
}

function set_micro_env(data, opt) {
    if (!opt.show_micro_env || !data['micro_env']) {
        return;
    }

    if (data.micro_env.sensor && data.micro_env.sensor.total > 0) {

        vm.$set('micro_sensor_total', data.micro_env.sensor.total);
        vm.$set('micro_sensor_list', _.omit(data.micro_env.sensor, 'total'));
    }
    if (data.micro_env.controller && data.micro_env.controller.total > 0) {
        vm.$set('micro_controller_total', data.micro_env.controller.total);
        vm.$set('micro_controller_list', _.omit(data.micro_env.controller, 'total'));
    }
    if (data.micro_env.offline && data.micro_env.offline.total > 0) {
        vm.$set('micro_offline_total', data.micro_env.offline.total);
        vm.$set('micro_offline_list', _.omit(data.micro_env.offline, 'total'));
    }

}

function set_relic(data, opt) {
    if (!opt.show_relic || !data['relic']) {
        return;
    }
    vm.$set('relic_list', data.relic);
    vm.$set('relic_total', _.reduce(_.values(data.relic), function (memo, num) {
        return memo + num;
    }));
}

var get_legend_data = (function () {
    var legend_data = {};
    return function (env_no, legend, callback) {
        //当为楼层时,初始化图例只包含网络设备,其他的数据请求不再发送(取消此限制)
        // if((legend==='small_env'&&!vm.show_small_env)||(legend==='micro_env'&&!vm.show_micro_env)||(legend==='relic'&&!vm.show_relic)){
        // console.log('当为楼层时,初始化图例只包含网络设备');
        //    return ;
        // }
        // console.log('初始化',legend);
        //综合管理添加权限设置;
        if (checkPermissions({name: '设备管理'}) || checkPermissions({name: '文物管理'})) {
            if (legend_data[legend] && legend_data[legend] !== '[]') {
                callback && callback(legend_data[legend]);
                return;
            }
            $.get(API('/env/environments/legends/legend_detail/' + env_no + '/' + legend), function (data) {
                // console.log(data);
                callback && callback(data);
                legend_data[legend] = data;
            }, 'json');
        }
    }
})();

//添加到地图上
function add_point(env_no, legend, type) {
    get_legend_data(env_no, legend, function (data) {
        if (!data[type]) {
            return;
        }
        add_point_map(data[type], legend, type);
    });
}

function remove_point(env_no, legend, type) {
    var removeIcon = $svg_div.find('div[data-legend=' + legend + '][data-type=' + type + ']');
    var parentNodes = removeIcon.parent();
    removeIcon.remove();
    //删除tip中的内容;
    parentNodes.find('div.tooltipPanel').find('ul.innerList').find('li[data-type=' + type + ']').remove();
    if (parentNodes && parentNodes.length != 0) {
        $.each(parentNodes, function (index, node) {
            $(node).find('span.count').html($(node).find('div.type').length);
            if ($(node).find('div.type').length <= 1) {
                $(node).find('span.count').css('display', 'none');
            }
            $(node).find('span.count').attr('data-status', $(node).find('div.type:visible:last').attr('data-status'));
        });
    }
}

function add_all_point(env_no, legend) {
    get_legend_data(env_no, legend, function (data) {
        _.each(data, function (list, type) {
            add_point_map(list, legend, type);
        });
    });
}

function remove_all_point(env_no, legend) {
    var removeIcons = $svg_div.find('div[data-legend=' + legend + ']');
    var parentNodes = removeIcons.parent();
    removeIcons.remove();
    if (parentNodes && parentNodes.length != 0) {
        $.each(parentNodes, function (index, node) {
            $(node).find('span.count').html($(node).find('div.type').length);
            if ($(node).find('div.type').length <= 1) {
                $(node).find('span.count').css('display', 'none');
            }
            $(node).find('div.tooltipPanel ul.innerList').find('[data-legend=' + legend + ']').remove();
            $(node).find('span.count').attr('data-status', $(node).find('div.type:visible:last').attr('data-status'));
        });
    }
    // console.log($svg_div.find('div[data-legend=' + legend + ']').parent());
}

function add_point_map(list, legend, type) {
    //console.log(list,legend,type);
    if (!vm['show_' + legend]) {
        return;
    }
    _.each(list, function (row) {
        if (!row.locate) {
            var addLocate = {
                area: [],
                width: 696.672,
                height: 892
            };
            addLocate.area.push("0,0");
            row.locate = addLocate;
        }
        if (row && row.equip_no) {
            if ($svg_div.find('div[data-equip_no=' + row.equip_no + ']').length != 0) {
                // console.log('该设备已经存在');全选时,已经存在的设备不再重复添加
                return;
            }
        } else if (row && row.relic_no) {
            if ($svg_div.find('div[data-relic_no=' + row.relic_no + ']').length != 0) {
                // console.log('该文物已经存在');全选时,已经存在的文物不再重复添加
                return;
            }
        }
        if (row && row['locate']) {//有坐标定位
            var locate;
            if (_.isString(row.locate)) {
                try {
                    locate = $.parseJSON(row['locate']);
                } catch (e) {
                    console.log(e);
                }
            } else {
                locate = row.locate;
            }
            if (locate && locate.width && locate.height && locate.area) {
                var svg_data = [];
                _.each(locate.area, function (v) {
                    var points = v.split(',');
                    points[0] = $svg_map.width() * points[0] / locate.width;
                    points[1] = $svg_map.height() * points[1] / locate.height;
                    svg_data.push(points[0].toFixed(0) + ',' + points[1].toFixed(0));
                });

                add_to_map_div(svg_data, row);
                return;
            }
        }
        //搜索上级环境坐标第一个点
        if (row) {
            var env_no = row['env_no'];
            if (!env_no && row['parent_env_no']) {
                env_no = row.parent_env_no;
            }
            var $env_polygon = $svg_map.find('polygon[data-no=' + env_no + ']');
            if ($env_polygon[0]) {
                var points = $env_polygon.attr('points');
                if (points) {
                    add_to_map_div(points, row);
                    return;
                }
            }

            add_to_map_div(["0,0"], row);
        }
    });

    function add_to_map_div(points, row) {//向图上添加动态元素
        var xy;
        // console.log(row);
        //if (points[0]=="0,0") {
        //    return;
        //}
        if (_.isString(points)) {
            xy = points.split(' ')[0];
        } else if (_.isArray(points)) {
            xy = points[0];
        }
        var xy_arr = xy.split(',');
        var left = (100 * (xy_arr[0]) / $svg_map.width()).toFixed(2),
            top = (100 * (xy_arr[1]) / $svg_map.height()).toFixed(2);
        var attr = {};
        attr['data-type'] = type;
        attr['data-legend'] = legend;
        //地图点的样式
        attr['class'] = 'type now ' + type;
        if (row.equip_no) {
            attr['data-env'] = row.env_no;
        } else if (row.relic_no) {
            attr['data-env'] = row.parent_env_no;
        }
        var $icon = $('<div>', attr);

        switch (legend) {
            case 'small_env':
            case 'micro_env':
                create_sensor($icon, row);
                break;
            case 'network':
                create_network($icon, row);
                break;
            case 'relic':
                create_relic($icon, row);
                break;
        }
        // var left_top_id = 'area_' + left.replace('.', '') + '_' + top.replace('.', '');//确定坐标点归属的区域
        // console.log(left,top);//当前点位
        //计算当前点位正负1%的范围内是否存在另一个点,如果存在,则聚集显示
        // var calc_left,calc_top,left_top_id;
        // for(var i=-1;i<=1;i++){
        //     for(var j=-1;j<=1;j++){
        //         calc_left = Math.round(parseFloat(left))+i;
        //         calc_top = Math.round(parseFloat(top))+j;
        //         left_top_id = '#area_'+calc_left+'_'+calc_top;
        //         if($(left_top_id)&&$(left_top_id).length!=0){
        //             console.log('找到聚合点...聚合点为:',$(left_top_id));
        //             break;
        //         }
        //     }
        // }

        var left_top_id = 'area_' + Math.round(parseFloat(left)) + '_' + Math.round(parseFloat(top));//确定坐标点归属的区域
        if (!$('#' + left_top_id)[0]) {//如果当前不存在此显示区域,则创建该区域
            $dom = $('<div></div>', {
                id: left_top_id,
                class: 'left_top_box',
                'data-env': row.env_no || row.parent_env_no
            }).css({
                left: left + '%',
                top: top + '%'
            }).hover(function () {
                $(this).css('z-index', '2');
                $(this).addClass('active').find('.type').addClass('active');
            }, function () {
                $(this).css('z-index', '1');
                $(this).removeClass('active').find('.type').removeClass('active');
            }).append('<span class="count">' + '<i class="firstI"></i>' + '<i class="secondI"></i>' + '</span>').append('<div class="tooltipPanel"><ul class="innerList"></ul></div>').appendTo($svg_div);
        }

        $('#' + left_top_id).append($icon);//把新点加入到区域中,如果已经存在该区域,则聚合显示到该区域的下方
        //将该行数据添加到innerList内部
        // console.log(row);
        var $ul = $('#' + left_top_id).find('ul.innerList');
        //var $li = $('#' + left_top_id).find('ul.innerList li');
        var itemStr = '';

        if (row.relic_no) {//项目为文物
            itemStr = initRelicTooltip(row, type, legend);
        } else if (row.equip_no) {//项目为设备
            itemStr = initEquipTooltip(row, type, legend);
        }
        $ul[0].innerHTML += itemStr;
        if ($('#' + left_top_id).find('div.type').length > 0) {
            var status = $('#' + left_top_id).find('div.type:last').attr('data-status');
            var $li = $('#' + left_top_id).find(".tooltipPanel ul li[contrast_key='true']");
            if (!status) {
                status = '正常';
            }
            // console.log(status);
            $('#' + left_top_id).find('span.count').css('display', 'inline-block').attr('data-status', status);//当前区域中重叠的个数
            $('#' + left_top_id).find('span.count>i.firstI').html($li.length + '/');//当前区域中重叠的个数
            $('#' + left_top_id).find('span.count>i.secondI').html($('#' + left_top_id).find('div.type:visible').length);//当前区域中重叠的个数
            if ($('#' + left_top_id).find('div.type').length < 2) {
                $('#' + left_top_id).find('span.count').css('display', 'none');
            }
            if ($li.length < 1) {
                $('#' + left_top_id).find('span.count>i.firstI').css('display', 'none');
            } else {
                $('#' + left_top_id).find('span.count>i.firstI').css('display', 'inline');
            }
        }
    }

    function initRelicTooltip(row, type, legend) {
        var obj = {name: "文物管理", relic_no: row.relic_no, url: "../relic?relic_no=" + row.relic_no};
        return '<li data-relic_no="' + row.relic_no + '" data-type="' + type + '" data-legend="' + legend + '">' +
            '<a href=\'javascript:goPermission(' + JSON.stringify(obj) + ')\' target="_self">' +
            '<h4><i class="type small ' + type + '"></i>' + row.name + '</h4>' +
            '<p>编号:' + row.relic_no + '</p>' +
            '<p>年代:' + row.age + '</p>' +
            '<p>类别:' + row.category + '</p>' +
            '</a>' +
            '</li>';
    }

    function initEquipTooltip(row, type, legend) {
        //存储参数中文名称,设计颜色,参数单位信息
        var params_color = {
            temperature: {color: '#3db38c'},
            humidity: {color: '#2756FF'},
            voc: {color: '#ae9a2e'},
            co2: {color: '#99351f'},
            light: {color: '#ff9000'},
            uv: {color: '#ff5fdb'},
            organic: {color: '#677c0e'},
            inorganic: {color: '#94b046'},
            sulfur: {color: '#b6bf8e'},
            soil_humidity: {color: '#b24d08'},
            soil_temperature: {color: '#b5733c'},
            soil_conductivity: {color: '#8c6239'},
            broken: {color: '#ed1e79'},
            vibration: {color: '#6c3cd9'},
            multi_wave: {color: '#a415ff'},
            rssi: {color: ''},
            voltage: {color: ''}
        };
        //var testList = '';
        if (row && row.new_data) {
            var new_data = row.new_data,
                newDataStr = '',
                count = 1;
            for (var key in new_data) {
                if (key == 'organic' || key == 'inorganic' || key == 'sulfur') {//有机物,无机物,硫化物单位换算
                    new_data[key] /= 1000;
                }
                if (params_color[key] && params_color[key].color) {
                    if (row.equip_type === '中继' || row.equip_type === '网关') {
                        // console.log(param_unit_name,key);
                        var newDataContent=param_unit_name[key].name + ':' + (new_data[key] || ' ') + param_unit_name[key].unit;
                        newDataStr += '<span data-title="'+newDataContent+'" style="display:inline-block;width:50%;white-space: nowrap;text-overflow: ellipsis;overflow:hidden; ">' + param_unit_name[key].name + ':' + (new_data[key] || ' ') + param_unit_name[key].unit + '</span>';
                        count++;
                    } else {
                        if (key != 'rssi' && key != 'voltage') {
                            var newDataContent=param_unit_name[key].name + ':' + (new_data[key] || ' ') + param_unit_name[key].unit;
                            newDataStr += '<span data-title="'+newDataContent+'" style="display:inline-block;width:50%;white-space: nowrap;text-overflow: ellipsis;overflow:hidden; ">' + param_unit_name[key].name + ':' + (new_data[key] || ' ') + param_unit_name[key].unit + '</span>';
                            count++;
                        } else {
                            count--;
                        }
                    }
                    // console.log(newDataStr);
                    if (count % 2 !== 0 && count > 0) {
                        newDataStr += '<br/>';
                    }
                }
            }
        }
        var obj = {
            name: "设备管理",
            equip_no: row.equip_no,
            url: "../equipManage/#/equip_info/" + row.equip_no
        };
        if (newDataStr) {
            // return `<li data-equip_no="${row.equip_no}" data-type="${type}" data-legend="${legend}"><a href="../capsule/#!/components/equip_details/${row.equip_no}" target="_self"><h4><i class="type small ${type}" data-status="${row.status}"></i>${row.name}</h4><p>${newDataStr}</p></a></li>`;
            return '<li data-equip_no="' + row.equip_no + '" data-type="' + type + '" data-legend="' + legend + '">' + '<i class="test"></i>' + '<i class="close"></i>' +
                '<a href=\'javascript:goPermission(' + JSON.stringify(obj) + ')\' target="_self">' +
                '<h4><i class="type small ' + type + '" data-status="' + row.status + '"></i>' + '<span>' + (row.name || '-') + '</span>' + '</h4>' +
                '<p>' + newDataStr + '</p>' +
                '</a>' +
                '</li>';
        } else {
            return '<li data-equip_no="' + row.equip_no + '" data-type="' + type + '" data-legend="' + legend + '">' + '<i class="test"></i>' + '<i class="close"></i>' +
                '<a href=\'javascript:goPermission(' + JSON.stringify(obj) + ')\' target="_self">' +
                '<h4><i class="type small ' + type + '" data-status="' + row.status + '"></i>' + '<span>' + (row.name || '-') + '</span>' + '</h4>' +
                '</a>' +
                '</li>';
        }
    }

    function create_sensor($icon, equip) {
        var status = '';
        //增加离线设备判断
        if (equip.equip_type.indexOf('离线') != -1 || equip.equip_type.indexOf('手持') != -1) {
            status = '离线';
        } else {
            status = equip.status;
        }
        $icon.attr({'data-equip_no': equip.equip_no, 'data-status': status});//设置图标属性,设备编号,设备状态
    }

    function create_network($icon, equip) {
        $icon.attr({'data-equip_no': equip.equip_no, 'data-status': equip.status});//设置图标属性,设备编号,设备状态
    }

    function create_relic($icon, relic) {
        $icon.attr('data-relic_no', relic.relic_no);//设置图标属性
    }

    $(".test").on("click", function () {//点击设备加号添加对比设备
        var ariaExpanded = $("#collapse4").attr("aria-expanded");
        if (ariaExpanded === 'false') {
            $("#contrast_box .panel-title a").click();
        }
        var equip_no = $(this).parent().attr('data-equip_no');
        var judge = vm.contrast_no_list.some(function (elem) {
            return elem == equip_no;
        });
        if (judge) {
            return;
        }
        var $span = $(this).parent().find("a>p");
        var $i = $(this).parent().find("a>h4>i");
        if ($span && $span[0] && $span[0].innerHTML && $i[0].className) {
            add_contrast_panel(equip_no, $span[0].innerHTML, $i[0].className);
        } else {
            add_contrast_panel(equip_no, null, $i[0].className);
        }
        vm.contrast_no_list.push(equip_no);
        vm.contrast_no_list = unique(vm.contrast_no_list);
        localStorage.setItem('contrast_no_list', vm.contrast_no_list);
        $(this).parent().find("a").css("color", "#1bbc9b");
        $(this).parent().find("a>h4>span").css("color", "#1bbc9b");
        $(this).parent().find("i.close").css("display", "block");
        $(this).parent().attr('contrast_key', 'true');
        var $parents = $(this).parent().parent().parent().parent();
        $parents.find('span.count>i.firstI').html($(this).parent().parent().find("li[contrast_key='true']").length + '/');
        if ($(this).parent().parent().find("li[contrast_key='true']").length < 1) {
            $parents.find('span.count>i.firstI').css('display', 'none');
            $parents.find('span.count').css('display', 'none');
        } else {
            $parents.find('span.count>i.firstI').css('display', 'inline');
            $parents.find('span.count').css('display', 'inline');
        }
    });
    $(".innerList i.close").on("click", function () {//点击设备删除对比设备
        $(this).parent().find("a").css("color", "#999999");
        $(this).parent().find("a>h4>span").css("color", "#999999");
        $(this).css("display", "none");
        $(this).parent().removeAttr('contrast_key');
        var $parents = $(this).parent().parent().parent().parent();
        $parents.find('span.count>i.firstI').html($(this).parent().parent().find("li[contrast_key='true']").length + '/');
        if ($(this).parent().parent().find("li[contrast_key='true']").length < 1) {
            $parents.find('span.count>i.firstI').css('display', 'none');
        } else {
            $parents.find('span.count>i.firstI').css('display', 'inline');
        }
        var equip_no = $(this).parent().attr("data-equip_no");
        var equip_no_copy = $("#collapse4 .panel-body .contrast_panel").attr("data-no");
        if (equip_no === equip_no_copy) {
            var $this = $("#collapse4 .panel-body .contrast_panel[data-no=" + equip_no + "]");
            $this.next().remove();
            $this.remove();
            removeByValue(vm.contrast_no_list, equip_no);
            localStorage.contrast_no_list = vm.contrast_no_list;
        } else {
            return
        }
    });

    function unique(arr) {//删除同一数组重复元素
        var tmp = new Array();
        for (var i in arr) {
            if (tmp.indexOf(arr[i]) == -1) {
                tmp.push(arr[i]);
            }
        }
        return tmp;
    }

    function removeByValue(arr, val) {//删除数组中指定元素
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] == val) {
                arr.splice(i, 1);
                break;
            }
        }
    }

    function add_contrast_panel(noList, html, stylus) {//添加设备对比列表
        if (html) {
            var items = html.split("<br>");
            var newStr = items.join("");
            $("#collapse4 .panel-body").prepend('<div class="contrast_panel" data-no="' + noList + '">' + '<span class="contrast_name">' + '<i class="' + stylus + '">' + '</i>' + '<span>' + noList + '</span>' + '</span>' + '<p>' + newStr + '</p>' + '<i class="close"></i>' + '</div>' + '<hr>');
        } else {
            $("#collapse4 .panel-body").prepend('<div class="contrast_panel" data-no="' + noList + '">' + '<span class="contrast_name">' + '<i class="' + stylus + '">' + '</i>' + '<span>' + noList + '</span>' + '</span>' + '<i class="close"></i>' + '</div>' + '<hr>');
        }
        // $(".contrast_panel").eq(0).height($(".contrast_panel>p").height());
        var closeNone = $(".contrast_panel").eq(0).find("i.close");
        bindDeleteContrastEquip(closeNone);
    }

    function bindDeleteContrastEquip(closeNone) {// 点击设备对比删除对应对比设备
        closeNone.on("click", function () {
            var equip_no = $(this).parent().attr("data-no");
            var $svgThis = $("#svg_map_div .innerList li[data-equip_no=" + equip_no + "]");
            $svgThis.find("i.close").css("display", "none");
            $svgThis.find("a").css("color", "#999999");
            $svgThis.find("a>h4>span").css("color", "#999999");
            $svgThis.removeAttr('contrast_key');
            var $parents = $svgThis.parent().parent().parent();
            $parents.find('span.count>i.firstI').html($svgThis.parent().find("li[contrast_key='true']").length + '/');
            if ($svgThis.parent().find("li[contrast_key='true']").length < 1) {
                $parents.find('span.count>i.firstI').css('display', 'none');
            } else {
                $parents.find('span.count>i.firstI').css('display', 'inline');
            }
            $(this).parent().next().remove();
            $(this).parent().remove();
            removeByValue(vm.contrast_no_list, equip_no);
            localStorage.contrast_no_list = vm.contrast_no_list;
        })
    }
}

