<template id="historyInfo">
    <div class="raw_data" style="min-height: 500px;">
        <div class="componentWrap">
            <new-filter-component :search="history_search" v-ref:history_search
                                  placeholder="操作、操作者"></new-filter-component>
        </div>

        <i-table size="small" :columns="columns" :data="data"></i-table>

        <Page show-total :total="tableTotal" :page-size="pageSize" :current.sync="currentPage"
              @on-change="changePage"></Page>
        <Spin fix v-show="spinShow">
            <Icon type="load-c" size=18 class="demo-spin-icon-load"></Icon>
            <div>加载中...</div>
        </Spin>

    </div>
</template>

<script type="text/javascript">
    Vue.component('history-info', {
        template: '#historyInfo',
        props: [],
        data: function () {
            return {
                equip: {},
                stampTime: [],
                spinShow: false,
                tableTotal: 0,
                currentPage: 1,
                pageSize: 10,//每页显示条数
                columns: this.get_columns(),//
                data: [],//
                search_data: {},
            }
        },
        methods: {
            init: function (equip) {
                var _this = this;
                _this.equip = equip;
                _this.search_data = {};
                _this.get_data(1);

                var search_data = {
                    show_env_tree: false,
                    key: '',
                    env_no: [],
                    param: {}
                };
                search_data.save_history_func = function (history) {
                    my_store('equip_history_search_history', history);
                };
                search_data.history = my_store('equip_history_search_history') || [];

                search_data.right_list = [];
                $.get('/2.2.05_P001/base_api/env/equipments/operation/filter' + '?equip_no=' + equip.equip_no, function (data) {
                    if (data.equip_alert && data.equip_alert.length) {
                        search_data.right_list.push({
                            type: 'status', key: 'operation', name: '报警类型', data: data.equip_alert,
                        });
                    }
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
            get_columns: function () {
                return [
                    {
                        title: '时间',
                        key: 'operation_time',
                        width: 200
                    }, {
                        title: '操作',
                        key: 'operation',
                        width: 200
                    }, {
                        title: '操作者',
                        key: 'operator',
                        width: 200
                    }, {
                        title: '详情与备注',
                        key: 'remark'
                    }
                ];
            },
            get_data: function () {
                var _this = this;
                _this.spinShow = true;
                _this.pageSize = Math.floor(($('.body').height() - 35 - 128) / 40);
                //获取原始数据
                var param = {
                    page: _this.currentPage || 1,
                    limit: _this.pageSize,
                    // time: _this.stampTime.join(',')
                };
                param.id = _this.search_data.key;
                _.each(_this.search_data.param, function (val, key) {

                    if (_.isArray(val)) {
                        if (param[key]) {
                            param[key] += val.join(',');
                        } else {
                            param[key] = val.join(',');
                        }
                        if (param[key] === ',') {
                            param[key] = '';
                        }
                    } else {
                        param[key] = val;
                    }
                });
                console.log(param);

                $.post('/2.2.05_P001/base_api/env/equipments/detail/opt_record/' + _this.equip.equip_no+'', param, function (data) {
                    _this.spinShow = false;
                    if (!data || data.error) {
                        _this.$Message.error('加载历史信息错误');
                        return;
                    }
                    _this.data = data.rows;
                    _this.tableTotal = data.count;
                    _this.spinShow = false;
                }).error(function () {
                    _this.spinShow = false;
                });

            },
            changePage: function (page) {
                this.currentPage = page;
                this.get_data();
            },
            history_search: function (json) {
                var _this = this;
                console.log(json);
                _this.search_data = json;
                _this.get_data(json);
            }
        }
    });
</script>