var nameArr1 = ['最小值', '最大值', '平均值'],			//取名字，无关数据顺序
    typeImg = ['pin', 'arrow'],
    lineType = ['solid', 'dashed', 'dotted']; //线型对象

var param_unit_name = window.web_config.param_unit_name.sensor;

//日期时间补0方法:例如9点过4分 => 09:04
var addZero = function (val) {
    if (val < 10) {
        return '0' + val;
    } else {
        return val;
    }
};

var getDateTime = function (data) {
    var date,
        dateStr = '';
    //取MIN或MAX字段中的时间戳,data[0]
    if (data && data.min && data.min.data) {
        date = new Date(data.min.data[0]);
        dateStr += date.getFullYear() + '-' + addZero(date.getMonth() + 1) + '-' + addZero(date.getDate()) + ' ' + addZero(date.getHours()) + ':' + addZero(date.getMinutes());

    }else{
        date = new Date(data.data.data[0]);
        dateStr += date.getFullYear() + '-' + addZero(date.getMonth() + 1) + '-' + addZero(date.getDate()) + ' ' + addZero(date.getHours()) + ':' + addZero(date.getMinutes());
    }
    return '(' + dateStr + ')';
};

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

var type_List = {
    "threshold": "阈值",
    "extremum": "极值",
    "average": "平均值",
    "standard_reach": "达标率",
    "cv": "离散系数",
    "max_fluctuate": "最大日波动",
    "avg_fluctuate": "平均日波动",
    "diff": "极差"
};

var is_hasYz = true;

