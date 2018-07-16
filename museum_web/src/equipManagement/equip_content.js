// @require css/equip_content.css
// @require $
// @require _
// @require tooltip

require('../common/header');
var router = new VueRouter();
var send_down=require('./components/send_down');
var sortType = function(data){
    var sort = {},
        noOrder = [];
    if(data.sensor&&data.sensor.length!=0){
        sort[0] = [];
        noOrder[0] = [];
    }
    //console.log(data);
};

//获取参数单位名称
var param_unit_name = window.web_config.param_unit_name.sensor;
//获取震动传感器单位名称
var vibration_unit_name = window.web_config.param_unit_name.vibration;

//生成环境树方法
var makeTree = function(data){
    //拷贝原数组
    var treeListCopy = JSON.parse(JSON.stringify(data)),
        result =[];
    //遍历树结构
    if(treeListCopy&&treeListCopy.length!==0){
        treeListCopy.forEach(function(item,index){
            var nodeObj = {
                title:'',
                children:[],
                env_no:''
            };
            nodeObj.title = item.name;
            nodeObj.env_no = item.env_no;
            if(item.children&&item.children.length!==0){
                nodeObj.children = makeTree(item.children);
            }
            result.push(nodeObj);
            nodeObj = null;
        })
    }
    return result;
};

