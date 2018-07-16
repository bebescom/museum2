/*
 tooltip函数接受一个对象参数:
 {
 key:(boolean)true  //事件委托的方式，用于绑定元素过多或者动态加载的元素上，$(element)中的element作为外层委托对象
 :(boolean)false  //一次性绑定匹配到的元素，后续添加的元素无法绑定

 style:(object)  //一个CSS样式表
 }

 用途：匹配具有data-title属性的元素，并弹出增强的tooltip框
 */

(function ($) {
    var $toolBox = $('<div class="titlebox"><div class="content_Area"></div><span class="big"></span><span class="small"></span></div>'),
        $content_Area = $toolBox.find('.content_Area');
    var style = {
        position: 'absolute',
        padding: '5px 10px',
        height: '30px',
        'line-height': '20px',
        background: '#fff',
        color: '#333333',
        'font-size': '12px',
        'box-shadow': '0 0 15px #d4d4d4',
        'z-index': '99999',
        display: 'none',
        left: '-500px',
        'white-space': 'nowrap'
    };

    $.fn.tooltip = function (option) {
        var $obj = this;
        changeStyle(option.style || {});

        $toolBox.appendTo('body');
        if (!option.key) {      //元素
            mouse_ele($obj.filter('[data-title]'));
        } else {  //传递父级作为范围
            $obj.each(function () {
                mouse_live($(this));
            });
        }
    };

    function changeStyle(newStyle) {   //给toolbox确定css样式
        var background = '';
        if (newStyle) {
            var mergeStyle = $.extend({}, style, newStyle);
            $toolBox.css(mergeStyle);
            background = mergeStyle.background;
        } else {
            $toolBox.css(style);
            background = style.background;
        }
        $content_Area.css({
            'width': '100%',
            'height': '100%'
        });
        $toolBox.find('.big').css({
            'border': 'solid transparent',
            'border-top-color': background,
            'border-width': '7px',
            'position': 'absolute',
            'left': '45%',
            'bottom': '-12px'
        });
        // $toolBox.find('.small').css({
        //   'border': 'solid transparent',
        //   'border-top-color': background,
        //   'border-width': '5px',
        //   'position': 'absolute',
        //   'left': '48%',
        //   'bottom': '-10px'
        // })
    }

    function mouse_ele($objArr) {   //给元素绑定事件
        $objArr.each(function () {
            if (this.key) {
                return;
            }
            var $obj = $(this);
            $toolBox.css('display', 'block');
            $content_Area.html($obj.attr('data-title'));
            $obj.mouseenter(function () {
                $toolBox.css('display', 'block');
                $content_Area.html($(this).attr('data-title'));
            }).mousemove(function (e) {
                reset(e);
            }).mouseout(function () {
                $toolBox.css('display', 'none');
            });
            $obj[0].key = true;
        });
    }

    function reset(e) {
        var iw = $toolBox.innerWidth(), ih = $toolBox.innerHeight(), left = e.clientX, big_left = 45;
        var out_width = left + iw / 2 - $('body').width();
        if (out_width > 0) {
            big_left += 100 * out_width / iw;
            console.log(left, iw, out_width, big_left);
            left -= out_width;
        }
        $toolBox.find('.big').css({left: big_left + '%'});
        $toolBox.css({
            left: left,
            top: e.clientY + $(document).scrollTop(),
            'margin-left': -iw / 2,
            'margin-top': -ih - 16
        });
    }

    function mouse_live($obj) {    //事件委托
        $obj[0].onmousemove = function (e) {
            var $key = $(e.target);
            if (e.target.key || $key.attr('data-title') == '' || !$key.attr('data-title')) {
                return;
            }
            mouse_ele($key);
        };
    }
})(jQuery);