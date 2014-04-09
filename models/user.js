
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
		return this.model('User').find({_id: {$in:this.following}}, callback);
	}
	
	userSchema.methods.musicIListenedTo = function(callback){
		
		return Music.find({_id: {$in:this.listened}}, callback);
	}
	
	userSchema.methods.musicMyFolloweesListenTo = function(callback){
		this.model('User').find({_id: {$in:this.following}}, function(err, items){
			if (!err){
				var followeeListenedMusic = {};
				for (var i = 0; i< items.length; i++){
					for (var j = 0; j< items[i].listened.length; j++){
						followeeListenedMusic[items[i].listened[j]]=true;
					}
				}
				var musics = [];
				for (var key in followeeListenedMusic){
					musics.push(key);
				}
				return Music.find({_id: {$in:musics}}, callback);
			} else {
				callback(err);
			}
		});
	}
	
	return mongoose.model('User', userSchema);
	
 };

module.exports = new User();