//时间对象转换为时间戳
var timeStamp = function(time){
    if(time){
        return Date.parse(time);
    }
};
var type_24h = false;
var calcTime = function(time,type){
    var year = time.getFullYear(),
        month = time.getMonth()+1,
        day = time.getDate(),
        newDate = time;
    if(type=='today'){
        newDate.setHours(0,0,0);
    }
    else if(type=='24h'){
        type_24h = true;
        newDate.setDate(day-1);
    }
    else if(type=='near3'){
        newDate.setDate(day-2);
        newDate.setHours(0,0,0);
        // newDate.setHours(0,0,0);
    }else if(type=='near7'){
        newDate.setDate(day-6);
        newDate.setHours(0,0,0);
        // newDate.setHours(0,0,0);
    }
    return newDate;
};
module.exports = Vue.extend({
    template: '#equip_template',
    route: {
        activate: function (transition) {
            var params = transition.from.params;
            if (!isEmptyObj(transition.from) && params.equip_id && params.key) {
                var equip_id = params.equip_id;
                var trList = this.trList;
                for (var i = 0, len = trList.length; i < len; i++) {
                    if (trList[i].equip_no == equip_id) {
                        this.trList.splice(i, 1);
                        this.resetTurnPage(this.page);
                        break;
                    }
                }
            }
            if (sessionStorage.contrast_no_list){
                this.$route.params.sel_equip_no_list = sessionStorage.contrast_no_list.split(',');
                router.go('/equipManagement/equip_compare');
            }
            transition.next();
        },
        data: function (transition) {
            var params = transition.from.params;
        }
    },
    data: function () {
        return {
            $shadow: null,			//dom
            trList: [],
            page: 1,
            limit: 0,
            count: 0,
            equip_name: '',
            equip_id: '',
            modifyKey: false,
            addKey: false,
            send_down_key: false,
            sel_equip_no_list: [], //选择设备编号数组
            filterObj:{},
            // showHide: {
            //     status: false,
            //     type: false,
            //     equip: false,
            //     loaction: false,
            //     ID: false
            // },
            equip_no_remove: [],
            filterContent: [],
            environment: [],
            equip_type: [],
            //筛选条件
            // conditions: {
            //     status: [],
            //     equip_type: [],
            //     env_no: []
            // },
            conditions_data: {
                status: [],
                equip_type: [],
                env_no: []
            },
            filter_condition:{

            },
            index: 0,
            select: false,
            arrayEquipNo: [],
            //添加时间控件
            timeArr:[new Date().setHours(0,0,0)-24*60*60*1000,new Date().setHours(0,0,0)-1000],						//显示的时间,默认显示
            timeOldArr:[],
            timeChangeArr:[],
            timeSure:false,//时间标志位,标志是点击确定请求数据还是遮罩层消失
            timePickerOption:{
                shortcuts:[
                    {
                        text:'今天',
                        value:function () {
                            var start,end;
                            // shortTime=true;
                            end = new Date().setHours(23,59,59);
                            start = calcTime(new Date(),'today');//计算今天00:00起始时间
                            return [start,end];
                        }
                    },
                    {
                        text:'24小时',
                        value:function () {
                            var start,end;
                            shortTime=true;
                            end = new Date();
                            start = calcTime(new Date(),'24h');//计算24小时起始时间
                            return [start,end];
                        }
                    },
                    {
                        text:'最近3天',
                        value:function () {
                            var start,end;
                            // shortTime=true;
                            end = new Date().setHours(23,59,59);
                            start = calcTime(new Date(),'near3');//计算3天前00:00起始时间
                            return [start,end];
                        }
                    },
                    {
                        text:'最近7天',
                        value:function () {
                            var start,end;
                            // shortTime=true;
                            end = new Date().setHours(23,59,59);
                            start = calcTime(new Date(),'near7');//计算7天前00:00起始时间
                            return [start,end];
                        }
                    }
                ],
                disabledDate:function(date){//当前时间之后的时间禁用
                    return date && date.valueOf() > Date.now();
                }
            },
            modalStatus:false,
            setTaskName:'',
            loadingNo:1,
            dataTypesFirst : ['a','b','c'],//设备种类(一行)
            dataTypesSecond: [],
            dataTypesSecondEng : [],
            checkedNames : [],
            checkStatusArr : [],
            disabled:false,
            checked:true,
            taskNameArr : [],
            longTime : false,//选择时间超过1年提示信息标志位
            arr: [],
            configLanguage: window.languages,
        }
    },
    created: function () {
        if(!checkPermissions({name:'设备管理'})){
            return;
        }
        this.setLimit(45);
        var This = this;
        $.get(API('/base/envs/tree/'), function (data) {
            // console.log(data);
            This.environment.push({
                type: 'all',
                data: data,
                name: '全部'
            });
            This.filterContent = data;
        });
        // $.get(API('/env/common/equip_type'), function (data) {
        //     // console.log(data);
        //     //读取到的类型列表需要进行一次排序处理
        //     // for(var key in data){
        //     //     sortType(data[key],key);
        //     // }
        //     This.equip_type = data;
        // });
    },
    ready: function () {
        if(!checkPermissions({name:'设备管理'})){
            return;
        }
        var _this = this;
        $('.body').css('height', this.limit * 40 + 60 + 'px');
        $('body').tooltip({key: true});
        this.$shadow = $('.shadow');
        // this.getData();
        this.get_data();
        // console.log(this.trList);
        if (sessionStorage.getItem("save_env_name")) {
            sessionStorage.removeItem("save_env_name");
        }
        $.get(API('/env/equipments/equip_parameters'),function(data){
            //console.log(data);
            _.each(data.sensor,function(elem,index){
                //console.log(elem,index);
                _this.dataTypesSecond.push(elem.name);
                _this.dataTypesSecondEng.push(index);
            });
            _this.dataTypesSecond = unique(_this.dataTypesSecond);
            _this.dataTypesSecondEng = unique(_this.dataTypesSecondEng);
            //console.log(_this.dataTypesSecond,_this.dataTypesSecondEng);
        });
    },
    computed: {
        timeStr:function(){
            return this.timeArr.map(function(time){//时间戳精确单位,后台为s,前端为ms,舍弃前端时间戳后3位
                return Math.floor(time/1000);
            }).join(',');
        },
        allPage: function () {
            return Math.ceil(this.count / this.limit);
        },
        sel_equip_no_count: function () {
            return this.sel_equip_no_list.length;
        }, //选择设备计数
        is_all_sel: function () {
            var num = 0,
                me = this;
            this.trList.forEach(function (val, index) {
                if (me.sel_equip_no_list.indexOf(val.equip_no) != -1) {
                    num++;
                }
            });
            return num == this.trList.length;
        },
        normalTime:function(){
            var singleTime = [],timeA = [];
            _.each(this.timeArr,function(elem){
                singleTime = formatDateTime(String(elem).substring(0,10));
                timeA.push(singleTime);
            });
            return timeA;
        }
    },
    methods: {
        hideOverlay:function(){
            this.$broadcast('hideOverlay');
        },
        goAlertList:function(){
            window.location.href = '../equipManagement/alert_list.html';
        },
        exportData: function () {
            if (this.sel_equip_no_list.length != 0) {
                this.modalStatus = true;
                $(".moren").click();
                var wendu = "温度",shidu="相对湿度"
                if (!$("label[label="+ wendu + "]").attr('key')){
                    $("label[label="+ wendu + "]").click();
                    $("label[label="+ shidu + "]").click();
                    $("label[label="+ wendu + "]").attr('key',true);
                    $("label[label="+ shidu + "]").attr('key',true);
                }
                this.disabled = true;

                this.setTaskName = this.sel_equip_no_list.length + '设备' + '_'+ this.normalTime[0].split(' ')[0] + '--' + this.normalTime[1].split(' ')[0];
            } else {
                this.$Message.error("请勾选设备");
            }
        },
        saveOldTime:function(open){
            if(open){
                this.timeSure = false;
                //拷贝一份原始的时间对象
                this.timeOldArr = JSON.parse(JSON.stringify(this.timeArr));
                this.timeChangeArr = JSON.parse(JSON.stringify(this.timeArr));
            }else{
                if(!this.timeSure){
                    this.timeArr = this.timeOldArr;
                }
            }
        },
        changeTime:function(val){
            var gTime = val.split(' - ');
            var days = datedifference(gTime[0].split(' ')[0],gTime[1].split(' ')[0]);
            this.timeArr = val.split(' - ').map(timeStamp);
            if (days >= 365){
                this.longTime = true;
            }else {
                this.longTime = false;
            }
            this.setTaskName =  this.sel_equip_no_list.length + '设备' + '_'+ this.normalTime[0].split(' ')[0] + '--' + this.normalTime[1].split(' ')[0];
            //是否需要将日期终点设置为23点59分59秒,需要添加一次判断,如果日期未发生变化,则只修改时间;
            var startDate1 = new Date(this.timeArr[0]),
                startDate2 = new Date(this.timeChangeArr[0]),
                endDate1 = new Date(this.timeArr[1]),
                endDate2 = new Date(this.timeChangeArr[1]);
            if(((startDate1.getFullYear()!==startDate2.getFullYear()||endDate1.getFullYear()!==endDate2.getFullYear())||(startDate1.getDate()!==startDate2.getDate()||endDate1.getDate()!==endDate2.getDate())||(startDate1.getMonth()!==startDate2.getMonth()||endDate1.getMonth()!==endDate2.getMonth()))&&!type_24h){//如果不是同年同月同日,并且不是选择24小时
                this.timeArr.$set(1,new Date(this.timeArr[1]).setHours(23,59,59));
            }
            this.timeChangeArr = this.timeArr;
            type_24h = false;
        },
        requireData:function(){
            this.timeSure = true;
        },
        ok:function(){
            var timeArr = [],_this = this;

            var header = require('../common/header').limitLength();
            if (!header){
                this.$Message.warning('最多同时下载5个任务,请稍后...');
                return;
            }

            //将毫秒时间戳转换为秒时间戳
            if(this.timeArr&&this.timeArr.length!=0){
                _.each(this.timeArr,function(val,index){
                    timeArr.push(parseInt(val/1000));
                });
            }
            var time = [],shidu = '相对湿度',arr = ['数据传输时间','设备电压','设备位置'];
            _.each(this.timeArr,function(elem){
                var singleTime = formatDateTime(String(elem).substring(0,10));
                time.push(singleTime.split(' ')[0]);
            });
            var socket=require('common/socket.io');

            if (this.checkStatusArr.length === 0){
                this.$Message.warning('请选择数据种类');
                return;
            }
            //$("label[label="+ shidu + "]").nextAll().attr('class','ivu-checkbox-wrapper');
            //$("label[label="+ shidu + "]").nextAll().find('.ivu-checkbox').attr('class','ivu-checkbox');
            //_.each(arr,function(elem){
            //    $("label[label="+ elem + "]").attr('class','ivu-checkbox-wrapper');
            //    $("label[label="+ elem + "]").find('.ivu-checkbox').attr('class','ivu-checkbox');
            //});

            var msg={
                equip_no: this.sel_equip_no_list.join(','),
                time:timeArr.join(','),
                access_token:window.web_config.token,
                file_name:this.setTaskName,
                param : this.checkStatusArr.join(',')
            };
            console.log(msg)
            var allParam = this.checkStatusArr;
            require('../common/header').change_down(msg);//调用header文件中暴露的change_down方法
            var checkStatusArr_copy = ['equip_time','status','temperature','humidity'];
            //console.log(allParam)
            _.each(allParam,function (elem) {
               if ($.inArray(elem, checkStatusArr_copy) === -1){
                   var _z = chiName[elem];
                   _this.arr.push(_z)
               }
            });
            setTimeout(function(){
                _this.arr = unique(_this.arr);
                _.each(_this.arr,function(elem){
                    $("label[label="+ elem + "]").click();
                });
                setTimeout(function(){
                  _this.arr = [];
                },0)
            },0);
            this.$Message.info('任务:'+ msg.file_name + '下载中');
        },
        socketConnect:function(url){
            var socket = io.connect(url);
            console.log(socket);
        },
        cancel:function(){
            this.resetTime();
            this.modalStatus = false;
        },
        resetTime:function(){
            var me = this;
            this.$nextTick(function(){
                    me.timeArr = [new Date().setHours(0,0,0)-24*60*60*1000,new Date().setHours(0,0,0)-1000];
                }
            );
        },
        cancelItem: function (equip) {
            this.sel_equip_no_list.$remove(equip);
        },
        startCompare: function () {
            // console.log('开始对比');
            if (!this.sel_equip_no_list || this.sel_equip_no_list.length == 0) {
                //alert('请勾选设备!');
                this.$Message.warning('请勾选设备');
            } else if (this.sel_equip_no_list.length > 6) {
                //alert('最多一次勾选6个设备进行对比');
                this.$Message.warning('最多一次勾选6个设备进行对比');
            } else {
                this.$route.params.sel_equip_no_list = this.sel_equip_no_list;
                router.go('/equipManagement/equip_compare');
            }
        },
        setLimit: function (num) {
            this.limit = Math.floor(($(window).height() - 83 - 58 - 35 - 44 - (num || $('.fliter_box').height())) / 40);
        },
        showModify: function () {
            this.modifyKey = true;
        },
        showAddData: function () {
            this.addKey = true;
        },
        addClass: function (e) {
            this.showAddData();
            var element = e.target || e.srcElement;
            $(element).toggleClass('active');
        },
        selectAll: function () {
            var me = this;
            if (this.trList) {
                if (!this.is_all_sel) {//全选
                    if (!this.sel_equip_no_list) {
                        this.sel_equip_no_list = [];
                    }
                    this.trList.forEach(function (val, index) {
                        if (me.sel_equip_no_list.indexOf(val.equip_no) == -1) {
                            me.sel_equip_no_list.push(val.equip_no);
                        }
                    });
                } else {//取消全选
                    this.trList.forEach(function (val, index) {
                        if (me.sel_equip_no_list.indexOf(val.equip_no) != -1) {
                            me.sel_equip_no_list.$remove(val.equip_no)
                        }
                    });
                }
            }
        },
        removeArr: function () {
            if (this.sel_equip_no_list.length == 0) {
                // alert('请选择要删除的设备');
                this.$Message.warning('请选择要删除的设备');
                return;
            }
            var This = this;
            $.post(API('/env/equipments/manage/delete/') + this.sel_equip_no_list.join(','), function (data) {
                // This.select=false;
                This.sel_equip_no_list = [];
                This.resetTurnPage(This.page);
            });
        },
        // statusShow: function (who, e) {
        //     //如果当前设备编号搜索框浮层显示,进入其他表头位置,展开其他浮层,则隐藏搜索框浮层
        //     if(who!=='equip'&&this.showHide['equip']){
        //         this.showHide['equip'] = false;
        //     }
        //     this.showHide[who] = true;
        //     var element = e.target || e.srcElement;
        //     var width = $(element).width();
        //     if (width >= 250) {
        //         $(element).addClass('active').find('.typeList').css('width', '100%').find('.titleName').css('width', '100%');
        //     } else {
        //         $(element).removeClass('active').find('.typeList,.statusList').css('width', 400).find('.titleName').css('width', width);
        //     }
        // },
        // statusAll: function (who) {
        //     this.statusClose(who);
        //     this.statusClose_();
        //     this.getData();
        // },
        // statusClose: function (who) {
        //     this.showHide[who] = false;
        // },
        // statusClose_: function () {
        //     this.equip_id = '';
        //     this.page = 1;
        // },
        turnPage: function () {
            this.get_data(this.filterObj);
        },
        resetTurnPage: function (page) {
            var This = this;
            setTimeout(function () {
                var page = (typeof page == 'number') ? page : '';
                This.page = page || 1;
                This.$broadcast('resetPage', This.page);
            }, 0);
        },
        // removeChooce: function (i, type) {
        //     this.conditions[type].splice(i, 1);
        //     this.conditions_data[type].splice(i, 1);
        //     this.resetTurnPage();
        // },
        // chooce: function (e, type) {
        //     var element = e.target || e.srcElement;
        //     if (element.tagName != 'SPAN') {
        //         return;
        //     }
        //     var html = element.innerHTML;
        //     var preg = /(.*?)</;
        //
        //     if (html.match(preg)) {
        //         var html = html.match(preg)[1];
        //     }
        //     var index = this.conditions[type].indexOf(html);
        //     if (index != -1) {
        //         this.conditions[type].splice(index, 1);
        //         this.conditions_data[type].splice(index, 1);
        //     } else {
        //         this.conditions[type].push(html);
        //         if (type == 'env_no') {
        //             html = element.className;
        //         }
        //         this.conditions_data[type].push(html);
        //     }
        //     this.resetTurnPage();
        // },
        //新的方法调用数据
        get_data:function(filterObj){
            //保存查询对象,翻页时只改变页码
            this.index++;
            var queryObj = {
                index:this.index,
                page:this.page,
                limit:this.limit
            },
            me = this;
            //env_no
            //equip_no
            //status
            //equip_type
            //name
            //id
            this.$shadow.show();

            if(filterObj){
                // console.log(filterObj);
                this.filterObj = filterObj;
                if(filterObj.equip_manage_status&&filterObj.equip_manage_status.length!==0){
                    queryObj.status = filterObj.equip_manage_status.join(',');
                }
                if(filterObj.nodes&&filterObj.nodes.length!==0){
                    queryObj.env_no = filterObj.nodes.join(',');
                }
                if(filterObj.equip_manage_type&&filterObj.equip_manage_type.length!==0){
                    queryObj.equip_type = filterObj.equip_manage_type.join(',');
                }
                if(filterObj.keyword&&filterObj.keyword!=''){
                    queryObj.id = filterObj.keyword;
                }
            }
            $.get(API('/env/equipments/manage/equip_list'),queryObj, function (data) {
                if(me.index!=data.index){
                    return ;
                }
                me.index = 0;
                me.$shadow.hide();
                me.trList = data.rows;
                me.count = data.count;
            });

        },
        // getData: function () {
        //     var This = this;
        //     var key = '?page=' + this.page + '&&limit=' + this.limit;
        //     for (var i in this.conditions_data) {
        //         key += '&&' + i + '=';
        //         for (var k = 0, len = this.conditions_data[i].length; k < len; k++) {
        //             key += this.conditions_data[i][k] + ',';
        //         }
        //         key = key.substring(0, key.length - 1);
        //     }
        //     this.index++;
        //     key += '&&id=' + this.equip_id + '&&index=' + this.index;
        //     this.$shadow.show();
        //     $.get(API('/env/equipments/manage/equip_list') + key, function (data) {
        //         if (data.index != This.index)return;
        //         This.index = 0;
        //         This.$shadow.hide();
        //         This.trList = data.rows;
        //         This.count = data.count;
        //     });
        // },
        // enterTree: function (data, name, type) {
        //     this.filterContent = data;//将树型列表显示的内容替换为子级的内容
        //     this.environment.push({//上方title中添加选择的环境层级
        //         type: type,
        //         data: data,
        //         name: name
        //     });
        // },
        // backTree: function (arr, index) {
        //     if (arr == 'undefined' && index == 'undefined') {
        //         this.filterContent = this.tree;
        //         this.environment.splice(0);
        //         return;
        //     }
        //     //点击标题上的环境层级,跳回该层级,并从选择的环境层级中将其移除
        //     this.filterContent = arr.data;//arr.data为当前层级子级的数据
        //     this.environment.splice(index + 1);
        // },
        equip_no: function (equip_no, select) {
            var index = this.equip_no_remove.indexOf(equip_no);
            if (select) {
                this.arrayEquipNo.push(equip_no);//存储选择的设备
            } else {
                for (var i = 0; i < this.arrayEquipNo.length; i++) {//从数组中删除去掉未选择设备
                    if (this.arrayEquipNo[i] == equip_no) {
                        this.arrayEquipNo.splice(i, 1);
                        break;
                    }
                }
            }
            if (index != -1) {
                this.equip_no_remove.splice(index, 1);
            } else {
                this.equip_no_remove.push(equip_no);
            }
        },
        showTopology: function () {
            router.go('/equipManagement/topology');
        },
        send_down: function () {
            this.send_down_key = true;
        },
        changeEnglish:function(index){
            var key = $.inArray(engName[index],this.checkStatusArr);
            if (key === -1){
                this.checkStatusArr.push(engName[index]);//添加进数组

            }else {
                removeByValue(this.checkStatusArr,engName[index]);
            }
        }
    },
    events: {
        reload_data:function(filterObj){
            //重载筛选条件后,分页回到第一页
            this.page = 1;
            this.get_data(filterObj);
        },
	},
	components:{
		'tr-content':{
			template:'#tr_content',
			props:[
				'tr',//这行的数据
				'index',//index
				'sel_equip_no_list',//选中的设备编号数组
				'sel_equip_no_count',//选中的设备数量
				'page',//当前的页码
				'select_all_list',//全选的页面
				'page_size'//当前的数据条数
			],
			data:function(){
				return {
					select:false,
					keyCorners:true,
                    curr_item_sel:false,
					mapWidth : 0,
                    mapHeight : 0,
                    mapStatus : false,
                    urlPosition : '',
                    // trMapShow : true
				}
			},
			ready:function(){
				var allNav = this.tr.map;
				// if (this.tr.nav == false || this.tr.nav.length == 0||!this.tr.locate||!allNav){//判断设备管理中地图是否显示
				// 	this.trMapShow = false;
				// }
                // console.log(this.tr.map,this.tr.locate);
			},
			created:function(){

            },
            methods: {
                unit: function (name) {
                    if(param_unit_name[name]){
                        return param_unit_name[name].unit;
                    }else if(vibration_unit_name[name]){
                        return vibration_unit_name[name].unit;
                    }else{
                        return ' ';
                    }
                },
                mathLen: function (obj) {
                    var key = 0;
                    for (var i in obj) {
                        key++;
                    }
                    return (key > 2) ? true : false;
                },
                allShow: function (e) {
                    var element = e.target || e.srcElement;
                    if (e.clientY > $(document).height() / 2) {
                        this.keyCorners = false;
                    }
                    $(element).find('.allView').css('display', 'block');
                },
                allHide: function (e) {
                    var element = e.target || e.srcElement;
                    $(element).find('.allView').css('display', 'none');
                },
                selectChange: function (equip_no) {
                    if (!this.sel_equip_no_list) {
                        this.sel_equip_no_list = [];
                    }
                    if (this.sel_equip_no_list.indexOf(equip_no) != -1) {//点击项目已经被选中
                        this.curr_item_sel = false;
                        this.sel_equip_no_list.$remove(equip_no);//反选一个项目
                    } else {
                        this.curr_item_sel = true;
                        this.sel_equip_no_list.push(equip_no);//选中一个项目
					}
					this.select=!this.select;
					this.$dispatch('components-no',equip_no,this.select);
				},
				// nameChange:function(name){
				// 	return nameList[name];
				// },
				statusChange:function(status){
					return statusList[status];
				},
				setName:function(nav){
					var locate='';
					for(var i in nav){
						locate+=nav[i].name+'>';
					}
					return locate.substring(0,locate.length-1);
				},
				rule_out:function(type){
					if(type!='安防传感器'){
						return true;
					}
				},
				broEquip:function(env_no,tr){
				    if(checkPermissions({name:'环境监控'})){
                        var len = tr.nav.length-1;
                        var name = tr.nav[len].name;
                        // sessionStorage.setItem("save_env_name",name);
                        sessionStorage.setItem("save_env_no",env_no);
                        router.go('/environment/environment_details/'+env_no);
                    }
				},
				show_position_nav_map:function(e,locate,trData){//获取地图位置（设备管理）
					var target = e.srcElement|| e.target,
						 trMap = trData.map,
						 locateX,locateY,locateWidth,locateHeight;
					var pageY = e.pageY|| e.clientY + e.scrollY;
					var targetPoint = e.target.parentNode.children[0].children[0].children[0];
					var targetMap = e.target.parentNode.children[0].children[0].children[1];
                    //console.log(e);
					this.mapStatus = true;
					this.urlPosition = trMap;
					locateX = parseFloat(locate.x);
					locateY = parseFloat(locate.y);
					locateWidth = locate.width;
					locateHeight = locate.height;
					if (document.body.scrollHeight - pageY < 230){
						moveMapTop(e.target.parentNode.children[0]);
					}
					dw_nav_map_position(locateX,locateY,targetMap,targetPoint,locateWidth,locateHeight);
				},
				hide_position_nav_map:function(){
					this.mapStatus = false;
				},
				juage:function(){
					var mapLen = this.tr.nav.length- 1,
						trMap = this.tr.nav[mapLen].map;
					if (!trMap){
						this.tr.locate = false;
					}
				},
				saveEquipNo:function(no,type,name){
                    sessionStorage.setItem('equip_type',type);
					sessionStorage.setItem('saveEquipNo',no);
                    this.$route.params.equip_name = name;
                }
			}
		},
		'modify':{
			template:'#modify',
			props:['key','treeData'],
            data:function(){
			    return {
                    localwhich:'请选择安装位置',
                    treeList:[]         //环境树
                }
            },
            ready:function(){
                //根据环境树请求到的树型数据,生成环境树
                this.treeList = makeTree(this.treeData);
            },
			methods:{
				close:function(){
					this.key=false;
					$('.ability').children('div').removeClass('active');
				},
                //环境树切换安装位置节点
                changeLocal:function(local){
                    var node = local[0];
                    this.localwhich = node.title;
                    // this.loaction = false;
                    // this.addData.status = '正常';
                    // this.addData.env_no = node.env_no;
                },
			}
		},
		'add-data':{
			template:'#addData',
			props:['key','treeData'],
			data:function(){
				return {
					addData:{
						equip_type:'温湿度监测终端',//设备类型(必填)
						name:'',				//设备名
						env_no:'',				//环境编号
						id:'',				//设备序号(8位数字)
						status:'备用',				//设备状态
						minute:'',				//设备数据传输间隔--分钟
						second:''				//设备数据传输间隔--秒
					},
					loaction:false,
					environment:[],
					filterContent:[],
					localwhich:'请选择安装位置',
					dataKey:true,		//防止连续点击添加设备
					allEquip:{},			//所有的设备类型
                    treeList:[]         //环境树
				}
			},
			created:function(){
				var This=this;
				$.get(API('/base/envs/tree/'),function(data){
					This.environment.push({
						type:'all',
						data:data,
						name:'全部'
					});
					This.filterContent=data;
				});
				$.get(API('/env/common/all_equip_type'),function(data){
                    // console.log(data);
					delete data['固定离线设备'];
					This.allEquip=data;
				});
			},
			ready:function(){
				this.typeSelect();
                //根据环境树请求到的树型数据,生成
                this.treeList = makeTree(this.treeData);
			},
			methods:{
                //环境树切换安装位置节点
                changeLocal:function(local){
                    // console.log(local);
                    var node = local[0];
                    this.localwhich = node.title;
                    this.loaction = false;
                    this.addData.status = '正常';
                    this.addData.env_no = node.env_no;
                },
				close:function(){
					this.key=false;
					$('.ability').children('div').removeClass('active');
				},
				postOver:function(){
					this.continueOver('true');
				},
				continueOver:function(key){
					var This=this;
					if(!this.dataKey){
						return;
					}
					this.dataKey=false;
					$.post(API('/env/equipments/manage/equip_add'),this.addData,function(data){
					    if(data.error){
                            This.$Message.error(data.error);
                            return;
                        }
						This.dataKey=true;
						if(key=='true')This.close();
						if(data.result){
							This.addData={
								equip_type:'温湿度传感器',				//设备类型(必填)
								name:'',				//设备名
								env_no:'',				//环境编号
								id:'',				//设备序号(8位数字)
								status:'备用',				//设备状态
								minute:'',				//设备数据传输间隔--分钟
								second:''				//设备数据传输间隔--秒
							};
                            This.$Message.success(data.msg);
							// This.localwhich='请选择安装位置';
							This.typeSelect();
                            This.clearTreeSelect();
						}
					});
				},
				//位置选择
				statusShow:function(){
					this.loaction=true;
				},
				statusClose:function(){
					this.loaction=false;
				},
                // chooce:function(e){
					// var element=e.target||e.srcElement;
					// if(element.tagName!='SPAN'){
					// 	return;
					// }
					// var html=element.innerHTML;
					// var preg=/(.*?)</;
                //
                //     if (html.match(preg)) {
                //         var html = html.match(preg)[1];
                //     }
                //     this.localwhich = html;
                //     this.loaction = false;
                //     this.addData.status = '正常';
                //     this.addData.env_no = element.className;
                // },
                enterTree: function (data, name, type) {
                    this.filterContent = data;
                    this.environment.push({
                        type: type,
                        data: data,
                        name: name
                    });
                },
                backTree: function (arr, index) {
                    if (arr == 'undefined' && index == 'undefined') {
                        this.filterContent = this.tree;
                        this.environment.splice(0);
                        return;
                    }
                    this.filterContent = arr.data;
                    this.environment.splice(index + 1);
                },
                typeSelect: function () {										//设备类型变化时改变addData.equip_type
                    var This = this;
                    $.get(API('/env/equipments/manage/code'), {equip_type: this.addData.equip_type}, function (data) {
                        // console.log(data);
                        This.addData.id = (data.code || '') + (data.num || '');
                    })
                },
                clearTreeSelect:function(){
                    var _this = this;
                    this.cycleFun(this.treeList);
                    setTimeout(function(){
                        _this.localwhich = '请选择安装位置';
                    },0);
                },
                cycleFun:function(obj){
                    var _this = this;
                    _.forEach(obj,function(elem){
                        if (elem.title === _this.localwhich){
                            elem.selected = false;
                            return;
                        }
                        if (elem.children){
                            _this.cycleFun(elem.children);
                        }
                    })
                }
            }
        },
        'send-down': send_down.send_down
    }
});


