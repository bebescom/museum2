define('environmentalMonitoring/components/environment_relic', function(require, exports, module) {
// ;
module.exports={
    template:'#environment_relic',
    data:function(){
        return {
            relic_rows:[],
            filter_list:{
            	status:[],
            	material:[],
            	category:[],
            	age:[],
            	position:[]
            },
            status:{
                relic_status:false,
                relic_name:false,
                relic_material:false,
                relic_category:false,
                relic_age:false,
                relic_nav:false
            },
            search_relic_name:'',
            order_type:'A-Z',
            material_list:[

            ],
            material_first_word_list:[],
            material_first_word:'全部',//默认显示全部材质
            category_list:[

            ],
            category_first_word_list:[],
            category_first_word:'全部',//默认显示全部类型
            age_list:[

            ],
            age_first_word_list:[],
            age_first_word:'全部',//默认显示全部类型
            status_list:[],
            limit:10,
            curr_page:1,
            page_num:1,//保存总页数
            total:'-',//保存总的数据条数
            relic_table_data_index:0,//异步握手标志位
            big_img_status:false,
            big_nav_status:false,
            nav_src:'',
            img_src:'',//图片地址
            env_no:[],//选择环境编号
            env_no_copy:[],//选择环境编号的副本
            big_nav_timer:null,//位置图消失定时器
            nav_name:'',//位置图泡泡
            $content:null,
            $table_container:null,
            $wrapper:null,
            nav_map:'',
            nav_width:0,
            nav_height:0,
            tree_checked:0,//保存环境树被勾选的次数
        }
    },
    computed:{//页面筛选

    },
    created:function(){
        var relic_filter_list = sessionStorage.getItem('relic_filter_list');
        var back_from_relic_detail = sessionStorage.getItem('back_from_relic_detail');
        if(relic_filter_list&&back_from_relic_detail){//如果存在筛选条件
            this.filter_list = JSON.parse(relic_filter_list);
        }
        //获取状态,类别，材质，年代筛选条件
        this.get_filter_conditions();

        this.tree_checked = 0;
    },
    ready:function(){
        this.$content = $('#content');
        this.$table_container = this.$content.find('.table_container');
        this.$wrapper = this.$content.find('.wrapper');
        $('body').tooltip({key:true});
        this.resize();
    },
    methods:{
        resize:function(){
            var _height=this.$content.height()-240;
            this.$table_container.css({height:_height+'px'});
            this.$wrapper.css({height:_height+'px'});
            this.limit=Math.floor((_height-37)/42);
            //console.log(_height,this.limit);
            $('.material_filter_condition').css({'max-height':_height-127+'px','overflow-y':'scroll'});//材质筛选条件高度设置
            $('.category_filter_condition').css({'max-height':_height-127+'px','overflow-y':'scroll'});//类别筛选条件高度设置
            $('.age_filter_condition').css({'max-height':_height-127+'px','overflow-y':'scroll'});//年代筛选条件高度设置
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
        get_filter_conditions:function(){
            var me = this;
            $.get('/2.2.05_P001/base_api/relic/relics/count/filter_conditions',function(data){
                if(data){
                    me.age_list = data.age;
                    me.category_list = data.category;
                    me.material_list = data.material;
                    me.status_list = data.status;
                }
            });
        },
        get_relic_table_data:function(env_no){//获取列表数据
            var env_str = '',me = this;
            if(!env_no){//如果没有传入参数，则按照左侧环境叔选择，查找全部
                env_str = this.envs;
            }else{
                env_str = env_no;
            }
            this.relic_table_data_index++;//发送请求之前，给予此次请求唯一的标识信息
            $.get('/2.2.05_P001/base_api/relic/monitor/relic?env_no='+env_str+'&no_name='+this.search_relic_name+'&age='+(this.filter_list.age.join(',')+'&status='+(this.filter_list.status.join(','))+'&category='+(this.filter_list.category.join(','))+'&material='+(this.filter_list.material.join(','))+'&limit='+this.limit+'&page='+this.curr_page+'&index='+this.relic_table_data_index),function(data){
                if(data.index == me.relic_table_data_index){
                    //console.log(data);
                    me.relic_table_data_index = 0;
                    //总页码为总数/每页数量上取整
                    me.total = data.total;
                    me.page_num = Math.ceil(data.total/me.limit);
                    if(data.rows){
                        me.relic_rows = data.rows;
                    }
                }
            });
        },
        show_filter_condition:function(key){
            this.status[key] = true;
        },
        hide_filter_condition:function(key){
            this.status[key] = false;
        },
        change_filter:function(status,condition_type){//
            var me = this;
            if(!status||!condition_type){
                return;
            }
            if(this.filter_list[condition_type].indexOf(status)==-1){
                this.filter_list[condition_type].push(status);
            }else{
                this.filter_list[condition_type].$remove(status);
            }
            sessionStorage.setItem('relic_filter_list',JSON.stringify(this.filter_list));//保存筛选条件
            if(condition_type=='position'){
                if(this.env_name.length==2&&this.filter_list[condition_type].length==1){//当选中两个环境，位置条件仅包含一个时
                    var index = this.env_name.indexOf(this.filter_list[condition_type][0]);//选中的环境编号
                    setTimeout(function(){
                        me.get_relic_table_data(me.env_no_copy[index]);
                    },0);
                }else{
                    setTimeout(function(){
                        me.get_relic_table_data();
                    },0);
                }
            }else{
                setTimeout(function(){
                    me.get_relic_table_data();
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
                material:[],
                category:[],
                age:[],
                position:[]
            };
            this.get_relic_table_data();
            this.$broadcast('resetPage');
        },
        clear_search_relic_name:function(){
            this.search_relic_name='';
            this.get_relic_table_data();
            this.$broadcast('resetPage');
        },
        sel_material_first_word:function(material_first_word){
            this.material_first_word = material_first_word;
        },
        sel_category_first_word:function(category_first_word){
            this.category_first_word = category_first_word;
        },
        sel_age_first_word :function(sel_age_first_word){
            this.age_first_word = sel_age_first_word;
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
        go_relic_detail:function(relic_no){
            if(checkPermissions({name:'文物管理'})){
                var tree_list_copy;
                //保存环境树及筛选条件
                //因目前文物详情是跳往路由以外位置，需要单独保存文物标签页到本地存储
                sessionStorage.setItem('back_from_relic_detail',true);
                if(sessionStorage.getItem('tree_list')){
                    sessionStorage.setItem('tree_list_copy',sessionStorage.getItem('tree_list'));//拷贝一份环境树选择的记录信息
                }
                window.location.href='../relic/index.html?relic_no='+relic_no;
            }else{
                this.$Message.error('权限不足,请联系管理员');
            }
        }
    },
    props:['envs','time','env_name'],//envs为编号信息，env_name为名称信息
    events:{
        environment_relic:function(){//当树形列表发生改变时，参数发生相应变化，并改变
            this.env_no = this.envs.split(',');
            this.env_no_copy = this.env_no.slice(0);//拷贝一份所选环境数组
            var me = this;
            if(this.filter_list.position){//如果当前位置筛选条件中包括未被选中的条件，则移除相应的位置筛选条件
                $.each(this.filter_list.position,function(i,n){
                    if(n&&me.env_name.indexOf(n)==-1){
                        me.filter_list.position.$remove(n);
                    }
                });
            }
            if(me.env_name.length==2&&me.filter_list.position.length == 1){//筛选了两个环境当中的一个
                var index = me.env_name.indexOf(me.filter_list.position.join(','));//选中的环境编号
                setTimeout(function(){
                    me.get_relic_table_data(me.env_no_copy[index]);//将环境参数传入
                },0);
            }else{
                setTimeout(function(){
                    me.get_relic_table_data();
                },0);
            }
            me.curr_page = 1;
        },
        'turn-page':function(){
            var me = this;
            if(me.env_name.length==2&&me.filter_list.position.length == 1){//筛选了两个环境当中的一个
                var index = me.env_name.indexOf(me.filter_list.position.join(','));//选中的环境编号
                setTimeout(function(){
                    me.get_relic_table_data(me.env_no_copy[index]);//将环境参数传入
                },0);
            }else{
                setTimeout(function(){
                    me.get_relic_table_data();
                },0);
            }
        },
        tree_checked:function(){
            //console.log('勾选一个')
            this.tree_checked++;
            //console.log('执行tree_checked');
            if(this.tree_checked == this.env_name.length){
                sessionStorage.removeItem('back_from_relic_detail');
            }
        }
    }
};

// var calc_table_container_height = function(){
//     var _HEIGHT = $('.right_environment').height();
//     $('#relic .table_container').css('height',_HEIGHT-102+'px');
// };

var move_nav_map = function(nav_map,locate){
    //坐标点位于view可以框内部正中
    // console.log(nav_map,locate);
    var _width = 300,_height=200,_point_width=26,_point_height=32;//view框体宽高
    if(locate){
        nav_map.css({left:-(parseFloat(locate.x)-_width/2)+'px',top:-(parseFloat(locate.y)-_height/2)+'px'});
    }else{
        nav_map.css({left:0,top:0});
    }
};

// var cut_position_map = function(target,map,locate){
//     var _width = 300,_height=200,position_str = '',
//         _point_width=26,_point_height=32,point_left=0,point_top=0;
//     position_str = calc_bg_position(locate,_width,_height);//计算背景图切图位置
//     point_left = calc_point_position_left(locate,_width,_height);//计算标记点左侧偏移
//     point_top = calc_point_position_top(locate,_width,_height);//计算标记点顶端偏移
//     //console.log(point_left,point_top);
//     target.find('div.bg').css({background:'url("'+map+'") no-repeat '+ position_str});
//     target.find('div.point').css({left:point_left-_point_width/2+'px',top:point_top-_point_height+'px'});
// };

// var calc_bg_position = function(locate,_width,_height){//计算截图框体截图位置
//     var position_x = 0,position_y = 0;
//     if(locate){
//         position_x = parseFloat(locate.x) -_width/2;
//         position_y = parseFloat(locate.y) - _height/2;
//         if(parseFloat(locate.x)-_width/2<0){//左侧距离不足
//             position_x = 0;
//         }
//         if(parseFloat(locate.x)+_width/2>parseFloat(locate.width)){//右侧距离不足
//             position_x = parseFloat(locate.width) - _width;
//         }
//         if(parseFloat(locate.y)-_height/2<0){//上方距离不足
//             position_y = 0;
//         }
//         if(parseFloat(locate.y)+_height/2>parseFloat(locate.height)){//下方距离不足
//             position_y = parseFloat(locate.height) - _height;
//         }
//     }
//     return (-position_x)+'px '+ (-position_y)+'px ';
// };

// var calc_point_position_left = function(locate,_width,_height){//计算标记点左侧偏移
//     var point_left = _width/2;
//     if(locate){
//         if(parseFloat(locate.x)-_width/2<0){//左侧距离不足
//             point_left = parseFloat(locate.x);
//         }
//         if(parseFloat(locate.x)+_width/2>parseFloat(locate.width)){//右侧距离不足
//             point_left = _width+parseFloat(locate.x)-parseFloat(locate.width);
//         }
//     }
//     return point_left;
// };

// var calc_point_position_top = function(locate,_width,_height){//计算标记点顶端偏移
//     var point_top = _height/2;
//     if(locate){
//         if(parseFloat(locate.y)-_height/2<0){//顶端距离不足
//             point_top = parseFloat(locate.y);
//         }
//         if(parseFloat(locate.y)+_height/2>parseFloat(locate.height)){//右侧距离不足
//             point_top = _height+parseFloat(locate.y)-parseFloat(locate.height);
//         }
//     }
//     return point_top;
// };

var calc_target_position = function(e,target,x,y){
    //小图标宽高为16*22
    var _WIDTH = target.width(),//当前图形框的宽度
        _HEIGHT = target.height(),//当前图形框的高度
        _SCROLL_X = $('.table_container').scrollLeft(),//当前容器的左边滚动条长度
        _SCROLL_Y = $('.table_container').scrollTop(),//当前容器的右边滚动条长度
        CONTAINER_WIDTH=$('.table_container').width(),//当前容器的宽度
        CONTAINER_HEIGHT=$('.table_container').height();//当前容器的高度
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