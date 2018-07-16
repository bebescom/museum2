var tool = require('../lib/tool');
var mongodb = require('../lib/mongodb');

mongodb.open(function(db){
	var j=0;
		
	function updateSensor(coll,no){
		
		var sensor=db.collection(coll);
		
		sensor.find({'sensorno':no,'receivetime':{$gte:1442626561-3600*24*10}}).toArray(function(err,docs){
			if(err)throw err;
			
			docs.forEach(function(row,i){
				var humidity=50.5-(i%10?0.5:0.2)*Math.random();
				
				humidity=humidity.toFixed(2);
				sensor.update({_id:row._id},{$set:{'param.humidity':humidity}});
				console.log(++j);
			});
		
		});
	}
	
	updateSensor('data.sensor.2015','00100200011');
	//updateSensor('data.sensor','00200000008');
	//updateSensor('data.sensor.2015','00100200003');
	//updateSensor('data.sensor','00100200003');


});