Vue.filter('slice', function (val) {
    var key = 0;
    var obj = {};
    for (var i in val) {
        obj[i] = val[i];
        key++;
        if (key == 2) {
            break;
        }
    }
    return obj;
});
var nameList = {
    //在线传感器
    '温湿度传感器': 'temperature_humidity',
    '带屏温湿度传感器': 'withScreen',
    '光照紫外传感器': 'light_uv',
    '二氧化碳传感器': 'co2',
    '有机挥发物传感器': 'voc',
    '空气质量传感器': 'qcm',
    '震动传感器': 'vibration',
    '玻破传感器': 'broken',
    '室外气象站传感器': 'meteorological',
    '土壤温湿度传感器': 'soil_temperature_and_humidity',
    '甲醛传感器': 'formaldehyde',
    '多维驻波传感器': 'multidimensional_standing_wave',
    '安防传感器': 'security_sensors',
    '智能展柜传感器':'cabinet_sensor',

    //手持式传感器
    '手持式二氧化碳检测仪': 'handheld_co2',
    '手持式有机挥发物检测仪': 'handheld_voc',
    '手持式光照紫外检测仪': 'handheld_light_uv',
    '手持式甲醛检测仪': 'handheld_formaldehyde',
    '手持式温湿度检测仪': 'handheld_temperature_humidity',

    //网络设备
    '网关': 'gateway',
    '中继': 'relay',

    //调控设备
    '调湿机': 'wet_machine',
    '调湿剂': 'wet_agent',
    '吸附剂': 'adsorbent',
    '智能囊匣传感器': 'smart_pouch_box',
    '充氮调湿柜': 'humidity_cabinet',

    broken: '玻破',
    vibration: '震动',
    multi_wave: '驻波'
};

