<!-- 基于iview公共筛选组件 -->
<!-- 后期全部替换为这个筛选组件 -->

<!-- 使用地方 -->
<!-- 1、设备管理 -->
<style type="text/css">
    .filterContainer {
        width: 250px;
        height: 28px;
        border: 1px solid #dedede;
        border-radius: 5px;
        padding: 0 5px 0 5px;
        position: relative;
    }

    .filterContainer .search_key {
        line-height: 26px;
        width: 160px;
        height: 26px;
        border: none;
        outline: none;
        display: inline-block;
        margin: 0;
        vertical-align: top;
    }

    .filterContainer .search_icon {
        cursor: pointer;
        margin-top: 2px;
        position: absolute;
        right: 50px;
    }

    .filterContainer .search_icon:hover {
        color: #1bbc9b;
    }

    .filterContainer .screening {
        color: #1bbc9b;
        font-size: 14px;
        text-align: center;
        width: 40px;
        line-height: 22px;
        border-left: 1px solid #dedede;
        cursor: pointer;
        position: absolute;
        right: 2px;
        top: 2px;
    }

    .filterContainer .searchSuggest {
        position: absolute;
        top: 35px;
        left: 0;
        background-color: #fff;
        z-index: 99999;
        border-radius: 3px;
        box-shadow: -1px 1px 3px 1px #ccc;
        font-size: 12px;
        color: #666;
        right: 0;
        overflow: hidden;
    }

    .filterContainer .searchSuggest .listWrap {
        /*border:1px solid red;*/
        /*max-height:160px;*/
        margin: 0 auto;
        overflow: auto;
    }

    .filterContainer .searchSuggest .listWrap ul li {
        cursor: pointer;
        padding-left: 10px !important;
        color: #5b6272;
        line-height: 30px;
    }

    .filterContainer .searchSuggest .listWrap ul li:hover {
        background-color: #1bbc9b;
        color: #fff;
    }

    .filterContainer .searchSuggest .clear {
        font-style: normal;
        height: 26px;
        text-align: center;
        line-height: 24px;
        /*width: 80px;*/
        /*margin: 0 auto;*/
        cursor: pointer;
        position: relative;
    }

    .screeningContent {
        height: 470px;
        border: 1px solid #dedede;
        border-radius: 5px;
        background-color: #ffffff;
        position: absolute;
        top: 35px;
        left: 0;
        z-index: 999;
    }

    .screeningContent .left-title {
        height: 40px;
        line-height: 40px;
        font-weight: 600;
        padding-left: 20px;
    }

    .screeningContent .left-tree {
        height: 430px;
        overflow: scroll;
        position: relative;
    }

    /*环境树样式覆盖*/

    .screeningContent .left-tree .ivu-icon {
        color: #1bbc9b;
    }

    .screeningContent .left-tree .ivu-tree-node-selected {
        color: #fff;
        background-color: #1bbc9b;
        border-color: #1bbc9b;
    }

    .screeningContent .left-tree .ivu-tree li span.ivu-tree-switcher.ivu-tree-switcher-noop {
        display: inline-block !important;
    }

    .screeningContent .left-tree .ivu-checkbox-checked .ivu-checkbox-inner {
        border-color: #1bbc9b;
    }

    .screeningContent .left-tree .ivu-checkbox-checked:hover .ivu-checkbox-inner {
        border-color: #1bbc9b;
    }

    .screeningContent .left-tree .ivu-checkbox-checked .ivu-checkbox-inner {
        background-color: #1bbc9b;
    }

    .screeningContent .left-tree .ivu-checkbox-indeterminate .ivu-checkbox-inner {
        background-color: #1bbc9b;
        border-color: #1bbc9b;
    }

    .screeningContent .ivu-tree li {
        line-height: 24px;
    }

    .equip-right-data {
        height: 420px;
        overflow-y: scroll;
    }

    .listCol-status {
        clear: both;
        width: 100%;
    }

    .listCol-left {
        font-weight: 600;
        width: 80px;
        line-height: 35px;
        text-align: center;
    }

    .listCol-right {
        width: 540px;
        height: auto;
        line-height: 35px;
    }

    .listCol-left,
    .listCol-right {
        float: left;
    }

    .listCol-status-tags {
        width: auto;
        padding: 5px 8px;
        /* border: 1px solid red; */
        border-radius: 4px;
        margin-right: 10px;
        cursor: pointer;
        display: inline-block;
        line-height: 20px;
    }

    .listCol-status-tags:hover,
    .tagActive {
        background: #1bbc9b;
        color: #ffffff;
    }

    .listCol-status-tags:hover {
        opacity: 0.8;
    }

    .listCol-data-bar {
        width: calc(100% - 30px);
        height: auto;
        line-height: 35px;
        border-bottom: 1px solid #eaeaea;
    }

    .listCol-data-bar:last-child {
        border-bottom: none;
    }

    .listCol-data {
        width: 100%;
        height: auto;
        float: left;
    }

    .screeningButton {
        text-align: right;
    }

    .screeningButton button {
        position: relative;
        top: -5px;
    }

    .screeningButton button:first-child {
        margin-left: 10px;
        margin-right: 5px;
    }

    .screeningButton button:nth-child(2) {
        margin-left: 5px;
        margin-right: 20px;
    }

    .numberReset {
        height: 28px;
        position: absolute;
        right: -100px;
        bottom: -5px;
        font-size: 14px;
    }

    .numberReset.span {
        display: block;
        margin-right: 5px;
    }

