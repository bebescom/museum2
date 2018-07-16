<style>
    .show_table{
        width: 100%;
        background-color: #FFFFFF;
        border-collapse:collapse;
    }
    .show_table thead tr td{
        line-height: 20px;
        background-color:#f5f7f9;
        font-weight: bold;
    }
    .show_table tr{
        background-color: #FFFFFF;
    }
    .show_table tr td{
        text-align: left;
        background-color: #FFFFFF;
        border:1px solid #e3e8ee;
        padding-left: 10px;
        color: #000000;
    }
    .info-right .ivu-tabs{
        overflow: inherit;
    }
    .info-right .ivu-tooltip-inner{
        padding: 12px;
    }
</style>

<template id="monitorCurve">
    <div class="monitorCurve" style="min-height: 500px;">
        <Row class="monitor_param">
            <i-col span="2">
                环境参数:
            </i-col>
            <i-col span="19">
                <span class="curve-param"
                      :class="[params_arr_selected.indexOf(item.key) === -1 ? '' : 'active']"
                      @click.stop="select_param(item.key)"
                      v-for="item in params_arr_zh">{{item.name}}
                    <Icon v-show="params_arr_selected.indexOf(item.key) !== -1" type="checkmark-round"></Icon>
                </span>
                &nbsp;
            </i-col>
            <i-col span="3" v-show="params_arr_zh.length">
                <div style="float: right">
                    <custom-yaxis :params_arr_zh="params_arr_zh" :echart_init="echart_init"></custom-yaxis>
                </div>


            </i-col>
        </Row>
        <div style="width: 100%;background: rgb(248, 248, 248);margin:auto;" class="content-charts">
            <div style="width: 100%;position: relative;" class="monitorCurve-charts"
                 id="monitorCurve-charts">

            </div>
        </div>

        <Card dis-hover class="equip_threshold">
            <i-table size="small" :columns="equip_threshold_columns" :data="equip_threshold_data"></i-table>
        </Card>

        <div class="noData" style="position:absolute;top: 35%;left: 48%;" v-show="!curves_data.length">
            暂无数据
        </div>
        <Spin fix v-show="loading_show">
            <Icon type="load-c" size=18 class="demo-spin-icon-load"></Icon>
            <div>加载中...</div>
        </Spin>
    </div>
</template>

__inline(/common/components/custom_yaxis.vue)

