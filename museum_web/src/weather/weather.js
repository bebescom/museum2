// @require $
// @require echarts
// @require laydate
// @require highcharts
// @require highcharts_more
// @require data
//@require weather.css

require('common/header');
document.title='气象站数据';

var Temperature_humidity_rainfall=require('./modules/Temperature_humidity_rainfall/Temperature_humidity_rainfall.js');
var Ultraviolet_light=require('./modules/Ultraviolet_light/Ultraviolet_light.js');
var Air_pressure=require('./modules/Air_pressure/Air_pressure.js');
var PM2_PM1=require('./modules/PM2.5-PM1.0/PM2.5-PM1.0.js');
var The_wind_rose=require('./modules/The_wind_rose/The_wind_rose.js');

new Vue({
	el:'#content',
	data:{
		time:'24h',
		domShadow:null
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
			$.get(API('/env/environments/weather_detail/detail/'+(time||this.time)),function(data){
			$('.shadow').css('display','none');
				// console.log(data)
				var from=data.from,
					data=data.data,
					local=from=='local',
					newList=null;

				if(local){
					$('#time_line').css('display','block');
					newList=sortLocal(data);		//newList===dataList
				}else{
					sortOnline(data);
				}

				for(var i in newList){
					vm.$broadcast(i,newList[i],from);
				}
			});
		},
		camBack:function(){
			history.back();
		}
	},
	components:{
		'temperature-humidity':Temperature_humidity_rainfall,
		'ultraviolet-light':Ultraviolet_light,
		'air-pressure':Air_pressure,
		'pm-a':PM2_PM1,
		'the-wind':The_wind_rose
	}
});

function sortLocal(obj){
	for(var i in dataList){
		var name=dataList[i];		//Temperature_humidity_rainfall,Ultraviolet_light,Air_pressure,Pm
		for(var k in name){
			name[k]=obj[k];
		}
	}
	return dataList;
}
var dataList={
	Temperature_humidity_rainfall:{temperature:null,humidity:null,rain:null},
	Ultraviolet_light:{uv:null,light:null},
	Air_pressure:{co2:null,air_presure:null},
	Pm:{pm10:null,pm25:null},
	wind:{wind:null}
};

function sortOnline(obj){
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
