
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var fs = require('fs');


// Mongo DB
var MongoClient = require('mongodb').MongoClient;


var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);


//Connect to the db
var db;
MongoClient.connect("mongodb://localhost:27017/BE_music_db", function(err, database) {
	  if(!err) {
	    console.log("We are connected");
	    db = database;
	    db.dropCollection('musics');
	    var collection = db.collection('musics');
	    // Read Music collection from json file on server start up
	    var content = fs.readFileSync('./data/musics.json');
	    var musics = JSON.parse(content);
	    // Insert all music into database with the ID as _id and the tag array as tags
	    for (var key in musics) {
	    	var doc = {'_id':key, 'tags':musics[key]};
	    	collection.insert(doc, {w:1}, function(err, result) {});
	    }
	    console.log(musics);

	    console.log("musics.json read into db");
	    //db.close();
	    http.createServer(app).listen(app.get('port'), function(){
	    	  console.log('Express server listening on port ' + app.get('port'));
	    	});
	    
	 // Added functionality for client
	    app.get('/recommendations', routes.recommend(db));
	    app.post('/follow', routes.follow(db));
	    app.post('/listen', routes.listen(db));
	  } else {
		console.log("Error connecting to mongoDB");
	  }
	});