</style>
<template id="newFilterComponent">
    <div class="filterContainer">

        <input class="search_key" type="text" :placeholder="placeholder" v-model="search_data.key"
               @focus="show_history"
               @keyup.esc="esc_history"
               @keypress.enter="search_ok"
               @click.stop>

        <Icon class="search_icon" type="ios-search" size="22" @click.stop="search_ok"></Icon>

        <span @click.stop="screening" class="screening">筛选</span>

        <div class="overlay searchSuggest" v-show="show_history_key">
            <div class="listWrap">
                <ul>
                    <li v-for="(index,item) in search_history" @click.stop="select_history(item)" v-text="item">
                    </li>
                </ul>
            </div>
            <div class="clear" @click.stop="clear_history">
                <Icon type="trash-a" size="15"></Icon>
                清空历史
            </div>
        </div>

        <div :style="{width:screeing_width+'px'}" class="screeningContent" v-show="show_panel_key" @click.stop>
            <Row>
                <i-col v-show="show_env_tree" :span="show_env_tree?6:0">
                    <div class="left-title">
                        环境树
                    </div>
                    <div class="left-tree">
                        <Tree :data="env_tree_data" multiple
                              @on-check-change="check_env_no"
                              v-ref:tree show-checkbox></Tree>
                    </div>
                </i-col>
                <i-col :span="show_env_tree?18:24">
                    <div class="equip-right-data">
                        <div v-for="item in right_list">
                            <div class="listCol-status" v-if="item.type=='status'">
                                <div class="listCol-left" v-text="item.name"></div>
                                <div class="listCol-right">
                                <span class="listCol-status-tags"
                                      :class="{tagActive:tag_active(item.key,row.name)}"
                                      @click.stop="tag_click(item.key,$event,row.name)"
                                      v-for="row in item.data" v-text="row.name + ' ' + row.count"></span>
                                </div>
                            </div>
                            <div class="listCol-data" v-if="item.type=='type_all'">
                                <div class="listCol-left" v-text="item.name"></div>
                                <div class="listCol-right">
                                    <div class="listCol-data-bar" v-for="(index,rows) in item.data">
                                    <span class="listCol-status-tags listCol-status-all-tags"
                                          :class="{tagActive:tag_all_active(item.key,rows)}"
                                          @click.stop="tag_all_click(item.key,$event,rows)">{{'所有' + index + ' ' + get_tag_length(rows)}}</span>
                                        <span class="listCol-status-tags"
                                              :class="{tagActive:tag_active(item.key,elem.name)}"
                                              @click.stop="tag_click(item.key,$event,elem.name)"
                                              v-for="(i,elem) in rows">{{elem.name + ' ' + elem.count}}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="listCol-status" v-if="item.type=='datetimerange'">
                                <div class="listCol-left" v-text="item.name"></div>
                                <div class="listCol-right">
                                    <Date-picker type="datetimerange" :value.sync="search_data.param[item.key]"
                                                 format="yyyy-MM-dd HH:mm" @on-change="change_time(item.key)"
                                                 :options="datetime_options"
                                                 placeholder="选择日期和时间" style="width: 300px"></Date-picker>
                                </div>

                            </div>
                        </div>
                    </div>
                    <div class="screeningButton">
                        <i-button type="primary" @click.stop="search_ok">确认筛选</i-button>
                        <i-button @click.stop="search_cancel">取消</i-button>
                    </div>
                </i-col>
            </Row>
        </div>
        <div class="numberReset">
            <span>{{filter_num + ' '}}项筛选</span>
            <a href="javascript:void(0);" @click.stop="clear_search">清空</a>
        </div>
    </div>
