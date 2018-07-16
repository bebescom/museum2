<template id="originalData">

    <div class="raw_data" style="min-height: 500px;">
        <i-table size="small" :columns="columns" :data="data"
                 v-if="columns && columns.length > 0"></i-table>

        <Page show-total :total="tableTotal" :page-size="pageSize" v-if="tableTotal > 0" :current.sync="currentPage"
              @on-change="changePage"></Page>

        <Spin fix v-show="spinShow">
            <Icon type="load-c" size=18 class="demo-spin-icon-load"></Icon>
            <div>加载中...</div>
        </Spin>

    </div>
</template>

<script type="text/javascript">
    Vue.component('original-data', {
        template: '#originalData',
        props: [],
        data: function () {
            return {
                equip: {},
                stampTime: [],
                spinShow: false,
                tableTotal: 0,
                currentPage: 1,
                pageSize: 10,//每页显示条数
                columns: [{
                    title: '时间',
                    key: 'equip_time',
                    align: 'center'
                }],//
                data: [],//
            }
        },
        methods: {
            init: function (equip, stampTime) {
                var _this = this;
                _this.equip = equip;
                _this.stampTime = stampTime;
                _this.get_data(1);
            },
            get_data: function (page) {
                var _this = this;
                _this.spinShow = true;
                _this.pageSize = Math.floor(($('.body').height() - 35 - 90) / 40);
                //获取原始数据
                $.get(API('/env/equipments/data_lists/' + _this.equip.equip_no), {
                    page: page || 1,
                    limit: _this.pageSize,
                    time: _this.stampTime.join(',')
                }, function (data) {
                    if (!data || data.error) {
                        _this.$Message.error('加载原始数据错误');
                        _this.spinShow = false;
                        return;
                    }
                    if (_this.columns.length === 1 && data && data.rows && data.rows.length) {
                        _.each(data.rows[0], function (val, key) {
                            var param = window.get_param_unit_name(key);
                            if (param) {
                                var _header = {
                                    title: (param ? param.name + ' ' + param.unit : ''),
                                    key: key,
                                    align: 'center'
                                };
                                _this.columns.push(_header);
                            }
                        });
                    }
                    _this.data = data.rows;
                    _this.tableTotal = data.total;
                    _this.spinShow = false;
                });

            },
            changePage: function (page) {
                this.get_data(page);
            }
        }
    });
</script>