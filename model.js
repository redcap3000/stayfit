/*
 * instageo / geoserve - Ronaldo Barbachano 2013
 * http://redcapmedia.com
 */
var default_permissions = {
    insert:function(userId,doc){
        return (userId && doc.owner === userId);
    },
    update:function(userId,doc,fields,modifier){
        return doc.owner === userId;
    },
    remove:function(userId,doc){
        return doc.owner === userId;
    },
    fetch: ['owner']
},
read_only_permissions = {
    insert:function(){
        return true;
    },
    update: function(){
        return true;
    },
    remove: function(){
        return true;
    }
};

/*
 *   insta_grams            = users geo-active feed, stored via owner ID
 *   insta_locations        = public collection with locations first looked up via location id stored in insta_grams.locations ( [int,int,int] )
 *   insta_locations_grams  = feeds from insta_locations, stored via insta_location id
 */

user_settings = new Meteor.Collection("user_settings");

user_events = new Meteor.Collection("user_events");

user_activities = new Meteor.Collection("user_activities");

user_locations = new Meteor.Collection("user_locations");

user_settings.allow(default_permissions);

user_events.allow(default_permissions);

user_activities.allow(default_permissions);

user_locations.allow(default_permissions);
/*
user_moves_places = new Meteor.Collection("user_moves_places");

user_moves_places.allow(default_permissions);

user_moves_activities = new Meteor.Collection("user_moves_activities");

user_moves_activities.allow(default_permissions);
*/

user_moves_storyline = new Meteor.Collection("user_moves_storyline");

user_moves_storyline.allow(default_permissions);



/*
insta_grams = new Meteor.Collection("insta_grams"),
insta_locations = new Meteor.Collection("insta_locations"),
insta_locations_grams = new Meteor.Collection("insta_locations_grams");

insta_grams.allow(default_permissions);
insta_locations.deny(read_only_permissions);
insta_locations_grams.deny(read_only_permissions);

*/