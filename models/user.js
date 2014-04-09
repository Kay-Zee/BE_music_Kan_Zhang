
/*
 * User Model
 */

 var User = function(){
	var user ={};
	var _follow = function(){};
	var _listen = function(){};
	var _setId = function(_user, callback){
		if (_user._id){
			user._id = _user._id; 
		}
		if (_user.listened){
			user.listened = _user.listened; 
		}
		callback(null);
	};
	var _getId = function(){

		return user._id;
	};
	
	return {
		setId : _setId,
		getId : _getId
	}
	
 }();

module.exports = User;