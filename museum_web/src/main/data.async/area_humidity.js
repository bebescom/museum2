define('data.async/area_humidity', function (require, exports) {
    
    var scroll_init=require('main/data').scroll_init;
    exports.init = function () {
        var $data_area_humidity=$('#data_area_humidity');
        $data_area_humidity.find('.box').append('<div class="area_slide"></div>' +
            '<div class="area_box"><ul></ul>' +
            '</div>');

        $data_area_humidity.bind('mousewheel',function(e){
            e.stopPropagation();
        });

        $.get(API('/env/environments/overviews/env_stabilities'), function (data) {
            $data_area_humidity.css('background','#F5F2DE').find('.box').css('opacity','1');
            if (data=='[]') {
                $data_area_humidity.find('.box').html('暂无数据').css({'text-center':'center','line-height':175});
                return;
            }
            var $ul = $data_area_humidity.find('.area_box ul');

            $ul.append('<li>' +
                    '<p class="name">' + data.name + '</p>' +
                    '<div class="bg"><i></i></div>' +
                    '<p class="num">' + (data.SD).toFixed(2) + '</p>' +
                    '</li>');
            _.each(data.hall, function (row) {
                $ul.append('<li>' +
                    '<p class="name">' + row.name + '</p>' +
                    '<div class="bg"><i></i></div>' +
                    '<p class="num">' + (row.SD).toFixed(2) + '</p>' +
                    '</li>');
            });
            $ul.find('li').each(function () {
                var $this = $(this), num = $this.find('p.num').text() * 1;
                $this.find('.bg i').animate({width: 10 * num  + '%'});
            });

            var ul = $('.area_box ul'),
                drag_area = $data_area_humidity.find('.box'),
                slider = $data_area_humidity.find('.area_slide'),
                box = $data_area_humidity.find('.area_box');

			if(data.hall.length<=3){
				slider.css('display','none');
				$data_area_humidity.bind('mousewheel',function(e){
					e.preventDefault();
				});
				return;
			}else{
	            scroll_init(ul,drag_area,slider,box);
            }
        }, 'json');

    };

    

});