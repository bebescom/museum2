// @require $
// @require _
// @require ../common/css/font.css
// @require ../common/css/icon.css
// @require ../capsule/css/index.css
// @require css/vibration.css

//@require tooltip
//@require layer

require('common/header');
require('common/left');
var router = require('common/router');

$('#left .vibration').addClass('v-link-active');

function heightInit() {
    var Height = $(window).height() - $('#header').height(),
        $leftSlider = $('#left'),
        $content = $('#content');
    $leftSlider.css('height', Height + 'px');
    $content.css('height', Height + 'px');

}
$(window).resize(function () {
    heightInit();
});
heightInit();

router({
    when: {
        '/': function () {
            router.path('/now');
        },
        '/now': function () {
            require('./now').init();
        },
        '/history': function () {
            require('./history').init();
        }
    }
});


$('body').tooltip({key: true, style: {height: '28px'}});