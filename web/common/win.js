define('common/win', function(require, exports, module) {
// 
// 
var vm = new Vue({});


var router = require('common/router');

exports.open = function (opt) {

    opt = _.defaults(opt, {
        id: _.uniqueId('win_'),
        width: 600,
        height: 400,
        title: '',
        contents: '',
        url: '',
        type: 'get',
        data: '',
        modal: true,
        onClose: function () {
        },
        onComplete: function () {
        }
    });
    if ($('#' + opt.id)[0]) {
        $('#' + opt.id + ',#shadow_' + opt.id).remove();
    }
    $('body').append('<div id="' + opt.id + '" class="win_box">' +
        '<div class="win_top"><i class="win_close"></i><h1>' + opt.title + '</h1></div>' +
        '<div class="win_content">' + opt.contents + '</div>' +
        '</div>');
    if (opt.modal) {
        $('body').append('<div id="shadow_' + opt.id + '" class="win_shadow"></div>')
    }
    var $win = $('#' + opt.id);
    if (opt.width) {
        $win.width(opt.width);
    }
    if (opt.height) {
        $win.height(opt.height);
    }

    if (opt.contents != '') {
        ajaxSuccess(opt.contents);
    } else {
        $.ajax({
            type: opt.type,
            url: opt.url,
            data: opt.data,
            success: function (data) {
                try {
                    var json = $.parseJSON(data);
                    if (json['error']) {
                        // console.error(data);
                        // alert(data.error);
                        vm.$Message.error(data.error);
                        return false;
                    }
                } catch (e) {
                    ajaxSuccess(data);
                }
            }
        });
    }

    function ajaxSuccess(content) {
        $win.find('.win_content').html(content);
        resize();
        opt.onComplete && opt.onComplete.call($win);
        $win.show();
        $win.find('i.win_close,.close').click(destroy);
    }

    function destroy() {
        opt.onClose && opt.onClose.call($win);
        $win.remove();
        $('#shadow_' + opt.id).remove();
        window.onhashchange='';
        location.hash='#/';
        window.onhashchange=router.start;
    }

    function resize() {

        var left = ($(window).width() - $win.width()) / 2;
        var top = ($(window).height() - $win.height()) / 2;
        $win.find('.win_content').height($win.height() - $win.find('.win_top').height() - 20);

        $win.css({left: left, top: top});
    }

    $(window).on('resize', function () {
        resize();
    });

};

exports.close_all = function () {
    $('.win_box,.win_shadow').remove();
};
});