var statusList = {
    '正常': 'normal',
    '异常': 'fault',
    '超标': 'excessive',
    '超低电': 'low_s',
    '低电': 'low',
    '备用': 'standby',
    '停用': 'disable',
};

var engName = {
    "温度": "temperature",
    "相对湿度" : "humidity",
    "有机挥发物":"voc",
    "二氧化碳":"co2",
    "光照":"light",
    "紫外":"uv",
    "有机污染物":"organic",
    "无机污染物":"inorganic",
    "含硫污染物":"sulfur",
    "甲醛":"cascophen",
    "玻璃破碎检测量":"broken",
    "震动检测量":"vibration",
    "多维驻波检测量":"multi_wave",
    "土壤温度":"soil_temperature",
    "土壤含水率":"soil_humidity",
    "土壤电导率":"soil_conductivity",
    "加速度":"accel",
    "速度":"speed",
    "位移":"displacement",
    "土壤含盐量":"soil_salt",

    "数据采集时间":"equip_time",
    "设备状态" : "status",
    "数据传输时间" : "server_time",
    "设备电压" : "voltage",
    "设备位置" : "equip_position"
};
var chiName = {
    "temperature": "温度",
    "humidity" : "相对湿度",
    "voc":"有机挥发物",
    "co2":"二氧化碳",
    "light":"光照",
    "uv":"紫外",
    "organic":"有机污染物",
    "inorganic":"无机污染物",
    "sulfur":"含硫污染物",
    "cascophen":"甲醛",
    "broken":"玻璃破碎检测量",
    "vibration":"震动检测量",
    "multi_wave":"多维驻波检测量",
    "soil_temperature":"土壤温度",
    "soil_humidity":"土壤含水率",
    "soil_conductivity":"土壤电导率",
    "accel":"加速度",
    "speed":"速度",
    "displacement":"位移",
    "soil_salt":"土壤含盐量",

    "equip_time":"数据采集时间",
    "status" : "设备状态",
    "server_time" : "数据传输时间",
    "voltage" : "设备电压",
    "equip_position" : "设备位置"
};
var engTypeName = {

};

