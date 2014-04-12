
/*
 * BE_music_Kan_Zhang
 * 
 * to handle 
 * POST /listen 
 * POST /follow
 */
 
var fs = require('fs');
var musicModel = require('mongoose').model('Music');
var userModel = require('mongoose').model('User');
 

var printToConsole = true;


/* 
 * Follow command (.../follow)
 * 
 * Takes a POST command, with the body being
 * {from:<user 1 ID>, to:<user 2 ID>}
 * to be interprted as user 1 is now following user 2
 * and stores into the database (does not duplicate if music id already in database)
 */
exports.follow = function(db){
	return function(req, res){
		// Define response
		res.setHeader("Content-Type", "application/json");
		if (printToConsole)
			console.log(req.body);
		// Try to parse and store
		var follow;
		// Try catch block for when I had to parse the request body, but should now be done by express
		try{
			follow = req.body;//JSON.parse(req.body.content);
			// Add follow relationship to the "following" collection such that _id is the user and following is who that user is following
			
			if (follow.from && follow.to){
				userModel.update({_id:follow.from}, {$addToSet:{following:follow.to}},  {upsert:true}, function(err, result) {
					if (err){
						console.log(err);
					}
				});
			}
			res.statusCode=200;
		} catch(e){
			follow = {"error":true};
			res.statusCode=500;
			console.log(e);
		}
		// Finish creating response
		// Since there was no specified response for this command, I simply echoed the input json
		res.end(JSON.stringify(follow));
	};
};

/*
 * Listen command (.../listen)
 *
 * Takes a POST command, with the body being
 * {user:<user ID>, music:<music ID>}
 * and stores into the database (does not duplicate if music id already in database)
 */
exports.listen = function(db){
	return function(req, res){
		
		res.setHeader("Content-Type", "application/json");
		
		if (printToConsole)
			console.log(req.body);
		// Try to parse and store
		var listen;
		// Try catch block for when I had to parse the request body, but should now be done by express
		try{
			listen = req.body; //JSON.parse(req.body);
			// Add follow relationship to the "following" collection such that _id is the user and following is who that user is following
			//  add only if it does not already exist
			if (listen.user && listen.music){
				userModel.update({_id:listen.user}, {$addToSet:{listened:listen.music}},  {upsert:true}, function(err, result) {
					if (err){
						console.log(err);
					}
				});
			}
			res.statusCode=200;
		} catch (e){
			listen = {"error":true};
			console.log(e);
			res.statusCode=500;
		}
		// Finish creating response
		// Since there was no specified response for this command, I simply echoed the input json
		res.end(JSON.stringify(listen));
	};
};
