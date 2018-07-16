var vm;

var equipListParam = my_store.session('equip_search_page') || {
    index: 0,
    page: 1,
    limit: 20
};

exports.init = function () {
    //在content加载页面
    $('#content').load('equip_list.htm?date=' + new Date() * 1, function () {
        // console.log(my_store.session('equip_sel_equip_no'));
        vm = new Vue({
            el: '#app',
            data: {
                spinShow: true,//表格loading

                currentPage: equipListParam.page || 1,//当前页面，默认1
                pageListLen: 0,//每页条数
                pageListTotal: 0,//总条数
                equipListData: [],//设备列表数据

                equipListTableColumns: equipListTableColumns(), //设备列表表格Title数据

                sel_equip_no_list: my_store.session('equip_sel_equip_no') || [],//已选择表格选项equip_no
            },
            methods: {
                hideOverlay: function () {
                    this.$broadcast('hideOverlay');//传递点击body事件给所有组件

                },
                search: search,//筛选
                changePage: changePage,//翻页
                tableSelect: tableSelect,//表格勾选
                del_sel_equip_no: del_sel_equip_no,//删除已选择的设备

                edit_remark: edit_remark,//编辑备注

                equipWarning: equipWarning,//设备报警

                showTopology: showTopology,//拓扑图
                volume_sets: volume_sets,//批量设置
                addEquip: addEquip,
                deleteEquip: deleteEquip,//删除设备
                equip_compare: equip_compare,//对比设备
                export_all_equip: export_all_equip,//导出概览表
                showMap: showMap
            },
        });
        filter_data();
    });
};

//获取筛选条件
function filter_data() {
    var search_data = _.defaults(my_store.session('equip_search_data') || {}, {
        key: '',
        env_no: [],
        param: {}
    });
    search_data.save_history_func = function (history) {
        my_store('equip_search_history', history);
    };
    search_data.history = my_store('equip_search_history') || [];
    var _no_filter = false;
    //无筛选条件则直接加载列表
    if (!search_data.key && !search_data.env_no.length && !_.size(search_data.param)) {
        getEquipList();
        _no_filter = true;
    }

    search_data.right_list = [];
    $.get(API('/env/equipments/count/status_count'), function (data) {
        var row = {
            type: 'status', key: 'status', name: '状态', data: data
        };
        search_data.right_list.push(row);

        $.get(API('/env/equipments/count/type_count'), function (data) {
            var row = {
                type: 'type_all', key: 'equip_type', name: '类型', data: data
            };
            search_data.right_list.push(row);
            vm.$refs.search.init(search_data, _no_filter ? null : getEquipList);//有筛选条件获取列表数据
        });
    });
}

//获取列表数据
function getEquipList(search_data) {
    if (!search_data) {
        search_data = my_store.session('equip_search_data') || {};
    }
    vm.spinShow = true;

    vm.pageListLen = equipListParam.limit = Math.floor(($('.body').height() - 40 - 40) / 49);//修正条数,设置每页条数

    var param = _.extend({}, equipListParam);

    param.id = search_data.key || '';
    param.env_no = search_data.env_no ? search_data.env_no.join(',') : '';
    _.each(search_data.param, function (val, key) {
        param[key] = val;
        if (_.isArray(val)) {
            param[key] = val.join(',');
            if (param[key] === ',') {
                param[key] = '';
            }
        }
    });

    my_store.session('equip_search_page', equipListParam);
    my_store.session('equip_search_data', search_data);
    // console.log(param);
    $.post(API('/env/equipments/manage/equip_list'), param, function (data) {
        vm.pageListTotal = data.count || 0;//设置列表总数
        _.each(data.rows, function (row, index) {
            data.rows[index]._checked = _.contains(vm.sel_equip_no_list, row.equip_no);
        });
        vm.equipListData = data.rows || [];
        vm.spinShow = false;
    }).error(function () {
        vm.$Message.error('获取数据错误');
        vm.spinShow = false;
    });
}

//表格列数据
function equipListTableColumns() {
    return [
        {type: 'selection', width: 60, align: 'center'},
        {
            title: '状态', width: 80, align: 'center', key: 'status',
            render: function (param, h, index) {
                if (param.status) {
                    return (param.message.time ? '<Tooltip content="' + (param.message.time || '') + '" placement="top">' : '') + '<span class="equip-status ' + (statusChange[param.status] || '') + '">' + param.status + '</span>' + (param.message.time ? '</Tooltip>' : '');
                }
                return '';
            }
        },
        {
            title: '设备名称', width: 230, align: 'left', key: 'name',
            render: name_render
        },
        {
            title: '设备ID', width: 200, align: 'center', key: 'equip_no',
            render: function (param, h, index) {
                return "<a href='#/equip_info" + "/" + param.equip_no + "'>" + param.equip_no + "</a>";
            }
        },
        {title: '位置', width: 300, align: 'left', key: 'position', render: position_render},
        {title: '消息', align: 'left', key: 'message', render: message_render}
    ];
}

