
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

exports.recommend = function(db){
	return function(req, res){
		res.render('index', { title: 'Recommendations' });
	};
};

// Follow command, currently displays the body of post, named content
exports.follow = function(db){
	return function(req, res){
		res.render('post', { title: 'Follow', content: req.body.content});
		var follow = JSON.parse(req.body.content);
		var collection = db.collection('following');
		// Add follow relationship to the "following" collection such that _id is the user and following is who that user is following
		// 	add only if it does not already exist
		for (var i=0; i<follow.operations.length; i++){
			console.log (follow.operations[i]);
		    collection.update({_id:follow['operations'][i][0]}, {$addToSet:{following:[follow['operations'][i][1]]}},  {upsert:true}, function(err, result) {});

		}
	};
};

//Listen command, currently displays the body of post, named content
exports.listen = function(db){
	return function(req, res){
		res.render('post', { title: 'Listen', content: req.body.content });
	};
};