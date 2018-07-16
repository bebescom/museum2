/**
 * Created by Hebj on 2018/6/26.
 */
exports.generate = function(data)
{
    data.lineData = data.lineData || [];
    data.unit = data.unit || '';
    data.color = data.color || ["","#4F81BD", "#9BBB59", "#8064A1"];

    data.xdata = data.lineData.category || [];
    data.ydata = data.lineData.line_data || [];
    data.name = data.lineData.name || [];

    var option = {
        backgroundColor: '#E1E1E1',
        title: {
            text: 'CO2时刻曲线图',
        },
        legend: {
            data: [data.name],
            bottom: 10
        },
        color: data.color,
        xAxis:  {
            type: 'category',
            boundaryGap: false,
            data:data.xdata
        },
        yAxis: {
            type: 'value',
            //axisLabel: {
            //    formatter: '{value}'
            //},
            //axisPointer: {
            //    snap: true
            //}
        },
        series: [
            {
                name:data.name,
                type:'line',
                smooth: true,
                data:data.ydata,
                lineStyle: {
                    normal: {
                        color: '#2F4F4F'
                    }
                },
            }
        ]
    };

    if (data.unit) {
        option.yAxis.name = '单位：' + data.unit;
    }
    //console.log(JSON.stringify(option));
    return require('./echarts')({
        option: option,
        data: data
    });
};
