define('weather/small_weather', function(require, exports, module) {
// 
// 
// 
// 
// 
// 
//

require('common/header');
document.title='小型气象站数据';


new Vue({
    el:'#content',
    data:{
        time:'24h',
        domShadow:null,
        dataList:{
            small_CO2:{co2:null,humidity:null,temperature:null},
            small_SO2:{so2:null},
            small_NO:{no:null},
            small_O3:{o3:null},
            small_wind:{wind:null}
        }
    },
    created:function(){
        this.postData();
        this.domShadow=$('.shadow');
    },
    methods:{
        timeChange:function(time){
            this.postData(time);
        },
        postData:function(time){
            $('.shadow').css('display','block');
            var vm=this;
            $.get('/2.2.05_P001/base_api/env/general/small_station?time='+(time||this.time+''),function(data){
                // console.log(data)
                $('.shadow').css('display','none');
                var from=data.from,
                    data=data.data,
                    local=from=='local',
                    newList=null;

                    $('#time_line').css('display','block');
                    newList=vm.sortLocal(data);		//newList===dataList
                for(var i in newList){
                    vm.$broadcast(i,newList[i],from);
                }
            });
        },
        camBack:function(){
            history.back();
        },
        sortLocal:function (obj) {
            for(var i in this.dataList){
                var name=this.dataList[i];		//Temperature_humidity_rainfall,Ultraviolet_light,Air_pressure,Pm
                for(var k in name){
                    name[k]=obj[k];
                }
            }
            return this.dataList;
        },
        sortOnline:function (obj) {
            var dataList={};
            for(var i in obj){
                var list=obj[i];
                for(var k in list){
                    if(k=='date'){
                        continue;
                    }
                    if(dataList[k]==undefined){
                        dataList[k]=[];
                    }
                    dataList[k].push([list.date,list[k]])
                }
            }
        }
    }
});

// function sortLocal(obj){
//     for(var i in dataList){
//         var name=dataList[i];		//Temperature_humidity_rainfall,Ultraviolet_light,Air_pressure,Pm
//         for(var k in name){
//             name[k]=obj[k];
//         }
//     }
//     return dataList;
// }
// var dataList={
//     small_CO2:{temperature:null,humidity:null,rain:null},
//     small_SO2:{uv:null,light:null},
//     small_NO:{co2:null,air_presure:null},
//     small_O3:{pm10:null,pm25:null},
//     small_wind:{wind:null}
// };
//
// function sortOnline(obj){
//     var dataList={};
//     for(var i in obj){
//         var list=obj[i];
//         for(var k in list){
//             if(k=='date'){
//                 continue;
//             }
//             if(dataList[k]==undefined){
//                 dataList[k]=[];
//             }
//             dataList[k].push([list.date,list[k]])
//         }
//     }
// }

});