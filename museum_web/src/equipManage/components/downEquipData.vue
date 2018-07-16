<template id="equip_down">

    <i-button class="btn" @click="show_export" class="permissionHidden" v-permission="{name:'导出设备数据'}">导出数据
    </i-button>

    <Modal title="下载数据"
           width="650"
           :visible.sync="show_export_key">
        <div slot="footer">
            <i-button type="primary" size="large" @click="ok">确定</i-button>
            <i-button size="large" @click="cancel">取消</i-button>
        </div>

        <i-form v-ref:form :model="form" style="padding: 10px 20px;">
            <Form-item label="任务名称">
                <i-input :value.sync="inputTaskName" placeholder="请输入..." style="width: 280px;">
                </i-input>
            </Form-item>
            <Form-item label="数据时段">
                <Date-picker
                        type="datetimerange"
                        placeholder="选择日期和时间"
                        :options="dateOpitons"
                        format="yyyy-MM-dd HH:mm"
                        :value.sync="dateTime"
                        @on-change="change_time"
                        style="width: 280px;display: inline-block;">
                </Date-picker>
                <div class="longTime" v-show="longTime"
                     style="width: 100%;position: absolute;left: 65px;color: red;">下载时段较长，可能需要等待较长时间
                </div>

            </Form-item>
            <Form-item label="数据种类">
                <Checkbox-group :model.sync="status_group">
                    <Checkbox value="equip_time" disabled>数据采集时间</Checkbox>
                    <Checkbox value="status" disabled>设备状态</Checkbox>
                    <Checkbox value="server_time">数据传输时间</Checkbox>
                    <Checkbox value="voltage">设备电压</Checkbox>
                    <Checkbox value="equip_position">设备位置</Checkbox>
                </Checkbox-group>
                <Checkbox-group :model.sync="params_group" style="margin-left: 60px;">
                    <Checkbox v-for="(key,item) in params_list" :value="key">{{item.name}}</Checkbox>
                </Checkbox-group>

            </Form-item>
        </i-form>

    </Modal>
</template>
<script type="text/javascript">
    Vue.component('equip-down', {
        template: '#equip_down',
        props: ['sel_equip_no_list'],
        data: function () {
            return {
                show_export_key: false,//下载数据是否显示
                longTime: false,
                loading: true,
                dateOpitons: {
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
                    disabledDate: function (date) {//当前时间之后的时间禁用
                        return date && date.valueOf() > Date.now();
                    }
                },

                status_group: [],
                params_list: [],//传感器对象参数
                params_group: [],//传感器已选择参数数组
                inputTaskName: '',//任务名称
                dateTime: [new Date().setHours(0, 0, 0) - 24 * 60 * 60 * 1000, new Date().setHours(0, 0, 0) - 1000],//默认时间

            }
        },
        ready: function () {
            var _this = this;
            _this.params_list = window.web_config.param_unit_name.sensor;
            _this.status_group = ['equip_time', 'status'];
            _this.params_group = ['temperature', 'humidity'];
        },
        methods: {
            show_export: function () {
                var _this = this;
                if (!_this.sel_equip_no_list.length) {
                    _this.$Message.error('请先选择要下载的设备');
                    _this.loading = false;
                    return;
                }

                _this.inputTaskName = _this.sel_equip_no_list.length + '设备_'
                    + _this.formatDateTime(_this.dateTime[0]).split(' ')[0] + '--'
                    + _this.formatDateTime(_this.dateTime[1]).split(' ')[0];

                _this.show_export_key = true;

            },
            ok: function () {
                var _this = this;
                if (!_this.inputTaskName || !_this.dateTime[0] || !_this.dateTime[1]) {
                    _this.$Message.error('参数不完整');
                    return false;
                }
                console.log(_this.formatDateTime(_this.dateTime[0]), _this.formatDateTime(_this.dateTime[1]));

                var json = {};
                json.file_name = _this.inputTaskName;
                json.time = parseInt(new Date(_this.dateTime[0]).getTime() / 1000) + ',' + parseInt(new Date(_this.dateTime[1]).getTime() / 1000);
                json.equip_no = _this.sel_equip_no_list.join(',');
                json.param = _.union(_this.status_group, _this.params_group).join(',');
                json.api_url = "post/env/export/equipment/equip_data";

                window.new_down(json);
                _this.show_export_key = false;
            },
            cancel: function () {
                this.show_export_key = false;
            },
            ok_time: function () {
                var _this = this;
                console.log(_this.formatDateTime(_this.dateTime[0]), _this.formatDateTime(_this.dateTime[1]));
            },
            change_time: function (val) {
                var _this = this;
                console.log(val);
                var time = val.split(' - ');
                var start_date = new Date(time[0]);
                var end_date = new Date(time[1]);
                if (!(end_date.getHours() + end_date.getMinutes())) {
                    end_date = new Date(end_date.setHours(23, 59, 59));
                }
                var days = Math.floor(Math.abs(start_date.getTime() - end_date.getTime()) / 24 / 3600 / 1000);
                _this.longTime = days >= 365;//超过365天提醒
                _this.dateTime = [start_date.getTime(), end_date.getTime()];
                _this.inputTaskName = this.sel_equip_no_list.length + '设备' + '_' + time[0].split(' ')[0] + '--' + time[1].split(' ')[0];

            },//改变时间
            formatDateTime: function (inputTime) {
                var date = new Date(inputTime);
                var y = date.getFullYear();
                var m = date.getMonth() + 1;
                m = m < 10 ? ('0' + m) : m;
                var d = date.getDate();
                d = d < 10 ? ('0' + d) : d;
                var h = date.getHours();
                h = h < 10 ? ('0' + h) : h;
                var minute = date.getMinutes();
                var second = date.getSeconds();
                minute = minute < 10 ? ('0' + minute) : minute;
                second = second < 10 ? ('0' + second) : second;
                return y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second;
            }
        }
    });
</script>