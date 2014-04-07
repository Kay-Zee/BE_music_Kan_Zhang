
/*
 * BE_music_Kan_Zhang
 * 
 * to handle 
 * GET /recommendations
 * POST /listen 
 * POST /follow
 */

// Name of collections
var followingCollectionName = 'following';
var listenCollectionName = 'listen';
var musicCollectionName = 'musics';

// Score values: Level1 = user listened musics, Level2 = followee listened musics
var scoreLevel1 = 10;
var scoreLevel2 = 5;

var printToConsole = true;

exports.index = function(req, res){
  res.end(JSON.stringify({
  title : "Title"}));
};


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
		
		var followColl = db.collection(followingCollectionName);
		var musicColl = db.collection(musicCollectionName);
		var listenColl = db.collection(listenCollectionName);
		
		var userFollowing;
		var userMusic;
		
		// Get all users that the current user is following
		followColl.findOne({_id:user}, function (err, item){
			if (printToConsole)
				console.log(item);
			
			userFollowing = item;
			
			listenColl.findOne({_id:user}, GetMusics);
			
		});
		
		// Gets all musics that user has listened to, and then gives a score to the tags of those songs
		function GetMusics(err, item){
			userMusic = item;
			if (printToConsole)
				console.log(userMusic);
			// Check that there is no error, and that the user actually exists
			if (!err && item){
				// Retrieving all songs user has listened to
				var userListened = musicColl.find({_id: {$in:userMusic.listened}}).toArray(function(err,items){
					if (printToConsole)
						console.log(items);
					// Assign rank/score to the items, users scoreLevel1 since it is the songs user has listened to
					for (var i = 0; i<items.length; i++){
						for (var j = 0; j<items[i].tags.length; j++){
							if (rankings[items[i].tags[j]]){
								rankings[items[i].tags[j]] = rankings[items[i].tags[j]] + scoreLevel1;
							} else {
								rankings[items[i].tags[j]] = scoreLevel1;
							}
						}
					}
					// Continue assigning rank/score by calling the Genre ranking generation function
					GetGenreRankings(err);
				});
			} else {
				// Was considering returning 5 random songs here

				return false;
			}

			
		}
		// Gives rankings to the tags based on who the user is following, and then finds all songs corrosponding to those tags
		function GetGenreRankings(err){
			// Check if the user is following anyone
			if (userFollowing){
				var followeeMusic = listenColl.find({_id: {$in:userFollowing.following}}).toArray(function(err,items){
					// Generate set of music that users followees have listened to
					var followeeListenedMusic = {};
					for (var i = 0; i< items.length; i++){
						for (var j = 0; j< items[i].listened.length; j++){
							followeeListenedMusic[items[i].listened[i]]=true;
						}
					}
					var musics = [];
					for (var key in followeeListenedMusic){
						musics.push(key);
					}
					if (printToConsole)
						console.log(items);
					// Modify rankings based on the music the users followees have listened to
					// Note that duplicate music does not increase score given. i.e. if both a and b lisened to m1, the genres in m1 only gets counted once
					// To count songs more than once, another layer of loop has to be added to traverse each followee's songs
					musicColl.find({_id: {$in:musics}}).toArray(function(err,items){
						if (printToConsole)
							console.log(items);
						for (var i = 0; i<items.length; i++){
							for (var j = 0; j<items[i].tags.length; j++){
								if (rankings[items[i].tags[j]]){
									rankings[items[i].tags[j]] = rankings[items[i].tags[j]] + scoreLevel2;
								} else {
									rankings[items[i].tags[j]] = scoreLevel2;
								}
							}
						}
						
						// Find all songs with relevant genres, and then pass them to RankMusics
						var queryGenres =[];
						for (var tag in rankings){
							queryGenres.push(tag);
						}
						
						musicColl.find({tags:{$in:queryGenres}}).toArray(RankMusics);
					});
					
				});
			} else {
				// If the user has no followees, rank music without looking up followees 
				var queryGenres =[];
				for (var tag in rankings){
					queryGenres.push(tag);
				}
				
				musicColl.find({tags:{$in:queryGenres}}).toArray(RankMusics);
			}
			
		}
		
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
					InsertIntoSorted(recommendedMusics,currentMusic);
					//recommendedMusics.push(currentMusic);
				}
				// If after the algorithm, not enough songs have been added to the list, randomly add songs
				if (recommendedMusics.length<5){
					
					musicColl.count(function(err, count){
						
						var randMusics = musicColl.find().limit( 5 - recommendedMusics.length ).skip( Math.random() * (count-(5 - recommendedMusics.length)) ).toArray(function(err, items){
							// Match formatting of other musics, and add to list
							for (var i = 0; i<items.length; i++){
								var currentMusic = {_id:items[i]._id,score:0};
								recommendedMusics.push(currentMusic);
							}
							if (printToConsole){
								console.log ("Recommened Musics:");
								console.log (recommendedMusics);
							}
							var musicList = [];
							for (var i = 0; i<recommendedMusics.length; i++){
								musicList.push(recommendedMusics[i]._id);
							}
							if (printToConsole)
								console.log (musicList);
							res.statusCode=200;
							res.setHeader("Content-Type", "application/json");
							res.end(JSON.stringify({list:musicList}));
						});
					});
					
				} else {
					// If there are enough songs, simply return list in proper format
					if (printToConsole){
						console.log ("Recommened Musics:");
						console.log (recommendedMusics);
					}
					var musicList = [];
					for (var i = 0; i<recommendedMusics.length; i++){
						musicList.push(recommendedMusics[i]._id);
					}
					if (printToConsole)
						console.log (musicList);
					res.statusCode=200;
					res.setHeader("Content-Type", "application/json");
					res.end(JSON.stringify({list:musicList}));
				}
			}
		}
		
		/*
		 * Insert into a sorted array songs
		 *  Helper function, only keeps 5 items with the highest score, sorted
		 *  Returns true if item is inserted and false otherwise
		 */
		function InsertIntoSorted(recommendedMusics, currentMusic){
			if (ListContains(userMusic.listened, currentMusic._id)){
				// If user has heard song already, do not add to recommendations
				return false;
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
					return false;
				}
			}
			// If array has been inserted into, it may be larger than the needed 5. Pop off unecessary element
			if (recommendedMusics.length>5){
				recommendedMusics.pop();
			}
			return true;
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
		
		
		
	};
};



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
			var followColl = db.collection(followingCollectionName);
			// Add follow relationship to the "following" collection such that _id is the user and following is who that user is following
			
			if (follow.from && follow.to){
				followColl.update({_id:follow.from}, {$addToSet:{following:follow.to}},  {upsert:true}, function(err, result) {
					if (err){
						console.log(err);
					}
				});
			}
			res.statusCode=200;
		} catch(e){
			follow = {error:true};
			res.statusCode=500;
			console.log(e);
		}
		// Finish creating response
		res.end('Recieved follow command with JSON:' + JSON.stringify(follow)+'\n');
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
		
		res.header('Access-Control-Allow-Origin', '*');
		res.setHeader("Content-Type", "application/json");
		
		if (printToConsole)
			console.log(req.body);
		// Try to parse and store
		var listen;
		// Try catch block for when I had to parse the request body, but should now be done by express
		try{
			listen = req.body; //JSON.parse(req.body);
			var listenColl = db.collection(listenCollectionName);
			// Add follow relationship to the "following" collection such that _id is the user and following is who that user is following
			//  add only if it does not already exist
			if (listen.user && listen.music){
				listenColl.update({_id:listen.user}, {$addToSet:{listened:listen.music}},  {upsert:true}, function(err, result) {
					if (err){
						console.log(err);
					}
				});
			}
			res.statusCode=200;
		} catch (e){
			listen = {error:true};
			console.log(e);
			res.statusCode=500;
		}
		// Finish creating response
		res.end('Recieved listen command with JSON:' + JSON.stringify(listen)+'\n');
	};
};