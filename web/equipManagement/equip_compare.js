define('equipManagement/equip_compare', function(require, exports, module) {
// 

var loadingOption={
    text:'数据加载中,请稍候...',
    color:'#1bbc9b',
    textColor: '#1bbc9b',
    maskColor: 'rgba(255, 255, 255, 0.8)',
    zlevel: 0
};

var param_unit_name = window.web_config.param_unit_name.sensor;

function calcTime(time,type){
    var year = time.getFullYear(),
        month = time.getMonth()+1,
        day = time.getDate(),
        newDate = time;
    if(type=='today'){
        newDate.setHours(0,0,0);
    }
    else if(type=='yesterday'){
        newDate.setDate(day-1);
        newDate.setHours(0,0,0);
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
}

module.exports = Vue.extend({
    route:{
        data:function(transition){
            if(transition.from.params){
                //清除之前的空数据提示信息
                this.noDataEquip=[];
                //清除之前的可选参数信息
                this.paramsList=[];
                var sel_equip_no_list = transition.from.params.sel_equip_no_list;
                this.equip_no_list=[];
                this.sel_equip=[];
                this.filterEquipList=[];
                if(transition.from.params.sel_equip_no_list){
                    //传入的设备列表,拷贝到对比页面
                    for(var i=0,len=sel_equip_no_list.length;i<len;i++){
                        this.equip_no_list.push(sel_equip_no_list[i]);
                        this.sel_equip.push(sel_equip_no_list[i]);
                        this.filterEquipList.push(sel_equip_no_list[i]);
                    }
                }

            }else{
                if (localStorage.getItem('contrast_no_list')){
                    var _list = localStorage.getItem('contrast_no_list') ? localStorage.getItem('contrast_no_list').split(",") : [];
                    this.sel_equip = _list;
                    this.equip_no_list = _list;
                    this.filterEquipList = _list;
                    localStorage.removeItem('contrast_no_list');
                }
            }
            this.getData();
        }
    },
    template:'#equip_compare',
    data:function(){
        return {
            testUrl:'',
            // '6250000000100001487','6250000001000000215','6250000001100000232','6250000001300000062' 测试数据设备列表
            searchKeyword:'',//搜索关键字
            line_data: {},//保存设备对比曲线
            paramsList:[],//参数列表按钮
            sel_params:[],//选中的参数列表
            chartContainer:false,//图表容器
            equip_no_list:[],//传入的设备列表
            sel_equip:[],//保存当前勾选的设备列表
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
                        text:'昨天',
                        value:function () {
                            var start,end;
                            shortTime=true;
                            end = new Date().setHours(0,0,0)-1000;
                            start = calcTime(new Date(),'yesterday');//计算24小时起始时间
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
            index:0, //请求握手标志位
            noDataEquip:[],
            filterEquipList:[]//保存当前关键字筛选出来符合条件的设备编号
        }
    },
    computed:{
        timeStr:function(){
            return this.timeArr.map(function(time){//时间戳精确单位,后台为s,前端为ms,舍弃前端时间戳后3位
                return Math.floor(time/1000);
            }).join(',');
        },
        selParamsData:function(){
            var result = {};
            if(!this.sel_params||this.sel_params.length==0){//当不勾选参数时,返回空数据,页面阻止此类情况的发生
                return result;
            }else{
                if(this.line_data){
                    for(var key in this.line_data){
                        if(this.sel_params.indexOf(key)!=-1){
                            result[key] = this.line_data[key];
                        }
                    }
                }
            }
            return result;
        },
        haveDataEquip:function(){//遍历线条数据
            var haveDataEquip = [];
            if(this.line_data){
                for(var key in this.line_data){
                    for(var k in this.line_data[key]){
                        if(haveDataEquip.indexOf(k)==-1){
                            haveDataEquip.push(k);
                        }
                    }
                }
            }
            return haveDataEquip;
        },
    },
    created:function(){

    },
    ready:function(){
        var me = this;
        calc_main_size();
        $('.shadow').show();
        this.chartContainer = chartContainer();//实例化echarts
        this.chartContainer.on('legendselectchanged', function (params) {//为echarts实例绑定图例开关事件
            if (me.sel_equip.indexOf(params.name)==-1){
                me.sel_equip.push(params.name);
            }else{
                me.sel_equip.$remove(params.name);
            }
        });
    },
    watch:{
        // sel_params:function(val){
        //     var me = this;
        //     if(me.chartContainer&&me.selParamsData&&me.selParamsData!='[]'){
        //         me.chartContainer.setOption(initOption(commonOption,me.selParamsData,me.sel_equip,this.filterEquipList),true);
        //     }
        // },
        searchKeyword:function(keyword){
            var me = this;
            if(keyword){
                this.filterEquipList = [];
                if(this.equip_no_list&&this.equip_no_list.length!=0){
                    this.equip_no_list.forEach(function(val,index){
                        if(val.indexOf(keyword)!=-1){
                            //在每个设备编号中查找关键字
                            me.filterEquipList.push(val);
                        }
                    })
                }
            }else{
                this.filterEquipList = this.equip_no_list;
            }
            //遍历有数据的设备列表,关闭所有图例,如果设备在筛选结果列表中,并且位于选中的列表中,开启其图例
            // console.log(this.filterEquipList,this.haveDataEquip);
            if(this.haveDataEquip){
                this.haveDataEquip.forEach(function(val,index){
                    if(me.chartContainer){
                        me.chartContainer.dispatchAction({
                            type: 'legendUnSelect',
                            name: val
                        });
                        if(me.filterEquipList.indexOf(val)!=-1&&me.sel_equip.indexOf(val)!=-1){
                            me.chartContainer.dispatchAction({
                                type: 'legendSelect',
                                name: val
                            });
                        }
                    }
                });
            }
        }
    },
    methods:{
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
            this.timeArr = val.split(' - ').map(timeStamp);

            //是否需要将日期终点设置为23点59分59秒,需要添加一次判断,如果日期未发生变化,则只修改时间;
            var startDate1 = new Date(this.timeArr[0]),
                startDate2 = new Date(this.timeChangeArr[0]),
                endDate1 = new Date(this.timeArr[1]),
                endDate2 = new Date(this.timeChangeArr[1]);
            if((startDate1.getFullYear()===startDate2.getFullYear()&&endDate1.getFullYear()===endDate2.getFullYear())&&(startDate1.getDate()===startDate2.getDate()&&endDate1.getDate()===endDate2.getDate())&&(startDate1.getMonth()===startDate2.getMonth()&&endDate1.getMonth()===endDate2.getMonth())){//如果同年同月同日

            }else{//并非同年同日
                this.timeArr.$set(1,new Date(this.timeArr[1]).setHours(23,59,59));
            }
            this.timeChangeArr = this.timeArr;
        },
        requireData:function(){
            this.timeSure = true;
            this.chartContainer.showLoading(loadingOption);
            this.getData();
        },
        resetTime:function(){
            var me = this;
            this.$nextTick(function(){
                    me.timeArr = [new Date().setHours(0,0,0)-24*60*60*1000,new Date().setHours(0,0,0)-1000];
                    me.chartContainer.showLoading(loadingOption);
                    me.getData();
                }
            );
        },
        changeSelEquip:function(sel_equip){
            //改变后的设备
            var me = this;
            if(me.chartContainer){
                if(sel_equip&&sel_equip.length!=0){
                    if(me.filterEquipList){
                        me.filterEquipList.forEach(function(val,index){//如果筛选出来的设备,没有被选中
                            if(sel_equip.indexOf(val)==-1){
                                me.chartContainer.dispatchAction({
                                    type: 'legendUnSelect',
                                    name: val
                                })
                            }else{
                                me.chartContainer.dispatchAction({
                                    type: 'legendSelect',
                                    name: val
                                })
                            }
                        });
                    }
                }else{
                    // console.log('空了',sel_equip,this.haveDataEquip);
                    if(this.haveDataEquip&&this.haveDataEquip.length!=0){
                        this.haveDataEquip.forEach(function(val,index){
                            me.chartContainer.dispatchAction({
                                type: 'legendUnSelect',
                                name: val
                            })
                        });
                    }
                }
            }
        },
        changeParams:function(param){//操作选择的参数列表
            if(this.sel_params.indexOf(param)==-1){
                this.sel_params.push(param);
            }else{
                if(this.sel_params.length==1){
                    //alert('至少选择一种参数...');
                    this.$Message.warning('至少选择一种参数...');
                }else{
                    var index = this.sel_params.indexOf(param);
                    this.sel_params.splice(index, 1);
                }
            }
            this.chartContainer.clear();
            this.chartContainer.setOption(initOption(commonOption,this.selParamsData,this.sel_equip,this.filterEquipList),true);
        },
        getData:function(){
            var me = this;
            this.index++;
            if(this.chartContainer){
                //如果已经存在图表实例,则将其清空,以便后续重绘
                this.chartContainer.clear();
            }
            $.get('/2.2.05_P001/base_api/env/equipments/compare/compare_by_equip',{equip_nos:this.equip_no_list.join(','),time:this.timeStr,index:this.index},function(data){
                // console.log(data);
                if(data.error){
                    console.error(data.error);
                    me.$router.go('/equipManagement');
                    return;
                }
                me.line_data = null;
                if(parseFloat(data.index)===me.index){//握手成功,并且数据不为空
                    if(data.data&&data.data.length!==0){
                        me.index = 0;
                        me.line_data = data.data;
                        me.paramsList = initParamsList(me.line_data);
                        me.sel_params = [];
                        if(me.paramsList){
                            me.paramsList.forEach(function(val,index){
                                me.sel_params.push(val.key);//默认参数全部选中
                            });
                        }
                        //将公共配置对象传入方法,准备好配置项
                        // console.log('3');
                        // console.log(initOption(commonOption,me.line_data,me.sel_equip,me.filterEquipList));
                        me.chartContainer.setOption(initOption(commonOption,me.line_data,me.sel_equip,me.filterEquipList),true);
                        me.index=0;
                    }
                }else{
                    // console.log('4');
                    // me.chartContainer.setOption(initOption(commonOption,me.line_data,me.sel_equip,this.filterEquipList),true);
                }
                me.noDataEquip = data.no_data_no;//将无数据数项目打印到页面
                me.chartContainer.hideLoading();
                // me.testUrl = me.chartContainer.getConnectedDataURL({
                    // excludeComponents:['dataZoom']
                // });
                // console.log(me.chartContainer.getDataURL());
            });
        }
    }
});
//计算主面板的高度尺寸
function calc_main_size(){
    var bodyHeight = $('body').height();
    $('section.main').css('height',bodyHeight-50-20+'px');
}
//时间对象转换为时间戳
function timeStamp(time){
    if(time){
        return Date.parse(time);
    }
}

//公共配置对象
var commonOption = {
    animation:false,
    title:{
        text:'设备对比',
        textStyle:{},
        left:'center',
        top:30
    },
    textStyle:{
        fontSize:10
    },
    legend:{},
    backgroundColor:'#f0f0f0',
    series:[], //从数据读取后生成
    xAxis:{
        show:false,
        type:'time',
        boundaryGap:false,
        axisLabel:{
            textStyle: {
                color: "#9fa6ac",
                fontFamily: "微软雅黑"
            }
        }
    },
    grid:{
        bottom:120,
        left:'center',
        top:100,
        width:'60%'
    },
    yAxis: [],
    tooltip: {
        trigger: 'axis',
        formatter: function(params){
            var lessThanTen = function(val){
                var value;
                if(val<10){
                    value = '0'+val;
                }else{
                    value = val;
                }
                return value;
            };
            var formatTime = function(timeStamp){ 
                var date = new Date(timeStamp);
                return date.getFullYear()+'年'+ (date.getMonth()+1) + '月' + date.getDate() + '日' + lessThanTen(date.getHours()) + ':' + lessThanTen(date.getMinutes()) + ':' + lessThanTen(date.getSeconds());
            };
            var tooltipStr = '';
            if(params&&params.length!=0){
                params.forEach(function(val,index){
                    tooltipStr += '<div>' +
                        // '<span style="display: inline-block;width:12px;height:12px;background-color:'+ val.color + ';border-radius: 50%;border:1px solid #fff;position: relative;top:1px;margin-right: 5px;">' +
                        // '</span>' +
                        val.seriesName + '(' + formatTime(val.data[0]) +')' + val.data[2].paramName + ':' + val.data[1] + (val.data[2].paramUnit==='kHz'?'Hz':val.data[2].paramUnit) +
                        '</div>';
                });
            }
            return tooltipStr;
        },
        position:function(point, params,dom){//设置tooltip位置,防止数据展示窗口出界
            var container = document.getElementById('compareCharts'),
                containerWidth  = container.clientWidth,
                containerHeight = container.clientHeight,
                tooltipWidth = dom.clientWidth,
                tooltipHeight = dom.clientHeight,
                x = point[0]+10,
                y = point[1]+10;
            if(x+tooltipWidth>=containerWidth){//右侧超界
                x = point[0] - tooltipWidth - 10;
            }
            if(y+tooltipHeight>=containerHeight){//下侧超界
                y = point[1] - tooltipHeight - 10;
            }
            return [x,y];
        }
    },
    dataZoom: [
        {
            show: true,
            realtime: true,
            xAxisIndex: [0],
            bottom:70
        },
        {
            type: 'inside',
            realtime: true,
            xAxisIndex: [0]
        }
    ]
};
//初始化echarts图表
function chartContainer(){
    return echarts.init(document.getElementById('compareCharts'));
}

//存储参数中文名称,设计颜色,参数单位信息
const params_color = {
    temperature: {color: '#3db38c'},
    humidity: {color: '#2756FF'},
    voc: {color: '#ae9a2e'},
    co2: {color: '#99351f'},
    light: {color: '#ff9000'},
    uv: {color: '#ff5fdb'},
    organic:{color: '#677c0e'},
    inorganic:{color: '#94b046'},
    sulfur:{color: '#b6bf8e'},
    soil_humidity:{color: '#b24d08'},
    soil_temperature:{color: '#b5733c'},
    soil_conductivity :{color: '#8c6239'},
    broken:{color: '#ed1e79'},
    vibration :{color: '#6c3cd9'},
    multi_wave:{color: '#a415ff'},
    soil_salt:{color: '#a415f1'}
};
const symbols = [
    'circle',
    'arrow',
    'pin',
    // 'rect',
    'roundRect',
    'triangle',
    'diamond'
];
//配置环境参数列表
function initParamsList(line_data){
    var paramsList = [];
    if(line_data){
        for(var key in line_data){
            if(paramsList.indexOf(key)==-1){
                paramsList.push({
                    key:key,
                    name:param_unit_name[key].name
                });
            }
        }
    }
    return paramsList;
}
//配置设备标志和图例信息
function initSymbolLegend(line_data,sel_equip,filterEquipList){
    var symbolList = {},
        legend = {
            show:true,
            left:'center',
            bottom:35,
            itemWidth:14,
            tooltip:{
                show:true
            },
            data:[],
            selected:{

            }
        };
    currSymbolIndex = 0;//保存当前图例信息
    if(line_data){
        for(var key in line_data){
            if(line_data[key]){
                for(var k in line_data[key]){
                    if(!symbolList[k]){
                        symbolList[k] = symbols[currSymbolIndex];
                        legend.data.push({
                            name:k,
                            icon:symbols[currSymbolIndex]
                        });
                        legend.selected[k] = (sel_equip.indexOf(k)!=-1)&&(filterEquipList.indexOf(k)!=-1);
                        currSymbolIndex++;
                    }
                }
            }
        }
    }
    return {
        symbolList:symbolList,
        legend:legend
    };
}
//配置图形和坐标轴
function initSeriesYAxis(line_data,symbolList){
    var yAxis = [],
        series = [];
    // console.log(symbolList);
    if(line_data){
        var count=0;
        for (var key in line_data){//每种参数一个轴
            (function(x){
                yAxis.push({
                    type: 'value',
                    name: param_unit_name[x].name + '(' + param_unit_name[x].unit + ')',
                    nameGap:10,
                    nameRotate:45,
                    axisTick: {
                        show: false
                    },
                    axisLabel: {
                        show:true,
                        inside: false,
                        // organic:{name: '有机污染物', color: '#677c0e',unit:'kHz'},
                        // inorganic:{name: '无机污染物', color: '#94b046',unit:'kHz'},
                        // sulfur:{name: '硫化污染物', color: '#b6bf8e',unit:'kHz'},
                        formatter:function(value,index){
                            // console.log(type);
                            if(x=='organic'||x=='inorganic'||x=='sulfur'){
                                return Math.ceil(value/1000);
                            }else{
                                return value;
                            }
                        }
                    },
                    axisLine: {
                        show: true,
                        onZero: true,
                        lineStyle: {
                            color: params_color[x].color
                        }
                    },
                    position: count%2==0?'left':'right',
                    scale:x=='humidity'?false:x=='temperature'?false:true,
                    offset:count==0?0:count==1?0:50*(Math.floor(count/2)),
                });
            })(key);
            if(line_data[key]){
                for(var k in line_data[key]){
                    line_data[key][k].forEach(function(val,index){
                        val.push({
                            paramName:param_unit_name[key].name,
                            paramUnit:param_unit_name[key].unit
                        });
                    });
                    series.push({
                        type:'line',
                        name: k,
                        yAxisIndex: count,
                        showSymbol:false,
                        symbol:symbolList[k],
                        symbolSize:12,
                        lineStyle:{
                            normal:{
                                color:params_color[key].color
                            }
                        },
                        itemStyle:{
                            normal:{
                                color:params_color[key].color,
                                borderColor:'#fff'
                            }
                        },
                        data: line_data[key][k]
                    });
                }
            }
            count++ ;
        }
    }
    return {
        yAxis:yAxis,
        series:series
    }
}
//配置图表选项
function initOption(commonOption,line_data,sel_equip,filterEquipList){
    // console.log(line_data);
    // console.log('期待被执行1次');
    var commonCopy = {};
    if(!line_data){
        commonCopy = {
            title:{
                text:'暂无数据',
                left:'center',
                top:'middle'
            },
            series:[]
        }
    }else{
        for(var key in commonOption){//拷贝公共对象
            commonCopy[key] = commonOption[key];
        }
        var color = [],
            yAxisSeries = {},//多参数多Y轴
            symbolList = [],
            symbolListLegend = {};
        symbolListLegend = initSymbolLegend(line_data,sel_equip,filterEquipList);
        symbolList = symbolListLegend.symbolList;
        yAxisSeries = initSeriesYAxis(line_data,symbolList);
        commonCopy.legend = symbolListLegend.legend;
        commonCopy.yAxis = yAxisSeries.yAxis;
        commonCopy.series = yAxisSeries.series;
    }
    // console.log(commonCopy);
    return commonCopy;
}
});