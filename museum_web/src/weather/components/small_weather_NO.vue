<template id="small_weather_NO">
    <div class="data_box" id="small_weather_NO_data"></div>
</template>

<script>
    Vue.component('small-no',{
        template:'#small_weather_NO',
        data:function(){
            return {
                default_option:null,
                myChart:null,
                param_unit_name:''
            }
        },
        ready:function(){
            //获取参数单位名称
            this.param_unit_name = window.web_config.param_unit_name.sensor;
            this.default_option=this.create_chart_NO();
            this.myChart=echarts.init($('#small_weather_NO_data')[0]);
            this.myChart.setOption(this.default_option);
            var vm=this;

            $(window).resize(function(){
                vm.myChart.resize();
            });
        },
        methods:{
            local:function(data){
                this.localEcharts_NO.call(this,data);
            },
            online:function(data){

            },
            localEcharts_NO:function (data) {
                var This=this;
                var yAxis=[],series=[],key=0,position='left';
                for(var i in data){
                    if(key!=0){
                        position='right';
                    }
                    series.push({
                        showSymbol: false,
                        smooth: true,
                        data:data[i],
                        name:i,
                        type:'line',
                        yAxisIndex:key
                    });
                    yAxis.push({
                        min:'dataMin',
                        name:This.param_unit_name[i].name+'\n('+This.param_unit_name[i].unit+')',
                        type:'value',
                        position:position,
                        offset:(key!=0)?50*(key-1):0,
                        splitLine:{show:(key!=0)?false:true}
                    });

                    key++;
                }
                this.myChart.setOption({
                    series:series,
                    yAxis:yAxis
                });
            },
            timeFormat_NO:function (time) {
                var timeStr = '',
                    date = null;
                if(time){
                    date = new Date(time);
                    timeStr += this.appendZero_NO(date.getHours())+':'+this.appendZero_NO(date.getMinutes())+' '+ this.appendZero_NO(date.getMonth()+1)+'月' + this.appendZero_NO(date.getDate())+'日';
                }
                return timeStr||'--:-- XX月XX日';
            },
            appendZero_NO:function (val) {
                if(val<10){
                    return '0'+val;
                }
                return val;
            },
            create_chart_NO:function () {
                var This=this;
                return {
                    title:{
                        text:'氮氧化物趋势图'
                    },
                    tooltip: {
                        trigger: 'axis',
                        formatter:function(params){
                            // console.log(params);
                            var showStr = '';
                            if(params&&params.length!==0){
                                for(var i=0,len=params.length;i<len;i++){
                                    if(params[i]&&params[i].data){
                                        showStr += This.timeFormat_NO(params[i].data[0])+'<br />';
                                        break;
                                    }else{
                                        continue;
                                    }
                                }

                                params.forEach(function(point,index){
                                    // console.log(point);
                                    showStr += '<span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:'+ point.color +'"></span>'+ This.param_unit_name[point.seriesName].name + ' : ' + ((point&&point.data&&point.data[1])?(point.data[1]):' - ') + This.param_unit_name[point.seriesName].unit + '<br />';
                                });
                            }
                            return showStr;
                        }
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
                        left: 50,
                        right: 100,
                        top: '30%',
                        bottom: '17%'
                    },
                    xAxis: {
                        show: false,
                        type: 'time',
                        boundaryGap: false,
                        axisLabel: {
                            textStyle: {
                                color: "#9fa6ac",
                                fontFamily: "微软雅黑"
                            }
                        }
                    },
                    yAxis: {},
                    series: []
                };
            }
        },
        events:{
            small_NO:function(data,from){
                    this.local(data);
            }
        }
    });
    // function localEcharts_NO(data){
    //     var yAxis=[],series=[],key=0,position='left';
    //
    //     for(var i in data){
    //         console.log(data[i]);
    //         if(key!=0){
    //             position='right';
    //         }
    //         series.push({
    //             showSymbol: false,
    //             smooth: true,
    //             data:data[i],
    //             name:i,
    //             type:'line',
    //             yAxisIndex:key
    //         });
    //         yAxis.push({
    //             min:'dataMin',
    //             name:param_unit_name[i].name,
    //             type:'value',
    //             position:position,
    //             offset:(key!=0)?50*(key-1):0,
    //             splitLine:{show:(key!=0)?false:true}
    //         });
    //
    //         key++;
    //     }
    //     this.myChart.setOption({
    //         series:series,
    //         yAxis:yAxis
    //     });
    // }
    //
    // function timeFormat_NO(time){
    //     var timeStr = '',
    //         date = null;
    //     if(time){
    //         date = new Date(time);
    //         timeStr += appendZero_NO(date.getHours())+':'+appendZero_NO(date.getMinutes())+' '+ appendZero_NO(date.getMonth()+1)+'月' + appendZero_NO(date.getDate())+'日';
    //     }
    //     return timeStr||'--:-- XX月XX日';
    // }
    //
    // function appendZero_NO(val){
    //     if(val<10){
    //         return '0'+val;
    //     }
    //     return val;
    // }
    //
    // function create_chart_NO() {
    //     return {
    //         title:{
    //             text:'氮氧化物趋势图'
    //         },
    //         tooltip: {
    //             trigger: 'axis',
    //             formatter:function(params){
    //                 // console.log(params);
    //                 var showStr = '';
    //                 if(params&&params.length!==0){
    //                     for(var i=0,len=params.length;i<len;i++){
    //                         if(params[i]&&params[i].data){
    //                             showStr += timeFormat_NO(params[i].data[0])+'<br />';
    //                             break;
    //                         }else{
    //                             continue;
    //                         }
    //                     }
    //
    //                     params.forEach(function(point,index){
    //                         // console.log(point);
    //                         showStr += '<span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:'+ point.color +'"></span>'+ param_unit_name[point.seriesName].name + ' : ' + ((point&&point.data&&point.data[1])?(point.data[1]):' - ') + param_unit_name[point.seriesName].unit + '<br />';
    //                     });
    //                 }
    //                 return showStr;
    //             }
    //         },
    //         legend: {
    //             show: false
    //         },
    //         dataZoom: [
    //             {
    //                 show: true,
    //                 realtime: true,
    //                 xAxisIndex: [0]
    //             },
    //             {
    //                 type: 'inside',
    //                 realtime: true,
    //                 xAxisIndex: [0]
    //             }
    //         ],
    //         grid: {
    //             left: 50,
    //             right: 100,
    //             top: '25%',
    //             bottom: '17%'
    //         },
    //         xAxis: {
    //             show: false,
    //             type: 'time',
    //             boundaryGap: false,
    //             axisLabel: {
    //                 textStyle: {
    //                     color: "#9fa6ac",
    //                     fontFamily: "微软雅黑"
    //                 }
    //             }
    //         },
    //         yAxis: {},
    //         series: []
    //     };
    // }
</script>

<style scoped>

</style>