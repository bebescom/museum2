define('relicManagement/relicsStorage', function(require, exports, module) {
// 
// 
// 
var upload = require('common/upload');

module.exports = Vue.extend({
    template:'#relicsStorage',
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
            show_key:false,     //添加文物弹框弹框
            hideFilter:[
                // '保存状态',
                // '年代',
                // '类别',
                // '位置',
                // '材质',
                // '等级',
                //
                // '待入库',
                '不需修复',
                '需要修复',
                '亟需修复',
                // '展陈',
                // '科研',
                // '修复',
                // '巡展',
                // '借出',
                '已归还',
                '借入',
            ],
            modalVisible:false,
            status:'',
            modalTableData:[],
            relicUploadVisible:false,//批量导入文物
            relicPicUploadVisible: false,//批量导入藏品图片
        }
    },
    created:function(){
        if(!checkPermissions({name:'文物管理'})){
            return;
        }

        // var This=this;
        /*筛选条件*/
        // $.get('/2.2.05_P001/base_api/relic/relics/count/filter_conditions',function(data){
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
    computed:{
        // downloadUrl:function(){
        //     console.log(window.web_config);
        //     return '/2.2.05_P001/base_api/relicBox/relicBoxTemplate.xls'+'&access_token='+window.web_config.token;
        // },
        uploadUrl:function(){//批量上传Excel
            return "/2.2.05_P001/base_api/relic/import/relics" + '?access_token='+window.web_config.token;

            // return '/2.2.05_P001/base_api/relicBox/importFromExcel'+'&access_token='+window.web_config.token;
        },
        uploadPicUrl:function(){//上传图片
            return "/2.2.05_P001/base_api/relic/import/images" + '?access_token='+window.web_config.token;
        }
    },
    methods:{
        // 文物批量导入功能
        showUpload:function(params){
            if(params.target.innerText === '导入藏品图片'){
                this.relicPicUploadVisible = true;
            }else{
                this.relicUploadVisible = true;
            }
            
        },
        downloadTemplate:function(){
            var me = this,
                config = {
                    from:"relic",
                    url:"/template/藏品导入表（示例）.xlsx"
                };
            // console.log('下载模版');
            $.get('/2.2.05_P001/base_api/base/download',config,function(res){
                if(!res.result){
                    me.$Message.error(res.url);
                }else{
                    if(typeof res.url === "string"){
                        // me.$Message.success(res.url+"开始下载!");
                        //拼接模版下载地址
                        var target = '/2.2.05_P001/base_api'+res.url.slice(1);
                        window.open(target);
                    }

                }
            })
            .error(function(res){
                me.$Message.error(res);
            })
        },

        storage_ok:function(){
            var me = this;
            if(this.selRelics&&this.selRelics.length!==0){
                if(!this.status){
                    this.$Message.warning('未选择入库状态');
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
                        url:'/2.2.05_P001/base_api/relics/instockRecord/instock'+'?requestType=pc&access_token='+window.web_config.token,
                        data:JSON.stringify(postData),
                        error:function(XMLHttpRequest, textStatus, errorThrown){
                            me.$Message.error(textStatus);
                        },
                        success:function(res, textStatus, jqXHR){
                            if(res&&res.error_code!==0){
                                me.$Message.error(res.message);
                                return ;
                            }else{
                                me.$Message.success(res.message);
                                me.tableLoading = true;
                                me.modalVisible = false;
                                me.page = 1;
                                me.selRelics = [];
                                me.modalTableData = [];
                                me.getRelic(me.filterObj);
                            }
                        }
                    });
                }
            }else{
                this.$Message.warning('未选中入库文物');
            }
        },
        storage_cancel:function(){
            this.modalVisible = false;
        },
        addRelic:function(){
            this.show_key=!this.show_key;
            //打开弹窗时,通知弹窗组件,把原有内容抹除
            this.$broadcast('cleanImg');
        },
        okHandler:function(){
            // console.log(this.selRelics,'确认入库');
            this.modalVisible = true;
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
            },0);
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
            // console.log('获取文物');
            var This=this;
            // this.filter.page=this.page;
            // this.filter.limit=this.limit;
            // this.tableDataIndex++;
            // this.filter.index = this.tableDataIndex;
            this.filter = {};
            this.filter.requestType = 'pc';
            this.filter.access_token = window.web_config.token;

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
                type:"GET",
                url:'/2.2.05_P001/base_api/relics/instockRecord/relic/list/'+this.page+'/'+this.limit+'',
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
        handleFormatError:function(file,fileList){//文件上传格式错误钩子函数
            //console.log(file,fileList);
            if (file){
                this.$Message.error('上传格式错误,请重新上传!');
            }
        },
        handleSuccess: function(data){
            // console.log(data);
            if(data.result){
                this.$Message.success('上传成功!');
            }else{
                this.$Message.error('上传失败!');
            }
        }
    },
    events:{
        reload_data:function(filterObj){
            this.page = 1;
            this.tableLoading = true;
            // console.log(filterObj);
            this.getRelic(filterObj);
        }
    },
    components:{
        'add-relic':{
            template:'#addDataRelic',
            props:['key'],
            data:function(){
                return {
                    tree_list:null,
                    urlRelic:'',
                    keyword:'',
                    sel_env:'',
                    session_key:true,
                    $treeSelect:null,	//dom
                    infor:'请选择位置',
                    addData:{
                        relic_id:'',
                        parent_env_no:'',
                        category:'',
                        age:'',
                        level:'',
                        status:'待入库',
                        name:'',
                        material:''
                    },
                    uploadImageShow:false,
                    uploadImageName:'',
                    rangeData:{
                        humidity_max:'',//湿度最大
                        humidity_min:'',//湿度最小
                        humidity_range:'',//湿度日波动
                        light_max:'',//光照最大
                        total_light:'',//光照总和
                        temperature_max:'',//温度最大
                        temperature_min:'',//温度最小
                        temperature_range:'',//温度日波动
                        uv_max:'',//紫外最大
                        voc_max:'',//有机挥发物最大
                    },
                    loginRelicNo:true,
                    // material_list:[],
                    // category_list:[],
                    // age_list:[],
                    // level_list:[]
                }
            },
            created:function(){
                this.urlRelic = '/2.2.05_P001/base_api/base/upload';
                this.get_tree_data();
                // this.get_filter_conditions();
            },
            ready:function(){
                this.$treeSelect=$('.treeSelect');
            },
            filters:{
                eliminate_space:{
                    read:function(val){
                        return val;
                    },
                    write:function(val){
                        return val.trim();
                    }
                }
            },
            methods:{
                get_filter_conditions:function(){
                    var me = this;
                    $.get('/2.2.05_P001/base_api/relic/relics/count/filter_conditions',function(res){
                        // console.log(res);
                        if(res){
                            me.material_list = res.material;
                            me.category_list = res.category;
                            me.age_list = res.age;
                            me.level_list = res.level;
                        }
                    });
                },
                get_tree_data:function(){
                    var me = this;
                    $.get('/2.2.05_P001/base_api/base/envs/tree',function(data){
                        if(!data||data=='[]'){
                            return;
                        }
                        me.tree_list=data;
                    });
                },
                showBox:function(){
                    this.$treeSelect.toggle();
                },
                close:function(){
                    this.key=false;
                },
                postOver:function(){
                    this.continueOver('true');//提交文物,关闭窗口
                },
                continueOver:function(key){
                    var This=this;
                    if (!this.loginRelicNo){
                        this.$Message.error('登记号输入格式错误(至少5位数字)!');
                        this.addData.relic_id = '';
                        return
                    }
                    if (!this.addData.relic_id){
                        this.$Message.warning('请填写总登记号!');
                        return
                    }
                    // console.log(this.addData.name);
                    if (!this.addData.name||this.addData.name.trim()===''){
                        this.$Message.warning('请填写文物名称!');
                        return
                    }
                    if (!this.addData.material){
                        this.$Message.warning('请填写材质!');
                        return
                    }
                    $.post('/2.2.05_P001/base_api/relic/relics/relics/add',this.addData,function(data){
                        // console.log(data);
                        var relic_no_copy = data.relic_no;
                        var relic_type_copy = This.addData.material;
                        var rangeData_copy = This.rangeData;
                        if(data.msg==='添加成功'){
                            This.addRelicImage(relic_no_copy);
                            This.$Message.success('添加成功!');
                            This.editRangeFun(rangeData_copy,relic_no_copy,relic_type_copy);
                            if(key==='true')This.close();
                            This.$dispatch('reloadTable');
                        }else{
                            This.$Message.error(data.msg);
                            return ;
                        }
                        //把提交对象全部清空
                        for(var i in This.addData){
                            if(i==='status'){
                                continue;
                            }
                            This.addData[i]='';
                        }
                        This.infor='请选择位置';
                    });
                },
                editRangeFun:function(rangeData,no,type){//添加文物时修改阈值函数
                    rangeData.no = no;
                    rangeData.type = type;
                    console.log(rangeData);
                    $.post('/2.2.05_P001/base_api/env/common/threshold/add_edit',rangeData,function(data){
                        console.log(data);
                    })
                },
                addRelicImage:function(no){
                    $.post('/2.2.05_P001/base_api/relic/relics/images/pic/'+no+'',{url:this.uploadImageUrl},function(data){

                    })
                },
                upload_layout:function(){
                    var _this = this;
                     //this.uploadImageName = '';
                     //this.uploadImageUrl = '';
                     //this.uploadImageShow = false;
                    upload({
                        data: {
                            path: 'area'
                        },
                        accept: 'image/jpg,image/jpeg,image/png',
                        success: function (data) {
                            if (data.error) {
                                _this.$Message.error('上传失败');
                                return;
                            }
                            _this.uploadImageName = data.file.name;
                            _this.uploadImageShow = true;
                            _this.uploadImageUrl = data.url;
                            _this.$Message.success('上传成功');
                        },
                        error: function (data) {
                            _this.$Message.error('上传失败');
                        }
                    });
                },
                handleClose:function(){
                    this.uploadImageShow = false;
                    this.uploadImageName = '';
                    this.uploadImageUrl = '';
                },
                meterial_change:function(data){//材质选择
                    var _this = this;
                    $.get('/2.2.05_P001/base_api/relic/common/relic_threshold/',{type:this.addData.material},function(data){
                        _this.rangeData.temperature_min = data.rows[0].temperature_min;
                        _this.rangeData.temperature_max = data.rows[0].temperature_max;
                        _this.rangeData.temperature_range = data.rows[0].temperature_range;
                        _this.rangeData.humidity_min = data.rows[0].humidity_min;
                        _this.rangeData.humidity_max = data.rows[0].humidity_max;
                        _this.rangeData.humidity_range = data.rows[0].humidity_range;
                        _this.rangeData.light_max = data.rows[0].light_max;
                        _this.rangeData.total_light = data.rows[0].total_light;
                        _this.rangeData.uv_max = data.rows[0].uv_max;
                        _this.rangeData.voc_max = data.rows[0].voc_max;
                    });
                },
                loginRelic:function(){
                    var pattern = /^\d{5,}$/;//至少输入5位数字
                    if (pattern.test(this.addData.relic_id)){
                        this.loginRelicNo = true;
                        return;
                    }else {
                        // this.$Message.error('登记号请输入至少5位数字');
                        this.loginRelicNo = false;
                    }
                }
            },
            events:{
                sel_env:function(env_no,$input,env_name){
                    this.$treeSelect.toggle();
                    this.infor=env_name;
                    this.addData.parent_env_no=env_no;
                },
                cleanImg:function(){
                    console.log('清除图片');
                    this.uploadImageName = '';
                    this.uploadImageUrl = '';
                    this.uploadImageShow = false;
                }
            }
        }
    }
});

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

});