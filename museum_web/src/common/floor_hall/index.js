//@require $
//@require bootstrap.css
//@require bootstrap
//@require index.css
//@require common/css/font.css
//@require tooltip

function menu_init(env_no) {
    require('./monitor').init(env_no);
    require('./relic').init(env_no);
    require('./net').init(env_no);
    require('./contrast').init(env_no);
    $('body').tooltip({key:true,style:{height:'28px'}});
    events();
}
// 初始化楼层,只显示网络设备,其他设备,文物不显示(取消此限制)
exports.floor_init = function (env_no, svg_map) {
    require('./map').init(env_no, {
        // show_small_env: false,
        // show_micro_env: false,
        // show_network: true,
        // show_relic: false,
        svg_map: svg_map
    });
    menu_init(env_no);
};
//初始化展厅,所有的设备文物均显示
exports.hall_init = function (env_no, svg_map) {
    require('./map').init(env_no, {
        svg_map: svg_map
    });
    menu_init(env_no);

};

function events() {
    //点击切换右侧图标
    $('.panel-heading').click(function () {
        $(this).parent().toggleClass('active')
            .siblings('.panel-default').removeClass('active');
    });
}

$('.show_menu').css('max-height',$('.map_view_mask').height());

