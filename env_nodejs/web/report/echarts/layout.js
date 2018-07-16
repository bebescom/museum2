var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var Canvas = require("canvas");

var CONTAINER_WIDTH = 800;//canvas容器宽度
var CONTAINER_HEIGHT;//canvas容器高度

var EQUIP_WIDTH = 35;//设备图片宽度
var EQUIP_HEIGHT = 55;//设备图片高度
var ctx, equipImg;

exports.generate = function (data) {

    var img_path = path.normalize(__dirname + '/../img/' + data.report_id);

    data.map = data.map || "";
    data.width = data.width || 1000;
    data.height = data.height || 1000;
    data.equips = data.equips || [];
    data.envs = data.envs || [];

    //换算容器和画布未拉伸高度
    CONTAINER_HEIGHT = data.height * CONTAINER_WIDTH / data.width;

    var canvas = new Canvas(CONTAINER_WIDTH, CONTAINER_HEIGHT + EQUIP_HEIGHT);
    ctx = canvas.getContext('2d');
    ctx.fillStyle = '#E1E1E1';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (!equipImg) {
        equipImg = new Canvas.Image();
        //设备图标应该按照设备类型字段进行匹配
        equipImg.src = fs.readFileSync(__dirname + '/newTypeIcon.png');
    }
    if (!data.map) {
        return false;
    }

    var img = new Canvas.Image();
    try {
        img.src = fs.readFileSync(img_path + '/' + path.basename(data.map));
    } catch (e) {
        console.error(data.map + ' not find');
        return false;
    }

    //先绘制出背景,在此基础上在图上绘制热区
    ctx.drawImage(img, 0, EQUIP_HEIGHT, CONTAINER_WIDTH, CONTAINER_HEIGHT);

    each_envs(data);

    each_equips(data);
    // console.log('layout end', canvas.toDataURL());
    return {base64img: canvas.toDataURL()};

};

function each_envs(data) {

    _.each(data.envs, function (env) {
        if (!env.locate) {
            return;
        }
        var locate = env.locate;
        if (_.isString(locate)) {
            locate = JSON.parse(env.locate);
        }
        var scaleX = (CONTAINER_WIDTH / locate.width).toFixed(2) * 1;
        var scaleY = (CONTAINER_HEIGHT / locate.height).toFixed(2) * 1;
        var x, y, startX = 0, startY = 0, len = locate.area.length;
        ctx.lineJoin = 'round';
        _.each(locate.area, function (str, index) {
            var xy = str.split(',');
            x = xy[0] * scaleX;
            y = xy[1] * scaleY + EQUIP_HEIGHT;
            if (index === 0) {
                //记录起点坐标
                startX = x;
                startY = y;
                // 第一个点,起笔
                ctx.beginPath();
                ctx.moveTo(x, y);
            } else if (index < len - 1) {
                ctx.lineTo(x, y);
            } else {
                ctx.lineTo(x, y);
                ctx.closePath();
                ctx.fillStyle = 'rgba(30, 177, 109, 0.5)';
                //ctx.strokeStyle = 'rgba(30, 177, 109, 0.5)';
                ctx.fill();
                //ctx.stroke();
                //在起点位置,增加环境名称
                ctx.font = '16px';
                var textWidth = ctx.measureText(env.name).width;
                ctx.fillStyle = 'rgba(0,0,0,1)';
                ctx.fillText(env.name, startX, startY);
            }
        });

    });
}


