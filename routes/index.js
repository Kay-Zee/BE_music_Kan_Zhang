
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
				var genres=[];
				for (var tag in rankings){
					genres.push	({count:rankings[tag],genre:tag});
				}
				genres.sort(function(a,b){
					return b.count - a.count;
				});
				console.log(rankings);
				console.log(genres);
			});
			
			var followeeMusic = listenColl.find({_id: {$in:userFollowing.following}}).toArray(function(err,items){
				
				console.log(items);
			});
			
		};
		function GetGenreRankings(err, items){
			
			
		};
		function RankMusics(err, item){

			
		};

		
		res.render('recommendations', { title: 'Recommendations', content:""});
		
		
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