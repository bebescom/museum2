//@require $
//@require vue

var vm;

exports.init = function (env_no) {
    vm = exports.vm = new Vue({
        el: '#net_box',
        data: {
            gateway_total: 0,
            relay_total: 0,
            net_total: 1,
            all_gateway:[],
            all_relay:[],
            gateway_list: [],
            relay_list: [],
            configLanguage: window.languages,
        },
        computed:{
        	bgColor:function(){
				return this.gateway_total+this.relay_total?'#70c855':'#ccc';
        	},
        	width:function(){
        		return this.gateway_total/(this.gateway_total+this.relay_total)||0;
        	}
        },
        methods: {
            goNetUrl:function(item){
                var obj = {name:"设备管理",equip_no:item.equip_no,url:'../equipManage/#/equip_info/'+item.equip_no};
                return 'javascript:goPermission('+JSON.stringify(obj)+')';
            }
        }
    });

    $.get(API('/env/environments/networks/network_lists/' + env_no), function (data) {
        vm.$set('gateway_total', data['网关'].total);
        vm.$set('relay_total', data['中继'].total);
        vm.$set('net_total', vm.gateway_total + vm.relay_total);

        vm.$set('gateway_list', data['网关'].rows);
        vm.$set('relay_list', data['中继'].rows);

        vm.$set('all_gateway', data['网关'].rows);
        vm.$set('all_relay', data['中继'].rows);

        net();

    }, 'json');
};
function net(){
    var $net_form=$('.internet form'),
        $net_btn=$net_form.children();

    $net_btn.find('i').click(function(e){
        $(this).addClass('active').parent().addClass('flow').animate({width: 200 + "px"});
        e.stopPropagation();
    });

    $net_btn.find('input').click(function(e){
        e.stopPropagation();
    });

    $(document).click(function(){
        $net_btn.find('i').removeClass('active').parent().animate({width: "35px"}).removeClass('flow');
    });

    search_($net_btn);
}

function search_($net_btn){
    var $icon=$net_btn.find('.icon'),
        $input=$icon.siblings('input');

    $input.keydown(function(e){
        if (e.keyCode==13) {
            insert(search_content,$(this).val());
            e.preventDefault();
            return false;
        }
    });
}
function search_content(val){
    var a,b,
        all_gateway=vm.all_gateway,
        all_relay=vm.all_relay;

    a = all_gateway.filter(function (con, i, array) {
        if (con.name.search(val)!=-1) {
            return true;
        }
    });
    b = all_relay.filter(function (con, i, array) {
        if (con.name.search(val)!=-1) {
            return true;
        }
    });
    return {
        all_gateway:a,
        all_relay:b
    };
}
function insert(fn,html){
    $data_view=$('.internet .li_num');
    var newObj = fn(html),
        gateway=newObj.all_gateway,
        relay=newObj.all_relay;

    vm.gateway_list=gateway;
    vm.relay_list=relay;

    vm.gateway_total=gateway.length;
    vm.relay_total=relay.length;
}