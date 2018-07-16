// @require ./css/relicManagement.css
// @require ./css/relicsCheck.css

var route = new VueRouter();
module.exports = {
    route:{
        data:function(){
            this.tableData = [];
            if(this.limit){
                this.getData();
            }
        }
    },
    template:'#relicsCheck',
    data:function(){
        return {
            limit:'',//当前每页数据条数
            page:1,//当前页码
            count:0,//当前分页数据总条数
            allPage:1,//总页数
            tableData:[],
            tableLoading:true,
            tableDataIndex:0,//用于异步握手的标志位
        }
    },
    created:function(){

    },
    ready:function(){
        var wrapHeight = $('.tableWrap').height();
        //根据容器高度,计算出本页数据条数,根据高度计算,向下取整
        this.limit = Math.floor((wrapHeight/40)-1);
        //请求盘点计划列表
        this.getData();
    },
    methods:{
        formatTime:function(time){
            var dateObj = new Date(time);
            function addZero(val){
                return val<10?'0'+val:val;
            }

            // console.log(time);
            // console.log(dateObj.getFullYear());
            return dateObj.getFullYear()+'-'+addZero(dateObj.getMonth()+1)+'-'+addZero(dateObj.getDate())+' '+ addZero(dateObj.getHours()) + ':' + addZero(dateObj.getMinutes()) + ':' + addZero(dateObj.getSeconds());
        },
        goBack:function(){
            history.go(-1);
        },
        newPlanHandler:function(){
            // console.log('发起盘点');
            route.go('/relic/relicsCheck/newPlan');
        },
        turnPage:function(){
            this.tableLoading = true;
            this.getData();
        },
        goPlanDetail:function(n){
            // console.log('查看计划'+n+'详情');
            route.go('/relic/relicsCheck/planDetail/'+n);
        },
        getData:function(){
            var me = this;
            $.get(API('/relics/inventorytask/list/'+this.page+'/'+this.limit)+'?requestType=pc',function(res){
                // console.log(res);
                me.tableLoading = false;
                if(res.error_code!==0){
                    me.$Message.error(res.message);
                    return;
                }
                me.tableData = res.data.data;
                me.count = res.data.total;
                me.allPage = res.data.pages;
            })
            .error(function(error){
                me.$Message.error(error);
            })
        }
    }
};