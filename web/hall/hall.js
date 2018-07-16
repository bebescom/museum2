define('hall', function(require, exports, module) {
//

//
//
//
//

var header = require('common/header');
require('common/left');
var router = require('common/router');

$('#left').find('li').filter('.integrated').addClass('v-link-active');

var env_no = router.get('env_no');
var cut=true;
require('common/nav/nav').init(env_no);
//温度颜色条交互

var myEnvChart="";//环境场echarts
var field_data="";//保存环境场数据
var oldTime=[];//保存当天默认时间
var newTime=[];//保存更改后的时间

var colorT = $(".temperatureColor div");
$(".tooltip_fox").text("").css("display","none");//初始隐藏tooltip
colorT.mouseover(function(e){
    console.log(window.env_play,window.visualization);
    if(window.visualization){//可视化开关开启
        var indexT = $(this).eq(0).attr("index");
        var setAttrT = "polygon[colorindex='"+ indexT +"']";
        $("#svg_map polygon").css("display","none");
        $(setAttrT).css("display","block");
        var intervalT = parseFloat($("#svg_map polygon[interval]").eq(0).attr("interval"));
        var minvalueT = parseFloat($("#svg_map polygon[minvalue]").eq(0).attr("minvalue"));
        var maxvalueT = parseFloat($("#svg_map polygon[maxvalue]").eq(0).attr("maxvalue"));
        var startvalueT = minvalueT + intervalT*indexT;
        var lastvalueT = minvalueT + intervalT*indexT+intervalT;
        if (intervalT === 8){
            lastvalueT = maxvalueT;
        }
        var tooltipIndexT = -(indexT-8);

        //$(".tooltip_fox").text(startvalueT.toFixed(3) + "~" + lastvalueT.toFixed(3)).css("top",tooltipIndexT*20+"px");
        $(".tooltip_fox").text(keepTwoDecimalFull(startvalueT)+"℃"+ "~" + keepTwoDecimalFull(lastvalueT)+"℃").css("top",tooltipIndexT*20+"px");
    }else if(window.env_play){//环境场开启
        var indexT = $(this).eq(0).attr("index");
        var setAttrT = "polygon[colorindex='"+ indexT +"']";
        $("#svg_map polygon").css("display","none");
        $(setAttrT).css("display","block");
        if(vm.loadComplete){//当数据加载完成时
            var intervalT=(field_data['max_' + vm.show_param]-field_data['min_' + vm.show_param])/9;//算出递增的值
            var startvalueT=field_data['min_' + vm.show_param]+intervalT*indexT;//9个图例的值，依次从下往上递增
            var lastvalueT=field_data['min_' + vm.show_param]+intervalT*indexT+intervalT;
            vm.show_param=="humidity"?startvalueT=Number(startvalueT).toFixed(0):startvalueT=Number(startvalueT).toFixed(1);
            vm.show_param=="humidity"?lastvalueT=Number(lastvalueT).toFixed(0):lastvalueT=Number(lastvalueT).toFixed(1);
            if(intervalT === 8){
                lastvalueT = field_data['max_' + vm.show_param];
            }
            var tooltipIndexT = -(indexT-8);
            $(".tooltip_fox").text(startvalueT+"℃"+ "~" + lastvalueT+"℃").css("top",tooltipIndexT*20+"px");
        }
    }
});
//湿度颜色条交互
var colorH = $(".humidityColor div");
colorH.mouseover(function(e){
    if(window.visualization) {//可视化图例开关开启
        var indexH = $(this).eq(0).attr("index");
        var setAttrH = "polygon[colorindex='" + indexH + "']";
        $("#svg_map polygon").css("display", "none");
        $(setAttrH).css("display", "block");
        var intervalH = parseFloat($("#svg_map polygon[interval]").eq(0).attr("interval"));
        var minvalueH = parseFloat($("#svg_map polygon[minvalue]").eq(0).attr("minvalue"));
        var maxvalueH = parseFloat($("#svg_map polygon[maxvalue]").eq(0).attr("maxvalue"));
        var startvalueH = minvalueH + intervalH * indexH;
        var lastvalueH = minvalueH + intervalH * indexH + intervalH;
        if (intervalH === 8) {
            lastvalueH = maxvalueH;
        }
        var tooltipIndexH = -(indexH - 8);
        //$(".tooltip_fox").text(startvalueH.toFixed(3) + "~" + lastvalueH.toFixed(3)).css("top",tooltipIndexH*20+"px");
        $(".tooltip_fox").text(keepTwoDecimalFull(startvalueH)+"%" + "~" + keepTwoDecimalFull(lastvalueH)+"%").css("top", tooltipIndexH * 20 + "px");
    }else if(window.env_play&&window.env_switch){//环境场图例开启,并且环境场开启
        var indexH = $(this).eq(0).attr("index");
        var setAttrH = "polygon[colorindex='"+ indexH +"']";
        $("#svg_map polygon").css("display","none");
        $(setAttrH).css("display","block");
        if(vm.loadComplete){//当数据加载完成时
            var intervalH=(field_data['max_' + vm.show_param]-field_data['min_' + vm.show_param])/9;//算出递增的值
            var startvalueH=field_data['min_' + vm.show_param]+intervalH*indexH;//9个图例的值，依次从下往上递增
            var lastvalueH=field_data['min_' + vm.show_param]+intervalH*indexH+intervalH;
            vm.show_param=="humidity"?startvalueH=Number(startvalueH).toFixed(0):startvalueH=Number(startvalueH).toFixed(1);
            vm.show_param=="humidity"?lastvalueH=Number(lastvalueH).toFixed(0):lastvalueH=Number(lastvalueH).toFixed(1);
            if(intervalH === 8){
                lastvalueH = field_data['max_' + vm.show_param];
            }
            var tooltipIndexH = -(indexH-8);
            $(".tooltip_fox").text(startvalueH +"%"+ "~" + lastvalueH+"%").css("top",tooltipIndexH*20+"px");
        }
    }
});
colorH.mouseout(function(e){
    $("#svg_map polygon").css("display","block");
});
$(".color_distinguish").mouseover(function(e){
    $(".tooltip_fox").css("display","block");
});
$(".color_distinguish").mouseout(function(e){
    $(".tooltip_fox").text("").css("display","none");
    $("#svg_map polygon").css("display","block");
});
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
var $img_box=$('.img_box'),
    $map_view=$('.map_view'),
    oldWidth;
var vr = new VueRouter();
var vm = window.hall_vm=exports.vm = new Vue({
    el: '.map_view_mask',
    data: {
        hall: {
            name: '',
            image: ''
        },
        sensor_list: [],
        control_list: [],
        lin:true,
        showHotspot:true,
        showDistinguish:false,//图例开启的标志
        temperatureColor:[
            'rgba(173,59,45,1)',
            'rgba(226,85,66,1)',
            'rgba(237,118,102,1)',
            'rgba(236,156,145,1)',
            'rgba(255,224,220,1)',
            'rgba(193,222,242,1)',
            'rgba(136,198,236,1)',
            'rgba(66,155,210,1)',
            'rgba(9,105,166,1)'
        ],
        humidityColor:[
            'rgba(16,78,159,1)',
            'rgba(78,127,190,1)',
            'rgba(98,160,212,1)',
            'rgba(142,207,237,1)',
            'rgba(188,231,246,1)',
            'rgba(249,227,207,1)',
            'rgba(218,184,148,1)',
            'rgba(184,137,104,1)',
            'rgba(161,105,81,1)'
        ],
        contrastModal:false,
        sliderValue:0,//滑块的当前值
        playStatus:false,//播放控件的初始状态
        map_view_options: {
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
        map_view_data:[new Date().setHours(0, 0, 0), new Date().setHours(23, 59, 59)],//日期组件的日期
        // oldTime:[],//保存当天默认时间
        // newTime:[],//保存更改后的时间
        loadComplete:false,//数据加载状态，默认为加载
        // myChart:'',
        // field_data:'',//返回的环境场数据
        // dot_size:20,//点精度
        // play_time:100,//播放延迟时间
        show_param:'',//显示的场
        click_param:"",//点击选择的环境场
        time_data:[],//时间数组
        time_index:0,//默认最后一个时间
        //maxLength:0//滑块的最大长度

    },
    ready:function(){
        window.env_play=false;//环境场图例开启的标志
        window.visualization=false;//可视化开启的标志，默认关闭

    },
    methods: {
        key:function(){
            var imgBoxHeight=$img_box.height(),
                mapViewHeight=$map_view.height();
            //如果图片容器高度超出父级容器高度
            if (imgBoxHeight>mapViewHeight) {
                var beyond=imgBoxHeight-mapViewHeight;//将超出高度进行百分比缩放
                oldWidth=(1-beyond/imgBoxHeight)*100;
            }else{
                oldWidth=100;
            }
            $img_box.css('width',oldWidth+'%').css({'margin-top':-($img_box.height()/2),'margin-left':-($img_box.width()/2)});
            $img_box.find('img').css('opacity',1);
            $map_view.css('background','none');
        },
        //ok :function() {
        //    this.$Message.info('点击了确定');
        //},
        //cancel:function () {
        //    this.$Message.info('点击了取消');
        //},
        startTime:function () {//回到起始时刻
            if(!this.loadComplete){//数据没有加载完，禁止操作
                return false;
            }
            if(this.playStatus){//点击起始时刻按钮，如果此时状态为播放，则暂停环境场播放，并清除定时器
                this.playStatus=false;
                window.clearTimeout(window.hall_time);
            }
            this.time_index=0;
            hall_env_init();
        },
        endTime:function () {//终止时刻
            if(!this.loadComplete){//数据没有加载完，禁止操作
                return false;
            }
            if(this.playStatus){//点击终止时刻按钮，如果此时状态为播放，则暂停环境场播放，并清除定时器
                this.playStatus=false;
                window.clearTimeout(window.hall_time);
            }
            console.log(this.time_data.length-1)
            this.time_index=this.time_data.length-1;
            hall_env_init();
        },
        playPause:function () {//暂停或播放
            var This=this;
            if(!This.loadComplete){//当没有数据或者数据为0时，不播放
                return false;
            }
            if(This.time_index==This.time_data.length-1){//播放时判断进度条的位置，如果播放完毕，再次播放进度条初始化
                This.time_index=0;
            }
            This.playStatus=!This.playStatus;//点击播放按钮，切换播放状态

            if(This.playStatus){
               play();
            }else{//当计数器存在，且状态切换为暂停时，清除定时器
                window.clearTimeout(window.hall_time);
            }
        },
        changeEndTime:function(open){
            var This=this;
            if(open){/**打开时间控件时，记录当前时间作为旧的时间，当时间发生改变时，如果年月日未变，时分改变，不改变结束时间，如果年月日改变，则代表重新选择时间，需要改变控件默认结束值**/
                oldTime.push(new Date(this.map_view_data[0]).toLocaleDateString());//转化日期部分
                oldTime.push(new Date(this.map_view_data[1]).toLocaleDateString());
            }else{//日期控件关闭
                if(this.playStatus){//改变时间时，如果此时状态为播放，则暂停环境场播放，并清除定时器
                    this.playStatus=false;
                    window.clearTimeout(window.hall_time);
                }
                if(window.env_switch){//环境场开关开启，获取数据
                    load_data(Number($("#count_time").val()));//改变时间，加载数据
                }else{//环境场未开启，加载数据，默认间隔时间为15分钟
                    load_data(15);//改变时间，加载数据
                }
            }
        },
        changeTime:function (date) {//时间控件改变时，返回日期控件的时间
            date=date.split(' - ');
            newTime[0]=new Date(date[0]).toLocaleDateString();//保存新时间进行对比
            newTime[1]=new Date(date[1]).toLocaleDateString();//保存新时间进行对比
            if(!(newTime[0]==oldTime[0]&&newTime[1]==oldTime[1])){//日期改变，改变控件默认结束时间为23:59
                this.map_view_data.$set(1,new Date(date[1]).setHours(23,59,59));
            }
            this.map_view_data[0]=new Date(date[0]).getTime();//选择的时间转化为时间戳
        },
        format:function (val) {//Slider 会把当前值传给 tip-format，并在 Tooltip 中显示 tip-format 的返回值，若为 null，则隐藏 Tooltip
            if(this.time_data.length){
                $("#switch_change_text").html("时刻："+timeConversion(this.time_data[val]*1000));//当前播放的时间
                return timeConversion(this.time_data[val]*1000);
            }else{
                return null;
            }
        },
        sliderVal:function (val) {//拖动进度条，返回当前进度条的位置
            var thisNowTime=timeConversion(this.time_data[val]*1000);//返回的是秒，需要换算为毫秒
            $("#switch_change_text").html("时刻："+thisNowTime);//当前播放的时间
            hall_env_init();//拖动后重新渲染echarts
            console.log(val,this.time_data.length-1)
        },
        dotSize:function () {//精度改变，销毁并重绘echarts
            if(this.time_data.length){//有数据时初始化echarts
                hall_env_init();
            }
        },
        interValData:function () {//设置的间隔时间改变，数据重新获取
            if(this.playStatus){//改变时间时，如果此时状态为播放，则暂停环境场播放，并清除定时器
                this.playStatus=false;
                window.clearTimeout(window.hall_time);
            }
            load_data(Number($("#count_time").val()));
            // this.init();//重绘echarts
        }

    },
    computed:{
        maxLength:function () {//时间数组的长度为进度条的总长度,步长为1
            return this.time_data.length>0?(this.time_data.length-1):0;
        }
    },
    watch:{
        show_param:function () {//开启环境场时，数据加载完成，loadComplete为true，此时初始化echarts
            if(this.show_param&&this.time_data.length!=0){
                hall_env_init();
            }
        },
        time_index:function () {//检测播放的进度值，如果此时被拖动到0或者最后一条数据，并且此时环境场开启时，重绘echarts
            if((this.time_index==0||this.time_index==this.time_data.length-1)&&window.env_switch&&this.loadComplete){
                var thisNowTime=timeConversion(this.time_data[this.time_index]*1000);//返回的是秒，需要换算为毫秒
                $("#switch_change_text").html("时刻："+thisNowTime);//当前播放的时间
                hall_env_init();//拖动后重新渲染echarts
            }
        }
    }
});
$.get('/2.2.05_P001/base_api/base/envs/info/' + env_no+'', function (data) {
    if (!data.map || data.map == '') {
        data.map = '../common/images/layout_default.jpg';
        cut=false;
    }
    vm.$set('hall', data);
    vm.key=false;
    document.title = data.name + '-' + document.title;

    $.get('/2.2.05_P001/base_api/env/environments/floor/hot_area/'+env_no+'', function (data) {//勾画热区
        // console.log(data);
        get_svg(data);
    }, 'json');
}, 'json');



function get_svg(data) {
    require('common/floor_hall/index').hall_init(env_no, '#svg_map');
    if(cut){
        roller();//先执行,绑定mousewheel事件有先后顺序
        dragImg();
        $('.switch_box ul li').click(function () {//温湿度开关选择
            if($(this).hasClass("selectLi")){
                $(this).removeClass("selectLi");
                window.clearTimeout(window.hall_time);//清除定时器，停止播放环境场
                vm.playStatus=false;//播放状态为停止
                $(".switch_change_box").css("display","none");//开关开启，隐藏进度条
                window.env_switch=false;//环境场开关关闭
                window.env_play=false;//环境场图例关闭的标志
                window.visualization==false?vm.showDistinguish=false:'';//关闭环境场，判断可视化是否开启，如果关闭，则关闭图例
                vm.show_param=null;
                $('.play_box').css("display","none");//环境场关闭，隐藏进度条
                if(myEnvChart){//关闭温湿度场，如果echarts已经存在，则销毁echarts
                    exports.env_dispose();
                };
            }else{
                $(this).addClass("selectLi");
                $(this).siblings("li").removeClass('selectLi');
                $(".switch_change_box").css("display","block");//开关开启，显示进度条
                window.env_switch=true;//申明一个全局变量，此时环境场开启
                window.env_play=true;//环境场图例开启的标志,环境场和可视化默认开启其中一个
                window.visualization=false;//可视化图例关闭
                vm.time_data.length?vm.showDistinguish=true:vm.showDistinguish=false;//图例显示
                //关闭可视化
                window.monitor_box.visitualIndex = '';
                window.monitor_box.selectBtn = '';
                $(".svg_Area polygon").css("fill-opacity","0.5");
                // $('.color_distinguish').css("display","none");
                $("#svg_map").attr("scrollkey",false);
                for(var i=0;i<$("#svg_map").children().length;i++){
                    $("#svg_map").children().eq(i).attr("style",window.monitor_box.initColor[i]);//当反选时候重新初始化热区颜色
                }
                $("#svg_map_div").css("display","block");
                window.monitor_box.initColor = [];
                $("polygon").not("polygon[colorindex]").css("visibility","visible");
                $('.play_box').css("display","block");//环境场开启，显示进度条
                if(!vm.time_data.length){//开启环境场，如果已有数据不重新加载
                    load_data(15);
                }
                if($(this).index()==1&&vm.loadComplete){//当前为温度
                    vm.show_param="temperature";//监听show_param改变，调用init（）
                    // vm.init();//初始化echarts实例，此时默认显示最后一条数据
                }else if($(this).index()==0&&vm.loadComplete){//当前为湿度
                    vm.show_param="humidity";
                    // vm.init();//初始化echarts实例，此时默认显示最后一条数据
                }else{//数据没有加载完成，此时环境场开启，被选择的场
                    $(this).index()==0?vm.click_param=="humidity":vm.click_param="temperature";
                }
                if(vm.show_param=="temperature"){//判断环境场的类型
                    $(".color_distinguish .temperatureColor").css("display","block");
                    $(".color_distinguish .humidityColor").css("display","none");
                }else{
                    $(".color_distinguish .humidityColor").css("display","block");
                    $(".color_distinguish .temperatureColor").css("display","none");
                }
                // console.log('index:'+$(this).index())//得到当前被选中的选项
            };
        });
    }
    if (data.total == 0) {
        return;
    }
    var draw = require('common/draw');//后执行
    //有环境监控权限才能够画出热区
    if(checkPermissions({name:'环境监控'})){
        var svg = draw({
            el: '#svg_map',
            data: data.rows,
            mousedown:function(){

            },
            mouseup:function(env_no, e){
                show_cabinet(env_no, e);
            },
            draw: true
        });
    }
}


function roller(){
    var _x,_y,offsetX,offsetY,newOffsetX,newOffsetY,
        width=0,
        top=0,
        left=0,
        i=0,
        newWidth=oldWidth?oldWidth:100;

    $('.map_view')
        .bind('mousewheel',function(e){
            e.preventDefault();
            offsetX=e.clientX-$img_box.offset().left;
            offsetY=e.clientY-$img_box.offset().top;

            _x=offsetX/$img_box.width();
            _y=offsetY/$img_box.height();
            // console.log(e);
            i+=e.deltaY;
            width=i*10;

            $img_box.css({'width':newWidth+width+'%'});
            $img_box.css({'margin-top':-($img_box.height()/2),'margin-left':-($img_box.width()/2)});
            if (i>=5&&i<10) {
//              $('.map_view .type').css({transform:'scale(0.7,0.7)'});
            }else if(i>=10){
//              $('.map_view .type').css({transform:'scale(1.3,1.3)'});
            }
            //滚轮滚动，停止环境场的播放，销毁echarts
            window.clearTimeout(window.hall_time);//清除定时器，停止播放环境场
            vm.playStatus=false;//播放状态为停止
            $("#main").css("display","none");
            // clearTimeout($.data(this, 'timer'));
            // $.data(this, 'timer', setTimeout(function() {
            //     if(window.env_switch){//地图缩放时，判断环境场是否开启，开启则重绘echarts
            //         $("#main").css("display","block");
            //         reset();
            //     }
            // }, 250));
            clearTimeout(window.env_play_time);
            window.env_play_time=setTimeout(function () {
                if(window.env_switch){//地图缩放时，判断环境场是否开启，开启则重绘echarts
                    $("#main").css("display","block");
                    reset();
                }
            },250)

        })
        .find('.btn_view').bind('click',function(){
            reset_();
        	i=0;
            if(window.env_switch){//地图缩放时，判断环境场是否开启，开启则重绘echarts
                reset();
            }
//	      	$('.map_view .type').css({transform:'scale(0.7,0.7)'});
        });
}

function reset_(){
    $img_box.css('width',oldWidth+'%').css({left:'50%',top:'50%','margin-top':-($img_box.height()/2),'margin-left':-($img_box.width()/2)});
}

function dragImg(){
    $('.map_view').mousedown(function(e){
        _x=e.clientX-$img_box.position().left;
        _y=e.clientY-$img_box.position().top;

        $(document).bind('mousemove',function(e){
            var x=e.clientX-_x,
                y=e.clientY-_y;

            $img_box.css({left:x,top:y});
        });

        $(document).bind('mouseup',function(){
            $(document).unbind('mousemove').unbind('mouseup');
        });
        e.preventDefault();
    });
}

function show_cabinet(env_no, e) {
    $('.key_btn,.'+env_no).remove();
    var $box = $('<div class="drag_box key_btn '+env_no+'">' +
        '<div class="toolbar close"></div>' +
        '<div class="toolbar nail"></div>' +
        '</div>');
        
    $('body').append($box);
    $.get('/2.2.05_P001/base_api/env/environments/env_detail/' + env_no+'', function (data) {
        $box.css('left', e.clientX).show().animate({'top': '20%'});
        $box.find('.close').click(function () {
            $box.remove();
        });
        
        box_key=true;
        (function(){
            var key=true;
            $box.find('.nail').click(function(){
                if (key) {
                    $(this).addClass('work');
                    $box.removeClass('key_btn');
                }else{
                    $(this).removeClass('work');
                    $box.addClass('key_btn');
                }
                key=!key;
            });
        })();
        cabinet_init(env_no, $box, data);
        dragInit($box);

        $('.drag_box').mousedown(function(){
            $(this).css('z-index',10000).siblings().css('z-index',9999);
        });

    }, 'json');
}


function dragInit($box) {
    var max_x = $(window).width()-$box.width();
    $box.mousedown(function (e) {
        var _x, _y, x, y;
        _x = e.clientX - $box.offset().left;
        _y = e.clientY - $box.offset().top;

        function mouse_move(ev) {
            x = ev.clientX - _x;
            y = ev.clientY - _y;

            if (x <= 0) {
                x = 0;
            } else if (x >= max_x) {
                x = max_x;
            }

            $box.css({'left': x, 'top': y});
            ev.stopPropagation();
            return false;
        }

        $(document).bind('mousemove', mouse_move);
        $(document).one('mouseup', function () {
            $(document).unbind('mousemove', mouse_move);
        });

        return false;
    });

    $(window).resize(function(){
        max_x = $(window).width()-$box.width();
    });
}

function keepTwoDecimalFull(num) {//四舍五入，保留两位小数
    var result = parseFloat(num);
    if (isNaN(result)) {
        return false;
    }
    result = Math.round(num * 100) / 100;
    var s_x = result.toString();
    var pos_decimal = s_x.indexOf('.');
    if (pos_decimal < 0) {
        pos_decimal = s_x.length;
        s_x += '.';
    }
    while (s_x.length <= pos_decimal + 2) {
        s_x += '0';
    }
    return s_x;
}

function cabinet_init(env_no, $box, data) {//弹窗
    var humidity, temperature;
    if (data['data'] && data.data['humidity']) {
        humidity = data.data.humidity;
    }
    if (data['data'] && data.data['temperature']) {
        temperature = data.data.temperature;
    }
    var url="../capsule/#!/environment/environment_details/"+env_no;
    $box.append('<p class="_title">' + data.env.name + '</p>' +
        '<p class="small_title">预警次数 : <span>' + data.alert.count + '</span>次</p>' +
        '<span class="_title leibie">环境</span>' +
        '<div class="box_"><p class="change"><span class="active">数据</span><span>曲线</span></p>' +
        '<div class="dataView">' +
        '<div class="lineBgimg">' +
        '<span class="ctip" style="left:' + ((humidity / 100) * 302 + 34) + 'px;">' + (humidity?humidity+'%':'暂无数据' )+'</span>' +
        '</div>' +
        '<div class="lineBgimg">' +
        '<span class="ctip" style="left:' + ((temperature / 60) * 302 + 34) + 'px;">' + (temperature?temperature+'℃':'暂无数据') +'</span>' +
        '</div>' +
        '</div>' +
        '<div class="dataView" style="display:none;"><div class="echarts"></div></div></div>' +
        '<span class="_title leibie relic">文物</span>' +
        '<div class="data_view small"></div>' +
        '<span class="_title leibie">设备</span>' +
        '<div class="equipBox"></div>' +
        '<a href="'+url+'" target="_self" class="details">详情</a>' +
        // '<a href="javascript:alert(111)" target="_self" class="details">详情</a>' +
        '<div class="drag"></div>'
    );
    var $change_span = $box.find('.change span'),
        $dataView = $box.find('.dataView'),
        $data_view = $box.find('.data_view'),
        $equipBox = $box.find('.equipBox');

    $change_span.click(function (i) {
        $(this).addClass('active').siblings().removeClass('active');
        $dataView.eq($(this).index()).fadeIn(500).siblings('.dataView').fadeOut(500);
    });
    //构建echarts
    var myChart = createOpt($box.find('.echarts')[0]);//先创建echarts模型
    //创建echarts下方按钮
    insertBtn($dataView.eq(1), myChart);
    //构建文物列表
    relic($data_view, data.relic);
    //构建设备列表
    equip($equipBox, data.equip);
    //构建下拉功能
    downUp($box.find('.drag'));

    function insertBtn($box, myChart) {

        $.get('/2.2.05_P001/base_api/env/environments/cabinet/param_lines/' + env_no+'', function (data) {
            console.log(data);
            var $icon = $('<div/>', {class: 'icon_chart'});
            for (var i in data) {
                $icon.append('<span class="bgImg ' + i + '_sensor"  data-param="' + i + '" data-title="' + data[i].name + '"></span>');
            }
            $icon.find('.bgImg:first').addClass('now');
            $box.append($icon);

            //echarts数据初始化
            echartsInsert(myChart, data[$icon.find('.bgImg:first').attr('data-param')]);
            //创建的按钮点击事件
            $box.find('span').click(function () {
                $(this).addClass('now').siblings().removeClass('now');
                echartsInsert(myChart, data[$(this).attr('data-param')]);
            });
        });
    }

    function echartsInsert(myChart, data) {
        if(!data){
            return;
        }
        var unit=data.unit;
        if (!data.max && !data.min && !data.average) {
            data.max = data.value;
            data.min = data.value;
            data.average = data.value;
        }

        var cloneArr=[];
        for(var i=0;i<data.max.length;i++){
            cloneArr.push([data.max[i][0],data.max[i][1]-data.min[i][1]]);
        }
        var option={
            tooltip:{
                formatter:function(params){
                    var strArr=[];
                    var str=data+'<br/>';
                    var date = new Date(params[0].value[0]);
                    data = date.getFullYear() + '-'
                           + (date.getMonth() + 1) + '-'
                           + date.getDate() + ' '
                           + date.getHours() + ':'
                           + date.getMinutes();

                    for(var i=0;i<3;i++){
                        var value=params[i].value[1];
                        if(i==1){
                            value=Number(params[1].value[1])+Number(params[0].value[1]);
                        }
                        strArr.push(params[i].seriesName+':'+ value+unit+'</br>');
                    }
                    return str+strArr[1]+strArr[2]+strArr[0];
                }
            },
            series: [
                {
                    data: data.min
                },
                {
                    data: cloneArr
                },
                {
                    data: data.average
                }
            ]
        };
        myChart.setOption(option);

        document.onclick = function () {//创建的时候echarts处于隐藏状态可能加载失败，使用手动重置
            myChart.resize();
        }
    }

    function relic($box, data) {
        if (data.length > 0) {
            _.each(data, function (row) {
                $box.append('<a href="../relic?relic_no=' + row.relic_no + '" target="_blank">' + row.name + '</a>');
            });
        }
    }

    function equip($box, data) {

        $box.append('<span class="equipName">监测</span>' +
            '<div class="components sensor"></div>' +
            '<span class="equipName">调控</span>' +
            '<div class="components controller"></div>' +
            '<div class="clear"></div>');

        var $sensor = $box.find('.sensor'),
            $controller = $box.find('.controller');
        if (data&&data.sensor&&data.sensor.length!=0) {
            _.each(data.sensor, function (row) {
                $sensor.append('<a href="../components?equip_no=' + row.equip_no + '" target="_blank"' +
                    ' class="bgImg ' + row.equip_type_en + ' now" data-title="' + row.name + '"></a>');
            });
        }else{
            $sensor.prev('.equipName').css('display','none');
        }
        if (data&&data.controller&&data.controller.length!=0) {
            _.each(data.controller, function (row) {
                $controller.append('<a href="../components?equip_no=' + row.equip_no + '" target="_blank"' +
                    ' class="bgImg ' + row.equip_type_en + ' now" data-title="' + row.name + '"></a>');
            });
        }else{
            $controller.prev('.equipName').css('display','none');
        }
    }

    function downUp($drag) {
        var key = true;
        $drag.click(function () {
            if (key) {
                var down_height = $data_view.height() + $equipBox.height() + 154 + 263;
                $drag.addClass('active').parent().animate({'height': down_height});
            } else {
                $drag.removeClass('active').parent().animate({'height': 263});
            }
            key = !key;
        });
    }

    function createOpt(box) {
        var myChart = echarts.init(box),
            option = {
                tooltip: {
                    trigger: 'axis'
                },
                grid: {
                    x: 5,
                    y: 20,
                    x2: 5,
                    y2: 10,
                    borderWidth: 1,
                    borderColor: '#e5e5e5'
                },
                calculable: false,
                xAxis: [
                    {
                        show: true,
                        type: 'time',
                        splitLine: {
                            lineStyle: {
                                color: "rgba(0,0,0,0)"
                            }
                        },
                        axisLabel: {
                            show: false
                        },
                        axisTick: {
                            show: false
                        }
                    }
                ],
                yAxis: [
                    {
                        show: true,
                        type: 'value',
                        axisLabel: {
                            textStyle: {
                                color: "#9fa6ac",
                                fontFamily: "微软雅黑"
                            },
                            inside: true
                        },
                        axisTick: {
                            show: false
                        }
                    }
                ],
                series: [
                    {
                        showSymbol: false,
                        name: '最小值',
                        smooth: true,
                        type: 'line',
                        stack: 'area',
                        data: [],
                        lineStyle: {normal: {color: 'rgba(133,137,145,0.3)'}}
                    },
                    {
                        showSymbol: false,
                        name: '最大值',
                        smooth: true,
                        type: 'line',
                        lineStyle: {normal: {color: 'rgba(133,137,145,0.3)'}},
                        areaStyle: {
                            normal: {
                                color: 'rgba(133,137,145,0.2)'
                            }
                        },
                        stack: 'area',
                        data: []
                    },
                    {
                        showSymbol: false,
                        symbolSize: 6,
                        name: '平均值',
                        type: 'line',
                        data: [],
                        lineStyle: {
                            normal: {color: 'rgb(163,166,173)'}
                        }
                    }
                ]
            };
        myChart.setOption(option);
        return myChart;
    }
};

function timeConversion(time) {//时间格式转化,格式为yyyy-MM-dd HH:mm,参数为时间戳
    var dateTime=new Date(time);
    var year = dateTime.getFullYear();
    var momth = dateTime.getMonth() + 1;
    var day = dateTime.getDate();
    var hour=dateTime.getHours();
    hour<10?hour=("0"+hour):'';
    var minutes=dateTime.getMinutes();
    minutes<10?minutes=("0"+minutes):"";
    return year+"-"+momth+"-"+day+" "+hour+":"+minutes;
};
function play(){//播放
    if(vm.time_index==vm.time_data.length-1){//当播放完最后一条数据时，停止播放
        vm.playStatus=false;//播放完毕，切换播放状态
        window.clearTimeout(window.hall_time);
        return false;
    }
    // console.log(myEnvChart)
    // if(!myEnvChart){
    //     return;
    // }
    // console.log(vm.show_param)
    hall_env_init();//初始化echarts实例,time_each代表第几条数据
    vm.time_index++;//进度条前进，数据取下一条，默认从0开始播放
    var thisNowTime=timeConversion(vm.time_data[vm.time_index]*1000);//返回的是秒，需要换算为毫秒
    $("#switch_change_text").html("时刻："+thisNowTime);//当前播放的时间
    window.hall_time=window.setTimeout(play,Number($("#play_time").val()))//设置定时器
};
function load_data(count_time) {//加载数据
    vm.playStatus=false;
    vm.loadComplete=false;//每次数据请求，禁用进度条，请求完成启用
    var $switch_change_text=$("#switch_change_text");
    $switch_change_text.text("数据读取中");
    var times=0;
    var intervalFont=setInterval(function () {//添加省略号，表示数据正在获取
        times++;
        $switch_change_text.append(".");
    },1000)

    var newIntervalTime=parseInt(vm.map_view_data[0]/1000)+','+parseInt(vm.map_view_data[1]/1000);//时间范围，单位为秒
    $.get('/2.2.05_P001/base_api/env/general/field',{env_no:env_no,times:newIntervalTime,count_time:count_time},function(json){
        if(!(json&&json.data)){//没有数据返回
            console.log(json=="",json.data=="",json.error,json)
            clearInterval(intervalFont);//清除定时器
            $switch_change_text.text("该时间段没有数据！");
            return false;
        }
        if(!vm.time_data.length){//如果已存在环境场数据
            exports.env_dispose();//每次加载数据，销毁echarts重绘
        }
        clearInterval(intervalFont);//数据获取完毕，清除定时器
        field_data=json;
        vm.time_data = _.keys(json.data);//时间数组
        vm.time_data.length>0?vm.loadComplete=true:'';//数据加载完成,且数据条数不为零时，赋值true
        vm.time_index = vm.time_data.length - 1;//默认显示最后一个时间
        console.log(vm.time_index)
        var thisTime=timeConversion(vm.time_data[vm.time_index]*1000);
        $("#switch_change_text").html("时刻："+thisTime);
        if(window.env_switch&&vm.time_data.length!=0){//环境场开关开启，数据不为0
            if(vm.click_param!=""){//如果数据加载完成之前，开关被开启，将被选择的场作为echarts的初始变量
                vm.show_param=vm.click_param;
            }else{
                !vm.show_param?vm.show_param='humidity':'';//判断场默认状态是否为空，为空默认为湿度场
            }
            vm.showDistinguish=true;//图例显示
            if(vm.show_param=="temperature"){//判断环境场的类型
                $(".color_distinguish .temperatureColor").css("display","block");
                $(".color_distinguish .humidityColor").css("display","none");
            }else{
                $(".color_distinguish .humidityColor").css("display","block");
                $(".color_distinguish .temperatureColor").css("display","none");
            }
            // hall_env_init();
        }
    }).error(function () {
        clearInterval(intervalFont);//数据获取完毕，清除定时器
        $("#switch_change_text").html("读取数据失败");
    })
};
function getDotValue(x, y, equips) {
    // 权值和
    var wSum = 0;
    // 权值 与实际值成绩 和
    var wvSum = 0;
    for (var i in equips) {
        var e = equips[i];
        if (e.value === undefined) continue;
        var x2y2 = (x - e.x) * (x - e.x) + (y - e.y) * (y - e.y);
        if (x2y2 == 0) return e.value;
        var w = Math.pow(x2y2, -1);
        // 累加权值和
        wSum = wSum + w;
        // 计算权值 * 实际数据  并累加
        wvSum = wvSum + w * e.value;
    }
    return (wvSum / wSum).toFixed(1);
};
function hall_env_init(){
    var This=this;
    if(vm.time_data.length==0){//事件数组没有数据，不执行echarts渲染
        return false;
    }
    var time = vm.time_data[vm.time_index];//时间,单位s
    var dot_size=Number($("#dot_size").val());
    var equip_data = [];
    _.each(field_data.data[time], function (val, key) {
        var index = vm.show_param === 'humidity' ? 1 : 0;//第一个参数湿度，第二个参数为温度
        if (val[index] !== null && val[index] !== undefined) {
            equip_data.push(_.extend(field_data.equips[key], {value: val[index]}));
        }
    });
    // console.log(time);
    $('#now_data').val(JSON.stringify(equip_data, 2));

    var data = [];
    var max_x = parseInt(field_data.width / dot_size);
    var max_y = parseInt(field_data.height / dot_size);

    var dVal;

    for (var i = 0; i <= max_x; i++) {
        for (var j = 0; j <= max_y; j++) {
            dVal = getDotValue(i * dot_size, (max_y - j) * dot_size, equip_data);
            data.push([i, j, dVal]);
        }
    }
    var rgba_opacity = 0.5;//透明度

    var option = {
        tooltip: {
            formatter: function (params) {
                return (params.data[3] || '估计值') + '：' + params.data[2] + ((vm.show_param === 'humidity') ? '%' : '℃');
            },
        },
        backgroundColor: '',
        grid: {
            right: 0,
            left: 0,
            top: 0,
            bottom: 0,
        },
        xAxis:
            [
                {
                    // show: false,
                    max: max_x,
                },
                {
                    // show: false,
                    max: field_data.width
                }
            ],
        yAxis:
            [
                {
                    // show: false,
                    max: max_y,
                },
                {
                    // show: false,
                    max: field_data.height
                }
            ],
        visualMap: {
            // show: false,
            bottom:60,
            type: 'piecewise',
            min: field_data['min_' + vm.show_param] * 1,
            max: field_data['max_' + vm.show_param] * 1,
            splitNumber: 9,
            seriesIndex: 0,
            inRange: {
                color: [
                    'rgba(173,59,45,' + rgba_opacity + ')',
                    'rgba(226,85,66,' + rgba_opacity + ')',
                    'rgba(237,118,102,' + rgba_opacity + ')',
                    'rgba(236,156,145,' + rgba_opacity + ')',
                    'rgba(255,224,220,' + rgba_opacity + ')',
                    'rgba(193,222,242,' + rgba_opacity + ')',
                    'rgba(136,198,236,' + rgba_opacity + ')',
                    'rgba(66,155,210,' + rgba_opacity + ')',
                    'rgba(9,105,166,' + rgba_opacity + ')',
                ].reverse()
                //['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
            },
            show:false
        },
        series: [
            {
                name: 'h',
                type: 'heatmap',
                data: data,
                progressive: 0,
                // animation: false
            },
            {
                name: 'd',
                symbolSize: 20,
                data: _.map(equip_data, function (value) {
                    return [value.x, field_data.height - value.y, value.value, value.name];
                }),
                type: 'scatter',
                xAxisIndex: 1,
                yAxisIndex: 1,
            }
        ],
        animation: false

    };
    if (!myEnvChart) {
        myEnvChart = echarts.init(document.getElementById('main'));
    }
    myEnvChart.setOption(option);

};
function reset(){
    if(myEnvChart){
        myEnvChart.resize();
    }
};
exports.env_dispose=function(){
    window.clearTimeout(window.hall_time);
    if(myEnvChart){//当环境场存在时，销毁
        myEnvChart.dispose();//环境场关闭，销毁echarts实例
        myEnvChart = null;
    }
}
});