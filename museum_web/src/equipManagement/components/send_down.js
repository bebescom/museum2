// @require _
// @require ../css/send_down.css
var default_param = {
    model: '休眠',
    sleep_period: '',
    unit: 'minute',
    equip_no: '',
    area_no: '',

    c_model: '停止',

    control: 'humidity',
    min: '',

    control_inner: 'humidity',
    c_order: '1',
    c_value: '',

    correction: 'humidity',
    crt_value: '',

    f_rate: '0',
    b_rate: '1',
    parameter: 'humidity',
    func: '清历史数据',
    set_value: '',
    set_unit: 'minute',
};
//生成环境树方法
var makeTree = function (data) {
    //拷贝原数组
    var treeListCopy = JSON.parse(JSON.stringify(data)),
        result = [];
    //遍历树结构
    if (treeListCopy && treeListCopy.length !== 0) {
        treeListCopy.forEach(function (item, index) {
            var nodeObj = {
                title: '',
                children: [],
                env_no: ''
            };
            nodeObj.title = item.name;
            nodeObj.env_no = item.env_no;
            if (item.children && item.children.length !== 0) {
                nodeObj.children = makeTree(item.children);
            }
            result.push(nodeObj);
            nodeObj = null;
        })
    }
    return result;
};

var prev_add_equips = [];

