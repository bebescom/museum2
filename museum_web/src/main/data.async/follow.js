define('data.async/follow', function (require, exports) {
    var scroll_init=require('main/data').scroll_init;
    exports.init = function () {

        var $data_follow=$('#data_follow');
        $data_follow.find('.box').append('<div class="area_slide"></div><div class="area_box"><ul></ul></div>');


        $data_follow.bind('mousewheel',function(e){
            e.stopPropagation();
        });

         $.get(API('/env/environments/overviews/follows'), function (data) {
            $data_follow.css('background','#F5F2DE').find('.box').css('opacity','1');
            if (data=='[]') {
                $data_follow.find('.box').find('.box').html('暂无数据').css({'text-center':'center','line-height':175});
                return;
            }
            if (!data['total'] || data.total == 0) {
                return;
            }

            var type={
                cabinet:'cabinet',
                area:'cabinet',
                relic:'relic',
                equip:'equip'
            },
            type_no={
                cabinet:'env_no',
                area:'env_no',
                relic:'relic_no',
                equip:'equip_no'
            };
            _.each(data.rows, function (row) {
                var color = row['color'] ? ' style="color:' + row.color + ';"' : '',
                    key=row.type,
                    src="../"+type[key]+"?"+type_no[key]+'='+row.no;
                $data_follow.find('.area_box ul').append('<li><a href='+src+'><img src="' + (row.image || '../common/images/relic.png') + '" /><p' + color + ' data-title='+row.name+'>' + row.name + '</p></a></li>');
            });

            var ul = $data_follow.find('.area_box ul'),
                drag_area = $data_follow.find('.box'),
                slider = $data_follow.find('.area_slide'),
                box = drag_area.find('.area_box');

            if (ul.height()<=187) {
                slider.css('display','none');
                return;
            }

            scroll_init(ul,drag_area,slider,box);

        }, 'json');


    };

});