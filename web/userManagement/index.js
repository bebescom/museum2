define('userManagement/index', function(require, exports, module) {
//
//
//
//
//
require('common/header');
require('common/left');

var addUser = require('userManagement/addUser'),
    editUser = require('userManagement/editUser'),
    roleSetting = require('userManagement/roleSetting'),
    userManagement = require('userManagement');


var router = new VueRouter();
var app = Vue.extend({

});
router.map({
    '/addUser':{
        component:addUser
    },
    'editUser/:id':{
        component:editUser
    },
    '/roleSetting':{
        component:roleSetting
    },
    '/userManagement':{
        component:userManagement
    }
});
router.redirect({
    '*':'/userManagement'
});

router.start(app,'#content');
});