module.exports = {
    template: '#environment_curve',
    props: ['envs', 'time', 'shadowKey', 'env_name', 'in_detail_b','has_envs'],				//envs为环境 ,  time是时间,shadowKey为阴影框是否显示的判断,
    data: function () {
        return {
            $content: null,
            $body: null,
            $shadow: null,
            $filter_content: null,
            $filter_box: null,
            filter_Arr: null,
            echarts__: null,				//echarts
            param: [],					//环境参数
            index: 0,					//作为判断echarts图ajax返回数据的标识
            index1: 0,					//作为判断右侧特征值ajax返回数据的标识
            echarts_data: {},			//echarts数据
            save_param: [],				//保存选择的环境参数
            data_eigenvalue_sort: {},
            showDiyModal: false, //自定义Y轴模态框,是否显示,默认不显示
            yAreaData: {},//Y轴参数数据集
            yAxisDefault:{},//Y轴范围默认值
            yAreaDataCopy: {},//原始Y轴参数数据集备份
            alertTime: '',
            rangePoliceN: null,
            rangePoliceX: null,
            paramName: null,
            isInPolice: true,
            // locked: true,//环境阈值设置是否上锁标志位,弃用
            envCollapse: true,//环境阈值设置菜单是否收起标志位
            envThresholdData: {},//阈值数据
            copyData: {},//存放阈值数据初始值副本
            inEdit: {},//标志位对象,存储当前环境阈值是否在编辑状态
            thresholdValidate: {},//阈值验证对象,要求全部是数字,并且不能为空
            thresholdErrorMsg: {},
            thresholdIndex: 0, //环境阈值请求index
            yAreaValidate: {},//自定义Y轴验证规则,要求全部是数字,并且不能为空
            errorMsg: {},
            yAreaValidateCopy: {},
            errorMsgCopy: {},
            switchBtn: false, //切换按钮是否显示
            switchCurr: 'img',
            tableHead: [], //存放表头元素
            cnUnit: {}, //存放表头单位
            maxValue: '',
            minValue: '',
            judgeBackArr: [],
            envType:[]
        }
    },
    computed: {
        envsArr: function () {							//envs转数组
            var envs_arr='';
            if(this.envs!=''&&this.envs!=null&&this.envs!=undefined){
                envs_arr=this.envs.split(',');
                return envs_arr;
            }
            if(envs_arr!=''&&envs_arr!=null&&envs_arr!=undefined){
                return envs_arr;
            }else{
                return [];
            }
        },
        envs_data: function () {						//环境编号--环境名关联
            var This = this, obj = {};
            this.envsArr.forEach(function (con, i) {
                obj[con] = This.env_name[i];
            });
            return obj;
        },
        cardTableWidth: function () {
            if (this.save_param && this.save_param.length !== 0) {
                return (20 + this.save_param.length * 80) + '%';
            }
        }
    },
    watch: {
        envs: function (newNum) {
            if (!newNum) {
                this.param = [];
                this.save_param = [];
                this.echarts__.clear();
            }
            // else {
            //     if (this.time) {
            //         this.get_eigenvalue();
            //     }
            // }
        }
    },
    ready: function () {
        var This = this;
        this.$content = $('#content');
        this.$body = this.$content.find('.body');
        this.$filter_content = this.$content.find('.filter_content');
        this.$shadow = this.$content.find('.shadow.coverAll');
        this.filter_Arr = this.$content.find('.filter_box')[0].getElementsByTagName('span');
        this.echarts__ = echarts.init($('.echarts_container')[0]);

        this.resize();

        $(window).resize(function () {
            This.echarts__.resize();
        });
        if (this.in_detail_b) {
            //this.save_delete(this.save_param)
        }
    },
    methods: {
        defaultCheck: function (arr) {
            var me = this,
                obj = {},
                validate = {},
                error = {},
                range;
            // console.log(arr,me.yAxisDefault);
            if (arr && arr.length !== 0) {
                arr.forEach(function (val, index) {
                    // console.log(val);
                    //默认值取最大值+10%,最小值-10%,保留两位小数
                    range = me.yAxisDefault[val].max-me.yAxisDefault[val].min;
                    obj[val] = {
                        status: 'default',
                        min: parseFloat((me.yAxisDefault[val].min-range*0.05).toFixed(2)),
                        max: parseFloat((parseFloat(me.yAxisDefault[val].max)+range*0.05).toFixed(2))
                    };
                    validate[val] = {
                        max: true,
                        min: true
                    };
                    error[val] = {
                        min: '',//最小值错误提示信息
                        max: ''//最大值错误信息
                    }
                })
            }
            me.yAxisDefault = JSON.parse(JSON.stringify(obj));
            me.yAreaData = JSON.parse(JSON.stringify(obj));
            me.yAreaValidate = validate;
            me.errorMsg = error;
        },
        editStyle: function (env_no) {
            if (this.inEdit[env_no]) {
                return 'margin-bottom:18px';
            } else {
                return '';
            }
        },
        thUnit: function (param) {
            return param_unit_name[param].unit;
        },
        switchImgTable: function (curr) {
            this.switchCurr = curr;
            var me = this;
            if (curr === 'img') {
                this.$nextTick(function () {//图标从隐藏到显示,重绘尺寸,正常显示
                    me.echarts__.resize();
                });
            }
        },
        borderStyle: function (index) {
            var str = '';
            if (index === -1) {
                return;
            }
            str = '2px #1bbc9b ' + lineType[index];
            return str;
        },
        submitEdit: function (env_no) {//先对输入验证情况进行判断
            var validate = true;
            _.forEach(this.thresholdValidate[env_no], function (val, index) {
                if (val) {
                    validate = false;
                    return false;
                }
            });
            if (!validate) {
                this.$Message.error('请正确输入阈值范围!');
                return;
            }
            this.inEdit[env_no] = false;
            var me = this,
                postObj = {},
                validateResult = false;//验证功能尚未添加
            _.each(this.envThresholdData[env_no], function (value, key) {
                if (key === 'no' || key === 'type' || key === 'lock') {
                    postObj[key] = value;
                } else if (key != 'temperature_range' && key != 'total_light' && key != 'humidity_range') {
                    postObj[key + '_min'] = value.min;
                    postObj[key + '_max'] = value.max;
                } else {
                    postObj[key] = value.max;
                }
            });
            if (!postObj.no || postObj.no == '') {
                postObj.no = env_no;
            }
            $.post(API('/env/common/threshold/add_edit'), postObj, function (data) {
                    if (data.result) {
                        me.$Message.success('编辑环境阈值成功!');
                        //提交编辑成功后,本地克隆副本需要更新
                        me.copyData = JSON.parse(JSON.stringify(me.envThresholdData));
                        var visualMap = {
                            top: 10,
                            right: 10,
                            pieces: [],
                            outOfRange: {
                                color: 'red'
                            }
                        };
                        if (me.copyData[me.envs][me.save_param[0]] && me.copyData[me.envs][me.save_param[0]]) {
                            if (!me.copyData[me.envs][me.save_param[0]].min && me.copyData[me.envs][me.save_param[0]].max) {
                                visualMap.pieces = [{
                                    gt: parseFloat(me.copyData[me.envs][me.save_param[0]].max),
                                    color: 'red',
                                    label: '非正常范围'
                                }, {
                                    lte: parseFloat(me.copyData[me.envs][me.save_param[0]].max),
                                    color: '#2756FF',
                                    label: '正常范围值'
                                }]
                            } else if (me.copyData[me.envs][me.save_param[0]].min && me.copyData[me.envs][me.save_param[0]].max) {
                                visualMap.pieces = [{
                                    gte: parseFloat(me.copyData[me.envs][me.save_param[0]].max),
                                    color: 'red',
                                    label: '非正常范围'
                                }, {
                                    gte: me.copyData[me.envs][me.save_param[0]].min ? parseFloat(me.copyData[me.envs][me.save_param[0]].min) : 0,
                                    lte: parseFloat(me.copyData[me.envs][me.save_param[0]].max),
                                    color: '#2756FF',
                                    label: '正常范围值'
                                }]
                            } else if (me.copyData[me.envs][me.save_param[0]].min && !me.copyData[me.envs][me.save_param[0]].max) {
                                visualMap.pieces = [{
                                    lt: parseFloat(me.copyData[me.envs][me.save_param[0]].min),
                                    color: 'red',
                                    label: '非正常范围'
                                }, {
                                    gte: me.copyData[me.envs][me.save_param[0]].min ? parseFloat(me.copyData[me.envs][me.save_param[0]].min) : 0,
                                    color: '#2756FF',
                                    label: '正常范围值'
                                }]
                            }
                        }

                        me.echarts__.setOption({
                            visualMap: visualMap
                        });
                        me.init_env_charts();
                    } else {
                        me.envThresholdData = me.copyData;//编辑失败,将信息还原
                        me.$Message.error('编辑环境阈值失败,原因:' + data.msg + '!');
                    }
                })
                .error(function (msg) {
                    me.envThresholdData = me.copyData;//编辑失败,将信息还原
                    me.$Modal.error({
                        title: '错误信息',
                        content: msg.status + ':' + msg.statusText
                    });
                });
        },
        cancelEdit: function (env_no, status) {
            var me = this;
            // this.inEdit[env_no] = false;
            this.envThresholdData[env_no] = this.copyData[env_no];
            this.copyData[env_no] = null;//释放
            this.inEdit[env_no] = false;
            if (!status || status !== 'lock') {
                this.$Message.info('取消编辑环境阈值');
            }
            //阈值错误状态取消,错误提示清空
            if (this.thresholdValidate && this.thresholdValidate[env_no]) {
                _.each(this.thresholdValidate[env_no], function (val, key) {
                    me.thresholdValidate[env_no][key] = false;
                });
            }
            if (this.thresholdErrorMsg && this.thresholdErrorMsg[env_no]) {
                _.each(this.thresholdErrorMsg[env_no], function (val, key) {
                    me.thresholdErrorMsg[env_no][key] = '';
                });
            }
        },
        getEnvThresholdData: function () {
            var me = this;
            me.envThresholdData = {};
            this.thresholdIndex++;
            $.get(API('/env/common/threshold/' + this.envs + '/env'), {index: this.thresholdIndex}, function (data) {
                if (parseFloat(data.index) !== me.thresholdIndex) {
                    return;
                }
                if (!data) {
                    return;
                }
                var thresholdValidate = {}, thresholdErrorMsg = {};
                me.envThresholdData = _.omit(data, 'index');
                _.each(me.envThresholdData, function (thresholdData, env_no) {
                    me.$set('inEdit[' + env_no + ']', false);//响应式追踪,某个环境阈值是否在编辑中
                    thresholdValidate[env_no] = {};
                    thresholdErrorMsg[env_no] = {};
                    // if(!me.thresholdValidate[env_no]){
                    //     me.$set('thresholdValidate['+env_no+']',{});
                    // }
                    // if(!me.thresholdErrorMsg[env_no]){
                    //     me.$set('thresholdErrorMsg['+env_no+']',{});
                    // }
                    if (thresholdData) {
                        _.each(_.omit(thresholdData, 'lock', 'name', 'no'), function (item, param) {
                            if (item && item.max) {
                                thresholdValidate[env_no][param + 'max'] = false;
                                thresholdErrorMsg[env_no][param + 'max'] = '';
                            }
                            if (item && item.min) {
                                thresholdValidate[env_no][param + 'min'] = false;
                                thresholdErrorMsg[env_no][param + 'min'] = '';
                            }
                        });
                    }
                });
                me.thresholdValidate = thresholdValidate;
                me.thresholdErrorMsg = thresholdErrorMsg;
            });
        },
        validateThreshold: function (env_no, param, value, type) {//阈值验证方法
            var reg = new RegExp('^[0-9]+(.[0-9]{1,3})?$'),
                validate = {},
                error = {};
            //输入的正确性
            if (value[type] !== '' && !reg.test(value[type])) {
                validate[param + type] = true;
                error[param + type] = '*必须为数字';
                // this.thresholdValidate[env_no][param+type] = true;
                // this.thresholdErrorMsg[env_no][param+type] = '*必须为数字';
            } else {
                //数值类型正确的前提下,验证数值大小关系的正确性
                if (type === 'min') {
                    if (parseFloat(value.min) >= parseFloat(value.max)) {
                        validate[param + type] = true;
                        error[param + type] = '*最小值错误';
                        // this.thresholdValidate[env_no][param+type] = true;
                        // this.thresholdErrorMsg[env_no][param+type] = '*最小值错误';
                    } else {
                        validate[param + type] = false;
                        error[param + type] = '';
                        validate[param + 'max'] = false;
                        error[param + 'max'] = '';
                        // this.thresholdValidate[env_no][param+type] = false;
                        // this.thresholdErrorMsg[env_no][param+type] = '';
                        // this.thresholdValidate[env_no][param+'max'] = false;
                        // this.thresholdErrorMsg[env_no][param+'max'] = '';
                    }
                } else if (type === 'max' && value.min) {
                    if ((parseFloat(value.max) <= parseFloat(value.min))) {
                        validate[param + type] = true;
                        error[param + type] = '*最大值错误';
                        // this.thresholdValidate[env_no][param+type] = true;
                        // this.thresholdErrorMsg[env_no][param+type] = '*最大值错误';
                    } else {
                        validate[param + type] = false;
                        error[param + type] = '';
                        validate[param + 'min'] = false;
                        error[param + 'min'] = '';
                        // this.thresholdValidate[env_no][param+type] = false;
                        // this.thresholdErrorMsg[env_no][param+type] = '';
                        // this.thresholdValidate[env_no][param+'min'] = false;
                        // this.thresholdErrorMsg[env_no][param+'min'] = '';
                    }
                } else {
                    validate[param + type] = false;
                    error[param + type] = '';
                    // this.thresholdValidate[env_no][param+type] = false;
                    // this.thresholdErrorMsg[env_no][param+type] = '';
                }
            }
            this.thresholdValidate[env_no] = validate;
            this.thresholdErrorMsg[env_no] = error;
        },
        changeLockStatus: function (env_no) {//点击上锁或者开锁事件
            var me = this;
            //发送锁定或解锁请求
            if (this.envThresholdData[env_no].lock == 0) {//当前状态为解锁
                if (this.inEdit[env_no]) {//锁定时正在编辑中
                    //调用cancelEdit方法,对象还原,取消编辑
                    this.cancelEdit(env_no, 'lock');
                }
                this.envThresholdData[env_no].lock = 1;//页面展示效果修改
                $.post(API('/env/common/threshold/lock/' + env_no + '/1'), function (data) {
                        if (data.result) {
                            me.$Message.success('锁定环境阈值');
                        } else {
                            me.$Message.error('锁定环境阈值失败');
                            me.envThresholdData[env_no].lock = '0';//页面展示效果修改
                        }
                    })
                    .error(function (msg) {//请求错误处理
                        This.$Modal.error({
                            title: '错误信息',
                            content: msg.status + ':' + msg.statusText
                        });
                    });
            } else if (this.envThresholdData[env_no].lock == 1) {
                me.envThresholdData[env_no].lock = 0;//页面展示效果修改
                $.post(API('/env/common/threshold/lock/' + env_no + '/0'), function (data) {
                        if (data.result) {
                            me.$Message.success('解锁环境阈值');
                        } else {
                            me.$Message.error('解锁环境阈值失败');
                            me.envThresholdData[env_no].lock = '1';//页面展示效果修改
                        }
                    })
                    .error(function (msg) {//请求错误处理
                        This.$Modal.error({
                            title: '错误信息',
                            content: msg.status + ':' + msg.statusText
                        });
                    });
            }
        },
        editEnvThreshold: function (env_no) {
            if (this.envThresholdData[env_no].lock == 1) {//如果被锁死,则不进行任何操作
                return;
            }
            if (!this.inEdit[env_no]) {
                this.inEdit[env_no] = true;
                // this.inEdit[env_no] = true;
            }
            this.copyData[env_no] = JSON.parse(JSON.stringify(this.envThresholdData[env_no]));
            // console.log('编辑环境阈值',this.copyData);
        },
        // collapseEnvThreshold: function () {
        //     this.envCollapse = !this.envCollapse;
        //     if (this.envCollapse) {//收起时,不可编辑
        //         this.inEdit = false;
        //     }
        // },
        showModal: function () {
            //弹出模态框
            this.showDiyModal = true;
            //拷贝一份Y轴范围对象,验证状态,提示信息,以便用于取消时的数据还原
            this.yAreaDataCopy = JSON.parse(JSON.stringify(this.yAreaData));
            this.yAreaValidateCopy = JSON.parse(JSON.stringify(this.yAreaValidate));
            this.errorMsgCopy = JSON.parse(JSON.stringify(this.errorMsg));
            // console.log(JSON.stringify(this.yAreaDataCopy));
        },
        changeYType: function (key, status) {
            // console.log(status,key);
            if (status === 'self-adaptive') {//如果切换为自适应,将Y轴配置还原
                if (this.yAreaData && this.yAreaData[key]) {//数据还原
                    if (key === 'temperature' || key === 'humidity') {
                        this.yAreaData[key] = {
                            status:status,
                            min:0,
                            max:'auto'
                        }
                    } else {
                        this.yAreaData[key] = {
                            status:status,
                            min:'auto',
                            max:'auto'
                        };
                    }
                    // console.log(this.yAreaData[key]);
                }
                if (this.errorMsg && this.errorMsg[key]) {//提示信息清空
                    this.errorMsg[key].min = '';
                    this.errorMsg[key].max = '';
                }
                if (this.yAreaValidate && this.yAreaValidate[key]) {//状态信息还原为通过
                    this.yAreaValidate[key].min = true;
                    this.yAreaValidate[key].max = true;
                }
            }else if(status === 'default'){
                // console.log(this.yAreaData[key],this.yAxisDefault[key]);
                this.yAxisDefault[key].status = status;
                this.yAreaData[key] = this.yAxisDefault[key];
                if (this.errorMsg && this.errorMsg[key]) {//提示信息清空
                    this.errorMsg[key].min = '';
                    this.errorMsg[key].max = '';
                }
                if (this.yAreaValidate && this.yAreaValidate[key]) {//状态信息还原为通过
                    this.yAreaValidate[key].min = true;
                    this.yAreaValidate[key].max = true;
                }
            }
        },
        validateY: function (key, type, value) {
            var reg = new RegExp('^[0-9]+(.[0-9]{1,3})?$');
            if (value === '') {
                this.yAreaValidate[key][type] = false;
                this.errorMsg[key][type] = '*不能为空';
            } else if (value !== 'auto') {
                if (reg.test(value)) {
                    this.yAreaValidate[key][type] = true;
                    this.errorMsg[key][type] = '';
                } else {
                    this.yAreaValidate[key][type] = false;
                    this.errorMsg[key][type] = '*必须为数字';
                }
            } else {
                this.yAreaValidate[key][type] = true;
                this.errorMsg[key][type] = '';
            }
        },
        changeY: function () {
            var validate = true;
            _.forEach(this.yAreaValidate, function (val, index) {
                if (!val.min || !val.max) {
                    validate = false;
                    return false;
                }
            });
            if (!validate) {
                this.$Message.error('请正确输入Y轴范围!');
                return;
            } else {
                var yAxis = this.echarts__.getOption().yAxis,
                    me = this;
                if (yAxis && yAxis.length !== 0) {
                    yAxis.forEach(function (val, index) {
                        if (me.yAreaData[val.yAxisKey] && me.yAreaData[val.yAxisKey].status === 'user-defined') {
                            val.min = me.yAreaData[val.yAxisKey].min;
                            val.max = me.yAreaData[val.yAxisKey].max;
                        }else if(me.yAreaData[val.yAxisKey] && me.yAreaData[val.yAxisKey].status === 'default'){
                            val.min = me.yAxisDefault[val.yAxisKey].min;
                            val.max = me.yAxisDefault[val.yAxisKey].max;
                        }else {
                            if (val.yAxisKey === 'humidity' || val.yAxisKey === 'temperature') {
                                me.yAreaData[val.yAxisKey].min = 0;
                                val.min = 0;
                            } else {
                                me.yAreaData[val.yAxisKey].min = 'auto';
                                val.min = 'auto';
                            }
                            me.yAreaData[val.yAxisKey].max = 'auto';
                            val.max = 'auto';
                        }
                    });
                }
                me.echarts__.setOption({
                    yAxis: yAxis
                });
                this.showDiyModal = false;
            }
        },
        cancelChangeY: function () {
            this.yAreaData = this.yAreaDataCopy;
            this.errorMsg = this.errorMsgCopy;
            this.yAreaValidate = this.yAreaValidateCopy;
            this.showDiyModal = false;
            // console.log('取消改变Y轴');
            // console.log(JSON.stringify(this.yAreaData));
            // console.log(JSON.stringify(this.yAreaDataCopy));
            // console.log(JSON.stringify(this.yAreaData));
        },
        resize: function () {
            this.$body.css('height', this.$content.height() - 84);
            this.$filter_content.css('height', this.$body.height() - 100);
        },
        init_env_charts: function () {
            var This = this;
            this.index++;
            This.alertTime = sessionStorage.getItem('alertTime');
            This.alertTimeA = sessionStorage.getItem('alert_time')/1000;
            This.rangePoliceN = sessionStorage.getItem('rangePoliceN');
            This.rangePoliceX = sessionStorage.getItem('rangePoliceX');
            This.paramName = sessionStorage.getItem('paramName');
            This.alert_param = sessionStorage.getItem('param');
            if(This.envs==''){//当环境详情没有环境被选中，提示请选择环境
                This.has_envs=true;
            }else{
                This.has_envs=false;
            }
            $.get(API('/env/monitor/line'), {env_no: This.envs, time: this.time, index: this.index,alert_time: This.alertTimeA,alert_param:This.alert_param}, function (data) {
                console.log(data)
                    if (data.index != This.index) {//握手失败
                        return;
                    }
                    _.each(data.no_data,function (name) {
                        This.noData(name+'没有数据');
                    })
                    This.shadowKey = false;
                    This.$shadow.hide();
                    This.index = 0;

                    //从获取的数据中,获取Y轴默认范围
                    if(data.yAxis){
                        This.yAxisDefault = data.yAxis;
                    }

                    This.param = data.param;//获取参数列表
                    This.defaultCheck(This.param);

                    delete data.param;
                    delete data.index;
                    // delete data.yAxis;
                    This.echarts_data = data;
                    setTimeout(function () {
                        if (This.save_param.length === 0) {
                            This.defaultClick();
                        }
                    }, 0);
                    if(This.alert_param){
                        This.save_param.push(This.alert_param);
                    }else{
                        This.save_param = This.save_param.filter(function (con, i) {
                            if (This.param) {
                                if (This.param.indexOf(con) !== -1) {
                                    return true;
                                }
                            }
                        });
                    }

                    _.each(This.echarts_data, function (elem, key) {
                        if(key != 'yAxis'){
                            This.envType[key] = elem['type'];
                        }
                        if (elem[This.save_param[0]] && elem[This.save_param[0]].threshold) {
                            This.drawing_echarts(elem[This.save_param[0]].threshold.max, elem[This.save_param[0]].threshold.min, true);
                        } else {
                            This.drawing_echarts();
                        }
                    });
                })
                .error(function (msg) {
                    This.$Modal.error({
                        title: '错误信息',
                        content: msg.status + ':' + msg.statusText
                    });
                    This.$shadow.hide();
                    if (This.echarts__) {
                        This.echarts__.clear();
                    }
                });
        },
        changeName: function (name) {			//根据英文名换成中文名
            return param_unit_name[name]?param_unit_name[name].name:name;
        },
        changeType: function (name) {			//根据英文名换成中文名
            return type_List[name];
        },
        save_delete: function (name) {			//每次选中与消除参数执行
            var _this = this,
                index = this.save_param.indexOf(name),
                env_no,
                environment_length = this.envsArr.length;//获取环境数量
            if (sessionStorage.getItem('tree_list')) {//获取环境对应的参数
                var len = JSON.parse(sessionStorage.getItem('tree_list')).split(',').length - 1;
                env_no = JSON.parse(sessionStorage.getItem('tree_list')).split(',')[len];
            }
            if (environment_length === 1) {//在环境数量为1,并且当前环境有阈值时设置阈值大小
                if (this.echarts_data && this.echarts_data[env_no] && this.echarts_data[env_no][name] && this.echarts_data[env_no][name].threshold) {
                    if ('max' in this.echarts_data[env_no][name].threshold) {
                        var changeNameMax = parseFloat(this.echarts_data[env_no][name].threshold.max);
                        var changeNameMin = parseFloat(this.echarts_data[env_no][name].threshold.min);
                    }
                }
            }
            if (index !== -1) { //选择的参数在参数数组中,则移除
                this.save_param.splice(index, 1);
            } else if (this.save_param.length >= 3) {
                //如果参数数量为3,弹出最先选择的一项,并将新选择项压入数组
                this.save_param.shift();
                this.save_param.push(name);
            } else {
                this.save_param.push(name);
            }
            if (sessionStorage.getItem('rangePoliceN')) {//判断在什么时候执行哪一种方案，从报警列表方案
                this.isInPolice = true;
                this.drawing_echarts(this.rangePoliceN, this.rangePoliceX);
            } else if (!sessionStorage.getItem('rangePoliceN') && this.isInPolice && this.save_param.length === 1 && environment_length === 1) {//从报警列表和环境列表方案

                if (this.echarts_data && this.echarts_data[env_no] && this.echarts_data[env_no][name]) {
                    if (this.echarts_data[env_no][name].threshold) {
                        var isYz = 'max' in this.echarts_data[env_no][name].threshold;
                        this.drawing_echarts(changeNameMin, changeNameMax, isYz);
                    } else {
                        this.drawing_echarts();
                    }
                }
            } else {//以上两种方案有两个环境的情况
                this.drawing_echarts();
            }
            if (this.time) {
                $('.shadow.tableShadow').show();
                this.get_eigenvalue();
            }
            setTimeout(function () {//第一次加载完曲线的时候删除session
                if (sessionStorage.getItem('rangePoliceN')) {
                    sessionStorage.removeItem('rangePoliceN');
                    sessionStorage.removeItem('rangePoliceX');
                    sessionStorage.removeItem('alertTime');
                    sessionStorage.removeItem('alert_time');
                    sessionStorage.removeItem('param');
                    sessionStorage.removeItem('paramName');
                    _this.isInPolice = true;
                }
            }, 0);
        },
        drawing_echarts: function (changeNameMin, changeNameMax, isYz) {			//绘制echarts
            console.log(this.envsArr.length)
            var environment_length = this.envsArr.length,
                param_length = this.save_param.length,
                This = this;
            if (!environment_length || !param_length) {
                this.echarts__.clear();
                return;
            }
            var option = {
                grid: {}
            };
            var arr = [];
            _.each(this.echarts_data, function (elem, key) {
                if (!elem[This.save_param[0]] || !elem[This.save_param[0]].threshold) {
                    return;
                }
                arr.push(key);
                if (arr.length > 1) {
                    This.maxValue = null;
                    This.minValue = null;
                } else {
                    if (elem[This.save_param[0]].threshold.max == '' && elem[This.save_param[0]].threshold.min == '') {
                        This.maxValue = null;
                        This.minValue = null;
                        return;
                    } else {
                        This.maxValue = parseFloat(elem[This.save_param[0]].threshold.max);
                        This.minValue = parseFloat(elem[This.save_param[0]].threshold.min);
                        if ('max' in elem[This.save_param[0]].threshold && 'min' in elem[This.save_param[0]].threshold) {
                            if (elem[This.save_param[0]].threshold.max === 100 && elem[This.save_param[0]].threshold.min === 0) {//如果返回值为数值最大值100，最小值0
                                This.maxValue = '';
                                This.minValue = '';
                            } else if (!This.maxValue && !This.minValue) {
                                This.maxValue = 0;
                            } else if (!This.maxValue || !This.minValue) {//如果最大值或者最小值为空
                                return;
                            }
                        }
                    }
                }
            });
            //if (environment_length === 1) {
            //    if (sessionStorage.getItem('rangePoliceN') && param_length === 1) {//从报警列表中进入绘制，且只有一个参数,报警
            //        option = echarts_option.one_one_to_two(this.echarts_data, this.save_param, this.envs_data, this.minValue, this.maxValue);
            //    } else if (!sessionStorage.getItem('rangePoliceN') && param_length === 1) {//从环境列表中进入绘制，且只有一个参数,报警
            //        if ((isYz && this.maxValue && this.minValue) || (isYz && this.maxValue) || (isYz && this.minValue) || (isYz && this.maxValue === 0)) {//如果有阈值
            //            option = echarts_option.one_one_to_two(this.echarts_data, this.save_param, this.envs_data, this.minValue, this.maxValue, this.isInPolice);
            //        } else {
            //            option = echarts_option.one_one_to_two(this.echarts_data, this.save_param, this.envs_data);
            //            //如果数据中没有阈值,正常显示曲线
            //            // option=echarts_option.newTypeOption(this.echarts_data,this.save_param,this.envs_data);
            //        }
            //    } else {
            //        option = echarts_option.newTypeOption(this.echarts_data, this.save_param, this.envs_data);
            //    }
            //} else {
            //    //多个环境显示正常曲线
            //    option = echarts_option.newTypeOption(this.echarts_data, this.save_param, this.envs_data);
            //
            //}
            option = echarts_option.newTypeOption(this.echarts_data, this.save_param, this.envs_data);
            //多Y轴初始化
            option.yAxis = initYAxis(this.save_param, this.echarts_data, this.param, this.yAreaData);//默认Y轴范围包括
            // if(option.yAxis.length>=7){//根据Y轴数量,确定图形宽度
            // option.grid.width = '40%';
            // }else if(option.yAxis.length>=5){
            //    option.grid.width = '50%';
            // }else if(option.yAxis.length>=3){
            //    option.grid.width = '60%';
            // }else{
            //    option.grid.width = '70%';
            // }
            // console.log(option);
            // console.log(this.save_param);

            //当选中参数数量为3个时,图形位置右移,为左侧第二根Y轴让位
            if(this.save_param.length===3){
                option.grid.left = '18%';
                option.grid.right= '9%';
            }else{
                option.grid.left = 'center';
                option.grid.right = 'center';
            }
            this.echarts__.setOption(option, true);
            
            // console.log(this.echarts__,'绑定事件');
            // //绘图完成后给实例绑定事件,用户动态加载数据
            // //应该采用一个LEVEL标志位,决定请求数据粒度的档位
            // var level = 1;//数据粒度的档位 1-4; 1档为最大
            // function resetDataZoom(){
            //     // 将标尺重置
            //     This.echarts__.dispatchAction({
            //         type: 'dataZoom',
            //         start: 0,
            //         end: 100
            //     });
            // }
            // this.echarts__.on('dataZoom',function(params){
            //     // console.log(params);
            //     var start,end;
            //     if(params.batch&&params.batch[0]){
            //         start = params.batch[0].start,
            //         end = params.batch[0].end;
            //     }else{
            //         start = params.start,
            //         end = params.end;
            //     }
            //     if(end-start<5){
            //         // console.log('不能再小了');
            //         This.echarts__.dispatchAction({
            //             type: 'dataZoom',
            //             start: start,
            //             end: end
            //         });
            //         return;
            //     }
            //     if(level===1){
            //         if(end-start<20){
            //             level++;
            //             console.log('加档',level);
            //             resetDataZoom();
            //         }
            //     }
            //     else if(level>1&&level<4){
            //         if(end-start<20){
            //             level++;
            //             console.log('加档',level);
            //             resetDataZoom();
            //         }else if(end-start===100){
            //             level--;
            //             console.log('减档',level);
            //             resetDataZoom();
            //         }
            //     }else if(level===4){
            //         if(end-start===100){
            //             level--;
            //             console.log('减档',level);
            //             resetDataZoom();
            //         }
            //     }
            // });

            setTimeout(function () {
                This.echarts__.resize();
                This.switchBtn = true;
            }, 0);
        },
        get_eigenvalue: function () {			//获取特征值
            // console.log('获取特征值');
            var This = this;
            //判断意义不明
            // if (!this.save_param.join()) {
            //     console.log('不期待被执行');
            //     this.data_eigenvalue_sort = {};
            //     return;
            // }
            this.index1++;
            $.get(API('/env/monitor/monitor_statistic'), {
                    env_no: this.envs,
                    time: this.time,
                    param: this.save_param.join(),
                    index: this.index1
                }, function (data) {
                    if (parseFloat(data.index) !== This.index1) {
                        return;
                    }
                    delete data.index;
                    This.index1 = 0;
                    //表格数据初始化
                    This.data_eigenvalue(data);
                })
                .error(function (msg) {
                    This.index1 = 0;
                    console.error(msg);
                });
        },
        data_eigenvalue: function (data) {					//设置特征值
            // console.log(data);
            //处理数据结构
            var tbodyObj = {},
                theadObj = {},
                me = this;
            // save_param ,这个数组保存了选中的参数
            if (data) {
                _.each(data, function (paramData, param) {
                    if (me.save_param.indexOf(param) !== -1) {
                        if (!theadObj[me.changeName(param)]) {
                            theadObj[me.changeName(param)] = [];
                        }
                        if (paramData) {
                            _.each(paramData, function (env_data, env_no) {
                                if (!tbodyObj[env_no]) {
                                    tbodyObj[env_no] = {};
                                }
                                if (env_data) {
                                    _.each(env_data, function (value, type) {
                                        if (!tbodyObj[env_no]['env_name'] && type === 'env_name') {
                                            tbodyObj[env_no]['env_name'] = value;
                                        }
                                        if (type !== 'env_name') {
                                            if (theadObj[me.changeName(param)].indexOf(me.changeType(type)) === -1) {
                                                theadObj[me.changeName(param)].push(me.changeType(type));
                                            }
                                            if (!me.cnUnit[me.changeName(param)]) {
                                                me.cnUnit[me.changeName(param)] = param_unit_name[param].unit;
                                            }
                                            if (!tbodyObj[env_no][me.changeName(param)]) {
                                                tbodyObj[env_no][me.changeName(param)] = {};
                                            }
                                            tbodyObj[env_no][me.changeName(param)][me.changeType(type)] = value;
                                        }
                                    });
                                }
                            });
                        }
                    }
                });
            }
            this.data_eigenvalue_sort = tbodyObj;
            this.tableHead = theadObj;
            $('.shadow.tableShadow').hide();
        },
        defaultClick: function () {
            if (this.paramName) {
                for (var i = 0, len = this.filter_Arr.length; i < len; i++) {
                    if (this.filter_Arr[i].innerText === this.paramName) {
                        this.filter_Arr[i].click();
                    }
                }
            } else if (this.filter_Arr[0] && !this.paramName) {
                this.filter_Arr[0].click();
            }
        },
        noData:function (msg) {
            this.$Notice.config({
                duration:10,
                top:150
            });
            this.$Notice.warning({
                desc:  msg
            });
        }
    },
    events: {
        environment_curve: function () {
            var This = this;
            if (!this.envs) {
                this.switchBtn = false;
                this.switchCurr = 'img';
            }
            this.$shadow.show();
            setTimeout(function () {
                This.init_env_charts();
                This.get_eigenvalue();
                // 页面加载时,获取该环境阈值信息
                This.getEnvThresholdData();
            }, 0);
        },
        changeTimePolice: function (timeArr) {
            if (this.save_param.length === 1) {
                this.save_delete(this.save_param[0]);
            } else {
                return;
            }
            // console.log(this.save_param);
        }
    }
};

