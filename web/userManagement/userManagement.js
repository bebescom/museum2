define('userManagement', function(require, exports, module) {
var router = new VueRouter();
module.exports = Vue.extend({
    template: '#userManagement',
    data: function () {
        var me = this;
        return {
            users: [],//保存角色类型
            sectionHeight: 0,
            editItem: {},
            removeItem: {},
            page: 1,
            page_num: 0,
            total: 0,
            limit: 0,
            editId: '',
            showLoading:true,
            tableHead: [
                {
                    title: '用户名',
                    key: 'username',
                    ellipsis:true,
                },
                {
                    title: '昵称',
                    key: 'real_name',
                    ellipsis:true,
                },
                {
                    title: '用户角色',
                    key: 'role_names',
                    ellipsis:true,
                    align:'right'
                },
                {
                    title:' ',
                    width:36,
                    key:'role_names',
                    render: function (row, column, index) {
                        var permission = '',
                            placement = 'left-start';
                        //如果数据数量位于下半页,调整tip位置
                        if(index>=(me.limit/2)){
                            placement = 'left-end';
                        }
                        if(row.permission){
                            for(var key in row.permission){
                                permission += '<h5>'+key+'：</h5>';
                                permission += '<p style="max-width: 100%;">';
                                if(row.permission[key]&&row.permission[key].length!==0){
                                    row.permission[key].forEach(function(val,i){
                                        if(i<row.permission[key].length-1){
                                            permission += val.name+'/';
                                        }else{
                                            permission += val.name;
                                        }
                                    })
                                }
                                permission += '</p>';
                            }
                        }else{
                            permission = '-';
                        }
                        return '<Poptip trigger="hover" placement="'+placement+'" width="300">'+
                                    '<Icon type="information-circled" style="font-size:14px;"></Icon>'+
                                    '<div slot="title">'+
                                        '<h4>该用户拥有如下权限:</h4>'+
                                    '</div>'+
                                    '<div slot="content">'+
                                        <!--<img src="" alt="无法正常显示图片">-->
                                        permission+
                                    '</div>'+
                                '</Poptip>';
                    }
                },
                {
                    title: '操作',
                    key: 'id',
                    align:'center',
                    render: function (row, column, index) {
                        var btns = '';
                        if(checkPermissions({name:'修改用户'},false)){
                            btns += '<i-button icon="edit" style="margin-right:6px;" @click="editHandler('+index+')"></i-button>';
                        }
                        if(checkPermissions({name:'删除用户'},false)){
                            btns += '<i-button icon="trash-a" @click="removeHandler('+index+')"></i-button>';
                        }
                        return btns;
                    }
                }
            ]
        }
    },
    created: function () {

    },
    computed: {},
    ready: function () {
        this.sectionHeight = $('.userManagementSection').height() - 37;
        this.limit = Math.floor((this.sectionHeight - 40) / 48);
        this.getUserData();
    },
    methods: {
        // permissionHtml:function(index){//处理用户权限布局
        //     var permission = '<img title="无法正常显示" width="200" height="200"/>'+this.users[index].permission;
        //     return permission;
        // },
        goBack:function(){
            if(checkPermissions({name:'综合管理'})){
                //返回位置固定为综合管理,而非历史位置
                window.location.href="../capsule/#!/integrated";
            }
            // window.history.go(-1);
        },
        getUserData: function () {
            var me = this;
            me.showLoading = true;
            $.get('/2.2.05_P001/base_api/base/users', {limit: this.limit, page: this.page, sort_by: 'id'}, function (data) {
                if (data && data.rows && data.rows.length !== 0) {
                    me.users = data.rows;
                    me.total = data.total;
                    me.page_num = Math.ceil(me.total / me.limit);
                }
                me.showLoading = false;
            })
        },
        editHandler: function (index) {
            // console.log('编辑处理器',this.users[index]);
            if (this.users[index]) {
                router.go('/editUser/' + this.users[index].id);
            } else {
                console.error('发生错误', id);
            }
        },
        removeHandler: function (index) {
            var me = this;
            this.$Modal.confirm({
                title: '警告',
                content: '是否删除用户:' + '"'+this.users[index].username+'"',
                onOk: function () {
                    $.post('/2.2.05_P001/base_api/base/users/delete/' + me.users[index].id+'', function (data) {
                        if (data.msg) {
                            me.$Message.success(data.msg);
                            me.$broadcast('resetPage');
                            me.getUserData();
                        }
                    }).error(function (data) {
                        console.error(data);
                    });
                },
                onCancel: function () {
                    return false;
                }
            });
            // console.log('删除处理器',this.users[index]);
        }
    },
    events: {
        'turn-page': function () {
            // console.log('页面',this.page);
            this.getUserData();
        }
    }
});
});