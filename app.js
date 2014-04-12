
/**
 * Module dependencies.
 */
//Connect to the db
var mongoose = require('mongoose');
var db = require('./models/db');
var musicModel = require('mongoose').model('Music');
var userModel = require('mongoose').model('User');
 
var express = require('express');
var recommendations = require('./routes/recommendations');
var events = require('./routes/events');
var http = require('http');
var path = require('path');
var fs = require('fs');


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


var server;
/**
 * Resets the database
 */
function resetdb(callback){
	if(db){
		db.once('open',function(){
			db.db.dropDatabase(function(err) {
				var collection = db.collection('musics');
				// Read Music collection from json file on server start up
				var content = fs.readFileSync('./test/musics.json');
				var musics = JSON.parse(content);
				// Insert all music into database with the ID as _id and the tag array as tags

				for (var key in musics) {
					var doc = {'_id':key, 'tags':musics[key]};
					var newMusic = new musicModel(doc);
					newMusic.save(function(err){
						if (err)
							console.log("Could not save music : " + doc);
					});
				}
				console.log(musics);

				console.log("musics.json read into db");
				callback(err);
			});
		});
	} else {
	console.log("no db connection");
		callback(null)
	}
};
exports.resetdb = resetdb;

/*
// This resets the database when the server starts up, can be removed if we want previouse information be persist
resetdb(function(err){
	if (err){
		console.log("Could not reset the database on server startup");
	} else {
		console.log("Successfully reset the database on server startup");
	}
});
*/

// Add the three endpoints to the app
app.get('/recommendations', recommendations.recommend(db));
app.post('/follow', events.follow(db));
app.post('/listen', events.listen(db));

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

server = http.createServer(app).listen(app.get('port'), function(){
   console.log('Express server listening on port ' + app.get('port'));
});


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


