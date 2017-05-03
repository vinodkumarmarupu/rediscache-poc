var express = require('express'); //requiring express library
var app = express();
var redisClient = require('redis').createClient;
var redis = redisClient(6379, 'localhost');
var mongoose=require('mongoose');
var db=require('./schema/employeeSchema.js');
var bodyparser=require('body-parser');
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));


redis.on("error", function (err) {
    console.log("Error " + err);
});


//MongoDB Connection
mongoose.connect('mongodb://localhost:27017/EmployeeDB',function(err){
	if(err){
		console.log("DB Error"+err);
	}else{
    	console.log("connected");
	}
});

// DB CONNECTION EVENTS
// When successfully connected
mongoose.connection.on('connected', function () {  
  console.log('Mongoose connection opened ');
}); 

// If the connection throws an error
mongoose.connection.on('error',function (err) {  
  console.log('Mongoose connection got error: ' + err);
}); 

// When the connection is disconnected
mongoose.connection.on('disconnected', function () {  
  console.log('Mongoose disconnected got disconnected'); 
});

//Create Profile
var createProfile=function(empData,callback){
db.create(empData,function(err,data){
		if(err){
			/* console.log(err);
			var regerr={
				"error":"error"
			} */
			callback(err);
		}else{
			console.log(JSON.stringify(data));
			callback(data);
		}
	});
};





/*Register an employee*/
app.post('employee/registration',function(req,res){
	
	
	var empData=req.body;
	console.log(JSON.stringify(req.body));
	createProfile(empData,function(createData){
		res.json(createData);
	})
});


/*getEmployeeById function to get apprisal list */

var getEmployeeById=function(fname,callback){
	db.find({fname:fname},function(err,data){
		if(err){
			  var errjson={
				"error":"Check your connection"
			       }
			   console.log("err"+err);
			   callback(errjson);
		}else {
			if(data==""){
				var datajson1={
					"success":"noting was found"
				}
				callback(datajson1);
			}else{
				console.log("data"+JSON.stringify(data))
			callback(data);
			}
			
		}
	});
};
/** Employee Cache Function For Quick data
 * params funcion name
 * */
var getEmployeeByIdCached=function(redis,fname,callback){

	redis.get(fname, function (err, reply) {
        if (err){
			callback(null);
		}
        else if (reply){ //Book exists in cache
		console.log("data cache"+JSON.parse(reply));
        callback(JSON.parse(reply));
		}
        else {
            //Book doesn't exist in cache - we need to query the main database
           db.find({fname:fname},function(err,data){
		if(err){
			  var errjson={
				"error":"Check your connection"
			       }
			   console.log("err"+err);
			   callback(errjson);
		}else {
			if(data==""){
				var datajson1={
					"success":"noting was found"
				}
				callback(datajson1);
			}else{
				redis.setex(fname,3000 JSON.stringify(data), function() {
                        callback(data);
                    });
			}
			
		}
	});
    }
    });
	
};




//get employee Based on Id
app.get('/getEmpBasedOnId/:fname',function(req,res){
	
	/* var apprisalId={
			"_id":req.query.id
	} */
	console.log("fname"+req.param("fname"));
	 if (!req.param("fname")) res.status(400).send("Please send a proper title");
        else {
            getEmployeeByIdCached(redis,req.param("fname"), function (data) {
                res.status(200).send(data);
            });
        }
})


var getEmpList=function(redis,emplist,callback){
	
	redis.expire('emplist',30);
	redis.get(emplist, function (err, reply) {
        if (err){
			callback(null);
		}
        else if (reply){ //Book exists in cache
		console.log("emp data"+JSON.parse(reply));
        callback(JSON.parse(reply));
		}
        else {
            //Book doesn't exist in cache - we need to query the main database
          db.find({},function(err,data){
		if(err){
			var errjson={
				"error":"Check your connection"
			}
			callback(errjson);
		}else{
			redis.set(emplist, JSON.stringify(data),function() {
                        callback(data);
                    });
		}
	});
    }
    });
	
	
	
	
}




/*Employee List of fields*/
app.get('/getEmployees/:emplist',function(req,res){
	
	console.log("fname"+req.param("emplist"));
	 if (!req.param("emplist")) res.status(400).send("Please send a proper title");
        else {
			getEmpList(redis,req.param("emplist"),function(data){
				res.send(data);
				
			})	
		}

});



/* var updateEmployeeByFname = function(redis, fname, callback) {
	db.findAndUpdate({fname:fname}, function (err, doc) { //Update the main database
		if(err)
			callback(err);
		else if (!doc)
			callback('Missing book');
		else {
			//Save new book version to cache
			redis.set(title, JSON.stringify(doc), function(err) {
				if(err)
					callback(err);
				else
					callback(null);
			});
		}
	});
};





app.put('/getEmpBasedOnId/:fname', function(req,res) {
		if(!req.param("fname"))
			res.status(400).send("Please send the book title");
		else if (!req.param("fname"))
			res.status(400).send("Please send the new text");
		else {
			updateEmployeeByFname(redis, req.param("title"),  function(err) {
				if(err == "Missing book")
					res.status(404).send("Book not found");
				else if(err)
					res.status(500).send("Server error");
				else
					res.status(200).send("Updated");
			});
		}
	});
 */
 
 


 app.listen(8000, function () {
        console.log('Listening on port 8000');
 });



