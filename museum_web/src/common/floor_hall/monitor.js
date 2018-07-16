//@require $
// @require iview
// @require iview.css
// @require vue
//@require echarts
//@require ./components/envBar/envBar.css

//获取参数单位名称
var param_unit_name = window.web_config.param_unit_name.sensor;

var vm,
    envBar = require('components/envBar/envBar.js');//引入组件
exports.init = function (env_no) {
    window.monitor_box=vm = exports.vm = new Vue({
        el: '#monitor_box',
        data: {
            searchTxt:'',
            chooce:[],
            env_no: env_no,
            normal_total: 0,
            abnormal_total: 0,
            sensor_total: 0,
            poles_list: [],
            env_sensor_total: 0,
            filter_num:-1,
            all_small:[],
            all_micro:[],
            small_env_sensor_list: [],
            micro_env_sensor_list: [],
            unit:'℃',
            condition:[],
            currParam:'',
            contrast:{
                minCol:{
                    max:0,
                    min:0
                },
                maxCol:{
                    max:0,
                    min:0
                },
                SDCol:{
                    max:0,
                    min:0
                },
                rangeCol:{
                    max:0,
                    min:0
                }
            },
            sort:{
                col:'env_name',
                type:true //默认是升序,从小到大
            },
            tableHead:[
                {
                    col:'env_name',
                    cn_name:'环境名称'
                },
                {
                    col:'min',
                    cn_name:'极小值'
                },
                {
                    col:'max',
                    cn_name:'极大值'
                },
                {
                    col:'range',
                    cn_name:'极差值'
                },
                {
                    col:'SD',
                    cn_name:'标准差'
                }
            ],
            selectStandard:[//选择可视化方式按钮
                {
                    col:'min',
                    cn_name:'极小值'
                },
                {
                    col:'max',
                    cn_name:'极大值'
                },
                {
                    col:'range',
                    cn_name:'极差值'
                },
                {
                    col:'SD',
                    cn_name:'标准差'
                }
            ],
            selectBtn:'',
            maxColInterval : 0,//极大值平均间隔
            minColInterval : 0,//极小值平均间隔
            rangeColInterval : 0,//极差值平均间隔
            sdColInterval : 0,//标准差值平均间隔
            datas:{},//所有数据
            temperatureColor:[
                'fill: rgba(173,59,45,1)',
                'fill: rgba(226,85,66,1)',
                'fill: rgba(237,118,102,1)',
                'fill: rgba(236,156,145,1)',
                'fill: rgba(255,224,220,1)',
                'fill: rgba(193,222,242,1)',
                'fill: rgba(136,198,236,1)',
                'fill: rgba(66,155,210,1)',
                'fill: rgba(9,105,166,1)'
            ],
            humidityColor:[
                'fill: rgba(16,78,159,1)',
                'fill: rgba(78,127,190,1)',
                'fill: rgba(98,160,212,1)',
                'fill: rgba(142,207,237,1)',
                'fill: rgba(188,231,246,1)',
                'fill: rgba(249,227,207,1)',
                'fill: rgba(218,184,148,1)',
                'fill: rgba(184,137,104,1)',
                'fill: rgba(161,105,81,1)'
            ],
            visitualIndex:'',//可视化反选标志位
            initColor : [],//热区初始颜色
            temColors:[],
            humColors:[],
            dataIndex:[],
            colorIndex:[],
            interval:[],
            minvalue:[],
            clickEnvTarget:'',//环境选择点击标志位
            clickEnvIndex:'',//环境选择点击反选标志位
            configLanguage: window.languages,
        },
        components:{
            envBar:envBar
        },
        ready:function(){
            sessionStorage.removeItem('temColors');
            sessionStorage.removeItem('humColors');
            sessionStorage.removeItem('dataIndex');
            sessionStorage.removeItem('colorTemIndex');
            sessionStorage.removeItem('colorHumIndex');
        },
        computed:{
            currUnit:function(){
                // if(this.currParam=='temperature'){
                //     return '℃';
                // }else if(this.currParam=='humidity'){
                //     return '%';
                // }else{
                //     return '';
                // }
                return param_unit_name[this.currParam||'temperature'].unit;
            },
            filteredPolesList:function(){
                var sortList = [],
                    me = this;
                _.each(_.omit(this.poles_list,'floor','self'),function(val,key){
                    sortList.push(val);
                });
                if(this.sort.col=='env_name'){
                    if(this.sort.type){
                        sortList.sort(function(a,b){
                            return a.env_no - b.env_no;
                        });
                    }else{
                        sortList.sort(function(a,b){
                            return b.env_no - a.env_no;
                        });
                    }
                }else if(this.sort.col=='range'){
                    if(this.sort.type){
                        sortList.sort(function(a,b){
                            return (a.max-a.min) - (b.max-b.min);
                        });
                    }else{
                        sortList.sort(function(a,b){
                            return (b.max-b.min) - (a.max-a.min);
                        });
                    }
                }else if(this.sort.col){
                    if(this.sort.type){
                        sortList.sort(function(a,b){
                            return a[me.sort.col] - b[me.sort.col];
                        });
                    }else{
                        sortList.sort(function(a,b){
                            return b[me.sort.col] - a[me.sort.col];
                        });
                    }
                }
                return sortList;
            }
        },
        watch:{
            datas:function (val,oval){
                //this.visitualIndex = 'min';
                //this.selectBtnFun('min');
                console.log(window.hall_vm.show_param)
                if(!window.hall_vm.show_param){//当环境场没有开启的时候，此时可视化图例显示
                    if (val.floor.unit === '℃'){
                        $(".color_distinguish .temperatureColor").css("display","block");
                        $(".color_distinguish .humidityColor").css("display","none");
                    }else{
                        $(".color_distinguish .humidityColor").css("display","block");
                        $(".color_distinguish .temperatureColor").css("display","none");
                    }
                }
            }
        },
        methods: {
            intoEnv:function(e,env){
                var allTarget = $('.left_top_box[data-env]');
                if (this.clickEnvTarget !== env){//点击环境之后,移动进入非点击环境之后显示点击环境和当前鼠标所在环境的设备
                    var showTarget1 = $('.left_top_box[data-env='+env+']');
                    var showTarget3 = $('.left_top_box[data-env='+this.clickEnvTarget+']');
                    //隐藏地图上所有点
                    allTarget.hide();
                    //在地图上找到列表中指向环境的点
                    showTarget1.show();
                    showTarget3.show();
                }else {//点击环境之后,移动进入点击环境之后只显示点击环境设备
                    var showTarget2 = $('.left_top_box[data-env='+this.clickEnvTarget+']');
                    allTarget.hide();
                    showTarget2.show();
                }
            },
            leaveEnv:function(e,env){
                if (this.clickEnvTarget !== env){
                    if (this.clickEnvTarget == ''){
                        $('.left_top_box[data-env]').show()
                    }else{
                        var allTarget1 =  $(".left_top_box[data-env="+ env +"]");
                        allTarget1.hide();
                    }
                }
            },
            clickEnv:function(e,env){
                var allTarget = $('.left_top_box[data-env]');
                if(this.clickEnvIndex != env){
                    this.clickEnvTarget = env;//点击显示对应设备位置标志位
                    this.clickEnvIndex = env;
                    var showTarget1 = $('.left_top_box[data-env='+this.clickEnvTarget+']');
                    $("tr[data-env]").css("background","#fff");
                    $("tr[data-env="+ env +"]").css("background","#efefef");
                    allTarget.hide();
                    showTarget1.show();
                }else {
                    $("tr[data-env="+ this.clickEnvTarget +"]").css("background","#ffffff");
                    allTarget.show();
                    this.clickEnvTarget = '';//点击不显示对应设备位置
                    this.clickEnvIndex = '';
                }
            },
            goEnvUrl:function(type,env_no){
                // console.log(type,env_no);
                // http://127.0.0.1/museum_web/dist/capsule/#!/environment/environment_details/62500000010101
                var obj = {name:"环境监控",env_no:env_no,url:'../capsule/#!/environment/environment_details/'+env_no};
                //type取值范围包括:楼栋/楼层/展厅/研究室/安防展柜/展柜/存储柜
                // if(type=='楼栋'){
                //     obj.url=`../cabinet?env_no=${env_no}`;
                // }else if(type=='楼层'){
                //     obj.url=`../floor?env_no=${env_no}`;
                // }else if(type=='展厅'){
                //     obj.url=`../hall?env_no=${env_no}`;
                // }else if(type=='研究室'){
                //     obj.url=`../hall?env_no=${env_no}`;
                // }else if(type=='安防展柜'){
                //     obj.url=`../cabinet?env_no=${env_no}`;
                // }else if(type=='展柜'){
                //     obj.url=`../cabinet?env_no=${env_no}`;
                // }else if(type=='存储柜'){
                //     obj.url=`../cabinet?env_no=${env_no}`;
                // }
                return 'javascript:goPermission('+JSON.stringify(obj)+')';
            },
            goEquipUrl:function(item){
                // http://127.0.0.1/museum_web/dist/capsule/#!/equip/equip_details/6250000000100000092
                var obj = {name:"设备管理",equip_no:item.equip_no,url:'../equipManage/#/equip_info/'+item.equip_no};
                return 'javascript:goPermission('+JSON.stringify(obj)+')';
            },
            changeSortType:function(col){
                if(this.sort.col!=col){//切换列
                    this.sort.col = col;
                    this.sort.type=true;//切换为默认升序
                }else{
                    this.sort.type = !this.sort.type;//不换列,切换排序方式
                }
            },
            check_status:function(status){
            	return status_color[status];
            },
            addChooce:function(type){
            	if(this.searchTxt)this.searchTxt='';
                var condition=this.condition,
                    index=this.condition.indexOf(type);

                if (index!=-1) {
                    condition.splice(index,1);
                }else{
                    this.condition.push(type);
                }
                this.filter();
            },
            removeChooce:function(type){
                this.condition.splice(this.condition.indexOf(name),1);
                this.filter();
            },
            filter:function(){
                var small=this.all_small,
                    micro=this.all_micro,
                    condition=this.condition;
                if(small){
                    var newSmall=small.filter(function(con){
                        var key=true;
                        if (condition.length==0) {return key;}
                        if(condition.indexOf(con.equip_type)==-1){
                            key=false;
                        }
                        return key;
                    });
                }else{
                    newSmall = false;
                }
                if(micro){
                    var newMicro=micro.filter(function(con){
                        var key=true;
                        if (condition.length==0) {return key;}
                        if(condition.indexOf(con.equip_type)==-1){
                            key=false;
                        }
                        return key;
                    });
                }else{
                    newMicro = false;
                }
                this.change(newSmall,newMicro);
            },
            search:function(){
                var small=this.all_small,
                    micro=this.all_micro,
                    searchTxt=this.searchTxt;

                this.condition=[];
                var newSmall=small.filter(function(con){
                    var key=true;
                    if (con.name.search(searchTxt)==-1) {
                        key=false;
                    }
                    return key;
                });

                var newMicro=micro.filter(function(con){
                    var key=true;
                    if (con.name.search(searchTxt)==-1) {
                        key=false;
                    }
                    return key;
                });
                this.change(newSmall,newMicro);
            },
            change:function(newSmall,newMicro){
                this.small_env_sensor_list=newSmall;
                this.micro_env_sensor_list=newMicro;
                var all_len=newSmall.length+newMicro.length;
                if (all_len==this.all_small.length+this.all_micro.length) {
                    this.filter_num=-1;
                }else{
                    this.filter_num=all_len;
                }
            },
            selectHotsPot:function(maxValue,minValue,col){
                var _this = this;
                var Interval = ((maxValue - minValue)/9).toFixed(3);//各个可视化选项极值（大，小）平均间隔
                _.each(this.datas,function(val,key){
                    if (key == 'self' || key == 'floor'){
                        return
                    }
                    if (col == 'min'){//颜色对应排位
                        var bzy = Math.floor((maxValue - parseFloat(val.min))/Interval);
                    }else if (col == 'max'){
                        var bzy = Math.floor((maxValue - parseFloat(val.max))/Interval);
                    }else if (col == 'range'){
                        var bzy = Math.floor((maxValue - parseFloat((val.max-val.min).toFixed(3)))/Interval);
                    }else if (col == 'SD'){
                        var bzy = Math.floor((maxValue - parseFloat(val.SD))/Interval);
                    }
                    var setAttr = "polygon[data-no='"+ key +"']";//找到对应的热区块
                    if (bzy>8){//因为不能被整除，在一定情况下会产生余数，所以当大于8，则按最后一个颜色规定
                        bzy = 8;
                    }
                    if (val.unit=="%"){
                        $(setAttr).attr({
                            "style":_this.humidityColor[bzy],
                            "colorIndex":-(bzy-8),
                            "interval":Interval,
                            "minvalue":minValue,
                            "maxvalue":maxValue
                        });
                        _this.dataIndex.push(key);
                        _this.humColors.push(_this.humidityColor[bzy] + ' ');
                        _this.colorIndex.push(-(bzy-8));
                        _this.interval.push(Interval);
                        _this.minvalue.push(minValue);
                        sessionStorage.setItem('colorindex',_this.colorIndex);
                        sessionStorage.setItem('interval',_this.interval);
                        sessionStorage.setItem('minvalue',_this.minvalue);
                    }else {
                        $(setAttr).attr({
                            "style":_this.temperatureColor[bzy],
                            "colorIndex":-(bzy-8),
                            "interval":Interval,
                            "minvalue":minValue,
                            "maxvalue":maxValue
                        });
                        _this.dataIndex.push(key);
                        _this.temColors.push(_this.temperatureColor[bzy] + ' ');
                        _this.colorIndex.push(-(bzy-8));
                        _this.interval.push(Interval);
                        _this.minvalue.push(minValue);
                        sessionStorage.setItem('colorindex',_this.colorIndex);
                        sessionStorage.setItem('interval',_this.interval);
                        sessionStorage.setItem('minvalue',_this.minvalue);
                    }
                    $(".svg_Area polygon").css({
                        "fill-opacity":1
                    });//可视化时修改透明度

                });
                $("polygon").not("polygon[colorindex]").css("visibility","hidden");
                $.each($("polygon"),function(index,elem){
                    if(elem.style[1]==='visibility'){
                        $(this).css("visibility","hidden")
                    }
                });
                if (this.humColors.length != 0){
                    sessionStorage.setItem("humColors",this.humColors);
                }else if (this.temColors.length != 0){
                    sessionStorage.setItem("temColors",this.temColors);
                }
                sessionStorage.setItem("dataIndex",this.dataIndex);
                _this.dataIndex = [];
            },
            selectBtnFun:function(col){
                var hasData_keshihua = [];
                _.each(this.datas,function(val,key){
                    if (key == 'self' || key == 'floor'){
                        return;
                    }
                    hasData_keshihua.push(key);
                });
                if (hasData_keshihua.length <= 1 && this.selectBtn === ''){
                    this.$Message.warning('可视化展柜数量小于2不能展示!');
                }
                var svg_map_div = $("#svg_map_div");
                var svg_map_length = $("#svg_map").children().length;
                this.colorIndex = [];
                this.interval = [];
                this.minvalue = [];
                sessionStorage.removeItem('temColors');
                sessionStorage.removeItem('humColors');
                sessionStorage.removeItem('colorTemIndex');
                sessionStorage.removeItem('colorHumIndex');
                sessionStorage.removeItem('interval');
                sessionStorage.removeItem('minvalue');
                this.temColors = [];
                this.humColors = [];
                for (var i=0;i<svg_map_length;i++){//保存初始化的热区颜色
                    this.initColor.push($("#svg_map").children().eq(i).attr("style"));
                }
                if (this.visitualIndex != col && hasData_keshihua.length >= 1){
                    this.visitualIndex = col;
                    svg_map_div.css("display","none");
                    $('.color_distinguish').css("display","block");
                    //关闭环境场
                    $('.switch_box ul li').removeClass("selectLi");
                    window.clearTimeout(window.hall_time);//清除定时器，停止播放环境场
                    window.hall_vm.playStatus=false;//播放状态为停止
                    $(".switch_change_box").css("display","none");//开关开启，隐藏进度条
                    window.visualization=true;//可视化图例开启的标志，默认关闭,可视化和环境场默认开启一个
                    window.env_switch=false;//环境场开关关闭
                    window.env_play=false;//环境场图例关闭的标志
                    window.hall_vm.show_param=null;
                    if ($('.switching span.active').attr("data-param") === 'temperature'){//环境场关闭，此时可视化图例开启
                        $(".color_distinguish .temperatureColor").css("display","block");
                        $(".color_distinguish .humidityColor").css("display","none");
                    }else{
                        $(".color_distinguish .humidityColor").css("display","block");
                        $(".color_distinguish .temperatureColor").css("display","none");
                    }
                    $('.play_box').css("display","none");//环境场关闭，隐藏进度条
                    // if(window.hall_vm.myChart){//关闭温湿度场，如果echarts已经存在，则销毁echarts
                        require('hall/hall').env_dispose();
                        // window.hall_vm.dispose();
                    // };

                    var _this = this;
                    $("#svg_map").attr("scrollkey",true);
                    if (col == 'min'){
                        var minCol_min = parseFloat(this.contrast.minCol.min);//极小值最小阈值
                        var minCol_max = parseFloat(this.contrast.minCol.max);//极小值最大阈值
                        this.selectBtn = '极小值';
                        this.selectHotsPot(minCol_max,minCol_min,col);
                    }else if (col == 'max'){
                        var maxCol_min = parseFloat(this.contrast.maxCol.min);//极大值最小阈值
                        var maxCol_max = parseFloat(this.contrast.maxCol.max);//极大值最大阈值
                        this.selectBtn = '极大值';
                        this.selectHotsPot(maxCol_max,maxCol_min,col);
                    }else if (col == 'range'){
                        var rangeCol_min = parseFloat(this.contrast.rangeCol.min);//极差值最小阈值
                        var rangeCol_max = parseFloat(this.contrast.rangeCol.max);//极差值最大阈值
                        this.selectBtn = '极差值';
                        this.selectHotsPot(rangeCol_max,rangeCol_min,col);
                    }else if (col == 'SD'){
                        var SDCol_min = parseFloat(this.contrast.SDCol.min);//标准值最小阈值
                        var SDCol_max = parseFloat(this.contrast.SDCol.max);//标准值最大阈值
                        this.selectBtn = '标准差';
                        this.selectHotsPot(SDCol_max,SDCol_min,col);
                    }
                    if (this.contrast.maxCol.max == this.contrast.minCol.min && this.contrast.minCol.max == this.contrast.minCol.min){//只有一个微环境的情况下
                        this.$Message.warning('请等待加载...');
                    }
                }else{
                    this.visitualIndex = '';
                    this.selectBtn = '';
                    $(".svg_Area polygon").css("fill-opacity","0.5");
                    // $('.color_distinguish').css("display","none");
                    window.visualization=false;//可视化图例开启的标志，默认关闭
                    window.env_play==false?window.hall_vm.showDistinguish=false:"";//可视化关闭，判断环境场是否关闭，如果关闭，则关闭图例

                    $("#svg_map").attr("scrollkey",false);
                    for(var i=0;i<svg_map_length;i++){
                        $("#svg_map").children().eq(i).attr("style",this.initColor[i]);//当反选时候重新初始化热区颜色
                    }
                    svg_map_div.css("display","block");
                    this.initColor = [];
                    $("polygon").not("polygon[colorindex]").css("visibility","visible");
                }
            }
        }
    });

    $.get(API('/env/environments/hall_standards/' + env_no), function (data) {
        gauge_chart(data.rate);
    }, 'json');

    $.get(API('/env/environments/hall_params/' + env_no), function (data) {
        if (data.total == 0) {
            return;
        }
        radar_chart(data);
    }, 'json');

    get_poles('temperature');


    $.get(API('/env/environments/equip_status/' + env_no), function (data) {
        vm.$set('normal_total', data['正常'] * 1);
        vm.$set('abnormal_total', data['异常'] * 1);
        vm.$set('sensor_total', vm.normal_total + vm.abnormal_total);
    }, 'json');

    $.get(API('/env/environments/floor_sensors/' + env_no), function (data) {
        vm.$set('all_small',data.rows.small_env);
        vm.$set('all_micro',data.rows.micro_env);
        vm.$set('env_sensor_total', data.total);
        vm.$set('small_env_sensor_list', data.rows.small_env);
        vm.$set('micro_env_sensor_list', data.rows.micro_env);
        //设备事件
        sensor();
    }, 'json');

    animate();

};