var equip_icons = {
    def: [140, 495],
    温湿度监测终端: [0, 55],
    手持式温湿度检测仪: [0, 220],
    带屏温湿度监测终端: [35, 55],
    光照紫外监测终端: [70, 55],
    手持式光照紫外检测仪: [70, 220],
    二氧化碳监测终端: [105, 55],
    手持式二氧化碳检测仪: [105, 220],
    有机挥发物监测终端: [140, 55],
    有机挥发物检测仪: [140, 220],
    手持式有机挥发物检测仪: [140, 220],
    空气质量监测终端: [175, 55],
    震动监测终端: [210, 55],
    气象站: [280, 55],
    土壤温湿度监测终端: [315, 55],
    安防监测终端: [350, 55],
    网关: [0, 275],
    中继: [35, 275],
    调湿机: [70, 275],
    智能囊匣: [175, 275],
    充氮调湿柜: [210, 275],
    智能展柜: [245, 275],
    灯光调控终端: [280, 275],
    调控材料: [315, 275],
    一级文物: [0, 495],
    二级文物: [35, 495],
    三级文物: [70, 495],
    一般文物: [105, 495],
    未定级文物: [140, 495],
    其他文物: [175, 495],
    甲醛监测终端: [636, 387],
    甲醛检测仪: [636, 552],
    手持式甲醛检测仪: [636, 552],
    二氧化硫监测终端: [671, 387],
    分体式多参数监测终端: [706, 387],
    氧化氮物监测终端: [741, 390],
    臭氧监测终端: [776, 387],
    智能存储柜: [811, 387],
};

var equip_locate = {};

function each_equips(data) {
    equip_locate = {};
    _.each(data.equips, function (equip) {
        if (!equip.locate) {
            return;
        }
        var locate = equip.locate;
        if (_.isString(locate)) {
            locate = JSON.parse(equip.locate);
        }
        var scaleX = (CONTAINER_WIDTH / locate.width);
        var scaleY = (CONTAINER_HEIGHT / locate.height);

        var xy = locate.area[0].split(',');
        var x = (xy[0] * scaleX - EQUIP_WIDTH / 2).toFixed(2) * 1;
        var y = (xy[1] * scaleY).toFixed(2) * 1;

        var name = equip.equip_no.slice(-4);

        if (['网关', '中继'].indexOf(equip.equip_type) > -1) {
            // var textWidth = ctx.measureText(name).width;
            // ctx.fillStyle = 'rgba(0,0,0,1)';
            // loadImg(equip, x, y);
            // ctx.fillText(name, x + EQUIP_WIDTH / 2 - textWidth / 2, y);
            return;
        }

        //网格化聚合显示
        var key = Math.round(x / 10) + '_' + Math.round(y / 10);

        // console.log(key, name);
        if (equip_locate[key]) {
            equip_locate[key].count++;
            equip_locate[key].name.push(name);
            return;
        }
        equip_locate[key] = {
            count: 1,
            x: x,
            y: y,
            name: [name]
        };
        loadImg(equip, x, y);

    });

    _.each(equip_locate, function (row) {
        var text = row.count,
            textWidth = ctx.measureText(text).width;
        //设置绘制角标的延时,确保角标层位于图层顶部
        // 画一个白色底,绿色边框的圆圈
        var x = row.x + EQUIP_WIDTH - textWidth, y = row.y + 10;
        if (text > 1) {
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#1BBC9B';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x, y, 8, 0, Math.PI * 2, true);
            ctx.fill();
            ctx.stroke();
            ctx.closePath();
            ctx.fillStyle = '#1BBC9B';
            ctx.font = "bold 10px";
            if (text < 10) {
                ctx.fillText(text, x - 3, y + 4);
            } else {
                ctx.fillText(text, x - 6, y + 4);
            }
        }
        text = row.name.join(',');
        textWidth = ctx.measureText(text).width;
        ctx.fillStyle = 'rgba(0,0,0,1)';
        ctx.fillText(text, row.x + EQUIP_WIDTH / 2 - textWidth / 2, row.y);

    });

}


function loadImg(equip, x, y) {

    var icon = equip_icons.def;
    if (equip_icons[equip.equip_type]) {
        icon = equip_icons[equip.equip_type];
    }
    ctx.drawImage(equipImg, icon[0], icon[1], EQUIP_WIDTH, EQUIP_HEIGHT, x, y, EQUIP_WIDTH, EQUIP_HEIGHT);
}