var vm, treeObj, time;
var type_lists = [
    [window.web_config.app_name],
    ['楼栋', '室外环境'],
    ['楼层'],
    ['展厅', '库房', '区域', '修复室', '研究室'],
    ['展柜', '存储柜', '安防展柜']
];
var router = require('common/router');
exports.init = function (env_no) {
    $('#content').load('env.html?date=' + new Date() * 1, function () {
        load_tree(env_no);
        vm = new Vue({
            el: '#content',
            data: {
                env_type_list: [],
                env: {},
                msg: '',
                pic_list: [],
                treeNoList:[],
                root_tag:false,
                editHref:''
            },
            methods: {
                getTreeNo: getTreeNo,
                save_env: save_env,
                upload_layout: upload_layout,
                upload_pic: upload_pic,
                del_layout: del_layout,
                del_pic: del_pic,
                set_home_pic: set_home_pic
            }
        });

    });
};

function load_tree(env_no) {
    $.get(API('/base/envs/tree'), function (json) {
        var noList = [];
        treeCycle(json,noList);
        vm.$set('treeNoList',noList);
        getTreeNo(noList,env_no);
        if(json.error){
            vm.$Message.error(json.error);
            return;
        }
        if (!json || json == '[]') {
            return;
        }
        _.map(json, function (row) {
            row.open = true;
        });
        console.log(json);
        var zNodes = [{
            env_no: window.web_config.museum_no,
            open: true,
            name: window.web_config.app_name,
            type: window.web_config.app_name,
            museum_name: window.web_config.museum_name,
            _is_root: true,
            children: json,
            disabled: true
        }];

        var zSetting = {
            view: {
                addHoverDom: addHoverDom,
                removeHoverDom: removeHoverDom,
                dblClickExpand: false,
                showLine: false,
                selectedMulti: false,
                showIcon: false
            },
            data: {
                simpleData: {
                    enable: true,
                    idKey: "env_no",
                    pIdkey: "parent_env_no"
                }
            },
            edit: {
                enable: true,
                drag: {
                    isCopy: false,
                    isMove: false
                },
                editNameSelectAll: true,
                removeTitle: '删除环境',
                showRemoveBtn: function (treeId, treeNode) {
                    if (treeNode.env_no == window.web_config.museum_no) {
                        return false;
                    }
                    if (treeNode.children && treeNode.children.length > 0) {
                        return false;
                    }
                    return true;
                },
                showRenameBtn: false
            },

            callback: {
                onClick: function (e, treeId, treeNode) {
                    select_env(treeNode);
                },
                beforeRemove: function (treeId, treeNode) {
                    delete_env(treeNode);
                    return false;
                }
            }
        };
        treeObj = $.fn.zTree.init($('#env_tree_ul'), zSetting, zNodes);
        //console.log($('#env_tree_ul a[title]'));
        // $('#env_tree_ul a[title]').each(function () {
        //     $(this).find('span:not(.button)').attr('data-title', $(this).attr('title'));
        // });
        var select_node;
        if (!env_no) {
            env_no = zNodes[0].env_no;
        }
        select_node = treeObj.getNodeByParam('env_no', env_no);

        if (select_node) {
            treeObj.selectNode(select_node);
            select_env(select_node);
        }

        $('#env_info').show();
    });
}

function treeCycle(data,noList){
    _.forEach(data,function(elem,index){
        noList.push(elem.env_no);
        if (elem.children){
            treeCycle(elem.children,noList);
        }
    });
}

function getTreeNo(list,no){
    var judge = list.some(function(elem){
        return elem == no;
    });
    if (!judge){
        vm.$set('root_tag',true);
        $("#env_info .ability div").css({
            'backgroundColor' : '#c5c5c5',
            'cursor':'not-allowed'
        });
        $("#env_info .ability div").eq(1).find("a").css({
            'cursor':'not-allowed'
        });
    }else if (judge){
        vm.$set('root_tag',false);
        $("#env_info .ability div").css({
            'backgroundColor' : '#ffffff',
            'cursor':'pointer'
        });
        $("#env_info .ability div").eq(1).find("a").css({
            'cursor':'pointer'
        });
    }
}
function addHoverDom(treeId, treeNode) {
    var sObj = $("#" + treeNode.tId + "_span");
    if (treeNode.editNameFlag || $("#addBtn_" + treeNode.tId).length > 0) return;
    if (_.contains(type_lists[4], treeNode.type)) {
        return;
    }
    var addStr = "<span class='button add' id='addBtn_" + treeNode.tId
        + "' title='添加子环境' onfocus='this.blur();'></span>";
    sObj.after(addStr);
    var btn = $("#addBtn_" + treeNode.tId);
    if (btn) btn.bind("click", function () {
        add_env(treeNode);
        return false;
    });
}

function removeHoverDom(treeId, treeNode) {
    $("#addBtn_" + treeNode.tId).unbind().remove();
}

function select_env(node) {
    getTreeNo(vm.treeNoList,node.env_no);
    vm.$set('editHref','#/env_layout/' + node.env_no)
    router.set('/env/' + node.env_no);
    vm.$set('env_type_list', type_lists[find_type_index(node.type)]);
    if (node.env_no == "") {
        node.map = window.web_config.bg;
    }
    vm.$set('env', node);
    load_pic(node.env_no);
}

