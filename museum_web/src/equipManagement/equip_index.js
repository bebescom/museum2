
// @require $
// @require _
// @require tooltip

require('../common/header');
var DomInfo = {
    bodyHeight: 0,//.body高度
}

module.exports = Vue.extend({
    template: '#equip_template',
    data: function(){      
        return {
            equip_manage_list:{},//设备列表数据
            equipListParam:{//设备列表请求参数
                index: 0,
                page: 1,
                limit: 0
            },
            equipListData:[],//设备列表数据
            equipListTableTitle: [//设备列表表格Title数据
                {
                    type: 'selection',
                    width: 55,
                    align: 'center'
                },
                {
                    title: '状态',
                    width: 80,
                    align: 'center',
                    key: 'status',
                    render: function(param, h,index){
                        if(param.status){
                            return '<span class="equip-status">'+ param.status +'</span>'
                        }
                        return '正常'
                    }
                },
                {
                    width: 350,
                    align: 'center',
                    title: '设备名称',
                    key: 'name'
                },
                {
                    width: 250,
                    align: 'center',
                    title: '设备ID',
                    key: 'id'
                },
                {
                    width: 350,
                    align: 'center',
                    title: '位置',
                    key: 'position'
                },
                {
                    align: 'center',
                    title: '消息',
                    key: 'message'
                }
            ],
            equipListTableBody: [],//设备列表表格Body数据
            pageListLen: 0,//每页条数
            pageListTotal: 0,//设备列表总数
            spinShow: true,//表格loading
            currentPage: 2,//当前页面，默认1
        }
    },
    ready: function(){
        getDomInfo();//获取Dom信息
        this.setParams();//设置参数
        this.getEquipList();//获取设备列表数据
    },
    computed: {

    },
    methods: {
        equipWarning: equipWarning,//设备报警
        getEquipList: function(){//获取设备列表数据
            var _this = this,collatingData = [];
            this.pageListLen = this.equipListParam.limit = Math.floor((DomInfo.bodyHeight - 41 - 100) / 49);//修正条数,设置每页条数
            $.get(API('/env/equipments/manage/equip_list'),this.equipListParam,function(data){
                console.log(data);
                _this.pageListTotal = data.count;//设置列表总数
                _this.equipListData = data;//获取设备列表数据
                var collatingData = utilMethods.collating(data);//整理列表数据   
                _this.equipListTableBody = collatingData;
                _this.currentPage = 1;
                _this.spinShow = false; 
                
            })
        },
        setParams: function(){
            
        },
        changePage: function(param){//page改变回调   
            this.spinShow = true;
            this.equipListParam.page = param;
            this.getEquipList();
        }
    },
    events: {
        get_equip_manage_params: function(filterInfo){
            this.spinShow = true;
            console.log(filterInfo);
            //参数转为字符串
            for(var i in filterInfo){
                this.equipListParam[i] = filterInfo[i].join(',');
            }
            this.equipListParam.page = 1;
            this.currentPage = 1;
            this.getEquipList();
        }
    }
});

function equipWarning(){//设备报警
    window.location.href = '../equipManagement/alert_list.html';
}

function getDomInfo(){//获取Dom信息
    DomInfo.bodyHeight = $('.body').height();
}

//逻辑性函数
var utilMethods = {
    collating: function(data){
        var _arr = [];
        data.rows.forEach(function(elem,index){
            var _obj = {};
            _obj.name = elem.name;
            _obj.status = elem.status;
            _obj.id = elem.equip_no;
            _obj.message = '哈哈';
            _obj.position = '嘻嘻';
            _arr.push(_obj);
        })
        return _arr;
    }
}
