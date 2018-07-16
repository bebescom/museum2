var router = new VueRouter();

module.exports = Vue.extend({
   template:'#roleSetting',
   data:function(){
      return{
         permissionData:{},//权限树数据
         rolesData:{},//角色列表数据
         sendPermissions:[],
         indeterminate:true,//部分选择标志位
         checkAll:[],//当前角色所有权限选项
         titlePermissions:'',//权限标题选择项
         titlePermissionsKey:[],//是否选择过当前标题权限
         currentRole:'',//当前角色
         currentRoleId:'',//当前角色ID
         initPermissions:'',
         RoleChangeKey:0,//角色切换保存的key
         animated:false,//是否执行动画
         initKey:true,//初始化标志位
         addRoleModal:false,//添加角色模态框标志位
         checkTongB:false,//验证是否同名
         checkTongEmpty:false,//验证是否为空
         spacing:false,//验证是否包含空格
         inputRoleName:'',//输入的新加名称
         tableData:{},//权限key-value格式对象
         disabledGroup:false,
         disabledGroupTitle:false,
         addRoleKey:true,//添加角色按钮show
         saveRoleKey:true,//保存角色按钮show
         closebleShow:true,//是否显示删除角色close
         singleCurrentRoleId:'',
         singleCurrentRoleName:'',
         currentUserRoleList:[],//当前用户角色列表
         rolesDataCopy:[],
         showLoading:true,
         environmentTreeShow:false,//环境树show
         baseData:[],//环境树数据
         DataPermissions:'',//数据权限参数
         titleDataPermissionsVal:[],
         envDataList:[],//环境列表,
         changeRoleEnvDataPermissions:'',//改变角色对应数据权限
         childrenDataDefine:[],//树环境所有主分支最底层编号
         result:[],
         getTitleInitTexts:[],
         getTitleInitTextsCopy:[]
      }
   },

   route:{
      data:function(transition){
         this.configData();//默认设置数据
         this.getPermissionData();//获取权限数据
         this.getEnvironmentTreeData();//获取环境树数据
         transition.next();
      }
   },
   ready:function(){
      var _this = this;
      $.get(API('/base/envs'),function(data){
         _this.envDataList = data.rows;
      });
   },
   methods:{
      configData:function(){//默认配置信息数据
         var _this = this;
         $.get(API('/base/config'),function(data){
            if (data.user.level === '超级管理员'){
               _this.singleCurrentRoleId = data.user.id;
               _this.singleCurrentRoleName = data.user.level;
               _this.getRolesData();
               return ;
            }
            if(data.user.level === '管理员'){
               _this.singleCurrentRoleId = data.user.id;
               _this.singleCurrentRoleName = data.user.level;
               _this.getRolesData();
               return ;
            }
            _this.disabledGroup = true;
            _this.disabledGroupTitle= true;
            _this.singleCurrentRoleId = data.user.id;
            //当用户不是管理员的时候隐藏添加、保存按钮、删除角色close
            _this.addRoleKey = false;
            _this.saveRoleKey = false;
            _this.closebleShow = false;
            _this.getRolesData();
         })
      },
      indeterminateFun:function(name){
         var _this = this;
         $.each(_this.rolesData,function(index,elem){

         });
      },
      getPermissionData:function(){//获取权限树数据
         var _this = this,obj = {},objPermission = {};
         $.get(API('/base/permissions/tab_tree'),function(data){
            console.log(data)
            if (data){
               $.each(data,function(elem,val){
                  $.each(val,function(elems,vals){
                     obj[elems] = vals;//保存key-value权限对象
                     elems = _this.changeChinese(elems);
                     _this.permissionData[elems] = vals;
                  });
               });
               for (var i in obj){
                  objPermission[i] = [];
                  $.each(obj[i],function(e,v){
                     objPermission[i].push(v.name);
                  })
               }
               _this.tableData = objPermission;//保存权限特定格式对象
               _this.getTitleInitText(_this.tableData);
            }else{
               return;
            }
         });
      },
      getTitleInitText:function(data){
         var _this = this;
         $.each(data,function(index,elem){
            _this.getTitleInitTexts.push(index);
         });
      },
      getRolesData:function(){//获取角色列表数据
         $.get(API('/base/users/info/')+this.singleCurrentRoleId,function(data){//获取当前用户角色列表
            _this.currentUserRoleList = data.role_names.split(',');
         });
         var _this = this;
         setTimeout(function(){
            $.get(API('/base/roles'),function(data){
               _this.rolesData = data.rows;
               if (_this.singleCurrentRoleName === '超级管理员'||_this.singleCurrentRoleName === '管理员'){
                  _this.rolesDataCopy = data.rows;
               }else{
                  $.each(_this.rolesData,function(index,elem){
                     if (elem&&elem.name){
                        var judge = _this.currentUserRoleList.some(function(elems, indexs){
                           return elems === elem.name;
                        });
                        if (judge&&_this.initKey){
                           _this.rolesDataCopy.push(elem);
                        }
                     }
                  });
               }
               if (_this.initKey&&_this.rolesDataCopy.length !== 0){
                  //默认第一次进来取第一个角色的权限和角色名称
                  _this.currentRole = _this.rolesDataCopy[0].name;
                  _this.currentRoleId = _this.rolesDataCopy[0].id;
                  _this.initPermissions = _this.rolesDataCopy[0].permissions;
                  if(_this.rolesDataCopy && _this.rolesDataCopy[0] && _this.rolesDataCopy[0].permissions){
                      console.log(_this.rolesDataCopy)
                    _this.changePermission(_this.rolesDataCopy[0].permissions.split(','));//初始进来的时候进行权限筛选
                  }else{     
                    _this.rolesDataCopy[0].permissions = "";
                    if(_this.rolesDataCopy[0].data_scope === null){
                        _this.rolesDataCopy[0].data_scope = "";
                      }
                    console.log(_this.rolesDataCopy)
                    _this.changePermission(_this.rolesDataCopy[0].permissions.split(','));
                  }
                  if (_this.initPermissions){
                     _this.checkAll=_this.initPermissions.split(',');
                  }
               }
               $.get(API('/base/roles/info/')+_this.currentRoleId,function(data){//每次切换角色时获取对应角色的数据
                  _this.changeRoleEnvDataPermissions = data.data_scope;
                  if (_this.changeRoleEnvDataPermissions){
                     _this.changeRoleEnvDataPermissions =  _this.changeRoleEnvDataPermissions.split(',');
                     _this.dataPermissionsSelectStatus();//对数据权限进行判断，选择其对应状态
                  }
               });
               setTimeout(function(){
                  _this.setPageDom();
               },0);
               $('.ivu-tabs-tab:first').click();
               _this.showLoading = false;
               _this.getTitleInitTexts = FilterData(_this.getTitleInitTexts,_this.checkAll);
               $.each(_this.getTitleInitTexts,function(index,elem){
                  _this.getTitleInitTextsCopy.push(permissionName[elem].name);
               });
               _this.titlePermissionsKey = _this.getTitleInitTextsCopy;
            });
         },0);
      },
      getEnvironmentTreeData:function(){//获取环境树数据
         var _this = this,user = '';
         $.get(API('/base/config'),function(data){
            user = data.user.level;
            if (user === '超级管理员'){
               $.get(API('/base/envs/tree/'),function(data){
                  $.each(data,function(index,elem){
                     var obj = {
                        expand: false,
                        checked:false,
                        title: elem.name,//绑定环境名称
                        define: elem.env_no,//绑定环境编号
                     };
                     _this.setEnvironmentTree(elem,obj);
                     _this.baseData.push(obj);
                  });
               });
            }else{
               $.get(API('/base/envs/tree/'),function(data){
                  $.each(data,function(index,elem){
                     var obj = {
                        expand: false,
                        checked:false,
                        title: elem.name,//绑定环境名称
                        define: elem.env_no,//绑定环境编号
                        disableCheckbox:true
                     };
                     _this.setEnvironmentTreeUser(elem,obj);
                     _this.baseData.push(obj);
                  });
               });
            }
         });
      },
      setEnvironmentTree:function(data,obj){//超级管理员
         var _this = this;
         if (data.children){
            obj.children = [];
            $.each(data.children,function(index,elem){
               var obj1 = {
                  expand: false,
                  checked:false,
                  title: elem.name,//绑定环境名称
                  define: elem.env_no,//绑定环境编号
               };
               obj.children.push(obj1);
               if (elem.children){
                  _this.setEnvironmentTree(elem,obj1);
               }
            });
         }
      },
      setEnvironmentTreeUser:function(data,obj){//普通用户
         var _this = this;
         if (data.children){
            obj.children = [];
            $.each(data.children,function(index,elem){
               var obj1 = {
                  expand: false,
                  checked:false,
                  title: elem.name,//绑定环境名称
                  define: elem.env_no,//绑定环境编号
                  disableCheckbox:true
               };
               obj.children.push(obj1);
               if (elem.children){
                  _this.setEnvironmentTreeUser(elem,obj1);
               }
            });
         }
      },
      addRole:function(){//添加角色
         this.addRoleModal = true;
      },
      addSaveRole:function(){//添加保存按钮
         var _this = this;
         if (!this.checkTongB&&!this.checkTongEmpty&&this.inputRoleName){
            $.post(API('/base/roles/add'),{name:this.inputRoleName},function(data){
               if (data.msg&&data.msg === '添加成功!'){
                  _this.showLoading = true;
                  _this.clearChangeData();
                  _this.getRolesData();
                  _this.$Message.success(data.msg);
               }
            });
         }else{
            if (this.inputRoleName === ''){
               _this.$Message.error('角色名不能为空');
            }else{
               _this.$Message.error('添加失败,角色同名!');
            }
         }
      },
      cancelAdd:function(){
         this.spacing = false;
         this.checkTongB = false;
         this.checkTongEmpty = false;
         this.inputRoleName = '';
      },
      checkTongFocus:function(){//添加角色获取焦点
         this.removeForbid();
         this.spacing = false;
         this.checkTongB = false;
         this.checkTongEmpty = false;
      },
      checkTong:function(){//检查是否同名
         var _this = this;
         var pattern=/\s/;//不能有空格
         if (this.inputRoleName === ''){
            this.forbid();
            this.checkTongEmpty = true;
            return;
         }
         if (pattern.test(this.inputRoleName)){
            this.forbid();
            this.spacing = true;
            return;
         }
         this.getRolesData();
         $.each(this.rolesDataCopy,function(index,elem){
            if (_this.inputRoleName === elem.name){
               _this.forbid();
               _this.checkTongB = true;
            }
         });
      },
      forbid:function(){
         $("#roleSettingT .ivu-modal-footer .ivu-btn.ivu-btn-primary.ivu-btn-large").css('pointer-events','none');
      },
      removeForbid:function(){
         $("#roleSettingT .ivu-modal-footer .ivu-btn.ivu-btn-primary.ivu-btn-large").css('pointer-events','auto');
      },
      saveRole:function(){//
         var _this = this,sendPermissions = this.checkAll.join(','),nn = [];
         this.cycleFun(this.baseData,nn);//查找状态为1和2的所有节点
         this.DataPermissions = nn.join(',');
         this.$Modal.confirm({
            title: '保存角色',
            content: '是否改变角色权限',
            onOk:function(){
               $.post(API('/base/roles/edit/') + _this.currentRoleId,{name:_this.currentRole,permissions:sendPermissions,data_scope:_this.DataPermissions},function(data){
                  if (data.msg && data.msg === '修改成功!'){
                     _this.showLoading = true;
                     _this.clearChangeData();
                     _this.getRolesData();
                     _this.$Message.success('保存成功!');
                  }
               });
            },
            onCancel:function(){

            }
         });
      },
      cycleFun:function(obj,nn){//循环函数
         var _this = this;
         $.each(obj,function(index,elem){
            if (elem.childrenCheckedStatus === 1 || elem.childrenCheckedStatus === 2){
               nn.push(elem.define);
               if (elem.children){
                  _this.cycleFun(elem.children,nn);
               }
            }
         })
      },
      backUserManage:function(){//返回列表
         router.go('/userManagement');
      },
      removeRole:function(val){//删除角色（右上角）
         var _this = this;
         $.each(this.rolesDataCopy,function(index,elem){
            if (val === index){
               $.post(API('/base/roles/delete/'+ elem.id),function(data){
                  if(data.msg && data.msg==='删除成功'){
                     _this.$Message.success(data.msg);
                  }else if (data.error){
                     _this.showLoading = true;
                     _this.clearChangeData();
                     _this.getRolesData();
                     _this.$Message.error(data.error);
                  }
               });
            }
         });
      },
      changeRole:function(val){//切换角色
         var _this = this;
         this.changeRoleEnvDataPermissions = '';
         this.clearDataPermissions();
         if (val === 0 && this.RoleChangeKey === val){
            return ;
         }
         this.clearChangeData();
         this.RoleChangeKey = val;
         if (this.rolesDataCopy[val]&&this.rolesDataCopy[val].permissions){
            this.checkAll = this.rolesDataCopy[val].permissions.split(',');
         }
         if (this.rolesDataCopy[val]&&this.rolesDataCopy[val].permissions){
            this.changePermission(this.rolesDataCopy[val].permissions.split(','));//切换角色进行权限筛选
         }
         this.currentRoleId = this.rolesDataCopy[val].id;
         this.currentRole = this.rolesDataCopy[val].name;

         ///获取环境树/
         $.get(API('/base/roles/info/')+this.rolesDataCopy[val].id,function(data){//每次切换角色时获取对应角色的数据
            _this.changeRoleEnvDataPermissions = data.data_scope;
            if (_this.changeRoleEnvDataPermissions){
               _this.changeRoleEnvDataPermissions =  _this.changeRoleEnvDataPermissions.split(',');
               _this.dataPermissionsSelectStatus();//对数据权限进行判断，选择其对应状态
            }
         });
      },
      dataPermissionsSelectStatus:function(){//对数据权限进行判断，选择其对应状态
         this.dataPermissionCycle(this.baseData);
      },
      dataPermissionCycle:function(data){//数据权限循环
         var _this = this;
         $.each(data,function(index,elem){
            var judge = _this.changeRoleEnvDataPermissions.some(function(e){
               return e == elem.define;
            });
            if (judge && !elem.children){
               elem.checked = true;
               elem.childrenCheckedStatus = 2;
            }else if (judge && elem.children){
               var checkChildrenArr = [],resultArr = [];
               $.each(elem.children,function(x,y){
                  checkChildrenArr.push(y.define);
               });
               setTimeout(function(){
                  resultArr = FilterData(checkChildrenArr,_this.changeRoleEnvDataPermissions);
                  if (resultArr.length === checkChildrenArr.length){
                     elem.checked = true;
                     elem.expand = true;
                     elem.childrenCheckedStatus = 2;
                  }else if(resultArr.length < checkChildrenArr.length && resultArr.length >0){
                     elem.checked = true;
                     elem.expand = true;
                     elem.childrenCheckedStatus = 1;
                  }else {
                     elem.childrenCheckedStatus = 0;
                  }
                  _this.dataPermissionCycle(elem.children);
               },0);
            }
         })
      },
      clearDataPermissions:function(){
         var _this = this;
         $.each(_this.baseData,function(index,elem){
            elem.checked = false;
            elem.expand = false;
            elem.childrenCheckedStatus = 0;
            _this.clearFun(elem);
         });
      },
      clearFun:function(data){
         var _this = this;
         if(data.children){
            $.each(data.children,function(index,elem){
               elem.checked = false;
               elem.expand =false;
               elem.childrenCheckedStatus = 0;
               if (elem.children){
                  _this.clearFun(elem);
               }
            })
         }
      },
      clearChangeData:function(){//清除相关数据
         this.checkAll = [];
         this.titlePermissions = [];
         this.sendPermissions = [];
      },
      changePermission:function(val){//修改当前角色权限
         val = unique(val);

         var selectArr = [],_this = this,titlePermissions=[];
         $.each(val,function(index,elem){
            if(typeof elem == 'string'){
               selectArr.push(elem);
            }
         });
         selectArr = unique(selectArr);//去除重复选中的权限
         $.each(this.tableData,function(index,elem){
            var checkTongPermission = FilterData(elem,selectArr);
            if (checkTongPermission.length < elem.length && checkTongPermission.length > 0){
               titlePermissions.push(index);
               _this.checkAll.push(index);
               _this.checkAll = unique(_this.checkAll);
            }else if (checkTongPermission.length === elem.length && elem.length !== 0){
               _this.checkAll.push(index);
               _this.checkAll = unique(_this.checkAll);
            }else if (elem.length === 0 && checkTongPermission.length === 0){
               return;
            }else {
               var judge = _this.checkAll.some(function(e){
                  return e === index;
               });
               if (judge){
                  removeByValue(_this.checkAll,index);
                  _this.checkAll = unique(_this.checkAll);
               }else {
                  return;
               }
            }
         });
         titlePermissions = unique(titlePermissions);//去重
         this.titlePermissions = titlePermissions.join(',');//需要发送至后台的当前角色标题权限
         this.sendPermissions = selectArr.concat(this.titlePermissions);//需要发送至后台的当前角色所有权限
         this.sendPermissions = unique(this.sendPermissions);//去重
         $.each(this.sendPermissions,function(index,elem){
            if (elem === ''){
               _this.sendPermissions.splice(index,1);
            }
         });
      },
      titlePermission:function(name){//标题权限
         var clickTitlePermissionsCopy = [],_this = this;
         var judge = this.titlePermissionsKey.some(function(elem){
            return elem === name;
         });
         if (judge){//反选全部取消
            removeByValue(this.titlePermissionsKey,name);
            clickTitlePermissionsCopy = this.allCheckCurrent(name);
            array_diff(this.checkAll,clickTitlePermissionsCopy);
            for (var i=0;i<this.checkAll.length;i++){
               if (permissionEName[name].name==this.checkAll[i]){
                  this.checkAll.splice(i,1);
               }
            }
            return
         }
         this.titlePermissionsKey.push(name);
         this.checkAll.push(permissionEName[name].name);
         clickTitlePermissionsCopy = this.allCheckCurrent(name);
         this.checkAll = this.checkAll.concat(clickTitlePermissionsCopy);
      },
      allCheckCurrent:function(name){
         var _this = this,clickTitlePermissions=[],clickTitlePermissionsCopy=[];
         var managementList = ['managementCultural','environmentalMonitoring','userManagement','integratedManagement','equipManagement','vibrationTest','smartPouchBox'];
         for (var index in _this.permissionData){
            var judge = managementList.some(function(elem){
               return elem == index;
            });
            if (judge && index === name){
               clickTitlePermissions=clickTitlePermissions.concat(_this.permissionData[index]);
            }
         }
         $.each(clickTitlePermissions,function(index,elem){
            clickTitlePermissionsCopy.push(elem.name);
         });
         return clickTitlePermissionsCopy;
      },
      changeChinese:function(val){
         console.log(val)
         return permissionName[val].name;
      },
      changeEnglish:function(val){
         return permissionEName[val].name;
      },
      setPageDom:function(){//设置页面样式
         var barHeight = $('#roleSettingT .content .ivu-tabs-bar').height(),contentHeight = $("#content").height();
         this.environmentTreeShow = true;//显示环境树
         $('#roleSettingT .content .ivu-tabs-content').height(contentHeight-barHeight-100);
         $("#environmentTree").css("top",barHeight);//设置环境树top
         $("#environmentTree").height(contentHeight-barHeight-82);//设置环境树top
      }
   }
});

