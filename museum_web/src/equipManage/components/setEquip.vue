<style type="text/css">
    .set_equip_modal .ivu-modal-footer {
        display: none;
    }

    .set_equip_modal .ivu-modal-header {
        border-bottom: none;
        padding: 14px 16px 0 16px;
    }

    .set_equip_modal .ivu-modal-header-inner {
        font-size: 16px;
    }

    .set_equip_modal .ivu-tabs-bar {
        margin-bottom: 10px;
    }

    .set_equip_modal .ivu-table-small th {
        height: 35px;
    }

    .set_equip_modal .ivu-tabs-mini .ivu-tabs-tab {
        font-size: 14px;
    }

    .set_equip_modal .ivu-page {
        margin-top: 0;
    }

</style>

<template id="set_equip">

    <Modal class-name="set_equip_modal"
           :visible.sync="show_modal"
           title="设置设备"
           :mask-closable="false"
           :style="{top: '20px'}"
           width="1200">

        <Tabs :animated="false" size="small" :active-key="tab_key" @on-click="change_tab">
            <Tab-pane label="设置设备" key="set_key">
                <Row style="margin-bottom: 10px;">
                    <!--<i-col span="2" style="vertical-align: middle">-->
                    <!--设备编号列表：-->
                    <!--</i-col>-->
                    <i-col span="24">
                        <i-select :model.sync="sel_equips"
                                  @on-change="sel_equip"
                                  filterable multiple placeholder="设备编号">
                            <i-option v-for="row in all_equips" :value="row.equip_no">{{ row.equip_no.slice(-11) }}
                            </i-option>
                        </i-select>
                    </i-col>
                </Row>

                <div class="set_equip_table ivu-table-wrapper ivu-table-with-header" style="height:400px;">
                    <div class="ivu-table ivu-table-small ivu-table-with-fixed-top">
                        <div class="ivu-table-title">
                            <table cellspacing="0" cellpadding="0" border="0" style="width: 100%;">
                                <colgroup>
                                    <col width="60">
                                    <col width="160">
                                    <col width="180">
                                    <col>
                                    <col width="60">
                                </colgroup>
                                <thead>
                                <tr>
                                    <th class="ivu-table-column-center">
                                        <div class="ivu-table-cell">#</div>
                                    </th>
                                    <th>
                                        <div class="ivu-table-cell">设备编号</div>
                                    </th>
                                    <th>
                                        <div class="ivu-table-cell">配置类型</div>
                                    </th>
                                    <th>
                                        <div class="ivu-table-cell">配置参数</div>
                                    </th>
                                    <th>
                                        <div class="ivu-table-cell"></div>
                                    </th>
                                </tr>
                                <tr class="equip_table_param">
                                    <td class="ivu-table-column-center">
                                        <div class="ivu-table-cell"></div>
                                    </td>
                                    <td>
                                        <div class="ivu-table-cell">全部</div>
                                    </td>
                                    <td>
                                        <div class="ivu-table-cell">
                                            <i-select :model.sync="type" style="width: 160px;" @on-change="change_type">
                                                <Option-group :label="group.name" v-for="group in type_list">
                                                    <i-option v-for="item in group.options" :value="item.key">
                                                        {{item.name}}
                                                    </i-option>
                                                </Option-group>
                                            </i-select>
                                        </div>
                                    </td>
                                    <td>
                                        <div class="ivu-param-cell">
                                            <param-data :type.sync="type" :param.sync="param"
                                                        :tree_list="tree_list" :all_equips="all_equips"></param-data>
                                        </div>
                                    </td>
                                    <td>
                                        <div class="ivu-param-cell">
                                        </div>
                                    </td>
                                </tr>
                                </thead>
                            </table>
                        </div>
                        <div class="ivu-table-body" style="height: 320px;">
                            <table cellspacing="0" cellpadding="0" border="0" style="width: 100%;">
                                <colgroup>
                                    <col width="60">
                                    <col width="160">
                                    <col width="180">
                                    <col>
                                    <col width="60">
                                </colgroup>
                                <tbody class="ivu-table-tbody">
                                <tr class="ivu-table-row" v-for="(index,item) in sel_equips_data">
                                    <td class="ivu-table-column-center">
                                        <div class="ivu-table-cell">{{index+1}}</div>
                                    </td>
                                    <td>
                                        <div class="ivu-table-cell list_equip_name_cell">
                                            <span :class="['museum_icon','small',item.equip_type]"
                                                  :data-title="item.equip_type"></span>
                                            <span :data-title="'设备名称:'+item.name"
                                                  v-text="item.equip_no.slice(-11)"></span>

                                        </div>
                                    </td>
                                    <td>
                                        <div class="ivu-table-cell">
                                            {{get_type_name(item.type)}}
                                        </div>
                                    </td>
                                    <td>
                                        <div class="ivu-param-cell">
                                            <param-data :type.sync="item.type" :param.sync="item.param"
                                                        :no_support.sync="item.no_support"
                                                        :tree_list="tree_list" :all_equips="all_equips"></param-data>
                                        </div>
                                    </td>
                                    <td>
                                        <div class="ivu-param-cell">
                                            <Tooltip style="margin-right: 5px;" placement="top"
                                                     :content="item.remark || '点击编辑备注'">
                                                <Icon class="cursor_pointer"
                                                      type="document-text" size="22"
                                                      @click="edit_remark(index)"></Icon>
                                            </Tooltip>

                                            <Tooltip placement="top" :content="'点击取消选择'+item.equip_no.slice(-11)">
                                                <Icon class="cursor_pointer" type="android-delete" size="22"
                                                      @click="del_equip(index)"></Icon>
                                            </Tooltip>
                                        </div>
                                    </td>
                                </tr>
                                </tbody>
                            </table>

                        </div>

                    </div>

                    <Spin fix v-show="equip_spin_key">
                        <Icon type="load-c" size=18 class="demo-spin-icon-load"></Icon>
                        <div>加载中...</div>
                    </Spin>
                </div>


                <Row style="margin-top: 10px;">
                    <i-col span="12">
                        下发方式:
                        <Radio-group :model.sync="send_type">
                            <Radio value="1">被动</Radio>
                            <Radio value="2">主动(立即群发)</Radio>
                        </Radio-group>
                    </i-col>
                    <i-col span="12" style="text-align: right">
                        <i-button type="primary" size="large" :loading="send_loading" @click.stop="ok">确认</i-button>
                        &nbsp;
                        <i-button size="large" @click.stop="cancel">取消</i-button>
                    </i-col>
                </Row>

            </Tab-pane>
            <Tab-pane label="设置历史" key="history_key">
                <Row style="margin-bottom: 10px;">
                    <i-col span="12">
                        <new-filter-component :search="history_search" v-ref:history_search
                                              placeholder="设备ID"></new-filter-component>
                    </i-col>
                    <i-col span="12">

                    </i-col>
                </Row>

                <div style="min-height: 450px;">
                    <Spin fix v-show="history_spin_key">
                        <Icon type="load-c" size=18 class="demo-spin-icon-load"></Icon>
                        <div>加载中...</div>
                    </Spin>
                    <i-table class="set_history_table" :columns="send_history_columns" :data="send_history_data"
                             border highlight-row>
                    </i-table>
                    <Row style="margin-top: 10px;">
                        <i-col span="16">
                            <Page :total="history_count" :current.sync="history_page" :page-size.sync="history_limit"
                                  @on-change="get_history"
                                  @on-page-size-change="get_history"
                                  show-total></Page>
                        </i-col>
                        <i-col span="8" style="text-align: right">
                            <Checkbox :checked.sync="auto_load_history">自动刷新(10s)&nbsp;
                            </Checkbox>
                            <i-button size="large" type="primary" @click.stop="history_search">刷新</i-button>
                            &nbsp;
                            <i-button size="large" @click.stop="cancel">取消</i-button>
                        </i-col>
                    </Row>
                </div>


            </Tab-pane>
        </Tabs>

        <div slot="footer">
        </div>

    </Modal>
