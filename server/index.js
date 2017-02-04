'use strict';

// setup default env variables
const path = require('path');
const express = require('express');
const app = express();
const expressWs = require('express-ws');
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
var io = require('socket.io')(httpServer);
io.on('connection', function(client){
  client.on('init', function(data){
      console.log(data);
  });
});

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




app.get('/lyft', function(req, response){
    //console.log("Request file_path " + pathname[2]+ " received.");
    
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    var request = require('request');
    console.log(query['code']);
    var getcodeBody = {
						"grant_type":"authorization_code",
						"code": query['code']
	  };
	 var getcodeBodyData = JSON.stringify(getcodeBody);
	 var user = process.env.client_id;
     var pass = process.env.client_secret;

     var auth = new Buffer(user + ':' + pass).toString('base64');
	 request({
			    headers: {
							"Content-Type":"application/json",
							'Authorization': 'Basic ' + auth
						},
			    url: "https://api.lyft.com/oauth/token",
				body: getcodeBodyData,
				method: 'POST'
				}, function (err, res, body) {
						console.log(err);
						var token=JSON.parse(body);
						console.log(token['access_token']);
                       
						response.status(200).send(token['access_token']);
					});
    
});