exports.send_down = Vue.extend({
    template: '#send_down_template',
    props: ['send_down_key', 'sel_equip_no_list', 'treeData'],
    data: function () {
        return {
            self: this,
            tab_ley: 'set_key',
            all_same: true,//保持同步输入
            instruct: '01',
            send_down_equip_data: [],//设备列表
            send_down_equip_data_copy: [],//拷贝设备数据列表
            select_equip_length: 0,
            modal_width: 0,
            send_type: '1',
            all_param: _.extend({}, default_param),
            send_history_data: [],
            //选中的设备
            add_equips: [],
            //全部的设备
            all_equips: [],

            history_page: 1,
            history_limit: 10,
            history_count: 0,
            auto_load_history: true,
            treeList: [],
            // '超标','超低电',
            statusList: ['启用', '备用', '停用'],
            modifyObj: {
                localName: '',
                status: '启用',
                equipArr: [],
                env_no: ''
            }
        }
    },
    watch: {
        //将变更统一更新到各个组件
        'all_param': {
            handler: function (val) {
                var $this = this;
                if ($this.all_same) {//保持同步输入
                    // console.log(val);
                    _.each($this.send_down_equip_data, function (row, no) {
                        if (row && row.param) {
                            row.param = _.extend({}, val);//去除多余set/get方法
                        }
                    });
                    $this.send_down_equip_data_copy = JSON.parse(JSON.stringify($this.send_down_equip_data));
                }
            },
            deep: true
        },
        modifyObj: {
            handler: function (val, oldval) {//修改状态为非正常时的提示
                if (val.status == '停用' || val.status == '备用') {
                    this.$Message.warning("状态已修改为" + val.status + ',设备位置将会被清空');
                }
            },
            deep: true
        }
    },
    computed: {
        //选中的设备编号数组
        selEquipArr: function () {
            var arr = [];
            if (this.sel_equip_no_list && this.sel_equip_no_list.length !== 0) {
                this.sel_equip_no_list.forEach(function (equip_no, index) {
                    equip_no.length > 11 ? arr.push(equip_no.slice(8)) : arr.push(equip_no);
                });
            }
            this.modifyObj.equipArr = arr;
            return arr;
        },
        send_down_columns: function () {
            var $this = this;
            var columns = [
                {
                    type: 'selection',
                    width: 50,
                    key: '_checked',
                    align: 'center'

                },
                {
                    type: 'index',
                    width: 50,
                    align: 'center'
                },
                {
                    title: '设备编号',
                    width: 100,
                    key: 'no',
                    render: function (row, column, index) {
                        if (!row.no) {
                            return '';
                        }
                        return row.no.length > 11 ? row.no.slice(8) : row.no;
                    }
                },
                {
                    title: '参数值',
                    key: 'param',
                    // width: 450,
                    render: function (row, column, index) {
                        // console.log($this.send_down_equip_data,index);
                        //这个组件在使用时,输入内容会导致页面重绘问题
                        return '<table-send-down-param :instruct="instruct" :all_same="all_same"' +
                            ' :param="send_down_equip_data[' + index + ']?send_down_equip_data[' + index + '].param:{}" :index="' + index + '"></table-send-down-param>';
                    }
                }
            ];
            return columns;
        },
        send_history_columns: function () {
            var $this = this;
            var columns = [
                {
                    title: '#',
                    width: 50,
                    align: 'center',
                    render: function (row, column, index) {
                        return ($this.history_page - 1) * $this.history_limit + index + 1;
                    }
                },
                {
                    title: '设备编号',
                    width: 100,
                    key: 'equip_no',
                    render: function (row, column, index) {
                        if (!row.equip_no) {
                            return '';
                        }
                        return row.equip_no.length > 11 ? row.equip_no.slice(8) : row.equip_no;
                    }
                },
                {
                    title: '指令',
                    width: 100,
                    key: 'instruct'
                },
                {
                    title: '参数值',
                    width: 150,
                    key: 'send_data'
                },
                {
                    title: '状态',
                    width: 90,
                    key: 'status',
                    render: function (row, column, index) {
                        var status_text = ['无反馈', '等待下发', '已下发', '已反馈'];
                        return status_text[row.status] + (row.send_count > 1 ? '(<span data-title="下发次数">' + row.send_count + '</span>)' : '');
                    }
                }, {
                    title: '创建时间',
                    width: 140,
                    key: 'create_time'
                }, {
                    title: '下发时间',
                    width: 140,
                    key: 'send_time'
                }, {
                    title: '反馈时间',
                    width: 150,
                    key: 'feedback_time'
                }, {
                    title: '反馈结果',
                    width: 200,
                    key: 'feedback_data',
                    render: function (row, column, index) {
                        var text = row.feedback_data;
                        if (!text) {
                            return text;
                        }
                        try {
                            var t = JSON.parse(text);
                            text = '';
                            _.each(t, function (val, key) {
                                text += key + ':' + val + '<br/>';
                            });
                        } catch (e) {
                            console.error(e, text);
                        }
                        return text;
                    }
                }, {
                    title: '备注',
                    width: 150,
                    key: 'remark'
                }
            ];
            return columns;
        }
    },
    ready: function () {
        // console.log(this.sel_equip_no_list);
        var $this = this;
        this.add_equips = this.sel_equip_no_list;
        _.each(this.sel_equip_no_list, function (no) {
            $this.send_down_equip_data.push({
                no: no,
                _checked: true,
                param: _.extend({}, default_param)
            });
        });
        setTimeout(function () {
            $this.send_down_equip_data_copy = JSON.parse(JSON.stringify($this.send_down_equip_data));
            $this.select_equip_length = _.size($this.send_down_equip_data);
            $this.get_history();
            $this.auto_load_history_fn();
        }, 0);


        $.get(API('/env/equipments/equip_lists'), function (data) {
            if (data.error) {
                $this.$Message.error('获取设备列表出错');
                return;
            }
            $this.all_equips = data.rows;
        }, 'json');
        // console.log(this.treeData);
        //根据环境树请求到的树型数据,生成
        this.treeList = makeTree(this.treeData);
    },
    methods: {
        showTip: function () {

        },
        submitModify: function () {
            var me = this;
            if (this.sel_equip_no_list && this.sel_equip_no_list.length !== 0) {
                var result = [];
                // if(this.modifyObj.localName===''){
                //     this.$Message.warning('请选择安装位置');
                //     return;
                // }
                this.sel_equip_no_list.forEach(function (equip, index) {
                    // console.log(equip);
                    result.push({
                        equip_no: equip,
                        env_no: me.modifyObj.env_no,
                        status: me.modifyObj.status
                    })
                });
                // console.log(result);
                $.post(API('/env/equipments/edits/edit_multi'), {data: result}, function (data) {
                    me.$Message.info(data.msg);
                    me.$dispatch('reload_equip_list');
                });
            } else {
                this.$Message.warning('未勾选设备');
            }
            // console.log(this.modifyObj,this.sel_equip_no_list);
        },
        //环境树切换安装位置节点
        changeLocal: function (local) {
            // console.log(local);
            var node = local[0];
            this.modifyObj.localName = node.title;
            this.modifyObj.env_no = node.env_no;
        },
        modal_width_toggle: function () {
            this.modal_width = this.modal_width ? 0 : 1304;
        },
        add_equip: function (equips) {
            var $this = this;
            var old_equips = _.pluck($this.send_down_equip_data, 'no');
            // console.log(old_equips);
            _.each(equips, function (no) {
                if (!_.contains(old_equips, no)) {
                    $this.send_down_equip_data.unshift({
                        no: no,
                        _checked: true,
                        param: _.extend({}, default_param)
                    });
                }
            });
            var del_equips = _.difference(prev_add_equips, equips);
            // console.log('del', del_equips);
            _.each($this.send_down_equip_data, function (row, index) {
                if (row && row.no && _.contains(del_equips, row.no)) {
                    // console.log('del index', index);
                    $this.send_down_equip_data.splice(index, 1);
                }
            });
            prev_add_equips = equips.slice(0);
            $this.send_down_equip_data_copy = JSON.parse(JSON.stringify($this.send_down_equip_data));
            // console.log(prev_add_equips, $this.send_down_equip_data);
            $this.sel_equip_no_list = prev_add_equips;
        },
        save: function () {
            //this.send_down_key = false;
            // console.log(this.send_down_equip_data_copy);
            // return;

            var $this = this,
                equips = [];
            _.each(this.send_down_equip_data_copy, function (row) {
                if (row._checked) {
                    var equip = _.extend({}, row);
                    equip.param = _.extend({}, row.param);
                    equips.push(equip);
                }
            });
            if (!equips.length) {
                this.$Message.info('没有选择任何设备');
                return;
            }
            var json = {};
            json.instruct = this.instruct;
            json.equips = [];
            json.send_type = this.send_type;
            var err;
            _.each(equips, function (row) {
                if (err) {
                    return;
                }
                var rt = {};
                if (instruct_valid[json.instruct]) {
                    rt = instruct_valid[json.instruct](row.param);
					console.log(rt);
                    if (rt.err) {
                        err = rt.err;
                        return;
                    }
                }

                json.equips.push({
                    equip_no: row.no,
                    instruct: json.instruct,
                    send_data: rt.data || '',
                    remark: ''
                });
            });
            if (err) {
                $this.$Message.error(err);
                return;
            }
            $this.$Loading.start();
            $.post(API('/env/datas/data_send_down/save'), json, function (data) {
                $this.$Loading.finish();
                if (data.error) {
                    $this.$Message.error(data.error);
                    return;
                }
                $this.$Message.info(data.msg + ',等待数据下发');
                $this.tab_ley = 'history_key';
                $this.get_history();
            }, 'json');

        },
        cancel: function () {
            this.send_down_key = false;
            this.auto_load_history = false;
            $('.ivu-modal-mask').remove();//移除遮罩
        },
        selectionChange: function (selection) {
            // console.log(selection);
            this.select_equip_length = selection.length;
            var checkeds = [];
            _.each(selection, function (row) {
                checkeds.push(row.no);
            });
            _.each(this.send_down_equip_data, function (row) {
                row._checked = _.contains(checkeds, row.no);
            });

        },
        get_history: function () {
            var $this = this;
            var query = '?page=' + this.history_page + '&&limit=' + this.history_limit;
            $this.$Loading.start();
            $.get(API('/env/datas/data_send_down/send_down_list') + query, function (data) {
                $this.$Loading.finish();
                if (data.error) {
                    $this.$Message.error(data.error);
                    return;
                }
                $this.send_history_data = data.rows;
                $this.history_count = data.total;
            }, 'json');
        },
        auto_load_history_fn: function () {
            var $this = this;
            if (this.auto_load_history) {
                setTimeout(function () {
                    $this.auto_load_history_fn();
                    $this.get_history();
                }, 10000);
            }

        }
    },
    events: {
        changeData: function (index, key, value) {
            console.log('变更数据', index, key, value);
            if (this.send_down_equip_data_copy[index] && this.send_down_equip_data_copy[index].param) {
                this.send_down_equip_data_copy[index].param[key] = value;
            }
        }
    },
    components: {
        'send-down-param': {
            template: '#send_down_param',
            props: ['instruct', 'all_same', 'param', 'show_20'],
            data: function () {
                return {}
            },
            ready: function () {
                // console.log(this.param);
                var $this = this;
                if (!$this.param) {
                    $this.param = _.extend({}, default_param);
                }
            }
        },
        //表格中的设置组件
        'table-send-down-param': {
            template: '#table_send_down_param',
            props: ['instruct', 'all_same', 'param', 'show_20', 'index'],
            data: function () {
                return {
                    default_param: default_param,
                    model: this.param.model,
                    sleep_period: this.param.sleep_period,
                    unit: this.param.unit,
                    equip_no: this.param.equip_no,
                    area_no: this.param.area_no,
                    c_model: this.param.c_model,
                    control: this.param.control,
                    min: this.param.min,
                    control_inner: this.param.control_inner,
                    c_order: this.param.c_order,
                    c_value: this.param.c_value,
                    correction: this.param.correction,
                    crt_value: this.param.crt_value,
                    f_rate: this.param.f_rate,
                    b_rate: this.param.b_rate,
                    parameter: this.param.parameter,
                    func: this.param.func,
                    set_value: this.param.set_value
                }
            },
            created: function () {
                var $this = this;
                if (!$this.param) {
                    $this.param = $this.default_param;
                }
            },
            watch: {
                model: function (val) {
                    this.changeData(this.index, 'model', val);
                },
                sleep_period: function (val) {
                    // console.log('监听变化',val,this.index);
                    this.changeData(this.index, 'sleep_period', val);
                },
                unit: function (val) {
                    this.changeData(this.index, 'unit', val);
                },
                equip_no: function (val) {
                    // console.log('监听变化',val,this.index);
                    this.changeData(this.index, 'equip_no', val);
                },
                area_no: function (val) {
                    // console.log('监听变化',val,this.index);
                    this.changeData(this.index, 'area_no', val);
                },
                c_model: function (val) {
                    this.changeData(this.index, 'c_model', val);
                },
                control: function (val) {
                    this.changeData(this.index, 'control', val);
                },
                min: function (val) {
                    // console.log('监听变化',val,this.index);
                    this.changeData(this.index, 'min', val);
                },
                control_inner: function (val) {
                    this.changeData(this.index, 'control_inner', val);
                },
                c_order: function (val) {
                    // console.log('监听变化',val,this.index);
                    this.changeData(this.index, 'c_order', val);
                },
                c_value: function (val) {
                    // console.log('监听变化',val,this.index);
                    this.changeData(this.index, 'c_value', val);
                },
                correction: function (val) {
                    this.changeData(this.index, 'correction', val);
                },
                crt_value: function (val) {
                    // console.log('监听变化',val,this.index);
                    this.changeData(this.index, 'crt_value', val);
                },
                f_rate: function (val) {
                    this.changeData(this.index, 'f_rate', val);
                },
                b_rate: function (val) {
                    this.changeData(this.index, 'b_rate', val);
                }
            },
            ready: function () {

            },
            methods: {
                //向父级组件发送消息,更新输入的数据
                changeData: function (index, key, value) {
                    this.$dispatch('changeData', index, key, value);
                }
            }
        }
    }
});


