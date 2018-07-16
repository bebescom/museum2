define('setting', function(require, exports, module) {
// 
// 
// 
// 
// 
// 
// 
// 

//
//
//


require('common/header');
require('common/left');
var router = require('common/router');
if(!window.checkPermissions({name:'设置环境'})){
    return;
}

$('#left .integrated').addClass('v-link-active');

function heightInit() {
    var Height = $(window).height() - 83,
        $leftSlider = $('#left'),
        $content = $('#content');
    $leftSlider.css('height', Height + 'px');
    $content.css('height', Height + 'px');
}
$(window).resize(function () {
    heightInit();
});


router({
    when: {
        '/': function () {
            router.path('/env');
        },
        '/env/:env_no': function (env_no) {
            require('setting/env').init(env_no);
        },
        '/env_layout/:env_no/:type': function (env_no, type) {
            require('setting/env_layout').init(env_no, type);
        }
    }
});

$('body').tooltip({key: true, style: {height: '28px'}});
});