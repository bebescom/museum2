// @require css/Integrated_management.css
var router = new VueRouter();

module.exports = {
    template: '#integratedTemplate',
    data: function () {
        return {
            $Integrated: null,		//dom
            $left: null,				//dom
            $right: null,			//dom
            $leftDrag: null,			//dom
            $rightDrag: null,		//dom
            $viewBox: null,				//dom
            areaTitle: '综合管理',
            timeout: '',
            timeout1: '',
            allData: {},
            attention: null,
            other: null,
            partData: null,
            partName: '',
            searchValue: '',
            key: true,
            //设备概况
            Equipment_status: {},
            //文物概况
            Cultural_relics_survey: {},
            //温湿度极值
            Temperature_and_humidity_extremum: {
                temperature: {
                    max: {
                        val: '',
                        env_name: '',
                        mark: ''
                    },
                    min: {
                        val: '',
                        env_name: '',
                        mark: ''
                    },
                    name: '温度',
                    unit: '℃'
                },
                humidity: {
                    max: {
                        val: '',
                        env_name: '',
                        mark: ''
                    },
                    min: {
                        val: '',
                        env_name: '',
                        mark: ''
                    },
                    name: '湿度',
                    unit: '%'
                }
            },
            //天气
            weather: {
                aqi: {},
                pm10: {},
                pm25: {},
                temperature: {},
                humidity: {}
            },
            hideWeather: {
                wind: {
                    wind_direction: {},
                    wind_speed: {}
                },
                light: '',
                uv: '',
                rain: '',
                co2: '',
                air_presure: ''
            },
            //天气状况
            weatherType: [],
            //反馈
            feed: true,
            textareaVal: '',
            timeNum: '',
            imgUrl: '',
            isOptimal: false,
            isGood: false,
            isMild: false,
            isModerate: false,
            isSevere: false,
            isSerious: false,
            isHavent: false,
            //modal_export:false,//数据导出integrated
            all_envs_data: {},
            detailTimes: '',//系统具体时间
            from: '',
            configLanguage: window.languages,
            env_no:''
        }
    },
    created: function () {
        if (!checkPermissions({name: '综合管理'})) {
            setTimeout(function () {
                $('.shadow.wholeShadow').hide();
            }, 0);
            return;
        }
        var This = this;
        //this.attention = false;
        $.get(API('/env/general/envs/env_overview'), function (data) {
            $('.shadow.wholeShadow').hide();
            if (data && data.error) {
                This.$Message.error(data.error);
                return;
            }
            if (data === '[]' || !_.size(data)) {
                return;
            }
            This.attention = [];
            This.$viewBox.css('background', 'none');
            for (var i in data) {
                if (i == 'follow' || i == 'other') {
                    continue;
                }
                Vue.set(This.allData, i, data[i]);
            }
            data.follow && (This.attention = data.follow.rows);
            data.other && (This.other = data.other.rows);
            This.all_envs_data = data;
            // console.log(data)
            //手动控制获取设备概况请求最后发出
            $.get(API('/env/general/data/equip_count'), function (data) {
                if (data && data.error) {
                    This.$Message.error(data.error);
                    return;
                }
                This.Equipment_status = data;
                var totalData = This.Equipment_status.sensor + This.Equipment_status.network,	//每10分钟增加的数据总数
                    miao = 5,			//5秒一跳
                    shangxian = 100,	//上限减50
                    qujian = 5;		//求值区间
                var nowNum = Math.floor((totalData - shangxian) / 900 * miao);

                function change() {
                    data.data_total += Math.floor(nowNum + (Math.random() * qujian));
                    This.timeNum = setTimeout(function () {
                        change();
                    }, miao * 1000);
                }

                change();
            });
        });

        $.get(API('/env/general/data/relic_count'), function (data) {
            if (data && data.error) {
                This.$Message.error(data.error);
                return;
            }
            This.Cultural_relics_survey = data;
        });

        $.get(API('/env/general/data/th_pole'), function (data) {
            if (data && data.error) {
                This.$Message.error(data.error);
                return;
            }
            //昨日温湿度极值判断
            if (data.temperature && data.temperature.length != 0) {
                This.Temperature_and_humidity_extremum.temperature = data.temperature;
            }
            if (data.humidity && data.humidity.length != 0) {
                This.Temperature_and_humidity_extremum.humidity = data.humidity;
            }
        });
        $.get(API('/env/environments/overviews/weather/weathers'), function (data) {
                if (data && data.error) {
                    This.$Message.error(data.error);
                    return;
                }
                This.weather = data;
                var hideWeather = This.hideWeather;
                _.each(hideWeather, function (row, key) {
                    if (key == 'wind') {
                        hideWeather.wind = {
                            wind_direction: data.wind_direction,
                            wind_speed: data.wind_speed
                        };
                    } else if (data[key]) {
                        hideWeather[key] = _.extend(web_config.param_unit_name.weather[key], data[key]);
                        if (key === 'rain' && hideWeather[key.val]) {
                            hideWeather[key].val = parseFloat(data[key].val).toFixed(2);
                        }
                    }

                });

                if (data.condition) {
                    This.weatherType.push(data.condition.val);
                }
                if (This.weather && This.weather.aqi && This.weather.aqi.level) {
                    if (This.weather.aqi.level == '优') {
                        This.isOptimal = true;
                    } else if (This.weather.aqi.level == '良') {
                        This.isGood = true;
                    } else if (This.weather.aqi.level == '轻度污染') {
                        This.isMild = true;
                    } else if (This.weather.aqi.level == '中度污染') {
                        This.isModerate = true;
                    } else if (This.weather.aqi.level == '重度污染') {
                        This.isSevere = true;
                    } else if (This.weather.aqi.level == '严重污染') {
                        This.isSerious = true;
                    }
                } else {
                    This.isHavent = true;
                    This.weather.aqi.level = '暂无';
                }
                This.from = data.from;
                This.detailTimes = data.update_time.split(" ")[1] + ' 更新' + data.from;
            }
        )        ;

//sessionStorage.removeItem('relicBackName');
//sessionStorage.removeItem('relicBackNo');
//sessionStorage.removeItem('relicBackType');
//$.get(API('/base/envs/navigation/'), function (data){
//})
    },
    ready: function () {
        this.$Integrated = $('#Integrated');
        this.$left = $('#Integrated_left');
        this.$right = $('#Integrated_right');
        this.$leftDrag = this.$left.find('.drag');
        this.$rightDrag = this.$right.find('.drag');
        this.$viewBox = $('.viewBox').eq(0);
        var height = $(window).height() - 133;
        this.$Integrated.css('height', height);
        $('#content').find('.viewBox').eq(0).css('height', height);
        $('#content').find('.viewBox').eq(1).css('height', height - 17);
        var relicName = sessionStorage.getItem('relicBackName');
        var relicNo = sessionStorage.getItem('relicBackNo');
        var relicType = sessionStorage.getItem('relicBackType');
        if (relicNo && relicName && relicType) {
            this.setName(relicName, relicNo, relicType);
        }
    },
    computed: {
        title: function () {
            return this.searchValue && '搜索结果' || this.partName || this.areaTitle;
        }
        ,
        concatArr: function () {
            var arr = [],
                allData = this.allData,
                other = this.other,
                envs=this.allData.envs;
            for (var i in envs) {
                var rows = envs[i].rows;
                for (var j in rows) {
                    var floor = rows[j];
                    arr.push(floor);
                }
            }
            if (other) {
                for (var env in other) {
                    arr.push(other[env]);
                }
            }
            return arr;
        }
        ,
        data_total: function () {
            var data_total = this.Equipment_status.data_total + '';
            if (data_total == 'undefined') {
                return '';
            }
            return data_total;
        }
        ,
        pm10_width: function () {
            return this.weather.pm10.val * 1 / 5 + '%';
        }
        ,
        pm25_width: function () {
            return this.weather.pm25.val * 1 / 5 + '%';
        }
    }
    ,
    methods: {
        equalClass: function (mark) {
            if (mark < 0) {
                return 'active';
            }
            if (mark == 0) {
                return 'noChange';
            }
            if (mark > 0) {
                return '';
            }
        }
        ,
        scroll: function (type) {
            var key = '';
            if (type != 'right') {
                var $drag = this.$leftDrag.eq(0),
                    $viewBox = this.$left.find('.viewBox'),
                    $scrollBox = $viewBox.find('.scrollBox'),
                    key = 'left';
            } else {
                var $drag = this.$rightDrag.eq(0),
                    $viewBox = this.$right.find('.viewBox'),
                    $scrollBox = $viewBox.find('.scrollBox'),
                    key = 'right';
            }
            scrollDrag($drag, $viewBox, $scrollBox, key);
        }
        ,
        setName: function (name, no, type) {
            this.partData = '';
            $('.shadow.wholeShadow').hide();
            this.$viewBox.css('background', '');
            this.partName = ' < ' + name;
            if (!sessionStorage.getItem('relicBackName')) {
                sessionStorage.setItem('relicBackName', name);
                sessionStorage.setItem('relicBackNo', no);
                sessionStorage.setItem('relicBackType', type);
            }
            this.Data_on(no, type);
        }
        ,
        comeBack: function () {
            this.partName = '';
            this.$viewBox.css('background', 'none');
            sessionStorage.removeItem('relicBackName');
            sessionStorage.removeItem('relicBackNo');
            sessionStorage.removeItem('relicBackType');
        }
        ,
        //dragDown:function(){
        //	$('.comprehensive').slideToggle(300);
        //	$('.extension').find('p').toggleClass('active');
        //},
        Data_on: function (no, type) {
            console.log(no)
            var This = this;
            $.get(API('/env/general/envs/all_envs_detail/') + no, function (data) {
                if (data && data.error) {
                    This.$Message.error(data.error);
                    return;
                }
                if (data.length === 0) {
                    return;
                }
                //console.log(type+'11111');
                This.$viewBox.css('background', 'none');
                if (isEmptyObj(data[no]) || !data[no].children) {
                    return;
                }
                This.partData = data[no].children;
                This.env_no=data[no].env_no;
                console.log(no,This.partData)
            })

        }
        ,
        jumpPage: function () {
            if(window.web_config.small_weather=='1'){
                window.location = '../weather/small_weather.html';
            }else{
                window.location = '../weather/index.html';
            }
        }
        ,
        feedback: function () {
            this.feed = false;
            var $viewBox = this.$left.find('.viewBox');
            setTimeout(function () {
                if ($viewBox[1].scrollHeight) {
                    if ($viewBox[1].scrollTop != 0 || $viewBox[1].scrollTop < 169) {
                        var timer = setInterval(function () {
                            $viewBox[1].scrollTop += 9;
                            if ($viewBox[1].scrollTop >= $viewBox[1].scrollHeight - $viewBox[1].offsetHeight) {
                                $(".Feedback_information").focus();
                                clearInterval(timer);
                            }
                        }, 10);
                    }
                }
            }, 1);
        }
        ,
        feedSubmit: function () {
            var This = this;
            if (this.textareaVal == "") {
                //alert("留言框不能为空");
                this.$Message.error('留言框不能为空');
                return;
            }
            $.post(API('/base/users/feedback/feedback_add'), {'content': this.textareaVal}, function (data) {
                if (data && data.error) {
                    This.$Message.error(data.error);
                    return;
                }
                //alert(data.msg);
                This.$Message.info(data.msg);
                This.feed = true;
                This.textareaVal = '';

            })
        }
        ,
        feedCancel: function () {
            this.feed = true;
            this.textareaVal = '';
        }
        ,
        hrefFloor: function (name) {
            for (var key in this.partData) {
                if (this.partData[key].name == name) {
                    window.location.href = __uri("/floor?env_no=" + this.partData[key].env_no);
                }
            }
        }
        ,
        //export_Integrated:function(){
        //	this.modal_export = true;
        //},
        //ok:function(){
        //
        //},
        //cancel:function(){
        //
        //}
    }
    ,
    events: {
        attenChange: function (env) {
            var This = this;
            $.get(API('/env/general/envs/env_overview'), function (data) {
                // console.log(data)
                if (data && data.error) {
                    This.$Message.error(data.error);
                    return;
                }
                //This.all_envs_data = data;
                // console.log(This.all_envs_data, This.all_envs_data.follow.rows);
                // setTimeout(function(){
                //
                // },0);
                This.all_envs_data = data;
                // console.log(This.all_envs_data, This.all_envs_data.follow.rows);
                //This.attention = data.follow.rows;
                for (var i in data) {
                    if (i == 'follow' || i == 'other') {
                        continue;
                    }
                    Vue.set(This.allData, i, data[i]);
                }
                data.follow && (This.attention = data.follow.rows);
                data.other && (This.other = data.other.rows);
            });
            // This.Data_on(env,'');
        }
        ,
        'cancel-attention':

            function (env) {
                this.$broadcast('cancel-Attention', env);
            }
    }
    ,
    components: {
        'each-box':
            {
                template: '#eachBox',
                props:
                    ['region', 'partType', 'typekey'],
                methods:
                    {
                        temperature_humidity: function (type) {
                            return type ? ((type.min ) + '~' + (type.max ) + type.unit) : '';
                        }
                        ,
                        attention: function (env) {
                            var This = this;
                            $.post(API('/base/users/active/active_add'), {key: '关注', env_no: env}, function (data) {
                                // console.log(data)
                                if (data && data.error) {
                                    This.$Message.error(data.error);
                                    return;
                                }
                                if (data.msg !== '添加成功') {
                                    this.$Message.warning('添加失败');
                                    return;
                                }
                                This.region['关注'] = true;
                                console.log(This.region['关注']);
                                This.$dispatch('attenChange',env);
                            });
                        }
                        ,
                        cancelAttention: function (env) {
                            var This = this;
                            $.post(API('/base/users/active/follow_delete'), {env_no: env}, function (data) {
                                if (data && data.error) {
                                    This.$Message.error(data.error);
                                    return;
                                }
                                if (data.msg !== '已取消') {
                                    this.$Message.warning('取消失败');
                                    return;
                                }
                                if (This.partType.search(/关注/) > -1) {
                                    This.$el.parentNode.removeChild(This.$el);
                                }
                                if (This.typekey) {
                                    This.$dispatch('cancel-attention', env);
                                }
                                This.region['关注'] = false;
                                This.$dispatch('attenChange',env);
                            });
                        }
                        ,
                        browse: function (env) {
                            $.post(API('/base/users/active/active_add'), {key: '浏览', env_no: env}, function (data) {
                                if (data && data.error) {
                                    This.$Message.error(data.error);
                                    return;
                                }
                                window.location.href = __uri("/hall?env_no=" + env);
                            });
                            // this.$route.params.key=true;
                            // this.$route.params.env_no=env;
                            // this.$route.params.name=this.region.name;
                            // router.go('/environment/environment_details/');
                        }
                    }
                ,
                events: {
                    'cancel-Attention':

                        function (env) {
                            if (this.region.env_no != env) {
                                return;
                            }
                            this.region['关注'] = false;
                        }
                }
            }
    }
}
;

function scrollDrag($drag, $viewBox, $scrollBox, type) {
    var viewBox_height = $viewBox.height(),
        scrollBox_height = $scrollBox.height(),
        difference = scrollBox_height - viewBox_height;
    scrollTop = -$scrollBox.position().top,
        timeout = (type == 'right') ? 'timeout' : 'timeout1';

    var scale = scrollTop / difference;
    $drag.css({'opacity': 1});
    clearTimeout(this[timeout]);
    this[timeout] = setTimeout(function () {
        $drag.css({'opacity': 0});
    }, 500);
    if (scale >= 1) scale = 1;
    $drag.css("top", scale * (scrollBox_height - $drag.height()) + 'px');
}

function isEmptyObj(obj) {
    for (var i in obj) {
        return !1;
    }
    return !0;
}
