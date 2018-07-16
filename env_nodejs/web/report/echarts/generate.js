var _ = require('underscore');
var fs = require('fs');

exports.get_base64 = function (image_type, image_data, report_id) {

    if (!image_type || !image_data || !handle[image_type]) {
        return false;
    }

    var rt = handle[image_type](image_data, report_id);
    if (!rt) {
        return false;
    }

    return rt;

};
//{data:{name1:[],name2:[]},unit:"%"}
var handle = {};
//箱线图
handle['box_plot'] = function (image_data) {

    if (!image_data || !_.size(image_data.data)) {
        return false;
    }

    var box = require('./box');

    var box_data = {
        xAxisData: [],
        boxplotData: [],
        scatterData: [],
        unit: image_data.unit || '',
    };

    var $i = 0;
    _.each(image_data.data, function (tdata, hall_name) {

        box_data.xAxisData.push(hall_name);
        box_data.boxplotData.push(tdata.slice(0, 5));
        _.each(tdata[5], function (out_val) {
            //if (out_val && out_val != 0) {
            box_data.scatterData.push([out_val, $i]);
            //}
        });
        $i++;

    });

    return box.generate(box_data);

};

//单一曲线图
handle['line'] = function (image_data) {
    if (!image_data || !_.size(image_data.data)) {
        return false;
    }
    var line = require('./line');
    var name = _.keys(image_data.data)[0];

    var box_data = {
        lineData: image_data.data[name],
        //interval: 1000 * 60 * 60 * 24 * 10, //间隔10天
        unit: image_data.unit || '',
        name: name,
    };

    return line.generate(box_data);

};
//调控均峰图曲线图
handle['peak_line'] = function (image_data) {
    if (!image_data || !_.size(image_data.data)) {
        return false;
    }

    var line = require('./peak_line');

    var box_data = {
        unit: image_data.unit || '',

        minData: image_data.data['极小值'],
        peakData: [],//image_data.data['极大值'],
        avgData: image_data.data['平均值'],
        targetData: image_data.data['调控目标值'],
    };
    _.each(image_data.data['极小值'], function (tdata, index) {

        box_data.peakData.push([tdata[0], image_data.data['极大值'][index][1] - tdata[1]]);
        //box_data.minData.push(tdata[1]);
        //box_data.avgData.push(tdata[2]);
    });

    return line.generate(box_data);

};

//均峰图，类柱状图
handle['peak_average_valley'] = function (image_data) {
    if (!image_data || !_.size(image_data.data)) {
        return false;
    }

    var box = require('./peak_average_valley');

    var box_data = {
        xAxisData: [],
        peakData: [],//峰值,最大值减最小值
        minData: [],
        avgData: [],
        unit: image_data.unit || '',
    };

    _.each(image_data.data, function (tdata, hall_name) {

        box_data.xAxisData.push(hall_name);
        box_data.peakData.push(tdata[0] - tdata[1]);
        box_data.minData.push(tdata[1]);
        box_data.avgData.push(tdata[2]);
    });

    return box.generate(box_data);

};


handle['bar'] = function (image_data) {
    if (!image_data || !_.size(image_data.data)) {
        return false;
    }

    var box = require('./bar');

    var box_data = {
        yAxisData: [],
        barData: [],
        unit: image_data.unit || '',
    };

    _.each(image_data.data, function (tdata, hall_name) {
        box_data.yAxisData.push(hall_name);
        box_data.barData.push(tdata);
    });

    return box.generate(box_data);

};


//日历图
handle['calendar'] = function (image_data) {
    if (!image_data) {
        return false;
    }

    var box = require('./calendar');

    var box_data = {
        range: image_data.range,//日历范围
        calendarData: image_data.data,//每日数据
        topData: image_data.top,//top数据
        legend: ['日波动', 'Top ' + image_data.top_len],//top点个数
        ch_size: image_data.ch_size//标记点size变化倍数
    };
    return box.generate(box_data);
};
//平面图
handle['layout'] = function (image_data, report_id) {


    var box = require('./layout');

    var box_data = {
        report_id: report_id,
        map: image_data.map,
        width: image_data.width,
        height: image_data.height,
        equips: image_data.equips,
        envs: image_data.envs,
    };
    return box.generate(box_data);
};

//散点图
handle['scatter'] = function (image_data, report_id)
{
    var scatter = require('./scatter');

    var scatter_data = {
        markLine: image_data.markline,//回归函数
        allData: image_data.all_data,//散点数据
        markLineData: image_data.markline_data,//回归线数据
        xAxis:image_data.xAxis,//x轴
        yAxis:image_data.yAxis,//y轴
    };
    //console.log("scatter: ",JSON.stringify(scatter_data.markLine));
    return scatter.generate(scatter_data);
};

//热力图
handle['heatmap'] = function (image_data, report_id)
{
    var heatmap = require('./heatmap');

    var heatmap_data = {
        range: image_data.range,//数据范围
        allData: image_data.all_data,//
        xAxis:image_data.xAxis,//x轴
        yAxis:image_data.yAxis,//y轴
    };
    //console.log("generate: ",heatmap_data);
    return heatmap.generate(heatmap_data);
};

//热力图
handle['time_line'] = function (image_data, report_id)
{
    var time_line = require('./time_line');

    var time_line_data = {
        unit: image_data.unit,//数据范围
        lineData: image_data.data,
    };
    //console.log("time_line: ",time_line_data);
    return time_line.generate(time_line_data);
};