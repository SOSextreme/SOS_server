'use strict';

// setup default env variables
const path = require('path');
const express = require('express');
const app = express();
const expressWs = require('express-ws');
const cognitiveServices = require('cognitive-services')
const url = require('url');
const fs = require('fs')
const default_port = 7575;
const http_port = 9000;
const https = require('https')
const http = require('http')
const twilio = require('twilio');


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
const expressWss = expressWs (app, httpServer)
var info = require('./video-processor')(app);



httpServer.listen(http_port);
console.log('Listening http on port:' + http_port);
httpsServer.listen(default_port);
console.log('Listening https on port:' + default_port);
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

