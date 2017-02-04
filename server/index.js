'use strict';

// setup default env variables
const path = require('path');
const express = require('express');
const app = express();
const expressWs = require('express-ws');
const fs = require('fs')
const default_port = 7575;
const http_port = 9000;
const https = require('https')
const http = require('http')
const twilio = require('twilio');
var url = require('url');
var historyLog = {};
var env = require('dotenv').load();
var accountSid = process.env.accountSid;
var authToken = process.env.authToken;
var NodeGeocoder=require('node-geocoder');
var client = require('twilio')(accountSid, authToken);
var toNumber = process.env.toNumber;
var fromNumber = process.env.fromNumber;
var info = {}; 
var request = require('request');
var options={
   provider:'google',
   httpAdapter:'https',
   apiKey:process.env.reverseGeo,
   formatter:null
};
var geocoder=NodeGeocoder(options);


const credentials = {
  cert: fs.readFileSync(path.join(__dirname, 'ssl', 'server.crt')),
  key: fs.readFileSync(path.join(__dirname, 'ssl', 'server.key'))
}

 
app.set('views', path.join(__dirname, 'views'));  
app.set('view engine', 'ejs');

app.use(express.static('../www/'));



// var port = Number(process.env.PORT || default_port);


const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);

var io = require('socket.io')(httpServer);

io.on('connection', function (socket) {
  
  socket.on('join', function (data) {
    console.log(data["join"]);
    socket.join(data["join"]);
    console.log(historyLog[data["join"]]);
    socket.emit('histroy', historyLog[data["join"]]);

  });
 

  socket.on('init', function (data) {

    socket.join(data["fbId"]);
    console.log(data);
    historyLog[data["fbId"]] = [[data["lat"],data["lng"]]];
    socket.emit('liveUrl', data["fbId"]);

  });

  socket.on('live_update', function (data) {
    historyLog[data["fbId"]].push([data["lat"],data["lng"]]);
  });

  socket.on('criminal_img', function (data) {
    console.log(data);
  });

});








httpServer.listen(http_port);
console.log('Listening http on port:' + http_port);

// app.listen(port, function () {
//     console.log('Listening on port:' + port);
   
// });

//tell express what to do when the /about route is requested
app.get('/w/*', function(req, res){
	var pathname = url.parse(req.url).pathname;
    //console.log("Request file_path " + pathname[2]+ " received.");
    var params = {name:pathname}
    res.render('playback', params);
    
});



app.post('/h/*', function (req, res){
  // Use the Twilio Node.js SDK to build an XML response
  var pathname = url.parse(req.url).pathname.substring(3);
  let twiml = new twilio.TwimlResponse();
  twiml.say("I am "+info[pathname]["Name"]+". I am threatened. My current location is "+info[pathname]["Address"]+". Please help. Watch my live location at http://"+req.headers.host+"/w/"+pathname, { voice: 'alice' });

  // Render the response as XML in reply to the webhook request
  res.type('text/xml');
  res.send(twiml.toString());
});




app.get('/lyft', function(req, res){
	var pathname = url.parse(req.url).pathname;
    //console.log("Request file_path " + pathname[2]+ " received.");
    console.log(req);
    res.status(200).json({get:"ok"})
    
});

