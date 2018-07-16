var net = require('net');
var tool = require('../../lib/tool');

/*55 aa 
54 
31 
10 
00 00 00 00 
01 04 93 fa 
c1 
56 90 9a 3e 
0b 
24 44 0d 80 00 
25 41 19 40 1b 
37 44 70 95 09 
36 42 b4 34 1e 
35 00 00 00 00 
20 42 8d d8 70 
21 41 1a 27 7d 
38 41 3b d8 e7 
26 3d b4 2b af 
2c 3d aa b4 6c 
2d 00 00 00 00 
01 40 54 6f 32 
02 00 65 
d3 15


*/
var framenum = 0;
setInterval(send, 15 * 60 * 1000);
send();

function send() {


    if (framenum == 255) {
        framenum = -1;
    }

    framenum++;
    var n = 2;//参数个数

    var databuf = new Buffer(6 + n * 5 + 5 + 3);
    databuf[0] = 0xc1;
    databuf.writeUInt32BE(tool.time(), 1);
    databuf[5] = n+2;
    var i = 6;
    //databuf[i] = 0x3d;//二氧化硫
    //databuf.writeFloatBE(intRand(0, 100), i + 1);
    // i+=5;
    // databuf[i]=0x25;//光照
    // databuf.writeFloatBE(floatRand(9578.15,10845.36)/1000,i+1);//?*1000
    // i+=5;
    // databuf[i]=0x37;//气压?27
    // databuf.writeFloatBE(floatRand(962.33,980.58),i+1);
    // i+=5;
    databuf[i]=0x44;//风向
     databuf.writeFloatBE(floatRand(80.10,90.05),i+1);
     i+=5;
     databuf[i]=0x43;//风速
    databuf.writeFloatBE(floatRand(0,0.7),i+1);
    // i+=5;
    // databuf[i]=0x20;//湿度
    // databuf.writeFloatBE(floatRand(75.92,80.91),i+1);
    // i+=5;
    // databuf[i]=0x21;//温度
    // databuf.writeFloatBE(floatRand(8.63,9.5),i+1);
    // i+=5;
    // databuf[i]=0x38;//紫外
    // databuf.writeFloatBE(floatRand(11.74,12.35),i+1);
    // i+=5;
    // databuf[i]=0x26;//PM2.5
    // databuf.writeFloatBE(floatRand(80.97,85.37)/1000,i+1);
    // i+=5;
    // databuf[i]=0x2c;//PM1.0
    // databuf.writeFloatBE(floatRand(79.35,81.44)/1000,i+1);
    // i+=5;
    // databuf[i]=0x2d;//雨量
    // databuf.writeFloatBE(floatRand(0,5),i+1);
    i += 5;
    databuf[i] = 0x01;//设备工作电压
    databuf.writeFloatBE(floatRand(3.30, 3.35), i + 1);
    i += 5;
    databuf[i] = 0x02;//无线接收信号强度
    databuf.writeInt16BE(intRand(101, 108), i + 1);


    var buf = packDataToBuf({databuf: databuf, framenum: framenum, receiveid: '01400000001'});

    console.log(tool.hexToString(buf));

    var client = net.connect({port: 8021}, function () {

        client.write(buf);
        client.end();

    });
    // client.on('data', function (data) {
    //     console.log(data.toString());
    //     //client.end();
    // });
    // client.on('end', function () {
    //     console.log('disconnected from server');
    // });

}

function floatRand(Min, Max) {

    var Range = Max - Min;
    var Rand = Math.random();
    var rval = Min + Math.round(Rand * Range) + Math.random();
    rval = rval.toFixed(2);
    console.log(rval);
    return rval;

}

function intRand(Min, Max) {

    var Range = Max - Min;
    var Rand = Math.random();
    var rval = Min + Math.round(Rand * Range);
    console.log(rval);
    return rval;
}


function packDataToBuf(data) {//{databuf,framenum,receiveid}

    if (!data['receiveid']) {
        return false;
    }

    var databuf = new Buffer(data.databuf);
    var size = databuf.length + 15;
    var buf = new Buffer(size);
    buf[0] = 0x55;
    buf[1] = 0xaa;
    buf[2] = size;//帧长
    buf[3] = data.framenum;//帧序
    buf[4] = 0x10;//版本

    var pre = parseInt(data.receiveid.slice(0, 3));
    var jid = parseInt(data.receiveid.slice(3));

    var jidhex = tool.toHex(pre, 2) + tool.toHex(jid, 6);


    buf.write(jidhex, 9, 4, 'hex');//接收端
    buf.write('00000000', 5, 4, 'hex');//发出端

    databuf.copy(buf, 13);

    var crcbuf = tool.crc16(buf, size - 2);
    buf.write(crcbuf, buf.length - 2, 2, 'hex');
    return buf;
}