
/*
 * GET home page.
 */

var followingCollectionName = 'following';
var listenCollectionName = 'listen';
var musicCollectionName = 'musics';
var scoreLevel1 = 10;
var scoreLevel2 = 5;

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

exports.recommend = function(db){
	return function(req, res){
		var user = req.query.user;
		var rankings = {};
		var recommendedMusics = [];
		console.log(user);
		var followColl = db.collection(followingCollectionName);
		var musicColl = db.collection(musicCollectionName);
		var listenColl = db.collection(listenCollectionName);
		var userFollowing;
		followColl.findOne({_id:user}, GetFollowees);
		function GetFollowees(err, item){
			console.log(item);
			userFollowing = item;
			var userMusic;
			listenColl.findOne({_id:user}, GetMusics);
			
		};
		function GetMusics(err, item){
			userMusic = item;
			console.log(userMusic);
			var userListened = musicColl.find({_id: {$in:userMusic.listened}}).toArray(function(err,items){
				console.log(items);
				for (var i = 0; i<items.length; i++){
					for (var j = 0; j<items[i].tags.length; j++){
						if (rankings[items[i].tags[j]]){
							rankings[items[i].tags[j]] = rankings[items[i].tags[j]] + scoreLevel1;
						} else {
							rankings[items[i].tags[j]] = scoreLevel1;
						}
					}
				}
				//var genres=[];
				var queryGenres =[];
				for (var tag in rankings){
					//genres.push	({count:rankings[tag],genre:tag});
					queryGenres.push(tag);
				}
				/*
				genres.sort(function(a,b){
					return b.count - a.count;
				});
				*/
				
				console.log(queryGenres);
				console.log(rankings);
				//console.log(genres);
				
				musicColl.find({tags:{$in:queryGenres}}).toArray(RankMusics);
			});
			
			var followeeMusic = listenColl.find({_id: {$in:userFollowing.following}}).toArray(function(err,items){
				
				//console.log(items);
			});
			
		};
		function GetGenreRankings(err, items){
			
			
		};
		function RankMusics(err, items){
			if(!err){
				//console.log(items);
				
				for (var i = 0; i<items.length; i++){
					var currentMusic = {_id:items[i]._id,score:0};
					for (var j = 0; j< items[i].tags.length; j++){
						if (rankings[items[i].tags[j]]){
							currentMusic.score +=  rankings[items[i].tags[j]];
						}
						
					}
					
					InsertIntoSorted(recommendedMusics,currentMusic);
					//recommendedMusics.push(currentMusic);
				}
			}
			
			console.log (recommendedMusics);
			res.render('recommendations', { title: 'Recommendations', content:""});
			
		};
		function InsertIntoSorted(recommendedMusics, currentMusic){
			if (false){
				
			} else if (recommendedMusics.length==0){
				recommendedMusics.push(currentMusic);
			} else {
				var index = -1;
				for (var i = 0; i<recommendedMusics.length;i++){
					if (currentMusic.score>recommendedMusics[i].score && index < 0){
						index = i;
					}
				}
				// Inserts into a sorted list based on score
				if (index == 0){
					// If new music has largest score, insert into front
					recommendedMusics.unshift(currentMusic);
				} else if (index>0){
					// Otherwise, splice into correct position
					recommendedMusics.splice((index), 0, currentMusic);
				} else if (recommendedMusics.length<5){
					// If element was not bigger than any already in array, push onto end if array length < 5
					recommendedMusics.push(currentMusic);
				}
			}
			// If array has been inserted into, it may be larger than the needed 5. Pop off unecessary element
			if (recommendedMusics.length>5){
				recommendedMusics.pop();
			}
		};
		
		

		
		//res.render('recommendations', { title: 'Recommendations', content:""});
		
		
	};
};



// Follow command, currently displays the body of post, named content
exports.follow = function(db){
	return function(req, res){
		res.render('post', { title: 'Follow', content: req.body.content});
		var follow = JSON.parse(req.body.content);
		var followColl = db.collection(followingCollectionName);
		// Add follow relationship to the "following" collection such that _id is the user and following is who that user is following
		// 	add only if it does not already exist
		for (var i=0; i<follow.operations.length; i++){
			console.log (follow.operations[i]);
			followColl.update({_id:follow.operations[i][0]}, {$addToSet:{following:follow.operations[i][1]}},  {upsert:true}, function(err, result) {});

		}
	};
};

//Listen command, currently displays the body of post, named content
exports.listen = function(db){
	return function(req, res){
		res.render('post', { title: 'Listen', content: req.body.content });
		var listen = JSON.parse(req.body.content);
		var listenColl = db.collection(listenCollectionName);
		// Add follow relationship to the "following" collection such that _id is the user and following is who that user is following
		// 	add only if it does not already exist
		for (var key in listen.userIds){
			listenColl.update({_id:key}, {$addToSet:{listened:{$each:listen.userIds[key]}}},  {upsert:true}, function(err, result) {});

		}
	};
};