// @require $
// @require vue
// @require _
// @require iview.css
// @require ../common/css/header.css
// @require ../common/css/left.css
// @require iview
// @require css/alert_list.css
// @require vue-router

require('../common/header');
var left = require('../common/left');
//进入设备报警列表时,保持左侧设备管理模块为选中状态
$('#left .equipment').addClass('v-link-active');

var vm = new Vue({
    el:'#app',
    data:{
        tableData:[],
        tableLoading:true,
        filter:{},
        relic_filter:[],
        limit:'',//当前每页数据条数
        page:1,//当前页码
        count:0,//当前分页数据总条数
        allPage:1,//总页数
        tableDataIndex:0,//用于异步握手的标志位
        filterObj:{}
    },
    created:function(){

    },
    ready:function(){
        // console.log('就绪');
        var wrapHeight = $('.tableWrap').height();
        this.limit = Math.floor(((wrapHeight-10)/40)-1);
        this.getData();
        //新增功能,进入报警列表时,记录用户查看预警的行为的时间
        $.post(API('/base/users/active/alert_activity'),{alert_type:"equip"},function(res){
            if(!res.result){
                me.$Message.error(res.msg);
            }else{

            }
        });
    },
    methods:{
        initNav:function(nav){
            var location = '';
            if(nav){
                for(var i=0,len=nav.length;i<len;i++){
                    location += nav[i].name;
                    if(i!==len-1){
                        location += ' > ';
                    }
                }
            }
            return location;
        },
        goBack:function(){
            history.go(-1);
        },
        getData:function(filterObj){
            var me = this;
            me.tableLoading = true;
            this.tableDataIndex++;
            var queryObj = {
                index:this.tableDataIndex,
                limit:this.limit,
                page:this.page
            };
            if(filterObj){
                // console.log(filterObj);
                this.filterObj = filterObj;
                if(filterObj.equip_alert_type&&filterObj.equip_alert_type.length!==0){
                    queryObj.type = filterObj.equip_alert_type.join(',');
                }
                if(filterObj.keyword&&filterObj.keyword!==''){
                    queryObj.id = filterObj.keyword;
                }
                if(filterObj.nodes&&filterObj.nodes.length!==0){
                    queryObj.env_no = filterObj.nodes.join(',');
                }
                if(filterObj.time&&filterObj.time.length===2){
                    var time = filterObj.time.map(function(val){
                        return Math.round(val/1000);
                    });
                    queryObj.alert_time = time.join(',');
                }
            }
            $.get(API('/env/equipments/alerts/alert_list'),queryObj,function(res){
                // console.log(res);
                me.tableLoading = false;
                if(res.index!=me.tableDataIndex){
                    return ;
                }
                me.tableDataIndex = 0;
                me.tableData = res.rows;
                me.count = res.total;
                me.allPage = Math.ceil(res.total/me.limit);
                // console.log(res.rows);
            });
        },
        turnPage:function(){
            this.tableLoading = true;
            this.getData(this.filterObj);
        },
        hideOverlay:function(){
            this.$broadcast('hideOverlay');
        },
        goEquipDetail:function(equip_no,type){
            if(type){
                window.sessionStorage.setItem('jump_to_detail_tab',type);
            }
            window.location.href='../equipManage/#/equip_info/'+equip_no;
        }
    },
    events:{
        reload_data:function(filterObj){
            this.page = 1;
            this.getData(filterObj);
        }
    },
    components:{
        left:left
    }
});