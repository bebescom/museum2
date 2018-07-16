// @require css/main.css
// @require $
//@require mousewheel
// @require _

require('common/header');
require('common/left');
var router = require('common/router');

function show_data() {
    require('../common/win').close_all();
    $('#data').load('data.html?date=' + new Date() * 1, function () {
        require('./data').init();
        $('#wrap').animate({top: '-100%'});
    });

}

function show_main() {

    $('#content').load('main.html?date=' + new Date() * 1, function () {
        getSvg();
        require('./footer').init();
        require('./right').init();

        $('#wrap').animate({top: 0});
        show_main.init = true;

    });

}
show_main.init = false;

router({
    when: {
        '/': function () {
            require('../common/win').close_all();
            show_main();
        },
        '/data': function () {
            require('../common/win').close_all();
            show_data();
        },
        '/floor/:env_no/:floor_no': function (env_no, floor_no) {
            if (!show_main.init) {
                show_main();
            }
            $('#win_floor,#shadow_win_floor').bind('mousewheel',function(e){
            	e.stopPropagation();
            	e.preventDefault();
            });
            require('./floor').open(env_no, floor_no);
        }
    }
});
var draw = require('common/draw');
function getSvg() {

    $.get(API('/base/envs'), {type: '楼栋'}, function (data) {
        if (data.total == 0) {
            return;
        }
        var svg = draw({
            el: '#svg_area',
            data: data.rows,
            mouseup: function (env_no) {
                require('./floor').open(env_no);
            },
            draw: true,
            draw_before: function () {
                $('#main_right,#footer').hide();
            },
            draw_after:function(){
                $('#main_right,#footer').show();
            }
        });
    });
}
var old_time=new Date().getTime();	//事件执行的时间
var old_time1=new Date().getTime(); //鼠标滚动的间隔时间
$(document).bind('mousewheel',function(e){
	var new_time1=new Date().getTime();
	if(new_time1-old_time1<200){		//200ms之类滚动两次
	    var new_time=new Date().getTime();
	    if (new_time-old_time<1000) {return;}		//1000ms之类只执行一次
	    old_time=new_time;
	    if (e.deltaY==1) {
	        window.location='#/';
	    }else{
	        window.location='#/data';
	    }
	}
	old_time1=new_time1;
});

$('body').tooltip({key:true});


