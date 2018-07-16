define('relic', function(require, exports, module) {
//
//
//

require('common/header');

//获取参数单位名称
var param_unit_name = window.web_config.param_unit_name.sensor;

var calcTime = function(time,type){
    var year = time.getFullYear(),
        month = time.getMonth()+1,
        day = time.getDate(),
        newDate = time;
    if(type==='today'){
        newDate.setHours(0,0,0);
    }
    else if(type==='yesterday'){
        newDate.setDate(day-1);
        newDate.setHours(0,0,0);
    }
    else if(type==='near3'){
        newDate.setDate(day-2);
        newDate.setHours(0,0,0);
        // newDate.setHours(0,0,0);
    }else if(type==='near7'){
        newDate.setDate(day-6);
        newDate.setHours(0,0,0);
        // newDate.setHours(0,0,0);
    }
    return newDate;
};
var timeStamp = function(time){
    if(time){
        return Date.parse(time);
    }
};

var params_color = {
    temperature: {color: '#3db38c'},
    humidity: {color: '#2495ff'},
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
	multi_wave:{color: '#a415ff'}
};

function noDataChart(chart){
    // console.log(1111)
    if(!chart){
        vm.$Message.error('没有找到容器');
        return;
    }
    chart.setOption({
        title:{
            text:'暂无数据',
            left:'center',
            top:'middle'
        },
        series:[]
    },true);
}

require('common/header');
require('common/left');
var router = require('common/router');
var upload = require('common/upload');
var common = require('common/detail/common');
$('#left').find('li').filter('.relic_').addClass('v-link-active');
var relic_no = router.get('relic_no'),
    $relicName=$('#relicName'),
    $star=$relicName.find('.star'),key=false,
    name='';

$.post('/2.2.05_P001/base_api/base/follows',{no:relic_no},function(data){
    if (data.total) {
        $star.addClass('active');
        key=true;
    }
});

var line_option = {
    tooltip: {
        trigger: 'axis',
    },
    legend: {
        show: false
    },
    dataZoom: [
        {
            show: true,
            realtime: true,
            xAxisIndex: [0]
        },
        {
            type: 'inside',
            realtime: true,
            xAxisIndex: [0]
        }
    ],
    grid: {
        left: 80,
        right: 80,
        top: '15%',
        bottom: '15%'
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
    yAxis: {
        type: 'value',
        axisTick: {
            show: false
        },
        axisLabel: {
            show:true,
            inside: false
        },
        min:'dataMin',
        scale:true,
    },
    series: []
};
//单个参数时的配置文件
function one_option(chart,param,data) {
    // console.log(param,data);
    if(!data||data.length===0){
        return;
    }
    if(data.threshold){
        var min=data.threshold.min;
        var max=data.threshold.max;
    }
    var thresholdLine=[];
    min&&thresholdLine.push({yAxis:+min});
    max&&thresholdLine.push({yAxis:+max});

    var unit=data.unit;         //获取单位
    if (!data.max && !data.min && !data.average) {
        data.max = data.value;      //最大值
        data.min = data.value;         //最小值
        data.average = data.value;      //平均值
    }

    if (data.max) {
        data.max = data.max.map(function (val, i) {
            return [val[0],(val[1] - data.min[i][1]).toFixed(2)];       //对最大值进行变化减去最小值,因为减法的不精确，toFixed舍入
        });
    }
    var option = _.clone(line_option);                   //取公共不变化部分

    // option.yAxis.max=data.range.max;
    // option.yAxis.min=data.range.min;

    option.yAxis.name=data.name;                            //对y轴编号
    // console.log(data);
    option.yAxis.axisLine= {                                //Y轴颜色
        lineStyle: {
            color: params_color[param].color
        }
    };
    option.series= [
        {
            showSymbol: false,
            smooth: true,
            name: '最小值',
            type: 'line',
            lineStyle: {normal: {color: '#818d94', opacity: '0'}},
            symbolSize: 6,
            stack: 'tiled',
            data: data.min
        },
        {
            showSymbol: false,
            smooth: true,
            name: '最大值',
            type: 'line',
            lineStyle: {
                normal: {
                    color: '#818d94',
                    opacity: '0'
                }
            },
            areaStyle: {
                normal: {
                    color: '#ccc',
                    opacity: '0.3'
                }
            },
            symbolSize: 6,
            stack: 'tiled',
            data: data.max
        },
        {
            showSymbol: false,
            smooth: true,
            name: '平均值',
            type: 'line',
            lineStyle: {normal: {color: params_color[param].color || '#818d94'}},
            itemStyle: {normal: {color: params_color[param].color || '#818d94'}},
            symbolSize: 6,
            data: data.average,
            markLine: {
                silent: true,
                data: thresholdLine
            }
        }
    ];
    option.tooltip.formatter=function(params){
        var str=data+'<br/>';
        var date = new Date(params[0].value[0]);
        data = date.getFullYear() + '-'
            + (date.getMonth() + 1) + '-'
            + date.getDate() + ' '
            + date.getHours() + ':'
            + date.getMinutes();

        for(var i=0;i<3;i++){
            var vaule=params[i].value[1];
            if(i==1){
                vaule=(Number(params[1].value[1])+Number(params[0].value[1])).toFixed(2);       //还原max真实数据
            }
            str += params[i].seriesName+':'+ vaule+unit+'</br>';
        }
        return str;
    };
    chart.setOption(option,true);
}
//多个参数时的配置文件
//多个参数,Y轴分步存在BUG
function many_option(chart,datas) {
    // console.log(datas,datas.length);
    var key=0,
        unit=[],
        option = _.clone(line_option),
        position='';//记录Y轴位置
    option.series = [];
    option.yAxis=[];
    _.each(datas, function (data,param) {
        if(key%2==0){
            position='left';
        }else{
            position='right';
        }
        if (!data.average) {
            data.average = data.value;
        }
        option.series.push({
            showSymbol: false,
            smooth: true,
            name: data.name,
            type: 'line',
            lineStyle: {normal: {color: params_color[param].color}},
            itemStyle: {normal: {color: params_color[param].color}},
            symbolSize: 6,
            data: data.average,
            yAxisIndex:key
        });
        unit.push(data.unit);
        option.yAxis.push({
            type: 'value',
            name:data.name,
            min:'dataMin',
            axisLine: {
                lineStyle: {
                    color: params_color[param].color
                }
            },
            position:position,
            //计算Y轴间距
            offset: (key==0||key==1)?0:(key%2==0)?(key/2)*70:((key-1)/2)*70,
            splitLine:{show:(key!=0)?false:true}
        });
        key++;
    });
    option.tooltip.formatter=function(params){
        var str='';
        for(var i=0;i<key;i++){
            var date = new Date(params[i].value[0]);
            data = date.getFullYear() + '-'
                + (date.getMonth() + 1) + '-'
                + date.getDate() + ' '
                + date.getHours() + ':'
                + date.getMinutes();
            str += data+'<br/>'
                + params[i].seriesName+':'+ params[i].value[1]+unit[i]+'</br>';
        }
        return str;
    };
    //多Y轴时压缩图形宽度,为坐标轴预留位置
    option.grid.left=70*Math.round(key/2);
    option.grid.right=70*Math.round((key-1)/2);
    chart.setOption(option, true);
}
var gauge_option = {
    tooltip: {
        formatter: "{a} <br/>{b} : {c}%"
    },
    series: [
        {
            name: '环境',
            center: ['50%', '55%'],
            radius: '70%',
            type: 'gauge',
            data: [{value: 0, name: '达标率'}],
            axisTick: {
                show: false
            },
            pointer: {
                width: 4
            },
            axisLine: {
                lineStyle: {
                    width: 10,
                    color: [[0.6, '#e83428'],[0.8, '#0d6fb8'], [1, '#14ae67']]
                    // color: [[0.2, '#14ae67'], [0.8, '#0d6fb8'], [1, '#e83428']]
                }
            },
            splitLine: {
                length: 8
            },
            detail: {
                width: 48,
                height: 17,
                textStyle: {
                    fontSize: 14
                },
                formatter: '{value}%',
                offsetCenter: [0, '23%']
            },
            title: {
                textStyle: {
                    color: '#9fa6ac',
                    fontSize: 12
                }
            }
        }
    ]
};
var radar_option = {
     tooltip: {
        trigger: 'item'
    },
    radar: [
        {
            center: ['50%', '50%'],
            indicator: [],
            axisLine: {
                lineStyle: {
                    width: 2
                }
            },
            radius: 80
        }
    ],
    series: [
        {
            type: 'radar',
            areaStyle: {
                normal: {
                    color: 'green',
                    opacity: '0.3'
                }
            },
            itemStyle: {
                normal: {
                    color: '#72828d'
                }
            },
            data: []
        }
    ]
};

var vm = exports.vm = new Vue({
    el: 'body',
    data: {
        relicView: {
            name: '',
            image: ''
        },
        sensor_list: [],
        control_list: [],
        The_cache_value:'',
        //参数曲线图数据
        paramsLineData:null,
        //左侧复选框选项加载
        paramsList:[],
        //默认选中复选框列表第一项
        checkList:[],
        //微环境监控曲线图
        lineChart:null,
        noneKey:true,
        //同柜文物
        relic_searchTxt:'',
        all_relic:[],
        relic_list:[],
        relic:{
            material:[],
            age:[],
            category:[]
        },
        relic_condition:{
            material:[],
            age:[],
            category:[]
        },
        //同柜设备
        equip_searchTxt:'',
        all_controller:[],
        all_sensor:[],
        controller:[],
        sensor:[],
        equip:{
            controller:[],
            sensor:[]
        },
        equip_condition:{
            controller:[],
            sensor:[]
        },
        /*设置阈值*/
        threshold:{
            old:{},
            now:{}
        },
        thresholdKey:false,
        changeDataState:false,
        thresholdType:'',
        showOff:false,
        titleSS:'',
        requirements:true,
        thresholdLock:1, //标志位,标志文物阈值是否被锁死
        moreImages:[],
        //显示的时间,默认显示
        timeArr:[new Date().setHours(0,0,0)-24*60*60*1000,new Date().setHours(0,0,0)-1000],
        timeOldArr:[],
        timeChangeArr:[],
        //时间标志位,标志是点击确定请求数据还是遮罩层消失
        timeSure:false,
        env_no:'',
        relic_no:'',
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
        deleteRe:false,
        configLanguage: window.languages,
        // age_list:[],
        // category_list:[],
        // material_list:[],
        // level_list:[]
    },
    computed:{
        //处理时间戳,用于向后台发送数据,时间戳精确到毫秒 => 精确到秒
        filterTime:function(){
            var arr = [];
            if(this.timeArr&&this.timeArr.length!=0){
                this.timeArr.forEach(function(time,index) {
                    arr.push(Math.round(time/1000));
                });
            }
            // console.log(arr);
            return arr;
        }                
    },
    created:function(){
        var This=this;
        // this.get_select_option();
        $.get('/2.2.05_P001/base_api/env/common/threshold/'+relic_no+'/relic',function(data){
            if(data.error){
                This.$Message.error(data.error);
                This.requirements=false;
                return;
            }
            if(data[relic_no]){
                var obj={};
                if(data[relic_no].type){
                    This.thresholdType=data[relic_no].type;
                }
                if(data[relic_no].lock||data[relic_no].lock==0){
                    This.thresholdLock=data[relic_no].lock;
                }
                for(var key in data[relic_no]){
                    if(key==='no'||key==='type'||key==='lock'||key==='name'){
                        continue;
                    }
                    obj[key]=data[relic_no][key];
                }
                var strData=JSON.stringify(obj);
                This.oldData=strData;
                This.threshold.old=JSON.parse(strData);
                // console.log('/2.2.05_P001/base_api/env/common/threshold/'+relic_no+'/relic',strData);
                This.threshold.now=JSON.parse(strData);
            }
        });
        $.get('/2.2.05_P001/base_api/relic/relics/images/pic/'+relic_no+'',function(data){
            if(data.error){
                This.$Message.error(data.error);
                return;
            }
            $.each(data,function(index,elem){
                This.moreImages.push(elem.id);
            });
        });
    },
    ready:function(){
        var me = this;
        this.lineChart = echarts.init(document.getElementById('echartsArea'));
        this.gaugeChart = echarts.init(document.getElementById('echartsGauge'));
        this.radarChart = echarts.init(document.getElementById('echartsRadar'));
        $(window).bind('resize', function () {
            if (me.lineChart) {
                me.lineChart.resize();
            }
            if (me.gaugeChart) {
                me.gaugeChart.resize();
            }
            if (me.radarChart) {
                me.radarChart.resize();
            }
        });
    },
    watch:{
        checkList:function(val){
            if(val.length===0){
                // this.$Message.warning('未选中参数');
                noDataChart(this.lineChart);
            }else{
                this.getParamsLinesData(this.env_no,this.relic_no);
            }
        }
    },
    methods: {
        goBack: function(){//返回
            history.go(-1);
        },
        //获取下拉菜单的内容
        get_select_option:function(){
            var me = this;
            $.get('/2.2.05_P001/base_api/relic/relics/count/filter_conditions',function(data){
                if(data){
                    me.age_list = data.age;
                    me.category_list = data.category;
                    me.material_list = data.material;
                    me.level_list = data.level;
                }
            });
        },
        //获取参数与时间是否挂钩?
        getParamsList:function(env_no,relic_no){
            var me = this;
            // console.log(this.env_no,this.relic_no);
            $.get('/2.2.05_P001/base_api/env/environments/cabinet/new_data/'+env_no+'',function(data){
                if(data.error){
                    me.$Message.error(data.error);
                    return;
                }
                var arr = [],
                    check = [];
                for(var key in data){
                    data[key].param = key;
                    arr.push(data[key]);
                }
                if(arr&&arr.length!==0){
                    check.push(arr[0].param);
                }
                me.paramsLineData = data;
                me.paramsList = arr;
                me.checkList = check;
            });
        },
        getParamsLinesData:function(env_no,relic_no){
            var me = this;
            $('#echartsArea').css('background','none');
            if(this.lineChart){
                this.lineChart.showLoading();
            }
            $.get('/2.2.05_P001/base_api/env/environments/cabinet/param_lines/'+env_no+'',{param:this.checkList.join(','),time:this.filterTime.join(','),relic_no:relic_no},function(data){
                if(me.lineChart){
                    me.lineChart.hideLoading();
                }
                if(data.error){
                    me.$Message.error(data.error);
                    return;
                }
                // console.log(data);
                if(!data||data.length==0){
                    me.$Message.warning('获取微环境监控数据为空');
                    noDataChart(me.lineChart);
                }else{
                    var option = {};
                    if(me.checkList&&me.checkList.length!=0){
                        if(me.checkList.length===1){
                            one_option(me.lineChart,me.checkList[0],data[me.checkList[0]]);
                        }else{
                            many_option(me.lineChart,data);
                        }
                    }
                }
            })
            .error(function(){
                me.$Message.error('数据获取异常');
            })
        },
        getStandardData:function(){
            var me = this;
            $('#echartsGauge').css('background','none');
            if(this.gaugeChart){
                this.gaugeChart.showLoading();
            }
            // console.log('请求达标率数据');
            $.get('/2.2.05_P001/base_api/env/environments/cabinet/standard/' + this.env_no,{time:this.filterTime.join(',')},function(data){
                if(me.gaugeChart){
                    me.gaugeChart.hideLoading();
                }
                // console.log(data);
                if(data.error){
                    me.$Message.error(data.error);
                    return ;
                }
                if(data.rate){
                    var copyStandarOption = JSON.parse(JSON.stringify(gauge_option));
                    copyStandarOption.series[0].data=[{
                        value: data.rate, name: '达标率'
                    }]
                    me.gaugeChart.setOption(copyStandarOption);
                }else{
                    noDataChart(me.gaugeChart);
                }
            })
            .error(function(){
                me.$Message.error('数据获取异常');
            })
        },
        getRadarData:function(){
            var me = this;
            $('#echartsRadar').css('background','none');
            if(this.radarChart){
                this.radarChart.showLoading();
            }
            $.get('/2.2.05_P001/base_api/env/environments/cabinet/param_standard/' + this.env_no,{time:this.filterTime.join(',')},function(data){
                // console.log(data);
                if(me.radarChart){
                    me.radarChart.hideLoading();
                }
                if(data.error){
                    me.$Message.error(data.error);
                    return ;
                }
                if(data){
                    // console.log(radar_option);
                    radar_option.radar[0].indicator = (function(){
                        var a=[];
                        for (var i in data) {
                            a.push({text: param_unit_name[i].name, max: 100});
                        }
                        return a;
                    })();
                    var a = [];
                    for (var i in data) {
                        a.push(data[i]);
                    }
                    radar_option.series[0].data = [{value: a, name: '参数达标率 : '}];
                    me.radarChart.setOption(radar_option);
                }else{
                    noDataChart(me.radarChart);
                }
            })
            .error(function(){
                me.$Message.error('数据获取异常');
            })
        },
        getStableData:function(){
            $.get('/2.2.05_P001/base_api/env/environments/cabinet/stable/' + this.env_no+'',{time:this.filterTime.join(',')},function (data) {
                var _lineView = $('.diyLine .lineView');
                var _word = $('.diyLine .word');

                _lineView.find('.temperature span').css('width', 10*data.temperature + '%');
                _lineView.find('.humidity span').css('width', 10*data.humidity + '%');

                _word.find('.temperature').html(data.temperature);
                _word.find('.humidity').html(data.humidity);
            }, 'json');
        },
        getData:function(){
            this.getParamsLinesData(this.env_no,this.relic_no);
            this.getStandardData();
            this.getRadarData();
            this.getStableData();
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
            this.inDetailB = true;
        },
        requireData:function(){
            this.timeSure = true;
            this.getData();
        },
        resetTime:function(){
            var me = this;
            this.$nextTick(function(){
                    me.timeArr = [new Date().setHours(0,0,0)-24*60*60*1000,new Date().setHours(0,0,0)-1000];
                }
            );
        },
        changeLockStatus:function(relic_no){
            var me = this;
            //当前锁定
            if(this.thresholdLock==1){
                $.post('/2.2.05_P001/base_api/env/common/threshold/lock/'+relic_no+'/0',function(data){
                    if(data.result){
                        me.thresholdLock=0;
                        me.$Message.success('解锁阈值');
                    }
                    // console.log(data);
                })
                    .error(function(){
                        me.$Message.error('解锁阈值失败');
                    });
            //当前未锁定
            }else if(this.thresholdLock==0){
                $.post('/2.2.05_P001/base_api/env/common/threshold/lock/'+relic_no+'/1',function(data){
                    if(data.result){
                        me.thresholdLock=1;
                        me.$Message.success('锁定阈值');
                    }
                    // console.log(data);
                })
                    .error(function(){
                        me.$Message.error('锁定阈值失败');
                    });
            }
            // /env/common/threshold/lock/:no/:lock
            // this.$Message.info('编辑阈值'+relic_no);
        },
        goEquipUrl:function(item){
            var obj={name:'设备管理',equip_no:item.equip_no,url:'../equipManage/#/equip_info/'+item.equip_no};
            return 'javascript:goPermission('+JSON.stringify(obj)+')';
        },
        setKeyVal:function(key){
            if (key && key.max && key.unit){
                if (key.name === "温度日波动"){
                    return key.max + ' °C/d';
                }else if (key.name === "相对湿度日波动"){
                    return key.max + ' %/d';
                }else {
                    return key.max + ' ' +key.unit;
                }
            }else{
                return ""
            }
        },
        setKeyValU:function(key){
            if (key && key.unit) {
                return key.unit;
            }
        },
        show:function(e){
            var $thisEle=$(e.target||e.srcElement);
            var $children=$thisEle.prev().children();
            var width=$children.size()*$children.eq(0).outerWidth(true)+48;
            $thisEle.addClass('active').parents('.parent_box').animate({'width':$children.size()?width:'173px'},function(){
                $(this).css('overflow','visible');
            }).siblings().css('overflow','hidden').animate({'width':'35px'}).find('i').removeClass('active');

            document.onclick=function(){
                $('.relic_equip .parent_box').animate({'width':'35px'},function(){
                   $(this).css('overflow','hidden').find('i').removeClass('active');
                });
            };
        },
        addChooce:function(type,name){
            var type,typeName='relic';
            if(this.relic_condition[type]){
                type=this.relic_condition[type];
                this.relic_searchTxt='';
            }else{
                type=this.equip_condition[type];
                typeName='equip';
                this.equip_searchTxt='';
            }
            var index=type.indexOf(name);
            if(index==-1){
                type.push(name);
            }else{
                type.splice(index,1);
            }
            this.filter(typeName);
        },
        removeChooce:function(type,name){
            var type,typeName='relic';
            if(this.relic_condition[type]){
                type=this.relic_condition[type];
            }else{
                type=this.equip_condition[type];
                typeName='equip';
            }
            type.splice(type.indexOf(name),1);
            this.filter(typeName);
        },
        filter:function(typeName){
            if(typeName=='relic'){
                var arr=this.all_relic,
                    condition=this.relic_condition;

                this.relic_list=arr.filter(function(con,i){
                    var key=true;
                    for(var i in condition){
                        if(condition[i].length==0){continue;}
                        if(condition[i].indexOf(con[i])==-1){
                            key=false;
                        }
                    }
                    return key;
                });
            }else{
                var controller=this.all_controller,
                    sensor=this.all_sensor,
                    condition=this.equip_condition;

                this.controller=controller.filter(function(con){
                    var key=true;
                    for(var i in condition){
                        if(condition[i].length==0){continue;}
                        if(condition[i].indexOf(con.equip_type)==-1){
                            key=false;
                        }
                    }
                    return key;
                });

                this.sensor=sensor.filter(function(con){
                    var key=true;
                    for(var i in condition){
                        if(condition[i].length==0){continue;}
                        if(condition[i].indexOf(con.equip_type)==-1){
                            key=false;
                        }
                    }
                    return key;
                });
            }
        },
        search:function(type){
            if(type=='relic'){
                var arr=this.all_relic,
                    condition=this.relic_condition,
                    searchTxt=this.relic_searchTxt;

                for(var i in condition){
                    condition[i]=[];
                }
                this.relic_list=arr.filter(function(con){
                    var key=true;
                    if (con.name.search(searchTxt)==-1) {
                        key=false;
                    }
                    return key;
                });
            }else{
                var controller=this.all_controller,
                    sensor=this.all_sensor,
                    condition=this.equip_condition;
                    searchTxt=this.equip_searchTxt;

                for(var i in condition){
                    condition[i]=[];
                }

                this.controller=controller.filter(function(con){
                    var key=true;
                    if(con.name.search(searchTxt)==-1){
                        key=false;
                    }
                    return key;
                });

                this.sensor=sensor.filter(function(con){
                    var key=true;
                    if(con.name.search(searchTxt)==-1){
                        key=false;
                    }
                    return key;
                });
            }
        },
        stateChange:function(e){
            if(this.thresholdLock==1){
                this.$Message.error('文物阈值锁定');
                return;
            }
            var element=e.target||e.srcElement;
            if($(element).hasClass('showOff')){
                return;
            }
            if(this.thresholdKey){
                this.stateOK();
            }else{
                this.stateOff();
            }
            this.thresholdKey=!this.thresholdKey;
        },
        stateOK:function(){
            this.changeDataState=false;
            var obj={};
            obj.no=relic_no;
            obj.type=this.thresholdType;
            for(var param in this.threshold.now){
                for(var k in this.threshold.now[param]){
                    if(k=='name'||k=='unit'){
                        continue;
                    }
                    var str='';
                    if(param=='humidity_range'||param=='total_light'||param=='temperature_range'){
                        str=param;
                    }else{
                        str=param+'_'+k;
                    }
                    var key=this.threshold.now[param][k];
                    var num=(key=='')?'':Number(key).toFixed(2);
                    this.threshold.now[param][k]=num;
                    obj[str]=num;
                }
            }
            this.postNewData(obj);
        },
        stateOff:function(){
            this.changeDataState=true;
            this.threshold.now=JSON.parse(this.oldData);
        },
        postNewData:function(obj){
            // console.log(obj);
            var This=this;
            $.post('/2.2.05_P001/base_api/env/common/threshold/add_edit',obj,function(data){
                if(!data.result){
                    This.threshold.now=This.threshold.old=JSON.parse(This.oldData);
                    This.$Message.error(data.msg);
                    return;
                }
                This.oldData=JSON.stringify(This.threshold.now);
                This.threshold.old=JSON.parse(This.oldData);
                This.$Message.success(data.msg);
            })
            .error(function(){
                This.$Message.error('阈值修改失败!');
            });
        },
        changeData:function(min,max,name){
            var This=this;
            setTimeout(function(){
                var min=This.threshold.now[name].min,
                    max=This.threshold.now[name].max;
                var isTH=This.isTH(name);
                if(!isTH){
                    min=Number(min)||0;
                }
                max=Number(max);
                if(isNaN(min)||isNaN(max)){
                    This.showOff=true;
                    This.titleSS='不能填写非数字';
                    return;
                }
                if(isTH){
                    min=Number(min)||0;
                }

                if(name=='temperature'||name=='humidity'){
	                if(min>=max){
	                    This.showOff=true;
	                    This.titleSS='最小值不能大于最大值';
	                    return;
	                }
                    if(min<0||min>=100||max<0||max>=100){
                        This.showOff=true;
                        This.titleSS='阈值区间为0到100';
                        return;
                    }
                }
                if(max<0){
                	This.showOff=true;
                    This.titleSS='不能填写负数';
                    return;
                }
                This.showOff=false;
            },0);
        },
        close:function(){
            this.changeDataState=false;
            this.showOff=false;
            this.threshold.old=JSON.parse(this.oldData);
            this.thresholdKey=!this.thresholdKey;
        },
        isTH:function(name){
            if(name=='temperature'||name=='humidity') return true;
        },
        changeDisplay:function(e){
            var element=e.target||e.srcElement;
            if(element.className!='modify'){
                return;
            }
            $element=$(element);
            var $input=$element.parent().parent().find('.change');
            $input.css('display','block').focus();

            this.noneKey=false;
            this.The_cache_value=$input.val();
        },  
        resetName:function(type,e){
            this.noneKey=true;
            var element=e.target||e.srcElement,This=this;
            if(this.relicView[type]===this.The_cache_value){
                element.style.display='none';
                return;
            }
            if(this.relicView[type]==''){
                // alert('填写不能为空');
                This.$Message.error('填写不能为空');
                element.style.display='none';
                This.relicView[type]=This.The_cache_value;
                return;
            }
            $.post('/2.2.05_P001/base_api/relic/relics/manage/edit',this.relicView,function(data){
                if(data.error){
                    This.$Message.error(data.error);
                    return;
                }
                if(!data.result){
                    This.relicView[type]=This.The_cache_value;
                    if(data.msg){
                        This.$Message.error(data.msg);
                    }
                }
                This.The_cache_value='';
                element.style.display='none';
                This.$Message.info(data.msg);
                //如果改变了文物名称,更新面包屑导航,更新页面title
                if(type==='name'){
                    $('#nav>dl>dd:last-child').html(This.relicView.name);
                    document.title = This.relicView.name;
                } 
            });
            // console.log(this.env_no);
        },
        upload_layout:function(){//上传图片
            var _this = this;
            upload({
                data: {
                    path: 'relic',
                },
                accept: 'image/jpg,image/jpeg,image/png',
                success: function (data) {
                    console.log(data.url,data);
                    if (data.error) {
                        _this.$Message.error('更换失败');
                        return;
                    }
                    _this.relicView.image = data.url;
                    _this.changeRelicImage(data);
                },
                error: function (data) {
                    _this.$Message.error('更换失败');
                }
            });
        },
        changeRelicImage:function(data){//更换图片
            var _this = this;
            if(this.moreImages.length > 0){
                $.each(this.moreImages,function(index,elem){
                    $.post('/2.2.05_P001/base_api/relic/relics/images/pic_del/'+elem+'',function(data){
                        console.log(data);
                    })
                })
            }
            setTimeout(function(){
                $.post('/2.2.05_P001/base_api/relic/relics/images/pic/'+relic_no+'',{url:data.url},function(data){
					console.log(data);
                    _this.$Message.success('更换成功!');
                })
            },0);
        },
        deleteRelic:function(){//删除当前文物
            var _this = this;
            this.$Modal.confirm({
                title: '删除文物',
                content: '<p>是否删除当前文物</p>',
                onOk: function() {
                    $.post('/2.2.05_P001/base_api/relic/relics/relics/delete/'+ relic_no+'',function(data){
                        sessionStorage.setItem('deleteRelicNo',relic_no);
                        window.location.href= '../capsule/#!/relic';
                        _this.$Message.success('删除成功!');
                    });
                },
                onCancel: function()  {

                }
            });
        },
        deleteRelicOk:function(){

        }
    }
});

var common = require('common/detail/common');
// console.log(common);
$relicName.click(function(){
    if (key) {
        $.post('/2.2.05_P001/base_api/base/follows/delete/',{no:relic_no},function(data){
            if (data.msg!="删除成功") {
                // console.error(data.error);
                vm.$Message.error(data.error);
                return;
            }
            $star.removeClass('active');
        });
    }else{
        $.post('/2.2.05_P001/base_api/base/follows/add',{name: name, no: relic_no,type:'relic'},function(data){
            if (data.msg!="添加成功!") {
                // console.error(data.error);
                vm.$Message.error(data.error);
                return;
            }
            $star.addClass('active');
        });
    }
    key=!key;
});
$.get('/2.2.05_P001/base_api/relic/relics/relic_overview/' + relic_no+'', function (data) {
    if(data.error){
        vm.$Message.error(data.error);
        return;
    }

    name=data.name;
    vm.$set('relicView', data);
    document.title = name||'' + '-' + document.title;
    var parent_env_no = data.parent_env_no,
        relic_no = data.relic_no;
    vm.$set('env_no', data.parent_env_no);
    vm.$set('relic_no', data.relic_no);
    if (parent_env_no != '') {
        require('common/nav/nav').init(parent_env_no, '../', function ($dl) {
            $dl.append('<dd>' + name + '</dd>');
        });

        common.equip_relic(parent_env_no,vm);//同柜文物
        common.cabinet_position_image(parent_env_no,vm);//展柜位置图
        common.cabinet_show_image(parent_env_no,vm);//展柜内部位置图
        
        // 以下方法调用common中的请求弃用
        // common.chart_new_data(parent_env_no,undefined,vm);//微环境监控
        // common.echarts_gauge_radar(parent_env_no,vm);//微环境监控-仪表盘和雷达图
        
        vm.getParamsList(parent_env_no,relic_no);
        vm.getStandardData();
        vm.getRadarData();
        vm.getStableData();
        //监测设备-start
        $.get("/2.2.05_P001/base_api/env/environments/cabinet/equip_lists/" + parent_env_no + "/sensor", function (data) {
            vm.$set('sensor_list', data.rows);
        });

        //调控设备-start
        $.get("/2.2.05_P001/base_api/env/environments/cabinet/equip_lists/" + parent_env_no + "/controller", function (data) {
            vm.$set('control_list', data.rows);
        }, 'json');
    }

    //文物名称
    $('#relic_name').text(data.name);
}, 'json');

});