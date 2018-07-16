var vm;
var searchParam = {
    index: 0,
    page: 1,
    limit: 20
};

exports.init = function () {
    $('#content').load('equip_alert.htm?date=' + new Date() * 1, function () {
        vm = new Vue({
            el: "#app",
            data: {
                spinShow: true,//表格loading

                currentPage: 1,//当前页面，默认1
                limit: 0,//每页条数
                total: 0,//总条数
                data: [],//设备列表数据

                columns: columns(), //设备列表表格Title数据
            },
            methods: {
                hideOverlay: function () {
                    this.$broadcast('hideOverlay');//传递点击body事件给所有组件
                },
                search: search,//筛选
                changePage: changePage,//翻页
                goBack: function () {
                    window.history.go(-1);
                }
            }
        });
        filter_data();

    });
};

function filter_data() {
    var search_data = {
        key: '',
        env_no: [],
        param: {}
    };
    search_data.save_history_func = function (history) {
        my_store('equip_alert_search_history', history);
    };
    search_data.history = my_store('equip_alert_search_history') || [];

    search_data.right_list = [];
    $.get(API('/env/equipments/alerts/alert_count'), function (data) {
        if (data.param && data.param.length) {
            search_data.right_list.push({
                type: 'status', key: 'type', name: '报警类型', data: data.param,
            });
        }
        if (data.equip_type && data.equip_type.length) {
            search_data.right_list.push({
                type: 'status', key: 'equip_type', name: '设备类型', data: data.equip_type
            });
        }
        search_data.right_list.push({
            type: 'datetimerange', key: 'alert_time', name: '报警时间', data: []
        });
        vm.$refs.search.init(search_data, getEquipList);//有筛选条件获取列表数据

    });

}

function getEquipList(search_data) {
    if (!search_data) {
        search_data = {};
    }
    vm.spinShow = true;

    vm.limit = searchParam.limit = Math.floor(($('#content').height() - 41 - 100) / 49);//修正条数,设置每页条数

    var param = _.extend({}, searchParam);

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

    console.log(param);
    $.get(API('/env/equipments/alerts/alert_list'), param, function (data) {
        vm.total = data.total || 0;//设置列表总数
        vm.data = data.rows || [];
        vm.spinShow = false;
    });
}

function search(search_data) {

    searchParam.page = 1;//筛选页面默认1
    vm.currentPage = 1;//筛选后默认1
    getEquipList(search_data);
}

function changePage(param) {
    searchParam.page = param;
    getEquipList();
}

function columns() {
    return [
        {
            title: 'ID', width: 60, align: 'center', key: 'id'
        },
        {
            title: '设备名称', width: 200, align: 'left', key: 'name',
            render: name_render
        },
        {
            title: '设备ID', width: 170, align: 'center', key: 'equip_no',
            render: function (row, h, index) {
                return "<a href='#/equip_info" + "/" + row.equip_no + "'>" + row.equip_no + "</a>";
            }
        },
        {title: '报警类型', width: 120, key: 'type'},
        {title: '位置', width: 200, align: 'left', key: 'position', render: position_render},
        {title: '报警时间', width: 150, key: 'alert_time'},
        {title: '消除报警时间', width: 150, key: 'clear_time'},
        {title: '情况说明', align: 'left', key: 'alert_remark'}
    ];
}

function name_render(row) {
    var name_html = '';
    if (row.equip_type) {
        name_html += '<span class="museum_icon small ' + row.equip_type + '" data-title="' + row.equip_type + '"></span>';
    }
    name_html += '<a href=\'#/equip_info' + '/' + row.equip_no + '\'>' + splitName(row.name, 10) + '</a>';
    return name_html;
}

//位置
function position_render(param) {
    if (param.nav && param.nav.length > 0) {
        if (param.nav.length === 1) {
            return '<Icon class="table-locate-icon" type="ios-location" size="16"></Icon>' +
                '<a class="table-locate" href="../capsule/#!/environment/environment_details' + '/' + param.env_no + '">' +
                splitName(param.nav[0].name, 10) + '</a>';
        } else {
            return '<Icon class="table-locate-icon" type="ios-location" size="16"></Icon>' +
                '<a class="table-locate" href="../capsule/#!/environment/environment_details' + '/' + param.env_no + '">' +
                splitName(param.nav[param.nav.length - 2].name, 10) + ' > ' +
                splitName(param.nav[param.nav.length - 1].name, 10) + '</a>';
        }
    } else {
        return '暂无';
    }
}

function splitName(name, lens) {
    var len = name.replace(/[\u0391-\uFFE5]/g, "aa").length;
    var str = len >= lens * 2 + 2 ? name.substring(0, lens) + '...' : name;
    return str;
}