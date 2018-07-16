// nohup node 22.js >>22.log 2>&1 &

var fs = require('fs');
var tool = require('../lib/tool');
var json = JSON.parse(fs.readFileSync('22.json', 'utf8'));
var net = require('net');
var i = 0,max = tool._.size(json);

function connect(){
    if(i==max){
        console.log('i=max,connect end');
        return false;
    }

    var client=net.connect({port:8021},function () {

        function send(){
            if(client.destroyed){
            	console.log('client.destroyed');
            	client.end();
                return;
            }
            console.log(new Date(),i,max);
            if(i==max){
                console.log('send end');
                client.end();
                return;
            }
            var buf=new Buffer(json[i],'hex');
            var rt=client.write(buf);
            console.log(json[i]);
            
            i++;
            setTimeout(send,200);
        }
        send();

    });

    client.on('error',function(err){
        console.error('client err',err);
    });
    client.on('close',function(){
    	console.log('client.close');
        setTimeout(connect,1000);
    });

}
connect();






