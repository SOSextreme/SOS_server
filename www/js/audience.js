
var Chat = {},token,map, cur = null;
Chat.socket = null;
var sourceBuffer = null, ms;
var flightPlanCoordinates = [];
var flightPath;

function init(){
  Chat.initialize();
  flightPath = new google.maps.Polyline({
    strokeColor: '#FF0000',
    strokeOpacity: 1.0,
    strokeWeight: 2
  });

  flightPath.setMap(map);
  console.log("in");

}


var head = window.location.toString();
if (head[head.length-1]!="/"){
	head = head+"/";
}
Chat.connect = (function(host) {
    if ('WebSocket' in window) {
        Chat.socket = new WebSocket(host);
    } else if ('MozWebSocket' in window) {
        Chat.socket = new MozWebSocket(host);
    } else {
        console.log('Error: WebSocket is not supported by this browser.');
        return;
    }

    Chat.socket.onopen = function () {
         // console.log('Info: WebSocket connection opened.');
        map = document.getElementById('map');
        // console.log(map);
        map = new google.maps.Map(document.getElementById('map'), {
            zoom: 17,
            center: {lat: 40.8075355, lng: -73.9625727},
            mapTypeId: google.maps.MapTypeId.ROADMAP
        });
         var subscription ={};
         subscription.join = token;
         Chat.sendMessage(JSON.stringify(subscription));
  
 
    };

    Chat.socket.onclose = function () {
  
    	
    	Chat.socket = null;
    //   setTimeout(function() {
    //     Chat.initialize();
    //   },60000);
    };

    Chat.socket.onmessage = function (message) {
    	  console.log(message.data);
        var action = JSON.parse(message.data);
		if(action["history"] != null) plotHistory(action["history"]);
        if(action["help"] != null) plotPoints(action["help"]);
		//console.log(action["history"]);
		//console.log(action["help"]);
     
        return false;
    };

});
  
function plotHistory(data){
	for (var i = 0; i < data.length; i++){
		var latlng = data[i];
		latlng = new google.maps.LatLng(parseFloat(latlng[0]),parseFloat(latlng[1]));
		var path = flightPath.getPath();
		path.push(latlng);
		if (i == data.length - 1){
			if(cur==null){
				cur = new google.maps.Marker({
				map: map,
				position:  latlng
				});
			}else{
				cur.setPosition(latlng);
			}
		}
	}
	    
	flightPath.setMap(map);
	
}
  
function plotPoints(data){
    var latlng = data.split(",");
    latlng  = new google.maps.LatLng(parseFloat(latlng[0]),parseFloat(latlng[1]));
    if(cur==null){
        cur = new google.maps.Marker({
        map: map,
        position:  latlng
    });
    }else{
		cur.setPosition(latlng);
	}
 
    map.setZoom(17); 
    map.panTo(latlng);
    var path = flightPath.getPath();
    console.log(path);
  // Because path is an MVCArray, we can simply append a new coordinate
  // and it will automatically appear.
    path.push(latlng);
    flightPath.setMap(map);

    console.log(latlng);
}  

Chat.initialize = function() {
	loc_str = window.location.toString();
	if (loc_str[loc_str.length-1]=="/"){
		loc_str = loc_str.substring(0,loc_str.length-1);
	}
	last = loc_str.lastIndexOf("/");
	token = loc_str.substring(last+1);
	console.log(window.location+","+token+","+last);
    if (window.location.protocol == 'http:') {
        Chat.connect('ws://' + window.location.host);
    } else {
        Chat.connect('wss://' + window.location.host);
    }
};

Chat.sendMessage = (function(message) {
   
        Chat.socket.send(message);
 
});

