var mongoose=require('mongoose');

var employeeschema= new mongoose.Schema({
	
	_id:{
		type:String
	},
	fname:{
		type:String
	},
	lname:{
		type:String
	},
	password:{
		type:String
	},
	phonenumber:{
		type:String
	},
	designation:{
		type:String
	}
	
});
module.exports=mongoose.model("employeeProfileData",employeeschema);
