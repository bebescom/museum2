<template id="custom_yaxis">
    <i-button @click.stop="custom_yaxis">自定义Y轴</i-button>

    <Modal title="自定义Y轴" :visible.sync="showDiyModal" :mask-closable="false">
        <div class="yAreaContainer">
            <i-form :model="yAreaData" :label-width="90">
                <form-item v-for="(key,item) in params_arr_zh" :label="item.name">
                    <row>
                        <i-col span="10">
                            <Radio-group :model.sync="item.status">
                                <Radio value="default">自适应</Radio>
                                <Radio value="user-defined">自定义</Radio>
                            </Radio-group>
                        </i-col>
                        <i-col span="6" v-show="item.status=='user-defined'">
                            <i-input :value.sync="item.min"></i-input>
                        </i-col>
                        <i-col span="2" style="text-align: center"
                               v-show="item.status=='user-defined'">-
                        </i-col>
                        <i-col span="6" v-show="item.status=='user-defined'">
                            <i-input :value.sync="item.max"></i-input>
                        </i-col>
                    </row>
                </form-item>
            </i-form>
        </div>
        <div slot="footer">
            <i-button type="primary" @click="ok">确定</i-button>
            <i-button @click="cancel">取消</i-button>
        </div>
    </Modal>
</template>

<script type="application/javascript">
    Vue.component('custom-yaxis', {
        template: '#custom_yaxis',
        props: ['echart_init', 'params_arr_zh'],
        data: function () {
            return {
                showDiyModal: false,
                yAreaData: {}
            };
        },
        methods: {
            custom_yaxis: function () {
                this.showDiyModal = true;
            },
            ok: function () {
                var _this = this;
                console.log(_this.params_arr_zh);
                _.each(_this.params_arr_zh, function (row) {
                    if (row.status === 'user-defined' && (!_.isNumber(row.min * 1) || !_.isNumber(row.max * 1))) {
                        _this.Message.error(row.name + '自定义必须为数字');
                        return;
                    }
                    store(row.key + '_status', row.status);
                    if (row.status === 'user-defined') {
                        store(row.key + '_min', row.min);
                        store(row.key + '_max', row.max);
                    } else {
                        store(row.key + '_min', null);
                        store(row.key + '_max', null);
                    }
                });
                _this.showDiyModal = false;
                _this.echart_init && _this.echart_init();
            },
            cancel: function () {
                this.showDiyModal = false;
            }
        }
    });
</script>