</template>
<script type="text/javascript">
    Vue.component('new-filter-component', {
        template: '#newFilterComponent',
        props: ['search', 'placeholder'],
        data: function () {
            return {
                show_panel_key: false,//筛选框show
                show_history_key: false,//搜索历史
                screeing_width: 850,

                filter_num: 0,//选择项数，默认0
                show_env_tree: true,
                env_tree_data: [],//环境树数据

                //外部数据
                right_list: [],//右侧选项
                search_data: {
                    key: '',//输入框value
                    env_no: [],//选中的环境编号
                    param: {}//右侧选择的参数
                },
                search_history: [],//搜索历史
                datetime_options: {
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
                }
            }
        },
        methods: {
            init: function (search_data, getList) {
                var _this = this;
                // console.log(search_data);
                search_data = _.defaults(search_data, {
                    right_list: [],

                    key: '',
                    env_no: [],
                    param: {},

                    history: [],
                    save_history_func: function () {
                    },

                    show_env_tree: true,
                });
                // var right_row = {
                //     type: 'status/type_all',
                //     key: 'status',
                //     name: '状态',
                //     data: data
                // };
                _this.right_list = search_data.right_list;

                _.each(_this.right_list, function (row) {
                    if (!search_data.param[row.key]) {
                        search_data.param[row.key] = [];
                    }
                });
                _this.search_data = {
                    key: search_data.key,
                    env_no: search_data.env_no,
                    param: search_data.param
                };
                _this.search_history = search_data.history;

                _this.save_history_func = search_data.save_history_func;
                _this.show_env_tree = search_data.show_env_tree;
                if (!_this.show_env_tree) {
                    _this.screeing_width = 640;
                }

                _this.get_env_tree();//获取环境树数据
                _this.filter_num_count();//计算筛选项
                getList && getList();
            },
            screening: function () {
                this.show_panel_key = !this.show_panel_key;
            },
            show_history: function () {
                if (this.search_history.length) {
                    this.show_history_key = true;
                }
            },
            hide_history: function () {
                var _this = this;
                setTimeout(function () {
                    _this.show_history_key = false;
                }, 0);
            },
            select_history: function (text) {
                this.search_data.key = text;
                this.search_ok();
            },
            esc_history: function (e) {
                var target = e.srcElement || e.target;
                target && target.blur();
                this.hide_history();
            },
            clear_history: function () {
                var _this = this;
                _this.search_history = [];
                _this.save_history_func && _this.save_history_func([]);
                console.log(JSON.stringify(_this.search_history));
                _this.show_history_key = false;
            },
            get_env_tree: function () {//获取环境树数据
                var _this = this;
                if (!_this.show_env_tree) {
                    return;
                }
                $.get(API('/base/envs/tree/?inc_self=1'), function (data) {
                    _this.env_tree_data = makeTree(data);
                });

                //生成环境树方法
                function makeTree(data) {
                    var result = [];
                    _.each(data, function (item, index) {
                        var node = {
                            title: item.name,
                            children: [],
                            env_no: item.env_no,
                            type: item.type,
                            expand: false
                        };
                        if (item.type === '楼栋' || item.type === '楼层') {
                            node.expand = true;
                        }
                        if (item.children && item.children.length !== 0) {
                            node.children = makeTree(item.children);
                        }
                        if (_.contains(_this.search_data.env_no, node.env_no)) {
                            node.checked = true;
                        }
                        result.push(node);
                    });

                    return result;
                }
            },
            check_env_no: function (e) {
                var _this = this;
                var _env_no = [];
                _.each(_this.$refs.tree.getCheckedNodes(), function (elem) {
                    _env_no.push(elem.env_no);
                });
                _this.search_data.env_no = _env_no;
                this.filter_num_count();
            },
            tag_active: function (key, val) {
                var _this = this;
                if (!_this.search_data.param[key]) {
                    _this.search_data.param[key] = [];
                }
                var _active = _.contains(_this.search_data.param[key], val);
                // console.log('tag_active', _active, _this.search_data.param[key], val);
                return _active;
            },
            tag_all_active: function (key, rows) {
                var _this = this;
                var all_val = _.pluck(rows, 'name');
                //计算差值，取得哪些没有选
                var _active = !_.difference(all_val, _this.search_data.param[key]).length;
                // console.log('tag_all_active', _active, _this.search_data.param[key], all_val);
                return _active;
            },
            tag_click: function (key, e, val) {//点击标签
                var _this = this;
                var _active = _.contains(_this.search_data.param[key], val);
                if (!_active) {
                    _this.search_data.param[key].push(val);
                    //$(e.srcElement).addClass('tagActive');
                } else {
                    _this.search_data.param[key] = _.without(_this.search_data.param[key], val);
                    //$(e.srcElement).removeClass('tagActive');
                }
                console.log('tag_click', e, _active, val, _this.search_data.param[key]);
                this.filter_num_count();
                _this.search_data.param = _.extend({}, _this.search_data.param);
            },
            tag_all_click: function (key, e, rows) {//点击所有标签
                var _this = this;
                var all_val = _.pluck(rows, 'name');
                if (!$(e.srcElement).hasClass('tagActive')) {
                    _this.search_data.param[key] = _.union(_this.search_data.param[key], all_val);
                } else {
                    _this.search_data.param[key] = _.difference(_this.search_data.param[key], all_val);
                }
                this.filter_num_count();
            },
            search_ok: function (e) {//确定
                var _this = this;
                if (e) {
                    var target = e.srcElement || e.target;
                    target && target.blur();
                }
                var _env_no = [];
                _.each(_this.$refs.tree.getCheckedNodes(), function (elem) {
                    _env_no.push(elem.env_no);
                });
                _this.search_data.env_no = _env_no;

                if (_this.search_data.key) {
                    if (!_.contains(_this.search_history, _this.search_data.key)) {
                        _this.search_history.unshift(_this.search_data.key);
                        //如果当前查询建议个数是9个,删除最早的一项
                        if (this.search_history.length >= 9) {
                            this.search_history.pop();
                        }
                    }
                    _this.save_history_func && _this.save_history_func(this.search_history);
                }
                _this.filter_num_count();//计算筛选项
                _this.show_panel_key = false;//关闭screen
                var search_data = _.extend({}, _this.search_data);
                // console.log(search_data);
                _.each(_this.right_list, function (row) {
                    if (row.type === 'datetimerange') {
                        var time = search_data.param[row.key];
                        if (time[0]) {
                            search_data.param[row.key][0] = parseInt(new Date(time[0]).getTime() / 1000);
                        }
                        if (time[1]) {
                            search_data.param[row.key][1] = parseInt(new Date(time[1]).getTime() / 1000);
                        }
                    }
                });

                _this.search(search_data);
            },
            search_cancel: function () {
                this.show_panel_key = false;
            },
            get_tag_length: function (rows) {
                var size = 0;
                _.each(rows, function (row) {
                    size += row.count;
                });
                return size;
            },
            filter_num_count: function () {
                var _this = this;
                var num = _this.search_data.env_no.length;
                _.each(_this.search_data.param, function (val, key) {
                    num += _.size(val);
                });
                this.filter_num = num;
            },
            clear_search: function () {
                var _this = this;
                _this.search_data.key = "";
                _this.search_data.env_no = [];
                _.each(_this.search_data.param, function (row, key) {
                    _this.search_data.param[key] = [];
                });

                _this.get_env_tree();
                this.filter_num = 0;
                var search_data=_.extend({},_this.search_data);
                _this.search(search_data);
            },
            change_time: function (key) {
                var _this = this;
                var val = _this.search_data.param[key];
                console.log(key, val);
                var start_date = new Date(val[0]);
                var end_date = new Date(val[1]);

                if (!(end_date.getHours() + end_date.getMinutes() + end_date.getSeconds())) {
                    _this.search_data.param[key].$set(0, start_date.getTime());
                    _this.search_data.param[key].$set(1, end_date.setHours(23, 59, 59));
                }
                console.log(_this.search_data.param[key]);
            }
        },
        events: {
            hideOverlay: function () {
                if (this.show_panel_key) {
                    this.show_panel_key = false;
                }
                if(this.show_history_key){
                    this.show_history_key = false;
                }

            }
        }
    });

</script>