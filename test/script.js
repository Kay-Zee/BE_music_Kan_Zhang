var assert = require("assert");
var express = require("express");
var response = require("response");
var http = require('http');
var path = require('path');

var app = express();
var options = {
  host: 'localhost',
  path: '/listen',
  port: 3000,
  method: 'POST'
};

var listenJSON ={
  "description": "hold the lists that each user heard before",
  "userIds":{
    "a": ["m2","m6"],
    "b": ["m4","m9"],
    "c": ["m8","m7"],
    "d": ["m2","m6","m7"],
    "e": ["m11"]
  }
}

var followsJSON ={
  "description": "understand the list as [0] is following [1]",
  "operations": [
    ["a","b"],
    ["a","c"],
    ["b","c"],
    ["b","d"],
    ["b","e"],
    ["c","a"]
  ]
}


describe('Fictional MVP', function() {
  describe('#Listen', function() {
    it('Executes the listen command with the provided JSON', function(done){
		options.path = '/listen';
		options.method = 'POST';
		options.headers={"Content-Type": "application/json"};
		var counter = 0;
		var tracker = 0;
		for (var key in listenJSON.userIds){
			for (var i = 0; i<listenJSON.userIds[key].length; i++){
				counter++;
				var body = {user:key, music:listenJSON.userIds[key][i]};
				var req = http.request(options, function(res){
					if (res){
						console.log(res.statusCode);
						  res.on('data', function (chunk) {
							console.log('BODY: ' + chunk);
						  });
					} else {
						console.log("NO RESPONSE");
					}
					tracker++;
					if (tracker>=counter){
						done();
					}
				});
				req.write(JSON.stringify(body));
				req.end();
			}
		}
	});
	
  });
  
  describe('#Follow', function() {
    it('Executes the follow command with the provided JSON', function(done){
		options.path = '/follow';
		options.method = 'POST';
		options.headers={"Content-Type": "application/json"};
		var counter = 0;
		var tracker = 0;
		for (var i = 0; i<followsJSON.operations.length; i++){
			counter++;
			var body = {from:followsJSON.operations[i][0], to:followsJSON.operations[i][1]};
			var req = http.request(options, function(res){
				if (res){
					console.log(res.statusCode);
					  res.on('data', function (chunk) {
						console.log('BODY: ' + chunk);
					  });
				} else {
					console.log("NO RESPONSE");
				}
				tracker++;
				if (tracker>=counter){
					done();
				}
			});
			req.write(JSON.stringify(body));
			req.end();
			
		}
	});
  });
  
  describe('#Recommendations', function() {
    it('Executes the follow command with the provided JSON', function(done){
		options.path = '/recommendations?user=a';
		options.method = 'GET';
		options.headers={"Content-Type": "application/json"};
		var req = http.request(options, function(res){
			if (res){
				console.log(res.statusCode);
				  res.on('data', function (chunk) {
					console.log('BODY: ' + chunk);
				  });
			} else {
				console.log("NO RESPONSE");
			}
			done();
		});
		
		req.end();
			
		
	});
  });
});