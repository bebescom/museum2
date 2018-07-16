define('environmentalMonitoring/Environmental_levels', function(require, exports, module) {
// 

var router = new VueRouter();
module.exports={
	template:'#Environmental_levels',
	data:function(){
		return {
			$table_count:null,			
			$content:null,
			table_data:{},				//表格数据
			post_data:{					//发送请求的参数
				env_no:'',
				page:1,
				limit:10,
				param:'',
				relic_no:'',	
				clear:1,
				alert_time:'',
				index:0
			},
			shadow:false,				//调取数据时启用
			clear:false,				//清除报警时启用
			clearData:{					//清除报警里面的数据
				id:'',
				index:'',
				nav:'',
				type:'',
				time:'',
				relic:''
			},
			alertPolice:null,
			timeComStart:null,
			timeComEnd : null,
			filterObj:{},
            alerts_reload_key:false
		}
	},
	ready:function(){
		var me = this;
		this.$content=$('#content');
		this.$table_count=this.$content.find('.table_count');
		this.reset();
		this.getData();
		//新增功能,进入报警列表时,记录用户查看预警的行为的时间
		$.post('/2.2.05_P001/base_api/base/users/active/alert_activity',{alert_type:"env"},function(res){
			if(!res.result){
				me.$Message.error(res.msg);
			}else{

			}
		});

		window.getData=this.totalWarning;
	},
	computed:{
		allPage:function(){
			return Math.ceil(this.table_data.count/this.post_data.limit)||1;
		}
	},
	methods:{
		reset:function(){
			var height=this.$content.height()-143;
			this.$table_count.css('height',height);
			this.post_data.limit=Math.floor((height-44)/40);
		},
		getData:function(filterObj){
			this.shadow=true;
			this.post_data.index++;
			
			var This=this;
			var post_data=JSON.parse(JSON.stringify(This.post_data));
			if(filterObj){
                // console.log(filterObj);
                this.filterObj = filterObj;
                if(filterObj.env_alert_param&&filterObj.env_alert_param.length!==0){
                    post_data.param = filterObj.env_alert_param.join(',');
				}
				if(filterObj.nodes&&filterObj.nodes.length!==0){
                    post_data.env_no = filterObj.nodes.join(',');
				}
                if(filterObj.time&&filterObj.time.length!==0){
					var time = filterObj.time.map(function(val){
						return Math.ceil(val/1000);
					});
                    post_data.alert_time = time.join(',');
                }
                //报警环境名称,关联文物名称
                if(filterObj.keyword&&filterObj.keyword!==''){
                    post_data.id = filterObj.keyword;
				}
			}
			for(var i in post_data){
				if(post_data[i]==''){
					delete post_data[i];
				}
			}
			// console.log(post_data);
			$.get('/2.2.05_P001/base_api/env/monitor/alerts/alerts_lists',post_data,function(data){
				if(This.post_data.index!=data.index){
					return;
				}
				This.shadow=false;
				This.post_data.index=0;
				This.table_data=data;
                This.table_data.count=data.count;
			});
		},
		turnPage:function(){
			this.getData(this.filterObj);
		},
		location:function(arr){							//转换地点
			if (arr.length === 1){
				return arr[0].name;
			}
			var str=[],k=0;
			for(var i=arr.length-1;i>0;i--){
				str.push(arr[i].name);
				k++;
				if(k==2){
					return str.reverse().join('>');
				}
			}
			return str.reverse().join('>');
		},
		conversion:function(type){						//转换类型
			return conversion[type];
		},
		clearPolice:function(tr,index){
			if(tr.clear==true){
				return;
			}
			this.clear=true;
			this.clearData={
				id:tr.id,
				index:index,
				nav:this.location(tr.nav),
				type:this.conversion(tr.alert_param),
				time:tr.alert_time,
				relic:tr.relic_name
			}
		},
		hidePolice:function(){
			this.post_data.clear=this.post_data.clear==0?1:0;
			this.post_data.page=1;
            this.$broadcast('toggle_env_alert',this.post_data.clear);
			this.getData(this.filterObj);
		},
        goNavDetail:function(nav,alertTime,param){//获取报警时间，并处理
			var _this = this;
			if(nav){
				if(nav[nav.length-1]){
					var alertTimeA = new Date(Date.parse(alertTime.replace(/-/g, "/"))),
						alertNo =  nav[nav.length-1].env_no;
						alertTimeA = alertTimeA.getTime();
					var alertNoA = JSON.parse(alertNo);

					alertTimeA = JSON.stringify(alertTimeA).slice(0,-3);
					this.computedTime(alertTime);
					var time = this.timeComStart + ',' + this.timeComEnd;
					var env_nos = nav[nav.length-1].env_no;

					$.get('/2.2.05_P001/base_api/env/monitor/line',{env_no: alertNo,alert_time:alertTimeA,alert_param:param,time:time},function(data){
						if (data&&data[alertNo]&&data[alertNo][param]){
							sessionStorage.setItem('alertTime',alertTime);
							sessionStorage.setItem('rangePoliceN',data[alertNo][param].threshold.min);
							sessionStorage.setItem('rangePoliceX',data[alertNo][param].threshold.max);
							sessionStorage.setItem('paramName',data[alertNo][param].name);
							sessionStorage.setItem('key2',true);
							//console.log(data);
							if (data[alertNo][param].alert_point == false){
								sessionStorage.setItem('alert_time',alertTimeA);
								_this.$route.params.alertTime = new Date(Date.parse(alertTime.replace(/-/g, "/")));
							}else {
								sessionStorage.setItem('alert_time',data[alertNo][param].alert_point[0]);
								_this.$route.params.alertTime = data[alertNo][param].alert_point[0];
							}
							sessionStorage.setItem('alert_value',data[alertNo][param].alert_point[1]);
							sessionStorage.setItem('param',param);
							_this.alertPolice = data[alertNoA];
							_this.$route.params.env_no = nav[nav.length-1].env_no;
							_this.$route.params.key=true;
							_this.$route.params.name=nav[nav.length-1].name;

							_this.$route.params.rangePolice = data[alertNoA][param].threshold;
							_this.$route.params.key1=true;
							router.go("/environment/environment_details/"+env_nos);
						}else {
							_this.$Message.warning('没有数据,无法显示具体报警时间');
						}
					});
				}
			}
		},
		goEquipDetail:function(equip_no,alertTime,type){
			var _this = this;
			if(type){
				window.sessionStorage.setItem('jump_to_detail_tab',type);
			}

			sessionStorage.setItem('alertTime',alertTime);
			sessionStorage.setItem('equipNo',equip_no);
			window.location.href='../equipManage/#/equip_info/'+ equip_no +"/" + alertTime;
			//router.go('/equipManage/equip_info/'+equip_no+"/"+alertTime);
		},
		computedTime:function(alertTime){
			//var alertTime = new Date(alertTime);
			//var currentTime = new Date();
			//var year = alertTime.getFullYear() == currentTime.getFullYear(),
			//	month = alertTime.getMonth() == currentTime.getMonth(),
			//	day = alertTime.getDate() == currentTime.getDate(),
			//	monthCom = alertTime.getMonth() + 1,
			//	dayAddCom = alertTime.getDate()- 1,
			//	dayReCom = alertTime.getDate(),
			//	dayEqCom = alertTime.getDate() + 1;
			//if (year && month && day){
			//	this.timeComStart = alertTime.getFullYear() + '-' + monthCom + '-' + dayAddCom + ' ' + '00' + ':' + '00'+ ':' + '00';
			//	this.timeComEnd = alertTime.getFullYear() + '-' + monthCom + '-' + dayReCom + ' ' + currentTime.getHours() + ':' + currentTime.getMinutes()+ ':' + currentTime.getSeconds();
			//	this.timeComStart = new Date(Date.parse(this.timeComStart.replace(/-/g, "/")));
			//	this.timeComStart = this.timeComStart.getTime();
			//	this.timeComEnd = new Date(Date.parse(this.timeComEnd.replace(/-/g, "/")));
			//	this.timeComEnd = this.timeComEnd.getTime();
			//	this.timeComStart = JSON.stringify(this.timeComStart).slice(0,-3);
			//	this.timeComEnd = JSON.stringify(this.timeComEnd).slice(0,-3);
			//	//console.log(this.timeComStart,this.timeComEnd);
			//}else if (year && month && currentTime.getDate()-alertTime.getDate()>1){
			//	this.timeComStart = alertTime.getFullYear() + '-' + monthCom + '-' + dayAddCom + ' ' + '00' + ':' + '00'+ ':' + '00';
			//	this.timeComEnd = alertTime.getFullYear() + '-' + monthCom + '-' + dayEqCom + ' ' + '00' + ':' + '00'+ ':' + '00';
			//	this.timeComStart = new Date(Date.parse(this.timeComStart.replace(/-/g, "/")));
			//	this.timeComStart = this.timeComStart.getTime();
			//	this.timeComEnd = new Date(Date.parse(this.timeComEnd.replace(/-/g, "/")));
			//	this.timeComEnd = this.timeComEnd.getTime();
			//	this.timeComStart = JSON.stringify(this.timeComStart).slice(0,-3);
			//	this.timeComEnd = JSON.stringify(this.timeComEnd).slice(0,-3);
			//	//console.log(this.timeComStart,this.timeComEnd);
			//}else if (year && month && currentTime.getDate()-alertTime.getDate()==1){
			//	this.timeComStart = alertTime.getFullYear() + '-' + monthCom + '-' + dayAddCom + ' ' + '00' + ':' + '00'+ ':' + '00';
			//	this.timeComEnd = alertTime.getFullYear() + '-' + monthCom + '-' + dayReCom + ' ' + currentTime.getHours() + ':' + currentTime.getMinutes()+ ':' + currentTime.getSeconds();
			//	this.timeComStart = new Date(Date.parse(this.timeComStart.replace(/-/g, "/")));
			//	this.timeComStart = this.timeComStart.getTime();
			//	this.timeComEnd = new Date(Date.parse(this.timeComEnd.replace(/-/g, "/")));
			//	this.timeComEnd = this.timeComEnd.getTime();
			//	this.timeComStart = JSON.stringify(this.timeComStart).slice(0,-3);
			//	this.timeComEnd = JSON.stringify(this.timeComEnd).slice(0,-3);
			//	//console.log(this.timeComStart,this.timeComEnd);
			//}else{
			//	this.timeComStart = alertTime.getFullYear() + '-' + monthCom + '-' + dayAddCom + ' ' + '00' + ':' + '00'+ ':' + '00';
			//	this.timeComEnd = alertTime.getFullYear() + '-' + monthCom + '-' + dayReCom + ' ' + currentTime.getHours() + ':' + currentTime.getMinutes()+ ':' + currentTime.getSeconds();
			//	this.timeComStart = new Date(Date.parse(this.timeComStart.replace(/-/g, "/")));
			//	this.timeComStart = this.timeComStart.getTime();
			//	this.timeComEnd = new Date(Date.parse(this.timeComEnd.replace(/-/g, "/")));
			//	this.timeComEnd = this.timeComEnd.getTime();
			//	this.timeComStart = JSON.stringify(this.timeComStart).slice(0,-3);
			//	this.timeComEnd = JSON.stringify(this.timeComEnd).slice(0,-3);
			//}

			/**************** hbj修改 **********************/
			var alertTimes = alertTime.split(' ');
			var alertTimeS = alertTimes[0];
			var alertTimeE = alertTimeS + " 23:59:59";
			alertTimeS = alertTimeS.replace("-","/");
			alertTimeE = alertTimeE.replace("-","/");
			alertTimeS = JSON.stringify(new Date(alertTimeS).getTime()).slice(0,-3);
			alertTimeE = JSON.stringify(new Date(alertTimeE).getTime()).slice(0,-3);
			this.timeComStart = alertTimeS;
			this.timeComEnd = alertTimeE;
			/******************   **********************/
		},
		totalWarning:function () {
            var This=this;
            if(This.alerts_reload_key){
            	return;
			}
            This.alerts_reload_key=true;
			setTimeout(function () {
                This.alerts_reload_key=false;
				This.getData();
            },1000);

        }
	},
	events:{
		clearOver:function(index,text,time){
			var tr=this.table_data.rows[index];
			tr.remark=text;
			tr.clear_time=time;
			tr.clear=true;
		},
        reload_data:function(filterObj){
			this.post_data.page = 1;
			this.getData(filterObj);
		}
	},
	components:{
		'clear-police':{
			template:'#clearPolice',
			props:['clear','clearData'],
			data:function(){
				return {
					text:'',
					key:true			//清除报警是否可以点击
				}
			},
			methods:{
				close:function(){
					this.clear=false;
				},
				clearAlert:function(){
					if(!this.key){
						return;
					}
					this.key=false;
					var This=this;
					var time=new Date();
					var time=time.getFullYear()+'-'+(time.getMonth()+1)+'-'+time.getDate()+' '+time.getHours()+':'+time.getMinutes()+':'+time.getSeconds();
					//console.log(time)
					$.post('/2.2.05_P001/base_api/env/monitor/alerts/clear/'+this.clearData.id,{clear_time:time,remark:this.text},function(data){
						This.key=true;
						if(data.result!=true){
							//alert('处理失败');
							this.$Message.warning('处理失败');
						}else{
							This.$dispatch('clearOver',This.clearData.index,This.text,time);
						}
						This.close();
					});
				}
			}
		}
	}
};

var conversion={
    temperature:'温度',
    humidity:'相对湿度',
    light:'光照强度',
    uv:'紫外强度',
    co2:'二氧化碳浓度',
    voc:'voc',
    organic:'有机物挥发物浓度',
    inorganic:'无机物',
    sulfur:'含硫',
    box_open_alert:'非法开盖',
    move_alert:'智能囊匣异常震动',
    broken:'玻璃破碎',
    vibration:'安防监测终端异常震动',
    multi_wave:'多维驻波'
};

});