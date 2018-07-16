<template id="The_wind_rose">
    <div class="data_box" id="the_wind_rose_data" style="width: 97.2%;height: 400px;">

        <div id="container" style="min-width: 420px; max-width: 600px; height: 400px; margin: 0 auto"></div>
        <div style="display:none">
            <!-- Source: http://or.water.usgs.gov/cgi-bin/grapher/graph_windrose.pl -->
            <table id="freq" border="0" cellspacing="0" cellpadding="0">
                <tr nowrap bgcolor="#CCCCFF">
                    <th colspan="9" class="hdr">Table of Frequencies (percent)</th>
                </tr>
                <tr nowrap bgcolor="#CCCCFF">
                    <th class="freq">Direction</th>
                    <th class="freq">零级</th>
                    <th class="freq">一级</th>
                    <th class="freq">二级</th>
                    <th class="freq">三级</th>
                    <th class="freq">四级</th>
                    <th class="freq">五级</th>
                    <th class="freq">>五级</th>
                </tr>

                <tr nowrap v-for="(name,key) in data">
                    <td class="dir" v-text="name"></td>
                    <td class="data" v-for="n in key" v-text="n" track-by="$index"></td>
                </tr>
            </table>
        </div>
    </div>
</template>

<script>

    Vue.component('wind-rose',{
        template:'#The_wind_rose',
        data:function(){
            return {
                data:[]
            }
        },
        methods:{
            local:function(data){
                data=deleteTotal(data.wind);
                this.data=data;
                setTimeout(function(){
                    key();
                },0);
            },
            online:function(data){

            }
        },
        events:{
            small_wind:function(data,from){
                    this.local(data);
            }
        }
    });

    function deleteTotal(obj){
        var arr={};
        for(var i in obj){
            if(i=='Total'){
                continue;
            }
            arr[i]=obj[i];
        }
        return arr;
    }

    function key(){
        $(function () {
            // Parse the data from an inline table using the Highcharts Data plugin
            $('#container').highcharts({
                data: {
                    table: 'freq',
                    startRow: 1,
                    endRow: 17,
                    endColumn: 7
                },
                chart: {
                    polar: true,
                    type: 'column'
                },
                title: {
                    text: '风向风力图'
                },
                pane: {
                    size: '85%'
                },
                legend: {
                    align: 'right',
                    verticalAlign: 'top',
                    y: 100,
                    layout: 'vertical'
                },
                xAxis: {
                    tickmarkPlacement: 'on'
                },
                yAxis: {
                    min: 0,
                    endOnTick: false,
                    showLastLabel: true,
                    // title: {
                    //     text: 'Frequency (%)'
                    // },
                    labels: {
                        formatter: function () {
                            return this.value + '%';
                        }
                    },
                    reversedStacks: false
                },
                tooltip: {
                    valueSuffix: '%'
                },
                plotOptions: {
                    series: {
                        stacking: 'normal',
                        shadow: false,
                        groupPadding: 0,
                        pointPlacement: 'on'
                    }
                }
            });
        });

    }
</script>

<style scoped>

</style>