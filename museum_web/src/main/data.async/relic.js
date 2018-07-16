define('data.async/relic', function (require, exports) {

    exports.init = function () {

        $('#data_relic .box').append('<table class="relic_table"><thead><tr>' +
            '<td width="33%">名称</td>' +
            '<td width="33%">数量</td>' +
            '<td width="33%">环境达标率</td>' +
            '</tr></thead>' +
            '<tbody id="relic_data"></tbody>' +
            '</table>');

        $.get(API('/env/environments/overviews/relics_status'), function (data) {
            $('#data_relic').css('background','#F5F2DE').find('.box').css('opacity','1');
            if (data=='[]') {
                $('#data_relic .box').html('暂无数据').css({'text-center':'center','line-height':175});
                return;
            }
            _.each(data, function (row, name) {
                row.rate=(row.rate=='-')?'无数据':row.rate+'%';
                console.log(row.rate)
                $('#relic_data').append('<tr><td>' + name + '</td><td>' + row.quantity + '</td><td>' + row.rate + '</td></tr>');
            });

        }, 'json');

    };

});