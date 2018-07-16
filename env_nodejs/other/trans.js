var tool = require('../lib/tool');
var mongodb = require('../lib/mongodb');

//400015000010130 400015000010113

function start() {
    console.log('start');
    mongodb.open(function (db) {

        var senddown = db.collection('data.senddown');
        senddown.remove({instruct: 'c1', createtime: {$lt: tool.time() - 60 * 60}}, function (err, records) {
            if (err)throw err;
            console.log('remove data.senddown', records);
        });

        var trans = db.collection('data.trans');
        trans.find({}).toArray(function (err, docs) {
            if (err)throw err;

            docs.forEach(function (row) {
                if (!row) {
                    return;
                }
                if (!row['oldid'] || !row['newid']) {
                    return;
                }
                var time = row['time'] || 0;
                var num = row['num'] || 0;
                var query = {instruct: 'c1', equip_id: row.oldid, receivetime: {$gt: time} };
                var opt = {sort: {receivetime: -1}};
                db.collection('data.sensor').findOne(query, opt, function (err, doc) {
                    if (err)throw err;
                    if (!doc) {
                        return;
                    }
                    var json = {
                        instruct: 'c1',
                        sensorno: row.newid.substring(8),
                        status: 1,
                        createtime: tool.time(),
                        oldid: row.oldid,
                        newid: row.newid
                    };

                    json.param = doc['socketstr'].substring(24, doc.socketstr.length - 4);
                    console.log('senddown', json);
                    senddown.insert(json, function (err) {
                        if (err)throw err;
                    });
                    num++;
                    var $set = {
                        num: num,
                        oldsocketstr: doc.socketstr,
                        sentdate: tool.datetime(),
                        time: tool.time(),
                        prevtime: time
                    };
                    trans.update({_id: row._id}, {$set: $set}, function (err) {
                        if (err)throw err;
                    });

                });
            });


        });

    });

    setTimeout(start, 10000);
}

start();