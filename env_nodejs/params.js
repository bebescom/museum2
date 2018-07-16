exports.params = {

    0x01: {name: '设备工作电压', en: 'voltage', ty: 'float', decimal: 1},
    0x02: {name: '无线接收信号强度', en: 'rssi', ty: 'int16', decimal: 0},


    0x20: {name: '湿度', en: 'humidity', ty: 'float', decimal: 2},
    0x21: {name: '温度', en: 'temperature', ty: 'float', decimal: 2},
    0x23: {name: 'VOC', en: 'voc', ty: 'float.round', special: '>0', decimal: 0},
    0x24: {name: '二氧化碳', en: 'co2', ty: 'float', special: '>0', decimal: 0},
    0x25: {name: '光照', en: 'light', ty: 'float', special: '>0', decimal: 0},
    0x26: {name: '紫外', en: 'uv', ty: 'float', decimal: 2},
    0x27: {name: '有机污染物', en: 'organic', ty: 'float', decimal: 0},//ty:'int32',special:'1667'
    0x28: {name: '无机污染物', en: 'inorganic', ty: 'float', decimal: 0},
    0x29: {name: '硫化污染物', en: 'sulfur', ty: 'float', decimal: 0},

    // 0x2a: {name: '倾角', en: 'dip', ty: 'float', decimal: 2},
    // 0x2b: {name: '加速度', en: 'acceleration', ty: 'float', decimal: 2},
    0x30: {name: '参比', en: 'canbi', ty: 'float', decimal: 0},

    0x3a: {name: '甲醛', en: 'cascophen', ty: 'float', decimal: 2},
    0x3b: {name: '二氧化硫', en: 'so2', ty: 'float', decimal: 0},
    0x3c: {name: '氮氧化物', en: 'no', ty: 'float', decimal: 0},
    0x3d: {name: '臭氧', en: 'o3', ty: 'float', decimal: 0},

    0x40: {name: '移动报警', en: 'move_alert', ty: 'int8', decimal: 0},
    0x41: {name: '囊匣打开报警', en: 'box_open_alert', ty: 'int8', decimal: 0},
    0x42: {name: '囊匣状态值', en: 'box_status', ty: 'int8', decimal: 0},

    0x43: {name: '风速', en: 'wind_speed', ty: 'float', decimal: 1},
    0x44: {name: '风向', en: 'wind_direction', ty: 'float', decimal: 0},
    0x45: {name: '雨量', en: 'rain', ty: 'float', decimal: 2},
    0x46: {name: '气压', en: 'air_presure', ty: 'float', decimal: 0},
    0x47: {name: 'PM10', en: 'pm10', ty: 'float', decimal: 0},
    0x48: {name: 'PM2.5', en: 'pm25', ty: 'float', decimal: 0},

    0x49: {name: '土壤含水率', en: 'soil_humidity', ty: 'float', decimal: 1},
    0x50: {name: '土壤温度', en: 'soil_temperature', ty: 'float', decimal: 1},
    0x51: {name: '土壤电导率', en: 'soil_conductivity', ty: 'float', decimal: 1},
    //土壤含盐量 soil_salt

    0x52: {name: '氧气浓度', en: 'oxygen', ty: 'float', decimal: 1},
    0x53: {name: '压力', en: 'pressure', ty: 'float', decimal: 1},
    0x54: {name: '目标湿度', en: 'target_humidity', ty: 'float', decimal: 1},

    0x55: {name: '加速度', en: 'accel', ty: 'float', decimal: 1},
    0x56: {name: '速度', en: 'speed', ty: 'float', decimal: 1},
    0x57: {name: '位移', en: 'displacement', ty: 'float', decimal: 1},

    0x58: {name: '玻璃破碎检测', en: 'broken', ty: 'int8', decimal: 0},
    0x59: {name: '振动检测', en: 'vibration', ty: 'int8', decimal: 0},
    0x5a: {name: '多维驻波空间检测', en: 'multi_wave', ty: 'int8', decimal: 0},
    0x5b: {name: '灯光亮度', en: 'lighting', ty: 'float', decimal: 0},

    0x5c: {name: '经度', en: 'lng', ty: 'float', decimal: 6},
    0x5d: {name: '纬度', en: 'lat', ty: 'float', decimal: 6},
    0x5e: {name: '囊匣振动灵敏度', en: 'box_sensitivity', ty: 'int8', decimal: 0},

};

//气象站(无效)
exports.weather = {
    0x20: {name: '湿度', en: 'humidity'},
    0x21: {name: '温度', en: 'temperature'},
    0x23: {name: 'VOC', en: 'voc'},
    0x24: {name: '二氧化碳', en: 'co2'},
    0x25: {name: '光照', en: 'light'},
    0x26: {name: 'PM2.5', en: 'pm25'},
    0x37: {name: '气压', en: 'airpresure'},
    0x28: {name: '无机污染物', en: 'inorganic'},
    0x29: {name: '硫化污染物', en: 'sulfur'},
    0x2A: {name: '倾角', en: 'dip'},
    0x2B: {name: '加速度', en: 'acceleration'},
    0x2C: {name: 'PM1.0', en: 'PM10'},
    0x2D: {name: '雨量', en: 'rain'},
    0x30: {name: '参比', en: 'canbi'},
    0x35: {name: '风速', en: 'windspeed'},
    0x36: {name: '风向', en: 'winddirection'},
    0x38: {name: '紫外', en: 'uv'}
};