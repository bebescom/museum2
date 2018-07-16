
//Vue自定义指令,用于效验角色权限分配
Vue.directive('permission', function (permission) {
    var me = this;
    if (window.web_permissions) {
        if (window.web_permissions === 'administrator') {
            setTimeout(function () {
                $(me.el).removeClass('permissionHidden');
            }, 0);
        } else {
            if (permission && permission.name) {
                if (window.permission_arr.indexOf(permission.name) !== -1) {
                    $(this.el).removeClass('permissionHidden');
                }
            }
        }
    }
});

window.permission_arr = [];

window.web_permissions = window.web_config.user.permissions;

if (window.web_permissions !== 'administrator') {
    _.each(window.web_permissions, function (row, key) {
        window.permission_arr.push(key);
        if (_.isArray(row) && row.length) {
            _.each(row, function (permission) {
                window.permission_arr.push(permission.name);
            });
        }
    });
}

window.checkPermissions = function (permission, tooltip) {
    if (!tooltip) {
        tooltip = true;
    }
    if (tooltip) {
        if (window.web_permissions !== 'administrator' && window.permission_arr.indexOf(permission.name) === -1) {
            if (permission && permission.name) {
                window.header_vm.$Message.error('缺少权限:' + permission.name);
            }
        }
    }
    //判断角色是否为超级管理员或者角色有相关权限
    return window.web_permissions === 'administrator' || window.permission_arr.indexOf(permission.name) !== -1;
};

window.goPermission = function (permission) {
    if (checkPermissions(permission)) {
        window.location.href = permission.url;
    } else {
        if (permission && permission.name) {
            window.header_vm.$Message.error('缺少权限:' + permission.name);
        }
    }
};