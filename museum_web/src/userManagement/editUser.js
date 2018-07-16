var router = new VueRouter();

module.exports = Vue.extend({
    template:'#editUser',
    route:{
        data:function(params){
            var hash = window.location.hash,
                id,
                me=this,
                mapIDToName = {},
                mapNameToID = {};
            $.get(API('/base/roles'),function(data){
                data.rows.forEach(function(elem,index){
                    if(index!=='total'){
                        me.roleList.push(elem.name);//获取角色列表
                        mapIDToName[elem.id] = elem.name;
                        mapNameToID[elem.name] = elem.id;
                    }
                });
                me.mapIDToName = mapIDToName;//保存角色映射,id->角色名
                me.mapNameToID = mapNameToID;//保存角色映射,角色名->id
                if(hash){
                    id = hash.split('#!/editUser/')[1];
                    me.userID = id;
                    //发出请求,查询用户为ID的用户
                    $.get(API('/base/users/info/'+id),function(data){
                        console.log(data);
                        var obj = {
                            name: '',//登录名称username
                            nickname:'',//昵称tel
                            passwd: '',//密码
                            passwdCheck: '',//检测密码
                            userRole: []//用户角色
                        };
                        if(data){
                            if(data.username){
                                obj.name = data.username;
                            }
                            if(data.real_name){
                                obj.nickname = data.real_name;
                            }
                            if(data.tel){
                                obj.phoneNumber=data.tel;
                            }
                            if(data.email){
                                obj.mail=data.email;
                            }
                            if(data.role_ids){
                                var role_ids = data.role_ids.split(',');
                                // console.log(role_ids);
                                // console.log(me.mapIDToName,me.mapNameToID);
                                obj.userRole = role_ids.map(function(id){
                                    if(!me.mapIDToName[id]&&!me.mapNameToID[id]){
                                        //如果不存在该角色,则临时将该角色添加到双向映射,并且将该角色添加到复选框选项
                                        if(!me.mapIDToName[id]){
                                            me.mapIDToName[id] = id;
                                        }
                                        if(!me.mapNameToID[id]){
                                            me.mapNameToID[id] = id;
                                        }
                                        if(me.roleList.indexOf(id)===-1){
                                            me.roleList.push(id);
                                        }
                                    }
                                    return me.mapIDToName[id]||id;
                                });
                            }
                            console.log(obj);
                            me.formValidate = obj;
                        }
                    }).error(function(data){
                        console.error(data);
                    })
                }else{
                    this.$Message.error('获取用户编号异常')
                }
            });
        }
    },
    watch:{

    },
    data:function(){
        var _this = this;
        var validatePass = function (rule, value, callback){
            if (value !== _this.formValidate.passwdCheck||value !== _this.formValidate.passwd) {
                callback(new Error('两次输入密码不一致!'));
            } else {
                callback();
            }
        };
        var validateUser = function(rule, value, callback){
            var regEmail=/^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/,
                regTel=/^1[34578]\d{9}$/;
            if(!regEmail.test(value)&&!regTel.test(value)){
                callback(new Error('登录名格式必须为电子邮件或手机号码格式'));
            }else{
                callback();
            }
        };
        var validateRole = function(rule, value, callback){
            if(value&&value.length!==0){
                callback();
            }else{
                callback(new Error('请为用户分配角色'));
            }
        };
        var validatePhoneNumber = function(rule ,value ,callback){
            var regTel=/^1[34578]\d{9}$/;
            if (!regTel.test(value)&&value!=""&&value!=null&&value!=undefined){
                callback(new Error("手机号格式有误"))
            }else{
                callback();
            }
        };
        var validateEmail = function(rule ,value ,callback){
            var regEmail=/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
            if (!regEmail.test(value)&&value!=""&&value!=null&&value!=undefined){
                callback(new Error("邮箱格式有误"))
            }else{
                callback();
            }
        };
        return{
            formValidate: {
                name: '',//登录名称username
                nickname:'',//昵称tel
                passwd: '',//密码
                passwdCheck: '',//检测密码
                phoneNumber:'',//手机号
                mail:'',//邮箱
                userRole: []//用户角色
            },
            userID:'',
            mapIDToName:{}, //复选框映射,id->中文角色名字
            mapNameToID:{}, //复选框映射,中文角色名字->id
            roleList:[],
            formValidateCopy:{},
            ruleValidate:{//验证方式
                name: [
                    // { required: true, message: '登录名不能为空', trigger: 'blur' },
                    // {
                    //     validator:validateUser,trigger:'blur'
                    // }
                ],
                nickname:[
                    { required: true, message: '昵称不能为空', trigger: 'blur' }
                ],
                passwd: [
                    // { validator: validatePass, trigger: 'blur'}
                ],
                passwdCheck: [
                    {
                        validator: validatePass, trigger: 'blur'
                    }
                ],
                phoneNumber: [
                    {
                        validator: validatePhoneNumber, trigger: 'blur'
                    }
                ],
                mail: [
                    {
                        type:"email",validator: validateEmail, trigger: 'blur'
                    }
                ],
                userRole: [
                    // { required: true, type: 'array', min: 1, message: '至少选择一个', trigger: 'change' },
                    // { type: 'array', max: 4, message: '最多选择四个', trigger: 'change' }
                    {
                        validator: validateRole, trigger: 'change'
                    }
                ]
            }
        }
    },
    ready:function(){

    },
    methods:{
        handleSubmit:function(){
            var me = this;
            if (this.formValidate.name === ''){
                this.$Message.warning('请填写登录名');
                return;
            }
            if (this.formValidate.nickname === ''){
                this.$Message.warning('请填写昵称');
                return;
            }
            if (this.formValidate.passwdCheck !== this.formValidate.passwd){
                this.$Message.warning('密码输入不一致');
                return;
            }
            if (this.formValidate.userRole.length === 0){
                this.$Message.warning('请勾选用户角色');
                return;
            }
            var sendParam = {
                username : this.formValidate.name,//用户名默认不可被修改
                password: this.formValidate.passwd,//密码
                role_ids: '',//角色id
                real_name:this.formValidate.nickname,//昵称
                tel:this.formValidate.phoneNumber,
                email:this.formValidate.mail
            };
            if (this.formValidate.userRole&&this.formValidate.userRole.length>1){
                 var role_ids = this.formValidate.userRole.map(function(name){
                    if(name){
                        return me.mapNameToID[name];
                    }
                });
                // console.log(role_ids);
                sendParam.role_ids = role_ids.join(',');
            }else {
                sendParam.role_ids = this.mapNameToID[this.formValidate.userRole[0]];
            }
            // console.log(sendParam);
            $.post(API('/base/users/edit/'+this.userID),sendParam,function(data){
                // console.log(data);
                if(data.msg==='修改成功!'){
                    me.$Message.success(data.msg);
                }else{
                    me.$Message.error(data.msg);
                }
            })
                .error(function(data){
                    me.$Message.success(data);
                });
        },
        resetSubmit:function(){
            // this.formValidate = {};
            // this.$Message.success('还原成功!');
        },
        backUserManage:function(){
            router.go('/userManagement');
        },
        // showUserRole:function(){
        //
        // }
    }
});