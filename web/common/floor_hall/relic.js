define('common/floor_hall/relic', function(require, exports, module) {
//
//
//
//

var vm;

exports.init = function (env_no) {
    vm = exports.vm = new Vue({
        el: '#relic_box',
        data: {
            searchTxt:'',
            styleObject: {width:'144px'},
            relic_total: 0,     //总数
            filter_num:-1,      //筛选数
            all_relic:[],       //所有的文物
            relic_list: [],     //所有的文物
            material:[],        //物质
            age:[],             //年代
            category:[],        //主题词
            condition:{         //不同类型筛选条件
                material:[],
                age:[],
                category:[]
            },
            configLanguage: window.languages,
        },
        methods: {
            goRelicUrl:function(item){
                var obj = {name:"文物管理",relic_no:item.relic_no,url:'../relic?relic_no='+item.relic_no};
                // ../relic?relic_no={{item.relic_no}}
                return 'javascript:goPermission('+JSON.stringify(obj)+')';
            },
            addChooce:function(type,name){
            	if(this.searchTxt)this.searchTxt='';
                var type=this.condition[type],
                    index=type.indexOf(name);
                if (index!=-1) {
                    type.splice(index,1);
                }else{
                    type.push(name);
                }
                this.filter();
            },
            removeChooce:function(type,name){
                this.condition[type].splice(this.condition[type].indexOf(name),1);
                this.filter();
            },
            filter:function(){
                var arr=this.all_relic,
                    condition=this.condition;

                var newArr=arr.filter(function(con,i){
                    var key=true;
                    for(var i in condition){
                        if(condition[i].length==0){continue;}
                        if(condition[i].indexOf(con[i])==-1){
                            key=false;
                        }
                    }
                    return key;
                });

                this.change(newArr);
            },
            search:function(){
                var arr=this.all_relic,
                    condition=this.condition,
                    searchTxt=this.searchTxt;

                for(var i in condition){
                    condition[i]=[];
                }
                var newArr=arr.filter(function(con){
                    var key=true;
                    if (con.name.search(searchTxt)==-1) {
                        key=false;
                    }
                    return key;
                });
                this.change(newArr);
            },
            change:function(newArr){
                this.relic_list=newArr;
                if (newArr.length==this.all_relic.length) {
                    this.filter_num=-1;
                    return;
                }
                this.filter_num=newArr.length;
            }
        }
    });

    $.get('/2.2.05_P001/base_api/relic/relics/count/relics_level/' + env_no+'', function (data) {
        var series_data=[],num=0;
        for(var i in data){
            series_data.push({value:data[i],name:i});
            num+=data[i];
        }
        if(num==0){
        	$('.relic .information .tips').show();
        	return;
        }
        relic_chart(series_data);

    }, 'json');

    $.get('/2.2.05_P001/base_api/relic/relics', {parent_env_no: env_no}, function (data) {
        vm.$set('relic_total', data.total);
        
        var data_list=data.rows,
            $relic_form=$('.relic form'),
            $relic_btn=$relic_form.children();

		if($('#relic_box').hasClass('active')){
			insert_relic();
		}else{
        	$('#relic_box .panel-title a').one('click',insert_relic);
        }
        function insert_relic () {
        	vm.$set('all_relic', data_list);
            vm.$set('relic_list', data_list);

            relic($relic_btn);
            insert($relic_btn);
        }
    }, 'json');

};


function relic_chart(series_data) {

    var myChart = echarts.init($('#relic_chart')[0]);
    var option = {
        tooltip: {
            trigger: 'item',
            formatter: "{b} : {c} ({d}%)"
        },
        series: [
            {
                type: 'pie',
                radius: '65%',
                center: ['50%', '50%'],
                data: series_data,
                itemStyle: {
                    emphasis: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }
        ]
    };
    myChart.setOption(option);
}

function relic($relic_btn){

    $relic_btn.find('i').each(function(i){
        var width=(i==0)?200:200;
        $(this).click(function(e){
            $(this).addClass('active').parent().siblings().find('.icon').removeClass('active');
            $(this).parent().animate({width: width + "px"}).siblings().animate({width: "35px"});
            $(this).parent().addClass('flow').siblings().removeClass('flow');
            e.stopPropagation();
        })
    });

    $relic_btn.find('input').click(function(e){
        e.stopPropagation();
    });

    $(document).click(function(){
        $relic_btn.find('i').removeClass('active').parent().animate({width: "35px"}).removeClass('flow');
    });

}

function insert($relic_btn){

    var $filter=$relic_btn.find('.filter'),
        age=[],category=[],material=[];
    $filter.find('.font').click(function(e){
        e.stopPropagation();
    }).hover(function () {
        $(this).find('ul').stop().addClass('hover').css('display', '')
            .animate({'height': $(this).find('li').size() * 23 + 'px'});
    }, function () {
        $(this).find('ul').stop().removeClass('hover').animate({'height': '0px'}, function () {
            $(this).css('display', 'none');
        });
    });
    for(var i=0;i<vm.relic_list.length;i++){
        fil(vm.relic_list[i].age,age);
        fil(vm.relic_list[i].category,category);
        fil(vm.relic_list[i].material,material);
    }

    vm.material=material;
    vm.age=age;
    vm.category=category;
}

function fil(num, array) {
    var a = true;
    for (var i = 0; i < array.length; i++) {
        if (array[i] == num) {
            a = false;
        }
    }
    if (a) {
        array.push(num);
    }
}
});