function initYAxis(saveParams, echartData, params, yAreaData) {
    // console.log(echartData);
    if(echartData&&echartData.yAxis){
        var yAxisRange = echartData.yAxis;
    }
    // console.log(yAxisRange);
    //yAreaData 自定义Y轴范围
    var yAxis = [];//Y轴配置项
    if (!saveParams || saveParams.length == 0) {
        return;
    }
    // console.log(saveParams);
    saveParams.forEach(function (val, index) {
        // console.log(val,unit[val]);
        yAxis.push({
            type: 'value',
            name: param_unit_name[val].name+'('+ ((val == 'organic' || val == 'inorganic' || val == 'sulfur')?'kHz':param_unit_name[val].unit) +')',
            nameGap: 10,
            nameRotate: 45,
            nameTextStyle: {
                color: '#7E848E'
            },
            axisTick: {
                show: true,
                inside: true
            },
            axisLabel: {
                show: true,
                inside: false,
                formatter: function (value, index) {
                    if (val == 'organic' || val == 'inorganic' || val == 'sulfur') {
                        return (value / 1000).toFixed(2);
                    } else {
                        return value.toFixed(2);
                    }
                },
                textStyle: {
                    color: '#7E848E',
                    fontSize: 10,
                }
            },
            axisLine: {
                show: true,
                onZero: true,
                lineStyle: {
                    color: '#DBDCDE'
                }
            },
            min: yAreaData[val].min||0,
            max: yAreaData[val].max||'auto',
            position: index % 2 == 0 ? 'left' : 'right',
            // scale:val=='humidity'?false:val=='temperature'?false:true,//温湿度参数默认必须包含0点
            offset: index == 0 ? 0 : index == 1 ? 0 : 65 * (Math.floor(index / 2)),
            splitNumber: 5,
            yAxisKey: val
        });
        // console.log(yAxisRange[val].max,yAxisRange[val].min);
    });
    // console.log(yAxis);
    return yAxis;
}

