// @require css/footer.css
// @require vue
// @require $
// @require _
var vm;
exports.init = function () {

    vm = exports.vm = new Vue({
        el: '#footer',
        data: {
            score: {
                global_score: [],
                env_score: [],
                equip_score: [],
                manage_score: []
            },
            toggle_day: 'yesterday'
        },
        methods: {
            toggle_comp: function (day) {
                this.toggle_day = day;
                getStandard();
            }
        }
    });
    animate();
    getScore();
    getStandard();
};

function animate() {
    $('#footer_flip').hover(function () {
        $(this).find('p').animate({paddingBottom: 20}, 'fast');
    }, function () {
        $(this).find('p').animate({paddingBottom: 0}, 'fast');
    });
}

function getScore() {

    $.get(API('/env/environments/homepage/museum_scores'), function (data) {
        if (data && data['global_score']) {
            _.each(data, function (v, k) {
                vm.$set('score.' + k, _.range(4 * v / 100));
            });
        }
    }, 'json');
}

function getStandard() {
    $.get(API('/env/environments/homepage/standard_params/' + vm.toggle_day), function (data) {
        if (data.total == 0) {
            return;
        }
        _.each(data.rows, function (row) {
            var canvas_id = '#' + row.param + '_rate';

            if ($(canvas_id)[0]) {
                drawCircle($(canvas_id)[0], (row.rate==0||row.rate)?row.rate:'离线');
            }
        });

    }, 'json');
}


function drawCircle(dom_id, num, option) {

    option = {
        x: 24,
        y: 24,
        radius: 20,    // 圆环半径
        lineWidth: 8,  // 圆环边的宽度
        strokeStyle: 'rgb(54,176,135)',//边的颜色
        tfillStyle: 'rgb(54,176,135)',  //填充色
        bgstrokeStyle: 'rgb(200,200,200)',
        fontColor: '#ffffff' //字体颜色
    };

    var PI = Math.PI;
    var ctx = dom_id.getContext('2d');

    ctx.moveTo(option.x, option.y);
    ctx.lineWidth = option.lineWidth; //线宽

    function draw(process) {
        //var r = deg*Math.PI/180;   //canvas绘制圆形进度
        ctx.clearRect(0, 0, 50, 50);   //先清理
        ctx.strokeStyle = option.bgstrokeStyle; //canvas边框颜色
        ctx.beginPath();
        ctx.arc(option.x, option.y, option.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = option.strokeStyle; //canvas边框颜色

        ctx.beginPath();  //路径开始
        ctx.arc(option.x, option.y, option.radius, PI * -.5, PI * 2 * process / 100 - PI / 2);
        ctx.stroke();
        
        $(dom_id).siblings('span').text(Math.round(process) + "%");
    }

    var i = 0;

    function _start() {
        draw(i);
        i++;
        if (i <= num) {
            setTimeout(_start, 1);
        }
    }
	if(typeof num=='number'){
	    _start();
	}else{
		$(dom_id).siblings('span').text(num);
	}
}