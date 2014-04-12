var assert = require('assert');
var express = require('express');
var request = require('request');
var async = require('async');
var path = require('path');
var fs = require('fs');

// Will launch the server in preperation for the tests
var app = require('./app.js');
var baseURI = 'http://localhost:3000/';
// user field for the recommendations query, will be used as follows /recommendations?user=<userToQuery>
var userToQuery = 'a';

// Base options object for requests
var options = { method: 'POST'
  , uri: baseURI
  , headers: { 'Content-Type': 'application/json' , 'Accept': 'application/json' }
  , json: {}
};

/**
 * SendRequest
 * Helper Function/Iterator for async.each
 * 
 */
function SendRequest(item, callback){
	// Attach JSON
	options.json=item;
	
	request(options, function(err, res, body){
		HandleResponse(err, res, body);
		callback(err);
	});
	
}

/**
 * HandleResponse
 * Helper Function for requests
 * 
 */
function HandleResponse(err, res, body){
	if (!err){
		console.log(res.statusCode);
		console.log(body);
	} else {
		console.log("NO RESPONSE");
	}
}

describe('Fictional MVP', function() {
  describe('#Reset', function() {
    it('Resets the database in preperation for the rest of the code', function(done){
		// Setup Options JSON for the requests to be sent
		
		app.resetdb(function(err){
			done();
		});
	});
	
  });
  describe('#Listen', function() {
    it('Executes the listen command with the provided JSON', function(done){
		// Setup Options JSON for the requests to be sent
		options.uri = baseURI+'listen';
		options.method = 'POST';
		options.headers={'Content-Type': 'application/json'};
		
		// Read data from jsonFile
		var listenJSON;
		var fileContent = fs.readFileSync('./test/listen.json');
		try{
			listenJSON = JSON.parse(fileContent);
		} catch (e){
			console.log("Could not parse JSON");
			done();
		}
		
		// Build array of requests to be sent to server, and store in array
		var listenRequests =[];
		for (var key in listenJSON.userIds){
			for (var i = 0; i<listenJSON.userIds[key].length; i++){
				listenRequests.push({user:key, music:listenJSON.userIds[key][i]});

			}
		}
		// Execute requests, calling done when all requests are finished
		async.each(listenRequests, SendRequest, done);
		
	});
	
  });
  
  describe('#Follow', function() {
    it('Executes the follow command with the provided JSON', function(done){
		// Setup Options JSON for the requests to be sent
		options.uri = baseURI+'follow';
		options.method = 'POST';
		options.headers={'Content-Type': 'application/json'};
		
		// Read data from jsonFile
		var followsJSON;
		var fileContent = fs.readFileSync('./test/follows.json');
		try{
			followsJSON = JSON.parse(fileContent);
		} catch (e){
			console.log("Could not parse JSON");
			done();
		}
		
		// Build array of requests to be sent to server, and store in array
		var followsRequests =[];
		for (var i = 0; i<followsJSON.operations.length; i++){
			followsRequests.push({from:followsJSON.operations[i][0], to:followsJSON.operations[i][1]});
		}
		// Execute requests, calling done when all requests are finished
		async.each(followsRequests, SendRequest, done);
	});
  });
  
  describe('#Recommendations', function() {
    it('Executes the follow command with the provided JSON', function(done){
		// Setup Options JSON for the requests to be sent
		options.uri = baseURI+'recommendations?user='+userToQuery;
		options.method = 'GET';
		options.headers={'Content-Type': 'application/json'};
		
		// Execute request
		SendRequest(null, function(err){done()});
	});
  });
});