<script type="text/javascript">
    Vue.component('monitor-curve', {
        template: '#monitorCurve',
        props: [],
        data: function () {
            return {
                equip: {},
                params_arr_zh: [],//中文参数数组
                params_arr_selected: [],//已选择参数数组
                curves_data: [],//曲线数据数组
                loading_show: false,

                equip_threshold_columns: this.get_equip_threshold_columns(),
                equip_threshold_data: [],//设备阈值数据
                qcm_self:this,
                qcm_details:this.qcm_data()

            }
        },
        methods: {
            init: function (equip, stampTime) {
                var _this = this;
                var chart_height = ($('.body').height() - 100 - 50 - Math.round(_.size(equip.new_data) / 2) * 40);
                if (chart_height < 300) {
                    chart_height = 300;
                }
                console.log(Math.round(_.size(equip.new_data) / 2) * 40);
                $('#monitorCurve-charts').height(chart_height);

                _this.equip = equip;
                _this.loading_show = true;
                $.get(API('/env/equipments/param_lines/' + equip.equip_no + '/' + stampTime.join(',')), function (data) {
                    if (!data || data.error) {
                        _this.$Message.error('加载曲线错误');
                        _this.loading_show = false;
                        return;
                    }
                    if (!_.size(data)) {
                        $('#monitorCurve-charts').empty();
                        _this.curves_data = [];
                        _this.loading_show = false;
                        return;
                    }

                    _this.line_init(data);
                    _this.loading_show = false;
                }).error(function () {
                    _this.loading_show = false;
                    _this.$Message.error('加载曲线错误');
                });

                //获取设备阈值
                $.get(API('/env/equipments/detail/statistic'), {
                    equip_no: equip.equip_no,
                    time: stampTime.join(',')
                }, function (data) {
                    if (!data || data.error) {
                        _this.$Message.error('加载曲线错误');
                        return;
                    }
                    _this.get_equip_threshold(data);
                });

            },
            line_init: function (data) {
                var _this = this;

                var params_arr_zh = [], curves_data = [];

                _.each(data, function (val, key) {
                    var _obj = window.get_param_unit_name(key);
                    if (!_obj || _.contains(['voltage', 'rssi'], key)) {
                        return;
                    }
                    params_arr_zh.push(_obj);
                    var data_val = [];
                    _.each(val.value, function (v) {
                        data_val = _.union(data_val, v);
                    });
                    curves_data.push(_.extend(_obj, {val: data_val}));
                });
                console.log(curves_data);
                _this.params_arr_zh = params_arr_zh;
                if (!_this.params_arr_selected.length) {
                    var first_param = _.first(params_arr_zh);
                    _this.params_arr_selected.push(first_param.key);
                }
                _this.curves_data = curves_data;
                _this.echart_init();

            },
            select_param: function (key) {
                var _this = this;
                if (_this.params_arr_selected.indexOf(key) === -1) {
                    _this.params_arr_selected.push(key);
                } else {
                    if (_this.params_arr_selected.length === 1) {
                        _this.$Message.info('请至少选择一个参数');
                        return;
                    }
                    _this.params_arr_selected = _.without(_this.params_arr_selected, key);
                }
                console.log(_this.params_arr_selected);
                _this.echart_init();
            },
            echart_init: function () {
                var _this = this;
                var my_chart = echarts.init(document.getElementById('monitorCurve-charts'));

                $('#monitorCurve-charts').width($('.info-right').width() - 32);

                var yaxisValue = [], seriesValue = [];

                var params_color = {
                    temperature: {color: '#3db38c'},
                    humidity: {color: '#2756FF'},
                    voc: {color: '#ae9a2e'},
                    co2: {color: '#99351f'},
                    light: {color: '#ff9000'},
                    lighting: {color: '#f48902'},
                    so2: {color: '#89203f'},
                    uv: {color: '#ff5fdb'},
                    organic: {color: '#677c0e'},
                    inorganic: {color: '#94b046'},
                    sulfur: {color: '#b6bf8e'},
                    soil_humidity: {color: '#b24d08'},
                    soil_temperature: {color: '#b5733c'},
                    soil_conductivity: {color: '#8c6239'},
                    broken: {color: '#ed1e79'},
                    vibration: {color: '#6c3cd9'},

                    multi_wave: {color: '#a415ff'},
                    cascophen: {color: '#087D8C'},
                    soil_salt: {color: '#8C612B'},
                    oxygen: {color: '#a415ff'},
                    o3: {color: '#a415ff'},
                    no2: {color: '#a415ff'},
                };
                var colors = [], index = 0;
                _.each(_this.curves_data, function (param) {
                    var _obj = window.get_param_unit_name(param.key);
                    //console.log(_obj);
                    if (_this.params_arr_selected.indexOf(param.key) === -1) {
                        return;
                    }
                    var color = params_color[param.key] ? params_color[param.key].color : '';
                    colors.push(color);
                    yaxisValue[index] = {
                        boundaryGap: [0, '50%'],
                        axisLine: {
                            lineStyle: {
                                color: color
                            }
                        },
                        type: 'value',
                        min: _obj.min || function (value) {
                            return value.min - 20;
                        },
                        max: _obj.max || function (value) {
                            return value.max - 20;
                        },
                        name: param.name,
                        position: index % 2 === 0 ? 'left' : 'right',
                        offset: index === 0 || index === 1 ? 0 : (index % 2 === 0 ? index / 2 * 70 : ((index - 1) / 2) * 70),
                        splitNumber: 10,
                        splitLine: {
                            show: false,        // 默认显示，属性show控制显示与否
                        }
                    };
                    seriesValue[index] = {
                        showSymbol: false,
                        name: param.key,
                        type: 'line',
                        // step: 'middle',
                        data: param.val,
                        yAxisIndex: index,
                        smooth: true
                    };
                    index++;
                });

                var option = {
                    title: {
                        show: false
                    },
                    tooltip: {
                        trigger: 'axis',
                        formatter: function (params) {
                            var str = '';
                            for (var i = 0; i < params.length; i++) {
                                var param = window.get_param_unit_name(params[i].seriesName);
                                if (params[i] && params[i].value) {
                                    var date = new Date(params[i].value[0]);
                                    str += date.getFullYear() + '-'
                                        + (date.getMonth() + 1) + '-'
                                        + date.getDate() + ' '
                                        + date.getHours() + ':'
                                        + date.getMinutes();
                                    str += '<br/>'
                                        + '<span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:' + (params[i].color || '') + '"></span>'
                                        + param.name + ':' + params[i].value[1] + param.unit + '</br>';
                                }
                            }
                            return str;
                        }
                    },
                    color: colors,
                    legend: {
                        data: _this.params_arr_zh,
                        show: false
                    },
                    grid: {
                        show: false,
                        left: '4%',
                        right: '4%',
                        bottom: 40,
                        top: 40,
                        containLabel: true
                    },
                    xAxis: {
                        show: true,
                        boundaryGap: false,
                        type: 'time',
                        axisLabel: {
                            textStyle: {
                                color: "#9fa6ac",
                                fontFamily: "微软雅黑"
                            }
                        },
                        splitLine: {
                            show: false,        // 默认显示，属性show控制显示与否
                        },
                        bottom: '40',
                        splitNumber: 15
                    },
                    dataZoom: [
                        {
                            show: true,
                            realtime: true,
                            xAxisIndex: [0],
                            bottom: '5px'
                        },
                        {
                            type: 'inside',
                            realtime: true,
                            xAxisIndex: [0],
                        }
                    ],
                    yAxis: yaxisValue,
                    series: seriesValue
                };
                // console.log(option);
                my_chart.setOption(option);
            },
            get_equip_threshold_columns: function () {
                var qcm_html=this.qcm_data();
                return [
                    {
                        title: '所属环境阈值',
                        key: 'threshold',
                        align: 'center',
                        render: function (row, column, index) {
                            var table_code='<div style="text-align: left">' + row.name + '(' + row.unit + ')</div>' + row.threshold;
                            if(row.qcm){
                                console.log(row.qcm)
                                table_code='<div style="text-align: left;position: absolute;vertical-align: middle">' + row.name+'(' + row.unit + ')&nbsp;&nbsp;<Tooltip  placement="top" ><Icon type="help-circled" size=18></Icon><div slot="content"><p style="padding-bottom: 10px;">根据Sauerbrey方程：∆f = −2.26 × 10<sup>-13</sup>f<sup>2</sup> ∆m/A</p><p style="padding-bottom: 10px">式中f为晶体的固有谐振频率，又叫做基频率（Hz），本设备f=9000000Hz，m为晶体表<br/>面涂层质量（mg），∆f为晶体谐振频率的变化量，A为涂层面积（m²）。</p>'+qcm_html+'</div></Poptip></div>' +'<div style="padding-top: 25px">'+ row.threshold+'</div>';
                            }
                            return table_code;
                        }
                    },
                    {
                        title: '实际值',
                        key: 'extremum',
                        align: 'center',
                        render: function (row, column, index) {
                            return '<br/>' + row.extremum;
                        }
                    },
                    {
                        title: '达标率',
                        key: 'standard_reach',
                        align: 'center',
                        render: function (row, column, index) {
                            return '<br/>' + row.standard_reach;
                        }
                    },
                    {
                        title: '所属环境阈值',
                        key: 'threshold2',
                        align: 'center',
                        render: function (row, column, index) {
                            return row.name2 ? '<div style="text-align: left;position: absolute;vertical-align: middle;">' + row.name2 + '(' + row.unit2 + ')</div>' + '<div style="padding-top: 25px">'+row.threshold2+'</div>' : '';
                        }
                    },
                    {
                        title: '实际值',
                        key: 'extremum2',
                        align: 'center',
                        render: function (row, column, index) {
                            return '<br/>' + (row.extremum2 !== undefined ? row.extremum2 : '');
                        }
                    },
                    {
                        title: '达标率',
                        key: 'standard_reach2',
                        align: 'center',
                        render: function (row, column, index) {
                            return '<br/>' + (row.standard_reach2 !== undefined ? row.standard_reach2 : '');
                        }
                    }
                ];
            },
            get_equip_threshold: function (data) {
                var _this = this;
                var equip_threshold_data = [];
                var index = 0, row;
                _.each(data, function (row, key) {
                    if(data.qcm_organic){
                        data.qcm_inorganic.qcm=true;
                    }

                    if (index % 2 === 0) {
                        equip_threshold_data.push(row);
                    } else {
                        var length = equip_threshold_data.length;
                        equip_threshold_data[length - 1].key2 = row.key;
                        equip_threshold_data[length - 1].name2 = row.name;
                        equip_threshold_data[length - 1].unit2 = row.unit;
                        equip_threshold_data[length - 1].extremum2 = row.extremum;
                        equip_threshold_data[length - 1].standard_reach2 = row.standard_reach;
                        equip_threshold_data[length - 1].threshold2 = row.threshold;
                    }

                    index++;
                });
                _this.equip_threshold_data = equip_threshold_data;
            },
            custom_yaxis: function () {

            },
            qcm_data:function () {
                // debugger
                // return {
                //     tableKey: [
                //         {
                //             title: '无机污染物级别',
                //             key: 'level',
                //             render: function (row, column, index) {
                //                 return 'aaaaa'
                //             }
                //         },
                //         {
                //             title: '铜反应累计当量(30d),mg/m2',
                //             key: 'equivalent',
                //             render: function (row, column, index) {
                //                 return 'aaaaa'
                //             }
                //         },
                //         {
                //             title: '对应频率变化(30d),Hz',
                //             key: 'hertz',
                //             render: function (row, column, index) {
                //                 return 'aaaaa'
                //             }
                //         }
                //     ],
                //     tableValue: [
                //         {
                //             level: 'C1 非常洁净',
                //             equivalent: '< 1.5',
                //             hertz: '< 27'
                //         },
                //         {
                //             level: 'C2 洁净',
                //             equivalent: '< 3.5',
                //             hertz: '< 64'
                //         },
                //         {
                //             level: 'C3 清洁',
                //             equivalent: '< 7.5',
                //             hertz: '< 137'
                //         },
                //         {
                //             level: 'C4 轻度污染',
                //             equivalent: '< 15',
                //             hertz: '< 275'
                //         },
                //         {
                //             level: 'C5 污染',
                //             equivalent: '≥ 3.5',
                //             hertz: '≥ 275'
                //         }
                //     ]
                // }
                return  '<table class="show_table" border="0" cellspacing="0" cellpadding="0" ><thead><tr><td>无机污染物级别</td><td style="width: 40%;">铜反应累计当量(30d),mg/m2</td><td>对应频率变化(30d),Hz</td></tr></thead><tbody><tr><td>C1 非常洁净</td><td>< 1.5</td><td>< 64</td></tr>'+'<tr><td>C2 洁净</td><td>< 3.5</td><td>< 64</td></tr>'+'<tr><td>C3 清洁</td><td>< 7.5</td><td>< 137</td></tr>'+'<tr><td>C4 轻度污染</td><td>< 15</td><td>< 275</td></tr>'+'<tr><td>C5 污染</td><td>≥ 3.5</td><td>≥ 275</td></tr></tbody></table>'
            }
        }
    });
</script>

