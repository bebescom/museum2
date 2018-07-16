// @require css/equip_details.css
// @require laydate
// @require echarts
// @require _

//获取参数单位名称
var param_unit_name = window.web_config.param_unit_name.sensor;
//获取震动传感器单位名称
var vibration_unit_name = window.web_config.param_unit_name.vibration;
var weather_unit_name = window.web_config.param_unit_name.weather;

var router = new VueRouter();
var upload = require('common/upload');
var EQUIP = {};

module.exports = Vue.extend({
    template: '#equip_details_template',
    data: function () {
        return {
            equip_id: '',//设备ID
            env_no: '',
            collection_info: {},//数据集合
            equip_name: '',
            time: 'today',
            equip_type: '',
            equip_status: '',
            equip_parameter: '',
            options1: {//日期选择,设置日期快捷选择
                shortcuts: [
                    {
                        text: '今天',
                        value: function () {
                            var end = new Date().setHours(23, 59, 59);
                            var start = new Date();
                            start.setTime(start.getTime() - (start.getHours() * 3600 + start.getMinutes() * 60 + start.getSeconds()) * 1000);

                            return [start, end];
                        }
                    },
                    {
                        text: '24小时',
                        value: function () {
                            var end = new Date();
                            var start = new Date();
                            start.setTime(start.getTime() - 24 * 3600 * 1000);
                            return [start, end];
                        }
                    },
                    {
                        text: '最近3天',
                        value: function () {
                            var end = new Date().setHours(23, 59, 59);
                            var start = new Date();
                            start.setTime(start.getTime() - 24 * 3600 * 1000 * 2 - (start.getHours() * 3600 + start.getMinutes() * 60 + start.getSeconds()) * 1000);
                            return [start, end];
                        }
                    },
                    {
                        text: '最近7天',
                        value: function () {
                            var end = new Date().setHours(23, 59, 59);
                            var start = new Date();
                            start.setTime(start.getTime() - 24 * 3600 * 1000 * 6 - (start.getHours() * 3600 + start.getMinutes() * 60 + start.getSeconds()) * 1000);
                            return [start, end];
                        }
                    }
                ]
            },
            dataTime: [new Date().setHours(0, 0, 0), new Date()],
            test: true,
            timeVal: 'today',
            bza: true,
            clear: false,//时间选择器是否可以清除
            edit: false,//时间选择器是否可以编辑
            timeText: '',
            timeSure: false,
            oldTime:[new Date().setHours(0,0,0),new Date()],
            configLanguage: window.languages,
        }
    },
    route: {
        data: function (transition) {
            var _this = this;
            var params = transition.from.params;
            this.collection_info = {};
            if (params) {
                //路由信息中带有设备编号
                this.equip_id = this.$route.params.equip_id;
            } else {
                //从地图视图跳转到设备详情页面,会重新初始化,首先取出URL中的设备编号
                var hash = window.location.hash,
                    replaceUrl = "#!/equipManagement/equip_details/";
                this.equip_id = hash.replace(replaceUrl, '');
            }
            if (sessionStorage.timeVal) {
                sessionStorage.removeItem('timeVal');
            }
            var equip_test = this.equip_id;
            var arr = [];
            _.each(params, function (elem, key) {
                arr.push(key);
            });
            if (arr[1] == 'equip_no') {
                $.get(API('/env/equipments/detail/detail_info/') + params.equip_no, function (data) {//同柜设备跳转时equip_no 使用params保存的no
                    sessionStorage.setItem('saveEquipNo', params.equip_no);//跳转之后刷新重新保存sessionStorage的no
                    _this.equip_name = data.name;
                    _this.collection_info = data;
                    _this.env_no = data.env_no;
                    _this.equip_type = data.equip_type;
                    _this.equip_status = data.status;
                    _this.equip_parameter = data.parameter;
                    EQUIP = data;
                });
            } else if (arr[0] == 'equip_id' && params.equip_id) {
                router.go("/equipManagement");
            } else {
                $.get(API('/env/equipments/detail/detail_info/') + equip_test, function (data) {//列表中进入使用sessionStorage保存的no
                    _this.equip_name = data.name;
                    _this.collection_info = data;
                    _this.env_no = data.env_no;
                    _this.equip_type = data.equip_type;
                    _this.equip_status = data.status;
                    _this.equip_parameter = data.parameter;
                    EQUIP = data;
                });
            }
            this.timeVal = 'today';
            this.dataTime = [new Date().setHours(0, 0, 0), new Date()];
            transition.next();
        },
        beforeRouteLeave: function () {
            this.collection_info = {};
        }
    },
    methods: {
        clearFun: function () {
            this.dataTime = [new Date().setHours(0, 0, 0), new Date().setHours(new Date().getHours(), new Date().getMinutes(), new Date().getSeconds())]
        },
        compareTime: function () {//时间对比

        },
        compareJoin: function () {//加入对比

        },
        exportDataDetail: function (type) {//导出数据
            var _this = this;
            if (type) {
                _this.getLink();
            } else {
                this.$Message.warning('留言框不能为空');
                return
            }
        },
        getLink: function () {
            var me = this;
            $.post(API('/env/export/equipment/equip_data'), {
                equip_no: this.equip_id,
                time: this.timeVal
            }, function (data) {
                if (data.error) {
                    me.$Message.error(data.error);
                    return;
                }
                if (!data[0].result) {
                    return;
                }
                window.location = API('') + '/' + data[0].url;
            })
        },
        getData: function (data) {//获取设备信息数据并设置变量

        },
        changeTime: function (val) {
            var timeArr = val.split(" - "), timeArr1 = this.timeText.split(" - "), time = '';
            var start = Date.parse(new Date(timeArr[0])) / 1000;
            var end = Date.parse(new Date(timeArr[1])) / 1000;
            if (new Date(timeArr[0]).getFullYear() === new Date(timeArr1[0]).getFullYear() && new Date(timeArr[1]).getFullYear() === new Date(timeArr1[1]).getFullYear() && new Date(timeArr[0]).getDate() === new Date(timeArr1[0]).getDate() && new Date(timeArr[1]).getDate() === new Date(timeArr1[1]).getDate() && new Date(timeArr[0]).getMonth() === new Date(timeArr1[0]).getMonth() && new Date(timeArr[1]).getMonth() === new Date(timeArr1[1]).getMonth()) {
                time = start + ',' + end;
                this.timeText = val;
            } else {
                var end1 = timeArr[1].split(" ")[0] + " 23:59";
                this.dataTime = [Date.parse(new Date(timeArr[0])), Date.parse(new Date(end1))];
                time = Date.parse(new Date(timeArr[0])) + ',' + Date.parse(new Date(end1));
                this.timeText = timeArr[0] + ' - ' + end1;
            }
            this.timeVal = time;
        },
        requireData: function () {
            this.timeSure = true;
            this.oldTime = this.dataTime;
            sessionStorage.setItem('timeVal', this.timeText);
            this.$broadcast('timeVal', this.timeText);
            $('.scrollWrap .body>.shadow').show();
        },
        saveOldTime: function (open) {
            if (open) {
                this.timeSure = false;
            } else {
                if (!this.timeSure) {
                    this.dataTime = this.oldTime;
                }
            }
        },
        equip_list: function () {//跳转回设备管理页面
            router.go("/equipManagement");
        },
        goBack: function () {
            history.go(-1);
        }
    },
    events: {
        'modify-name': function (name) {
            this.equip_name = name;
        },
        'modify-info': function (success) {
            // console.log(this.timeVal);
            this.$broadcast('modify-cast', this.timeVal);
        }
    },
    components: {
        'left-information': {
            template: "#leftInformation_template",
            props: ['collection_info'],
            data: function () {
                return {
                    equip_status: '',
                    equip_id: '',//设备no
                    env_no: '',//环境no
                    status: '',//设备状态
                    name: '',//设备名称
                    minute: '',//时间间隔
                    total_humidity: '',//目标湿度
                    second: '',
                    equip_voltage: '',
                    equip_rssi: '',
                    equip_locate: '',//设备位置
                    data_interval: '',
                    checkData: ['voltage', 'minute'],
                    new_time: '',
                    basicData: '',
                    equip_type: '',
                    equip_arr: [],
                    relic_arr: [],
                    Modal: false,
                    filterContent: [],
                    baseData: [],
                    modify_name: '',//修改设备名称
                    modify_status: '',//修改设备状态
                    modify_location: '',//修改设备位置
                    modify_sleep: '',//修改数据间隔
                    newEquip_no: '',
                    url: '',
                    equip_no_has: '',//设备标志位

                    // 修复BUG#50,设备详情页面编辑功能,不再能够修改设备状态
                    // statusList:[
                    //     {
                    //         value: '正常',
                    //         label: '正常'
                    //     },
                    //     {
                    //         value: '异常',
                    //         label: '异常'
                    //     },
                    //     {
                    //         value: '备用',
                    //         label: '备用'
                    //     },
                    //     {
                    //         value: '停用',
                    //         label: '停用'
                    //     },
                    //     {
                    //         value: '超标',
                    //         label: '超标'
                    //     },
                    //     {
                    //         value: '超低电',
                    //         label: '超低电'
                    //     },
                    //     {
                    //         value: '低电',
                    //         label: '低电'
                    //     }
                    // ],
                    basicDateShow:false,//最新数据show
                    relic_arr_show:false,//同柜藏品show
                    equip_arr_show:false,//同柜设备show
                    humidityShow:false,//目标湿度是否显示
                    configLanguage: window.languages,
                }
            },
            ready: function () {
                var _this = this;
                this.$watch('collection_info', function (data, oldData) {//
                    if (data !== oldData && data.equip_no) {
                        this.setInformation(data);
                    }
                });
                $.get(API('/base/envs/tree/'), function (data) {
                    _this.filterContent = data;
                    $.each(data, function (index, elem) {
                        var obj = {
                            expand: false,
                            checked: false,
                            title: elem.name,//绑定环境名称
                            define: elem.env_no//绑定环境编号
                        };
                        _this._test(elem, obj);
                        _this.baseData.push(obj);
                    });
                });
            },
            computed: {},
            route: {
                data: function (transition) {
                    this.equip_status = '';
                    this.collection_info = {};
                    transition.next();
                }
            },
            watch: {
                modify_status: function (val, oldval) {//修改状态为非正常时的提示
                    if (oldval && val != oldval && val != '正常') {
                        this.$Message.warning("状态已修改为" + val);
                    }
                }
            },
            methods: {
                beforeUpload: function (val) {

                },
                _test: function (data, obj) {//循环tree
                    var _this = this;
                    if (data.children) {
                        obj.children = [];
                        $.each(data.children, function (index, elem) {
                            var obj1 = {
                                expand: false,
                                checked: false,
                                title: elem.name,//绑定环境名称
                                define: elem.env_no//绑定环境编号
                            };
                            obj.children.push(obj1);
                            if (elem.children) {
                                _this._test(elem, obj1);
                            }
                        });
                    }
                },
                getCheckedNodes: function () {

                },
                format: function () {

                },
                getSelectedNodes: function (newClickVal) {//修改位置
                    var _this = this;
                    $.get(API('/base/envs/tree'), function (data) {//查找对应点击菜单的环境编号
                        for (var i in data) {
                            if (data[i].env_no == newClickVal[0].define) {
                                _this.newEquip_no = data[i].env_no
                            } else if ("children" in data[i]) {
                                _this.test(data[i].children, newClickVal[0].define);
                            }
                        }
                    });
                    setTimeout(function () {
                        _this.modify_location = newClickVal[0].title;
                    }, 0);
                },
                test: function (val, oldname) {
                    for (var i in val) {
                        if (val[i].env_no == oldname) {
                            this.newEquip_no = val[i].env_no;
                        } else if ("children" in val[i]) {
                            this.test(val[i].children, oldname);
                        }
                    }
                },
                setInformation: function (data) {//设置左边栏信息数据
                    // console.log(data);
                    var _this = this;
                    this.equip_id = data.equip_no;
                    if (data && data.name) {//设置修改名称
                        this.modify_name = data.name;
                    }
                    if (data && data.status) {//设置状态/修改名称
                        this.equip_status = data.status;
                        this.modify_status = data.status;
                    } else {
                        this.equip_status = '';
                        this.modify_status = ''
                    }
                    if (data && data.voltage) {//设置电压
                        this.equip_voltage = data.voltage;
                    } else {
                        this.equip_voltage = '';
                    }
                    if (data && data.rssi) {//设置信号
                        this.equip_rssi = data.rssi;
                    } else {
                        this.equip_rssi = '';
                    }
                    if (data && data.nav) {
                        var len = data.nav.length - 1;
                        if (data.nav[len] && data.nav[len].name) {
                            this.equip_locate = data.nav[len].name;
                        } else {
                            this.equip_locate = '';
                        }
                    } else {
                        this.equip_locate = '暂无数据';
                    }
                    if (data && data.sleep) {//设置数据间隔
                        this.data_interval = data.sleep;
                        this.modify_sleep = data.sleep;
                    } else {
                        this.data_interval = '';
                        this.modify_sleep = '';
                    }
                    this.new_time = data.new_data_time;
                    if (data && data.new_data) {//设置最新数据
                        this.basicData = data.new_data;
                        this.basicDateShow = true;
                    } else {
                        this.basicData = '';
                        this.basicDateShow = false;
                    }
                    if (data && data.target) {//设置目标湿度
                        this.humidityShow = true;
                        this.total_humidity = data.target;
                    } else if (!data.target) {
                        this.humidityShow = true;
                        this.total_humidity = '暂无数据';
                    }
                    this.equip_type = data.equip_type;
                    this.env_no = data.env_no;
                    this.status = data.status;
                    this.name = data.name;
                    this.second = data.second;
                    this.minute = data.minute;
                    this.url = API('base/upload');
                    if (data && data.env_no) {
                        $.get(API("/env/environments/cabinet/equips/" + data.env_no), function (data) {//设置同柜设备数据
                            var len,
                                equip_arr = [];
                            equip_arr.push(data.sensor.rows);
                            len = equip_arr.length;
                            if (len == 0) {
                                _this.equip_arr = '';
                                _this.equip_arr_show = false;
                                _this.equip_arr_show = false;
                            } else {
                                _this.equip_arr_show = true;
                                _this.equip_arr = equip_arr[0];
                            }
                        });
                        $.get(API('/env/environments/cabinet/relics/' + data.env_no), function (data) {//设置同柜藏品数据
                            if (data.length = 0) {
                                _this.relic_arr = '';
                                _this.relic_arr_show = false;
                            } else {
                                $('.scrollWrap .body>.shadow').hide();
                                _this.relic_arr_show = true;
                                _this.relic_arr = data.rows;
                            }
                        });
                    }
                },
                changeName: function (name) {
                    if (name) {
                        if (param_unit_name[name]) {
                            return param_unit_name[name].name;
                        } else if (vibration_unit_name[name]) {
                            return vibration_unit_name[name].name;
                        } else {
                            return name;
                        }
                    } else {
                        return '';
                    }
                },
                changeEname: function () {
                    if (eName[this.equip_type]) {
                        return eName[this.equip_type].name;
                    } else {
                        return
                    }
                },
                changeTEname: function (type) {
                    if (eName[type]) {
                        return eName[type].name;
                    } else {
                        return
                    }
                },
                changeRelicName: function (name) {
                    if (name != '' && name != null) {
                        return relic_name[name].name;
                    } else {
                        return relic_name['其它文物'].name;
                    }
                },
                ok: function () {//点击确定确认修改
                    if (!checkPermissions({name: '修改设备信息'})) {
                        return;
                    }
                    var _this = this;
                    var time = sessionStorage.timeVal;
                    $.post(API('/env/equipments/manage/edit'), {
                        env_no: _this.newEquip_no,
                        equip_no: _this.equip_id,
                        // 修复BUG#50,设备详情页面编辑功能,不再能够修改设备状态
                        // status:_this.modify_status,
                        name: _this.modify_name,
                        second: _this.modify_sleep,
                        location: _this.modify_location
                    }, function (data) {
                        if (data.error) {
                            _this.$Message.error(data.error);
                            return;
                        }
                        // console.log(data)
                        if (data.result) {
                            if (_this.modify_status != '') {
                                _this.equip_status = _this.modify_status;
                            }
                            if (_this.modify_name != '') {
                                sessionStorage.setItem('equip_name', _this.modify_name);
                                _this.$dispatch('modify-name', _this.modify_name);
                                _this.equip_name = _this.modify_name;
                            }
                            if (_this.modify_location != '') {
                                _this.equip_locate = _this.modify_location;
                            }
                            if (_this.modify_sleep != '') {
                                _this.data_interval = _this.modify_sleep;
                            }
                            _this.$Message.success('修改成功');
                            _this.$dispatch('modify-info', 'success');
                            //_this.$broadcast('timeVal',sessionStorage.timeVal);
                        }
                    })
                },
                cancel: function () {

                },
                handleSuccess: function (response, file, fileList) {

                },
                handleError: function (error, file, fileList) {

                },
                handleFormatError: function (file) {
                    this.$Notice.warning({
                        title: '文件格式不正确',
                        desc: '文件 ' + file.name + ' 格式不正确，请上传 jpg 或 png 格式的图片。'
                    });
                },
                handleMaxSize: function (file) {
                    this.$Notice.warning({
                        title: '超出文件大小限制',
                        desc: '文件 ' + file.name + ' 太大，不能超过 2M。'
                    });
                },
                herfEquipDetail: function (no) {//同柜设备跳转
                    this.$route.params.equip_no = no;
                    router.go('/equipManagement/equip_details/' + no);
                },
                upload_layout: function () {
                    var _this = this;
                    upload({
                        data: {
                            path: 'area',
                        },
                        accept: 'image/jpg,image/jpeg,image/png',
                        success: function (data) {
                            if (data.error) {
                                _this.$Message.error('上传失败');
                                return;
                            }
                            _this.$Message.success('上传成功');
                        },
                        error: function (data) {
                            _this.$Message.error('上传失败');
                        }
                    });
                }
            }
        },
        'right-information':{
            template:"#rightInformation_template",
            props:['collection_info'],
            data:function(){
                return{
                    toggle :'equip_detection',//默认选项
                    configLanguage: window.languages,
                }
            },
            route: {
                data: function (transition) {
                    this.collection_info = {};
                    transition.next();
                }
            },
            watch: {
                // collection_info:function(val){
                //     this.toggle = 'equip_detection';
                // }
            },
            ready: function () {
                var me = this;
                // this.toggle = 'equip_detection';
                //从设备报警列表跳转至设备详情
                var jump_to_detail_tab = window.sessionStorage.getItem('jump_to_detail_tab');
                if (jump_to_detail_tab) {
                    if (jump_to_detail_tab === 'nav') {
                        setTimeout(function () {
                            // me.toggle = 'equip_locate';
                            me.toggle_component('locate');
                        }, 150);
                    }
                    window.sessionStorage.removeItem('jump_to_detail_tab');
                }
            },
            methods: {
                toggle_component: function (type) {
                    this.toggle = 'equip_' + type;
                }
            },
            components: {
                'equip_detection': {//监测曲线
                    template: "#equip_detection",
                    props: ['collection_info'],
                    data: function () {
                        return {
                            equip_id: '',
                            keyDatas: false,
                            axisVal: null,
                            time: 'today',
                            datas: [],//传感器所有参数
                            selectParam: [],//保存参数
                            paramsBzw: [],//参数标志位
                            chartArea: '',//echarts变量
                            default_option: '',//曲线默认配置项
                            env_name: [],
                            showDiyModal: false,//自定义Y轴默认不显示
                            yAreaData: {},//Y轴参数
                            data_eigenvalue_sort: {},//统计数据
                            data_sort: {},
                            self_Y: [],
                            selef_key: [],
                            defined_key_Y: false,
                            $shadow: null,
                            yAxisValue: null,
                            self_jugde: false,
                            errorMsg: {},//错误信息提示
                            yAreaValidate: {},//自定义Y轴验证规则,要求全部是数字,并且不能为空
                            timeChange: true,//时间选择标志位
                            yAreaDataCopy: {}
                        }
                    },
                    route: {
                        data: function (transition) {
                            this.datas = [];
                            this.axisVal = null;
                            transition.next();
                        }
                    },
                    ready: function () {
                        $(".monitoring_data").height($(document.body).height() - 264);
                        var _this = this;
                        this.echartInit();
                        this.create_option();
                        this.equip_id = _this.collection_info.equip_no;
                        if (_this.collection_info.new_data) {
                            for (var i in _this.collection_info.new_data) {
                                _this.datas = _this.datas.concat(i);//获取传感器参数
                            }
                        }
                        _this.selectParam = _this.selectParam.concat('temperature');
                        _this.paramsBzw = _this.selectParam.concat('temperature');
                        $("#rightInformation").height($(document.body).height() - 80);
                        $("#leftInformation").height($("#rightInformation").height());
                    },
                    watch: {
                        collection_info: function (newVal, oldVal) {//设备更换
                            $('.scrollWrap .body>.shadow').show();
                            if (!newVal.equip_no) {//没有设备编号
                                return
                            }
                            var _this = this,
                                obj = {};
                            this.time = 'today';
                            this.keyDatas = true;
                            this.axisVal = null;
                            _this.data_sort = {};//清除filter数据
                            _this.data_eigenvalue_sort = {};//清除filter数据
                            this.datas = [];//当设备ID更换的时候设置参数为空
                            this.selectParam = [];//当设备ID更换的时候设置保存参数为空
                            this.paramsBzw = [];//当设备ID更换的时候设置参数标志位为空
                            this.chartArea.clear();
                            if (newVal != oldVal || newVal.equip_no) {
                                this.equip_id = newVal.equip_no;
                                if (newVal.new_data) {
                                    for (var i in newVal.new_data) {
                                        _this.datas = _this.datas.concat(i);//获取传感器参数
                                    }
                                }
                                _this.datas.forEach(function (val, index) {
                                    obj[val] = {
                                        status: 'self-adaptive',
                                        min: val == 'humidity' ? 0 : val == 'temperature' ? 0 : 'auto',
                                        max: 'auto'
                                    };
                                });
                                _this.yAreaDataCopy = obj;
                                $.get(API('/env/equipments/detail/statistic'), {
                                    equip_no: newVal.equip_no,
                                    time: _this.time
                                }, function (data) {
                                    if (data.error) {
                                        $('.scrollWrap .body>.shadow').hide();
                                        return;
                                    }
                                    if (data.length === 0) {
                                        $('.scrollWrap .body>.shadow').hide();
                                        //return;
                                    }
                                    _this.data_eigenvalue_sort = data;
                                    _this.data_sort = data;
                                    if (_this.datas.length != 0 || _this.datas) {
                                        if ($('.dataSelect p span')[0]) {

                                            $('.dataSelect p span')[0].click();
                                        } else {
                                            return;
                                        }
                                    }
                                });
                            } else {
                                return;
                            }
                        },
                        datas: function (newData) {
                            // console.log(newData);
                            var _this = this,
                                obj = {},
                                validate = {},
                                error = {};
                            if (newData && newData.length != 0) {
                                newData.forEach(function (val, index) {
                                    obj[val] = {
                                        status: 'self-adaptive',
                                        min: val == 'humidity' ? 0 : val == 'temperature' ? 0 : 'auto',
                                        max: 'auto'
                                    };
                                    validate[val] = {
                                        max: true,
                                        min: true
                                    };
                                    error[val] = {
                                        min: '',//最小值错误提示信息
                                        max: ''//最大值错误信息
                                    }
                                });
                            }
                            _this.yAreaData = obj;
                            _this.yAreaValidate = validate;
                            _this.errorMsg = error;
                        },
                        selectParam: function (newData) {

                        }
                    },
                    methods: {
                        data_eigenvalue: function (key) {//配置filter数据
                            this.data_sort = this.data_eigenvalue_sort;//复制filter数据
                        },
                        changeType: function (type) {//转换统计数据中英文
                            return type_List[type];
                        },
                        judgeFilter: function (key) {//判断filter是否添加
                            for (var i in this.selectParam) {
                                if (key == this.selectParam[i]) {
                                    return true;
                                }
                            }
                        },
                        cancelChangeY: function () {
                            this.yAreaData = this.yAreaDataCopy;
                        },
                        validateY: function (key, type, value) {//验证Y轴自定义输入
                            var reg = new RegExp('^[0-9]+(.[0-9]{1,2})?$');
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
                        showChart: function (key) {//显示对应曲线
                            var _this = this;
                            this.self_Y = [];
                            var judge = _this.selectParam.some(function (elem) {
                                return elem == key;
                            });
                            if (!this.defined_key_Y) {
                                if (judge && _this.selectParam.length != 1) {//重复点击,去重
                                    for (var i in _this.selectParam) {
                                        if (_this.selectParam[i] == key) {
                                            _this.selectParam.splice(i, 1);
                                        }
                                    }
                                } else if (judge && _this.selectParam.length == 1) {//length必须大于等于1
                                    _this.$Message.warning('不能取消最后一位选项');
                                    $('.scrollWrap .body>.shadow').hide();
                                    return;
                                } else {//添加保存参数
                                    if (_this.selectParam.length >= 3) {
                                        _this.selectParam.splice(0, 1);
                                    }
                                    _this.selectParam = _this.selectParam.concat(key);
                                    _this.paramsBzw = _this.selectParam;
                                }
                            }
                            if (_this.axisVal === null) {
                                $.get(API('/env/equipments/param_lines/') + this.equip_id + '/' + this.time, function (data) {
                                    _this.axisVal = data;
                                    _this.equipEcharts(data);
                                });
                            } else {
                                if (_this.timeChange === true) {
                                    _this.timeChange = false;
                                    $.get(API('/env/equipments/param_lines/') + this.equip_id + '/' + _this.time, function (data) {
                                        _this.axisVal = data;
                                        _this.equipEcharts(data);
                                    });
                                } else {
                                    _this.equipEcharts(_this.axisVal);
                                }
                            }
                            this.data_eigenvalue(key);
                        },
                        changeName: function (name) {	//根据英文名换成中文名
                            if (name) {
                                if (param_unit_name[name]) {
                                    return param_unit_name[name].name;
                                } else if (vibration_unit_name[name]) {
                                    return vibration_unit_name[name].name;
                                } else {
                                    return name;
                                }
                            } else {
                                return '';
                            }
                            // if (name){
                            //     return param_unit_name[name].name;
                            // }else{
                            //     return;
                            // }
                        },
                        equipEcharts: function (data) {//绘制曲线
                            if (data.length == 0 || typeof data === 'string') {//在没有数据的时候
                                var option = {
                                    title: {
                                        text: '暂无数据',
                                        left: 'center',
                                        top: 'middle'
                                    },
                                    series: [],
                                    resize: {
                                        width: 300 + "px",
                                        height: 300 + "px"
                                    }
                                };
                                this.chartArea.clear();
                                this.chartArea.setOption(option, true);
                                $('.scrollWrap .body>.shadow').hide();
                                return;
                            }
                            var option = _.clone(this.default_option),
                                _this = this,
                                key = 0;
                            option.series = [];
                            option.yAxis = [];
                            _.each(data, function (val, i) {//配置y轴和数据
                                var arr = [];
                                var position = '';
                                var judge = _this.selectParam.some(function (elem) {
                                    return elem == i;
                                });
                                if (!judge && !_this.self_jugde) {//如果保存数组没有当前参数曲线，则绘制，有则取消
                                    return true;
                                }
                                if (key != 0) {
                                    position = 'right'
                                }
                                for (var j in val.value) {
                                    arr = arr.concat(val.value[j])
                                }
                                option.series.push({
                                    showSymbol: false,
                                    smooth: true,
                                    name: i,
                                    type: 'line',
                                    lineStyle: {normal: {color: params_color[i] ? params_color[i].color : '#000'}},
                                    itemStyle: {normal: {color: params_color[i] ? params_color[i].color : '#000'}},
                                    symbolSize: 6,
                                    data: arr,
                                    yAxisIndex: key
                                });
                                // unit.push(data.unit||'');
                                if (val.yz){
                                    option.yAxis.push({
                                        type: 'value',
                                        name: param_unit_name[i]?param_unit_name[i].name:vibration_unit_name[i]?vibration_unit_name[i].name:i,
                                        min:val.yz[1],
                                        max:val.yz[2],
                                        axisLine: {
                                            lineStyle: {
                                                color: params_color[i] ? params_color[i].color : '#000'
                                            }
                                        },
                                        position: position,
                                        offset: (key != 0) ? 50 * (key - 1) : 0,
                                        splitLine: {show: (key != 0) ? false : true},
                                        axisLabel: {
                                            formatter: function (value, index) {
                                                if (i == 'organic' || i == 'inorganic' || i == 'sulfur') {
                                                    return (value / 1000).toFixed(2);
                                                } else {
                                                    return value.toFixed(2);
                                                }
                                            }
                                        },
                                    });
                                    _this.self_jugde = false;
                                } else {
                                    option.yAxis.push({
                                        type: 'value',
                                        name: param_unit_name[i] ? param_unit_name[i].name : vibration_unit_name[i] ? vibration_unit_name[i].name : i,
                                        min: 'dataMin',
                                        max: 'dataMax',
                                        axisLine: {
                                            lineStyle: {
                                                color: params_color[i] ? params_color[i].color : '#000'
                                            }
                                        },
                                        position: position,
                                        offset: (key != 0) ? 70 * (key - 1) : 0,
                                        splitLine: {show: (key != 0) ? false : true},
                                        axisLabel: {
                                            formatter: function (value, index) {
                                                if (i == 'organic' || i == 'inorganic' || i == 'sulfur') {
                                                    return (value / 1000).toFixed(2);
                                                } else {
                                                    return value.toFixed(2);
                                                }
                                            }
                                        },
                                    });
                                }
                                key++;
                            });
                            _this.yAxisValue = option.yAxis;
                            option.tooltip.formatter = function (params) {
                                var str = '';
                                for (var i = 0; i < key; i++) {
                                    if (params[i] && params[i].value) {
                                        var date = new Date(params[i].value[0]);
                                        data = date.getFullYear() + '-'
                                            + (date.getMonth() + 1) + '-'
                                            + date.getDate() + ' '
                                            + date.getHours() + ':'
                                            + date.getMinutes();
                                        str += data + '<br/>'
                                            + (param_unit_name[params[i].seriesName] ? param_unit_name[params[i].seriesName].name : vibration_unit_name[params[i].seriesName] ? vibration_unit_name[params[i].seriesName].name : params[i].seriesName) + ':' + params[i].value[1] + (param_unit_name[params[i].seriesName] ? param_unit_name[params[i].seriesName].unit : vibration_unit_name[params[i].seriesName] ? vibration_unit_name[params[i].seriesName].unit : '*') + '</br>';
                                    }
                                }
                                return str;
                            };
                            this.chartArea.setOption(option, true);
                            this.self_Y = [];
                            $(".filter_content.filter").height($("#rightInformation").height() - 135);
                            $('.scrollWrap .body>.shadow').hide();
                        },
                        echartInit: function () {//初始化echart
                            var _this = this;
                            this.chartArea = echarts.init($('.monitoring_data')[0]);

                            $(window).bind('resize', function () {//窗口放缩自适应
                                _this.chartArea.resize();
                            })
                        },
                        create_option: function () {//设置默认配置项和数据
                            var _this = this;
                            var default_option = {
                                tooltip: {
                                    trigger: 'axis',
                                },
                                legend: {
                                    show: false
                                },
                                dataZoom: [
                                    {
                                        //type:'slider',
                                        show: true,
                                        realtime: true,
                                        xAxisIndex: [0],
                                        //bottom:'50%
                                    },
                                    {
                                        type: 'inside',
                                        realtime: true,
                                        xAxisIndex: [0],
                                    }
                                ],
                                grid: {
                                    left: '8%',
                                    right: '15%',
                                    bottom: 80
                                },
                                xAxis: {
                                    show: true,
                                    type: 'time',
                                    boundaryGap: false,
                                    axisLabel: {
                                        textStyle: {
                                            color: "#9fa6ac",
                                            fontFamily: "微软雅黑"
                                        }
                                    }
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
                                    scale: true
                                },
                                series: []
                            };
                            this.default_option = default_option;
                        },
                        changeY: function () {//自定义y轴，重新绘制曲线
                            this.yAreaDataCopy = this.yAreaData;
                            for (var i in this.yAreaData) {
                                if ((!this.yAreaValidate[i].max || !this.yAreaValidate[i].min) && this.yAreaData[i].status == 'user-defined') {
                                    this.$Message.error('设置数据有误，请重新填写');
                                } else {
                                    if (this.yAreaData[i].status == 'user-defined') {
                                        this.self_jugde = true;
                                        this.timeChange = false;
                                        var name = [i, this.yAreaData[i].min, this.yAreaData[i].max];
                                        this.self_Y.push(name);
                                        this.axisVal[i].yz = name;
                                        //this.axisVal.bzw = true;
                                        for (var j=0;j<this.paramsBzw.length;j++){
                                            if (i==this.paramsBzw[j]){
                                                this.equipEcharts(this.axisVal);
                                            }
                                        }
                                    } else if (this.yAreaData[i].status == 'self-adaptive') {
                                        if (this.axisVal[i].yz) {
                                            delete this.axisVal[i].yz;
                                            this.equipEcharts(this.axisVal);
                                        }
                                    }
                                }

                            }
                        },
                        valFormatter: function (zValue, key) {//filter数据保留2位小数
                            // console.log(param_unit_name[key],vibration_unit_name[key]);
                            var unit = '*';
                            //确定参数单位
                            if (param_unit_name[key]) {
                                unit = param_unit_name[key].unit;
                            } else if (vibration_unit_name[key]) {
                                unit = vibration_unit_name[key].unit;
                            }
                            if (typeof zValue === 'number') {
                                return parseFloat(zValue).toFixed(2) + unit;
                            } else {
                                return zValue + unit;
                            }
                        }
                    },
                    events: {
                        timeVal: function (val) {//改变时间重新绘制曲线
                            var _this = this;
                            this.axisVal = null;
                            this.selectParam = [];//清空保存参数
                            var timeArr = val.split(" - ");
                            var start = Date.parse(new Date(timeArr[0])) / 1000;
                            var end = Date.parse(new Date(timeArr[1])) / 1000;
                            this.time = start + ',' + end;
                            this.timeChange = true;
                            this.self_jugde = false;

                            $.get(API('/env/equipments/detail/statistic'), {
                                equip_no: this.equip_id,
                                time: this.time
                            }, function (data) {
                                if (data.error) {
                                    return;
                                }
                                _this.data_eigenvalue_sort = data;
                                _this.data_sort = data;//选择时间时重新拉一次数据，更改右边filter
                            });
                            this.showChart(this.paramsBzw);//重新绘制当前已点击参数曲线
                        }
                    }
                },
                'equip_original': {//原始数据
                    template: "#equip_original",
                    props: ['collection_info'],
                    data: function () {
                        return {
                            table_data: {},
                            showhas: false,
                            columns: []
                        }
                    },
                    ready: function () {

                        $('.scrollWrap .body>.shadow').hide();
                        if (sessionStorage.timeVal) {
                            var time = sessionStorage.timeVal.split(" - ");
                            var timestamp1 = Date.parse(new Date(time[0])) / 1000;
                            var timestamp2 = Date.parse(new Date(time[1])) / 1000;
                            this.data_params.time = timestamp1 + ',' + timestamp2;
                        }

                        this.initData();
                    },
                    watch: {
                        collection_info: function () {//切换设备时候获取表格数据
                            this.data_params.time = 'today';
                            this.initData();
                        }
                    },
                    computed: {
                        data_params: function () {
                            return {
                                equip_no: '',						//设备编号
                                equip_type: '',						//设备类型
                                time: "today",						//时间
                                page: 1,								//页码
                                limit: Math.floor(($("#rightInformation").height() - 118) / 45),							//记录条数
                                index: 0								//请求标记
                            }
                        },
                        allPage: function () {//设置总页数
                            if (this.data_params) {
                                return Math.ceil(this.table_data.total / this.data_params.limit) || 1;
                            } else {
                                return
                            }
                        }
                    },
                    methods: {
                        turnPage: function () {
                            this.getData();
                        },
                        getData: function () {
                            $('.scrollWrap .body>.shadow').show();
                            var _this = this;
                            this.data_params.index++;
                            setTimeout(function () {
                                $.get(API('/env/equipments/data_lists/') + _this.collection_info.equip_no, _this.data_params, function (data) {
                                    _this.table_data = data;
                                    _this.data_params.index = 0;
                                    $('.scrollWrap .body>.shadow').hide();
                                });
                            }, 0);

                        },
                        initData: function () {//初始化表格数据（原始数据）
                            this.$broadcast('resetPage', 1);//每次改变时间重置页码
                            var _this = this;
                            // console.log(_this.collection_info);
                            _this.columns = [];
                            if (_this.collection_info.parameter) {
                                var _arr = _this.collection_info.parameter.split(',');
                                _.each(_arr, function (param) {
                                    var row = {
                                        param: param,
                                        name: '',
                                        unit: '',
                                    };
                                    if (param_unit_name[param]) {
                                        row.name = param_unit_name[param].name;
                                        row.unit = param_unit_name[param].unit;
                                    } else if (vibration_unit_name[param]) {
                                        row.name = vibration_unit_name[param].name;
                                        row.unit = vibration_unit_name[param].unit;
                                    } else if (weather_unit_name[param]) {
                                        row.name = weather_unit_name[param].name;
                                        row.unit = weather_unit_name[param].unit;
                                    }
                                    _this.columns.push(row);
                                });
                            }
                            $.get(API('/env/equipments/data_lists/') + _this.collection_info.equip_no, this.data_params, function (data) {
                                if ('rows' in data) {
                                    _this.table_data = data;
                                    _this.showhas = true;
                                } else {
                                    _this.showhas = false;
                                    _this.total = 0;
                                }
                                $('.scrollWrap .body>.shadow').hide();
                            })
                        }
                    },
                    events: {
                        timeVal: function (val) {//选择日期改变原始数据
                            // console.log(val)
                            var time = val.split(" - ");
                            var timestamp1 = Date.parse(new Date(time[0])) / 1000;
                            var timestamp2 = Date.parse(new Date(time[1])) / 1000;
                            this.data_params.time = timestamp1 + ',' + timestamp2;
                            this.initData();
                        }
                    }
                },
                'equip_history': {//历史信息
                    template: "#equip_history",
                    props: ['collection_info'],
                    data: function () {
                        return {
                            table_data: {},
                            showhas: false
                        }
                    },
                    ready: function () {
                        if (sessionStorage.timeVal) {
                            //var time = sessionStorage.timeVal.split(" - ");
                            //var timestamp1 = Date.parse(new Date(time[0]))/1000;
                            //var timestamp2 = Date.parse(new Date(time[1]))/1000;
                            // this.data_params.time = sessionStorage.timeVal;
                            this.getHistoryFun(sessionStorage.timeVal);
                        }
                        this.initData();
                    },
                    computed: {
                        data_params: function () {
                            return {
                                //equip_no: '',						//设备编号
                                equip_type: '',						//设备类型
                                time: "",						//时间
                                page: 1,								//页码
                                limit: Math.floor(($("#rightInformation").height() - 118) / 45),							//记录条数
                                index: 0								//请求标记
                            }
                        },
                        allPage: function () {//设置总页数
                            if (this.data_params) {
                                return Math.ceil(this.table_data.count / this.data_params.limit) || 1;
                            } else {
                                return
                            }
                        }
                    },
                    watch: {
                        collection_info: function () {//切换设备时候获取表格数据
                            this.data_params.time = 'today';
                            this.initData();
                        }
                    },
                    methods: {
                        turnPage: function () {
                            this.getData();
                        },
                        getData: function () {
                            $('.scrollWrap .body>.shadow').show();
                            var _this = this;
                            this.data_params.index++;
                            setTimeout(function () {
                                $.get(API('/env/equipments/detail/opt_record/') + _this.collection_info.equip_no, _this.data_params, function (data) {
                                    _this.table_data = data;
                                    _this.data_params.index = 0;
                                    $('.scrollWrap .body>.shadow').hide();
                                });
                            }, 0);
                        },
                        initData: function () {
                            var _this = this;
                            this.$broadcast('resetPage', 1);//每次改变时间重置页码
                            $.get(API('/env/equipments/detail/opt_record/') + _this.collection_info.equip_no, _this.data_params, function (data) {
                                if ('rows' in data || data.row.length != 0) {
                                    _this.table_data = data;
                                    _this.showhas = true;
                                } else {
                                    _this.showhas = false;
                                    _this.total = 0;
                                }
                                $('.scrollWrap .body>.shadow').hide();
                            });
                        },
                        getHistoryFun: function (val) {
                            if (val === 'today') {
                                this.data_params.time = 'toady';
                            } else {
                                var time = val.split(" - ");
                                //console.log(time);
                                var timestamp1 = Date.parse(new Date(time[0])) / 1000;
                                var timestamp2 = Date.parse(new Date(time[1])) / 1000;

                                this.data_params.time = timestamp1 + ',' + timestamp2;
                                // console.log(this.data_params.time)
                                this.initData();
                            }
                        }
                    },
                    events: {
                        timeVal: function (val) {//选择日期改变历史信息
                            this.getHistoryFun(val);
                        },
                        'modify-cast': function (val) {
                            this.getHistoryFun(val);
                        }
                    }
                },
                'equip_locate': {//设备位置
                    template: "#equip_locate",
                    props: ['collection_info'],
                    data: function () {
                        return {
                            imgUrl: '',//图片url
                            leftStart: 0,//图片起始位置(左侧)
                            topStart: 0,//图片起始位置（上侧）
                            left: 10,//图片移动距离（左侧）
                            top: 10,//图片移动距离（上侧）
                            imgWidth: 1,//图片放大倍数
                            pointTop: '',//位置顶部距离
                            pointLeft: '',//位置左部距离
                            pointTopPercent: '',//位置顶部距离百分比
                            pointLeftPercent: '',//位置左部距离百分比
                        }
                    },
                    computed: {
                        imgStyle: function () {
                            //return `width:${this.imgWidth*50}%;left:${this.left}px;top:${this.top}px;`;
                            return 'width:' + this.imgWidth * 50 + '%;left:' + this.left + 'px;top:' + this.top + 'px;';
                        },
                        pointStyle: function () {
                            //return `top:${this.pointTopPercent*100}%;left:${this.pointLeftPercent*100}%`;
                            return 'top:' + this.pointTopPercent * 100 + '%;left:' + this.pointLeftPercent * 100 + '%';
                        }
                    },
                    ready: function () {
                        this.initLocateMap();
                        $("#locate_content").height($("#rightInformation").height() - 140);

                    },
                    watch: {
                        collection_info: function () {
                            this.initLocateMap();
                        }
                    },
                    methods: {
                        initLocateMap: function () {
                            var _this = this;
                            if (_this.collection_info.map) {
                                _this.imgUrl = _this.collection_info.map;
                            }
                            if ('locate' in _this.collection_info && _this.collection_info.locate) {
                                var locatePosition = _this.collection_info.locate.split("area")[1].split("]")[0].split('"')[2].split(",");
                                var locateSize = _this.collection_info.locate.split("],")[1].split(",");
                                var width = locateSize[0].split(":")[1];
                                var height = locateSize[1].split(":")[1].split("}")[0];
                                this.pointTop = Math.ceil(parseFloat(locatePosition[1]));
                                this.pointLeft = Math.ceil(parseFloat(locatePosition[0]));
                                this.pointLeftPercent = _this.pointLeft / parseFloat(width).toFixed(2);
                                this.pointTopPercent = _this.pointTop / parseFloat(height).toFixed(2);
                            }
                        },
                        changeName: function () {
                            return eName[this.collection_info.equip_type].name;
                        },
                        href_location: function (no, type) {//设备地图跳转链接
                            if (type == "楼栋") {

                            } else if (type == "楼层") {
                                window.location.href = '../floor?env_no=' + no;
                            } else if (type == "展厅") {
                                window.location.href = '../hall?env_no=' + no;
                            } else if (type == "展柜") {
                                window.location.href = '../cabinet?env_no=' + no;
                            } else if (type == "库房") {
                                window.location.href = '../floor?env_no=' + no;
                            } else if (type == "存储柜") {
                                window.location.href = '../cabinet?env_no=' + no;
                            } else if (type == "安防展柜") {
                                window.location.href = '../cabinet?env_no=' + no;
                            } else if (type == "修复室") {
                                window.location.href = '../hall?env_no=' + no;
                            } else if (type == "研究室") {
                                window.location.href = '../hall?env_no=' + no;
                            }
                        },
                        scaleImg: function (e) {//缩放
                            var _this = this;
                            if (e.deltaY < 0) {//放大
                                _this.imgWidth *= 1.1;
                            } else {//缩小
                                _this.imgWidth *= 0.9;
                            }
                        },
                        dragStart: function (e) {//拖曳
                            var target = e.srcElement || e.target,
                                _this = this;
                            e.preventDefault();
                            this.leftStart = e.offsetX;
                            this.topStart = e.offsetY;

                            //移动元素处理
                            var moveHandler = function (e) {
                                e.preventDefault();
                                e.stopPropagation();
                                _this.left += (e.offsetX - _this.leftStart);
                                _this.top += (e.offsetY - _this.topStart);
                            };

                            //拖动结束时处理
                            var upHandler = function (e) {
                                e.preventDefault();
                                e.stopPropagation();
                                _this.leftStart += e.offsetX;
                                _this.topStart += e.offsetY;
                                document.removeEventListener('mouseup', upHandler);
                                document.removeEventListener('mousemove', moveHandler);
                                document.removeEventListener('mouseout', upHandler);
                            };
                            //鼠标离开时处理
                            if (document.addEventListener) {
                                document.addEventListener("mousemove", moveHandler);
                                document.addEventListener("mouseup", upHandler);
                                document.addEventListener("mouseout", upHandler);
                            }
                        }
                    }
                }
            }
        },
    }
});
var params_color = {
    temperature: {color: '#3db38c'},
    humidity: {color: '#2756FF'},
    voc: {color: '#ae9a2e'},
    co2: {color: '#99351f'},
    light: {color: '#ff9000'},
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
    cascophen: {color: '#a415ff'},
    soil_salt: {color: '#a415ff'},
};

var type_List = {
    "threshold": "阈值",
    "extremum": "极值",
    "average": "平均值",
    "standard_reach": "达标率",
    "cv": "离散系数",
    "max_fluctuate": "最大日波动",
    "avg_fluctuate": "平均日波动",
    "diff": "极值差"
};
var eName = {
    '光照紫外监测终端': {name: 'light_uv'},
    '温湿度监测终端': {name: 'temperature_humidity'},
    '带屏温湿度监测终端': {name: 'withScreen'},
    '二氧化碳监测终端': {name: 'co2'},
    '有机挥发物监测终端': {name: 'voc'},
    '空气质量监测终端': {name: 'qcm'},
    '震动监测终端': {name: 'vibration'},
    '玻破监测终端': {name: 'broken'},
    '智能展柜监': {name: 'smart_shelves'},
    '气象站': {name: 'meteorological'},
    '土壤温湿度监测终端': {name: 'soil_temperature_and_humidity'},
    '甲醛监测终端': {name: 'formaldehyde'},
    '多维驻波监测终端': {name: 'multidimensional_standing_wave'},
    '安防监测终端': {name: 'security_sensors'},
    '手持式温湿度检测仪': {name: 'handheld_temperature_humidity'},
    '手持式光照紫外检测仪': {name: 'handheld_light_uv'},
    '手持式二氧化碳检测仪': {name: 'handheld_co2'},
    '手持式有机挥发物检测仪': {name: 'handheld_voc'},
    '手持式甲醛检测仪': {name: 'handheld_formaldehyde'},
    '网关': {name: 'gateway'},
    '中继': {name: 'relay'},
    '调湿机': {name: 'wet_machine'},
    '调湿剂': {name: 'wet_agent'},
    '吸附剂': {name: 'adsorbent'},
    '智能囊匣': {name: 'smart_pouch_box'},
    '充氮调湿柜': {name: 'humidity_cabinet'},
    '灯光调控终端': {name: 'lighting'}
};
var relic_name = {
    '一级文物': {name: 'level_1'},
    '二级文物': {name: 'level_2'},
    '三级文物': {name: 'level_3'},
    '一般文物': {name: 'level_general'},
    '未定级文物': {name: 'level_undefined'},
    '其它文物': {name: 'level_other'}
};

