define('environmentalMonitoring/components/environment_map', function(require, exports, module) {
// ;
module.exports={
	template:'#environment_map',
    data:function(){
        return {
            env_list:[],//根据环境树选择获得的环境列表
            curr_env:{},//当前下拉框选择的环境
            curr_map:'',//当前环境地图
            // curr_locate:false,//当前环境
            map_index:0,
            curr_env_no:false,
            tooltip:'',
            imgUrl:'',
            imgWidth:0.5,//默认宽度是50%
            left:0,//图片容器距离左端的距离
            top:0,//图片容器距离顶端的距离
            leftStart:0,
            topStart:0,
            mapPointData:false,
            mapPointLeft:0,
            mapPointTop:0
        }
    },
	created:function(){

	},
	ready:function(){
		$('body').tooltip({key:true});
	},
	computed:{
        imgStyle:function(){
            return 'width:'+this.imgWidth+'px;left:'+this.left+'px;top:'+this.top+'px;';
        },
        pointStyle:function(){
            return 'left:'+this.mapPointLeft+'px;top:'+this.mapPointTop+'px;';
        }
	},
	methods:{
		get_map_data:function(){
			var me = this;
			me.map_index++;
			$.get('/2.2.05_P001/base_api/env/monitor/map?env_no='+this.envs+'&index='+this.map_index+'',function(data){
				if(data.index==me.map_index){
					me.map_index = 0;
					me.env_list = data.env;
					me.change_map(me.curr_env_no);
                    //console.log(imgViewHeight,imgHeight);
                    // $imgBox.css({'margin-top':'-200px','margin-left':'-200px'})
				}
			});
		},
		change_map:function(curr_env_no){
		    //想隐藏图片
            this.imgUrl = '';
            //重置图片尺寸,位置
			this.imgWidth = 1000;
			this.left = 0;
			this.top = 0;
			//console.log(this.env_list);
			//console.log(curr_env_no);
			this.curr_env_no = curr_env_no;
			this.curr_env = this.env_list[curr_env_no];//获得当前环境的相关信息
			if(this.curr_env&&this.curr_env.map){
				// this.curr_map = this.curr_env.map;
				// console.log(this.curr_map);
				// set_map_bg(this.curr_env.map);
                this.imgUrl = this.curr_env.map;
                //如果没有locate字段,默认图片宽度为1000
                this.imgWidth = this.curr_env.locate.width||1000;
                // console.log(this.imgUrl);
			}
			// this.curr_locate = this.curr_env.locate;
			this.mapPointData = this.curr_env;
			// console.log(this.mapPointData);
			if(this.mapPointData){
				// set_map_point(this.curr_locate);
                this.tooltip = this.curr_env.name||'';
			}
            this.calcPoint(this.curr_env);
		},
        calcPoint:function(data){
            var pointer = document.getElementById('mapPoint');
			if(data.locate){
                var locate = data.locate,
                    pointerCss = getComputedStyle(pointer),
                    pointerWidth = parseFloat(pointerCss.width),
                    pointerHeight = parseFloat(pointerCss.height);
                // locate.width,locate.height  原图宽高
                // console.log(this.imgWidth);
                this.mapPointLeft = (locate.x-pointerWidth/2);
                this.mapPointTop = (locate.y-pointerHeight);
			}
        },
        scaleImg:function(e){
            // console.log(e);
            // console.log(this.imgWidth);
            var me = this,
				scale = 1,
				positionScale = 0.1;
            if(e.deltaY<0){//放大
                scale += positionScale;
            }else {//缩小
                scale -= positionScale;
            }
            this.imgWidth *= scale;
            // console.log(this.imgWidth);
            //当图片尺寸发生变化时,相应比例调整x,y坐标位置,调整比例
            setTimeout(function(){
                me.changePosition();
            },0)
        },
        changePosition:function(){
            var BOX = $('#imgBox'),
                BOX_WIDHT = BOX.width(),
                BOX_HEIGHT = BOX.height(),
                pointer = document.getElementById('mapPoint'),
                pointerCss = getComputedStyle(pointer),
                pointerWidth = parseFloat(pointerCss.width),
                pointerHeight = parseFloat(pointerCss.height),
                locateX,locateY,locateWidth,locateHeight;
            // console.log(BOX_WIDHT,BOX_HEIGHT);
            // console.log(pointerWidth,pointerHeight);
            // console.log(this.curr_env);
            if(this.curr_env&&this.curr_env.locate){
                locateX = this.curr_env.locate.x;
                locateY = this.curr_env.locate.y;
                locateWidth = this.curr_env.locate.width;
                locateHeight = this.curr_env.locate.height;
                // console.log((BOX_WIDHT/locateWidth),(BOX_HEIGHT/locateHeight));
                this.mapPointLeft = (locateX*(BOX_WIDHT/locateWidth)-pointerWidth/2);
                this.mapPointTop = (locateY*(BOX_HEIGHT/locateHeight)-pointerHeight);
            }
		},
        resetImg:function(){
            var me = this;
            this.imgWidth = this.curr_env.locate.width||1000;
            this.left=0;
            this.top=0;
            setTimeout(function(){
                me.changePosition();
            },0)
        },
        dragStart:function(e){//模拟拖拽行为开始,鼠标按下
            var target = e.srcElement || e.target,
                me = this;
            e.preventDefault();
            this.leftStart = e.offsetX;
            this.topStart = e.offsetY;

            //移动元素处理
            var moveHandler = function(e){
                e.preventDefault();
                e.stopPropagation();
                me.left += (e.offsetX - me.leftStart);
                me.top += (e.offsetY - me.topStart);
            };
            //拖动结束时处理
            var upHandler = function(e){
                e.preventDefault();
                e.stopPropagation();
                me.leftStart += e.offsetX;
                me.topStart += e.offsetY;
                document.removeEventListener('mouseup',upHandler);
                document.removeEventListener('mousemove',moveHandler);
                document.removeEventListener('mouseout',upHandler);
            };
            //鼠标离开时处理
            if(document.addEventListener){
                document.addEventListener("mousemove",moveHandler);
                document.addEventListener("mouseup",upHandler);
                document.addEventListener("mouseout",upHandler);
            }
        }
	},
	props:['envs','time','env_name'],//envs为编号信息，env_name为名称信息
	events:{
		environment_map:function() {//当树形列表发生改变时，参数发生相应变化，并改变页面数据
			// console.log(this.envs);
			var arr = this.envs.split(',');
			if(this.envs&&this.env_name){
				if(arr.indexOf(this.curr_env_no)===-1){
					this.curr_env_no = arr[0];
				}
				this.get_map_data();
			}else if(this.envs===''){//反选所有环境
				// set_map_bg();//隐藏地图
				// console.log('没得环境被选中');
				this.mapPointData = false;//隐藏标记点
				this.curr_env_no = false;//取消当前选中项目
				this.imgUrl = '';//清空背景图片
				this.env_list= [];//清空下拉列表
			}
		}
	}
};
var set_map_bg = function(map){
	if(map){
		$('#map_bg').css({background:'#fff url('+map+') no-repeat 0 0',backgroundSize:'100% 100%'});
	}else{
		$('#map_bg').css({background:'none'});
	}
};
var set_map_point = function(locate){//需要按照图片目前拉伸的比例,计算点的位置
	if(locate){
		if(locate.x&&locate.y){
			var bg_width = locate.width,//背景地图原宽度
				bg_height = locate.height,//背景地图原高度
				_container = $('#map_bg'),//当前地图尺寸
				_width = _container.width(),//获得当前容器的宽
				_height = _container.height(),//获得当前容器的高
				point_width =24,//point宽度
				point_height=30;//point高度
			var x_scale = _width/bg_width,y_scale = _height/bg_height;//获取背景图片相较原尺寸缩放比例
			$('#map_point').css({left:locate.x*x_scale-point_width/2+'px',top:locate.y*y_scale-point_height+'px'});
		}else{
			$('#map_point').css({left:0,top:0});
		}
	}
};
});