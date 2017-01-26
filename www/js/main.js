var map,geo_marker;
function init() {
    var recorder;
    var mediaStream;
    var fileName;
    var connection;
    var fileLocation;
    var AbleToRecord = true;
    var port = 9000;

    // console.log("in map")

    function getWebSocket() {
         if (window.location.protocol == 'http:') {
            var websocketEndpoint = 'ws://' + window.location.host;
            connection = new WebSocket(websocketEndpoint);
         } else {
            var websocketEndpoint = 'wss://' + window.location.host;
            connection = new WebSocket(websocketEndpoint);
        }
        // var websocketEndpoint = 'ws://localhost:' + port;
  
        connection.onmessage = function (message) {
            fileName = message.data;
            fileLocation = 'https://' + window.location.host + '/w/'+ fileName;

            var recButton = document.getElementById('record');
            recButton.innerHTML = "Cancel";
            $("#record").removeClass("btn-primary").addClass("btn-danger");

            $('#share').show();
            $('#share').html('<p> Now live on: </p><a onclick="window.open(\''+fileLocation+"/"+'\');"style="color:#d6d6f5;">'+fileLocation+'</a>');
            AbleToRecord = true;

        }
        connection.onclose = function () {
            AbleToRecord = true;
           


        }
        connection.onopen = function () {
            
         


        }

    };
 
  

    var recButton = document.getElementById('record');
    recButton.addEventListener('click', function (e) {
        if(AbleToRecord){
            if(recButton.innerHTML == "Shoot"){
                getWebSocket();
                AbleToRecord = false;


            }else{
                AbleToRecord = false;
          
                connection.close();

                $('#share').html('<p style="color:#d6d6f5;">Lived on: </p><a onclick="window.open(\''+fileLocation+'\');" style="color:#ffffff;">'+fileLocation+'</a>');
                // $('#share').hide();


                //updateVideoFile();
                $("#record").removeClass("btn-danger").addClass("btn-primary");
            

                recButton.innerHTML = "Shoot";

            }
        }
    });
    map = document.getElementById('map');
    // console.log(map);
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        center: {lat: 40.8075355, lng: -73.9625727},
        mapTypeId: google.maps.MapTypeId.ROADMAP
    });
    // console.log(map);
    // getVideoStream();
    geo_marker = new google.maps.Marker({
        map: map,
        position: map.getCenter()
    });
    geo_marker.setVisible(true);
    map.addListener('click', function(e) {
      geo_marker.setPosition(e.latLng);
      map.setZoom(15); 
      map.panTo(e.latLng);
      console.log(e.latLng.lat());
      
    });


   
}