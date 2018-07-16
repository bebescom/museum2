//获取参数单位名称
var param_unit_name = window.web_config.param_unit_name.weather;

module.exports={
	template:'#The_wind_rose',
	data:function(){
		return {
			data:[]
		}
	},
	methods:{
		local:function(data){
			data=deleteTotal(data.wind);
			console.log(data);
			this.data=data;
			setTimeout(function(){
				key();
			},0);
		},
		online:function(data){

		}
	},
	events:{
		wind:function(data,from){
			if(from==='local'){
				this.local(data);
			}else{
				this.online(data);
			}
		}
	}
};

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