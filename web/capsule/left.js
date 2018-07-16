define('capsule/left', function(require, exports, module) {
// 
module.exports = Vue.extend({
    template: '#left_template',
    data: function () {
        return {
            vibration: false,
            language: window.languages,
        }
    },
    created: function () {
        this.vibration = window.web_config.vibration;
        this.capsule = window.web_config.capsule;
    },
    methods:{
        equipManage:function(){
            window.location.href="../equipManage";
        }
    }
});
});