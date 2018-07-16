define('environmentalMonitoring/environmental_monitoring', function(require, exports, module) {
// 
// 
// 

var $one_location,
    $two_location,
    $three_location,
    $four_location,
    $one___,
    $two___,
    $three___,
    $four___,
    $one___1,
    $two___1,
    $three___1,
    $four___1;

var router = new VueRouter();

// //全局标志位,标志是否是通过时间控件的别名选择的时间
// var shortTime = false;

var calcTime = function (time, type) {
    var year = time.getFullYear(),
        month = time.getMonth() + 1,
        day = time.getDate(),
        newDate = time;
    if (type == 'today') {
        newDate.setHours(0, 0, 0);
    }
    else if (type == 'yesterday') {
        newDate.setDate(day - 1);
        newDate.setHours(0, 0, 0);
    }
    else if (type == 'near3') {
        newDate.setDate(day - 2);
        newDate.setHours(0, 0, 0);
        // newDate.setHours(0,0,0);
    } else if (type == 'near7') {
        newDate.setDate(day - 6);
        newDate.setHours(0, 0, 0);
        // newDate.setHours(0,0,0);
    }
    return newDate;
};


module.exports = Vue.extend({
    template: '#environmental_monitoring',
    created: function () {
        if (!checkPermissions({name: '环境监控'})) {
            setTimeout(function () {
                $('.tableBox .shadow').hide();
            }, 0);
            return;
        }
        var This = this;
        //保存时间
        this.$route.params.timeArr = this.timeArr;
        this.$route.params.timeStr = this.timeStr;

        $.get('/2.2.05_P001/base_api/base/envs/tree/', function (data) {
            var fileterContent = [];
            recursive(data, fileterContent);
            This.fileterContent = fileterContent;//递归取出所有环境
        });
        // $.get('/2.2.05_P001/base_api/env/monitor/alerts/alerts_count', function (data) {
        //     This.Threshold_alarm = data;
        // });
    },
    ready: function () {
        if (!checkPermissions({name: '环境监控'})) {
            setTimeout(function () {
                $('.tableBox .shadow').hide();
            }, 0);
            return;
        }
        this.resize();
        var This = this;
        $(window).resize(function () {
            This.resize();
        });

        $one_location = $('.one_location'),
            $two_location = $('.two_location'),
            $three_location = $('.three_location'),
            $four_location = $('.four_location'),
            $one___ = $('.one___'),
            $two___ = $('.two___'),
            $three___ = $('.three___'),
            $four___ = $('.four___'),
            $one___1 = $('.one___1'),
            $two___1 = $('.two___1'),
            $three___1 = $('.three___1'),
            $four___1 = $('.four___1');

        var height = $('#content').height() - 105;
        $('.environmental_monitoring ').find('.tableBox').css({height: height, 'max-height': height});

        this.$shadow = $('.shadow');
        this.$shadow.show();
        $.get('/2.2.05_P001/base_api/env/monitor/monitor_overview?time=' + this.timeStr+'', function (data) {
            This.$shadow.hide();
            if (data.error) {
                This.$Message.error(data.error);
                return;
            }
            This.allData = data;
        });
        // $.get('/2.2.05_P001/base_api/report/report', function (data) {//导出生成报告（数据）
        //     // console.log(data.rows);
        //     _.each(data.rows, function (elem, index) {
        //         var report = {
        //             id: elem.id,
        //             year: elem.report_name,
        //             status: elem.generate_status
        //         };
        //         This.data_report.push(report);
        //     });
        // });
        // $.get('/2.2.05_P001/base_api/report/report',{limit:10,page:1},function (data) {
        //     console.log(data.total)
        //     This.report_list=data.rows;
        //     This.report_total=data.total;
        // })
        this.reportData(this.report_page);//通过ajax返回评估报告页面数据，默认显示第一页
        this.columns1 = [
            {
                title: '年份',
                key: 'year',
                width: 155,
                align: 'center'
            },
            {
                title: '状态',
                key: 'status',
                width: 180,
                align: 'center',
                render: function (row, column, index) {
                    var color = row.status == '已生成' ? 'green' : 'red';
                    var text = row.status == '已生成' ? '已生成' : '生成中';
                    return "<tag type='dot' color='" + color + "'>" + text + "</tag>";
                }
            },
            {
                title: '下载',
                key: 'download',
                width: 150,
                align: 'center',
                render: function (row, column, index) {
                    var quarter = row.id;
                    var disableds = row.status == '已生成' ? false : true;
                    return '<i-button type="primary" :disabled="' + disableds + '" size="small" @click="report_data(' + quarter + ')" >下载</i-button>';
                }
            }
        ];
    },
    route: {
        data: function (transition) {
            var me = this;
            localStorage.removeItem('tree_list');
            localStorage.removeItem('equipment_filter_list');
            localStorage.removeItem('relic_filter_list');
            var params = transition.from.params;
            if (!params) {
                params = {};
            }
            if (params.timeStr) {
                this.timeStr = params.timeStr;
            }
            if (params.timeArr) {
                this.timeArr = params.timeArr;
            }
            if (params.timeStr && params.timeArr) {
                // me.$shadow.show();
                //把时间存储到路由信息
                me.$route.params.timeArr = this.timeArr;
                me.$route.params.timeStr = this.timeStr;
                $.get('/2.2.05_P001/base_api/env/monitor/monitor_overview', {time: this.timeStr}, function (data) {
                    me.$shadow.hide();
                    if (data.error) {
                        me.$Message.error(data.error);
                        return;
                    }
                    me.allData = data;
                });
            }
            if (sessionStorage.getItem('rangePoliceN')) {
                sessionStorage.removeItem('rangePoliceN');
                sessionStorage.removeItem('rangePoliceX');
                sessionStorage.removeItem('alertTime');
                sessionStorage.removeItem('paramName');
                sessionStorage.removeItem('key2');

            }
            if (sessionStorage.getItem('param')) {
                sessionStorage.removeItem('param');
            }
        }
    },
    data: function () {
        return {
            $shadow: null,
            allData: '',
            select: false,
            oneTable: '',
            spanShowKey: false,			//表头搜索框和(所有位置/已选)的切换
            showType: true,				//所有位置和已选的切换
            trList: [],					//被选中的环境编号列表
            trSelect: 0,					//被选中的个数
            selected: false,				//是否切换到已选
            keyword: '',					//搜索关键字,
            fileterContent: [],			//所有环境
            status: true,					//搜索框显示状态
            /*td的宽度*/
            one_location: '',
            two_location: '',
            three_location: '',
            four_location: '',
            one___: '',
            two___: '',
            three___: '',
            four___: '',
            one___1: '',
            two___1: '',
            three___1: '',
            four___1: '',
            /*td的宽度*/
            Threshold_alarm: {},			//阈值报警
            who: 0,
            // pick_time:{//默认时间为当前日期00:00:00
            // 	start:laydate.now(),
            // 	end:laydate.now()
            // },
            // pick_time_status:true,
            timeArr: [new Date().setHours(0, 0, 0) - 24 * 60 * 60 * 1000, new Date().setHours(0, 0, 0) - 1000],						//显示的时间,默认显示
            timeOldArr: [],
            timeChangeArr: [],
            timeSure: false,//时间标志位,标志是点击确定请求数据还是遮罩层消失
            timePickerOption: {
                shortcuts: [
                    {
                        text: '今天',
                        value: function () {
                            var start, end;
                            // shortTime=true;
                            end = new Date().setHours(23, 59, 59);
                            start = calcTime(new Date(), 'today');//计算今天00:00起始时间
                            return [start, end];
                        }
                    },
                    {
                        text: '昨天',
                        value: function () {
                            var start, end;
                            shortTime = true;
                            end = new Date().setHours(0, 0, 0) - 1000;
                            start = calcTime(new Date(), 'yesterday');//计算24小时起始时间
                            return [start, end];
                        }
                    },
                    {
                        text: '最近3天',
                        value: function () {
                            var start, end;
                            // shortTime=true;
                            end = new Date().setHours(23, 59, 59);
                            start = calcTime(new Date(), 'near3');//计算3天前00:00起始时间
                            return [start, end];
                        }
                    },
                    {
                        text: '最近7天',
                        value: function () {
                            var start, end;
                            // shortTime=true;
                            end = new Date().setHours(23, 59, 59);
                            start = calcTime(new Date(), 'near7');//计算7天前00:00起始时间
                            return [start, end];
                        }
                    }
                ],
                disabledDate: function (date) {//当前时间之后的时间禁用
                    return date && date.valueOf() > Date.now();
                }
            },
            export_report: false,//导出报告

            columns1: [],//导出报告表格
            data_report: [],
            configLanguage: window.languages,
            assessment_report:false,//评估报告
            self: this,
            columns_list:[
                {
                    key:'name',
                    title:'文件名',
                    width:"487px",
                    render:function(row, column, index) {

                        return '<Icon type="archive" style="font-size: 20px;padding-right: 10px;cursor: pointer;" @click="file_down(\''+row.report_file+'\')"></Icon>'+row.report_name;
                    }
                }
            ],
            report_list:[],//评估报告数据
            report_page:1,//评估报告当前页码，默认为1
            report_total:0,//数据的总条数,由ajax请求得到
            report_size:10//当前页的数据条数
        }
    },
    computed: {
        checkList: function () {			//被选中的环境数据
            var arr = [], trList = this.trList, fileterContent = this.fileterContent;
            trList.forEach(function (num, i) {
                fileterContent.forEach(function (con, j) {
                    if (con.env_no == num) {
                        arr.push(con);
                    }
                });
            });
            return arr;
        },
        timeStr: function () {
            return this.timeArr.map(function (time) {//时间戳精确单位,后台为s,前端为ms,舍弃前端时间戳后3位
                return Math.floor(time / 1000);
            }).join(',');
        },
        filteredSearchList: function () {
            // console.log(this.keyword,this.fileterContent);
            var arr = [],
                me = this;
            this.fileterContent.forEach(function (val, index) {
                if (val.name.indexOf(me.keyword) !== -1) {
                    arr.push(val);
                }
            });
            return arr;
        }
    },
    methods: {
        saveOldTime: function (open) {
            if (open) {
                this.timeSure = false;
                //拷贝一份原始的时间对象
                this.timeOldArr = JSON.parse(JSON.stringify(this.timeArr));
                this.timeChangeArr = JSON.parse(JSON.stringify(this.timeArr));
            } else {
                if (!this.timeSure) {
                    this.timeArr = this.timeOldArr;
                }
            }
        },
        changeTime: function (val) {
            this.timeArr = val.split(' - ').map(timeStamp);

            //是否需要将日期终点设置为23点59分59秒,需要添加一次判断,如果日期未发生变化,则只修改时间;
            var startDate1 = new Date(this.timeArr[0]),
                startDate2 = new Date(this.timeChangeArr[0]),
                endDate1 = new Date(this.timeArr[1]),
                endDate2 = new Date(this.timeChangeArr[1]);
            if ((startDate1.getFullYear() == startDate2.getFullYear() && endDate1.getFullYear() == endDate2.getFullYear()) && (startDate1.getDate() == startDate2.getDate() && endDate1.getDate() == endDate2.getDate()) && (startDate1.getMonth() == startDate2.getMonth() && endDate1.getMonth() == endDate2.getMonth())) {//如果同年同月同日

            } else {//并非同年同日
                this.timeArr.$set(1, new Date(this.timeArr[1]).setHours(23, 59, 59));
            }
            this.timeChangeArr = this.timeArr;
        },
        requireData: function () {
            this.timeSure = true;
            this.$shadow.show();
            this.getData();
        },
        resetTime: function () {
            var me = this;
            this.$nextTick(function () {
                    me.timeArr = [new Date().setHours(0, 0, 0) - 24 * 60 * 60 * 1000, new Date().setHours(0, 0, 0) - 1000];
                    me.$shadow.show();
                    me.getData();
                }
            );
        },
        getData: function () {
            var me = this;
            //把时间存储到路由信息
            me.$route.params.timeArr = this.timeArr;
            me.$route.params.timeStr = this.timeStr;
            $.get('/2.2.05_P001/base_api/env/monitor/monitor_overview', {time: this.timeStr}, function (data) {
                me.$shadow.hide();
                if (data.error) {
                    me.$Message.error(data.error);
                    return;
                }
                me.allData = data;
            });
        },
        openTimePicker: function (type) {
            var me = this;
            laydate({
                format: 'YYYY-MM-DD hh:mm:ss',
                istime: true, //是否开启时间选择
                isclear: false,//是否显示清空
                issure: true,//是否显示确认
                max: laydate.now(), //时间范围为今天之前
                istoday: false, //是否显示今天
                choose: function (dates) {
                    me.pick_time[type] = dates;
                    me.pick_time_status = checkTime(me.pick_time);
                    if (!me.pick_time_status) {
                        me.$Message.error('输入日期有误,开始时间必须在结束时间之后!');
                    }
                }
            });
        },
        selectAll: function () {
            this.trList = unique(this.trList);
            if (!this.showType) return;
            this.select = !this.select;
            this.$broadcast('select-checkBox', this.select);
            if (!this.select) {
                this.trList = [];
                //this.trSelect = 0;
            }
        },
        fileter_keyword: function (name, key) {
            if (!key) {
                return name;
            }
            return name.split(key).join('<i>' + key + '</i>');
        },
        resize: function () {
            var This = this;
            setTimeout(function () {
                This.one_location = $one_location.width();
                This.two_location = $two_location.width();
                This.three_location = $three_location.width();
                This.four_location = $four_location.width();
                This.oneTable = $('.oneTable').width();

                This.one___ = $one___.width();
                This.two___ = $two___.width();
                This.three___ = $three___.width();
                This.four___ = $four___.width();

                This.one___1 = $one___1.width();
                This.two___1 = $two___1.width();
                This.three___1 = $three___1.width();
                This.four___1 = $four___1.width();
                // console.log(This.two_location);
            }, 0);
        },
        switch: function () {
            this.spanShowKey = !this.spanShowKey;
        },
        toggleType: function (type) {
            var This = this;
            this.showType = type;
            this.selected = !type;
            setTimeout(function () {
                This.resize();
            }, 0);
        },
        focus: function () {
            this.status = true;
        },
        blur: function () {
            var This = this;
            //input失去焦点时,过0.5秒隐藏下拉菜单
            setTimeout(function () {
                This.status = false;
            }, 500);
        },
        eliminate: function (env_no) {
            this.$broadcast('eliminate', env_no);
        },
        export_data: function (type) {
            var This = this;
            var start_time = $('.header').find('.start_time').val();
            var end_time = $('.header').find('.end_time').val();
            var list = this.trList.join();

            if (type) {
                this.getLink();
            } else {
                if (!list) {
                    //alert('请选择环境');
                    this.$Message.warning('请选择环境');
                    return;
                }
                this.getLink(list);
            }
        },
        getLink: function (list) {
            if (!list) list = '';
            // $.get('/2.2.05_P001/base_api/env/monitor/export', {env_no: list, time: this.timeStr}, function (data) {
            //     // console.log(data.result);
            //     if (!data.result) {
            //         //alert(data.url);
            //         this.$Message.warning(data.url);
            //         return false
            //     }
            //     window.location = '/2.2.05_P001/base_api' + '/' + data.url;
            // });

            var _this = this;
            var json = {};
            json.file_name = '环境监测概览表';
            json.env_no = list;
            json.time = _this.timeStr;
            json.api_url = "get/env/monitor/export";
            // console.log(json);
            window.new_down(json);


        },
        keySearch: function (e) {
            if (!this.keyword) return;
            var element = e.target || e.srcElement;
            $('#searchUl').children('li')[this.who].click();
            element.blur();
            this.who = 0;
        },
        search: function (name, env) {
            var This = this;
            // this.$route.params.key=true;
            // this.$route.params.env_no=env;
            // this.$route.params.name=name;
            // router.go('/environment/environment_details/');
            setTimeout(function () {
                This.keyword = name;
                This.$broadcast('env_no', env);
                This.who = 0;
                This.resize();
            }, 0);
        },
        keyUP: function () {
            this.who--;
            if (this.who < 0) this.who = 0;
        },
        keyDOWN: function () {
            // var liLineHeight = 30,
            //    $listContainer = $('#searchUl').parent(),
            // 	liPageMax = ($listContainer.height()-13*2)/30,
            //    ulHeight = this.filteredSearchList.length*30+26;
            // if(ulHeight>500){//一页无法完全显示,存在滚动条
            // 	var limit = Math.floor((500-13)/30);//下取整,能够完整显示的条数
            // 	if(this.who>=limit-1){
            //        $listContainer.scrollTop((this.who-limit)*30+13);
            // 	}
            // }
            this.who++;//当前激活的项目
            if (this.who >= this.filteredSearchList.length - 1) this.who = this.filteredSearchList.length - 1;
        },
        contrast: function () {
            // console.log(this.checkList)

            if(this.checkList.length == 0){
                this.$Message.warning('请选择环境');
                return;
            }else  if (this.checkList.length >= 11){
                this.$Message.warning('选择环境不能超过10个');
                return;
            }
            this.$route.params.checkList = this.checkList;
            router.go('/environment/environment_details/' + this.trList.join(','));
        },
        browse: function (env_no, name) {
            // console.log(env_no);
            this.$route.params.key = true;
            this.$route.params.env_no = env_no;
            this.$route.params.name = name;
            router.go('/environment/environment_details/' + env_no);
        },
        Environmental_levels: function () {
            router.go('/environment/Environmental_levels/');
        },
        export_reports: function () {//导出报告
            this.export_report = true;
        },
        report_ok: function () {

        },
        report_cancel: function () {

        },
        report_data: function (e) {
            //console.log("http://" + window.location.hostname + ':'+ window.web_config.app_port + '/report/report?reportId=' + e);
            window.location = "http://" + window.location.hostname + ':8080' + '/report/report?reportId=' + e;
        },
        assessment_reports:function () {
            this.assessment_report=true
        },
        file_down:function (url) {//评估报告下载
            if(url){
                window.location.href=url;
            }
        },
        reportData:function (thisPage) {
            var This=this;
            $.get('/2.2.05_P001/base_api/report/report',{limit:This.report_size,page:thisPage},function (data) {
                This.report_list=data.rows;
                This.report_total=data.total;
            })
        },
        changePage:function (page) {//分页功能
            this.reportData(page);//根据选择的页码切换页面
            var allData=this.report_list;
            console.log(allData)
        }
    },
    events: {
        over: function () {
            var This = this;
            setTimeout(function () {
                This.resize();
            }, 0);
        },
        reset: function () {
            this.resize();
        }
    },
    components: {
        tr_list: {
            name: 'tr_list',
            template: '#tr_list',
            props: ['data', 'keyll', 'trSelect', 'trList', 'selected', 'topStatus'],		//keyll当前元素是否显示	//selected表示是否切换到已选,//topStatus表示上层是否显示
            data: function () {
                return {
                    lls: false,			//表示对下层的操作     true---下层显示  false---下层不显示
                    select: false,		//表示当前是否选中
                    tableChangeTab: 0,
                    bzw: 0,
                    test: 0,
                    selectBzw: 0
                }
            },
            computed: {
                changeName: function (type) {
                    var type = this.data.type;
                    var asd = '';
                    if (type === '楼栋' || type === '楼层' || type === '展厅' || type === '展柜') {
                        asd = type;
                    } else {
                        asd = nameList[type];
                    }
                    if (asd !== '展厅') {
                        this.lls = true;			//因为影响的是下层，所以展厅处lls设置为false表示隐藏展柜
                    }
                    return asd;
                },
                ll: function () {
                    return this.lls && this.keyll;	//下一层级是否显示
                },
                Judge_conditions: function () {
                    var len = this.trList.length;//长度标志位
                    if (this.selected) {
                        for (var i = 0; i < len; i++) {
                            if (this.trList[this.bzw + i] == this.data.env_no) {
                                return true;
                            } else {
                                //return this.select;
                            }
                        }
                    } else {
                        return this.keyll;
                    }
                }
            },
            ready: function () {
                this.$dispatch('over');
            },
            methods: {
                checkData1: function (data, param, key) {
                    var result = '-';
                    if (data && data[param]) {
                        if (data[param][key]) {
                            if (param === 'temperature' || param === 'humidity') {
                                if (data[param][key] === '-') {
                                    result = '-';
                                } else {
                                    result = data[param][key];
                                }
                            }
                        } else {
                            result = 0;
                        }
                    }
                    return result;

                },
                checkData: function (data, param, key) {
                    // if(param === 'temperature' && key === 'extremum'){
                    //     console.log(data,param,key);
                    // }
                    var result = '-';
                    if (data) {
                        if (data[param]) {
                            if (data[param][key] && data[param][key] !== 0) {
                                if (key === 'threshold' || key === 'extremum') {
                                    if (data[param][key] === ' ~ ') {
                                        result = '-';
                                    } else {
                                        result = data[param][key];
                                    }
                                } else {
                                    if (key === 'average') {
                                        //平均值保留1位小数
                                        result = data[param][key] === '-' ? data[param][key] : data[param][key].toFixed(1);
                                    } else {
                                        result = data[param][key] === '-' ? data[param][key] : data[param][key].toFixed(2);
                                    }
                                }
                            } else {
                                result = 0;
                            }
                        }
                    }
                    return result;
                },
                dragDown: function () {
                    if (this.selected) return;
                    this.lls = !this.lls;
                    this.$dispatch('reset');
                    //console.log(this.lls,this.keyll)
                },
                selectChange: function (env_no) {
                    var judgeSome = this.trList.some(function (elem, index, arr) {//在重新获取数据之后，判断本次添加的元素是否在trList数组中
                        return elem == env_no;
                    });
                    if (this.select) {
                        this.trList.splice(this.trList.indexOf(env_no), 1);
                        this.trSelect--;
                        this.select = !this.select;
                    } else if (!this.select && judgeSome) {
                        this.trList.splice(this.trList.indexOf(env_no), 1);
                        this.trSelect--;
                    } else {
                        this.trList.push(env_no);
                        this.trSelect++;
                        this.select = !this.select;
                    }
                    this.selectBzw = this.$treeSelect;
                    console.log(this.trSelect);
                },
                browse: function (env_no, name) {
                    this.$route.params.key = true;
                    this.$route.params.env_no = env_no;
                    this.$route.params.name = name;
                    router.go('/environment/environment_details/' + env_no);
                }
            },
            events: {
                'select-checkBox': function (key) {
                    // console.log(this.trSelect);
                    var This = this;
                    if (!this.keyll) return true;
                    this.trList.push(this.data.env_no);
                    if (key && !this.select) {
                        setTimeout(function () {
                            This.trSelect++;
                        }, 0);
                    } else if (!key && this.select) {
                        setTimeout(function () {
                            This.trSelect--;
                            //This.trSelect = 0;
                        }, 0);
                    }
                    this.select = key;
                    return true;
                },
                'env_no': function (env) {
                    if (env == this.data.env_no) {
                        if (this.select != true) {
                            this.trSelect++;
                            this.select = true;
                            this.trList.push(this.data.env_no);
                        }
                        return false;
                    }
                    return true;
                },
                eliminate: function (env_no) {
                    if (this.data.env_no == env_no) {
                        this.trList.splice(this.trList.indexOf(env_no), 1);
                        this.trSelect--;
                        this.select = false;
                    } else {
                        return true;
                    }
                },
                enterPress: function (env_no) {
                    //console.log(env_no);
                }
            }
        }
    }
});

var nameList = {
    研究室: '展厅',
    修复室: '展厅',
    库房: '展厅',
    安防展柜: '展柜',
    存储柜: '展柜',
    室外环境: '楼栋'
};

function recursive(obj, arr) {
    for (var i in obj) {
        var data = obj[i];
        arr.push({name: data.name, env_no: data.env_no});
        if (data.children) {
            recursive(data.children, arr);
        }
    }
}

var checkTime = function (time) {
    var status;
    if (Date.parse(time.start) && Date.parse(time.end)) {
        Date.parse(time.start) <= Date.parse(time.end) ? status = true : status = false;
    }
    return status;
};

var timeStamp = function (time) {
    if (time) {
        return Date.parse(time);
    }
};
var fileterCon = function (env_name) {
    //console.log(env_name+'asdfasdfsadfsafdsa');
};

function unique(arr) {//删除同一数组重复元素
    var tmp = new Array();
    for (var i in arr) {
        if (tmp.indexOf(arr[i]) == -1) {
            tmp.push(arr[i]);
        }
    }
    return tmp;
}

});