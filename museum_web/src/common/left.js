// @require css/left.css

var vm = new Vue({
    el: '#left',
    data: {
        classKey: true,
        vibration: false,
        capsule:false,
        language: window.languages,
        // pathname:null
    },

    methods: {
//      slider:function(num){
//          var $slider=$('.slider');
//          $slider.stop().animate({'top':num*84-num+'px'});
//      },
//      fixed:function(){
//          this.classKey=!this.classKey;
//      },
//      showSlider:function(bool){
//          if(this.classKey){
//              $('#left_slide').stop().animate({left:(bool?0:-66)+'px'},function(){
//                  $(this).find('.btn').css('display',bool?'none':'block');
//              }); 
//         }
//      },
    },
    created: function () {
        this.vibration = window.web_config.vibration;
        this.capsule = window.web_config.capsule;
        // if(window.location.pathname){
        //     this.pathname = window.location.pathname;
        // }

        // console.log(this);
        // console.log(window.location);
        // checkModule(this.pathname);
    }
});

//通过当前URL,检测位于哪个功能模块
// function checkModule(pathname){
//
// }
