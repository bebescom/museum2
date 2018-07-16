define('capsule/capsule_content', function(require, exports, module) {
// 

module.exports=Vue.extend({
	template:'#capsule_template',
	data:function(){
		return {
			contentName:'智能囊匣',
			police:0,		//当前警报
			capsule:0,		//智能囊匣
			page:1,			//当期页数
			limit:'',		//查找多少条数据
			arrList:[],		//获取到的数据
			key:true,		//判断数据还有没有
			top:0,			//滚轮上一次的top值
			hasNot:true,	//判断给window加事件
			timeout:'',		//滚轮延迟消失
			footer:'',		//显示‘已无更多数据’
			showfooter:true,	//是否显示‘已无更多数据’
			filterContent:[],	//筛选框内容
			env_no:'',
			showKey:false,
			arrListLength:1
		}
	},
	methods:{
		scroll:function(){
			var $capsuleBox=$('.capsuleBox'),
				$wrap=$capsuleBox.find('.wrap'),
				$drag=$capsuleBox.find('.drag'),
				wrapHeight=$wrap.height(),
				allScrollTop=wrapHeight-$capsuleBox.height(),
				nowTop=-$wrap.position().top,
				scale=nowTop/allScrollTop,
				This=this;

			$drag.css({'opacity':1});
			clearTimeout(this.timeout);
			this.timeout=setTimeout(function(){
				$drag.css({'opacity':0});
			},500);

			if(nowTop<=this.top){
				this.showfooter=false;
			}else if(nowTop>this.top&&scale==1){
				this.showfooter=true;
			}

			if(scale>=0.7&&this.key&&nowTop>this.top){
				this.key=false;
				loading.call(this);
			}else{
				$drag.css("top",scale*(wrapHeight-$drag.height())+'px');
			}

			this.top=nowTop;
			if(this.hasNot){
				$(window).resize(function(){
					$drag.css("top",scale*(wrapHeight-$drag.height())+'px');
				});
				this.hasNot.false;
			}
		},
		mouseenter_:function(e){
			var element=e.target||e.srcElement;
			$(element).children('ul').stop().slideDown(500);
			$('.now').addClass('active');
		},
		mouseenter:function(e){
			var element=e.target||e.srcElement,
				$element=$(element),
				key=$element.attr('key'),
				$ul=$element.children('ul'),
				liLength=$ul.children().length,
				top=0;

			if(liLength>=key){
				top=-31*(key-1);
			}

			$ul.css('top',top).stop().slideDown(500);
			$('.now').addClass('active');
		},
		mouseleave:function(e){
			var element=e.target||e.srcElement;
			$(element).children('ul').stop().slideUp(500);
			$('.now').removeClass('active');
		},
		filter:function(env,name){
			var This=this;
			this.page=1;
			this.footer='';
			$('.now').html(name);
			this.arrListLength=1;
			this.env_no=name=='全部'?'':'?parent_env_no='+env;
			this.arrList=[];
			$('.capsuleBox').css('background','');
			console.log(this.env_no,name);
			$.get('/2.2.05_P001/base_api/env/box/box_lists/'+this.page+'/'+this.limit+this.env_no,function(data){
				console.log(data);
				This.arrList=[];
				$('.capsuleBox').scrollTop(0).css('background','none');
				This.arrList=data.rows;
				This.arrListLength=data.rows.length;
				//console.log(data.rows)
			});
		}
	},
	events:{
		'alert-id':function(data){
			this.$broadcast('alert-id',data);
		},
		'successful':function(name){
			this.police--;
			this.arrList.forEach(function(con,i){
				if(con.env_no==name){
					con.alert='';
					return;
				}
			});
		}
	},
	created:function(){
		var This=this;
		$.get('/2.2.05_P001/base_api/base/envs/tree/',function(data){
			//console.log(data);
			This.filterContent=digui(data);
		});
		socket_(this);

		function digui(arr){
			arr.sort(function(a,b){
				return a.sort-b.sort;
			});
			for(var i=0,len=arr.length;i<len;i++){
				if(arr[i].children!=null){
					digui(arr[i].children);
				}
			}
			return arr;
		}
	},
	ready:function(){
		//console.log($(window).height())
		var width=$('.wrap').width();
		this.limit=parseInt(width/300*2)+1;
		//console.log(this.limit)
		var This=this;
		$.get('/2.2.05_P001/base_api/env/box/box_lists/'+this.page+'/'+this.limit+this.env_no,function(data){
			$('.capsuleBox').css('background','none');
			This.arrList=data.rows;
			This.police=data.alert_count;
			This.capsule=data.count;
		});
		var This=this;
		$('.capsuleBox').css('height',$('body').height()-109);

	},
	components:{
		'equip':{
			template:'#equip',
			props:['data','showKey'],
			created:function () {

            },
			methods:{
				showAdd:function(env_no){
					var This=this;
					this.showKey=!this.showKey;
					$.get('/2.2.05_P001/base_api/env/box/box_alert/'+env_no,function(data){
						//console.log(data)
						This.$dispatch('alert-id',data);
					});
				}
			},
			computed:{
				judge:function(){
					var diff=this.data.alert_diff;
					var bias=diff>0?'偏高':'偏低';
					return bias+Math.abs(diff);
				}
			}
		},
		'remove-tooltip':{
			template:'#removeTooltip',
			props:['showKey'],
			data:function(){
				return {
					data:{},
					text:''
				}
			},
			watch:{
				showKey:function(new_){
					if(new_){
						this.data={};
					}
				}
			},
			methods:{
				close:function(){
					this.showKey=!this.showKey;
				},
				clearAleart:function(){
					var This=this;
					$.post('/2.2.05_P001/base_api/env/box/clear_alert/'+this.data.env_no+'?remark='+this.text||'',function(data){
						// alert(data.msg);
						This.$Message.info(data.msg);
						This.showKey=false;
						if(data.msg==='处理成功'){
							This.$dispatch('successful',This.data.env_no);
						}
					});
				}
			},
			events:{
				'alert-id':function(data){
					this.data=data;
				}
			}
		}
	}
});

function loading(){
	this.page++;
	var This=this;
	$.get('/2.2.05_P001/base_api/env/box/box_lists/'+this.page+'/'+this.limit+this.env_no,function(data){
		//console.log('/2.2.05_P001/base_api/env/box/box_lists/'+This.page+'/'+This.limit+This.env_no)
		This.arrList=This.arrList.concat(data.rows);
		This.key=true;
		if(data.rows.length==0){
			This.page--;
			This.footer='已无更多数据';
		}else{
			This.footer='';
		}
	});
}
function socket_(obj){

	var socket=require('common/socket.io');

	//预警
	socket.on('alert_msg', function (data) {
		console.log(data);
		var num=0;
		obj.arrList.forEach(function(con,i){
			if(con.env_no==data.env_no){
				con.alert=data.alert;
				if(data.alert=='temperature'||data.alert=='humidity'){
					con.alert_diff=data.msg*1;
					data.temperature&&(con.temperature=data.temperature);
					data.humidity&&(con.humidity=data.humidity);
				}
			}
			if(con.alert){
				num++;
			}
		});
		obj.police=num;
	});

	socket.on('env_msg', function (data) {
		console.log("env_msg :",data);
	});

	socket.on('equip_msg', function (data) {
		console.log("equip_msg :",data);
	});

}

});