//设备名称
function name_render(param, h, index) {
    var name_html = '<Tooltip content="' + param.equip_type + '" placement="top"><span class="museum_icon small ' + param.equip_type + '" ></span></Tooltip>' +
        '<a href=\'#/equip_info' + '/' + param.equip_no + '\'>' + splitName(param.name, 10) + '</a>';
    var show_remark = "";
    if (!param.remark) {
        show_remark = " hide";
    }
    name_html += ' <Tooltip placement="top" content="' + (param.remark || '点击编辑备注') + '"><Icon class="list_equip_remark ' + show_remark + '" type="document-text" size="15" @click="edit_remark(' + index + ')"></Icon></Tooltip>';

    return '<div class="list_equip_name_cell">' + name_html + '</div>';
}

//位置
function position_render(param, h, index) {
    var html = "";
    if (param.nav && param.nav.length > 0) {
        var placement = index < vm.equipListData.length / 2 ? 'bottom' : 'top';

        if (param.locate && param.map) {
            var ileft = (150 - param.locate.x), itop = (100 - param.locate.y);
            //icon字体有飘移
            html += '<Poptip trigger="hover" placement="' + placement + '">' +
                '<Icon class="table-locate-icon" type="ios-location" size="16"></Icon>' +
                '<div slot="content">' +
                '<div class="map_view">' +
                '<Icon type="location" size="20" style="position: absolute;z-index:100;left:162px;top:94px;" color="#1bbc9b"></Icon>' +
                '<img src="' + param.map + '" style="top:' + itop + 'px;left:' + ileft + 'px;" width="' + param.locate.width + '"/>' +
                '</div>' +
                '</div>' +
                '</Poptip>';
        }
        if (param.nav.length === 1) {
            html += '<a class="table-locate" href="../capsule/#!/environment/environment_details' + '/' + param.env_no + '">' +
                splitName(param.nav[0].name, 10) + '</a>';
        } else {
            html += '<a class="table-locate" href="../capsule/#!/environment/environment_details' + '/' + param.env_no + '">' +
                splitName(param.nav[param.nav.length - 2].name, 10) + ' > ' +
                splitName(param.nav[param.nav.length - 1].name, 10) + '</a>';
        }
    } else {
        html = '暂无';
    }
    return html;
}

//消息
function message_render(param) {
    if (!param || !param.message) {
        return '暂无数据';
    }
    var msg_width = $('.i-data').width() - 60 - 80 - 230 - 200 - 300 - 18 - 18;
    // console.log(msg_width);
    var message = param.message;
    var _html_new_data = '', _html_new_data_tip = '';
    if (message.new_data) {//如果有最新数据，拼接
        _.each(message.new_data, function (val, key) {
            var _obj = window.get_param_unit_name(key);
            if (!_obj || _.contains(['voltage', 'rssi'], key)) {
                return;
            }
            _obj.val = (val !== undefined || val !== null) ? val : '';

            //拼接最新数据 html
            _html_new_data_tip += '<div class="table-new-data">' +
                '<Tooltip content="' + _obj.name + '" placement="top"><i class="museum_icon xsmall ' + key + '"></i></Tooltip>' +
                _obj.val + '' + (_obj.unit || '') + '</div>';
            _html_new_data += '<div class="table-new-data">' +
                '<i class="museum_icon xsmall ' + key + '"></i>' +
                _obj.val + '' + (_obj.unit || '') + '</div>';
        });
    }
    var _html_record = [];
    if (message.record && message.record.length > 0) {//如果有异常标签，拼接
        _.each(message.record, function (row) {
            var type = row.type.split('(');
            _html_record.push('<Tooltip style="z-index: 999" trigger="hover" placement="top-end">' +
                '<span class="table-record ' + type[0] + '">' + type[0] + '</span>' +
                '<div slot="content"><p class="record_title">' + row.title + '</p><p class="record_content">' + row.remark + '</p></div>' +
                '</Tooltip>');
        });
    }
    var return_html = "";
    if (message.time) {
        if (_html_new_data) {
            return_html += '<Tooltip trigger="hover" placement="top-end">';
        }
        return_html += '<div class="hava-new-message">' + message.time + '</div>';
        if (_html_new_data) {
            return_html += '<div slot="content" class="table-time-ul">' + _html_new_data + '</div></Tooltip>';
        }
        msg_width -= 154;
    }
    if (_html_record.length) {
        if (message.time) {
            return_html += " | ";
        }
        if (_html_record.length > 2 && parseInt(msg_width / 105) < 3) {
            _html_record.shift();
        }
        if (_html_record.length > 1 && parseInt(msg_width / 105) < 2) {
            _html_record.shift();
        }
        return_html += _html_record.join('&gt;');
    } else if (_html_new_data) {
        return_html += _html_new_data_tip;
    }
    return '<div class="table-message">' + (return_html || '暂无数据') + '</div>';
}

