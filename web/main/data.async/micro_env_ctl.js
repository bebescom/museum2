define('data.async/micro_env_ctl', function (require, exports) {
    exports.init = function () {
        var $data_micro_env_ctl=$('#data_micro_env_ctl');
        $data_micro_env_ctl.find('.box').append('<table width="100%"><tr>' +
            '<td><div id="micro_char" style="height: 180px;"></div></td>' +
            '<td width="40%"><dl id="micro_dt" class="micro_dt"><dt>共监控 <span class="total"></span> 个点</dt>' +
            '<dt>综合达标率 <span class="rate"></span></dt>' +
            '</dl></td>' +
            '</tr></table>');
        var colors = ['#6CCC87', '#FFD966', '#ED7D31'];
        var datas = {};

        my_chart = echarts.init($('#micro_char')[0]);
        $.get('/2.2.05_P001/base_api/env/environments/overviews/standard_reaches', function (data) {
            $data_micro_env_ctl.css('background','#F5F2DE').find('.box').css('opacity','1');
            if (data=='[]') {
                $data_micro_env_ctl.find('.box').html('暂无数据').css({'text-center':'center','line-height':175});
                return;
            }
            if (!data || !data['total'] || data.total == 0) {
                return;
            }
            var total_quantity = 0, rate = 0, rate_num = 0;
            _.each(data.rows, function (row, i) {
                if (row.rate != '无数据'&&row.rate != '-') {
                    rate_num += row.quantity * row.rate / 100;
                }

                total_quantity += row.quantity;
                $('#micro_dt').append('<dd><i style="background: ' + colors[i] + '"></i>' + row.name + '-' + (row.rate == '无数据' ? row.rate : (row.rate + '%')) + '</dd>');
                data.rows[i].itemStyle = {
                    normal: {color: colors[i]}
                };
            });
            _.each(data.rows, function (row, i) {
                data.rows[i].value = (100 * row.quantity / total_quantity).toFixed(0);
            });

            chart_init(data.rows);
            $('#micro_dt span.total').text(total_quantity);
            $('#micro_dt span.rate').text((100*rate_num / total_quantity).toFixed(0) + '%');

        }, 'json');
    };
    var my_chart;

    function chart_init(data) {
        var option = {
            title: {
                show: false
            },
            tooltip: {
                show: true,
                trigger: 'item',
                formatter: "{b}占总比 : {c}% "
            },
            series: [
                {
                    type: 'pie',
                    radius: '85%',

                    data: data.sort(function (a, b) {
                        return a.value - b.value
                    }),
                    label: {
                        normal: {
                            position: 'inner',
                            formatter: "{c}%"
                        }
                    },
                    labelLine: {
                        normal: {
                            show: false
                        }
                    }
                }
            ]
        };

        my_chart.setOption(option);
        $(window).on('resize', function () {
            my_chart.resize();
        });
    }


});

