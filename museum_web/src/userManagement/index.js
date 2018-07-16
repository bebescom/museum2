//@require ./css/userManagement.css
//@require ./css/addUser.css
//@require ./css/roleSetting.css
//@require _
//@require vue-router
require('common/header');
require('common/left');

var addUser = require('./addUser'),
    editUser = require('./editUser'),
    roleSetting = require('./roleSetting'),
    userManagement = require('./userManagement');


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