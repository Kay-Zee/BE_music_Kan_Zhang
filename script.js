var assert = require('assert');
var express = require('express');
var request = require('request');
var async = require('async');
var http = require('http');
var path = require('path');
var fs = require('fs');

var app = express();
var baseURI = 'http://localhost:3000/';
var options = { method: 'POST'
  , uri: 'http://localhost:3000/'
  , headers: { 'Content-Type': 'application/json' , 'Accept': 'application/json' }
  , json: { "content":"content" }
};

/*
 * SendRequest
 * Helper Function/Iterator for async.each
 * 
 */
function SendRequest(item, callback){
	options.json=item;
	request(options, function(err, res, body){
		if (!err){
			console.log(res.statusCode);
			console.log(body);
		} else {
			console.log("NO RESPONSE");
		}
		callback(err);
	});
	
}

describe('Fictional MVP', function() {
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
			var body = {from:followsJSON.operations[i][0], to:followsJSON.operations[i][1]};
		}
		// Execute requests, calling done when all requests are finished
		async.each(followsRequests, SendRequest, done);
	});
  });
  
  describe('#Recommendations', function() {
    it('Executes the follow command with the provided JSON', function(done){
		// Setup Options JSON for the requests to be sent
		options.uri = baseURI+'recommendations?user=a';
		options.method = 'GET';
		options.headers={'Content-Type': 'application/json'};
		
		// Execute request
		SendRequest(null, function(err){done()});
	});
  });
});