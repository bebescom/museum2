define('equip', function(require, exports, module) {
//
//
//
//


require('common/header');
require('common/left');

//获取参数单位名称
var param_unit_name = window.web_config.param_unit_name.sensor;

var router = require('common/router');
$('#left').find('li').filter('.equipment').addClass('v-link-active');
var equip_no = router.get('equip_no'),
    $relicName=$('#relicName'),
    $star=$relicName.find('.star'),key=false,
    name='';

$.post('/2.2.05_P001/base_api/base/follows',{no:equip_no},function(data){
    if (data.total) {
        $star.addClass('active');
        key=true;
    }
});

$relicName.click(function(){
    if (key) {
        $.post('/2.2.05_P001/base_api/base/follows/delete/',{no:equip_no},function(data){
            if (data.msg!="删除成功") {
                console.log(data.error);
                return;
            }
            $star.removeClass('active');
        });
    }else{
        $.post('/2.2.05_P001/base_api/base/follows/add',{name: name, no: equip_no,type:'equip'},function(data){
            if (data.msg!="添加成功!") {
                console.log(data.error);
                return;
            }
            $star.addClass('active');
        });
    }
    key=!key;
});

var vm = exports.vm = new Vue({
    el: 'body',
    data: {
        equip: {
            name: '',
            image: '',
            equip_type: ''
        },
        param_unit: {},
        sensor_list: [],
        control_list: [],
        param_list: [],
        monitor_thead: [],
        monitor_list: [],
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
        }
    },
    methods: {
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
            var typeName='relic';
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

var common = require('common/detail/common');

$.get('/2.2.05_P001/base_api/env/equipments/overviews/' + equip_no+'', function (data) {
    name=data.name;
    vm.$set('equip', data);
    var str=(data.equip_type||'') + '-' + (name||'') + '-';
    document.title = str + document.title;
    if (data.parameter && data.parameter != '') {
        vm.$set('param_list', data.parameter.split(','));
    }

    battery(data);
    signal(data.rssi);

    var parent_env_no = data.env_no;
    if (parent_env_no != '') {
        require('common/nav/nav').init(parent_env_no, '../', function ($dl) {
            $dl.append('<dd>' + data.equip_type + '-' + name + '</dd>');
        });
        common.equip_relic(parent_env_no,vm);
        common.cabinet_position_image(parent_env_no);//展柜位置图
        common.cabinet_show_image(parent_env_no);//展柜内部位置图

        common.chart_new_data(parent_env_no, equip_no);//微环境监控

        //监测设备-start
        $.get("/2.2.05_P001/base_api/env/environments/cabinet/equip_lists/" + parent_env_no + "/sensor", function (data) {
            vm.$set('sensor_list', data.rows);
        });

        //调控设备-start
        $.get("/2.2.05_P001/base_api/env/environments/cabinet/equip_lists/" + parent_env_no + "/controller", function (data) {
            vm.$set('control_list', data.rows);
        }, 'json');
    }

}, 'json');


$.get('/2.2.05_P001/base_api/env/equipments/equip_parameters/sensor', function (data) {
    var param_unit = {};
    _.each(data.rows, function (row) {
        param_unit[row.param] = row.unit;
    });
    vm.$set('param_unit', param_unit);
}, 'json');

get_data_list();
$('.monitor .chooceTime>span,.diy_date button').on('click', function () {
    var timeL = $(this).attr('data-time');
    get_data_list(timeL);
});
function get_data_list(timeL) {
    timeL = timeL || $('.chooceTime .ower').attr('data-time');
    if (timeL == 'diy') {
        if (!$('#start_date')[0]) {
            return;
        }
        timeL = $('#start_date').val() + ',' + $('#end_date').val();
        if (timeL == ',') {
            return;
        }
    }
    $.get('/2.2.05_P001/base_api/env/equipments/data_lists/' + equip_no + '/' + timeL+'', function (data) {
		if (data.total == 0) {
            vm.$set('monitor_thead', []);
            vm.$set('monitor_list', []);
            return;
        }
        var rows = data.rows, name_arr = [];
		if(rows&&rows.length!=0){
            for (var i in rows[0]) {
                if (rows[0][i] != null && param_unit_name[i].name) {
                    name_arr.push({key: i, name: param_unit_name[i].name});
                }
            }
        }
        vm.$set('monitor_thead', name_arr);
        vm.$set('monitor_list', data.rows);
    });
}

//设备数据列表


function battery(data) {
    var num=data.voltage;
    var min=3,max=3.2;
    if(data.equip_type=='二氧化碳传感器'||data.equip_type=='VOC传感器'){
        min=3.2,max=3.4;
    }
    var className='';
    if (num>=max) {
        className='excellent';
    }else if(num>=min&&num<max){
        className='pass';
    }else{
        className='fail';
    }
    $('.battery').append('<span class='+className+'></span>');
    $('.caveat').css('display', num <max ? 'inline-block' : 'none');
}

function signal(num) {//30最好,100最差
    span_class = ['one', 'two', 'three', 'four', 'five'];
    if (!num) {
        return;
    }
    num=-num;
    var real_num=0;
    if(num>100){
        real_num=0;
    }else{
        var key=100-num;
        real_num=parseInt(key/14)+((key%14>7)?1:0);
    }
    if (real_num>5) {
        real_num=5;
    }
    for (var i = 0; i < real_num; i++) {
        $('.signal').append('<span class=' + span_class[i] + '></span>');
    }
    $('.signal span').css('backgroundColor', real_num <= 2 ? '#FF5959' : '#3BB48B');
}

});