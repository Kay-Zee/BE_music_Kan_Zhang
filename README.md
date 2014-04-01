

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

To start the server, simply move to the BE_music_Kan_Zhang folder (if you're not there already) and use the following

#####`$ node app.js`

Also included is a script file, script.js, in the text folder, that is meant to be run with Mocha.

Suggested command is 

#####`$ mocha script.js`

Must be in the test folder to run this.

## Developing



### Tools

Uses Node.js with Express.js connecting to a mongo database


Created with [Nodeclipse](https://github.com/Nodeclipse/nodeclipse-1)
 ([Eclipse Marketplace](http://marketplace.eclipse.org/content/nodeclipse), [site](http://www.nodeclipse.org))   

Nodeclipse is free open-source project that grows with your contributions.
