define('common/nav/nav', function(require, exports, module) {
//
//

var header = require('common/header');
exports.init = function (env_no, path, callback) {
    var url = "..\/capsule\/#!\/integrated";
    var $dl = $('#nav dl');
    var _this = this;
    $dl.append('<dd><a href=\'javascript:goPermission('+ JSON.stringify({name:"综合管理",url:url}) + ')\' target="_self">' + window.web_config.museum_name + '</a></dd>');

    $.get('/2.2.05_P001/base_api/base/envs/navigation/' + env_no+'', function (data) {
        if(data.error){
            header.vm.$Message.error(data.error);
            return;
        }
        // console.log(data);
        if (!data || !data['total']) {
            return;
        }
        var str='';
        _.each(data.rows, function (row) {
            // 楼栋不初始化面包屑导航
            if(row.type==='楼栋'){
                str += '<dd class="noIcon">'+ row.name + '</dd>';
            }
            // console.log(row);
            var link = navs[row.type](row.env_no);
            if(!link){
                return; 
            }
            url = link;
            // url = "../capsule/#!/environment/environment_details/" + row.env_no;
            // $dl.append('<dd><a href="' + path + navs[row.type](row.env_no) + '">' + row.name + '</a></dd>');
            str += '<dd><a href=\'javascript:goPermission('+ JSON.stringify({name:"环境监控",url:url}) +')\'>' + row.name + '</a></dd>';
        });
        $dl.append(str);
        callback && callback($dl);
    }, 'json');
};

var navs = {
    "楼栋": function (env_no) {
        // return 'cabinet?env_no=' + env_no;
    },
    "楼层": function (env_no) {
        return '../floor?env_no=' + env_no;
    },
    "展厅": function (env_no) {
        return '../hall?env_no=' + env_no;
    },
    "展柜": function (env_no) {
        // return 'cabinet?env_no=' + env_no;
    },
    "库房": function (env_no) {
    	return '../hall?env_no=' + env_no;
    },
    "存储柜":function(env_no) {
    	// return 'cabinet?env_no=' + env_no;
    },
    "安防展柜":function(env_no) {
    	// return 'cabinet?env_no=' + env_no;
    },
    "修复室":function(env_no){
    	return '../hall?env_no=' + env_no;
    },
    "研究室":function(env_no){
    	return '../hall?env_no=' + env_no;
    }
};
});