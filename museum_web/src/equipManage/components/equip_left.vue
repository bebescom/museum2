<template id="equip_left">

    <Card dis-hover>
        <p slot="title">设备概况</p>

        <p class="p" style="margin-bottom: 10px;">
            <i :class="['museum_icon','big',equip_info.equip_type]"></i>
            <span class="equip_type_name" v-text="equip_info.equip_type"></span>
        </p>
        <p class="p">
            位置：<span v-show="equip_info.nav && equip_info.nav.length > 0"
                     v-for="(index,item) in equip_info.nav"
                     v-text="index > 0 ? ' > ' + item.name : item.name"></span>
            <span v-show="!equip_info.nav || equip_info.nav.length === 0" v-text="'暂无'"></span>
        </p>
        <p class="p">
            编号：{{equip_info.equip_no}}
        </p>
        <p class="p" v-show="equip_info.quantity">
            用量：{{equip_info.quantity}}kg
        </p>
        <p class="p" v-show="equip_info.volume">
            调控体积：{{equip_info.volume}}kg
        </p>
        <p class="p" v-show="equip_info.effect">
            每立方用量：{{equip_info.effect}}kg
        </p>
        <p class="p" v-show="equip_info.status">
            状态：{{equip_info.status}}
        </p>
        <p class="p" v-show="equip_info.sleep">
            数据间隔：{{equip_info.sleep}}s
        </p>
        <p class="p" v-show="equip_info.voltage">
            电压：{{equip_info.voltage}}V
        </p>
        <p class="p" v-show="equip_info.rssi!=null">
            信号：{{equip_info.rssi}}dBm
        </p>
        <p class="p" v-show="equip_info.equip_type=='网关'&&equip_info.ip_port!=null">
            IP：{{equip_info.ip_port}}
        </p>
        <p class="p" v-show="equip_info.model">
            型号：{{equip_info.model}}
        </p>
        <p class="p" v-show="equip_info.manufacturer">
            厂商：{{equip_info.manufacturer}}
        </p>
        <p class="p" v-show="equip_info.applicability">
            适用条件：{{equip_info.applicability}}
        </p>
        <p class="p" v-show="equip_info.target">
            目标值：{{equip_info.target}}
        </p>
        <p class="p">
            备注：{{equip_info.remark}}
        </p>
    </Card>

    <Card dis-hover>
        <p slot="title">最新数据</p>
        <p class="p" v-show="!equip_info.new_data_time">暂无</p>
        <p class="p">
            <span v-text="equip_info.new_data_time ? equip_info.new_data_time : ''"></span>
        </p>
        <div class="new_data">
            <Row class="p" v-for="(key,item) in new_data">
                <i-col span="12">
                    <i :class="['museum_icon','xsmall',key]"></i>
                    {{item.name}}
                </i-col>
                <i-col span="12" style="text-align: right">
                    {{item.val}}{{item.unit}}
                </i-col>
            </Row>
        </div>

    </Card>

    <Card dis-hover v-show="['网关'].indexOf(equip_info.equip_type) !== -1">
        <p slot="title">常用操作</p>

        <p>
            <ping :equip_info="equip_info"></ping>
        </p>

    </Card>

    <Card dis-hover v-show="['调湿机','充氮调湿柜','灯光调控终端'].indexOf(equip_info.equip_type) !== -1">
        <div slot="title">
            <Row>
                <i-col span="12">
                    <b>常用操作</b>
                </i-col>
                <i-col span="12" style="text-align: right">
                    <div v-if="!target_lock_key">
                        <Icon @click="save_target" type="checkmark" class="cursor_pointer" size="20"
                              style="margin-right: 10px;"></Icon>
                        <Icon @click="lock_target" type="close" class="cursor_pointer" size="20"></Icon>
                    </div>
                    <Icon @click="lock_target" type="locked" class="cursor_pointer" size="20"
                          v-else></Icon>

                </i-col>
            </Row>

        </div>
        <div v-if="['调湿机','充氮调湿柜'].indexOf(equip_info.equip_type)!==-1">
            <Row class="p">
                <i-col span="12">目标湿度</i-col>
                <i-col span="12" style="text-align: right">{{target_val||''}}%</i-col>
            </Row>
            <Row class="p">
                <i-col span="24">
                    <Slider :value.sync="target_val" :disabled="target_lock_key"></Slider>
                </i-col>
            </Row>
        </div>
        <div v-if="equip_info.equip_type=='灯光调控终端'">
            <Row class="p">
                <i-col span="12">目标光照强度</i-col>
                <i-col span="12" style="text-align: right">{{target_val||''}}%</i-col>
            </Row>
            <Row class="p">
                <i-col span="24">
                    <Slider :value.sync="target_val" :disabled="target_lock_key"></Slider>
                </i-col>
            </Row>
        </div>

    </Card>


    <Card dis-hover v-show="['调控材料'].indexOf(equip_info.equip_type) !== -1">
        <div slot="title">
            <Row>
                <i-col span="12">
                    <b>常用操作</b>
                </i-col>
                <i-col span="12" style="text-align: right">
                    <div v-if="!target_lock_key">
                        <Icon @click="save_ctr" type="checkmark" class="cursor_pointer" size="20"
                              style="margin-right: 10px;"></Icon>
                        <Icon @click="lock_target" type="close" class="cursor_pointer" size="20"></Icon>
                    </div>
                    <Icon @click="lock_target" type="locked" class="cursor_pointer" size="20"
                          v-else></Icon>

                </i-col>
            </Row>
        </div>

        <p class="p">
            用量:
            <i-input :value.sync="ctr_quantity" style="width: 100px" placeholder="请输入..."
                     :disabled="target_lock_key"></i-input>
            单位：kg
        </p>
        <p class="p">
            使用日期:
            <Date-picker type="daterange" :value.sync="ctr_kdate"
                         placeholder="选择使用日期时间段" :disabled="target_lock_key"
                         style="width: 200px"></Date-picker>
        </p>

    </Card>

    <Card dis-hover v-show="route_list.length">
        <p slot="title">下属设备</p>
        <Row class="p" v-for="(key,item) in route_list">
            <i-col span="10">
                <a :href="'#/equip_info/'+item.equip_no">{{item.name}}</a>
            </i-col>
            <i-col span="14" style="text-align: right">
                {{item.server_time}}
            </i-col>
        </Row>
    </Card>


    <Card dis-hover v-show="similar_relic.length && ['网络设备'].indexOf(equip_info.monitor_type) === -1">
        <p slot="title">同环境藏品</p>
        <p class="p" v-for="(index,item) in similar_relic">
            <i :class="['museum_icon','small',item.level]" :data-title="item.level"></i>
            <a :href="'../relic/index.html?relic_no='+item.relic_no">{{item.name}}</a>
        </p>

    </Card>

    <Card dis-hover v-if="similar_equip.length > 1 && ['网络设备'].indexOf(equip_info.monitor_type) === -1">
        <p slot="title">同环境设备</p>
        <p class="p" v-for="(index,item) in similar_equip" v-show="item.equip_no!=equip_info.equip_no">
            <i :class="['museum_icon','small',item.equip_type]" :data-title="item.equip_type"></i>
            <a :href="'#/equip_info/'+item.equip_no">{{item.name}}</a>
        </p>
    </Card>

    <Card dis-hover v-if="img_list.length">
        <p slot="title">设备图片</p>
        <div class="img" v-for="(index,item) in img_list">
            <a :href="item.url" target="_blank"><img :src="item.url"/></a>
            <Icon type="android-close"
                  @click="del_img(item.id)"></Icon>
        </div>
    </Card>

