/**
 * Created by user on 2017/6/23.
 */
var vm ;
exports.init = function(env_no){
    vm = exports.vm = new Vue({
        el:"#contrast_box",
        data:{
            configLanguage: window.languages,
        }
    });
};

