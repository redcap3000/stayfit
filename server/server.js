/* PUBLISH EXAMPLES 

Meteor.publish("userInstaGrams",function(userId){
    if(typeof userId != "undefined" && userId != null){
        return insta_grams.find({owner:userId},{id:1,caption:1,likes:1,lat:1,lon:1,tags:1,link:1,username:1,image_low:1,image_thumb:1,caption_id:1,created_time:1,last_hit:1,locations:1});
    }
    else
        return false;
});

Meteor.publish("allLocations",function(idFilter){
// eventually use geojson to only get locations near by? automagically ... ?
    if(typeof idFilter == 'undefined' || typeof idFilter != 'object' ||  !idFilter){
    // no filter
        return false;
        }
    else{
        return insta_locations.find({id: {"$in" : idFilter}});
        }
});

Meteor.publish("locationsPosts",function(theFilter){
// the filter refers to an array with ID's of the grams to retreve ...
// eventually use geojson to only get locations near by? automagically ... ?
    //console.log(this.added("insta_locations_grams"));\// tooo much DATA
    if(typeof theFilter != 'undefined' && theFilter != null)
        if(theFilter.length > 0)
            return insta_locations_grams.find({id:{"$in" : theFilter}},{});
    else{
        console.log('no locations to load... from filter');
    }
});

*/