</template>

<script type="text/javascript">
    var default_param = {
        id: '',
        equip_status: '',
        equip_clear_env: false,//当状态为备用或停用时可选择清空设备位置
        equip_name: '',
        equip_type: '',
        equip_remark: '',
        equip_env_no: [],
        equip_model: '',
        equip_manufacturer: '',
        equip_applicability: '',
        equip_effect: '',
        equip_img: [],
        replace_no: "",

        ctr_kdate: '',
        ctr_quantity: '',
        box_model: '正常',
        box_open_kdate: '',
        box_move_kdate: '',

        model: '休眠',//0x01
        sleep_period: '',//0x02
        unit: 'minute',//0x02
        equip_no: '',//0x04
        area_no: '',//0x05,已取消

        //0x30
        c_model: '停止',

        //0x31
        control: 'humidity',
        min: '',

        //0x32
        control_inner: 'humidity',
        c_order: '1',
        c_value: '',

        //0x20 0x21
        correction: 'humidity',
        crt_value: '',
        send_repeat: false,//重复
        send_cycle: 1,//周期

        //0x12
        f_rate: '0',
        b_rate: '1',

        //other
        other: '',

        //0x22
        parameter: '--',
        func: '',
        set_value: '',
        set_value2: '',
        set_value3: '',
        set_unit: 'minute',

        //0x10
        range_param: 'humidity',
        range_value1: '',
        range_value2: '',

        //0x11
        alert_param: 'humidity',
        alert_value1: '',
        alert_value2: '',

    };
    Vue.component('set-equip', {
        template: '#set_equip',
        props: [],
        data: function () {
            return {
                tab_key: 'set_key',
                init_key: false,
                show_modal: false,//
                equip_spin_key: false,
                sel_equips: [],//选择的设备编号列表
                sel_equips_data: [],//选择的设备的参数列表
                all_equips: [],//所有设备编号列表
                all_equips_obj: {},//所有设备，设备编号为key
                type: '',//默认配置类型
                type_list: [],//配置类型
                type_obj: {},//配置类型名称
                param: {},//全部设备选择的参数
                send_loading: false,
                send_type: '1',//被动下发
                tree_list: [],
                ok_end: function () {

                },

                history_page: 1,
                history_limit: 10,
                history_count: 0,
                auto_load_history: true,
                send_history_columns: this.get_send_history_columns(),
                send_history_data: [],
                search_data: {},
                history_spin_key: true,
            }
        },
        watch: {
            param: {
                handler: function (val) {
                    var _this = this;
                    console.log(val);
                    _.each(_this.sel_equips_data, function (row, no) {
                        if (row && row.param) {
                            // row.param = _.extend({}, val);//去除多余set/get方法

                            _.each(val, function (v, k) {
                                if (_this.type_obj[_this.type].val && _this.type_obj[_this.type].val.indexOf(k) !== -1) {
                                    row.param[k] = v;
                                }
                            });
                        }
                    });
                },
                deep: true
            }
        },
        methods: {
            init: function (equips, ok_end) {
                var _this = this;
                _this.tab_key = 'set_key';
                _this.type = 'equip_status';
                _this.param = _.extend({}, default_param);
                _this.show_modal = true;
                _this.equip_spin_key = true;
                _this.get_all_equip(function (data) {
                    setTimeout(function () {
                        _this.sel_equips = equips;
                        var sel_equips_data = [];
                        _.each(equips, function (equip_no) {
                            var row = _this.get_equip_row(equip_no);
                            if (row) {
                                sel_equips_data.push(row);
                            }
                        });
                        _this.sel_equips_data = sel_equips_data;
                        _this.init_key = true;
                        console.log(_this);
                        _this.get_history();
                        _this.equip_spin_key = false;
                    }, 0);
                });
                if (!_this.init_key) {
                    _this.get_types();
                    if (ok_end) {
                        _this.ok_end = ok_end;
                    }
                    _this.auto_load_history_fn();
                }
                _this.auto_load_history = true;
                _this.get_history_filter();
                _this.search_data = {};
            },
            change_tab: function (key) {
                this.tab_key = key;
            },
            get_equip_row: function (equip_no) {
                var _this = this;
                if (!_this.all_equips_obj[equip_no]) {
                    return false;
                }
                var equip = _this.all_equips_obj[equip_no];
                if (equip.status !== '备用' && equip.status !== '停用') {
                    equip.status = '启用';
                }
                var row = {

                    equip_no: equip_no,
                    type: _this.type,
                    param: _.extend({}, default_param),
                    name: equip.name || '',
                    equip_type: equip.equip_type || '',
                    remark: equip.remark || '',
                    no_support: false,//不支持配置类型
                };
                row.param.id = equip.equip_no;
                row.param.equip_type = equip.equip_type;
                row.param.equip_name = equip.name;
                row.param.equip_remark = equip.remark;
                row.param.equip_status = equip.status;
                row.param.equip_clear_env = false;
                if (equip.env_no && equip.nav) {
                    var env_no = [];
                    _.each(equip.nav, function (env) {
                        env_no.push(env.env_no);
                    });
                    row.param.equip_env_no = env_no;
                }
                row.param.equip_model = equip.model;
                row.param.equip_manufacturer = equip.manufacturer;
                row.param.equip_applicability = equip.applicability;
                row.param.equip_effect = equip.effect;
                var sleep = equip.sleep * 1;
                if (sleep >= 3600) {
                    row.param.sleep_period = parseInt(sleep / 3600);
                    row.param.unit = 'hour';
                } else if (sleep >= 60 && sleep < 3600) {
                    row.param.sleep_period = parseInt(sleep / 60);
                    row.param.unit = 'minute';
                } else {
                    row.param.sleep_period = parseInt(sleep);
                    row.param.unit = 'second';
                }
                if (equip.target) {
                    row.param.min = equip.target;
                }

                console.log(row);
                return row;
            },
            get_all_equip: function (callback) {
                var _this = this;
                $.get(API('/env/equipments/manage/all_equip'), function (data) {
                    if (data.error) {
                        _this.$Message.error('获取设备列表出错');
                        return;
                    }
                    var all_equips = [], all_equips_obj = {};
                    _.each(data.rows, function (row) {
                        all_equips_obj[row.equip_no] = row;
                        all_equips.push({equip_no: row.equip_no, name: row.name});
                    });
                    _this.all_equips = all_equips;
                    _this.all_equips_obj = all_equips_obj;

                    if (_this.tree_list.length) {
                        callback && callback();
                        return;
                    }
                    $.get(API('/base/envs/tree/'), function (data) {
                        _this.tree_list = makeTree(data);

                        //生成环境树方法
                        function makeTree(data) {
                            var result = [];
                            _.each(data, function (item, index) {
                                var node = {
                                    label: item.name,
                                    children: [],
                                    value: item.env_no
                                };
                                if (item.children && item.children.length !== 0) {
                                    node.children = makeTree(item.children);
                                }
                                result.push(node);
                            });
                            return result;
                        }

                        callback && callback();
                    });

                }, 'json');

            },
            edit_remark: function (index) {
                var _this = this;
                var equip = _this.sel_equips_data[index];
                console.log('edit_remark', index, equip);
                if (!equip) {
                    return;
                }
                layer.prompt({title: '输入备注信息', value: equip.remark, formType: 2}, function (text, layer_index) {
                    layer.close(layer_index);
                    if (text) {
                        $.post(API('/env/equipments/manage/edit/'), {
                            equip_no: equip.equip_no,
                            remark: text
                        }, function (data) {
                            _this.$Message.info(data.msg);
                            _this.sel_equips_data[index].remark = text;
                            _this.all_equips_obj[equip.equip_no].remark = text;
                        });
                    }
                });
            },
            del_equip: function (index) {
                this.sel_equips_data.splice(index, 1);
                this.sel_equips.splice(index, 1);
            },
            ok: function () {
                var _this = this;
                var settings = [];
                var err;
                var is_send_instruct = false;//是否是下发指令
                if (_this.type === 'other' || /^[0-9a-fA-F]{2}$/.test(_this.type)) {
                    is_send_instruct = true;
                }

                _.each(_this.sel_equips_data, function (row) {
                    if (!_this.type_obj[row.type]) {
                        return;
                    }
                    if (row.no_support) {
                        return;//不支持此参数
                    }
                    var rt = {};
                    if (_this.type_obj[row.type].valid) {
                        rt = _this.type_obj[row.type].valid(row.param);
                    }
                    if (rt.err) {
                        err = rt.err;
                        return;
                    }
                    console.log(rt);
                    var setting = {};
                    setting.equip_no = row.equip_no;
                    setting.instruct = row.type;
                    setting.operation = _this.type_obj[row.type].name;
                    setting.remark = rt.remark || '';
                    if (is_send_instruct) {
                        setting.send_type = rt.send_type || _this.send_type;
                        if (setting.send_type === 3) {
                            setting.send_cycle = rt.send_cycle || 0;
                        }
                        setting.send_data = rt.data || '';
                    } else {
                        setting = _.extend(setting, rt.data);
                    }
                    settings.push(setting);
                });
                console.log(settings);
                if (err) {
                    _this.$Message.error(err);
                    return;
                }
                if (!settings.length) {
                    _this.$Message.error('无设备进行操作');
                    return;
                }

                _this.send_loading = true;

                $.post(API('/env/equipments/setting'), {settings: settings}, function (data) {
                    _this.send_loading = false;
                    if (data.error) {
                        _this.$Message.error(data.error);
                        return;
                    }
                    if (is_send_instruct) {
                        _this.$Message.info(data.msg + ',等待数据下发');
                        if (_this.send_type === '2') {
                            require('common/socket.io').emit('nowSendDown');
                            console.log('nowSendDown');
                        }
                    } else {
                        _this.$Message.info(data.msg);
                    }
                    _this.tab_key = 'history_key';
                    _this.get_history_filter();
                    _this.get_history();
                    _this.ok_end && _this.ok_end();
                }, 'json').error(function () {
                    _this.send_loading = false;
                    _this.$Message.error('保存失败');
                });
            },
            cancel: function () {
                this.show_modal = false;
                this.auto_load_history = false;
            },
            sel_equip: function () {

                var _this = this;
                var new_equip_no = [];
                var old_equip_no = _.pluck(_this.sel_equips_data, 'equip_no');
                console.log(old_equip_no, _this.sel_equips);
                var del_equip_no = _.difference(old_equip_no, _this.sel_equips);//移除
                _.each(_this.sel_equips, function (equip_no) {
                    if (equip_no && !_.contains(old_equip_no, equip_no)) {
                        new_equip_no.push(equip_no);
                    }
                });
                console.log(new_equip_no);
                _.each(del_equip_no, function (equip_no) {
                    if (equip_no !== '全部') {
                        _this.sel_equips_data.splice(_.indexOf(old_equip_no, equip_no), 1);
                    }
                });
                console.log(del_equip_no);
                _.each(new_equip_no, function (equip_no) {
                    var row = _this.get_equip_row(equip_no);
                    if (row) {
                        _this.sel_equips_data.push(row);
                    }
                });
                console.log(_this.sel_equips_data);

            },
            get_types: function () {
                var _this = this;

                function is_float(f) {
                    var reg = /(^-?(\d+|\d+\.\d+$))(?!.)/;
                    var ret = reg.exec(f);
                    if (ret && ret.index == 0) {
                        return true;
                    }
                    return false;
                }

                var type_list = [
                    {
                        name: '修改设备信息',
                        options: [
                            {
                                key: 'equip_status', name: "设定使用状态",
                                val: ['equip_status', 'equip_clear_env'],//监听变化
                                valid: function (param) {
                                    var json = {};
                                    json.status = param.equip_status;
                                    if (param.equip_clear_env) {
                                        json.clear_env = param.equip_clear_env;
                                    }
                                    return {data: json};
                                }
                            },
                            {
                                key: 'equip_name', name: "修改设备名称",
                                val: ['equip_name'],//监听变化
                                valid: function (param) {
                                    var json = {};
                                    json.name = param.equip_name;
                                    return {data: json};
                                }
                            },
                            {
                                key: 'equip_env_no', name: "修改设备位置",
                                val: ['equip_env_no'],//监听变化
                                valid: function (param) {
                                    var json = {};
                                    json.env_no = _.last(param.equip_env_no);
                                    return {data: json};
                                }
                            },
                            {
                                key: 'equip_model', name: "修改型号",
                                val: ['equip_model'],//监听变化
                                valid: function (param) {
                                    var json = {};
                                    json.model = param.equip_model;
                                    return {data: json};
                                }
                            },
                            {
                                key: 'equip_manufacturer', name: "修改厂商",
                                val: ['equip_manufacturer'],//监听变化
                                valid: function (param) {
                                    var json = {};
                                    json.manufacturer = param.equip_manufacturer;
                                    return {data: json};
                                }
                            },
                            {
                                key: 'equip_applicability', name: "修改适用条件",
                                val: ['equip_applicability'],//监听变化
                                valid: function (param) {
                                    var json = {};
                                    json.applicability = param.equip_applicability;
                                    return {data: json};
                                }
                            },
                            {
                                key: 'equip_remark', name: "修改备注",
                                val: ['equip_remark'],//监听变化
                                valid: function (param) {
                                    var json = {};
                                    json.remark = param.equip_remark;
                                    return {data: json};
                                }
                            },
                            {
                                key: 'equip_img', name: "添加图片",
                                val: ['equip_img'],
                                valid: function (param) {
                                    var json = {};
                                    // console.log(param);
                                    var equip_img = window.temp_equip_imags[param.id];
                                    console.log('equip_img', equip_img);
                                    if (equip_img) {
                                        json.file = equip_img;
                                    }
                                    return {data: json};
                                }
                            },
                            {
                                key: 'box_open_auth', name: "开盖授权",
                                equip_types: ['智能囊匣'],
                                val: ['box_open_kdate'],//监听变化
                                valid: function (param) {
                                    var json = {};
                                    if (!param.box_open_kdate) {
                                        return {err: '请选择时间'};
                                    }
                                    console.log(param.box_open_kdate);
                                    json.start_time = parseInt(new Date(param.box_open_kdate[0]).getTime() / 1000);
                                    json.end_time = parseInt(new Date(param.box_open_kdate[1]).getTime() / 1000);
                                    return {data: json};
                                }
                            },
                            {
                                key: 'box_move_auth', name: "震动授权",
                                equip_types: ['智能囊匣'],
                                val: ['box_move_kdate'],//监听变化
                                valid: function (param) {
                                    var json = {};
                                    if (!param.box_move_kdate) {
                                        return {err: '请选择时间'}
                                    }
                                    console.log(param.box_move_kdate);
                                    json.start_time = parseInt(new Date(param.box_move_kdate[0]).getTime() / 1000);
                                    json.end_time = parseInt(new Date(param.box_move_kdate[1]).getTime() / 1000);
                                    return {data: json};
                                }
                            },
                            {
                                key: 'ctr_info', name: "修改投放信息",
                                equip_types: ['调控材料'],
                                val: ['ctr_quantity', 'ctr_kdate'],//监听变化
                                valid: function (param) {
                                    var json = {};
                                    if (!param.ctr_quantity || !param.ctr_kdate) {
                                        return {err: '请选择时间和用量'}
                                    }
                                    console.log(param.ctr_kdate);
                                    json.quantity = param.ctr_quantity;
                                    json.control_time = parseInt(new Date(param.ctr_kdate[0]).getTime() / 1000);
                                    json.replace_time = parseInt(new Date(param.ctr_kdate[1]).getTime() / 1000);
                                    return {data: json};
                                }
                            },
                            {
                                key: 'equip_effect', name: "修改调控效果",
                                equip_types: ['调控材料', '调湿机', '充氮调湿柜'],
                                val: ['equip_effect'],//监听变化
                                valid: function (param) {
                                    var json = {};
                                    json.effect = param.equip_effect;
                                    return {data: json};
                                }
                            }
                        ]
                    },
                    {
                        name: '下发指令',
                        options: [
                            // {
                            //     key: '01', name: '设置工作模式(0x01)',
                            //     val: ['model'],//监听变化
                            //     info: function (param) {
                            //         return param.model;
                            //     },
                            //     valid: function (param) {
                            //         var json = {};
                            //         json.model = param.model;
                            //         return {data: json};
                            //     }
                            // },
                            {
                                key: '02', name: '设置休眠周期(0x02)',
                                val: ['sleep_period', 'unit'],//监听变化
                                info: function (param) {
                                    return param.sleep_period + '' + param.unit;
                                },
                                valid: function (param) {
                                    var json = {};
                                    json.sleep_period = param.sleep_period * 1;
                                    json.unit = param.unit;
                                    if (parseInt(json.sleep_period) != json.sleep_period) {
                                        return {err: '休眠周期必须为整数'};
                                    }
                                    if (json.unit === 'hour') {
                                        if (json.sleep_period > 55 || json.sleep_period < 1) {
                                            return {err: '休眠周期为1~55'};
                                        }
                                    } else {
                                        if (json.sleep_period > 100 || json.sleep_period < 1) {
                                            return {err: '休眠周期为1~100'};
                                        }
                                    }
                                    return {data: json};
                                }
                            },
                            {key: '03', name: "同步系统时间(0x03)"},
                            // {
                            //     key: '04', name: '设置设备编号(0x04)',
                            //     val: ['equip_no'],//监听变化
                            //     info: function (param) {
                            //         return param.equip_no;
                            //     },
                            //     valid: function (param) {
                            //         var json = {};
                            //         json.equip_no = param.equip_no + '';
                            //         var reg = /\d{11}/;
                            //         if (json.equip_no.length != 11) {
                            //             return {err: '设备编号应为11位'};
                            //         }
                            //         if (reg.exec(json.equip_no) == false) {
                            //             return {err: '设备编号应为11位数字'};
                            //         }
                            //         return {data: json};
                            //     }
                            // }
                            //     ]
                            // },
                            // {
                            //     name: '调控指令',
                            //     options: [
                            // {
                            //     key: "30", name: "设置调控模式(0x30)",
                            //     val: ['c_model'],//监听变化
                            //     info: function (param) {
                            //         return param.c_model;
                            //     },
                            //     valid: function (param) {
                            //         var json = {};
                            //         json.c_model = param.c_model;
                            //         return {data: json};
                            //     }
                            // },
                            {
                                key: "31", name: "设定调控目标(0x31)",
                                val: ['control', 'min'],//监听变化
                                info: function (param) {
                                    return param.control + ':' + param.min;
                                },
                                valid: function (param) {
                                    var json = {};
                                    json.control = param.control;
                                    json.min = param.min * 1;

                                    if (json.min == '') {
                                        return {err: '请输入调控值'};
                                    }
                                    if (json.control == 'humidity' && (json.min > 70 || json.min < 30)) {
                                        return {err: '调控值(30~70)'};
                                    }
                                    if (json.control == 'lighting' && (json.min > 100 || json.min < 0)) {
                                        return {err: '调控值(0~100)'};
                                    }
                                    json.max = json.min;
                                    return {data: json};
                                }
                            },
                            // {
                            //     key: "32", name: "设置调控内部参数(0x32)",
                            //     val: ['control_inner', 'c_order', 'c_value'],//监听变化
                            //     info: function (param) {
                            //         return param.control_inner + ',序号:' + param.c_order + ',调控值:' + param.c_value;
                            //     },
                            //     valid: function (param) {
                            //         var json = {};
                            //         json.control_inner = param.control_inner;
                            //         json.c_order = param.c_order;
                            //         json.c_value = param.c_value;
                            //         if (json.c_order == '') {
                            //             return {err: '序号不能为空'};
                            //         }
                            //         if (json.c_value == '') {
                            //             return {err: '调控值不能为空'};
                            //         }
                            //         return {data: json};
                            //     }
                            // },
                            //     ]
                            // },
                            // {
                            //     name: '标定/校正指令',
                            //     options: [
                            {
                                key: "20", name: "标定设备(0x20)",
                                val: ['correction', 'crt_value', 'send_repeat', 'send_cycle'],//监听变化
                                info: function (param) {
                                    return param.correction + ',标定值:' + param.crt_value;
                                },
                                valid: function (param) {
                                    var json = {};
                                    json.correction = param.correction;
                                    json.crt_value = param.crt_value;

                                    if (!json.crt_value) {
                                        return {err: '标定值不能空'};
                                    }
                                    var crt_value = json.crt_value.replace('，', ',').split(',');

                                    for (var i in crt_value) {
                                        if (is_float(crt_value[i]) === false) {
                                            return {err: "第" + (parseInt(i) + 1) + "个标定值应为整数或小数"};
                                        }
                                    }
                                    var send_cycle = 0, send_type = 0;
                                    if (param.send_repeat) {//勾选重复
                                        send_cycle = param.send_cycle;
                                        send_type = 3;
                                    }
                                    return {data: json, send_type: send_type, send_cycle: send_cycle};
                                }
                            },
                            {
                                key: "21", name: "校正设备(0x21)",
                                val: ['correction', 'crt_value'],//监听变化
                                info: function (param) {
                                    return param.correction + ',校正值:' + param.crt_value;
                                },
                                valid: function (param) {
                                    var json = {};
                                    json.correction = param.correction;
                                    json.crt_value = param.crt_value;

                                    if (!json.crt_value) {
                                        return {err: '校正值不能空'};
                                    }
                                    var crt_value = json.crt_value.replace('，', ',').split(',');
                                    for (var i in crt_value) {
                                        if (is_float(crt_value[i]) === false) {
                                            return {err: "第" + (parseInt(i) + 1) + "个校正值应为整数或小数"};
                                        }
                                    }
                                    return {data: json};
                                }
                            },
                            //     ]
                            // },
                            // {
                            //     name: '其他指令',
                            //     options: [
                            // {
                            //     key: "10", name: "设置:量程(0x10)",
                            //     val: ['range_param', 'range_value1', 'range_value2'],//监听变化
                            //     info: function (param) {
                            //         return param.range_param + '/' + param.range_value1 + '/' + param.range_value2;
                            //     },
                            //     valid: function (param) {
                            //         var json = {};
                            //         json.range_param = param.range_param;
                            //         json.range_value1 = param.range_value1;
                            //         json.range_value2 = param.range_value2;
                            //         if (!json.range_value1) {
                            //             return {err: '请输入参数1'};
                            //         }
                            //         return {data: json};
                            //     }
                            // },
                            // {
                            //     key: "11", name: "设置:预警范围(0x11)",
                            //     val: ['alert_param', 'alert_value1', 'alert_value2'],//监听变化
                            //     info: function (param) {
                            //         return param.alert_param + '/' + param.alert_value1 + '/' + param.alert_value2;
                            //     },
                            //     valid: function (param) {
                            //         var json = {};
                            //         json.alert_param = param.alert_param;
                            //         json.alert_value1 = param.alert_value1;
                            //         json.alert_value2 = param.alert_value2;
                            //         if (!json.alert_value1) {
                            //             return {err: '请输入参数1'};
                            //         }
                            //         return {data: json};
                            //     }
                            // },
                            // {
                            //     key: "12", name: "设置频率波特率(0x12)",
                            //     val: ['f_rate', 'b_rate'],//监听变化
                            //     info: function (param) {
                            //         return '频率:' + param.f_rate + ',波特率:' + param.b_rate;
                            //     },
                            //     valid: function (param) {
                            //         var json = {};
                            //         json.f_rate = param.f_rate;
                            //         json.b_rate = param.b_rate;
                            //         return {data: json};
                            //     }
                            // },
                            {
                                key: "22", name: "设置功能参数(0x22)",
                                val: ['parameter', 'func', 'set_value', 'set_unit'],//监听变化
                                info: function (param) {
                                    return param.parameter + ',' + param.func + ',' + param.set_value;
                                },
                                valid: function (param) {
                                    var json = {};
                                    json.parameter = param.parameter;
                                    json.func = param.func;
                                    json.set_value = param.set_value;
                                    if (!json.func) {
                                        return {err: '功能参数不能空'};
                                    }

                                    if (['设置除湿目标值', '设置除湿时间', '终端传感器预热时间',
                                            '终端全范围湿度补偿值', '终端循环发送帧数', '终端全范围湿度补偿值',
                                            '终端全范围湿度补偿开关', '终端校正数值开关', '终端发送数据类型'
                                        ].indexOf(json.func) !== -1) {

                                        if (json.set_value === '') {
                                            return {err: '设定值不能空'};
                                        }
                                        if (['设置除湿时间', '终端传感器预热时间'].indexOf(json.func) !== -1) {
                                            json.set_unit = param.set_unit;
                                            if (parseInt(json.set_value) != json.set_value) {
                                                return {err: json.func + '必须为整数'};
                                            }
                                            if (json.set_unit === 'hour') {
                                                if (json.set_value > 55 || json.set_value < 1) {
                                                    return {err: json.func + '为1~55'};
                                                }
                                            } else {
                                                if (json.set_value > 100 || json.set_value < 1) {
                                                    return {err: json.func + '为1~100'};
                                                }
                                            }

                                        }
                                    }

                                    return {data: json};
                                }
                            },
                            // {key: '0a', name: "下发显示图片(0x0a)"},
                            // {
                            //     key: 'box_model', name: "切换囊匣模式(0x)",
                            //     equip_types: ['智能囊匣'],
                            //     val: ['box_model'],//监听变化
                            //     valid: function (param) {
                            //         var json = {};
                            //         json.model = param.box_model;
                            //         return {data: json};
                            //     }
                            // },
                            {
                                key: "other", name: "自定义指令(0x)",
                                val: ['other'],//监听变化
                                info: function (param) {
                                    return param.other;
                                },
                                valid: function (param) {
                                    var json = {};
                                    json.other = param.other;
                                    if (!json.other) {
                                        return {err: '请输入指令及参数'};
                                    }
                                    if (!/^[0-9a-fA-F ]+$/.test(json.other)) {
                                        return {err: '指令及参数必须为16进制'};
                                    }

                                    return {data: json};
                                }
                            },
                        ]
                    }, {
                        name: '其他操作',
                        options: [
                            {
                                key: 'replace', name: "设备替换",
                                val: ['replace_no'],//监听变化
                                valid: function (param) {
                                    var json = {};
                                    json.new_no = param.replace_no;
                                    if (!json.new_no) {
                                        return {err: '请输入指令及参数'};
                                    }
                                    return {data: json};
                                }
                            },
                        ]
                    }
                ];

                _this.type_list = type_list;
                var type_obj = {};
                _.each(type_list, function (group) {
                    _.each(group.options, function (param) {
                        type_obj[param.key] = param;
                    });
                });
                _this.type_obj = type_obj;
            },
            change_type: function () {
                var _this = this;
                _.each(_this.sel_equips_data, function (row) {
                    row.type = _this.type;
                    row.no_support = false;
                    //不支持此类设备操作
                    if (_this.type_obj[_this.type].equip_types && _this.type_obj[_this.type].equip_types.indexOf(row.equip_type) === -1) {
                        row.no_support = true;
                    }
                    console.log(_this.type_obj[_this.type].equip_types, row);
                });
            },
            get_type_name: function (type) {
                return this.type_obj[type] ? this.type_obj[type].name : '';
            },
            get_type_info: function (type, param) {
                return this.type_obj[type].info ? this.type_obj[type].info(type, param) : '';
            },
            get_history_filter: function () {
                var _this = this;
                var search_data = {
                    show_env_tree: false,
                    key: '',
                    env_no: [],
                    param: {}
                };
                search_data.save_history_func = function (history) {
                    my_store('set_equip_search_history', history);
                };
                search_data.history = my_store('set_equip_search_history') || [];
                search_data.right_list = [];
                $.get(API('/env/equipments/operation/filter'), function (data) {
                    if (data.equip_opt && data.equip_opt.length) {
                        search_data.right_list.push({
                            type: 'status', key: 'operation', name: '操作', data: data.equip_opt,
                        });
                    }
                    if (data.operator && data.operator.length) {
                        search_data.right_list.push({
                            type: 'status', key: 'operator', name: '操作者', data: data.operator,
                        });
                    }
                    search_data.right_list.push({
                        type: 'datetimerange', key: 'time', name: '时段', data: []
                    });

                });
                _this.$refs.history_search.init(search_data);//有筛选条件获取列表数据
            },
            get_history: function () {
                var _this = this;
                var param = {};
                param.page = _this.history_page;
                param.limit = _this.history_limit;
                param.id = _this.search_data.key;
                _.each(_this.search_data.param, function (val, key) {
                    param[key] = val;
                    if (_.isArray(val)) {
                        param[key] = val.join(',');
                        if (param[key] === ',') {
                            param[key] = '';
                        }
                    }
                });
                console.log(param);
                _this.history_spin_key = true;
                $.post(API('/env/equipments/operation/operation_list'), param, function (data) {
                    _this.history_spin_key = false;
                    if (data.error) {
                        _this.$Message.error(data.error);
                        return;
                    }
                    _this.send_history_data = data.rows;
                    _this.history_count = data.total;
                }, 'json').error(function () {
                    _this.history_spin_key = false;
                });

            },
            get_send_history_columns: function () {
                var _this = this;
                var columns = [
                    {
                        title: '#',
                        width: 50,
                        align: 'center',
                        render: function (row, column, index) {
                            return (_this.history_page - 1) * _this.history_limit + index + 1;
                        }
                    },
                    {
                        title: '设备编号',
                        width: 90,
                        key: 'equip_no',
                        render: function (row, column, index) {
                            if (!row.equip_no) {
                                return '';
                            }
                            return row.equip_no.length > 11 ? row.equip_no.slice(-11) : row.equip_no;
                        }
                    },
                    {
                        title: '配置类型',
                        width: 160,
                        key: 'operation',
                        render: function (row, column, index) {
                            var cycles = ['', '每天0点', '每周一0点', '每月一日0点'];
                            if (row.send_type == 3) {
                                return row.operation + '' + (cycles[row.send_cycle] ? '|重复:' + (cycles[row.send_cycle]) : '');
                            }
                            return row.operation;
                        }
                    },
                    {
                        title: '配置参数',
                        width: 250,
                        key: 'remark'
                    },
                    {
                        title: '状态',
                        width: 80,
                        key: 'send_status',
                        render: function (row, column, index) {
                            if (!row.send_type) {
                                return '';
                            }
                            var status_text = ['无反馈', '等待下发', '已下发', '已反馈', '组帧错误', '已取消'];
                            return status_text[row.send_status] + (row.send_count > 1 ? '(<span data-title="下发次数">' + row.send_count + '</span>)' : '');
                        }
                    }, {
                        title: '操作时间',
                        width: 140,
                        key: 'operation_time',
                        render: function (row) {
                            return '<Tooltip  content="操作者：' + row.operator + '" placement="top">' + row.operation_time + '</Tooltip>';
                        }
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
                    }
                ];
                return columns;
            },
            history_search: function (json) {
                var _this = this;
                _this.search_data = json;
                _this.get_history(json);
            },
            auto_load_history_fn: function () {
                var _this = this;
                setTimeout(function () {
                    _this.auto_load_history_fn();
                    if (_this.auto_load_history) {
                        _this.get_history();
                    }
                }, 10000);


            }
        }
    });