function isEmptyObj(obj) {
    for (var i in obj) {
        return false;
    }
    return true;
}

var calc_equip_num = function (list) {
    //console.log(list);
};
function dw_nav_map_position(locateX, locateY, targetMap, targetPoint, locateWidth, locateHeight) {//设备管理中的地图位置调整到可见区域
    targetMap.style.width = locateWidth + 'px';
    targetMap.style.height = locateHeight + 'px';
    if (locateX < 280 && locateY < 180) {
        targetMap.style.top = 10 + 'px';
        targetMap.style.left = 10 + 'px';
        targetPoint.style.top = locateY - 16 + 10 + 'px';
        targetPoint.style.left = locateX - 5 + 10 + 'px';
    } else if (locateX < 280 && locateY >= 180) {
        targetMap.style.top = -(locateY - 100) + 'px';
        targetMap.style.left = 10 + 'px';
        targetPoint.style.top = 100 - 16 + 'px';
        targetPoint.style.left = locateX - 5 + 10 + 'px';
    } else if (locateX >= 280 && locateY < 180) {
        targetMap.style.top = 10 + 'px';
        targetMap.style.left = -(locateX - 150) + 'px';
        targetPoint.style.top = locateY - 16 + 10 + 'px';
        targetPoint.style.left = 150 - 5 + 'px';
    } else if (locateX >= 280 && locateY >= 180) {
        targetMap.style.top = -(locateY - 100) + 'px';
        targetMap.style.left = -(locateX - 150) + 'px';
        targetPoint.style.top = 100 - 16 + 'px';
        targetPoint.style.left = 150 - 5 + 'px';
    }
}
function unique(arr){//删除同一数组重复元素
    var tmp = new Array();
    for(var i in arr){
        if(tmp.indexOf(arr[i])==-1){
            tmp.push(arr[i]);
        }
    }
    return tmp;
}
function removeByValue(arr, val){//删除数组中指定元素
    for(var i=0; i<arr.length; i++){
        if(arr[i] == val) {
            arr.splice(i, 1);
            break;
        }
    }
}
function moveMapTop(moveMapTop) {//设备管理中的地图显示位置调整
    moveMapTop.style.top = 'auto';
    moveMapTop.style.bottom = 40 + 'px';
}
function formatDateTime(timeStamp) {
    var date = new Date();
    date.setTime(timeStamp * 1000);
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
    return y + '-' + m + '-' + d+' '+h+':'+minute+':'+second;
};
function datedifference(sDate1, sDate2) {    //sDate1和sDate2是2006-12-18格式
    var dateSpan,
        tempDate,
        iDays;
    sDate1 = Date.parse(sDate1);
    sDate2 = Date.parse(sDate2);
    dateSpan = sDate2 - sDate1;
    dateSpan = Math.abs(dateSpan);
    iDays = Math.floor(dateSpan / (24 * 3600 * 1000));
    return iDays
};