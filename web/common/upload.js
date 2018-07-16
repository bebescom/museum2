define('common/upload', function(require, exports, module) {
// 
// 

module.exports = function (json) {
    //本方法无法跨越返回数据
    json.data = json.data || {};
    json.data.access_token = top.window.web_config.token;
    $.ajaxFileUpload({
        url: '/2.2.05_P001/base_api/base/upload', //用于文件上传的服务器端请求地址
        secureuri: false, //是否需要安全协议，一般设置为false
        dataType: 'json', //返回值类型 一般设置为json
        befre_submit: function () {
            $('#upload_mask').remove();
            $('<div>', {
                id: 'upload_mask',
                class: 'upload_mask'
            }).html('<div>图片上传中...</div>').appendTo('body');
        },
        success: function (data) {
            $('#upload_mask').remove();
            json.success && json.success(data);
        },
        error: function (data) {
            $('#upload_mask').remove();
            json.error && json.error(data);
        },
        accept: json.accept,
        data: json.data,
    });
};
});