var permissionName = {
   '文物管理':{name:'managementCultural'},
   '环境监控':{name:'environmentalMonitoring'},
   '用户管理':{name:'userManagement'},
   '综合管理':{name:'integratedManagement'},
   '设备管理':{name:'equipManagement'},
   '震动监测':{name:'vibrationTest'},
   '智能囊匣':{name:'smartPouchBox'}
};

var permissionEName = {
   'managementCultural':{name:'文物管理'},
   'environmentalMonitoring':{name:'环境监控'},
   'userManagement':{name:'用户管理'},
   'integratedManagement':{name:'综合管理'},
   'equipManagement':{name:'设备管理'},
   'vibrationTest':{name:'震动监测'},
   'smartPouchBox':{name:'智能囊匣'}
};

function unique(arr){//删除同一数组重复元素
   var tmp = new Array();
   for(var i in arr){
      if(tmp.indexOf(arr[i])==-1){
         tmp.push(arr[i]);
      }
   }
   return tmp;
}

function array_diff(a, b) {//获取两个数组相同元素
   for(var i=0;i<b.length;i++) {
      for(var j=0;j<a.length;j++) {
         if(a[j]==b[i]){
            a.splice(j,1);
            j=j-1;
         }
      }
   }
   return a;
}

function removeByValue(arr, val){//删除数组中指定元素
   for(var i=0; i<arr.length; i++){
      if(arr[i] == val) {
         arr.splice(i, 1);
         break;
      }
   }
}

function FilterData(a,b) {   //循环判断数组a里的元素在b里面有没有，有的话就放入新建立的数组中
   var result = new Array();
   var c=b.toString();
   for(var i=0;i<a.length;i++){
      if(c.indexOf(a[i].toString())>-1){
         result.push(a[i]);
      }
   }
   return result;
}