var instruct_valid = {};
instruct_valid['01'] = function (param) {
    var json = {};
    json.model = param.model;
    return {data: json};
};
instruct_valid['02'] = function (param) {
    var json = {};
    json.sleep_period = param.sleep_period * 1;
    json.unit = param.unit;
    if (parseInt(json.sleep_period) != json.sleep_period) {
        return {err: '休眠周期必须为整数'};
    }
    if (json.unit == 'hour') {
        if (json.sleep_period > 55 || json.sleep_period < 1) {
            return {err: '休眠周期为1~55'};
        }
    } else {
        if (json.sleep_period > 100 || json.sleep_period < 1) {
            return {err: '休眠周期为1~100'};
        }
    }

    return {data: json};
};
instruct_valid['04'] = function (param) {
    var json = {};
    json.equip_no = param.equip_no + '';
    var reg = /\d{11}/;
    if (json.equip_no.length != 11) {
        return {err: '设备编号应为11位'};
    }
    if (reg.exec(json.equip_no) == false) {
        return {err: '设备编号应为11位数字'};
    }

    return {data: json};

};
instruct_valid['05'] = function (param) {
    var json = {};
    json.area_no = param.area_no;
    var reg = /^\d{8}\w*/;
    if (json.area_no.length < 10 || json.area_no.length > 19 || reg.exec(json.area_no) == false) {
        return {err: '环境编号为10~19位'};
    }

    return {data: json};

};
instruct_valid['30'] = function (param) {
    var json = {};
    json.c_model = param.c_model;

    return {data: json};

};
instruct_valid['31'] = function (param) {
    var json = {};
    json.control = param.control;
    json.min = param.min * 1;

    if (json.min == '') {
        return {err: '请输入调控值'};
    }
    if (json.control == 'humidity' && (json.min > 70 || json.min < 30)) {
        return {err: '调控值(30~70)'};
    }
    //灯光亮度设置验证范围
    if (json.control == 'lighting' && (json.min > 100 || json.min < 0)) {
        return {err: '调控值(0~100)'};
    }
    json.max = json.min;

    return {data: json};

};
instruct_valid['32'] = function (param) {
    var json = {};
    json.control_inner = param.control_inner;
    json.c_order = param.c_order;
    json.c_value = param.c_value;

    if (json.c_order == '') {
        return {err: '序号不能为空'};
    }
    if (json.c_value == '') {
        return {err: '调控值不能为空'};
    }

    return {data: json};

};

