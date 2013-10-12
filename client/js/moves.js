// properly uses moment to format the timestamp...
movesTimestamp = function(timestamp,format){
// use "20131009T151750Z" type format ...

    if(typeof format == "undefined"){
        format = "ddd, h:mm a";
    }
    var new_date_parts = timestamp.split("T");
    
    var new_start_ts = new_date_parts.join(" ");
    
    new_start_ts = new_start_ts.split("Z")[0];
    
    return  moment(new_start_ts,"YYYYMMDD HHmmss").format(format);

};

movesDate = function(date,format){
    if(typeof format == "undefined"){
        format = "ddd DD MMM";
    }
    return moment(date,"YYYYMMDD").format(format);

};

Template.moves.events = {
    "click .getMovesData" : function(){
        Meteor.call("movesApi",Meteor.userId(),"places/daily",{pastDays:7});
        Meteor.call("movesApi",Meteor.userId(),"activities/daily",{pastDays:7});
    },
    
    "click .setDays" : function(evt,tmpl){
        var q = tmpl.find(".movesPastDays");
        
        Meteor.call("movesApiStoryline",Meteor.userId(),q.value);
        
        
    }
};

Template.moves.totalDays = function(){

    return user_moves_storyline.find().fetch().length;
}

Template.moves.getPlaces = function(){
    var q = user_moves_places.find().fetch();
//    console.log(q);
    if(q.length > 0){
        var new_set = [];
        // converting times to timeago ... moment js
        q.filter(function(arr){
            
            var new_object = arr;
            
            new_object.date = movesDate(new_object.date);
            
            var new_segments = [];
            
            arr.segments.filter(function(arr2){
                var new_segment = arr2;

                new_segment.startTime = movesTimestamp(arr2.startTime);
                new_segment.endTime = movesTimestamp(arr2.endTime);

                new_segments.push(new_segment);

            });
            
            new_object.segments = new_segments;
            
            new_set.push(new_object);
            
        });
        return new_set;
    
    }
};
Template.moves.getActivities = function(){
    var q = user_moves_activities.find().fetch();
    if(q.length>0){
        var new_set = [];
        q.filter(function(arr){
            var new_object = arr;
            new_object.date = movesDate(arr.date);
            var new_segments = [];
            arr.segments.filter(function(arr2){
                var new_segment = {};
                var new_activities = [];
                new_segment.startTime = movesTimestamp(arr2.startTime);
                new_segment.endTime = movesTimestamp(arr2.endTime);
                
                var new_activities = [];
                arr2.activities.filter(function(arr3){
                    var new_activity = arr3;
                    
                    new_activity.startTime = movesTimestamp(arr3.startTime);
                    if(arr3.duration < 60)
                        new_activity.duration = '00:' + (arr3.duration < 10 ? '0' : '') + arr3.duration;
                    else{
                        var seconds = arr3.duration % 60;
                        var mintutes = parseInt(arr3.duration/60);
                        new_activity.duration = (mintutes < 10 ? '0' :'')+ mintutes + ':' + (seconds < 10 ? '0':'') + seconds ;
                    }
                    new_activity.distance *= 0.000621371192;
                    new_activity.distance = Math.round(new_activity.distance*100)/100
                    
                    new_activities.push(new_activity);
                });
                
                new_segment.activities = new_activities;
                new_segments.push(new_segment);
            });
            
            new_object.segments = new_segments;
            new_set.push(new_object);
            
        });
        return new_set;
    }
};
plotStoryline = function(){

    user_moves_storyline.find().fetch().filter(
        function(arr){
            if(typeof arr != "undefined" && arr != null && typeof arr.segments != "undefined" && arr.segments != null)
            arr.segments.filter(
                function(arr2){
                    // look for arr2.activities or arr2.place
                    if(typeof arr2.activities != "undefined"){
                        arr2.activities.filter(function(activity){
                            // activity , calories , distance , duration, endTime, startTime, trackPoints
                            // trackPoints : [   { lat,lon,time}  ]
                            activityCoordinates = [];
                            activity.trackPoints.filter(function(point){
                            // maybe keep track of index to define 'start stop' of an activity ?
                            
                                activityCoordinates.push(new google.maps.LatLng(point.lat,point.lon) );

                            });
                            
                            /*
                                GMAPS POLYLINE DEFINITION
                                Find someway to modify color changes .. analyse common routes ala
                                strava heatmaps?
                            */
                            var activityPath = new google.maps.Polyline({
                                path: activityCoordinates,
                                geodesic: true,
                                strokeColor: '#FF0000',
                                strokeOpacity: 0.5,
                                strokeWeight: 1
                              });
                              
                            activityPath.setMap(map);
                            setMapCenter(activityCoordinates[0]);
                            
                        });
                    
                    }
                    if(typeof arr2.place != "undefined"){
                        // add a nav marker to the place location and add name??
                        placeNavMarker(arr2.place.location.lat,arr2.place.location.lon,arr2.place.name);
                        console.log(arr2.place);
                    }
                    });
            }
    );


};