function find_type_index(type) {
    var type_index = 0;
    _.each(type_lists, function (arr, index) {
        if (_.contains(arr, type)) {
            type_index = index;
        }
    });
    return type_index;
}

function add_env(treeNode) {
    var parent_env_no = treeNode.env_no;
    //2017-5-26:曾竞注释,取消根节点博物馆环境编号比对逻辑
    // if (parent_env_no == window.web_config.museum_no) {
    //     parent_env_no = "";
    // }
    // console.log(treeNode);//被点击添加的层级,新节点的父节点
    $.get(API('/base/envs/add/' + parent_env_no), function (json) {
        var type_index = find_type_index(json.parent_type);
        var type = type_lists[type_index + 1][0];
        var newNodes = treeObj.addNodes(treeNode, {
            env_no: json.env_no,
            name: '新' + type,
            type: type,
            parent_env_no: parent_env_no,
            sort: 0
        });
        if (newNodes) {
            newNodes[0].new_node = true;
            treeObj.selectNode(newNodes[0]);
            select_env(newNodes[0]);
        }

    }, 'json');

}

function delete_env(treeNode) {

    layer.confirm('确认删除', {btn: ['删除', '取消']}, function (index) {
        $.post(API('/base/envs/delete/' + treeNode.env_no), function (json) {

            var select_node = treeObj.getNodeByParam('env_no', treeNode.parent_env_no);
            if (select_node) {
                treeObj.selectNode(select_node);
                select_env(select_node);
            }
            treeObj.removeNode(treeNode);
        }, 'json');
        layer.close(index);
    });

}

function save_env() {
    var env = vm.$get('env');
    vm.$set('msg', '保存中...');
    var json = {};
    json.env_no = env.env_no;
    json.name = env.name;
    json.type = env.type;
    json.parent_env_no = env.parent_env_no;
    json.sort = env.sort;
    json.map = env.map;
    if (env._is_root) {
        json.app_name = env.name;
        json.museum_name = env.museum_name;
        json.type = env.name;
    }
    if (json.name == '') {
        vm.$set('msg', '请输入环境名称');
        return;
    }

    clearTimeout(time);
    var url = API('/base/envs/edit/' + env.env_no);
    if (env.new_node) {
        url = API('/base/envs/add/' + env.env_no);
    }
    if (env._is_root) {
        url = API('/base/setting/bg');
    }
    $.post(url, json, function (rjson) {
        if (rjson.error) {
            // set_msg_timeout(rjson.error);
            vm.$Message.error(rjson.error);
            return;
        }
        // set_msg_timeout(rjson.msg);
        vm.$Message.success(rjson.msg);
        vm.$set('msg', ' ');
        // 当设置环境编号为空或者编辑根节点时,刷新页面;
        if (env.env_no == ''||env._is_root) {
            window.location.reload();
        }
        load_tree(json.env_no);
    });

}

function set_msg_timeout(msg) {
    vm.$set('msg', msg);

    time = setTimeout(function () {
        vm.$set('msg', '');
    }, 3000);
}

var upload = require('common/upload');

function upload_layout() {
    var root_tag = vm.$get('root_tag');
    if (root_tag){
        return ;
    }
    upload({
        data: {
            path: 'area',
        },
        accept: 'image/jpg,image/jpeg,image/png',
        success: function (data) {
            if (data.error) {
                layer.msg(data);
                console.error(data);
                return;
            }
            vm.$set('env.map', data.url);
            save_env();
        },
        error: function (data) {
            layer.msg('布局图上传失败');
            console.error(data);
        }
    });
}

function del_layout() {
    layer.confirm('确认删除', {btn: ['删除', '取消']}, function (index) {
        vm.$set('env.map', '');
        save_env();
        layer.close(index);
    });
}

function upload_pic() {

    upload({
        data: {
            path: 'area',
        },
        accept: 'image/jpg,image/jpeg,image/png',
        success: function (data) {
            if (data.error) {
                layer.msg(data);
                console.error(data);
                return;
            }
            add_env_pic(data.url);
        },
        error: function (data) {
            layer.msg('布局图上传失败');
            console.error(data);
        }
    });
}


function load_pic(env_no) {
    if (!env_no) {
        env_no = vm.env.env_no;
    }
    $.get(API('/base/setting/pic/' + env_no), function (data) {
        if (!data || data == '[]') {
            return;
        }
        vm.$set('pic_list', data);
    }, 'json');
}

function add_env_pic(url) {

    $.post(API('/base/setting/pic/' + vm.env.env_no), {url: url}, function (data) {
        load_pic();
    }, 'json');

}

function del_pic(id) {
    layer.confirm('确认删除', {btn: ['删除', '取消']}, function (index) {
        $.post(API('/base/setting/pic_del/' + id), function (data) {
            load_pic();
        }, 'json');
        layer.close(index);
    });
}

function set_home_pic(id) {
    $.post(API('/base/setting/pic_home/' + id), function (data) {
        load_pic();
    }, 'json');
}