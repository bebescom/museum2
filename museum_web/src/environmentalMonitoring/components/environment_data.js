//获取参数单位名称
var param_unit_name = window.web_config.param_unit_name.sensor;
//获取震动传感器单位名称
var vibration_unit_name = window.web_config.param_unit_name.vibration;
var weather_unit_name = window.web_config.param_unit_name.weather;

module.exports={
	template:'#environment_data',
	props:['envs','time','shadowKey','env_name'],				//envs为环境 ,  time是时间,shadowKey为阴影框是否显示的判断,
	data:function(){
		return {
			$content:null,
			$original_data:null,
			$shadow:null,						//遮罩层
            columns:[],
			table_data:{},						//表格数据
			data_params:{						//查询参数
				env_no:this.envs,					//环境编号
				equip_no:'',						//设备编号
				equip_type:'',						//设备类型
				time:this.time,						//时间
				page:1,								//页码
				limit:10,							//记录条数
				index:0								//请求标记
			},
			filter_conditions:{
				environment:[],
				equip:[]
			},
			environment:false,						//环境搜索框显示判断
			equip:false,								//设备搜索框显示判断
			equip_type:{},							//设备类型
			environmentLeft:0,						//环境筛选框left
			equipLeft:0,								//设备筛选框left
			env_no:[],								//环境编号
			Equipment_serial_number:''				//设备编号
		}
	},
	watch:{
		envs:function(newData){
			this.data_params.env_no=newData;
		},
		time:function(newData){
			this.data_params.time=newData;
		}
	},
	ready:function(){
		var This=this;
		this.$content=$('#content');
		this.$original_data=this.$content.find('.original_data');
		this.$shadow=this.$content.find('.shadow');
		$.get(API('/env/common/equip_type'),function(data){
			//console.log(data);
			delete data.network;
			This.equip_type=data;
		});
		this.resize();
	},
	methods:{
		resize:function(){
			var num=this.$content.height()-223;
			this.$original_data.css({height:num,'max-height':num});
			this.data_params.limit=Math.floor((num-45)/40);
		},
		getData:function(){
			this.data_params_change();

			var This=this;
			this.data_params.index++;
			setTimeout(function(){
				$.get(API('/env/monitor/data_table'),This.data_params,function(data){
					This.$shadow.hide();
					if(data.index!=This.data_params.index)return;
                    This.columns = [];
                    if (data.param) {
                        _.each(data.param, function (param) {
                            var row = {
                                param: param,
                                name: '',
                                unit: '',
                            };
                            if (param_unit_name[param]) {
                                row.name = param_unit_name[param].name;
                                row.unit = param_unit_name[param].unit;
                            } else if (vibration_unit_name[param]) {
                                row.name = vibration_unit_name[param].name;
                                row.unit = vibration_unit_name[param].unit;
                            } else if (weather_unit_name[param]) {
                                row.name = weather_unit_name[param].name;
                                row.unit = weather_unit_name[param].unit;
                            }
                            This.columns.push(row);
                        });
                    }

					This.table_data=data;
					console.log(This.table_data)
					This.data_params.index=0;
					//console.log(This.data_params);
				});
			},0);
		},
		change:function(type,e){
			this[type]=!this[type];
			var element=e.target||e.srcElement;
			var $element=$(element);
			type=type+'Left';
			this[type]=($element.width()-$element.children('.operation').eq(0).width())/2;
		},
		turnPage:function(){
			this.$shadow.show();
			this.getData();
		},
		filter:function(type,name,env_no){
			var type=this.filter_conditions[type];
			if(env_no){							//如果env_no存在，表示是环,否则是设备
				var key=true;
				type.forEach(function(con,i){
					if(con.name==name){
						type.splice(i,1);
						key=false;
					}
				});
				if(key){
					type.push({
						name:name,
						env_no:env_no
					});
				}

				var index_=this.env_no.indexOf(env_no);
				if(index_!=-1){
					this.env_no.splice(index_,1);
				}else{
					this.env_no.push(env_no);
				}
			}else{
				var index=type.indexOf(name);
				if(index!=-1){
					type.splice(index,1);
				}else{
					type.push(name);
				}
			}

			this.data_params.page=1;
			this.data_params.equip_no='';
			this.Equipment_serial_number='';
			this.$shadow.show();
			this.getData();
		},
		data_params_change:function(){						//对发送的数据进行整理
			this.data_params.equip_type=this.filter_conditions.equip.join();	//整理设备类型
			if(this.env_no.length){												//整理环境编号
				var env_no='';
				this.filter_conditions.environment.forEach(function(con){
					env_no+=con.env_no+',';
				});
				this.data_params.env_no=env_no.slice(0,env_no.length-1);
			}else{
				this.data_params.env_no=this.envs;
			}
			console.log(this.filter_conditions)
		},
		searchEquip:function(){
			this.filter_conditions={
				environment:[],
				equip:[]
			};
			this.data_params.equip_no=this.Equipment_serial_number;
			this.data_params.page=1;
			this.$shadow.show();
			this.getData();
		},
		reset_status:function(){
			this.Equipment_serial_number='';
			this.table_data={};
			this.filter_conditions={
				environment:[],
				equip:[]
			};
			this.env_no=[];
			this.data_params.page=1;
			this.getData();
		}
	},
	computed:{
		allPage:function(){
			return Math.ceil(this.table_data.count/this.data_params.limit)||1;
		},
		env_no_change:function(){
			return this.envs.split(',');
		}
	},
	events:{
		environment_data:function(){
			this.$shadow.show();
//			this.data_params.page=1;
			this.data_params.equip_no='';
//			this.Equipment_serial_number='';
			this.reset_status();
			this.getData();
		},
		resetStatus:function(){
			this.reset_status();
		}
	}
};
