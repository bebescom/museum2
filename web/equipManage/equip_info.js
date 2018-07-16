define('equipManage/equip_info', function(require, exports, module) {

var vm;

var dateOpitons = {//时间快捷选项
    shortcuts: [
        {
            text: '今天',
            value: function () {
                var start = new Date().setHours(0, 0, 0);
                var end = new Date().setHours(23, 59, 59);
                return [start, end];
            }
        },
        {
            text: '最近7天',
            value: function () {
                var start = new Date();
                var end = new Date();
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                return [start.setHours(0, 0, 0), end.setHours(23, 59, 59)];
            }
        },
        {
            text: '最近30天',
            value: function () {
                var start = new Date();
                var end = new Date();
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                return [start.setHours(0, 0, 0), end.setHours(23, 59, 59)];
            }
        },
        {
            text: '最近90天',
            value: function () {
                var start = new Date();
                var end = new Date();
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
                return [start.setHours(0, 0, 0), end.setHours(23, 59, 59)];
            }
        }
    ],
    disabledDate: function (date) {
        return date && date.valueOf() > Date.now();
    }
};

exports.init = function (equip_no, alert_time) {
    $('#content').load('equip_info.htm?date=' + new Date() * 1, function () {
        var dateStart = new Date().setHours(0, 0, 0);
        var dateEnd = new Date() * 1;
        if (alert_time) {
            dateStart = new Date(alert_time).setHours(0, 0, 0);
            dateEnd = new Date(alert_time).setHours(23, 59, 59);
        }
        console.log('get_equip_info');
        vm = new Vue({
            el: "#content",
            data: {
                equip_info: {},//设备基础信息
                dateOpitons: dateOpitons,
                dateTime: [dateStart, dateEnd],
            },
            methods: {
                change_time: change_time,//改变时间
                ok_time: ok_time,//确定时间
                exportData: exportData,//导出当前设备数据
                addCompare: addCompare,//加入对比
                set_equip: setEquip,//设置设备
                goBack: function () {
                    window.history.go(-1);
                }
            }
        });
        get_equip_info(equip_no);
    });
};

//获取设备基础信息
function get_equip_info(equip_no) {
    $.get('/2.2.05_P001/base_api/env/equipments/detail/detail_info/' + equip_no+'', function (data) {
        if (!data || !data.equip_no) {
            vm.$Message.error('获取设备数据错误');
            return;
        }
        vm.equip_info = data;
        vm.$refs.equip_left.init(data);

        ok_time();//触发时间选择

        setTimeout(function () {
            if (vm.equip_info.monitor_type == '网络设备') {
                console.log(vm.$refs.router_info);
                vm.$refs.router_info.init(vm.equip_info);
            }
        },0);

    });
}

//导出当前设备数据
function exportData() {
    var _this = this;
    var json = {};
    json.time = parseInt(new Date(_this.dateTime[0]).getTime() / 1000) + ',' + parseInt(new Date(_this.dateTime[1]).getTime() / 1000);
    json.equip_no = vm.equip_info.equip_no;
    json.file_name = '1设备_' + json.equip_no;
    json.param = 'equip_time,status,server_time,voltage,equip_position,' + vm.equip_info.parameter;
    json.api_url = "post/env/export/equipment/equip_data";
    // console.log(json);
    window.new_down(json);
}

//改变时间
function change_time(val) {
    if (typeof val === 'string') {
        var time = val.split(' - ');
        var end_date = new Date(time[1]);
        if (!(end_date.getHours() + end_date.getMinutes())) {
            vm.dateTime.$set(1, end_date.setHours(23, 59, 59));
        }
    }
}

//时间选择确定
function ok_time() {
    var time = [parseInt(new Date(vm.dateTime[0]).getTime() / 1000), parseInt(new Date(vm.dateTime[1]).getTime() / 1000)];
    console.log('ok_time');
    vm.$refs.echart.init(vm.equip_info, time);//曲线图
    vm.$refs.raw_data.init(vm.equip_info, time);//原始数据
    vm.$refs.history.init(vm.equip_info, time);//历史信息
    vm.$refs.position.init(vm.equip_info, time);//设备位置

}


//加入对比
function addCompare() {
    console.log('addCompare');
}

//设置设备
function setEquip() {
    vm.$refs.set_equip.init([vm.equip_info.equip_no], function () {
        get_equip_info(vm.equip_info.equip_no);
    });
}

});