
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

exports.recommend = function(req, res){
  res.render('index', { title: 'Recommendations' });
};
	
exports.follow = function(req, res){
  res.render('index', { title: 'Follow' });
};
		
exports.listen = function(req, res){
  res.render('index', { title: 'Listen' });
};