function search(search_data) {

    equipListParam.page = 1;//筛选页面默认1
    vm.currentPage = 1;//筛选后默认1
    getEquipList(search_data);
}

function changePage(param) {
    equipListParam.page = param;
    getEquipList();
}

function tableSelect(selection, row) {
    console.log('tableSelect');
    var all_no = _.pluck(vm.equipListData, 'equip_no');

    var _equip_no = [];//已勾选的设备
    selection.forEach(function (elem, index) {
        _equip_no.push(elem.equip_no);
    });
    var _no_equip_no = _.difference(all_no, _equip_no);//未勾选的设备
    var sel_equip_no_list = _.difference(vm.sel_equip_no_list, _no_equip_no);//移除未勾选的设备

    vm.sel_equip_no_list = _.union(sel_equip_no_list, _equip_no);//添加已勾选的设备
    _.each(vm.equipListData, function (row, i) {
        vm.equipListData[i]._checked = _.contains(_equip_no, row.equip_no);
    });

    my_store.session('equip_sel_equip_no', vm.sel_equip_no_list);

}

//删除已选择的设备
function del_sel_equip_no(no) {
    vm.sel_equip_no_list = _.without(vm.sel_equip_no_list, no);
    //console.log(vm.equipListData);
    _.each(vm.equipListData, function (row, i) {
        if (row.equip_no === no) {
            vm.equipListData[i]._checked = false;
        }
    });

    my_store.session('equip_sel_equip_no', vm.sel_equip_no_list);
}

function edit_remark(index) {

    var equip = vm.equipListData[index];
    console.log('edit_remark', equip);
    if (!equip) {
        return;
    }
    layer.prompt({title: '输入备注信息', value: equip.remark, formType: 2}, function (text, index) {
        layer.close(index);
        if (text) {
            $.post(API('/env/equipments/manage/edit/'), {equip_no: equip.equip_no, remark: text}, function (data) {
                vm.$Message.info(data.msg);
                getEquipList();
            });
        }
    });

}

function export_all_equip() {
    var _this = this;
    var json = {};
    var date = new Date();
    json.file_name = '设备概览表_' + date.getFullYear() + date.getMonth() + date.getDate();
    if (_this.sel_equip_no_list.length) {
        json.equip_no = _this.sel_equip_no_list.join(',');
    }
    json.api_url = "get/env/export/equipment/equip_list";
    // console.log(json);
    window.new_down(json);

}


function showMap(index) {
    var equip = vm.equipListData[index];
    console.log('showMap', equip);
}

//设备报警
function equipWarning() {
    window.location.href = '#!/equip_alert';
}

//拓扑图
function showTopology() {
    window.location.href = '#!/topology';
}

//批量设置
function volume_sets() {
    vm.$refs.set_equip.init(vm.sel_equip_no_list, function () {
        getEquipList();
    });
}

//对比设备
function equip_compare() {
    var count = vm.sel_equip_no_list.length;
    if (!count) {
        vm.$Message.warning('请选择要对比的设备');
        return;
    }
    window.location.href = '../capsule/#!/environment/environment_details/' + vm.sel_equip_no_list.join(',');
}

function addEquip() {
    vm.$refs.add_equip.init();
}

function deleteEquip() {
    var count = vm.sel_equip_no_list.length;
    if (!count) {
        vm.$Message.warning('请选择要删除的设备');
        return;
    }
    var nos = vm.sel_equip_no_list.join(',');

    layer.confirm('确认删除以下' + count + '个设备?<br/>' + nos.replace(/,/g, '<br/>') + '', {btn: ['确认删除', '取消']}, function (index) {
        $.post(API('/env/equipments/manage/delete/') + nos, function (data) {
            vm.$Message.info(data.msg);
            vm.sel_equip_no_list = [];
            my_store.session('equip_sel_equip_no', []);
            getEquipList();
        });
        layer.close(index);
    });
}

function splitName(name, lens) {
    var len = name.replace(/[\u0391-\uFFE5]/g, "aa").length;
    var str = len >= lens * 2 + 2 ? name.substring(0, lens) + '...' : name;
    return str;
}

var statusChange = {
    '异常': 'abnormal',
    '正常': 'normal',
    '停用': 'disable',
    '备用': 'standby',
    '低电': 'lowElectricity'
};
