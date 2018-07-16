define('capsule', function(require, exports, module) {
// 
// 
// 
// 
require('common/header');

function heightInit(){
	var Height=$(window).height()-83,
	$leftSlider=$('#left'),
	$content=$('#content');
	$leftSlider.css('height',Height+'px');
	$content.css('height',Height+'px');

	/*设备详情*/
	$('.scrollWrap').css('height',Height-65+'px');
}
$(window).resize(function(){
	heightInit();
});
//----------------------------------------------------------------------------
var Integrated_management=require('capsule/Integrated_management'),			//综合管理
	capsule_content=require('capsule/capsule_content'),						//智能囊匣
 	environmental_monitoring=require('environmentalMonitoring/environmental_monitoring'),		//环境监控
 	environment_content=require('environmentalMonitoring/environment'),						//环境详情
    Environmental_levels=require('environmentalMonitoring/Environmental_levels'), 			//环境超标列表

    relic_content=require('relicManagement/relic'),									//文物管理
	//文物管理模块引入
 	relicsStorage = require('relicManagement/relicsStorage'),		//文物入库
 	relicsOutStorage = require('relicManagement/relicsOutStorage'),	//文物出库
	relicsCheck = require('relicManagement/relicsCheck'),			//文物盘点

	newPlan = require('relicManagement/newPlan'),					//发起盘点
	planDetail = require('relicManagement/planDetail');				//盘点详情

var left=require('capsule/left');
var app=Vue.extend({
	components:{
		'left':left,
	},
	ready:function(){
		heightInit();
	},
	methods:{
        hideOverlay:function(){
        	this.$broadcast('hideOverlay');
		}
	}
});


var router = new VueRouter();

router.map({
	'/integrated':{
		component:Integrated_management
	},
	'/capsule':{
		component:capsule_content
	},
	'/environment':{
		component:environmental_monitoring
	},
	'/environment/Environmental_levels':{
		component:Environmental_levels
	},
	'/environment/environment_details/:env_no':{
		component:environment_content
	},
    '/environment/environment_details/':{
        component:environment_content
    },
	'/relic':{
		component:relic_content
	},
	'/relic/relicsStorage':{
		component:relicsStorage
	},
    '/relic/relicsOutStorage':{
        component:relicsOutStorage
    },
    '/relic/relicsCheck':{
        component:relicsCheck
    },
    '/relic/relicsCheck/newPlan':{
		component:newPlan
	},
    '/relic/relicsCheck/planDetail/:plan_no':{
		component:planDetail
	},
	'/equipManagement':{
		component:function(){
			console.log('equipManagement');
			location.href="../equipManage";
		}
	},
	'/equipManagement/equip_details/:equip_id':{
		component:function(){
			console.log('equip_details',arguments);
			location.href="../equipManage/#/equip_info/"+location.hash.replace("#!/equipManagement/equip_details/","");
		}
	},
});



router.start(app,'#app');

//权限跳转控制
// console.log(window.web_permissions);
// console.log(window.location.hash);
var hash = window.location.hash;
//如果URL当前有路由信息,则不进行跳转
if(hash){
    var jump = hash.split('#!')[1];
}

if(window.web_permissions){
    var routeUrl = '';
    setTimeout(function(){
        $('.shadow.wholeShadow').hide();
    },0);
    // if(!checkPermissions({name:'综合管理'})){
    //     return;
    // }
	if(window.web_permissions==='administrator'||checkPermissions({name:'综合管理'},false)){
        routeUrl = '/integrated';
	}else if(checkPermissions({name:'环境监控'},false)){
        routeUrl = '/environment';
	}else if(checkPermissions({name:'文物管理'},false)){
        routeUrl = '/relic';
	}else if(checkPermissions({name:'用户管理'},false)){
		window.location.href='../userManagement/#!/userManagement';
	}
    // console.log(routeUrl);
	if(routeUrl){
        router.redirect({
            '*': routeUrl
        });
        if(!jump){
            router.go(routeUrl);
        }
	}
}
});