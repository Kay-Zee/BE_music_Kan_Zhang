

# BE_music_Kan_Zhang



## Usage
The server has three end points

##### `POST /follow`
Which adds one follow relationship ('from' follows 'to')

2 params:
- from: \<user ID\>
- to: \<user ID\>

##### `POST /listen`
Which adds one song the user just listened to

2 params:
- user: \<user ID\>
- music: \<music ID\>

##### `GET /recommendations`
Return 5 music recommendations to this user, sorted by relevance

Query string has:
- user: \<user ID\>

#### Running the Database, Server and Script
mongodb should be started up prior to server startup.

The database is stored in the data folder, and its expected address is

- mongodb://localhost:27017/BE_music_db

You will need to run npm install in the BE_music_Kan_Zhang (root) folder to get all the modules required

#####`$ npm install`

To start the server, simply move to the BE_music_Kan_Zhang folder (if you're not there already) and use the following

#####`$ node app.js`

the default address should be

- http://localhost:3000/


Also included is a script file, script.js, now located in the root folder, that is meant to be run with Mocha.

The app server must not be running, before you run the script. The script will start its own node.js server, and then run its tests, then end its own process.

Suggested command is 

#####`$ mocha script.js`

Must have mocha installed globally to run this. If you do not have mocha installed globally, you can try using one of the two following options

1. `npm test`
I have linked this script to `mocha script.js` and I believe npm uses the relative mocha module, and not the global version

2. `./node_modules/mocha/bin/mocha script.js`
To manually use the mocha inside the node_modules folder


#### NOTE

Currently, a lot of feedback is printed to the console. To turn this off, simply change 

`var printToConsole = false`

in index.js


## Developing



### Tools

Uses Node.js (v0.10.26) with Express.js connecting to a mongo database

Using Mocha for the script to feed the required info into the endpoints


Created with [Nodeclipse](https://github.com/Nodeclipse/nodeclipse-1)
 ([Eclipse Marketplace](http://marketplace.eclipse.org/content/nodeclipse), [site](http://www.nodeclipse.org))   

Nodeclipse is free open-source project that grows with your contributions.
