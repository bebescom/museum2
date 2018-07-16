var router = new VueRouter();

module.exports = Vue.extend({
    template:'#addUser',
    route:{
        data:function(params){
            var _this = this;
            var mapIDToName = {},mapNameToID = {},roleList=[];
            $.get(API('/base/roles'),function(data){
                data.rows.forEach(function(elem,index){
                    var map = {};
                    map.name = elem.name;
                    map.id = elem.id;
                    mapIDToName[elem.id] = elem.name;
                    mapNameToID[elem.name] = elem.id;
                    _this.formValidate.userRole.push(map);
                });
                _this.mapIDToName = mapIDToName;//保存角色映射,id->角色名
                _this.mapNameToID = mapNameToID;//保存角色映射,角色名->id
                _this.userRoleLen = _this.formValidate.userRole.length;
            });
        }
    },
    data:function(){
        var _this = this,pattern=/\s/;//不能有空格
        var validatePass = function (rule, value, callback){
            if (value === '') {
                callback(new Error('请输入密码'));
            } else {
                if (_this.formValidate.passwdCheck !== '') {
                    _this.$refs.form.validateField('passwdCheck');
                }
                callback();
            }
        };
        var validatePassCheck = function(rule, value, callback){
            if (value === '') {
                callback(new Error('请再次输入密码'));
            } else if (value !== _this.formValidate.passwd) {
                callback(new Error('两次输入密码不一致!'));
            } else {
                callback();
            }
        };
        var validateUser = function(rule, value, callback){
            var regEmail=/^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/,
                regTel=/^1[34578]\d{9}$/;
            if(!regEmail.test(value)&&!regTel.test(value)){
                callback(new Error('用户名格式必须为电子邮件或手机号码格式且不能包含空格等非法字符'));
            }else if(pattern.test(value)){
                callback(new Error('用户名不能包含空格等非法字符'));
            }else{
                callback();
            }
        };
        var validateNickname = function(rule ,value ,callback){
            if (pattern.test(value)){
                callback(new Error("昵称不能包含空格等非法字符"))
            }else{
                callback();
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
            roleList:[],//角色列表
            mapIDToName:{}, //复选框映射,id->中文角色名字
            mapNameToID:{}, //复选框映射,中文角色名字->id
            userRoleLen : '',
            formValidate: {
                name: '',//用户名称
                nickname:'',//昵称
                passwd: '',//密码
                passwdCheck: '',//检测密码
                phoneNumber:'',//手机号
                mail:'',//邮箱
                userRole: []//用户角色
            },
            ruleValidate:{//验证方式
                name: [
                    { required: true, message: '用户名不能为空', trigger: 'blur' },
                    {
                        validator:validateUser,trigger:'blur'
                    }
                ],
                nickname:[
                    { required: true, message: '昵称不能为空', trigger: 'blur' },
                    {
                        validator:validateNickname,trigger:'blur'
                    }
                ],
                passwd: [
                    { validator: validatePass, trigger: 'blur'}
                ],
                passwdCheck: [
                    { validator: validatePassCheck, trigger: 'blur'}
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
                    //{ required: true, type: 'array', min: 5, message: '至少选择一个', trigger: 'change' }
                ]
            }

        }
    },
    created:function(){

    },
    methods:{
        handleSubmit:function(){
            var tipLength = $(".fade-transition.ivu-form-item-error-tip").length;
            if (tipLength !== 0){
                this.$Message.warning('信息填写错误,保存失败!');
                return;
            }
            var len = this.userRoleLen,_this = this,arr = [],jue = [];
            $.each(this.formValidate.userRole,function(elem,index){
                if (elem + 1 < len){
                    return
                }else {
                    arr.push(index);
                }
            });
            arr = arr.splice(1);//获取选择的角色
            for(var i in this.mapNameToID){
                for (var j=0;j<arr.length;j++){
                    if (i == arr[j]){
                        jue.push(this.mapNameToID[i]);//获取ids
                    }
                }
            }
            if (this.formValidate.name === ''){
                this.$Message.warning('请填写用户名');
                return;
            }
            if (this.formValidate.nickname === ''){
                this.$Message.warning('请填写昵称');
                return;
            }
            if (this.formValidate.passwd === '' || this.formValidate.passwdCheck === ''){
                this.$Message.warning('请填写密码');
                return;
            }
            if (jue.length === 0){
                this.$Message.warning('请勾选用户角色');
                return;
            }
            var _this = this;
            var sendParam = {
                username : this.formValidate.name,
                password: this.formValidate.passwd,
                role_ids: '',
                real_name:this.formValidate.nickname,
                tel:this.formValidate.phoneNumber,
                email:this.formValidate.mail
            };
            console.log(sendParam)
            if (jue.length > 1){
                sendParam.role_ids = jue.join(",");
            }else {
                sendParam.role_ids = jue[0];
            }
            $.post(API('/base/users/add'),sendParam,function(data){
                if (data.msg === '添加成功!'){
                    _this.$Message.success(data.msg);
                    router.go('/userManagement');
                }else {
                    _this.$Message.error(data.error);
                }
            })
        },
        resetSubmit:function(){

        },
        backUserManage:function(){
            router.go('/userManagement');
        }
    }
});

