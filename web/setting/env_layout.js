define('setting/env_layout', function(require, exports, module) {
var vm;
var $img_box, oldWidth, $svg_map_div, $svg_map;
var router = require('common/router');
exports.init = function (env_no, type) {

    $('#content').load('env_layout.html?date=' + new Date() * 1, function () {
        $img_box = $('.img_box');
        $svg_map = $('#svg_map');
        $svg_map_div = $('#svg_map_div');
        vm = new Vue({
            el: '#content',
            data: {
                env_no: env_no,
                type: type || 'env',
                env: {},
                edit_env_no: '',
                no_locate_env_list: [],
                locate_env_list: [],

                equip_type_list: [],

                edit_equip_no: '',
                equip_search: '',
                select_equip_type: [],
                no_locate_equip_list: [],
                locate_equip_list: [],

                relic_type_list: [],

                edit_relic_no: '',
                relic_search: '',
                select_relic_type: [],
                no_locate_relic_list: [],
                locate_relic_list: [],

            },
            filters: {
                filterEquipRlic: function (list, types, txt, type) {
                    types = types || [];
                    txt = txt || '';
                    if (types.length == 0) {
                        if (txt == '') {
                            return list;
                        }
                        return list.filter(function (row) {
                            return (row.name.indexOf(txt) > -1);
                        });
                    }
                    return list.filter(function (row) {
                        if (txt == '') {
                            return _.contains(types, row[type]);
                        }
                        return (row.name.indexOf(txt) > -1) && _.contains(types, row[type]);
                    });
                }
            },
            computed: {
                no_locate_equip_list_filter: function () {
                    var filter = this.$options.filters.filterEquipRlic;
                    return filter(this.no_locate_equip_list, this.select_equip_type, this.equip_search, 'equip_type');
                },
                locate_equip_list_filter: function () {
                    var filter = this.$options.filters.filterEquipRlic;
                    return filter(this.locate_equip_list, this.select_equip_type, this.equip_search, 'equip_type');
                },
                no_locate_relic_list_filter: function () {
                    var filter = this.$options.filters.filterEquipRlic;
                    return filter(this.no_locate_relic_list, this.select_relic_type, this.relic_search, 'level');
                },
                locate_relic_list_filter: function () {
                    var filter = this.$options.filters.filterEquipRlic;
                    return filter(this.locate_relic_list, this.select_relic_type, this.relic_search, 'level');
                }
            },
            methods: {
                loadImg: loadImg,
                change_type: function (ty) {
                    window.draw_close && window.draw_close();
                    this.type = ty;
                    router.set('/env_layout/' + this.env_no + '/' + ty);
                    sel_locate(ty);
                },
                change_equip_type: function (ty) {
                    var types = vm.select_equip_type;
                    if (_.contains(types, ty)) {
                        types = _.without(types, ty);
                    } else {
                        types.push(ty);
                    }
                    vm.$set('select_equip_type', types);
                    sel_locate('equip', types);
                },
                in_equip_type: function (ty) {
                    return _.contains(this.select_equip_type, ty);
                },
                change_relic_type: function (ty) {
                    var types = vm.select_relic_type;
                    if (_.contains(types, ty)) {
                        types = _.without(types, ty);
                    } else {
                        types.push(ty);
                    }
                    vm.$set('select_relic_type', types);
                    sel_locate('relic', types);
                },
                in_relic_type: function (ty) {
                    return _.contains(this.select_relic_type, ty);
                },
                env_mouseover: env_mouseover,
                env_mouseout: env_mouseout,
                env_click: env_click,

                equip_mouseover: equip_mouseover,
                equip_mouseout: equip_mouseout,
                equip_click: equip_click,
                equip_delete: equip_delete,

                relic_mouseover: relic_mouseover,
                relic_mouseout: relic_mouseout,
                relic_click: relic_click,
                relic_delete: relic_delete,

                show_search: function (e) {
                    var $thisEle = $(e.target || e.srcElement);
                    $thisEle.toggleClass('active').siblings().toggle();
                }
            }
        });

        load_env(env_no);
        load_tree(env_no);

    });

};

function load_env(env_no) {
    var param = {parent_env_no: env_no},
        me = this;
    if (env_no == "") {
        vm.$set('env', {
            map: window.web_config.bg || '../common/images/layout_default.jpg',
            name: window.web_config.museum_name,
            type: ''
        });
        param = {type: '楼栋'};
        load_equip(env_no);
        load_relic(env_no);
    } else {
        $.get("/2.2.05_P001/base_api/base/envs/info/" + env_no+"", function (json) {
            // console.log(json);
            if (json&&json.error) {
                vm.$Message.error(json.error);
                $('.map_view').css('background','none');
                return;
            }
            if (!json.map || json.map == '') {
                json.map = '../common/images/layout_default.jpg';
            }

            vm.$set('env', json);
            load_equip(env_no);
            load_relic(env_no);
        }, 'json');

    }

    $.get('/2.2.05_P001/base_api/base/envs', param, function (data) {
        if (data&&data.error) {
            vm.$Message.error(data.error);
            $('.map_view').css('background','none');
            return;
        }
        if (!data || data == '[]') {
            return;
        }
        if (data&&data.error) {
            vm.$Message.error(data.error);
            // alert(json.msg);
            return;
        }
        get_svg(data);
        var points_env_nos = [];
        $svg_map.find('polygon').each(function () {
            var points = $(this).attr('points'), no = $(this).attr('data-no');
            if (points) {
                points_env_nos.push(no);
            }
        });

        var locate_env_list = [], no_locate_env_list = [];
        _.each(data.rows, function (row) {
            if (row.locate && row.locate != "" && _.contains(points_env_nos, row.env_no)) {
                locate_env_list.push(row);
            } else {
                no_locate_env_list.push(row);
            }
        });

        vm.$set('locate_env_list', locate_env_list);
        vm.$set('no_locate_env_list', no_locate_env_list);

    }, 'json');
}

function loadImg() {
    var height = $img_box.height(),
        parentHeight = $img_box.parent().height();
    if (height > parentHeight) {
        var cha = height - parentHeight;
        oldWidth = (1 - cha / height) * 100;
        $img_box.css('width', oldWidth + '%');
    } else {
        oldWidth = 100;
    }
    $img_box.css('width', oldWidth + '%');

    $img_box.css({'margin-top': -($img_box.height() / 2), 'margin-left': -($img_box.width() / 2)});
    $img_box.find('img').css('opacity', 1);
    $img_box.parent().css('background', 'none');
}

function dragImg() {

    $('.map_view').mousedown(function (e) {
        var _x = e.clientX - $img_box.position().left;
        var _y = e.clientY - $img_box.position().top;

        $(document).bind('mousemove', function (e) {
            var x = e.clientX - _x,
                y = e.clientY - _y;
            $img_box.css({left: x, top: y});
        });

        $(document).bind('mouseup', function () {
            $(document).unbind('mousemove').unbind('mouseup');
        });
        e.preventDefault();
    });
}

function get_svg(data) {
    // console.log(data);

    roller();//先执行,绑定mousewheel事件有先后顺序
    dragImg();
    if (data.total == 0) {
        return;
    }

    var draw = require('common/draw');
    var svg = draw({
        el: '#svg_map',
        data: data.rows,
        mousedown: function () {

        },
        mouseup: function (env_no) {

        },
        draw: true,
        mouseover: function ($this) {
            $($this).css({'fill-opacity': 0.6});
        },
        mouseout: function ($this) {
            $($this).css({'fill-opacity': 0.3});
        }
    });
}

function roller() {
    var _x, _y, offsetX, offsetY,
        width = 0,
        i = 0,
        newWidth = oldWidth ? oldWidth : 100;

    $('.map_view').bind('mousewheel', function (e) {
        e.preventDefault();
        offsetX = e.clientX - $img_box.offset().left;
        offsetY = e.clientY - $img_box.offset().top;

        _x = offsetX / $img_box.width();
        _y = offsetY / $img_box.height();

        i += e.deltaY;
        width = i * 10;

        $img_box.css({'width': newWidth + width + '%'});
        $img_box.css({'margin-top': -($img_box.height() / 2), 'margin-left': -($img_box.width() / 2)});

    }).find('.btn_view').bind('click', function () {
        reset_();
        i = 0;
    });

}

function reset_() {
    $img_box.css({left: '50%', top: '50%', width: '100%'}).css({
        'margin-top': -($img_box.height() / 2),
        'margin-left': -($img_box.width() / 2)
    });
}

/***/

function env_mouseover(env_no) {
    if (vm.edit_env_no != env_no) {
        $svg_map.find('polygon[data-no=' + env_no + ']').css({'fill-opacity': 0.6});
    }
}
function env_mouseout(env_no) {
    if (vm.edit_env_no != env_no) {
        $svg_map.find('polygon[data-no=' + env_no + ']').css({'fill-opacity': 0.3});
    }

}
function env_click(env_no) {
    var $now_polygon = $svg_map.find('polygon[data-no=' + env_no + ']');
    $svg_map.find('polygon').css({'fill-opacity': 0.3});
    $now_polygon.css({'fill-opacity': 0.6});

    vm.$set('edit_env_no', env_no);

    window.draw(env_no);
}

/*****/

var EQUIPS = {};

function load_equip(env_no, opt) {
    opt = $.extend({}, {
        equip_locate_callback: null,
    }, opt);
    EQUIPS = {};
    $.get('/2.2.05_P001/base_api/env/common/equip_type', function (json) {
        // console.log(json);
        if (json&&json.error) {
            vm.$Message.error(json.error);
            // alert(json.msg);
            return;
        }
        if (!json || json == '[]') {
            vm.$set('equip_type_list', []);
            return;
        }
        var equip_type_list = [];
        equip_type_list.push(json.sensor);
        equip_type_list.push(json.controller);
        equip_type_list.push(json.network);
        //新增智能囊匣,离线设备
        equip_type_list.push(json.box);
        equip_type_list.push(json.offline);

        vm.$set('equip_type_list', equip_type_list);
    }, 'json');

    $.get('/2.2.05_P001/base_api/env/setting/no_locate/' + env_no+'', function (json) {
        //console.log(json);
        if (json&&json.error) {
            vm.$Message.error(json.error);
            // alert(json.msg);
            return;
        }
        if (!json || json == '[]') {
            vm.$set('no_locate_equip_list', []);
            return;
        }
        var no_locate_equip_list = [];
        _.each(json, function (row) {
            row.no = row.equip_no;
            row.ty = 'equip';
            row.type = row.equip_type;
            row.icon = row.equip_type;
            row.title = row.equip_type + '-' + row.name;
            EQUIPS[row.equip_no] = row;
            if (row.env_no) {

            }
            no_locate_equip_list.push(row);
        });
        vm.$set('no_locate_equip_list', no_locate_equip_list);
    }, 'json');
    $.get('/2.2.05_P001/base_api/env/setting/equip_locate/' + env_no+'', function (json) {
        if (json&&json.error) {
            vm.$Message.error(json.error);
            // alert(json.msg);
            return;
        }
        //console.log(json);
        if (!json || json == '[]') {
            vm.$set('locate_equip_list', []);
            return;
        }
        var locate_equip_list = [];
        // console.log(vm.env.type);
        _.each(json, function (row) {
            if (_.contains(['', '楼栋', '室外环境', '楼层'], vm.env.type) && vm.env_no != row.env_no) {
                return;
            }
            row.no = row.equip_no;
            row.ty = 'equip';
            row.type = row.equip_type;
            row.icon = row.equip_type;
            row.title = row.equip_type + '-' + row.name;
            EQUIPS[row.equip_no] = row;
            add_point(row);
            locate_equip_list.push(row);
        });
        vm.$set('locate_equip_list', locate_equip_list);
        if (opt.equip_locate_callback) {
            vm.$nextTick(function () {
                opt.equip_locate_callback();
            });
        }

    }, 'json');

}

function equip_mouseover(equip_no) {
    var $icon = $svg_map_div.find('div.museum_icon[data-ty=components][data-no=' + equip_no + ']');
    $icon.addClass('jump').css('z-index', 5).siblings().css('z-index', 0);
    // if ($icon[0] && vm.edit_equip_no != equip_no) {
    //     return;
    // }
}
function equip_mouseout(equip_no) {
    var $icon = $svg_map_div.find('div.museum_icon[data-ty=components][data-no=' + equip_no + ']');
    $icon.removeClass('jump');
    // if ($icon[0] && vm.edit_equip_no != equip_no) {
    //     return;
    // }
}
function equip_click(equip_no) {
    var row = EQUIPS[equip_no];
    vm.$set('edit_equip_no', equip_no);
    if (row) {
        add_point(row);
        var $icon = $svg_map_div.find('div.museum_icon[data-ty=components][data-no=' + equip_no + ']');
        // $icon.removeClass('small').siblings().addClass('small');
        if ($icon.hasClass('jump')) {
            $icon.removeClass('jump');
        }
        setTimeout(function () {
            $icon.addClass('jump').css('z-index', 5).siblings().css('z-index', 0);
        }, 0);
    }
}

function equip_delete(equip_no) {
    // console.log('delete', equip_no);
    var row = EQUIPS[equip_no];
    if (row) {
        del_locate(row);
    }
}

/***/
var RELICS = {};

function load_relic(env_no, opt) {
    opt = $.extend({}, {
        equip_locate_callback: null,
    }, opt);
    RELICS = {};
    $.get('/2.2.05_P001/base_api/relic/setting/relic_type', function (json) {
        if (json&&json.error) {
            vm.$Message.error(json.error);
            // alert(json.msg);
            return;
        }
        //console.log(json);
        if (!json || json == '[]') {
            vm.$set('relic_type_list', []);
            return;
        }
        var relic_type_list = [];
        var sort = ['一级文物', '二级文物', '三级文物', '一般文物', '未定级文物'];
        _.each(sort, function (val) {
            if (_.contains(json, val)) {
                relic_type_list.push(val);
            }
        });

        vm.$set('relic_type_list', relic_type_list);
    }, 'json');

    $.get('/2.2.05_P001/base_api/relic/setting/no_locate/' + vm.env_no+'', function (json) {
        if (json&&json.error) {
            vm.$Message.error(json.error);
            // alert(json.msg);
            return;
        }
        //console.log(json);
        if (!json || json == '[]') {
            vm.$set('no_locate_relic_list', []);
            return;
        }
        var no_locate_relic_list = [];
        _.each(json, function (row) {
            row.no = row.relic_no;
            row.title = row.level + '-' + row.name;
            row.icon = row.level;
            row.ty = 'relic';
            row.type = row.level;
            RELICS[row.relic_no] = row;

            no_locate_relic_list.push(row);
        });

        vm.$set('no_locate_relic_list', no_locate_relic_list);
    }, 'json');
    $.get('/2.2.05_P001/base_api/relic/setting/relic_locate/' + env_no+'', function (json) {
        if (json&&json.error) {
            vm.$Message.error(json.error);
            // alert(json.msg);
            return;
        }
        //console.log(json);
        if (!json || json == '[]') {
            vm.$set('locate_relic_list', []);
            return;
        }
        var locate_relic_list = [];
        _.each(json, function (row) {
            if (_.contains(['', '楼栋', '室外环境', '楼层'], vm.env.type) && vm.env_no != row.env_no) {
                return;
            }
            row.no = row.relic_no;
            row.title = row.level + '-' + row.name;
            row.icon = row.level;
            row.ty = 'relic';
            row.type = row.level;
            RELICS[row.relic_no] = row;
            add_point(row);
            locate_relic_list.push(row);
        });
        vm.$set('locate_relic_list', locate_relic_list);
        if (opt.equip_locate_callback) {
            vm.$nextTick(function () {
                opt.equip_locate_callback();
            });
        }
    }, 'json');

}


function relic_mouseover(relic_no) {
    var $icon = $svg_map_div.find('div.museum_icon[data-ty=relic][data-no=' + relic_no + ']');
    $icon.addClass('jump').css('z-index', 5).siblings().css('z-index', 0);
    // if ($icon[0] && vm.edit_relic_no != relic_no) {
    //     setTimeout(function(){
    //
    //     },0);
    //     return;
    // }
}
function relic_mouseout(relic_no) {
    var $icon = $svg_map_div.find('div.museum_icon[data-ty=relic][data-no=' + relic_no + ']');
    $icon.removeClass('jump');
    // if ($icon[0] && vm.edit_relic_no != relic_no) {
    //
    //     return;
    // }
}
function relic_click(relic_no) {
    var row = RELICS[relic_no];
    vm.$set('edit_relic_no', relic_no);
    if (row) {
        add_point(row);
        var $icon = $svg_map_div.find('div.museum_icon[data-ty=relic][data-no=' + relic_no + ']');
        if ($icon.hasClass('jump')) {
            $icon.removeClass('jump');
        }
        setTimeout(function () {
            $icon.addClass('jump').css('z-index', 5).siblings().css('z-index', 0);
        }, 0);
    }
}

function relic_delete(relic_no) {
    // console.log('delete', relic_no);
    var row = RELICS[relic_no];
    if (row) {
        del_locate(row);
    }
}

/***/

function add_point(row) {//{no:'',ty:'',type:'',locate:'',icon:'',title:''}
    // console.log('add_point', row);
    var $icon_old = $svg_map_div.find('div.museum_icon[data-ty=' + row.ty + '][data-no=' + row.no + ']');
    // console.log($icon_old);
    if ($icon_old[0]) {
        //$icon_old.removeClass('small').siblings().addClass('small');
        return;
    }
    if (!row.env_no) {
        row['locate'] = null;
    }

    if (row['locate']) {//有坐标定位
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
        if (locate && locate.width && locate.height && locate.area && locate.area[0]) {
            var points = locate.area[0].split(',');
            row.x = ($svg_map.width() * points[0] / locate.width).toFixed(0);
            row.y = ($svg_map.height() * points[1] / locate.height).toFixed(0);
            add_to_map_div(row);
            return;
        }
    }
    if (row['env_no']) {
        //搜索上级环境坐标第一个点
        var $env_polygon = $svg_map.find('polygon[data-no=' + row.env_no + ']');
        if ($env_polygon[0]) {
            var points = $env_polygon.attr('points');
            if (points) {
                var xy = points.split(' ')[0];
                var xy_arr = xy.split(',');
                row.x = xy_arr[0];
                row.y = xy_arr[1];
                add_to_map_div(row);
                return;
            }
        }
    }

    row.x = $svg_map.width() - 35;
    row.y = $svg_map.height() / 5;
    add_to_map_div(row);

}

function add_to_map_div(row) {

    var left = (100 * row.x / $svg_map.width()).toFixed(2),
        top = (100 * row.y / $svg_map.height()).toFixed(2);
    var attr = {};
    attr['data-ty'] = row.ty;
    attr['data-type'] = row.type;
    attr['data-no'] = row.no;
    attr['data-title'] = row.title;
    attr['class'] = 'museum_icon ' + row.icon;
    if (vm.edit_equip_no != row.no && vm.edit_relic_no != row.no) {
        // attr['class'] = 'museum_icon small ' + row.icon;//取消图标缩放功能
        attr['class'] = 'museum_icon ' + row.icon;
    }

    var $icon = $('<div>', attr).css({
        position: 'absolute',
        left: left + '%',
        top: top + '%',
        // 'z-index': 1
    }).hover(function () {
        // $(this).removeClass('small');
    }, function () {
        var no = $(this).attr('data-no');
        if (vm.edit_equip_no != no && vm.edit_relic_no != no) {
            // $(this).addClass('small');
        }
    }).mousedown(function (e) {
        var $this = $(this);
        vm.$set('edit_equip_no', $this.attr('data-no'));
        // $this.removeClass('small').siblings().addClass('small');
        var old_x = e.clientX;
        var old_y = e.clientY;
        var pos = $(this).position();

        function doc_mousemove(ev) {
            var new_top = pos.top + ev.clientY - old_y;
            var new_left = pos.left + ev.clientX - old_x;
            var new_top_b = (100 * new_top / $svg_map.height()).toFixed(0);
            var new_left_b = (100 * new_left / $svg_map.width()).toFixed(0);
            $this.css({top: new_top_b + '%', left: new_left_b + '%'});
            ev.stopPropagation();
            return false;
        }

        $(document).bind('mousemove', doc_mousemove);

        $(document).one('mouseup', function () {
            save_locate({
                icon_width: $this.width(),
                icon_height: $this.height(),
                no: $this.attr('data-no'),
                ty: $this.attr('data-ty'),
                x: $this.position().left.toFixed(0),
                y: $this.position().top.toFixed(0)
            });
            $(document).unbind('mousemove', doc_mousemove);
        });
        e.stopPropagation();
        return false;
    });
    if (vm.type != row.ty) {
        $icon.hide();
    }

    $icon.appendTo($svg_map_div);

}

function save_locate(json) {

    json.locate = JSON.stringify({
        area: [json.x + "," + json.y],
        width: $svg_map.width(),
        height: $svg_map.height()
    });

    // console.log(json);
    var url;
    if (json.ty == 'equip') {
        url = '/2.2.05_P001/base_api/env/setting/save_locate';
    } else if (json.ty == 'relic') {
        url = '/2.2.05_P001/base_api/relic/setting/save_locate';
    } else {
        return;
    }
    if (_.contains(['展厅', '库房', '区域', '修复室', '研究室'], vm.env.type)) {
        var _env_no = find_env_no(json.x, json.y);

        if (_env_no) {
            json.env_no = _env_no;
        } else {
            json.env_no = vm.env_no;
        }
    } else {
        json.env_no = vm.env_no;
    }
    // console.log(json);
    $.post(url, json, function () {
        if (json.ty == 'equip') {
            load_equip(vm.env_no, {
                equip_locate_callback: function () {
                    scroll_equip_relic(json);
                }
            });
        } else if (json.ty == 'relic') {
            load_relic(vm.env_no, {
                equip_locate_callback: function () {
                    scroll_equip_relic(json);
                }
            });
        }
    });

}

function scroll_equip_relic(json) {
    var $li = $('.menu_box div.' + json.ty + ' li[data-' + json.ty + '_no=' + json.no + ']');
    if (!$li[0]) {
        return;
    }
    var pos = $(_.last($li)).position();
    if (pos) {
        $('.menu_box > div.box').scrollTop(pos.top);
    }

}

function sel_locate(ty, types) {

    $svg_map_div.find('.museum_icon').each(function () {
        var $this = $(this);
        var type = $this.attr('data-type');
        var ty = $this.attr('data-ty');
        if (types && types.length > 0 && !_.contains(types, type)) {
            $this.hide();
        } else {
            $this.show();
        }
        if (vm.type != ty) {
            $this.hide();
        }
    })

}


function del_locate(json) {

    json.locate = "";
    json.remove_all = 1;

    var url;
    if (json.ty == 'equip') {
        url = '/2.2.05_P001/base_api/env/setting/save_locate';
    } else if (json.ty == 'relic') {
        url = '/2.2.05_P001/base_api/relic/setting/save_locate';
    } else {
        return;
    }

    $.post(url, json, function () {
        if (json.ty == 'equip') {
            $svg_map_div.find('div.museum_icon[data-ty=components][data-no=' + json.no + ']').remove();
            load_equip(vm.env_no);
        } else if (json.ty == 'relic') {
            $svg_map_div.find('div.museum_icon[data-ty=relic][data-no=' + json.no + ']').remove();
            load_relic(vm.env_no);
        }
    });

}


function load_tree(env_no) {
    $.get('/2.2.05_P001/base_api/base/envs/tree', function (json) {
        if (json&&json.error) {
            vm.$Message.error(json.error);
            // alert(json.msg);
            return;
        }
        if (!json || json == '[]') {
            return;
        }
        _.map(json, function (row) {
            row.open = true;
        });

        var zNodes = [{
            env_no: '',
            open: true,
            name: window.web_config.museum_name,
            type: window.web_config.museum_name,
            children: json,
            disabled: true
        }];

        var zSetting = {
            view: {
                addHoverDom: false,
                removeHoverDom: false,
                dblClickExpand: false,
                showLine: false,
                selectedMulti: false,
                showIcon: false
            },
            data: {
                simpleData: {
                    enable: true,
                    idKey: "env_no",
                    pIdkey: "parent_env_no"
                }
            },
            edit: {
                enable: false
            },

            callback: {
                onClick: function (e, treeId, treeNode) {
                    window.location.href = '#/env_layout/' + treeNode.env_no + '/' + vm.type;
                }
            }
        };

        var treeObj = $.fn.zTree.init($('#env_tree_ul'), zSetting, zNodes);

        var select_node;
        if (!env_no) {
            env_no = zNodes[0].env_no;
        }
        select_node = treeObj.getNodeByParam('env_no', env_no);
        if (select_node) {
            treeObj.selectNode(select_node);
        }
    });
    var env_tree = $('#select_env_layout .env_tree');
    $('#select_env_layout span.t').on('click', function (e) {
        if (env_tree.is(':hidden')) {
            window.draw_close && window.draw_close();
            env_tree.show();
            $(document).one('click', function () {
                env_tree.hide();
            });
        } else {
            env_tree.hide();
        }
        e.stopPropagation();
    });
    env_tree.on('click', function (e) {
        e.stopPropagation();
    });

}

function find_env_no(x, y) {
    var _env_no = false;
    $svg_map.find('polygon').each(function () {
        var points_str = $(this).attr('points');
        var _in = windingNumber(x, y, points_str);
        // console.log(_in, x, y, points_str);
        if (_in == 'in') {
            _env_no = $(this).attr('data-no');
            return false;
        }
    });
    return _env_no;
}

/**
 * @description 回转数法判断点是否在多边形内部
 * @param {Number} px 待判断的点x坐标
 * @param {Number} py 待判断的点y坐标
 * @param {String} poly_str 多边形顶点,"1,2 3,4 5,6"
 * @return {String} 点 p 和多边形 poly 的几何关系
 */
function windingNumber(px, py, poly_str) {
    var sum = 0;

    if (poly_str == '') {
        return 'out';
    }
    var poly = poly_str.split(' ');
    poly.push(poly[0]);
    // console.log(poly);
    for (var i = 0, l = poly.length, j = l - 1; i < l; j = i, i++) {
        var sxy = poly[i].split(','),
            sx = sxy[0],
            sy = sxy[1],
            txy = poly[j].split(','),
            tx = txy[0],
            ty = txy[1];

        // 点与多边形顶点重合或在多边形的边上
        if ((sx - px) * (px - tx) >= 0 && (sy - py) * (py - ty) >= 0 && (px - sx) * (ty - sy) === (py - sy) * (tx - sx)) {
            return 'on';
        }

        // 点与相邻顶点连线的夹角
        var angle = Math.atan2(sy - py, sx - px) - Math.atan2(ty - py, tx - px);

        // 确保夹角不超出取值范围（-π 到 π）
        if (angle >= Math.PI) {
            angle = angle - Math.PI * 2;
        } else if (angle <= -Math.PI) {
            angle = angle + Math.PI * 2;
        }

        sum += angle;
    }

    // 计算回转数并判断点和多边形的几何关系
    return Math.round(sum / Math.PI) === 0 ? 'out' : 'in'
}
});