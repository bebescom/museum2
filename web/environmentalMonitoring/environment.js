define('environmentalMonitoring/environment', function(require, exports, module) {
// 
// 
// 
// 
// 

var calcTime = function(time,type){
    var year = time.getFullYear(),
        month = time.getMonth()+1,
        day = time.getDate(),
        newDate = time;
    if(type==='today'){
        newDate.setHours(0,0,0);
    }
    else if(type==='yesterday'){
        newDate.setDate(day-1);
        newDate.setHours(0,0,0);
    }
    else if(type==='near3'){
        newDate.setDate(day-2);
        newDate.setHours(0,0,0);
        // newDate.setHours(0,0,0);
    }else if(type==='near7'){
        newDate.setDate(day-6);
        newDate.setHours(0,0,0);
        // newDate.setHours(0,0,0);
    }
    return newDate;
};

//全局标志位,标志是否是通过时间控件的别名选择的时间
// var shortTime = false;

module.exports=Vue.extend({
	template:'#environment_template',
	route:{
		data:function(transition){
			var params=transition.from.params;
			if(!params){
	            params={};
	        }
	        if(params.timeStr){
	        	this.timeStr = params.timeStr;
			}
            if(params.timeArr){
                this.timeArr = params.timeArr;
            }

	        // if(this.tree_list.length===0){
            //
	        // 	return;
	        // }
			if (params.alertTime){//在不是从报警列表进入详情时候的赋值
				this.alertTime = params.alertTime;
			}
			if (params.rangePolice){//
				this.rangePolice = params.rangePolice;
			}
			// this.dragDown(params);
			if (params.key1){
				this.policeTimeFun(params);//报警时间
			}
			//this.$broadcast('testPolice',params.alertTime,params.rangePolice);
			var tree_list_copy,
                back_from_relic_detail,//标志位,页面从文物详情跳回
                back_from_equipment_detail;//标志位,页面从设备详情跳回

			if(sessionStorage.getItem('tree_list_copy')){
				tree_list_copy = JSON.parse(sessionStorage.getItem('tree_list_copy'));
			}
			if(sessionStorage.getItem('back_from_relic_detail')){
                back_from_relic_detail = JSON.parse(sessionStorage.getItem('back_from_relic_detail'));
                //从路由外,文物详情,跳转回到环境详情
                this.com = 'environment_relic';
                sessionStorage.removeItem('back_from_relic_detail');
			}
            if(sessionStorage.getItem('back_from_equipment_detail')){
                back_from_equipment_detail = JSON.parse(sessionStorage.getItem('back_from_equipment_detail'));
                // this.com = 'environment_equipment';
                sessionStorage.removeItem('back_from_relic_detail');
            }
            var fromDetail = back_from_relic_detail||back_from_equipment_detail;
            if(fromDetail){//从文物,设备详情跳回
                if(tree_list_copy){
                    tree_list_copy = tree_list_copy.split(',');
                    // this.$broadcast('memory_tree',tree_list_copy);
                }
			}

			// if (sessionStorage.getItem('save_env_name')){
				// var save_env_name = sessionStorage.getItem('save_env_name');
				// this.$broadcast('click_env_name',save_env_name);
			// }
            // console.log(sessionStorage.getItem('save_env_no'));

            // if (sessionStorage.getItem('save_env_no')&&this.firstLoadReady){
            //     console.log('发送router');
            //     var save_env_no = sessionStorage.getItem('save_env_no');
            //     this.$broadcast('click_env',save_env_no);
            // }
            //if ()
            this.get_tree_data(params,fromDetail);

			transition.next();
		},
		canDeactivate:function(transition){
			//重置状态
			this.sel_env=[];
			this.env_name=[];
			var $liList=$('.left_environment').find('li.key');
			if($liList.length===0){
				transition.next();
				return;
			}
			$liList.find('.status_box')[0].click();
			this.$broadcast('resetStatus');
			transition.next();
		}
	},
	data:function(){
		return {
            $content: null,
            $body: null,
            $start_time: null,
            $end_time: null,
            $tree_box: null,
            tree_list: [],						//左侧环境树
            sel_env: [],						//保存选中环境
            com: 'environment_curve',			//切换视图
            shadowKey: false,					//遮影是否显示
            shadowHeight: 0,
            env_name: [],							//被选中环境的名称
            timeArr: [new Date().getTime() - 24 * 60 * 60 * 1000, new Date().getTime()],						//显示的时间,默认显示
            timeOldArr: [],
            timeChangeArr: [],
            timeSure: false,//时间标志位,标志是点击确定请求数据还是遮罩层消失
            timePickerOption: {
                shortcuts: [
                    {
                        text: '今天',
                        value: function () {
                            var start = new Date().setHours(0, 0, 0);
                            var end = new Date().setHours(23, 59, 59);
                            return [start, end];
                        }
                    },
                    {
                        text: '最近7天',
                        value: function () {
                            var start = new Date();
                            var end = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                            return [start.setHours(0, 0, 0), end.setHours(23, 59, 59)];
                        }
                    },
                    {
                        text: '最近30天',
                        value: function () {
                            var start = new Date();
                            var end = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                            return [start.setHours(0, 0, 0), end.setHours(23, 59, 59)];
                        }
                    },
                    {
                        text: '最近90天',
                        value: function () {
                            var start = new Date();
                            var end = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
                            return [start.setHours(0, 0, 0), end.setHours(23, 59, 59)];
                        }
                    }
                ],
                disabledDate: function (date) {
                    return date && date.valueOf() > Date.now();
                }
            },
            filterContent: [],//树环境所有内容
            filterInput: '',//输入查找关键字
            who: 0,
            rangePolice: null,
            alertTime: null,
            inDetailB: false,
            save_env_no: '',
            firstLoadReady: false,
            hasEnvs:false,
            init_key:false,
        }
	},
	ready:function(){
		var This=this;
		this.$content=$('#content');
		this.$body=this.$content.find('.body');
		this.$start_time=this.$content.find('.start_time');
		this.$end_time=this.$content.find('.end_time');
		this.$tree_box=this.$content.find('.tree_box');
		this.resize();
		var back_from_relic_detail;//标志位,页面从文物详情跳回
		if(sessionStorage.getItem('back_from_relic_detail')){
			back_from_relic_detail = JSON.parse(sessionStorage.getItem('back_from_relic_detail'));
			this.check_component('relic');
		}
		$.get('/2.2.05_P001/base_api/base/envs/tree/',{inc_equip:1},function(data){
			var filterContents=[];
			recursive(data,filterContents);
			This.filterContent = filterContents;

		});
        if (sessionStorage.getItem('save_env_no')){
            var save_env_no = sessionStorage.getItem('save_env_no');
            setTimeout(function(){
           		// console.log('发送ready');
				This.firstLoadReady = true;
                // console.log(save_env_no);
                // This.$broadcast('click_env',save_env_no);
			},0);
        }
	},
	activate:function(transition){
		var params=transition.from.params;
        if(!params){
            params={};
        }
        if(params.key){//保存跳转信息
            var sel_env=[];
            var sel_env_name=[];
            sel_env[0] = params.env_no;
            sel_env_name[0] = params.name;
            var time='24h';
            var param=['temperature','humidity'];
            this.keyword = params.name;
            this.init(sel_env,sel_env_name,time,param);
        }
		transition.next();
	},
	methods:{
        saveOldTime:function(open){
            if(open){
                this.timeSure = false;
                //拷贝一份原始的时间对象
                this.timeOldArr = JSON.parse(JSON.stringify(this.timeArr));
                this.timeChangeArr = JSON.parse(JSON.stringify(this.timeArr));
            }else{
                if(!this.timeSure){
                    this.timeArr = this.timeOldArr;
                }
            }
        },
        changeTime:function(val){
            this.timeArr = val.split(' - ').map(timeStamp);

            //是否需要将日期终点设置为23点59分59秒,需要添加一次判断,如果日期未发生变化,则只修改时间;
            var startDate1 = new Date(this.timeArr[0]),
                startDate2 = new Date(this.timeChangeArr[0]),
                endDate1 = new Date(this.timeArr[1]),
                endDate2 = new Date(this.timeChangeArr[1]);
            if((startDate1.getFullYear()===startDate2.getFullYear()&&endDate1.getFullYear()===endDate2.getFullYear())&&(startDate1.getDate()===startDate2.getDate()&&endDate1.getDate()===endDate2.getDate())&&(startDate1.getMonth()===startDate2.getMonth()&&endDate1.getMonth()===endDate2.getMonth())){//如果同年同月同日

            }else{//并非同年同日
                this.timeArr.$set(1,new Date(this.timeArr[1]).setHours(23,59,59));
            }
            this.timeChangeArr = this.timeArr;
            this.inDetailB = true;
        },
        requireData:function(){
            this.timeSure = true;
            $('.shadow').show();
            this.$broadcast("changeTimePolice",this.timeArr);
            this.getData();
        },
        resetTime:function(){
            var me = this;
            this.$nextTick(function(){
                    me.timeArr = [new Date().setHours(0,0,0)-24*60*60*1000,new Date().setHours(0,0,0)-1000];
                    $('.shadow').show();
                    me.getData();
                }
            );
        },
		getData:function(){
            var me = this;
            //把时间存储到路由信息
            me.$route.params.timeArr = this.timeArr;
            me.$route.params.timeStr = this.timeStr;
            if(this.sel_env&&this.sel_env.length!==0){

			}
            this.$nextTick(function(){
                me.$broadcast(me.com);
            });
		},
        // openTimePicker:function(type){//点击INPUT,弹出laydate选择日期层
        //     var me = this;
        //     laydate({
        //         format: 'YYYY-MM-DD hh:mm:ss',
        //         istime: true, //是否开启时间选择
        //         isclear:false,//是否显示清空
        //         issure:true,//是否显示确认
        //         max: laydate.now(), //时间范围为今天之前
        //         istoday: false, //是否显示今天
        //         choose:function(dates){
        //             me.pick_time[type] = dates;
        //             me.pick_time_status = checkTime(me.pick_time);
        //             if(!me.pick_time_status){
        //                 alert('输入日期有误,开始时间必须在结束时间之后!')
        //             }
        //         }
        //     });
        // },
		resize:function(){
			this.$body.css('height',this.$content.height()-84);
			this.shadowHeight=this.$body.height()-47;
			this.$tree_box.css('max-height',this.$content.height()-155);
		},
		check_component:function(type){		//切换功能视图
			var This=this;
			this.com='environment_'+type;
			setTimeout(function(){
				This.$broadcast(This.com);
			},0);
			this.shadowKey=true;
		},
		get_tree_data:function(params,fromDetail){			//获取环境树
            var me = this;
            $.get('/2.2.05_P001/base_api/base/envs/tree',{inc_equip:1},function(data){
            	if(!data||data=='[]'){
                    return;
                }
            	me.tree_list = data;
                var hash = location.hash,
                    replaceUrl = "#!/environment/environment_details/";
                var env_no = hash.replace(replaceUrl, '');
                if (env_no) {
                    var env_arr = env_no.split(',');
                    _.each(env_arr, function (env, index) {
                        setTimeout(function () {
                            // console.log('点击',env);
                            me.$broadcast('click_env', env);
                        }, 0);
                    });
                }else{
                	console.log(me.hasEnvs)
                    me.hasEnvs=true;
                }

                console.log('init');
                // if(fromDetail){
                //     me.dragDown(params);
                // }else {
                //
                // }
            });
     	},
     	searchArea:function(key){
     		this.$broadcast('search',this.area);
     	},
     	dragDown:function(params){
     		// console.log(params);
     		var This=this;
			// console.log(params.alertTime);
     		if(params&&params.key&&params.name){//保存跳转信息
	        	setTimeout(function(){
	            	This.$broadcast('search',params.name,params.env_no);
	        	},0);
	        }else if(params&&params.checkList){
	        	setTimeout(function(){
	            	params.checkList.forEach(function(con,i){
	            		This.$broadcast('search',con.name,con.env_no);
	            	});
	        	},0);
	        }
     	},
     	// timeChange:function(){
     	// 	var start_time=this.$start_time.val();
     	// 	var end_time=this.$end_time.val();
     	// 	if(start_time==''||end_time==''){
     	// 		alert('起止时间不能为空');
     	// 		return;
     	// 	}
			// this.time=start_time+','+end_time;
			// this.$broadcast(this.com);
     	// }
		detailBack:function(){
			window.history.go(-1);
		},
		filter_filterInput:function(name,key){
			return name.split(key).join(key);
		},
		keyDown:function(){
			var liLen = $("#searchUl").children('li').length-1;
			this.who++;
			if(this.who>liLen)this.who=0;
			$("#searchUl").scrollTop = 0;
		},
		keyUp:function(){
			var liLen = $("#searchUl").children('li').length-1;
			this.who--;
			if(this.who<0)this.who=liLen;
		},
		keyEnter:function(e){
			if(!this.filterInput)return;
			var element=e.target||e.srcElement;
			$('#searchUl').children('li')[this.who].click();
			element.blur();
			this.who=0;
			this.filterInput = '';
		},
		clickSearch:function(name,env){
			var This=this;
			setTimeout(function(){
				This.keyword=name;
				This.$broadcast('search',name,env);
				This.who=0;
			},0);
			This.filterInput = '';
		},
		clearEnv:function(){
			this.sel_env = [];
			sessionStorage.setItem('tree_list',JSON.stringify(this.sel_env.join()));//保存环境树的改变
			history.pushState(null,null,'#!/environment/environment_details/'+this.sel_env.join(','));
		},
		policeTimeFun:function(params){
			var newDay = new Date(params.alertTime);//触发点
			this.rangePolice = params.rangePolice;
			this.alertTime = params.alertTime;
			var day = newDay.getDate() ,
				afday = newDay.getDate()+1,
				year = newDay.getFullYear(),
				month = newDay.getMonth()+1,
				hour = '00',
				min = '00',
				sec = '00';
			var preDay = year +  '-' + month + '-' + day + ' '+ hour + ':' + min + ':' + sec;
			var currentDay = new Date();
			var afterDay = year +  '-' + month + '-' + afday + ' '+ hour + ':' + min + ':' + sec;
			if (year==currentDay.getFullYear() && month==currentDay.getMonth()+1 && currentDay.getDate() - day < 2){
				var currentDayMon = currentDay.getMonth()+1;
				currentDay = currentDay.getFullYear() +  '-' + currentDayMon + '-' + currentDay.getDate() + ' '+ currentDay.getHours() + ':' + currentDay.getMinutes() + ':' + currentDay.getSeconds();
				var timea = preDay + ' - ' + currentDay;
				this.timeArr = timea.split(' - ').map(timeStamp);
			}else if(currentDay.getDate() - afday > 1){
				var timeb = preDay + ' - ' + afterDay;
				this.timeArr = timeb.split(' - ').map(timeStamp);
			}
		}
	},
	computed:{
		envs:function(){
			return this.sel_env.join();
		},
        timeStr:function(){
            return this.timeArr.map(function(time){//时间戳精确单位,后台为s,前端为ms,舍弃前端时间戳后3位
                return Math.floor(time/1000);
            }).join(',');
        },
		envsShow:function () {
			console.log('sel_env',this.init_key,this.sel_env);
          	return  this.init_key?(this.sel_env.length?false:true):false;
        }
	},
	watch:{
		'filterInput':function(val,oldVal){
			if (this.filterInput == ''){
				this.who = 0;
			}
		}
	},
	events:{
		'sel_env':function(env_no,el,env_name){//选中环境
			//#!/environment/environment_details/62500000010101,62500000010104
			if(location.hash){
				var envsStr = location.hash.split('#!/environment/environment_details/')[1];
				if(envsStr===''){
                    history.pushState(null,null,location.href+env_no);
				}else{
                    var envs = envsStr.split(',');
                    if(envs.indexOf(env_no)===-1){
                        history.pushState(null,null,location.href+','+env_no);
                    }
				}
			}
			var me = this,
				back_from_relic_detail;
            if(this.sel_env.length<10){
                if(this.sel_env.indexOf(env_no)===-1){
                    this.sel_env.push(env_no);
                    setTimeout(function(){
                        me.$broadcast(me.com);
                    },0);
                    this.shadowKey=true;
                    this.env_name.push(env_name);
                }
			}else{
                this.$Modal.error({
                    title: '错误信息',
                    content: '对比环境数量最多为10个!'
                });
                el.attr('checked',false);
			}
            me.init_key=true;
			back_from_relic_detail = sessionStorage.getItem('back_from_relic_detail');
			sessionStorage.setItem('tree_list',JSON.stringify(this.sel_env.join()));//保存环境树的改变
        },
        'un_sel_env':function(env_no,el,env_name){
            if(location.hash){
                var envs = location.hash.split('#!/environment/environment_details/')[1].split(',');
                if(envs.indexOf(env_no)!==-1){
                	envs.$remove(env_no);
                	// console.log(location.hostname+location.pathname+'#!/environment/environment_details/'+envs.join(','));
                    history.pushState(null,null,'#!/environment/environment_details/'+envs.join(','));
                }
            }
			// console.log(location,env_no);
			var me = this;
			var index=this.sel_env.indexOf(env_no);
			if(index!==-1){
				this.sel_env.splice(index,1);
				this.env_name.splice(this.env_name.indexOf(env_name),1);
                setTimeout(function(){
                    me.$broadcast(me.com);//告诉子组件,反选环境
                },0);
			}
			this.shadowKey=true;
			sessionStorage.setItem('tree_list',JSON.stringify(this.sel_env.join()));//保存环境树的改变
        },
		tree_checked:function(){
			this.$broadcast('tree_checked');
		}
	},
	components: {
	   environment_curve:require('environmentalMonitoring/components/environment_curve'),
	   environment_data:require('environmentalMonitoring/components/environment_data'),
	   environment_equipment:require('environmentalMonitoring/components/environment_equipment'),
	   environment_map:require('environmentalMonitoring/components/environment_map'),
	   environment_relic:require('environmentalMonitoring/components/environment_relic')
	}
});

var checkTime = function(time){
    var status;
    if(Date.parse(time.start)&&Date.parse(time.end)){
        Date.parse(time.start) <= Date.parse(time.end) ? status = true : status = false;
    }
    return status;
};

var timeStamp = function(time){
    if(time){
        return Date.parse(time);
    }
};
function recursive(obj,arr){
	for(var i in obj){
		var data=obj[i];
		arr.push({name:data.name,env_no:data.env_no});
		if(data.children){
			recursive(data.children,arr);
		}
	}
}
function changeDays(date, value) {
	date.setDate(date.getDate() + value);
	return date;
}

});