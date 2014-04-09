
/*
 * Music Model
 */
var mongoose = require('mongoose');
var db = mongoose.connection;

 var Music = function(){
	var musicSchema = mongoose.Schema({
		_id : String,
		tags : {type : Array, "default" : [] },
	});
	
	return mongoose.model('Music', musicSchema);
	
 };

module.exports = new Music();