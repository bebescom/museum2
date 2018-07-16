define('cabinet', function(require, exports, module) {
//
//
//
//
//
//
//


require('common/header');
require('common/left');
var router = require('common/router');
$('#left').find('li').filter('.monitoring').addClass('v-link-active');
var env_no = router.get('env_no'),
    $relicName=$('#relicName'),
    $star=$relicName.find('.star'),key=false,
    name='';
//
//$.post('/2.2.05_P001/base_api/base/follows',{no:env_no},function(data){
//  if (data.total) {
//      $star.addClass('active');
//      key=true;
//  }
//});
//
//$relicName.click(function(){
//  if (key) {
//      $.post('/2.2.05_P001/base_api/base/follows/delete/',{no:env_no},function(data){
//          if (data.msg!="删除成功") {
//              console.log(data.error);
//              return;
//          }
//          console.log(data)
//          $star.removeClass('active');
//      });
//  }else{
//      $.post('/2.2.05_P001/base_api/base/follows/add',{name: name, no: env_no,type:'cabinet'},function(data){
//          if (data.msg!="添加成功!") {
//              console.log(data.error);
//              return;
//          }
//          $star.addClass('active');
//      });
//  }
//  key=!key;
//});

var vm = exports.vm = new Vue({
    el: 'body',
    data: {
        cabinet: {
            name: '',
            image: ''
        },
        threshold_list: [],
        sensor_list: [],
        control_list: [],
        //同柜文物
        relic_searchTxt:'',
        all_relic:[],
        relic_list:[],
        relic:{
            material:[],
            age:[],
            category:[]
        },
        relic_condition:{
            material:[],
            age:[],
            category:[]
        },
        //同柜设备
        equip_searchTxt:'',
        all_controller:[],
        all_sensor:[],
        controller:[],
        sensor:[],
        equip:{
            controller:[],
            sensor:[]
        },
        equip_condition:{
            controller:[],
            sensor:[]
        },
        in_edit:false,//是否在编辑阈值中的标志位
        edit_data:{},//存放获取的阈值信息
        clone_obj:{},//存放阈值列表的副本,如果改动成功,将原对象更新为副本,否则保持原对象不变
        data_error:false,//标志阈值范围是否正确的标志位
        msg:'编辑阈值', //错误提示消息
        isEmpty:false
    },
    methods: {
        validation:function(key){
            var reg = /^[0-9]\d*(\.)?\d*$/;
            if((this.clone_obj[key].max=='')||(this.clone_obj[key].min=='')){
                this.data_error = true;
                this.msg='阈值不允许为空';
            }else if(this.clone_obj[key].max<0||this.clone_obj[key].min<0){
                this.data_error = true;
                this.msg='阈值不能为负';
            }else if((this.clone_obj[key].max&&!reg.test(this.clone_obj[key].max))||(this.clone_obj[key].min&&!reg.test(this.clone_obj[key].min))){/*使用正则表达式*/
                this.data_error = true;
                this.msg='阈值必须为数字';
            }else if(parseFloat(this.clone_obj[key].max)<parseFloat(this.clone_obj[key].min)){
                this.data_error = true;
                this.msg='阈值设置错误';
            }else{
                this.data_error = false;
                this.msg='保存修改';
            }
        },
        cancel_edit:function(){
            this.msg='编辑阈值';
            this.in_edit = false;
            this.data_error = false;
        },
        edit_threshold:function(e){//编辑阈值
            var result_obj = {};
            var me = this;
            //请求数据
            if(!this.in_edit){//不在编辑中,则进入编辑
                this.clone_obj = $.extend(true,{},this.threshold_list);//克隆对象
                me.in_edit = true;
                this.msg='保存修改';
            }else if(this.in_edit&& $(e.srcElement).hasClass('submit')){//在编辑中,则进行提交
                for(var key in me.clone_obj){
                    if(key=='no'||key=='type'){
                        result_obj[key]=me.clone_obj[key];
                    }else{
                        if(key=='temperature'||key=='humidity'){
                            me.clone_obj[key].min = (Math.round(parseFloat(me.clone_obj[key].min)*100)/100).toFixed(2);
                            result_obj[key+'_min'] = me.clone_obj[key].min;
                        }
                        me.clone_obj[key].max = (Math.round(parseFloat(me.clone_obj[key].max)*100)/100).toFixed(2);
                        result_obj[key+'_max'] = me.clone_obj[key].max;
                    }
                }
                if(!this.data_error){
                    $.post('/2.2.05_P001/base_api/env/common/threshold/add_edit',result_obj,function(data){
                        if(data.result){
                            me.in_edit = false;
                            me.threshold_list=me.clone_obj;
                        }
                    });
                }else{
                    me.in_edit = false;
                }
                this.msg='编辑阈值';
            }
        },
        show:function(e){
            var $thisEle=$(e.target||e.srcElement);
            var $children=$thisEle.prev().children();
            var width=$children.size()*$children.eq(0).outerWidth(true)+48;
            $thisEle.addClass('active').parents('.parent_box').animate({'width':$children.size()?width:'193px'},function(){
                $(this).css('overflow','visible');
            }).siblings().css('overflow','hidden').animate({'width':'35px'}).find('i').removeClass('active');

            document.onclick=function(){
                $('.relic_equip .parent_box').animate({'width':'35px'},function(){
                   $(this).css('overflow','hidden').find('i').removeClass('active');
                });
            };
        },
        addChooce:function(type,name){
            var type,typeName='relic';
            if(this.relic_condition[type]){
                type=this.relic_condition[type];
                this.relic_searchTxt='';
            }else{
                type=this.equip_condition[type];
                typeName='equip';
                this.equip_searchTxt='';
            }
            var index=type.indexOf(name);
            if(index==-1){
                type.push(name);
            }else{
                type.splice(index,1);
            }
            this.filter(typeName);
        },
        removeChooce:function(type,name){
            var type,typeName='relic';
            if(this.relic_condition[type]){
                type=this.relic_condition[type];
            }else{
                type=this.equip_condition[type];
                typeName='equip';
            }
            type.splice(type.indexOf(name),1);
            this.filter(typeName);
        },
        filter:function(typeName){
            if(typeName=='relic'){
                var arr=this.all_relic,
                    condition=this.relic_condition;
                this.relic_list=arr.filter(function(con,i){
                    var key=true;
                    for(var i in condition){
                        if(condition[i].length==0){continue;}
                        if(condition[i].indexOf(con[i])==-1){
                            key=false;
                        }
                    }
                    return key;
                });
            }else{
                var controller=this.all_controller,
                    sensor=this.all_sensor,
                    condition=this.equip_condition;

                this.controller=controller.filter(function(con){
                    var key=true;
                    for(var i in condition){
                        if(condition[i].length==0){continue;}
                        if(condition[i].indexOf(con.equip_type)==-1){
                            key=false;
                        }
                    }
                    return key;
                });

                this.sensor=sensor.filter(function(con){
                    var key=true;
                    for(var i in condition){
                        if(condition[i].length==0){continue;}
                        if(condition[i].indexOf(con.equip_type)==-1){
                            key=false;
                        }
                    }
                    return key;
                });
            }
        },
        search:function(type){
            if(type=='relic'){
                var arr=this.all_relic,
                    condition=this.relic_condition,
                    searchTxt=this.relic_searchTxt;

                for(var i in condition){
                    condition[i]=[];
                }
                this.relic_list=arr.filter(function(con){
                    var key=true;
                    if (con.name.search(searchTxt)==-1) {
                        key=false;
                    }
                    return key;
                });
            }else{
                var controller=this.all_controller,
                    sensor=this.all_sensor,
                    condition=this.equip_condition;
                    searchTxt=this.equip_searchTxt;

                for(var i in condition){
                    condition[i]=[];
                }

                this.controller=controller.filter(function(con){
                    var key=true;
                    if(con.name.search(searchTxt)==-1){
                        key=false;
                    }
                    return key;
                });

                this.sensor=sensor.filter(function(con){
                    var key=true;
                    if(con.name.search(searchTxt)==-1){
                        key=false;
                    }
                    return key;
                });
            }
        }
    }
});

$.get('/2.2.05_P001/base_api/base/envs/info/' + env_no+'', function (data) {
    name=data.name;
    vm.$set('cabinet', data);
    document.title = data.name||'' +'-' + document.title;
}, 'json');
$.get('/2.2.05_P001/base_api/env/common/threshold/'+env_no+'/env', function (data) {
    if (data == '' || data == '[]') {
        vm.isEmpty=true;
        return;
    }
    vm.isEmpty=false;
    vm.threshold_list = data;
    vm.clone_obj = data;
}, 'json');

require('common/nav/nav').init(env_no);

var common = require('common/detail/common');

common.equip_relic(env_no,vm);
common.cabinet_position_image(env_no);//展柜位置图
common.cabinet_show_image(env_no);//展柜内部位置图

common.chart_new_data(env_no);//微环境监控
common.echarts_gauge_radar(env_no);//微环境监控-仪表盘和雷达图

//监测设备-start
//$.get("/2.2.05_P001/base_api/env/environments/cabinet/equip_lists/" + env_no + "/sensor", function (data) {
//  vm.$set('sensor_list', data.rows);
//});

//调控设备-start
//$.get("/2.2.05_P001/base_api/env/environments/cabinet/equip_lists/" + env_no + "/controller", function (data) {
//  vm.$set('control_list', data.rows);
//}, 'json');


setTimeout(function(){
	vm.sensor.push({
		env_no:"6250000001010372",
		equip_no:"6250000000100100090",
		equip_type:"土壤温湿度传感器",
		name:"00100100091",
		type:"sensor"
	});
	console.log(vm.sensor,vm.equip.sensor);
	console.log(3);
},2000);
});