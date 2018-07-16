define('floor', function(require, exports, module) {
//
//
//
//
//

require('common/header');
require('common/left');
var router = require('common/router');
$('#left').find('li').filter('.integrated').addClass('v-link-active');

var env_no = router.get('env_no');
var cut=true;

require('common/nav/nav').init(env_no);

var colorT = $(".temperatureColor div");
$(".tooltip_fox").text("").css("display","none");//初始隐藏tooltip
colorT.mouseover(function(e){
    var indexT = $(this).eq(0).attr("index");
    var setAttrT = "polygon[colorindex='"+ indexT +"']";
    $("#svg_map polygon").css("display","none");
    $(setAttrT).css("display","block");
    var intervalT = parseFloat($("#svg_map polygon").eq(0).attr("interval"));
    var minvalueT = parseFloat($("#svg_map polygon").eq(0).attr("minvalue"));
    var maxvalueT = parseFloat($("#svg_map polygon").eq(0).attr("maxvalue"));
    var startvalueT = minvalueT + intervalT*indexT;
    var lastvalueT = minvalueT + intervalT*indexT+intervalT;
    if (intervalT === 8){
        lastvalueT = maxvalueT;
    }
    var tooltipIndexT = -(indexT-8);
    $(".tooltip_fox").text(keepTwoDecimalFull(startvalueT) + "~" + keepTwoDecimalFull(lastvalueT)).css("top",tooltipIndexT*20+"px");
});
//湿度颜色条交互
var colorH = $(".humidityColor div");
colorH.mouseover(function(e){
    var indexH = $(this).eq(0).attr("index");
    var setAttrH = "polygon[colorindex='"+ indexH +"']";
    $("#svg_map polygon").css("display","none");
    $(setAttrH).css("display","block");
    var intervalH = parseFloat($("#svg_map polygon").eq(0).attr("interval"));
    var minvalueH = parseFloat($("#svg_map polygon").eq(0).attr("minvalue"));
    var maxvalueH = parseFloat($("#svg_map polygon").eq(0).attr("maxvalue"));
    var startvalueH = minvalueH + intervalH*indexH;
    var lastvalueH = minvalueH + intervalH*indexH+intervalH;
    if (intervalH === 8){
        lastvalueH = maxvalueH;
    }
    var tooltipIndexH = -(indexH-8);
    $(".tooltip_fox").text(keepTwoDecimalFull(startvalueH) + "~" + keepTwoDecimalFull(lastvalueH)).css("top",tooltipIndexH*20+"px");
});
colorH.mouseout(function(e){
    $("#svg_map polygon").css("display","block");
});
$(".color_distinguish").mouseover(function(e){
    $(".tooltip_fox").css("display","block");
});
$(".color_distinguish").mouseout(function(e){
    $(".tooltip_fox").text("").css("display","none");
    $("#svg_map polygon").css("display","block");
});

var $img_box=$('.img_box'),
    $map_view=$('.map_view'),
    oldWidth;
var vm = exports.vm = new Vue({
    el: '.map_view',
    data: {
        floor: {
            name: '',
            map: ''
        },
        lin:true,
        showDistinguish:false,
        temperatureColor:[
            'rgba(173,59,45,1)',
            'rgba(226,85,66,1)',
            'rgba(237,118,102,1)',
            'rgba(236,156,145,1)',
            'rgba(255,224,220,1)',
            'rgba(193,222,242,1)',
            'rgba(136,198,236,1)',
            'rgba(66,155,210,1)',
            'rgba(9,105,166,1)'
        ],
        humidityColor:[
            'rgba(16,78,159,1)',
            'rgba(78,127,190,1)',
            'rgba(98,160,212,1)',
            'rgba(142,207,237,1)',
            'rgba(188,231,246,1)',
            'rgba(249,227,207,1)',
            'rgba(218,184,148,1)',
            'rgba(184,137,104,1)',
            'rgba(161,105,81,1)'
        ],
        configLanguage: window.languages,
    },
    methods: {
        key:function(){
            var imgBoxHeight=$img_box.height(),
                mapViewHeight=$map_view.height();
            //如果图片容器高度超出父级容器高度
            if (imgBoxHeight>mapViewHeight) {
                var beyond=imgBoxHeight-mapViewHeight;//将超出高度进行百分比缩放
                oldWidth=(1-beyond/imgBoxHeight)*100;
            }else{
                oldWidth=100;
            }
            $img_box.css('width',oldWidth+'%').css({'margin-top':-($img_box.height()/2),'margin-left':-($img_box.width()/2)});
            $img_box.find('img').css('opacity',1);
            $map_view.css('background','none');
        }
    }
});

$.get('/2.2.05_P001/base_api/base/envs/info/' + env_no+'', function (data) {
    if (!data.map || data.map == '') {
        data.map = '../common/images/layout_default.jpg';
        cut=false;
    }
    vm.$set('floor', data);
    document.title = data.name + '-' + document.title;

    $.get('/2.2.05_P001/base_api/base/envs', {parent_env_no: env_no}, function (data) {
        get_svg(data);
    }, 'json');
}, 'json');

function keepTwoDecimalFull(num) {//四舍五入，保留两位小数
    var result = parseFloat(num);
    if (isNaN(result)) {
        return false;
    }
    result = Math.round(num * 100) / 100;
    var s_x = result.toString();
    var pos_decimal = s_x.indexOf('.');
    if (pos_decimal < 0) {
        pos_decimal = s_x.length;
        s_x += '.';
    }
    while (s_x.length <= pos_decimal + 2) {
        s_x += '0';
    }
    return s_x;
}

function get_svg(data) {
    require('common/floor_hall/index').floor_init(env_no, '#svg_map');
    if(cut){
        roller();//先执行,绑定mousewheel事件有先后顺序
        dragImg();
	    if (data.total == 0) {
	        return;
	    }
    }
    var draw = require('common/draw');
    var svg = draw({
        el: '#svg_map',
        data: data.rows,
        mousedown:function(){

        },
        mouseup:function(env_no){
            location.href = '../hall?env_no=' + env_no;
        },
        draw: true
    });
}
function roller(){
    var _x,_y,offsetX,offsetY,newOffsetX,newOffsetY,
        width=0,
        top=0,
        left=0,
        i=0,
        newWidth=oldWidth?oldWidth:100;

    $('.map_view')
        .bind('mousewheel',function(e){
            e.preventDefault();
            offsetX=e.clientX-$img_box.offset().left;
            offsetY=e.clientY-$img_box.offset().top;

            _x=offsetX/$img_box.width();
            _y=offsetY/$img_box.height();

            i+=e.deltaY;
            width=i*10;

            $img_box.css({'width':newWidth+width+'%'});
            $img_box.css({'margin-top':-($img_box.height()/2),'margin-left':-($img_box.width()/2)});
            
            if (i>=5&&i<10) {
//              $('.map_view .type').css({transform:'scale(0.7,0.7)'});
            }else if(i>=10){
//              $('.map_view .type').css({transform:'scale(1.3,1.3)'});
            }
        })
        .find('.btn_view').bind('click',function(){
            reset_();
        	i=0;
//	      	$('.map_view .type').css({transform:'scale(0.7,0.7)'});
        });
}

function reset_(){
    // console.log('重置尺寸');
    $img_box.css('width',(oldWidth||100)+'%').css({left:'50%',top:'50%','margin-top':-($img_box.height()/2),'margin-left':-($img_box.width()/2)});
}

function dragImg(){
    $('.map_view').mousedown(function(e){
        _x=e.clientX-$img_box.position().left;
        _y=e.clientY-$img_box.position().top;

        $(document).bind('mousemove',function(e){
            var x=e.clientX-_x,
                y=e.clientY-_y;

            $img_box.css({left:x,top:y});
        });

        $(document).bind('mouseup',function(){
            $(document).unbind('mousemove').unbind('mouseup');
        });
        e.preventDefault();
    });
}
});