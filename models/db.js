var mongoose = require( 'mongoose' );
// Start up the connection
var dbURI = 'mongodb://localhost:27017/BE_music_db';
mongoose.connect(dbURI);
var db = mongoose.connection;
db.on('connected', function () {
  console.log('Mongoose default connection open to ' + dbURI);
});

// If the connection throws an error
db.on('error',function (err) {
  console.log('Mongoose default connection error: ' + err);
});
 
// When the connection is disconnected
db.on('disconnected', function () {
  console.log('Mongoose default connection disconnected');
});
 
// If the Node process ends, close the Mongoose connection
process.on('SIGINT', function() {
  mongoose.connection.close(function () {
    console.log('Mongoose default connection disconnected through app termination');
    process.exit(0);
  });
});
 
/*
 * Schemas & Models
 */
 require('./music');
require('./user');

module.exports = db;
