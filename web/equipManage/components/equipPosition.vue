<template id="equipPosition">
    <div class="equipPosition" style="min-height: 500px;">
        <div class="nav-position">
            <span>设备位置：</span>
            <span v-show="equip.nav && equip.nav.length > 0"
                  v-for="(index,item) in equip.nav"
                  v-text="index > 0 ? ' > ' + item.name : item.name"></span>
            <span v-show="!equip.nav || equip.nav.length === 0" v-text="'暂无'"></span>
        </div>
        <div class="map_view" v-show="equip.map">
            <span id="now_equip" :class="['museum_icon',equip.equip_type]"
                  :style="{position: 'absolute','z-index':100,cursor:'move',margin:'-55px 0 0 -17px',left:locate.x?locate.x+'px':0,top:locate.y?locate.y+'px':0}"></span>
            <img id="env_map" :src="equip.map ? equip.map :''"
                 :style="{width: locate.width?locate.width + 'px':'auto'}"
            >
        </div>
    </div>
</template>
<script type="text/javascript">
    Vue.component('equip-position', {
        template: '#equipPosition',
        props: [],
        data: function () {
            return {
                equipPositionData: [],//
                equip: {},//
                locate: {},
                is_init: false,
            }
        },
        methods: {
            init: function (equip) {
                var _this = this;
                _this.equip = equip;
                var locate = {x: 17, y: 55, width: $('.info-right').width() - 50};
                if (equip.locate != '' && equip.locate) {
                    try {
                        locate = JSON.parse(equip.locate);
                        var xy = locate.area[0].split(',');
                        locate.x = xy[0];
                        locate.y = xy[1];
                    } catch (e) {
                    }
                }
                _this.locate = locate;
                console.log(_this);

                $('#now_equip').mousedown(function (e) {
                    var $this = $(this);
                    var old_x = e.clientX;
                    var old_y = e.clientY;
                    var pos = $(this).position();

                    function doc_mousemove(ev) {
                        var new_top = pos.top + ev.clientY - old_y;
                        var new_left = pos.left + ev.clientX - old_x;
                        $this.css({top: new_top + 'px', left: new_left + 'px'});
                        ev.stopPropagation();
                        return false;
                    }

                    $(document).bind('mousemove', doc_mousemove);

                    $(document).one('mouseup', function () {
                        _this.save_locate({
                            icon_width: $this.width(),
                            icon_height: $this.height(),
                            x: $this.position().left.toFixed(0),
                            y: $this.position().top.toFixed(0)
                        });
                        $(document).unbind('mousemove', doc_mousemove);
                    });
                    e.stopPropagation();
                    return false;
                });

            },
            save_locate: function (json) {
                var _this = this;
                var locate = JSON.stringify({
                    area: [json.x + "," + json.y],
                    width: $('#env_map').width(),
                    height: $('#env_map').height()
                });

                var param = {no: _this.equip.equip_no, locate: locate};
                console.log(locate);

                $.post('/2.2.05_P001/base_api/env/setting/save_locate', param, function (data) {
                    _this.$Message.info(data.msg);
                });


            }
        }
    });
</script>