// @require ../common/css/font.css
// @require ../common/css/icon.css
// @require css/equip.css
// @require echarts
// @require layer
// @require css/topology.css
// @require D3

require('common/header');
require('common/left');
require('common/upload');

var router = require('common/router');

if (!window.checkPermissions({name: '设备管理'})) {
    return;
}

$('#left .equipment').addClass('v-link-active');

function heightInit() {
    var Height = $(window).height() - $('#header').height(),
        $leftSlider = $('#left'),
        $content = $('#content');
    $leftSlider.height(Height);
    $content.height(Height);
    $content.css('width', $(window).width() - $leftSlider.width());
}

$(window).resize(function () {
    heightInit();
});

router({
    when: {
        '/': function () {
            my_store.session.clear();//清除定义前缀m的本地存储
            router.path('/equip_list');
        },
        '/equip_list': function () {
            require('./equip_list').init();
        },
        '/equip_info/:env_no/:alertTime': function (env_no, alertTime) {
            require('./equip_info').init(env_no, alertTime);
        },
        '/topology': function () {
            require('./topology').init();
        },
        '/equip_alert': function () {
            require('./equip_alert').init();
        }

    }
});

$('body').tooltip({key: true, style: {height: '28px'}});
heightInit();