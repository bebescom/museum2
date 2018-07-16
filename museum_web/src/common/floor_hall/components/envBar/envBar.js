/**
 * Created by USER on 2017/3/23.
 */
module.exports={
    template:'#envBar',
    data:function(){
        return {
            temperature:{
                min:0,
                max:40
            },
            humidity:{
                min:0,
                max:100
            }
        };
    },
    watch:{

    },
    props:['param','min','max','type','SDVal'],
    computed:{
        currParam:function(){
            if(this.param=='temperature'){
                return this.temperature;
            }else if(this.param=='humidity'){
                return this.humidity;
            }
        },
        innerLeft:function(){//计算innerLeft
            if(this.type!='noBg'){
                if(this.param=='temperature'){
                    return (this.min*100/(this.temperature.max-this.temperature.min)).toFixed(2)+'%';
                }else if(this.param=='humidity'){
                    return (this.min*100/(this.humidity.max-this.humidity.min)).toFixed(2)+'%';
                }else{
                    return 0;
                }
            }else{
                return 0;
            }
        },
        innerWidth:function(){//计算innerWidth,当宽度<1%时候,为避免色条无法显示,产品人为规定显示宽度为1px
            if(this.type!='noBg'){
                if(this.param=='temperature'){
                    return ((this.max-this.min)*100/(this.temperature.max-this.temperature.min))<1?'1px':((this.max-this.min)*100/(this.temperature.max-this.temperature.min)).toFixed(2)+'%';
                }else if(this.param=='humidity'){
                    return ((this.max-this.min)*100/(this.humidity.max-this.humidity.min))<1?'1px':((this.max-this.min)*100/(this.humidity.max-this.humidity.min)).toFixed(2)+'%';
                }else{
                    return 0;
                }
            }else{
                return (this.SDVal*100/(this.max-this.min)).toFixed(2)+'%';
            }
        }
    },
    methods:{

    }
};