function gauge_chart(rate) {//雷达
    var value=(rate!='-')?'{value}%':'暂无数据';
    var myChart = echarts.init($('#gauge_chart')[0]);
    var option = {
        tooltip: {
            formatter: "{a} <br/>{b} : {c}%"
        },
        series: [
            {
                name: '环境',
                center: ['50%', '55%'],
                radius: '100%',
                type: 'gauge',
                data: [{value: rate, name: '达标率'}],
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
                    formatter: value,
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
    myChart.setOption(option);
    $('#gauge_chart').css('background','none');
}
//以下雷达图未显示
var name_list={
    '温度':'温度',
    '硫化污染物':'含硫',
    '无机污染物':'无机',
    '有机污染物':'有机',
    '二氧化碳':'co2',
    '湿度':'湿度',
    "土壤含水率":"土壤含水率",
    "土壤温度":"土壤温度",
    "土壤电导率":"土壤电导率"
}
function radar_chart(data) {
    var series_data = [], indicator = [];
    
    _.each(data.rows, function (row) {
        series_data.push(row.rate == '-' ? 100 : row.rate);
        indicator.push({text: name_list[row.name], max: row.max});
    });
    var myChart = echarts.init($('#radar_chart')[0]);
    var option = {
        tooltip: {
            trigger: 'item'
        },
        polar: [
            {
                radius: '70%',
                indicator: indicator
            }
        ],
        calculable: true,
        series: [
            {
                name: '达标率',
                type: 'radar',
                data: [
                    {
                        value: series_data,
                        name: '当前区域:'
                    }
                ],
                symbol: 'circle',
                symbolSize: '6',
                itemStyle: {
                    normal: {
                        color: '#627383'
                    }
                },
                areaStyle: {
                    normal: {
                        color: '#53a06c',
                        opacity: 0.3
                    }
                }
            }
        ]
    };
    myChart.setOption(option);
    $('#radar_chart').css('background','none');
}

function getConstrast(data){
    var contrast = {

    },
    minCol=[],//最小值列
    maxCol=[],//极大值列
    SDCol=[],//标准差列
    rangeCol=[],//极差列,
    SDbarMax=[],//极差值柱状
    filtered = _.omit(data,'floor','self');
    var _this = this;
    _.each(filtered,function(val,key){
         //console.log(val,key);//这是一组环境数据
        minCol.push(val.min);
        maxCol.push(val.max);
        rangeCol.push((val.max-val.min).toFixed(2));
        SDCol.push(val.SD);
    });
    //console.log(rangeCol);
    _.each(data,function(val,key){
        SDbarMax.push(val.SD);
    });
    // console.log(minCol,_.max(minCol),_.min(minCol));
    // console.log(maxCol,_.max(maxCol),_.min(maxCol));
    // console.log(SDCol,_.max(SDCol),_.min(SDCol));
    // console.log(rangeCol,_.max(rangeCol),_.min(rangeCol));
    contrast = {
        minCol:{
            max:_.max(minCol.map(function(value){
                return parseFloat(value);
            })),
            min:_.min(minCol.map(function(value){
                return parseFloat(value);
            }))
        },
        maxCol:{
            max:_.max(maxCol.map(function(value){
                return parseFloat(value);
            })),
            min:_.min(maxCol.map(function(value){
                return parseFloat(value);
            }))
        },
        SDCol:{
            max:_.max(SDCol.map(function(value){
                return parseFloat(value);
            })),
            min:_.min(SDCol.map(function(value){
                return parseFloat(value);
            }))
        },
        rangeCol:{
            max:_.max(rangeCol.map(function(value){
                return parseFloat(value);
            })),
            min:_.min(rangeCol.map(function(value){
                return parseFloat(value);
            }))
        },
        SDbarMax:_.max(SDbarMax.map(function(value){
            return parseFloat(value);
        }))
    };
    return contrast;
}

function get_poles(param,time) {
    var key=(time)?time:'',
        me=this;
    $.get(API('/env/environments/floor_poles/' + vm.env_no + '/' + param)+'?time='+key, function (data) {
        //console.log(data);

        if (data == '[]') {
            vm.$set('poles_list', []);
            return;
        }
        if (!data || !data['floor']) {
            vm.$set('poles_list', []);
            return;
        }
        vm.datas = data;
        //console.log(me.datas);
        vm.$set('poles_list', data);
        vm.currParam = param;//切换当前参数
        //console.log(data,param,vm.currParam);
        //获取当前数据中的最大值
        vm.contrast = getConstrast(data);
        vm.unit=data['floor']['unit'];
    }, 'json');
}

function animate() {
    //点击切换小环境或者设备部分的显示
    var nowKey='temperature',
        time='';
    $('.toggle_box .small_area').click(function () {
        $(this).addClass('active').siblings().removeClass('active');
        $('.area_content').slideDown(400).next().slideUp(400);
    });

    $('.toggle_box .equip').click(function () {
        $(this).addClass('active').siblings().removeClass('active');
        $('.equip_content').slideDown(400).prev().slideUp(400);
    });

    $('.switching span').click(function () {
        $(this).addClass('active').siblings().removeClass('active');
        nowKey=$(this).attr('data-param');
        get_poles(nowKey,time);
    });
    
    var $timeLine=$('.timeLine'),
        $now_time=$timeLine.find('.now_time'),
        $time_box=$('.time_wrap .time_box');

    (function(){
        var key=true;
        $now_time.click(function(){
            if (key) {
                $(this).addClass('active');
                $timeLine.animate({'height':80});
            }else{
                $(this).removeClass('active');
                $timeLine.animate({'height':22});
            }
            key=!key;
        });
    })();

    $time_box.find('span').click(function(){
        $now_time.find('span:last-child').html($(this).html());
        $(this).addClass('active').siblings().removeClass('active');
        time=$(this).attr('data-time');
        get_poles(nowKey,time);
    });
}

function sensor(){
    var $sensor_form=$('.equip_content form'),
        $sensor_btn=$sensor_form.children();

    $sensor_btn.find('i').each(function(i){
        var width=(i==0)?200:100;
        $(this).click(function(e){
            $(this).addClass('active').parent().siblings().find('.icon').removeClass('active');
            $(this).parent().animate({width: width + "px"}).siblings().animate({width: "35px"});
            $(this).parent().addClass('flow').siblings().removeClass('flow');
            e.stopPropagation();
        })
    });

    $sensor_btn.find('input').click(function(e){
        e.stopPropagation();
    });

    $(document).click(function(){
        $sensor_btn.find('i').removeClass('active').parent().animate({width: "35px"}).removeClass('flow');
    });

    filter($sensor_btn);
}

function filter($sensor_btn){
    var $filter=$sensor_btn.find('.filter'),
        newArr=[];
    $filter.find('.font').click(function(e){
        e.stopPropagation();
    }).hover(function () {
        $(this).find('ul').stop().addClass('hover').css('display', '')
            .animate({'height': $(this).find('li').size() * 23 + 'px'});
    }, function () {
        $(this).find('ul').stop().removeClass('hover').animate({'height': '0px'}, function () {
            $(this).css('display', 'none');
        });
    });
    if(vm.small_env_sensor_list){
        for(var i=0;i<vm.small_env_sensor_list.length;i++){
            fil(vm.small_env_sensor_list[i].equip_type,newArr);
        }
    }
    if(vm.micro_env_sensor_list){
        for(var i=0;i<vm.micro_env_sensor_list.length;i++){
            fil(vm.micro_env_sensor_list[i].equip_type,newArr);
        }
    }
    vm.chooce=newArr;
}
//筛选种类
function fil(num, array) {
    var a = true;
    for (var i = 0; i < array.length; i++) {
        if (array[i] == num) {
            a = false;
        }
    }
    if (a) {
        array.push(num);
    }
}

var status_color={
	正常:'#0aa699',
	异常:'#ff0000',
	超标:'#EAAE00',
	超低电:'#ff0000',
	低电:'#EAAE00',
	备用:'#00b7ee',
	停用:'#6a707f'
};
