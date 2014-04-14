
/*
 * BE_music_Kan_Zhang
 * 
 * to handle 
 * GET /recommendations
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
		
		// Retrieve id of user being queried about
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
				console.log ("No such user, will return 5 random songs");
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
				// Give score value to each music
				for (var i = 0; i<items.length; i++){
					var currentMusic = {_id:items[i]._id,score:0};
					for (var j = 0; j< items[i].tags.length; j++){
						if (rankings[items[i].tags[j]]){
							currentMusic.score +=  rankings[items[i].tags[j]];
						}
					}
					
					recommendedMusics = InsertIntoSorted(recommendedMusics,currentMusic, currentUser.listened);
				}
			} else {
				console.log ("Could not get related music, returning 5 random songs");
			}
			ReturnList(err);
		}
		
		function ReturnList(err){
			if(!err){
				if (recommendedMusics.length==5 || randomCounter>10){
					// Return the list if it is big enough or if there has been too many randoms
					if (printToConsole){
						console.log ("\nRecommended Musics: \n");
						console.log (recommendedMusics);
					}
					// Put into correct format, intended format:
					// {"list": ["<music ID>", "<music ID>", "<music ID>", "<music ID>", "<music ID>"]}
					var musicList = [];
					for (var i = 0; i<recommendedMusics.length; i++){
						musicList.push(recommendedMusics[i]._id);
					}
					if (printToConsole)
						console.log (musicList);
					// Return the response
					res.statusCode=200;
					res.send({list:musicList});
				} else if (recommendedMusics.length<5){
					// If after the algorithm, not enough songs have been added to the list, randomly add songs
					console.log ("Searching for a random song");
					musicModel.count(function(err, count){
						musicModel.findOne().skip( Math.random() * (count)).exec(function(err, item){
							// Random counter to prevent infinite loop
							randomCounter++;
							console.log("\nRandom roll #"+randomCounter);
							
							// Match formatting of other musics, and add to list
							var currentMusic = {_id:item._id,score:0};
							if (recommendedMusics.length<5)
								recommendedMusics = InsertIntoSorted(recommendedMusics,currentMusic, currentUser ? currentUser.listened : []);
							
							
							// Call self to see if list is large enough to be returned yet
							ReturnList(err);
						});
					});
					
				}
			} else {
				console.log (err);
				// Return the response
				res.statusCode=500;
				res.send({list:musicList});
			}
		}
	};
};

/**
 * Generate Rankings
 * Helper Function
 *
 * @param {JSON[]} items - List of songs that will have an effect on the rankings of the tags
 * @param {JSON[]} rankings - Rankings of the tags
 * @param {Number} score - The amount of score the ranking of the tag goes up by
 * @returns {JSON[]} the new rankings list
 */
 function GenerateRankings(items, rankings, score){

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
	if (printToConsole){
		console.log("\nRankings: \n");
		console.log(rankings);
	}	
	
	return rankings;
}

/**
 * Insert into a sorted array songs
 *  Helper function, only keeps 5 items with the highest score, sorted
 *
 * @param {JSON[]} recommendedMusics - List that music will be inserted into
 * @param {JSON} currentMusic - Music to be inserted
 * @param {JSON[]} excludedMusics  - List of music that should not be inserted
 * @returns true if item is inserted and false otherwise
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

/**
 * Check if list contains obj
 *  Helper Function
 *  Returns true if item is found, false otherwise
 *
 * @param {array} list - List that object will be checked against
 * @param obj - object that will be checked to see if it is part of the list
 * @returns {Boolean} True if item is in the list, false otherwise
 */
function ListContains(list, obj){
	for (var i = 0; i < list.length; i++) {
		if (list[i] === obj) {
			return true;
		}
	}
	return false;
}
