/*
 * instageo / geoserve - Ronaldo Barbachano 2013
 * http://redcapmedia.com
 
 BEGIN GMAPS
 *
 *
 */



Meteor.startup(function(){

gmapsMarkers = [],infoWindows = [],locationsMarkers = [],
closeInfoWindows = function(){if(infoWindows.length > 0)
            return infoWindows.filter(function(arr){
               arr.close();
               return false;
            });},
createMap = function(latLng) {
    var mapOptions = {
        disableDoubleClick: true,
        streetViewControl: false,
        scrollwheel: false,
        zoom: 15,
        center: latLng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
    // disable this ASAP
//    setMapCenter();
},
placeNavMarker = function(lat,lng,title,infoHTML) {
    if(typeof lat != "undefined" && typeof lng != "undefined"){
        var location = new google.maps.LatLng(lat,lng);
    }else{
        return false;
    }
    if(typeof title == 'undefined'){
        title = 'untitled';
    }

    var new_marker = new google.maps.Marker({
        position: location,
        map: map,
        'title': title
        });
    
    
    if(typeof infoHTML != "undefined"){
        var infoWindow = new google.maps.InfoWindow({
            content: infoHTML
        });
        
        infoWindows.push(infoWindow);
        
        google.maps.event.addListener(new_marker, 'click', function() {
            closeInfoWindows();
            infoWindow.open(map,new_marker);
            // how to issue template event?
        });
    }
    gmapsMarkers.push(new_marker);
},
// takes either array with two integers (x,y) or a google maps LatLng object.
setMapCenter = function(q){
    if(typeof map == 'undefined'){
        createMap();
    }else{
    map.setCenter((typeof q == 'object' && q.length == 2? new google.maps.LatLng(q[0],q[1]) : (typeof q == 'object' ? q: new google.maps.LatLng(0,0))));
    }
}
 });
/*
 *
 * END GMAPS
 *
 */
