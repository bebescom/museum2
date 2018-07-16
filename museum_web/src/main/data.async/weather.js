define('data.async/weather', function (require, exports) {

    exports.init = function () {
        var $data_weather=$('#data_weather'),
            $box=$data_weather.find('.box'),
            $right=$data_weather.find('.right');
        $right.find('span').css('display','inline').click(function(){
            window.location='../weather';
        });
        $.get(API('/env/environments/overviews/weather/weathers'), function (data) {
        	console.log(data);
            $box.css('opacity','1').parent().css('background','rgb(245, 242, 222)');
            var num=0;
            _.each(weathers, function (field, i) {
                if (!data[field]) {
                    return;
                }
                if(data[field].val==''){
                	return;
                }
                num++;
                if (data[field].name=='二氧化碳') {
                    data[field].name='co2';
                }else if(data[field].name=='有机挥发物'){
                    data[field].name='voc';
                }
                $box.append('<div class="weather_box"><span>' + data[field].name + '</span><div class="icon_' + field + '"></div><p>' + data[field].val + data[field].unit + '</p></div>');
            });
			if(num==0){
				return;
			}
			$data_weather.show();
            var width=52;
            var allWidth=$box.width();
            var left=(allWidth-width*num)/(num+1);
            $box.children('div').each(function(i){
                $(this).css('left',(i*width+(i+1)*left)/allWidth*100+'%');
            });

        }, 'json');
    };
    var weathers = ['air_presure','co2','humidity','light','pm10','pm25','rain','temperature','uv','voc','wind_direction','wind_speed'];

});