instruct_valid['20'] = function (param) {
    var json = {};
    json.correction = param.correction;
    json.crt_value = param.crt_value;

    if (json.crt_value == '') {
        return {err: '校正值不能空'};
    }
    var crt_value = json.crt_value.replace('，', ',').split(',');
    if ((crt_value.length > 1 && crt_value.length < 4) || crt_value.length > 10) {
        return {err: '校正值为1个或者4~10个，多个值以逗号间隔'};
    }
    for (var i in crt_value) {
        if (is_float(crt_value[i]) == false) {
            return {err: "第" + (parseInt(i) + 1) + "个校正值应为整数或小数"};
        }
    }

    return {data: json};
};

instruct_valid['22'] = function (param) {
    var json = {};
    json.parameter = param.parameter;
	json.func = param.func;
    json.set_value = param.set_value;
	if (json.func == '') {
        return {err: '功能参数不能空'};
    }

    if (json.func=='修正值'||json.func=='设置除湿目标值'||json.func=='设置除湿时间') {
		if(json.set_value === ""){
			return {err: '设定值不能空'};
            json.set_unit = param.set_unit;
        }
    }
    
    return {data: json};
};

instruct_valid['12'] = function (param) {
    var json = {};
    json.f_rate = param.f_rate;
    json.b_rate = param.b_rate;

    return {data: json};
};

function is_float(f) {
    var reg = /(^-?(\d+|\d+\.\d+$))(?!.)/;
    var ret = reg.exec(f);
//        console.log(ret);
    if (ret && ret.index == 0) {
        return true;
    }
    return false;
}