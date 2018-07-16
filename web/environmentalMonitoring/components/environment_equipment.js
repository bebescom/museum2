define('environmentalMonitoring/components/environment_equipment', function(require, exports, module) {
// ;

var route = new VueRouter();

var param_unit_name = window.web_config.param_unit_name.sensor;

module.exports={
	template:'#environment_equipment',
	data:function(){
		return {
			equipment_rows:[],
			filter_list:{
				status:[],
				position:[],
				equip_type:[]
			},
			equipment_table_data_index:0,
			search_equipment_name:'',
			order_type:'A-Z',
			status:{
				equipment_status:false,
				equipment_name:false,
				equipment_nav:false,
				equipment_type:false
			},
			limit:10,//分页条数
			curr_page:1,//当前页码
			page_num:1,//保存总页数
			total:'-',//保存总的数据条数
			nav_list:[],//保存地址列表
			big_nav_status:false,
			nav_src:'',
			//设备类型
			equip_type:{
				sensor:[//传感器类型
					//"QCM传感器",
					//"二氧化碳传感器",
					//"光照紫外传感器",
					//"土壤温湿度传感器",
					//"安防传感器",
					//"温湿度传感器"
				],
				network: [//网络设备类型
					//"中继",
					//"网关"
				],
				offline: [//离线设备
					//"手持式温湿度检测仪"
				],
				controller: [
					//"调湿机"
				],
				box:[
					//智能囊匣传感器
				]
			},
			//设备状态
			equip_status:[],
			more_status:{//更多信息的窗口状态

			},
			nav_name:'',//位置泡泡
			big_nav_timer:null,//位置图定时器
			$content:null,
			$table_container:null,
			$wrapper:null,
			nav_map:'',
			nav_width:0,
			nav_height:0,
			newDataAll:""
		}
	},
	created:function(){
		//var equipment_filter_list;
		//if(sessionStorage.getItem('equipment_filter_list')){
		//	equipment_filter_list = JSON.parse(sessionStorage.getItem('equipment_filter_list'));
		//}
		//if(sessionStorage.getItem('back_from_equipment_detail')){
		//	back_from_equipment_detail = sessionStorage.getItem('back_from_equipment_detail');
		//}
		//if(sessionStorage.getItem('back_from_equipment_detail')){
		//	back_from_equipment_detail = sessionStorage.getItem('back_from_equipment_detail');
		//}

		//if(equipment_filter_list){//如果存在筛选条件
		//	this.filter_list = equipment_filter_list;
		//}
		//获取设备类型筛选列表
		this.get_equipment_type_filter_data();
		//获取设备状态筛选列表
		this.get_equipment_status();
	},
	ready:function(){
		this.$content = $('#content');
		this.$table_container = this.$content.find('.table_container');
		this.$wrapper = this.$content.find('.wrapper');
		$('body').tooltip({key:true});//向页面添加tooltip提示组件,:data-title添加提示信息
		this.resize();
	},
	methods:{
		resize:function(){
			var _height=this.$content.height()-240;
			this.$table_container.css({height:_height+'px'});
			this.$wrapper.css({height:_height+'px'});
			this.limit=Math.floor((_height-37)/42);
			this.$content.find('.equipment_type_filter_condition').css({'max-height':_height-127+'px','overflow-y':'scroll'});//设备类型筛选条件列表
		},
		nav_info:function(nav_list){
			var nav_str = [],
				nav_list_copy = [];
			if(nav_list){
				nav_list_copy=nav_list.slice(-3);
				$.each(nav_list_copy,function(i,n){
					nav_str.push(n.name);
				});
			}
			return nav_str.join(' > ');
		},
		get_equipment_table_data:function(env_no){//获取列表数据
			var env_str = '',me = this;
			if(!env_no){//如果没有传入参数，则按照左侧环境叔选择，查找全部
				env_str = this.envs;
			}else{
				env_str = env_no;
			}
			this.equipment_table_data_index++;//发送请求之前，给予此次请求唯一的标识信息
			$.get('/2.2.05_P001/base_api/env/monitor/equip?env_no='+env_str+'&no_name='+this.search_equipment_name+'&equip_type='+(this.filter_list.equip_type.join(',')+'&status='+(this.filter_list.status.join(','))+'&limit='+this.limit+'&page='+this.curr_page+'&index='+this.equipment_table_data_index),function(data){
				if(data.index == me.equipment_table_data_index){
					//console.log(data);
					me.equipment_table_data_index = 0;
					//总页码为总数/每页数量上取整
					me.total = data.total;
					me.page_num = Math.ceil(data.total/me.limit);
					if(data.rows){
						me.more_status = {};
						me.equipment_rows = data.rows;
						$.each(data.rows,function(i,n){
							if(!me.more_status[n.equip_no]){
								Vue.set(me.more_status,n.equip_no,false);
							}
						});
					}
				}
			});
		},
		get_equipment_type_filter_data:function(){
			var me = this;
			$.get('/2.2.05_P001/base_api/env/common/equip_type',function(data){
				// console.log(data);
				if(data){
					if(data.sensor){
						me.equip_type.sensor = data.sensor;
					}
					if(data.offline){
						me.equip_type.offline = data.offline;
					}
					if(data.controller){
						me.equip_type.controller = data.controller;
					}
					if(data.network){
						me.equip_type.network = data.network;
					}
					if(data.box){
						me.equip_type.box = data.box;
					}
				}
			});
		},
        get_equipment_status:function(){
			var me = this;
            $.get('/2.2.05_P001/base_api/env/equipments/count/status_count',function(res){
                // console.log(res);
                if(res){
                	me.equip_status = res;
				}
            });
		},
		show_filter_condition:function(key){
			this.status[key] = true;
		},
		hide_filter_condition:function(key){
			this.status[key] = false;
		},
		change_filter:function(status,condition_type){
			var me = this;
			if(!status||!condition_type){
				return;
			}
			if(this.filter_list[condition_type].indexOf(status)==-1){
				this.filter_list[condition_type].push(status);
			}else{
				this.filter_list[condition_type].$remove(status);
			}
			//sessionStorage.setItem('equipment_filter_list',JSON.stringify(this.filter_list));//保存筛选条件
			if(condition_type=='position'){
				if(this.env_name.length==2&&this.filter_list[condition_type].length==1){//当选中两个环境，位置条件仅包含一个时
					var index = this.env_name.indexOf(this.filter_list[condition_type][0]);//选中的环境编号
					setTimeout(function(){
						me.get_equipment_table_data(me.env_no_copy[index]);
					},0);
				}else{
					setTimeout(function(){
						me.get_equipment_table_data();
					},0);
				}
			}else{
				setTimeout(function(){
					me.get_equipment_table_data();
				},0);
			}
			me.curr_page = 1;
		},
		change_order_type:function(order){
			if(order){
				this.order_type = order;
			}
		},
		exact_search:function(){
			this.filter_list={
				status:[],
				position:[],
				equip_type:[]
			};
			this.get_equipment_table_data();
			this.$broadcast('resetPage');
		},
		calc_big_nav_position:function(x,y,map,locate){
			var target = $('.nav_pic'),
				nav_map = $('#nav_map');
			move_nav_map(nav_map,locate);
			//cut_position_map(target,map,locate);//裁切图片
			calc_target_position(target,x,y);
		},
		clear_search_equipment_name:function(){
			this.search_equipment_name='';
			this.get_equipment_table_data();
			this.$broadcast('resetPage');
		},
		//has_other_key:function(new_data,equipment_no){
		//	for(var key in new_data){
		//		if(key!='temperature'&&key!='humidity'){
		//			return true;
		//		}
		//	}
		//	return false;
		//},
		newDataEnd:function(data){
			if (data.new_data.length === 0){
				return '<span> - </span>'
			}
			var name = eName[data.equip_type]?eName[data.equip_type].name:'',equip_params_array = [],$span = "",$i = 0,$spanAll="";
			_.each(data.new_data,function(elem,index){
				$i++;
				equip_params_array[index] = elem + param_unit_name[index].unit;
				if ($i<=2){
					$span += '<span class="new_data_single">'+'<i class="new_data_single_img '+ index + '"></i>'+ equip_params_array[index] + '</span>';
				}
				$spanAll += '<span class="new_data_single">'+ equip_params_array[index] + '</span>';
			});
			return $span;
		},
		allNewDataEnd:function(data){
			if (data.new_data.length === 0){
				return ''
			}
			var $spanAll = "",equip_params_array = [];
			_.each(data.new_data,function(elem,index){
				equip_params_array[index] = elem + param_unit_name[index].unit;
				$spanAll += '<span class="new_data_single">'+'<i class="new_data_single_img '+ index + '"></i>'+ equip_params_array[index] + '</span>';
			});
			return $spanAll;
		},
		show_big_nav:function(e,map,locate,data){
			var me = this,
				target = e.srcElement|| e.target;
			this.nav_map = '';
			this.nav_map = map;
			if(locate){
				this.nav_width = locate.width||300;
				this.nav_height = locate.height||200;
			}
			this.nav_name = data.name;
			if(this.big_nav_timer){
				clearTimeout(this.big_nav_timer);
				this.big_nav_timer = null ;
			}
			this.big_nav_status = true;
			this.calc_big_nav_position($(target.parentNode)[0].offsetLeft+$(target)[0].clientWidth,$(target.parentNode)[0].offsetTop+$(target)[0].clientHeight,map,locate);
		},
		hide_big_nav:function(){
			var me = this;
			this.big_nav_timer = setTimeout(function(){
				me.big_nav_status = false;
			},200);
		},
		in_big_nav:function(){
			if(this.big_nav_timer){
				clearTimeout(this.big_nav_timer);
				this.big_nav_timer = null ;
			}
		},
		show_more:function(equipment_no){
			//this.more_status[equipment_no] = true;
		},
		hide_more:function(equipment_no){
			//this.more_status[equipment_no] = false;
		},
		go_equipment_detail:function(equip_no){
            if(checkPermissions({name:'设备管理'})){
                sessionStorage.setItem('back_from_equipment_detail',true);
                if(sessionStorage.getItem('tree_list')){
                    sessionStorage.setItem('tree_list_copy',sessionStorage.getItem('tree_list'));//拷贝一份环境树选择的记录信息
                }
				sessionStorage.setItem('equipNo',equip_no);
				window.location.href='../equipManage/#/equip_info/'+ equip_no ;
            }else{
                this.$Message.error('权限不足,请联系管理员');
            }
		}
	},
	props:['envs','time','env_name'],
	events:{
		environment_equipment:function(){
			var me = this;
			this.env_no = this.envs.split(',');
			this.env_no_copy = this.env_no.slice(0);//拷贝一份所选环境数组
			if(this.filter_list.position){//如果当前位置筛选条件中包括未被选中的条件，则移除相应的位置筛选条件
				$.each(this.filter_list.position,function(i,n){
					if(n&&me.env_name.indexOf(n)==-1){
						me.filter_list.position.$remove(n);
					}
				});
			}

			if(me.env_name.length==2&&me.filter_list.position.length == 1){//筛选了两个环境当中的一个
				var index = me.env_name.indexOf(me.filter_list.position.join());//选中的环境编号
				setTimeout(function(){
					me.get_equipment_table_data(me.env_no_copy[index]);//将环境参数传入
				},0);
			}else{
				setTimeout(function(){
					me.get_equipment_table_data();
				},0);
			}
			me.curr_page = 1;
		},
		'turn-page':function(){
			var me = this;
			if(me.env_name.length==2&&me.filter_list.position.length == 1){//筛选了两个环境当中的一个
				var index = me.env_name.indexOf(me.filter_list.position.join());//选中的环境编号
				setTimeout(function(){
					me.get_equipment_table_data(me.env_no_copy[index]);//将环境参数传入
				},0);
			}else{
				setTimeout(function(){
					me.get_equipment_table_data();
				},0);
			}
		}
	}
};

var calc_table_container_height = function(){
	//var _HEIGHT = $('.right_environment').height();
	//$('#equipment .table_container').css('height',_HEIGHT-102+'px');
};

var move_nav_map = function(nav_map,locate){
	//坐标点位于view可以框内部正中
	//console.log(nav_map,locate);
	var _width = 300,_height=200,_point_width=26,_point_height=32;//view框体宽高,可视区域
	if(locate){
		nav_map.css({left:-(parseFloat(locate.x)-_width/2)+'px',top:-(parseFloat(locate.y)-_height/2)+'px'});
	}else{
		nav_map.css({left:0,top:0});
	}
};

var cut_position_map = function(target,map,locate){
	var _width = 300,_height=200,position_str = '',
		_point_width=26,_point_height=32,point_left=0,point_top=0;
	position_str = calc_bg_position(locate,_width,_height);//计算背景图切图位置
	point_left = calc_point_position_left(locate,_width,_height);//计算标记点左侧偏移
	point_top = calc_point_position_top(locate,_width,_height);//计算标记点顶端偏移
	//console.log(point_left,point_top);
	target.find('div.bg').css({background:'url("'+map+'") no-repeat '+ position_str});
	target.find('div.point').css({left:point_left-_point_width/2+'px',top:point_top-_point_height+'px'});
};

var calc_bg_position = function(locate,_width,_height){//计算截图框体截图位置
	if(locate){
		if(locate.x&&locate.y){
			var position_x = parseFloat(locate.x) -_width/2,position_y = parseFloat(locate.y) - _height/2;
			if(parseFloat(locate.x)-_width/2<0){//左侧距离不足
				position_x = 0;
			}
			if(parseFloat(locate.x)+_width/2>parseFloat(locate.width)){//右侧距离不足
				position_x = parseFloat(locate.width) - _width;
			}
			if(parseFloat(locate.y)-_height/2<0){//上方距离不足
				position_y = 0;
			}
			if(parseFloat(locate.y)+_height/2>parseFloat(locate.height)){//下方距离不足
				position_y = parseFloat(locate.height) - _height;
			}
			return (-position_x)+'px '+ (-position_y)+'px ';
		}
	}
};

var calc_point_position_left = function(locate,_width,_height){//计算标记点左侧偏移
	if(locate){
		if(locate.x&&locate.y){
			var point_left = _width/2;
			if(parseFloat(locate.x)-_width/2<0){//左侧距离不足
				point_left = parseFloat(locate.x);
			}
			if(parseFloat(locate.x)+_width/2>parseFloat(locate.width)){//右侧距离不足
				point_left = _width+parseFloat(locate.x)-parseFloat(locate.width);
			}
			return point_left;
		}
	}
};
var calc_point_position_top = function(locate,_width,_height){//计算标记点顶端偏移
	if(locate){
		if(locate.x&&locate.y){
			var point_top = _height/2;
			if(parseFloat(locate.y)-_height/2<0){//顶端距离不足
				point_top = parseFloat(locate.y);
			}
			if(parseFloat(locate.y)+_height/2>parseFloat(locate.height)){//右侧距离不足
				point_top = _height+parseFloat(locate.y)-parseFloat(locate.height);
			}
			return point_top;
		}
	}
};

var calc_target_position = function(target,x,y){
	//小图标宽高为16*22
	var _WIDTH = target.width(),//当前图形框的宽度
		_HEIGHT = target.height(),//当前图形框的高度
		_SCROLL_X = $('.table_container').scrollLeft(),//当前容器的左边滚动条长度
		_SCROLL_Y = $('.table_container').scrollTop(),//当前容器的右边滚动条长度
		CONTAINER_WIDTH=$('.table_container').width(),//当前容器的宽度
		CONTAINER_HEIGHT=$('.table_container').height();//当前容器的高度
	//console.log(_WIDTH,_HEIGHT,_SCROLL_X,_SCROLL_Y,CONTAINER_WIDTH,CONTAINER_HEIGHT,x,y);
	var
		calc_x = x+_SCROLL_X+5,
		calc_y = y+_SCROLL_Y;
	if(calc_x+_WIDTH>=CONTAINER_WIDTH){
		calc_x = CONTAINER_WIDTH - _WIDTH;
	}
	if(calc_y+_HEIGHT>=CONTAINER_HEIGHT-13){
		calc_y = CONTAINER_HEIGHT - _HEIGHT - 13;
	}
	target.css({left:calc_x+'px',top:calc_y+'px'});
};

var eName = {
	'光照紫外传感器':{name : 'light_uv'},
	'温湿度传感器':{name : 'temperature_humidity'},
	'带屏温湿度传感器':{name : 'withScreen'},
	'二氧化碳传感器':{name : 'co2'},
	'有机挥发物传感器':{name : 'voc'},
	'空气质量传感器':{name : 'qcm'},
	'震动传感器':{name : 'vibration'},
	'玻破传感器':{name : 'broken'},
	'智能展柜传感器':{name : 'smart_shelves'},
	'室外气象站':{name : 'meteorological'},
	'土壤温湿度传感器':{name : 'soil_temperature_and_humidity'},
	'甲醛传感器':{name : 'formaldehyde'},
	'多维驻波传感器':{name : 'multidimensional_standing_wave'},
	'安防传感器':{name : 'security_sensors'},
	'手持式温湿度检测仪':{name : 'handheld_temperature_humidity'},
	'手持式光照紫外检测仪':{name : 'handheld_light_uv'},
	'手持式二氧化碳检测仪':{name : 'handheld_co2'},
	'手持式有机挥发物检测仪':{name : 'handheld_voc'},
	'手持式甲醛检测仪':{name : 'handheld_formaldehyde'},
	'网关':{name : 'gateway'},
	'中继':{name : 'relay'},
	'调湿机':{name : 'wet_machine'},
	'调湿剂':{name : 'wet_agent'},
	'吸附剂':{name : 'adsorbent'},
	'智能囊匣传感器':{name : 'smart_pouch_box'},
	'充氮调湿柜':{name : 'humidity_cabinet'}
}
});