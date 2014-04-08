
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
var server;
/*
 * Resets the database
 */
function resetdb(callback){
	if(db){
		db.dropDatabase(function(err, database) {
			var collection = db.collection('musics');
			// Read Music collection from json file on server start up
			var content = fs.readFileSync('./test/musics.json');
			var musics = JSON.parse(content);
			// Insert all music into database with the ID as _id and the tag array as tags

			for (var key in musics) {
			   var doc = {'_id':key, 'tags':musics[key]};
			   collection.insert(doc, {w:1}, function(err, result) {
					if (err){
						console.log(err);
					}
				});
			}
			console.log(musics);

			console.log("musics.json read into db");
			callback(err);
		});
	} else {
		callback(null)
	}
};
exports.resetdb = resetdb;
MongoClient.connect("mongodb://localhost:27017/BE_music_db", function(err, database) {
	if(!err) {
		console.log("We are connected");
		db = database;
		resetdb(startup);
	} else {
	console.log("Error connecting to mongoDB");
	}
  
});

function startup (err) {
	server = http.createServer(app).listen(app.get('port'), function(){
	   console.log('Express server listening on port ' + app.get('port'));
	});
	
 // Added functionality for client
	app.get('/recommendations', routes.recommend(db));
	app.get('/reset', routes.reset(db));
	app.post('/follow', routes.follow(db));
	app.post('/listen', routes.listen(db));
	
	process.on('SIGINT', cleanup);
	process.on('SIGTERM', cleanup);
}

function cleanup () {
	server._connections=0;
    server.close(function () {
        console.log("Closed out remaining connections.");
        db.close();
        process.exit();
    });

    setTimeout( function () {
        console.error("Could not close connections in time, forcing shut down");
        process.exit(1);
    }, 30*1000);
}


