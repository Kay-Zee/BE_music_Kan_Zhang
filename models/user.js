
/*
 * User Model
 */
var mongoose = require('mongoose');
var db = mongoose.connection;
var Music = require('mongoose').model('Music');

 var User = function(){
	var userSchema = mongoose.Schema({
		_id : String,
		listened : {type : Array, "default" : [] },
		following : {type : Array, "default" : [] }
		
	});
	
	userSchema.methods.usersIFollow = function(callback){
		return this.model('user').find({_id: {$in:this.following}}, callback);
	}
	
	userSchema.methods.musicIListenedTo = function(){
		return Music.find({_id: {$in:this.listened}}, callback);
	}
	
	return mongoose.model('User', userSchema);
	
 };

module.exports = new User();