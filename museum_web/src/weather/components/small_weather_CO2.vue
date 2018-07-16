<template id="small_weather_CO2">
	<div class="data_box" id="small_weather_CO2_data"></div>
</template>

<script>
    Vue.component('small-co2',{
        template:'#small_weather_CO2',
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
            console.log(this.param_unit_name)
            this.default_option=this.create_chart_CO2();
            this.myChart=echarts.init($('#small_weather_CO2_data')[0]);
            this.myChart.setOption(this.default_option);
            var vm=this;

            $(window).resize(function(){
                vm.myChart.resize();
            });
        },
        methods:{
            local:function(data){
                this.localEcharts_CO2.call(this,data);
            },
            online:function(data){

            },
            localEcharts_CO2:function (data) {
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
                This.myChart.setOption({
                    series:series,
                    yAxis:yAxis
                });
            },
            timeFormat_CO2:function (time) {
                var This=this;
                var timeStr = '',
                    date = null;
                if(time){
                    date = new Date(time);
                    timeStr += This.appendZero_CO2(date.getHours())+':'+This.appendZero_CO2(date.getMinutes())+' '+ This.appendZero_CO2(date.getMonth()+1)+'月' + This.appendZero_CO2(date.getDate())+'日';
                }
                return timeStr||'--:-- XX月XX日';
            },
            appendZero_CO2:function (val) {
                if(val<10){
                    return '0'+val;
                }
                return val;
            },
            create_chart_CO2:function () {
                var This=this;
                return {
                    title:{
                        text:'二氧化碳趋势图'
                    },
                    tooltip: {
                        trigger: 'axis',
                        formatter:function(params){
                            var showStr = '';
                            if(params&&params.length!==0){
                                for(var i=0,len=params.length;i<len;i++){
                                    if(params[i]&&params[i].data){
                                        showStr += This.timeFormat_CO2(params[i].data[0])+'<br />';
                                        break;
                                    }else{
                                        continue;
                                    }
                                }
                                params.forEach(function(point,index){
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
            small_CO2:function(data,from){
				this.local(data);
            }
        }
    });
    // function localEcharts_CO2(data){
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
    //             name:this.param_unit_name[i].name,
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
    // function timeFormat_CO2(time){
    //     var timeStr = '',
    //         date = null;
    //     if(time){
    //         date = new Date(time);
    //         timeStr += appendZero_CO2(date.getHours())+':'+appendZero_CO2(date.getMinutes())+' '+ appendZero_CO2(date.getMonth()+1)+'月' + appendZero_CO2(date.getDate())+'日';
    //     }
    //     return timeStr||'--:-- XX月XX日';
    // }
    //
    // function appendZero_CO2(val){
    //     if(val<10){
    //         return '0'+val;
    //     }
    //     return val;
    // }
    //
    // function create_chart_CO2() {
    //     return {
    //         title:{
    //             text:'二氧化碳趋势图'
    //         },
    //         tooltip: {
    //             trigger: 'axis',
    //             formatter:function(params){
    //                 console.log(params);
    //                 var showStr = '';
    //                 if(params&&params.length!==0){
    //                     for(var i=0,len=params.length;i<len;i++){
    //                         if(params[i]&&params[i].data){
    //                             showStr += timeFormat_CO2(params[i].data[0])+'<br />';
    //                             break;
    //                         }else{
    //                             continue;
    //                         }
    //                     }
    //
    //                     params.forEach(function(point,index){
    //                         // console.log(point);
    //                         showStr += '<span style="display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:'+ point.color +'"></span>'+ this.param_unit_name[point.seriesName].name + ' : ' + ((point&&point.data&&point.data[1])?(point.data[1]):' - ') + this.param_unit_name[point.seriesName].unit + '<br />';
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