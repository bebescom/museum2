// @require ./css/relicManagement.css
// @require ./css/relicsOutStorage.css
module.exports = {
    template:'#relicsOutStorage',
    route:{
        data:function(){
            this.tableData = [];
            this.tableLoading = true;
            if(this.limit){
                this.getRelic();
            }
        }
    },
    data:function(){
        return {
            filter:{},
            filterObj:{},
            relic_filter:[],
            limit:'',//当前每页数据条数
            page:1,//当前页码
            count:0,//当前分页数据总条数
            allPage:1,//总页数
            tableData:[],
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
                '展陈',
                '科研',
                '修复',
                '巡展',
                '借出',
                '已归还',
                '借入',
            ],
            modalVisible:false,
            status:'',
            modalTableData:[],
            needRepair:false
        }
    },
    created:function(){
        if(!checkPermissions({name:'文物管理'})){
            return;
        }

        // var This=this;
        /*筛选条件*/
        // $.get(API('/relic/relics/count/filter_conditions'),function(data){
        //     This.relic_filter=data;
        //     This.filter_height=$('.cultural_relics_screening').outerHeight(true);
        //     setTimeout(function(){
        //         var Height=$(window).height()-229;
        //         $('.scrollWrap').css('height',Height+'px');
        //     },0);
        // });
    },
    ready:function(){
        var wrapHeight = $('.tableWrap').height();
        //根据容器高度,计算出本页数据条数,根据高度计算,向下取整
        this.limit = Math.floor((wrapHeight/40)-1);
        this.getRelic();
    },
    methods:{
        out_storage_ok:function(){
            var me = this;
            if(this.selRelics&&this.selRelics.length!==0){
                if(!this.status){
                    this.$Message.warning('未选择出库状态');
                }else{
                    var postData = [];
                    for(var i=0,len=this.selRelics.length;i<len;i++){
                        if(this.selRelics[i]){
                            postData.push({
                                relicNo:this.selRelics[i],
                                status:this.status,
                                box: {
                                    serialNo: ""
                                }
                            })
                        }
                    }
                    $.ajax({
                        type:"POST",
                        url:API('/relics/outstockRecord/outstock')+'?requestType=pc',
                        data:JSON.stringify(postData),
                        error:function(XMLHttpRequest, textStatus, errorThrown){
                            me.$Message.error(textStatus);
                        },
                        success:function(res, textStatus, jqXHR){
                            if(res&&res.error_code!==0&&res.message==='出库失败'){
                                me.$Message.error(res.message);
                                return ;
                            }else{
                                me.$Message.success(res.message);
                                me.tableLoading = true;
                                me.modalVisible = false;
                                me.page = 1;
                                me.selRelics = [];
                                me.modalTableData = [];
                                me.getRelic();
                            }
                        }
                    });
                }
            }else{
                this.$Message.warning('未选中入库文物');
            }
        },
        out_storage_cancel:function(){
            this.modalVisible = false;
        },
        okHandler:function(){
            this.modalVisible = true;
            this.needRepair = false;
            if(this.modalTableData&&this.modalTableData.length!==0){
                for(var i=0,len=this.modalTableData.length;i<len;i++){
                    // console.log(this.modalTableData[i]);
                    if(this.modalTableData[i].status==='亟需修复'){
                         this.needRepair = true;
                         break;
                    }
                }
            }
            // console.log(this.modalTableData);
        },
        goBack:function(){
            history.go(-1);
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
                if(me.allStatus){
                    if(me.tableData&&me.tableData.length!==0){
                        me.tableData.forEach(function(relic,index){
                            if(me.selRelics.indexOf(relic.relicNo)===-1){
                                me.selRelics.push(relic.relicNo);
                                me.modalTableData.push(relic);
                            }
                        });
                    }
                }else{
                    if(me.tableData&&me.tableData.length!==0){
                        me.tableData.forEach(function(relic,index){
                            var relicIndex = me.selRelics.indexOf(relic.relicNo);
                            if(relicIndex!==-1){
                                me.selRelics.splice(relicIndex,1);
                                me.modalTableData.splice(relicIndex,1);
                            }
                        });
                    }
                }
                // console.log(me.modalTableData,me.selRelics);
            });
        },
        changeRelic:function(relic){
            var me = this,
                relicIndex = me.selRelics.indexOf(relic.relicNo);
            setTimeout(function(){
                me.allStatus = checkAllStatus(me.tableData,me.selRelics);
                if(relicIndex===-1){
                    me.modalTableData.push(relic);
                }else{
                    me.modalTableData.splice(relicIndex,1);
                }
            },0);
        },
        removeRelic:function(relic){
            var relicIndex = this.selRelics.indexOf(relic.relicNo);
            this.selRelics.splice(relicIndex,1);
            this.modalTableData.splice(relicIndex,1);
            this.allStatus = checkAllStatus(this.tableData,this.selRelics);
            //删除一个文物后,检查是否还有文物是亟需修复状态
            this.needRepair = false;
            if(this.modalTableData&&this.modalTableData.length!==0){
                for(var i=0,len=this.modalTableData.length;i<len;i++){
                    // console.log(this.modalTableData[i]);
                    if(this.modalTableData[i].status==='亟需修复'){
                         this.needRepair = true;
                         break;
                    }
                }
            }
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
                    nav_str.unshift(n.name);
                });
            }
            return nav_str.join(' > ');
        },
        turnPage:function(){
            this.tableLoading = true;
            this.getRelic(this.filterObj);
        },
        getRelic:function(filterObj){
            var This=this;
            // this.filter.page=this.page;
            // this.filter.limit=this.limit;
            // this.tableDataIndex++;
            // this.filter.index = this.tableDataIndex;
            this.filter = {};
            this.filter.requestType = 'pc';

            if(filterObj){
                this.filterObj = filterObj;
                if(filterObj.relic_age&&filterObj.relic_age.length!==0){
                    this.filter.age = filterObj.relic_age.join(',');
                }
                if(filterObj.relic_category&&filterObj.relic_category.length!==0){
                    this.filter.category = filterObj.relic_category.join(',');
                }
                if(filterObj.relic_level&&filterObj.relic_level.length!==0){
                    this.filter.level = filterObj.relic_level.join(',');
                }
                if(filterObj.relic_material&&filterObj.relic_material.length!==0){
                    this.filter.material = filterObj.relic_material.join(',');
                }
                if(filterObj.relic_status&&filterObj.relic_status.length!==0){
                    this.filter.status = filterObj.relic_status.join(',');
                }
                if(filterObj.keyword&&filterObj.keyword!==''){
                    this.filter.name = filterObj.keyword;
                }
                if(filterObj.nodes&&filterObj.nodes.length!==0){
                    this.filter.envNo = filterObj.nodes.join(',');
                }
            }
            $.ajax({
                type:'GET',
                url:API('/relics/outstockRecord/relic/list/'+this.page+'/'+this.limit),
                data:this.filter,
                error:function(XMLHttpRequest, textStatus, errorThrown){
                    This.$Message.error(textStatus);
                },
                success:function(res, textStatus, jqXHR){
                    // console.log(res);
                    This.tableLoading = false;
                    if(res.error_code!==0){
                        This.$Message.error(res.message);
                        return;
                    }
                    This.count = res.data.total;
                    This.allPage = res.data.pages;
                    This.tableData = res.data.data;

                    This.allStatus = checkAllStatus(res.data.data,This.selRelics);
                }
            });
        },
        jumpDetails:function(relic_no){
            window.location.href='../relic/index.html?relic_no='+relic_no;
        },
    },
    events:{
        reload_data:function(filterObj){
            // console.log(filterObj);
            this.page = 1;
            this.tableLoading = true;
            this.getRelic(filterObj);
        }
    }
};

function checkAllStatus(arr,selRelics){
    // console.log(arr,selRelics);
    //检查本页是否被全选
    var allStatus = true;
    if(arr&&arr.length!==0){
        $.each(arr,function(index,relic){
            if(selRelics.indexOf(relic.relicNo)===-1){
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
