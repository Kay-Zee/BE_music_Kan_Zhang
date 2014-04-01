var assert = require("assert")
var express = require("express")
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
  "description": "hold the lists that each user heard before",
  "userIds":{
    "a": ["m2","m6"],
    "b": ["m4","m9"],
    "c": ["m8","m7"],
    "d": ["m2","m6","m7"],
    "e": ["m11"]
  }
}


describe('Fictional MVP', function() {
  describe('#Listen', function() {
    it('Executes the listen command with the provided JSON', function(done){
		http.request(
		  { method: 'POST'
		  , url: 'http://localhost:3000/listen'
		  , headers: { 'content-type': 'application/json' , 'accept': 'application/json' }
		  , json: listenJSON
		  }
		, function(err, response, body){
			if (response){
				response.statusCode.should.equal(200);
				console.log("Correct Response");
			} else {
				console.log("NO RESPONSE");
			}
		  done();
		}).end();
	});
	
  });
});