</script>

<template id="param_data">

    <div v-show="no_support">
        <Icon type="minus-circled"></Icon>
        该设备不支持此配置
    </div>
    <div class="param_data" v-show="!no_support">

        <template v-if="type=='equip_status'">
            <Radio-group :model.sync="param.equip_status" type="button">
                <Radio value="启用"></Radio>
                <Radio value="备用"></Radio>
                <Radio value="停用"></Radio>
            </Radio-group>
            <Checkbox :checked.sync="param.equip_clear_env" v-show="['备用','停用'].indexOf(param.equip_status)!==-1">
                清空设备位置
            </Checkbox>
            <div style="padding-top: 10px;display: inline-block;padding-bottom: 4px;vertical-align: bottom;">
                <Tooltip content="启用设备之后，系统自动标志设备状态为正常、异常、低电" placement="top">
                <Icon type="help-circled" size="20"
                      v-show="param.equip_status=='启用'"></Icon>
                </Tooltip>
            </div>
        </template>

        <div v-if="type=='equip_name'">
            <i-input style="width: 150px;" :value.sync="param.equip_name"
                     placeholder="请输入设备名称"></i-input>
        </div>

        <div v-if="type=='equip_env_no'">
            <Cascader style="width:400px;" :data="tree_list" :value.sync="param.equip_env_no"
                      change-on-select></Cascader>
        </div>

        <div v-if="type=='equip_model'">
            <i-input style="width: 350px;" :value.sync="param.equip_model"
                     placeholder="请输入型号"></i-input>
        </div>

        <div v-if="type=='equip_manufacturer'">
            <i-input style="width: 350px;" :value.sync="param.equip_manufacturer"
                     placeholder="请输入厂商"></i-input>
        </div>

        <div v-if="type=='equip_applicability'">
            <i-input style="width: 350px;" :value.sync="param.equip_applicability"
                     placeholder="请输入适用条件"></i-input>
        </div>

        <div v-if="type=='equip_remark'">
            <i-input style="width: 350px;" :value.sync="param.equip_remark"
                     placeholder="请输入备注"></i-input>
        </div>

        <div v-if="type=='equip_img'">
            <i-button @click="upload_img()" v-show="param.id">选择图片</i-button>

            <Tooltip placement="top" v-for="(index,img) in img_list" style="margin-right: 5px;">
                <Icon type="image" size="20"></Icon>
                <div slot="content">
                    <img width="200" :src="img"/>
                    <Icon type="android-close"
                          @click="del_img(index)"
                          style="color: #f00;font-size: 20px;vertical-align: top;cursor: pointer"></Icon>
                </div>
            </Tooltip>

        </div>

        <div v-if="type=='box_model'">
            <Radio-group :model.sync="param.box_model" type="button">
                <Radio value="正常"></Radio>
                <Radio value="运输"></Radio>
                <Radio value="关机"></Radio>
            </Radio-group>
        </div>

        <div v-if="type=='box_open_auth'">
            <Date-picker type="datetimerange" format="yyyy-MM-dd HH:mm" :value.sync="param.box_open_kdate"
                         placeholder="选择时间段"
                         style="width: 260px"></Date-picker>
        </div>
        <div v-if="type=='box_move_auth'">
            <Date-picker type="datetimerange" format="yyyy-MM-dd HH:mm" :value.sync="param.box_move_kdate"
                         placeholder="选择时间段"
                         style="width: 260px"></Date-picker>
        </div>
        <div v-if="type=='ctr_info'">
            <Row>
                <i-col span="11">
                    用量
                    <i-input style="width: 70px;" :value.sync="param.ctr_quantity"
                             placeholder="用量"></i-input>
                    单位：kg
                    &nbsp;
                    使用日期
                </i-col>
                <i-col span="13">

                    <Date-picker type="daterange" :value.sync="param.ctr_kdate"
                                 placeholder="选择使用日期时间段"
                                 style="width: 200px"></Date-picker>
                </i-col>
            </Row>

        </div>

        <div v-if="type=='equip_effect'">
            <i-input style="width: 150px;" :value.sync="param.equip_effect"
                     placeholder="1m³需要多少kg调控材料"></i-input>
            单位：kg/m³
        </div>

        <!--下发指令-->

        <div v-if="type=='01'">
            <i-select :model.sync="param.model" style="width: 150px">
                <i-option value="休眠">休眠</i-option>
                <i-option value="工作">工作</i-option>
                <i-option value="校准">校准</i-option>
                <i-option value="复位">复位</i-option>
            </i-select>
        </div>

        <div v-if="type=='02'">

            <i-input style="width: 150px;" :value.sync="param.sleep_period"
                     :placeholder="param.unit=='hour'?'休眠周期为1~55':'休眠周期为1~100'"></i-input>

            <i-select :model.sync="param.unit" style="width: 100px;">
                <i-option value="second">秒</i-option>
                <i-option value="minute">分钟</i-option>
                <i-option value="hour">小时</i-option>
            </i-select>
        </div>

        <div v-if="type=='03'">
            下发时同步系统时间
        </div>

        <div v-if="type=='04'">
            <i-input style="width: 200px;" :value.sync="param.equip_no" placeholder="编号为11位数字(不包含博物馆编号)"></i-input>
        </div>

        <div v-if="type=='05'">
            <i-input style="width: 150px;" :value.sync="param.area_no" placeholder="编号为10~19位"></i-input>
        </div>

        <div v-if="type=='10'">
            <i-select style="width:100px;" :model.sync="param.range_param">
                <i-option v-for="item in params" :value="item.value">{{item.label}}</i-option>
            </i-select>
            参数1:
            <i-input style="width:100px;" :value.sync="param.range_value1" placeholder="参数1">
            </i-input>
            参数2:
            <i-input style="width:100px;" :value.sync="param.range_value2" placeholder="参数2">
            </i-input>
        </div>

        <div v-if="type=='11'">
            <i-select style="width:100px;" :model.sync="param.alert_param">
                <i-option v-for="item in params" :value="item.value">{{item.label}}</i-option>
            </i-select>
            参数1:
            <i-input style="width:100px;" :value.sync="param.alert_value1" placeholder="参数1">
            </i-input>
            参数2:
            <i-input style="width:100px;" :value.sync="param.alert_value2" placeholder="参数2">
            </i-input>
        </div>

        <div v-if="type=='12'">
            频率:
            <i-select :model.sync="param.f_rate" style="width: 100px;">
                <i-option value="0">0</i-option>
                <i-option value="1">1</i-option>
                <i-option value="2">2</i-option>
                <i-option value="3">3</i-option>
                <i-option value="4">4</i-option>
            </i-select>
            波特率:
            <i-select :model.sync="param.b_rate" style="width: 100px;">
                <i-option value="0">0</i-option>
                <i-option value="1">1</i-option>
            </i-select>
        </div>

        <div v-if="type=='20'">
            <i-select :model.sync="param.correction" style="width: 100px;">
                <i-option v-for="item in params" :value="item.value">{{item.label}}</i-option>
            </i-select>
            标定值:
            <i-input :value.sync="param.crt_value" placeholder="Xmin,Xmax,Ymin,Ymax"
                     style="width: 200px;">
            </i-input>
            <Checkbox :checked.sync="param.send_repeat" style="margin-left: 5px;">重复:</Checkbox>
            <i-select :model.sync="param.send_cycle" style="width: 100px;">
                <i-option value="1">每天0点</i-option>
                <i-option value="2">每周一0点</i-option>
                <i-option value="3">每月一日0点</i-option>
            </i-select>
        </div>

        <div v-if="type=='21'">
            <i-select :model.sync="param.correction" style="width: 100px;">
                <i-option v-for="item in params" :value="item.value">{{item.label}}</i-option>
            </i-select>
            校正值:
            <i-input :value.sync="param.crt_value" placeholder="Xmin,Xmax,Ymin,Ymax"
                     style="width: 230px;">
            </i-input>
        </div>

        <div v-if="type=='22'">
            <i-select style="width:100px;" :model.sync="param.parameter">
                <i-option value="--">无</i-option>
                <i-option v-for="item in params" :value="item.value">{{item.label}}</i-option>
            </i-select>
            <i-select style="width: 150px;" :model.sync="param.func">
                <i-option value="清历史数据">0x01:清历史数据</i-option>
                <i-option value="终端重启">0x02:终端重启</i-option>
                <i-option value="进入标定流程">0x03:进入标定流程(传感器上电)</i-option>
                <i-option value="退出标定流程">0x04:退出标定流程(关闭传感器持续供电)</i-option>
                <i-option value="终端发送数据类型">0x05:终端发送数据类型</i-option>
                <i-option value="设置除湿目标值">0x06:设置除湿目标值</i-option>
                <i-option value="设置除湿时间">0x07:设置除湿时间</i-option>
                <i-option value="终端传感器预热时间">0x08:终端传感器预热时间</i-option>
                <i-option value="清除标定数据">0x09:清除标定数据</i-option>
                <i-option value="终端全范围湿度补偿开关">0x0a:终端全范围湿度补偿开关</i-option>
                <i-option value="终端校正数值开关">0x0b:终端校正数值开关</i-option>
                <i-option value="终端全范围湿度补偿值">0x0c:终端全范围湿度补偿值</i-option>
                <i-option value="终端循环发送帧数">0x0d:终端循环发送帧数</i-option>
            </i-select>

            <i-select style="width: 100px;"
                      :model.sync="param.set_value" placeholder="参数值"
                      v-if="param.func=='终端发送数据类型'">
                <i-option value="0">显示AD值（VOC）</i-option>
                <i-option value="1">显示ppb值(VOC)</i-option>
                <i-option value="2">显示AD采样电压（VOC）</i-option>
            </i-select>

            <i-input style="width: 130px;"
                     :value.sync="param.set_value" placeholder="参数值,以,分割多个"
                     v-if="['设置除湿目标值','设置除湿时间','终端传感器预热时间','终端全范围湿度补偿值','终端循环发送帧数','终端全范围湿度补偿值'].indexOf(param.func)!==-1">
            </i-input>

            <i-select style="width: 100px;"
                      :value.sync="param.set_value" placeholder="参数值"
                      v-if="['终端全范围湿度补偿开关','终端校正数值开关'].indexOf(param.func)!==-1">
                <i-option value="0">开启</i-option>
                <i-option value="1">关闭</i-option>
            </i-select>

            <i-select :model.sync="param.set_unit" style="width: 70px"
                      v-if="['设置除湿时间','终端传感器预热时间'].indexOf(param.func)!==-1">
                <i-option value="second">秒</i-option>
                <i-option value="minute">分钟</i-option>
                <i-option value="hour">小时</i-option>
            </i-select>
        </div>

        <div v-if="type=='30'">
            <i-select :model.sync="param.c_model" style="width: 150px;">
                <i-option value="停止">停止</i-option>
                <i-option value="启动">启动</i-option>
            </i-select>
        </div>

        <div v-if="type=='31'">
            <i-select :model.sync="param.control" style="width:100px;">
                <i-option v-for="item in params" :value="item.value">{{item.label}}</i-option>
            </i-select>
            <i-input :value.sync="param.min" style="width: 150px;"
                     :placeholder="param.control=='humidity'?'调控值(30~70)': param.control=='lighting'?'调控值(0~100)':'调控值'"></i-input>

        </div>

        <div v-if="type=='32'">

            <i-select :model.sync="param.control_inner" style="width:100px;">
                <i-option v-for="item in params" :value="item.value">{{item.label}}</i-option>
            </i-select>
            序号:
            <i-input :value.sync="param.c_order" placeholder="序号" style="width:60px;"></i-input>
            调控值:
            <i-input :value.sync="param.c_value" placeholder="调控值" style="width:150px;"></i-input>

        </div>

        <div v-if="type=='86'">
            主动下发
        </div>

        <div v-if="type=='other'">
            <i-input style="width:300px;" placeholder="请输入指令及参数" :value.sync="param.other"></i-input>
        </div>
        <div v-if="type=='replace'">
            <i-select style="width:300px;" :model.sync="param.replace_no" filterable placeholder="替换为">
                <i-option v-for="row in all_equips" :value="row.equip_no">{{ row.equip_no.slice(-11) }}
                </i-option>
            </i-select>
        </div>
    </div>

