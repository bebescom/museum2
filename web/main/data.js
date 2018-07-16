define('main/data', function(require, exports, module) {
// 
// 
// 
// 
// 
// 

exports.init = function () {
    require.urlArgs = '?date=' + new Date() * 1;
    show_main_move();
    getDatas();
};

laydate.skin('molv');

function getDatas() {

    $.get('/2.2.05_P001/base_api/base/users/favorite/datas', function (data) {
        $('#data_scroll').css('background','none');
        if (data['error']) {
            console.error(data);
            return;
        }
        if (!data['datas'] || data.datas.length == 0) {
            data.datas = _.keys(datas);
        }
        var index=data.datas.indexOf('气象站数据');
        if(index!=1){
            data.datas.push(data.datas.splice(index,1));
        }
        _.each(data.datas, function (name) {
            if (_.has(datas, name)) {
                show_datas.push(name);
                $('#data_scroll').append('<div id="data_' + datas[name] + '" class="data_box">' +
                    '<div class="title"><span>' + name + '</span><div class="right"><span>详情</span></div></div>' +
                    '<div class="box"></div>' +
                    '</div>');

                require.async('data.async/' + datas[name], function (a) {
                    var init=a.init();
                });
            }
        });

    }, 'json');
}

exports.scroll_init=function(ul,drag_area,slider,box) {

    var max_top, max_scrollTop, max_slider, scale;

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

    slider.mousedown(function (e) {
        init();
        var old_y = e.clientY;
        var cur = box.scrollTop();

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

        box.scrollTop(top);
        slider.css({top: top * scale});
    }
}


var show_datas = [];
var datas = {};
datas['微环境调控'] = 'micro_env_ctl';
datas['展出文物概况'] = 'relic';
datas['气象站数据'] = 'weather';
datas['特别关注24h箱线图'] = 'box_line';
datas['中环境24h均峰图'] = 'env_param';
datas['区域湿度24h稳定性'] = 'area_humidity';
datas['特别关注'] = 'follow';

function show_main_move() {

    var old_x;

    $('#show_main').mousedown(function (e) {
        var $this = $(this);

        var offset = $this.offset();
        old_x = e.pageX;
        var _x = e.pageX - offset.left;

        function show_main_mousemove(ev) {
            $this.css('left', ev.pageX - _x);
            return false;
        }

        $(document).bind('mousemove', show_main_mousemove);

        $(document).one('mouseup', function () {
            $(document).unbind('mousemove', show_main_mousemove);
        });
        e.stopPropagation();
        return false;
    }).mouseup(function (e) {
        var x = e.pageX;
        if (old_x == x) {
            require('common/router').path('/');
        }
    });
}
});