</template>
<style type="text/css">
    .ping_pop, .ping_pop .ivu-poptip-rel {
        display: block;
    }
</style>
<template id="ping_template">
    <Poptip title="Ping" placement="top-start" class="ping_pop">
        <i-button @click="ping" long>PING</i-button>
        <div slot="content">
            <Spin fix v-if="spinShow">
                <Icon type="load-c" size=18></Icon>
                <div>Loading</div>
            </Spin>
            <div style="width: 500px;height: 200px;overflow: auto;">
                {{{ping_data}}}
            </div>
        </div>
    </Poptip>
</template>
<script type="text/javascript">
    Vue.component('ping', {
        template: '#ping_template',
        props: ['equip_info'],
        data: function () {
            return {
                ping_data: 'a',
                spinShow: true
            };
        },
        methods: {
            ping: function () {
                var _this = this;
                _this.ping_data = '';
                _this.spinShow = true;
                $.get(API("/env/equipments/operation/ping/" + _this.equip_info.equip_no), function (data) {
                    _this.spinShow = false;
                    _this.ping_data = data;
                }).error(function () {
                    _this.spinShow = false;
                });
            }
        }
    });
</script>

<script type="text/javascript">
    Vue.component('equip-left', {
        template: '#equip_left',
        props: ['edit_equip'],
        data: function () {
            return {
                equip_info: {},//设备信息
                new_data: {},//最新数据
                similar_relic: [],//同柜文物
                similar_equip: [],//同柜设备
                img_list: [],//设备图片
                route_list: [],//下属设备
                target_val: 0,//目标值
                target_lock_key: true,//不可编辑
                ctr_quantity: '',//用量
                ctr_kdate: [],//使用日期
            }
        },
        methods: {
            init: function (equip) {
                var _this = this;
                _this.equip_info = equip;
                _this.target_val = equip.target * 1;
                _this.ctr_quantity = equip.quantity;

                // if (_.isDate(equip.control_time) && _.isDate(equip.replace_time)) {
                _this.ctr_kdate = [equip.control_time * 1000, equip.replace_time * 1000];
                // }

                _this.get_new_data();

                _this.get_img();//获取设备图片
                _this.get_router();//获取下属设备

                _this.get_env_equip();//获取同柜设备
                _this.get_env_relic();//获取同柜文物

            },
            edit_remark: function () {
                var _this = this;
                var equip = _this.equip_info;
                console.log('edit_remark', equip);
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
                            equip.remark = text;
                        });
                    }
                });
            },
            get_new_data: function () {
                var _this = this;
                var equip = _this.equip_info;
                if (!equip || !equip.new_data) {
                    return;
                }
                var new_data = {};
                _.each(equip.new_data, function (val, key) {
                    var param = window.get_param_unit_name(key);
                    if (!param || _.contains(['voltage', 'rssi'], key)) {
                        return;
                    }
                    param.val = (val !== undefined || val !== null) ? val : '';
                    new_data[key] = param;
                });
                _this.new_data = new_data;
            },
            get_env_equip: function () {
                var _this = this;
                //无关联环境
                if (!_this.equip_info.env_no) {
                    return;
                }
                $.get(API('/env/environments/cabinet/equips/' + _this.equip_info.env_no), function (data) {
                    var similar_equip = [];
                    _.each(data, function (row) {
                        if (!row || !row.rows || !row.rows.length) {
                            return;
                        }
                        _.each(row.rows, function (elem) {
                            similar_equip.push(elem);
                        });
                    });
                    _this.similar_equip = similar_equip;
                });
            },
            get_env_relic: function () {
                var _this = this;
                //无关联环境
                if (!_this.equip_info.env_no) {
                    return;
                }

                //获取同柜藏品
                $.get(API('/env/environments/cabinet/relics/' + _this.equip_info.env_no), function (data) {
                    if (!data.rows || data.rows.length === 0) return;
                    _this.similar_relic = data.rows;

                });
            },
            get_img: function () {
                var _this = this;
                $.get(API('/env/equipments/images') + '?no=' + _this.equip_info.equip_no, function (data) {
                    if (!data.rows || data.rows.length === 0) return;
                    _this.img_list = data.rows;
                });

            },
            get_router: function () {
                var _this = this;

                if (_this.equip_info.monitor_type !== '网络设备') {
                    return;
                }
                $.get(API('/env/equipments/detail/branch/' + _this.equip_info.equip_no), function (data) {
                    if (!data.rows || data.rows.length === 0) return;
                    _this.route_list = data.rows;
                });

            },
            lock_target: function () {
                this.target_lock_key = !this.target_lock_key;
            },
            save_target: function () {
                var _this = this;
                var setting = {};
                setting.equip_no = _this.equip_info.equip_no;
                setting.instruct = '31';
                setting.send_type = 1;
                setting.operation = '设定调控目标值(0x31)';
                setting.remark = '';

                var json = {};
                json.control = '';
                if (['调湿机', '充氮调湿柜'].indexOf(_this.equip_info.equip_type) !== -1) {
                    json.control = 'humidity';
                } else if (['灯光调控终端'].indexOf(_this.equip_info.equip_type) !== -1) {
                    json.control = 'lighting';
                }
                json.min = _this.target_val * 1;

                if (json.min == '') {
                    _this.$Message.error('请输入调控值');
                    return;
                }
                if (json.control == 'humidity' && (json.min > 70 || json.min < 30)) {
                    _this.$Message.error('调控值(30~70)');
                    return;
                }
                if (json.control == 'lighting' && (json.min > 100 || json.min < 0)) {
                    _this.$Message.error('调控值(0~100)');
                    return;
                }
                json.max = json.min;
                setting.send_data = json;

                $.post(API('/env/equipments/setting'), {settings: [setting]}, function (data) {
                    if (data.error) {
                        _this.$Message.error(data.error);
                        return;
                    }
                    _this.$Message.info(data.msg + ',等待数据下发');
                    _this.equip_info.target = json.min * 1;
                    _this.target_lock_key = true;
                }, 'json').error(function () {
                    _this.$Message.error('保存失败');
                });


            },
            save_ctr: function () {
                var _this = this;
                var setting = {};
                setting.equip_no = _this.equip_info.equip_no;
                setting.instruct = 'ctr_info';
                setting.operation = '修改投放信息';
                setting.remark = '';
                if (!_.isDate(new Date(_this.ctr_kdate[0])) || !_.isDate(new Date(_this.ctr_kdate[1]))) {
                    _this.$Message.error('日期格式错误');
                    return;
                }

                var json = {};
                setting.quantity = _this.ctr_quantity;
                setting.control_time = parseInt(new Date(_this.ctr_kdate[0]).getTime() / 1000);
                setting.replace_time = parseInt(new Date(_this.ctr_kdate[1]).getTime() / 1000);

                $.post(API('/env/equipments/setting'), {settings: [setting]}, function (data) {
                    if (data.error) {
                        _this.$Message.error(data.error);
                        return;
                    }
                    _this.$Message.info(data.msg);
                    _this.target_lock_key = true;
                }, 'json').error(function () {
                    _this.$Message.error('保存失败');
                });


            },
            del_img: function (id) {
                var _this = this;
                layer.confirm('确认删除', {btn: ['删除', '取消']}, function (index) {
                    $.post(API('/env/equipments/images/del_images'), {id: id}, function (data) {
                        _this.get_img();
                    });
                    layer.close(index);
                });
            }
        }
    });
</script>