</template>
<script type="text/javascript">
    Vue.component('param-data', {
        template: '#param_data',
        props: ['type', 'param', 'tree_list', 'no_support', 'all_equips'],
        data: function () {
            return {
                img_list: [],
                params: [
                    {value: "humidity", label: window.get_param_unit_name('humidity').name},
                    {value: "temperature", label: window.get_param_unit_name('temperature').name},
                    {value: "voc", label: window.get_param_unit_name('voc').name},
                    {value: "co2", label: window.get_param_unit_name('co2').name},
                    {value: "light", label: window.get_param_unit_name('light').name},
                    {value: "uv", label: window.get_param_unit_name('uv').name},
                    {value: "organic", label: window.get_param_unit_name('organic').name},
                    {value: "inorganic", label: window.get_param_unit_name('inorganic').name},
                    {value: "sulfur", label: window.get_param_unit_name('sulfur').name},
                    {value: "soil_temperature", label: window.get_param_unit_name('soil_temperature').name},
                    {value: "soil_humidity", label: window.get_param_unit_name('soil_humidity').name},
                    {value: "soil_conductivity", label: window.get_param_unit_name('soil_conductivity').name},
                    {value: "cascophen", label: window.get_param_unit_name('cascophen').name},
                    {value: "so2", label: window.get_param_unit_name('so2').name},
                    {value: "no2", label: window.get_param_unit_name('no2').name},
                    {value: "o3", label: window.get_param_unit_name('o3').name},
                    {value: "oxygen", label: window.get_param_unit_name('oxygen').name},
                    {value: "lighting", label: window.get_param_unit_name('lighting').name},
                ]
            }
        },
        methods: {
            upload_img: function () {
                var _this = this;
                console.log(_this);
                var upload = require('common/upload');
                upload({
                    data: {
                        path: 'equip',
                        width: 600,
                        height: 400,
                    },
                    accept: 'image/jpg,image/jpeg,image/png',
                    success: function (data) {
                        if (data.error) {
                            _this.$Message.error('上传失败');
                            return;
                        }
                        _this.$Message.success('上传成功');
                        _this.img_list.push(data.url);
                        if (!window.temp_equip_imags) {
                            window.temp_equip_imags = {};
                        }
                        if (!window.temp_equip_imags[_this.param.id]) {
                            window.temp_equip_imags[_this.param.id] = [];
                        }
                        window.temp_equip_imags[_this.param.id].push(data.url);
                    },
                    error: function (data) {
                        _this.$Message.error('上传失败');
                    }
                });
            },
            del_img: function (index) {
                var _this = this;
                this.img_list.splice(index, 1);
                window.temp_equip_imags[_this.param.id].splice(index, 1);
            }
        }
    });
</script>
