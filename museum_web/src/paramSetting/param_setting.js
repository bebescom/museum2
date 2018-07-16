// @require $
// @require vue
// @require _
// @require iview.css
// @require ../common/css/header.css
// @require ../common/css/left.css
// @require iview
// @require ./param_setting.css
// @require vue-router

require('../common/header');
var left = require('../common/left');

//判断不为空
var notNull = function(val){
    return !val||val.length===0||val==='';
};

var vm = new Vue({
    el:'#app',
    data:{
        allProvinces:[],
        currTitle:null,
        //配置文件对象
        configObj:{

        },
        webUser:[],
        emailUser:[],
        msgUser:[],
        carbon:[],
        sulfur:[],
        nitrogen:[],
        ozone:[],
        webModel:[],
        emailModel: [],
        msgModel:[],
        emailTimeModel:['00:00','23:59'],
        msgTimeModel:['00:00','23:59'],
        carbonModel:[],
        sulfurModel:[],
        nitrogenModel:[],
        ozoneModel:[],
        //验证结果,验证失败是返回true
        rules:{
            app_name:function(val){
                return notNull(val);
            },
            museum_name:function(val){
                return notNull(val);
            },
            museum_no:function(val){
                var reg = /^\d{8}$/;
                return !reg.test(val);
            },
            region_no:function(val){
                var reg = /^R\d{8}$/;
                return !reg.test(val);
            },
            monitor_port:function(val){
                return notNull(val);
            },
            app_port:function(val){
                return notNull(val);
            },
            data_minimum_time_interval:function(val){
                var value = parseFloat(val);
                var reg = /^\d{1,4}$/;
                // console.log(value);
                return !reg.test(val)||value>1800||value<0;
            },
            monitor_time:function(val){
                var value = parseFloat(val);
                var reg = /^\d{1,4}$/;
                return !reg.test(val)||value>1800||value<0;
            },
            max_acquisition_time_interval:function(val){
                var value = parseFloat(val);
                var reg = /^\d{1,4}$/;
                return !reg.test(val)||value<0;
            },
            max_transmission_time_interval:function(val){
                var value = parseFloat(val);
                var reg = /^\d{1,4}$/;
                return !reg.test(val)||value<0;
            },
            data_mutation_bounds:function(val){
                var value = parseFloat(val);
                var reg = /^\d{1,2}(.\d{1})?$/;
                return !reg.test(val)||value>10||value<1;
            },
            city:function(val){
                return notNull(val);
            },
            weather_key:function(val){
                return notNull(val);
            }
        },
        //配置项目合法性检测状态
        status:{

        }
    },
    ready:function(){
        var me = this;
        $.get(API('/base/config/museum_config'),function(data){
            if(data.error){
                me.$Message.error(data.error);
                return;
            }
            $('.loading').hide();
            me.configObj = data;
            for(var key in data){
                me.status[key] = false;
            }
            //将选中的用户赋值多选下拉列表
            if(data.web_user!=""&&data.web_user!=null&&data.web_user!=undefined){
                me.webModel=data.web_user;
            }
            if(data.email_user!=""&&data.email_user!=null&&data.email_user!=undefined){
                me.emailModel=data.email_user;
            }
            if(data.phone_user!=""&&data.phone_user!=null&&data.phone_user!=undefined){
                me.msgModel=data.phone_user;
            }
            if(data.email_time!=''&&data.email_time!=null&&data.email_time!=undefined){
                me.emailTimeModel=data.email_time.split("-");
            }
            if(data.phone_time!=''&&data.phone_time!=null&&data.phone_time!=undefined){
                me.msgTimeModel=data.phone_time.split("-");
            }
            var response_weather=JSON.parse(data.small_weather_no);
            //将返回选中的气象站分别赋值下拉列表
            me.carbonModel=response_weather.CO2;
            me.sulfurModel=response_weather.SO2;
            me.nitrogenModel=response_weather.NO;
            me.ozoneModel=response_weather.O3;
        });
        //获取所有用户列表
        $.get(API('/base/users'),function (data) {
            if(data.error){
                me.$Message.error(data.error);
                return;
            }
            $('.loading').hide();
            me.webUser=data.rows;
            me.emailUser=data.rows;
            me.msgUser=data.rows;
        })
        //获取二氧化碳监测终端设备
        $.get(API('/env/equipments/manage/all_equip'),{equip_type:'二氧化碳监测终端'},function (data) {
            me.carbon=data.rows;
            console.log(data)
        })
        //获取二氧化硫监测终端设备
        $.get(API('/env/equipments/manage/all_equip'),{equip_type:'二氧化硫监测终端'},function (data) {
            me.sulfur=data.rows;
            console.log(data)
        })
        //获取氮氧化物监测终端设备
        $.get(API('/env/equipments/manage/all_equip'),{equip_type:'氮氧化物监测终端'},function (data) {
            me.nitrogen=data.rows;
            console.log(data)
        })
        //获取臭氧监测终端设备
        $.get(API('/env/equipments/manage/all_equip'),{equip_type:'臭氧监测终端'},function (data) {
            me.ozone=data.rows;
            console.log(data)
        })

    },
    computed:{
        save_disabled:function(){
            var disabled = false;
            for(var key in this.status){
                if(this.status[key]){
                    disabled = true;
                    break;
                }
            }
            return disabled;
        }
    },
    methods:{
        goBack:function(){
            history.go(-1);
        },
        changeStatus:function(type){
            // console.log(this.configObj[type]);
            if(this.configObj[type]){
                this.configObj[type]==='1'?this.configObj[type]='0':this.configObj[type]='1';
            }
        },
        saveHandler:function(){
            var me = this;
                //为true时出现错误
                // checkFail = false;
            // console.log('保存修改',this.configObj);
            // console.log(this.status);
            //如果有输入状态验证不通过的情况,则不予提交
            // for(var key in this.status){
            //     if(this.status[key]){
            //         checkFail = true;
            //         break;
            //     }
            // }
            // if(checkFail){
            //     this.$Message.error('输入有误,请按提示信息修正!');
            //     return;
            // }
            if(this.save_disabled){
                return;
            }
            $('.loading').show();

            this.configObj.web_user=this.webModel.join(",")//将存储数据的数组转化为“，”分割的字符串
            this.configObj.email_user=this.emailModel.join(",")//将存储数据的数组转化为“，”分割的字符串
            this.configObj.phone_user=this.msgModel.join(",")//将存储数据的数组转化为“，”分割的字符串
            var smallWeather={};//处理选择的小型气象站
            if(this.carbonModel!=''){smallWeather.CO2=this.carbonModel;};
            if(this.sulfurModel!=''){smallWeather.SO2=this.sulfurModel;};
            if(this.nitrogenModel!=''){smallWeather.NO=this.nitrogenModel;};
            if(this.ozoneModel!=''){smallWeather.O3=this.ozoneModel;};
            this.configObj.small_weather_no=smallWeather;

            $.post(API('/base/config/edit'),this.configObj,function(res){
                console.log(res)
                if(res.msg!=='修改成功'){
                    me.$Message.error(res.msg);
                    return ;
                }
                store.session('web_config',null);
                $('.loading').hide();
                me.$Message.success(res.msg,1,function(){
                    //刷新页面,对app_name的修改,可见,生效
                    location.replace(location.href);
                });
            })
                .error(function(res){
                    $('.loading').hide();
                    me.$Message.error(res);
                })
        },
        checkData:function(type,val){
            var status = JSON.parse(JSON.stringify(this.status));
            // console.log(status);
            var rule = this.rules[type];
            //对值进行验证;
            status[type] = rule(val);
            this.status = status;
            this.currTitle = null;
        },
        toggleTitle:function(item){
            if(item){
                this.currTitle = item;
            }else{
                this.currTitle = null;
            }
        },
        email_disabled:function (obj) {//选择发送邮箱，如果用户没有邮箱信息，则禁止选择
            var disabled=true;
            if(obj!=""&&obj!=null&&obj!=undefined){
                disabled=false;
            }
            return disabled;
        },
        msg_disabled:function (obj) {//选择发送邮箱，如果用户没有邮箱信息，则禁止选择
            var disabled=true;
            if(obj!=""&&obj!=null&&obj!=undefined){
                disabled=false;
            }
            return disabled;
        },
        emailTime:function (time) {//存入选择的时间
            this.configObj.email_time=time.join("-");
        },
        msgTime:function (time) {//存入选择的时间
            this.configObj.phone_time=time.join("-");
        }
    },
    components:{
        left:left
    }


});

