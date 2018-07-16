<template id="header_down">
    <div class="equip_down" >

        <Dropdown trigger="custom" :visible="show_list_key">
            <Badge :count="downLoadingLen">
                <img src="/common/images/loading_img.png" alt="下载loading" @click.stop="show_list">
            </Badge>
            <!--<i class="loadingNumber" v-text="downLoadingLen"></i>-->
            <Dropdown-menu slot="list" style="width: 350px;">
                <li class="loading_div" v-for="(index,item) in downLoadList">
                    <div class="singleDown" :classno="item.noClass">
                        <i :class="item.down_status"></i>
                        <Poptip trigger="hover" :content="item.file_name">
                            <span v-text="item.file_name"></span>
                        </Poptip>
                        <Icon v-show="item.url" type="ios-download-outline" @click.stop="down_file(item.url)"
                              class="download_file" data-title="下载文件" size="24"></Icon>
                        <i class="reloading" @click.stop="re_down(item.msg_id)"
                           v-show="item.down_status === 'singleDown_reloading'"></i>
                        <i class="singleDown_clear" @click.stop="del_down(item.msg_id)"></i>
                    </div>
                </li>

            </Dropdown-menu>
        </Dropdown>

        <Progress :percent="45" :stroke-width="5" status="active" v-show="downLoadingLen" hide-info></Progress>

    </div>

</template>
<script type="text/javascript">
    Vue.component('header-down', {
        template: '#header_down',
        data: function () {
            return {
                show_loading_key: true,//是否显示下载
                show_list_key: false,//是否显示下拉列表
                downLoadList: {},//设备下载传输数据
            }
        },
        computed: {
            downLoadListLength: function () {
                return _.size(this.downLoadList);
            },
            downLoadingLen: function () {
                var _len = 0;
                for (var i in this.downLoadList) {
                    if (this.downLoadList[i].down_status === 'singleDown_status_change') {
                        ++_len;
                    }
                }
                return _len;
            }
        },
        ready: function () {
            var _this = this;
            _this.downLoadList = my_store('downloadEquipData') || {};
            if (_this.downLoadListLength) {
                _this.show_loading_key = true;
            }
            //下载完成后的通知
            window.socket.on("downEquipDataEnd", function (json) {
                console.log(json);
                setTimeout(function () {
                    if (_this.downLoadList[json.msg_id]) {
                        window.socket.emit("downEquipDataAck", json);//确认收到消息
                        _this.end_down(json);//下载完成
                    }
                }, 0);
            });

            window.new_down = _this.new_down;//新建下载队列

        },
        methods: {
            show_list: function () {
                // console.log(this.downLoadingLen)
                // if(!this.downLoadingLen){//当下载数据为0时，不执行下载
                //     return
                // }
                this.show_list_key = !this.show_list_key;
            },
            re_down: function (msg_id) {//重新下载
                var _this = this;
                if (!msg_id || !_this.downLoadList[msg_id]) {
                    return;
                }
                setTimeout(function () {
                    _this.new_down(_this.downLoadList[msg_id]);
                }, 0);
            },
            del_down: function (item_id) {//删除某个下载任务
                console.log('del_down', item_id);
                var _this = this;
                var _list = my_store('downloadEquipData') || {};
                delete _list[item_id];
                _this.downLoadList = _list;
                my_store('downloadEquipData', _this.downLoadList);

                if (_this.downLoadListLength === 0) {
                    _this.show_loading_key = false;
                    _this.show_list_key = false;
                }
            },
            down_file: function (url) {//下载文件
                if (url) {
                    window.location.href = (API('') + url.slice(1));
                }
            },
            new_down: function (msg) {//新建下载任务
                var _this = this;
                msg.msg_id = msg.msg_id || 'down_' + new Date().getTime() + '_' + Math.random();
                msg.down_status = 'singleDown_status_change';
                msg.access_token = window.web_config.token;
                var _list = my_store('downloadEquipData') || {};
                _list[msg.msg_id] = msg;
                _this.downLoadList = _list;
                my_store('downloadEquipData', _this.downLoadList);
                _this.show_loading_key = true;
                window.socket.emit('downEquipData', msg);

            },
            end_down: function (json) {//下载队列完成
                var _this = this;
                if (!json.result) {
                    _this.$Message.error('下载失败');
                }
                var _list = my_store('downloadEquipData') || {};
                _list[json.msg_id].down_status = json.result ? 'singleDown_status' : 'singleDown_reloading';
                if (json.url) {
                    _list[json.msg_id].url = json.url;
                }
                _this.downLoadList = _list;
                my_store('downloadEquipData', _list);
                setTimeout(function () {
                    _this.show_list_key = true;
                    if (json.result && json.url) {
                        var url = json.url.slice(1);
                        var a = window.open(API('') + url);
                        console.log(a);
                    }
                }, 200);
            }
        },
        events: {
            hideOverlay: function () {
                if (this.show_loading_key) {
                    this.show_loading_key = false;
                }
            }
        }
    });
</script>
