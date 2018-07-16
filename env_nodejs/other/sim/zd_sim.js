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
 55 44 0d 80 00
 56 41 19 40 1b
 57 41 19 40 1b
 01 40 54 6f 32
 02 00 65
 d3 15


 */
var framenum = 0;

var client = net.connect({port: 8021}, function () {

    send();

});


function send() {


    if (framenum == 255) {
        framenum = -1;
    }

    framenum++;

    var databuf = new Buffer(21);
    databuf[0] = 0xc1;
    databuf.writeUInt32BE(tool.time(), 1);
    databuf[5] = 0x03;
    var i = 6;
    databuf[i] = 0x55;//加速度
    databuf.writeFloatBE(floatRand(0.6, 0.7), i + 1);
    i += 5;
    databuf[i] = 0x56;//速度
    databuf.writeFloatBE(floatRand(64, 65), i + 1);
    i += 5;
    databuf[i] = 0x57;//位移
    databuf.writeFloatBE(floatRand(3, 3.2), i + 1);

    var buf = packDataToBuf({databuf: databuf, framenum: framenum, receiveid: '01700000001'});

    console.log(tool.hexToString(buf));

    client.write(buf);

    setTimeout(send, 200);

}

function floatRand(Min, Max) {

    var Range = Max - Min;
    var Rand = Math.random();
    var rval = Min;// + Math.round(Rand * Range) + Math.random();
    rval = rval + (Math.random() * 21 - 10) / 20;
    rval = rval.toFixed(2);
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