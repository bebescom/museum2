define('relicManagement/relic', function(require, exports, module) {
// 
var route = new VueRouter();
module.exports={
	template:'#relic_template',
	route:{
		data:function(){
			if(!checkPermissions({name:'文物管理'})){
				return;
			}
			// this.getEcharts();
			// this.getRelic();
			var This=this;
			/*筛选条件*/
			$.get('/2.2.05_P001/base_api/relic/relics/count/filter_conditions',function(data){
				This.relic_filter=data;
				This.filter_height=$('.cultural_relics_screening').outerHeight(true);
				setTimeout(function(){
					var Height=$(window).height()-229;
					$('.scrollWrap').css('height',Height+'px');
				},0);
			});
		}
	},
	data:function(){
		return {
			relic_filter:'',
			// waterfall:{},
			filterObj:{},
			filter:{},
			filter_height:0,
			showfooter:true,
			timeout:'',
			limit:'',//当前每页数据条数
			page:1,//当前页码
			count:0,//当前分页数据总条数
            allPage:1,//总页数
            tableData:[],
			key:true,
			footer:'',
			echarts_key:true,
			relic_key:true,
			showLoading:false,
            tableLoading:true,
			tableDataIndex:0,//用于异步握手的标志位
            selRelics:[],//标志每一个复选框是否被选中
			allStatus:false,
            big_img_status:false,//文物图显示及隐藏
            big_nav_status:false,//位置图显示及隐藏
            nav_src:'',
            img_src:'',
            nav_name:'',//位置图泡泡
            nav_map:'',
            nav_width:0,
            nav_height:0,
            big_nav_timer:null,
            hideFilter:[
                // '保存状态',
                // '年代',
                // '类别',
                // '位置',
                // '材质',
                // '等级',

                '待入库',
                // '不需修复',
                // '需要修复',
                // '亟需修复',
                // '展陈',
                // '科研',
                // '修复',
                // '巡展',
                // '借出',
                // '已归还',
                // '借入',
			],
			configLanguage: window.languages,
		}
	},
	computed:{
		// isreturn:function(){
		// 	return this.echarts_key&&this.relic_key;
		// }
	},
	ready:function(){
		var me = this;
		// laydate.skin('molv');
		if (sessionStorage.deleteRelicNo){//检查是否删除文物
			this.deleteRelicMessage();
		}
		// var width=$('.scrollWrap').width();
		// this.limit=parseInt(width/311*2)+1;
		$('body').tooltip({key:true});
        var wrapHeight = $('.tableWrap').height();
        // console.log(wrapHeight);
        //根据容器高度,计算出本页数据条数,根据高度计算,向下取整
        this.limit = Math.floor((wrapHeight/40)-1);
        this.getRelic();
        // window.onresize = function(){
	 	//    wrapHeight = $('.tableWrap').height();
	 	//    me.limit = Math.floor((wrapHeight/40)-1);
		//	  重新获取表格数据
		// 	  me.getRelic();
		// };
	},
	methods:{
		relicsOverviewSheet:function(){
			// $.get("/2.2.05_P001/base_api/relic/export/relics",function(data){
			// 	console.log('test',data);
			// 	if(data&&data.result){
			// 		console.log(data);
			// 		//window.location.href = data.url;
			// 		var target = '/2.2.05_P001/base_api'+data.url.slice(1);
			// 		window.open(target);
			// 	}
			// });
            var _this = this;
            var json = {};
            var date = new Date();
            json.file_name = '藏品信息表_' + date.getFullYear() + date.getMonth() + date.getDate();
            json.api_url = "get/relic/export/relics";
            // console.log(json);
            window.new_down(json);

		},
        goRelicsStorage:function(){
			// console.log('跳转到文物入库');
			route.go('relic/relicsStorage');
		},
		goRelicsOutStorage:function(){
			// console.log('跳转到文物出库');
			route.go('relic/relicsOutStorage');
		},
		goRelicsCheck:function(){
			// console.log('跳转到文物盘点');
			route.go('relic/relicsCheck');
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
            this.calc_big_nav_position(e,$(target.parentNode)[0].offsetLeft+$(target)[0].clientWidth,$(target.parentNode)[0].offsetTop+$(target)[0].clientHeight,map,locate);
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
        calc_big_nav_position:function(e,x,y,map,locate){
            var target = $('.nav_pic'),
                nav_map = $('#nav_map');
            move_nav_map(nav_map,locate);
            //cut_position_map(target,map,locate);//裁切图片
            calc_target_position(e,target,x,y);
        },
        show_big_img:function(e,img_src){
            var target = e.srcElement|| e.target;
            var positionNode = $(target.parentNode.parentNode)[0];//父级元素用于计算定位
            this.img_src='';
            this.big_img_status = true;
            this.img_src=img_src;
            this.calc_big_img_position(e,positionNode.offsetLeft+$(target)[0].offsetLeft+$(target)[0].clientWidth,positionNode.offsetTop+$(target)[0].offsetTop+$(target)[0].clientHeight);
        },
        hide_big_img:function(){
            this.img_src='';
            this.big_img_status = false;
        },
        calc_big_img_position:function(e,x,y){
            var target = $('.relic_pic');
            calc_target_position(e,target,x,y);
        },
        changeStatus:function(){
        	var me = this;
        	setTimeout(function(){
                // console.log(me.allStatus);
                if(me.allStatus){
                    if(me.tableData&&me.tableData.length!==0){
                        me.tableData.forEach(function(relic,index){
                            if(me.selRelics.indexOf(relic.relic_no)===-1){
                                me.selRelics.push(relic.relic_no);
                            }
                        });
                    }
                }else{
                    if(me.tableData&&me.tableData.length!==0){
                        me.tableData.forEach(function(relic,index){
                            var relicIndex = me.selRelics.indexOf(relic.relic_no);
                            if(relicIndex!==-1){
                                me.selRelics.splice(relicIndex,1);
                            }
                        });
                    }
                }
                // console.log(me.selRelics);
			},0);
		},
        changeRelic:function(relic_no){
        	var me = this;
			setTimeout(function(){
                me.allStatus = checkAllStatus(me.tableData,me.selRelics);
			},0);
			// console.log(this.selRelics,relic_no);
            // if(me.selRelics.indexOf(relic_no)===-1){
				// me.allStatus = checkAllStatus(me.tableData,me.selRelics);
            // }else{
            //     if(me.allStatus){
            //         me.allStatus = false;
            //     }
            // }
		},
		goEnvDetail:function(env_no){
            if(checkPermissions({name:'环境监控'})){
                route.go('/environment/environment_details/'+env_no);
            }
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
		// scroll:function(){
		// 	var $scrollWrap=$('.scrollWrap'),
		// 		$scrollContent=$scrollWrap.find('.scrollContent'),
		// 		$drag=$scrollWrap.find('.drag'),
		// 		scrollContentHeight=$scrollContent.height(),				//真实高度
		// 		allScrollTop=scrollContentHeight-$scrollWrap.height(),
		// 		nowTop=-$scrollContent.position().top,
		// 		scale=nowTop/allScrollTop,
		// 		This=this;
        //
		// 	$drag.css({'opacity':1});
		// 	clearTimeout(this.timeout);
		// 	this.timeout=setTimeout(function(){
		// 		$drag.css({'opacity':0});
		// 	},500);
        //
		// 	if(scale>=1)scale=1;
		// 	if(nowTop<=this.top&&nowTop!=0){
		// 		this.showfooter=false;
		// 	}else if(nowTop>this.top&&scale==1){
		// 		this.showfooter=true;
		// 	}
        //
		// 	if(scale>=0.7&&this.key&&nowTop>this.top){
		// 		this.key=false;
		// 		loading.call(this);
		// 	}else{
		// 		$drag.css("top",scale*(scrollContentHeight-$drag.height())+'px');
		// 	}
        //
		// 	this.top=nowTop;
		// 	if(this.hasNot){
		// 		$(window).resize(function(){
		// 			$drag.css("top",scale*(scrollContentHeight-$drag.height())+'px');
		// 		});
		// 		this.hasNot.false;
		// 	}
		// },
		getEcharts:function(){
			var This=this;
			var key1=key2=false;
		
			this.$broadcast('showLoad');
			$.get('/2.2.05_P001/base_api/relic/relics/count/category_count',this.filter,function(data){//获取材质饼图数据
				This.$broadcast('relic_type',data);
				key1=true;
				This.echarts_key=key1&&key2;
			});
			$.get('/2.2.05_P001/base_api/relic/relics/count/age_count',this.filter,function(data){//获取年代饼图数据
				This.$broadcast('relic_age',data);
				key2=true;
				This.echarts_key=key1&&key2;
			});
		},
		turnPage:function(){
			this.tableLoading = true;
			this.getRelic(this.filterObj);
		},
		getRelic:function(filterObj,resetId){
            this.tableLoading = true;
            var filter = JSON.parse(JSON.stringify(this.filter));
			// console.log(filterObj);
			var This=this;
			filter.page=this.page;
			filter.limit=this.limit;
			this.tableDataIndex++;
			filter.index = this.tableDataIndex;
			if(filterObj){
				this.filterObj = filterObj;
				if(filterObj.relic_age&&filterObj.relic_age.length!==0){
                    filter.age = filterObj.relic_age.join(',');
				}
				if(filterObj.relic_category&&filterObj.relic_category.length!==0){
					filter.category = filterObj.relic_category.join(',');
				}
				if(filterObj.relic_level&&filterObj.relic_level.length!==0){
                    filter.level = filterObj.relic_level.join(',');
				}
				if(filterObj.relic_material&&filterObj.relic_material.length!==0){
					filter.material = filterObj.relic_material.join(',');
				}
				if(filterObj.relic_status&&filterObj.relic_status.length!==0){
					filter.status = filterObj.relic_status.join(',');
				}
				//目前该参数无效,预期是按照文物名称和总登记号模糊查询
				if(filterObj.keyword&&filterObj.keyword!==''){
                    filter.id = filterObj.keyword;
                    if(resetId==''){//当请求为清空时，filter.id为空
                        filter.id='';
					}
				}

				if(filterObj.nodes&&filterObj.nodes.length!==0){
					filter.parent_env_no = filterObj.nodes.join(',');
				}
			}
			$.get('/2.2.05_P001/base_api/relic/relics/manage/relic_list',filter,function(data){
                // if(This.tableDataIndex !== data.index){
                //     //握手失败
                //     return;
                // }
                This.tableLoading = false;
				if(data.error){
					This.$Message.error(data.error);
					return;
				}
				This.count = data.count;
				This.allPage = Math.ceil(data.count/This.limit);
                This.tableData = data.rows;
                This.allStatus = checkAllStatus(data.rows,This.selRelics);
			});
		},
		rename:function(obj){
			var name=[];
			for(var i=obj.length-1;i>=0;i--){
				name.push(obj[i].name);
				if(i==obj.length-2){
					break;
				}
			}
			return name.reverse().join('>');
		},
		resetOption:function(filter,hall){//filter删选条件  hall楼层编号
			this.tableLoading = true;
			var obj={};
			for(var i in filter){
				if(i=='hall'){
					obj.parent_env_no=hall.join(',');
				}else{
					obj[i]=filter[i].join(',');
				}
			}
			this.filter=obj;

			this.page=1;
			/*$('.scrollWrap')[0].scrollTop=0;*/
			// this.getEcharts();
			this.getRelic();
			// this.footer='';
            //
			// this.echarts_key=false;
			// this.relic_key=false;
		},
		jumpDetails:function(relic_no){
			window.location.href='../relic/index.html?relic_no='+relic_no;
		},
		deleteRelicMessage:function(){
			var relic_no = sessionStorage.deleteRelicNo;
			this.$Message.success('成功删除文物' + relic_no);
			sessionStorage.removeItem('deleteRelicNo');
		}
	},
	events:{
		reload_data:function(filterObj,resetId){
			this.page = 1;
			this.getRelic(filterObj,resetId);
		}
	}
};

function loading(){
	this.page++;
	this.filter.page=this.page;
	if(this.footer!='已无更多数据'){
		this.showLoading=true;
	}
	var This=this;
	$.get('/2.2.05_P001/base_api/relic/relics/manage/relic_list',this.filter,function(data){
		This.showLoading=false;
		// This.waterfall=This.waterfall.concat(data.rows);
		This.key=true;
		if(data.rows.length==0){
			This.page--;
			This.footer='已无更多数据';
		}else{
			This.footer='';
		}
	});
}

function checkAllStatus(arr,selRelics){
	// console.log(arr,selRelics);
    //检查本页是否被全选
    var allStatus = true;
    if(arr&&arr.length!==0){
        $.each(arr,function(index,relic){
            // console.log(relic);
            // console.log(selRelics,relic.relic_no);
            if(selRelics.indexOf(relic.relic_no)===-1){
                allStatus = false;
                return false;
            }
        });
    }
    return allStatus;
}

var move_nav_map = function (nav_map,locate){
    //坐标点位于view可以框内部正中
    // console.log(nav_map,locate);
    var _width = 300,_height=200,_point_width=26,_point_height=32;//view框体宽高
    if(locate){
        nav_map.css({left:-(parseFloat(locate.x)-_width/2)+'px',top:-(parseFloat(locate.y)-_height/2)+'px'});
    }else{
        nav_map.css({left:0,top:0});
    }
};

var calc_target_position = function (e,target,x,y){
    //小图标宽高为16*22
    var _WIDTH = target.width(),//当前图形框的宽度
        _HEIGHT = target.height(),//当前图形框的高度
        _SCROLL_X = $('.relicTableContainer').scrollLeft(),//当前容器的左边滚动条长度
        _SCROLL_Y = $('.relicTableContainer').scrollTop(),//当前容器的右边滚动条长度
        CONTAINER_WIDTH=$('.relicTableContainer').width(),//当前容器的宽度
        CONTAINER_HEIGHT=$('.relicTableContainer').height();//当前容器的高度
    // console.log(_WIDTH,_HEIGHT,_SCROLL_X,_SCROLL_Y,CONTAINER_WIDTH,CONTAINER_HEIGHT,x,y);
    var calc_x = x+_SCROLL_X+5,
        calc_y = y+_SCROLL_Y;
    if(calc_x+_WIDTH>=CONTAINER_WIDTH){
        calc_x = CONTAINER_WIDTH - _WIDTH;
    }
    if(calc_y+_HEIGHT>=CONTAINER_HEIGHT-13){
        calc_y = CONTAINER_HEIGHT - _HEIGHT - 13;
    }
    target.css({left:calc_x+'px',top:calc_y+'px'});
};
});