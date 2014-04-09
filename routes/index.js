
/*
 * BE_music_Kan_Zhang
 * 
 * to handle 
 * GET /recommendations
 * POST /listen 
 * POST /follow
 */
 
var fs = require('fs');
var musicModel = require('mongoose').model('Music');
var userModel = require('mongoose').model('User');
var async = require('async');
 

// Score values: Level1 = user listened musics, Level2 = followee listened musics
var scoreLevel1 = 10;
var scoreLevel2 = 5;

var printToConsole = true;


/* 
 * Recommendations command (.../recommendations)
 * 
 * Takes a GET command, with the query being
 * {user:<user ID>}
 * and returns a list of music in the form
 * {list:[<music 1 ID>,<music 2 ID>,<music 3 ID>,<music 4 ID>,<music 5 ID>]}
 */
exports.recommend = function(db){
	return function(req, res){
		// Setup header
		res.setHeader("Content-Type", "application/json");
		
		var user = req.query.user;
		// Check if user key exists, if not, return
		if (!user){
			// Was considering returning 5 random songs here
			return false;
		}
		
		if (printToConsole)
			console.log(user);
		// If user exists, initialize variables
		var rankings = {};
		var recommendedMusics = [];
		var randomCounter = 0;
		var currentUser;
		
		// Find the user with the given id
		userModel.findOne({_id:user}, function (err, item){
			if (err || !item){
				console.log ("No such user");
				console.log (recommendedMusics);
				ReturnList(err);
			} else {
				currentUser = item;
				if (printToConsole)
					console.log("\nUser Info: \n" + item);
					
				// Generates the ranking object
				async.series([
				// Generates ranking based on music the user has listened to
				function(callback){
					item.musicIListenedTo(function (err, myMusics){
						if (printToConsole)
							console.log("\nUsers Musics: \n" + myMusics);
							
						rankings = GenerateRankings(myMusics, rankings, scoreLevel1);
						
						callback(err);
					});
				},
				// Generates ranking based on music the users followees has listened to
				function(callback){
					item.musicMyFolloweesListenTo(function (err, followeeMusics){
						if (printToConsole)
							console.log("\nUsers Followees Musics: \n" + followeeMusics);
							
						rankings = GenerateRankings(followeeMusics, rankings, scoreLevel2);
						
						callback(err);
					});
				}
				], 
				// Called after above two are finished
				// Finds the music that matches the given tags and then runs RankMusics with those musics
				function(err){
					var queryGenres =[];
					for (var tag in rankings){
						queryGenres.push(tag);
					}
					musicModel.find({tags:{$in:queryGenres}}, RankMusics);
				});
			}
		});	
	
		
		// Ranks all music (items) based on previously calculated rankings of its "tags" or "genres" and inserts them into a sorted list
		function RankMusics(err, items){
			if(!err){
				//console.log(items);
				
				// Give score value to each music
				for (var i = 0; i<items.length; i++){
					var currentMusic = {_id:items[i]._id,score:0};
					for (var j = 0; j< items[i].tags.length; j++){
						if (rankings[items[i].tags[j]]){
							currentMusic.score +=  rankings[items[i].tags[j]];
						}
					}
					
					// Insert into a sorted array,
					recommendedMusics = InsertIntoSorted(recommendedMusics,currentMusic, currentUser.listened);
					//recommendedMusics.push(currentMusic);
				}

				// If there are enough songs, simply return list in proper format
				ReturnList(err);
				
			}
		}
		
		function ReturnList(err){
			console.log (recommendedMusics);
			if(!err){
				
				if (recommendedMusics.length==5 || randomCounter>10){
					// Return the list if it is big enough or if there has been too many randoms
					if (printToConsole){
						console.log ("\nRecommended Musics: \n");
						console.log (recommendedMusics);
					}
				
					var musicList = [];
					for (var i = 0; i<recommendedMusics.length; i++){
						musicList.push(recommendedMusics[i]._id);
					}
					if (printToConsole)
						console.log (musicList);
					res.statusCode=200;
					// Return
					res.end(JSON.stringify({list:musicList}));
				} else if (recommendedMusics.length<5){
					// If after the algorithm, not enough songs have been added to the list, randomly add songs
					console.log ("Searching for a random song");
					musicModel.count(function(err, count){
						console.log("count " + count);
						musicModel.findOne().limit(5).skip( Math.random() * (count)).exec(function(err, item){
							// Match formatting of other musics, and add to list
							
							var currentMusic = {_id:item._id,score:0};
							if (recommendedMusics.length<5)
								recommendedMusics = InsertIntoSorted(recommendedMusics,currentMusic, []);
							
							randomCounter++;
							// Call self to see if list is large enough to be returned yet
							ReturnList(err);
						});
					});
					
				}
			}
		}
	};
};

/* 
 * Generate Rankings
 * Helper Function
 */
 function GenerateRankings(items, rankings, score){
	if (printToConsole)
		console.log(items);
	// Assign rank/score to the items, users scoreLevel1 since it is the songs user has listened to
		if (items){
		for (var i = 0; i<items.length; i++){
			for (var j = 0; j<items[i].tags.length; j++){
				if (rankings[items[i].tags[j]]){
					rankings[items[i].tags[j]] = rankings[items[i].tags[j]] + score;
				} else {
					rankings[items[i].tags[j]] = score;
				}
			}
		}
	}
	return rankings;
}

/*
 * Insert into a sorted array songs
 *  Helper function, only keeps 5 items with the highest score, sorted
 *  Returns true if item is inserted and false otherwise
 */
function InsertIntoSorted(recommendedMusics, currentMusic, excludedMusics){
	var recommendedMusicList = [];
	for (var i = 0; i<recommendedMusics.length; i++){
		recommendedMusicList.push(recommendedMusics[i]._id);
	}
	if (ListContains(excludedMusics, currentMusic._id) || ListContains(recommendedMusicList, currentMusic._id)){
		// If user has heard song already, do not add to recommendations
		return recommendedMusics;
	} else if (recommendedMusics.length===0){
		// Add if list is empty and user has not listened to music before 
		recommendedMusics.push(currentMusic);
	} else {
		var index = -1;
		// Could consider changing this to a while loop, to decrease total number of iterations
		for (var i = 0; i<recommendedMusics.length;i++){
			if (currentMusic.score>recommendedMusics[i].score && index < 0){
				index = i;
			}
		}
		// Inserts into a sorted list based on score
		if (index === 0){
			// If new music has largest score, insert into front
			recommendedMusics.unshift(currentMusic);
		} else if (index>0){
			// Otherwise, splice into correct position
			recommendedMusics.splice((index), 0, currentMusic);
		} else if (recommendedMusics.length<5){
			// If element was not bigger than any already in array, push onto end if array length < 5
			recommendedMusics.push(currentMusic);
		} else {
			return recommendedMusics;
		}
	}
	// If array has been inserted into, it may be larger than the needed 5. Pop off unecessary element
	if (recommendedMusics.length>5){
		recommendedMusics.pop();
	}
	return recommendedMusics;
}

/*
 * Check if list contains obj
 *  Helper Function
 *  Returns true if item is found, false otherwise
 */
function ListContains(list, obj){
	for (var i = 0; i < list.length; i++) {
		if (list[i] === obj) {
			return true;
		}
	}
	return false;
}



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
