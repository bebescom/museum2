<!-- 添加设备 模板 -->
<template id="add_equip">
    <Modal
            :visible.sync="show_modal"
            title="添加设备"
            @on-ok="ok">
        <i-form :model="formItem" :label-width="100">
            <Form-item label="设备类型">
                <i-select :model.sync="addData.equip_type" @on-change="typeSelect">
                    <template v-for="(name,obj) in allEquip">
                        <i-option v-for="name in obj" :value="name"></i-option>
                    </template>
                </i-select>
            </Form-item>
            <Form-item label="设备ID">
                <i-input :value="addData.id" disabled></i-input>
            </Form-item>
            <Form-item label="设备名称">
                <i-input :value.sync="addData.name"></i-input>
            </Form-item>
            <Form-item label="安装位置">
                <Cascader :data="treeList" :value.sync="addData.env_no" change-on-select></Cascader>
            </Form-item>
            <Form-item label="数据发送间隔">
                <i-input style="width:100px;" :value.sync="addData.minute"></i-input>
                分
                <i-input style="width:100px;" :value.sync="addData.second"></i-input>
                秒
            </Form-item>
            <Form-item label="设备状态">
                <i-select :model.sync="addData.status">
                    <i-option value="备用"></i-option>
                    <i-option value="正常"></i-option>
                </i-select>
            </Form-item>
        </i-form>

        <div slot="footer">

            <i-button type="primary" size="large" @click.stop="add" :loading="dataKey">添加设备</i-button>
            <i-button type="info" size="large" @click.stop="continue_add" :loading="dataKey">继续添加设备</i-button>
            <i-button size="large" @click.stop="cancel">取消</i-button>
        </div>

    </Modal>

</template>

<script type="text/javascript">
    Vue.component('add-equip', {
        template: '#add_equip',
        data: function () {
            return {
                show_modal: false,//
                addData: {
                    equip_type: '温湿度监测终端',//设备类型(必填)
                    name: '',				//设备名
                    env_no: [],				//环境编号
                    id: '',				//设备序号(8位数字)
                    status: '备用',				//设备状态
                    minute: '',				//设备数据传输间隔--分钟
                    second: ''				//设备数据传输间隔--秒
                },
                dataKey: false,		//防止连续点击添加设备
                allEquip: {},			//所有的设备类型
                treeList: [],         //环境树
            }
        },

        methods: {
            init: function () {
                var _this = this;
                $.get('/2.2.05_P001/base_api/base/envs/tree/', function (data) {
                    _this.treeList = makeTree(data);

                    //生成环境树方法
                    function makeTree(data) {
                        var result = [];
                        _.each(data, function (item, index) {
                            var node = {
                                label: item.name,
                                children: [],
                                value: item.env_no
                            };
                            if (item.children && item.children.length !== 0) {
                                node.children = makeTree(item.children);
                            }
                            result.push(node);
                        });
                        return result;
                    }

                    $.get('/2.2.05_P001/base_api/env/common/all_equip_type', function (data) {
                        // console.log(data);
                        delete data['固定离线设备'];
                        _this.allEquip = data;
                        _this.show_modal = true;
                        _this.typeSelect();
                    });
                });
            },
            cancel: function () {
                this.show_modal = false;
            },
            add: function () {
                this.continue_add('true');
            },
            continue_add: function (key) {
                var _this = this;
                if (_this.dataKey) {
                    return;
                }
                _this.dataKey = true;
                console.log(_this.addData);
                var json = {};
                json.env_no = _.last(_this.addData.env_no) || '';
                json.equip_type = _this.addData.equip_type;
                json.id = _this.addData.id;
                json.name = _this.addData.name;
                json.minute = _this.addData.minute;
                json.second = _this.addData.second;
                json.status = _this.addData.status;
                if (!json.name) {
                    _this.$Message.error('请输入设备名称');
                    _this.dataKey = false;
                    return;
                }

                $.post('/2.2.05_P001/base_api/env/equipments/manage/equip_add', json, function (data) {
                    _this.dataKey = false;
                    if (data.error) {
                        _this.$Message.error(data.error);
                        return;
                    }

                    if (key === 'true') {
                        _this.cancel();
                    }
                    if (data.result) {
                        _this.addData = {
                            equip_type: '温湿度监测终端',//设备类型(必填)
                            name: '',				//设备名
                            env_no: [],				//环境编号
                            id: '',				//设备序号(8位数字)
                            status: '备用',				//设备状态
                            minute: '',				//设备数据传输间隔--分钟
                            second: ''				//设备数据传输间隔--秒
                        };
                        _this.$Message.success(data.msg);
                        _this.typeSelect();
                    }
                });
            },
            typeSelect: function () {//设备类型变化时改变addData.equip_type
                var _this = this;
                $.get('/2.2.05_P001/base_api/env/equipments/manage/code', {equip_type: _this.addData.equip_type}, function (data) {
                    _this.addData.id = (data.code || '') + (data.num || '');
                });
            }
        }
    });
</script>