var echarts_option = {
    backgroundColor: '#f8f8f8 ',
    xAxis: {
        show: true,
        type: 'time',
        boundaryGap: false,
        axisLabel: {
            textStyle: {
                color: "#9fa6ac",
                fontFamily: "微软雅黑"
            }
        },
        minInterval: 1,
        axisLine: {
            show: false
        },
        splitLine: {
            show: false
        },
        axisTick: {
            show: false
        },
        splitNumber:15
    },
    grid: {
        bottom: 120,
        left:'center',
        // left: '18%',
        // right: '9%',
        top: 80,
        width: '73%'
    },
    yAxis: {
        type: 'value',
        axisTick: {
            show: false
        },
        axisLabel: {
            show: true,
            inside: false
        },
        min: 'dataMin',
        max: 'dataMax',
        scale: true
    },
    tooltip: {
        trigger: 'axis'
    },
    dataZoom: [
        {
            type: 'slider',
            xAxisIndex: [0],
            bottom: 55
        },
        {
            type: 'inside',
            xAxisIndex: [0]
        }
    ],
    newTypeOption: function (echarts_data, params, envs_data) {
        /*
         echarts_data:对象,环境数据    {环境编号:环境数据对象}
         param:数组,参数序列   控制:长度<=3
         envs_data:对象,环境别名       {环境编号:环境别名字符串}
         */
        // console.log(echarts_data,params,envs_data);
        var tooltip,
            series = [],
            legend = {
                formatter: function (name) {
                    return echarts.format.truncateText(name, 120, '14px Microsoft Yahei', '…');
                },
                tooltip: {
                    show: true
                },
                data: [],
                bottom: 5
            },
            chartData = {};
        if(echarts_data){
            for(var key in echarts_data){
                if(key==='yAxis'){
                    continue;
                }
                chartData[key] = echarts_data[key];
            }
        }
        // console.log(echarts_data, params, envs_data);

        tooltip = {
            trigger: 'axis',
            formatter: function (params) {
                var tooltip = '',
                    reduce = {},//重组数据
                    date;
                if (params) {
                    _.each(params, function (series, index) {
                        if (series.seriesName) {
                            if (!reduce[series.seriesName]) {
                                reduce[series.seriesName] = {
                                    color: series.color
                                };
                            }
                            if (series['data']&&series['data'][2]) {
                                if (!reduce[series.seriesName][series.data[2].param]) {
                                    reduce[series.seriesName][series.data[2].param] = {};
                                }
                                if (series.data[2].type === '最小值') {
                                    reduce[series.seriesName][series.data[2].param].min = series;
                                }
                                if (series.data[2].type === '最大值') {
                                    reduce[series.seriesName][series.data[2].param].max = series;
                                }
                                if (series.data[2].type === '实时值') {
                                    reduce[series.seriesName][series.data[2].param].data = series;
                                }
                            }
                        }
                        // date = new Date(series.value[0]);
                        // tooltip += '<p>'+series.seriesName+'('+ date.getFullYear() + '-' + addZero(date.getMonth()+1) +'-'+ addZero(date.getDate()) + ')'+param_unit_name[series.value[2]].name+':'+series.value[1]+unit[series.value[2]]+'</p>';
                    });
                    _.each(reduce, function (envData, envName) {
                        tooltip += '<p><span style="display:inline-block;width:10px;height:10px;background-color:' + envData.color + '"></span>' + envName + ': ';
                        _.each(_.omit(envData, 'color'), function (data, param) {
                            tooltip += '<br/>' + param_unit_name[param].name + getDateTime(data) + ':';
                            if(data.min && data.max){
                                if (data.min && param !== 'organic' && param !== 'inorganic' && param !== 'sulfur') {
                                    tooltip += data.min.data[1] + '~' + data.max.data[1] + ';';
                                } else {
                                    tooltip += (data.min.data[1] / 1000).toFixed(2) + '~' + (data.max.data[1] / 1000).toFixed(2) + ';';
                                }
                            }else{
                                tooltip += data.data.data[1];
                            }
                        });
                        tooltip += '</p>';
                    });
                }
                return tooltip;
            },
            confine: true,
            textStyle: {
                fontSize: 10
            },
            position: function (point, params, dom, rect, size) {
                //修正弹框位置
                //提示框宽度,高度
                var container = $('.echarts_container'),
                    _WIDTH = $(dom).width(),
                    _HEIGHT = $(dom).height(),
                //容器宽度,高度
                    _CONTAINER_WIDTH = container.width(),
                    _CONTAINER_HEIGHT = container.height(),
                    x = 0, y = 0;
                if (point[0] + _WIDTH + 10 > _CONTAINER_WIDTH) {
                    x = _CONTAINER_WIDTH - _WIDTH - 10;
                } else {
                    x = point[0] + 10;
                }

                if (point[1] + _HEIGHT + 10 > _CONTAINER_HEIGHT) {
                    y = _CONTAINER_HEIGHT - _HEIGHT - 10;
                } else {
                    y = point[1] + 10;
                }
                //因提示框高度未知,将提示框固定在顶部
                return [x, y];
            }
        };
        // console.log(chartData);
        if (params && params.length) {
            _.each(params, function (param, index) {
                _.each(chartData, function (data, env_no) {
                    if (data && data[param]) {//如果环境下存在该参数,绘制曲线,仅绘制最小值和最大值
                        // console.log(param, data[param]);
                        //对原始数据进行处理,加入额外传递参数
                        if (data[param].min || data[param].max) {
                            _.each(data[param].min, function (val, index) {
                                if (val[2]) {
                                    return false;
                                }
                                val.push({
                                    param: param,
                                    type: '最小值',
                                    name: data[param].name,
                                    unit: data[param].unit
                                })
                            });

                            _.each(data[param].max, function (val, index) {
                                if (val[2]) {
                                    return false;
                                }
                                val.push({
                                    param: param,
                                    type: '最大值',
                                    name: data[param].name,
                                    unit: data[param].unit
                                })
                            });
                        }else{
                            _.each(data[param], function (line_data, equip_no) {
                                if(equip_no != "alert_point"&&equip_no != "threshold") {
                                    _.each(line_data, function (val, index) {
                                        if (val[2]) {
                                            return false;
                                        }
                                        val.push({
                                            param: param,
                                            type: '实时值',
                                            name: data[param].name,
                                            unit: data[param].unit
                                        })
                                    });
                                }
                            });
                        }

                        if(data['type']&&(data['type'] ==  "micro"||data['type'] ==  "equip")){
                            if(data[param]){
                                _.each(data[param], function (val,equip_no) {
                                    if(equip_no != "alert_point"&&equip_no != "threshold"){
                                        var legend_name = data.name;
                                        if(data['type'] ==  "micro"){
                                            legend_name = data.name+"-"+equip_no.substr(-4);
                                        }
                                        legend.data.push(legend_name);
                                        series.push({
                                            type: 'line',
                                            name: legend_name,
                                            showSymbol: false,
                                            lineStyle: {
                                                normal: {
                                                    type: lineType[index],
                                                    width: 2
                                                }
                                            },
                                            data: val,
                                            yAxisIndex: index,
                                            smooth: true,
                                            symbolSize: 5
                                        });
                                    }
                                })
                            }
                        }else{
                            legend.data.push(data.name);
                            series.push({
                                type: 'line',
                                name: data.name,
                                showSymbol: false,
                                lineStyle: {
                                    normal: {
                                        type: lineType[index],
                                        width: 2
                                    }
                                },
                                data: data[param].min,
                                yAxisIndex: index,
                                smooth: true,
                                symbolSize: 5
                            });
                            series.push({
                                type: 'line',
                                name: data.name,
                                showSymbol: false,
                                lineStyle: {
                                    normal: {
                                        type: lineType[index],
                                        width: 2
                                    }
                                },
                                data: data[param].max,
                                yAxisIndex: index,
                                smooth: true,
                                symbolSize: 5
                            });
                        }
                    }
                });
            })
        }
        return {
            backgroundColor: this.backgroundColor,
            color:['#cc3500','#0cd5ee','#ffd800','#00d851', '#077746', '#ff9000' ,'#003430', '#5418b8' ,'#333333','#0072bf'],
            grid: this.grid,
            dataZoom: this.dataZoom,
            xAxis: this.xAxis,
            yAxis: this.yAxis,
            tooltip: tooltip,
            series: series,
            legend: legend
        };
    },
    one_one_to_two: function (echarts_data, param, envs_data, n, x, isInPolice) {			//一个环境2个参数以下,
        // console.log(n,x);
        var series = [], keyUnit = [];
        var alert_time = parseInt(sessionStorage.getItem('alert_time'));
        var alert_value = JSON.stringify(sessionStorage.getItem('alert_value'));
        alert_value = JSON.parse(alert_value);
        var echarts_data_copy = JSON.parse(JSON.stringify(echarts_data));//拷贝整个数据对象
        var tooltip = JSON.parse(JSON.stringify(this.tooltip));//轴向触发tooltip对象
        var min = parseFloat(n);
        var max = parseFloat(x);
        var visualMap, markPoint;

        if (sessionStorage.getItem('rangePoliceN') || isInPolice) {
            visualMap = {
                top: 10,
                right: 10,
                pieces: [],
                outOfRange: {
                    color: 'red'
                }
            };
            if (!min && max) {
                visualMap.pieces = [{
                    gte: max,
                    color: 'red',
                    label: '非正常范围'
                }, {
                    lt: max,
                    color: '#2756FF',
                    label: '正常范围值'
                }]
            } else if (min && max) {
                visualMap.pieces = [{
                    gt:max,
                    color: 'red',
                    label: '非正常范围'
                },{
                    gte: min ? min : 0,
                    lte: max,
                    color: '#2756FF',
                    label: '正常范围值'
                }]
            } else if (min && !max) {
                visualMap.pieces = [{
                    lt: min,
                    color: 'red',
                    label: '非正常范围'
                }, {
                    gte: min ? min : 0,
                    color: '#2756FF',
                    label: '正常范围值'
                }]
            } else if (max === 0) {
                visualMap.pieces = [{
                    gt: 0,
                    color: 'red',
                    label: '非正常范围'
                }, {
                    lte: 0,
                    color: '#2756FF',
                    label: '正常范围值'
                }]
            }
        } else {
            visualMap = null;
        }
        for (var i in echarts_data_copy) {
            if(i==='yAxis'){
                continue;
            }
            var obj = echarts_data_copy[i];
            param.forEach(function (con, index) {
                keyUnit.push(param_unit_name[con].unit);
                var data = obj[con];
                if (!data) {
                    return;
                }
                if (sessionStorage.getItem('param') && sessionStorage.getItem('param') == param) {//
                    //alert(1)
                    // console.log(alert_time, alert_value)
                    markPoint = {
                        data: [{
                            name: alert_time,
                            coord: [alert_time, alert_value]
                        }]
                    }
                } else {
                    //alert(2);
                    markPoint = null;
                }
                data.max = data.max.map(function (val, i) {
                    return [val[0], parseFloat((val[1] - data.min[i][1]).toFixed(2))];       //对最大值进行变化减去最小值,因为减法的不精确，toFixed舍入
                });

                if (sessionStorage.getItem('rangePoliceN') || isInPolice) {
                    series.push(
                        {
                            name: param_unit_name[con].name,
                            yAxisIndex: index,
                            showSymbol: false,
                            smooth: true,
                            type: 'line',
                            lineStyle: {normal: {color: '#818d94', opacity: '0',width:1}},
                            symbolSize: 0,
                            stack: param_unit_name[con].name,
                            data: data.min
                        },
                        {
                            name: param_unit_name[con].name,
                            yAxisIndex: index,
                            showSymbol: false,
                            smooth: true,
                            type: 'line',
                            lineStyle: {
                                normal: {
                                    color: '#818d94',
                                    opacity: '0',
                                    width:1
                                }
                            },
                            areaStyle: {
                                normal: {
                                    color: '#ccc',
                                    opacity: '0.3'
                                }
                            },
                            symbolSize: 0,
                            stack: param_unit_name[con].name,
                            data: data.max
                        },
                        {
                            name: param_unit_name[con].name,
                            yAxisIndex: index,
                            showSymbol: false,
                            smooth: true,
                            type: 'line',
                            symbol: 'pin',
                            symbolSize: '16',
                            data: data.average,
                            markPoint: markPoint
                        }
                    );
                } else {
                    series.push(
                        {
                            name: param_unit_name[con].name,
                            yAxisIndex: index,
                            showSymbol: false,
                            smooth: true,
                            type: 'line',
                            lineStyle: {normal: {color: '#818d94', opacity: '0',width:1}},
                            symbolSize: 0,
                            stack: param_unit_name[con].name,
                            data: data.min
                        },
                        {
                            name: param_unit_name[con].name,
                            yAxisIndex: index,
                            showSymbol: false,
                            smooth: true,
                            type: 'line',
                            lineStyle: {
                                normal: {
                                    color: '#818d94',
                                    opacity: '0',
                                    width:1
                                }
                            },
                            areaStyle: {
                                normal: {
                                    color: '#ccc',
                                    opacity: '0.3'
                                }
                            },
                            symbolSize: 0,
                            stack: param_unit_name[con].name,
                            data: data.max
                        },
                        {
                            name: param_unit_name[con].name,
                            yAxisIndex: index,
                            showSymbol: false,
                            smooth: true,
                            type: 'line',
                            lineStyle: {normal: {color: params_color[con].color || '#818d94',width:1}},
                            itemStyle: {normal: {color: params_color[con].color || '#818d94'}},
                            data: data.average,
                            symbol: 'pin',
                            symbolSize: '16'
                        }
                    );
                }
            });
        }
        tooltip.formatter = function (params) {
            var str = '';
            if (params.length) {
                params.forEach(function (con, i) {
                    if (i % 3 === 0) {
                        if (params[i] && params[i].value) {
                            var date = new Date(params[i].value[0]);
                            date = date.getFullYear() + '-'
                                + (date.getMonth() + 1) + '-'
                                + date.getDate() + ' '
                                + (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':'
                                + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
                            str += con.seriesName + '<br/>' + date + '<br/>';
                        }

                    }
                    if (params[i] && params[i].value) {
                        var value = params[i].value[1];
                        if (i % 3 === 1) {
                            value = (Number(params[i].value[1]) + Number(params[i - 1].value[1])).toFixed(2);       //还原max真实数据
                        }
                        value += keyUnit[parseInt(i / 3)] == 'kHz' ? 'Hz' : keyUnit[parseInt(i / 3)];//	QCM参数单位从KHZ替换为HZ
                        str += nameArr1[i % 3] + ':' + value + '</br>';
                    }
                });
                return str;
            } else {
                return;
            }

        };
        return {
            backgroundColor: this.backgroundColor,
            grid: this.grid,
            dataZoom: this.dataZoom,
            xAxis: this.xAxis,
            yAxis: this.yAxis,
            tooltip: tooltip,
            series: series,
            visualMap: visualMap
        };
    }
};
