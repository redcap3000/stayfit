
Meteor.startup(function(){
    if(Meteor.userId()){
        var user_events_sub = Meteor.subscribe("userEvents",Meteor.userId());
        var user_activities_sub = Meteor.subscribe("userActivities",Meteor.userId());
        var user_locations_sub = Meteor.subscribe("userLocations",Meteor.userId());
        
        /*
         *  Handles : first verification code screen. Handles third-party redirect token api's when provided
         *  and stores to user_settings
         */
        Deps.autorun(function(){
        
        // check for code ?
            
            if(Session.get("vCode")){
                console.log('vCode found!');
                var user_settings_sub = Meteor.subscribe("userSettings", Meteor.userId(),Session.get("vCode"));
                // doesnt report invalid validation codes yet... hmmmm
            }else{
                var user_settings_sub = Meteor.subscribe("userSettings",Meteor.userId());
                // do we have a vCode?
            }
        
            var the_user_settings = user_settings.findOne();
            // check if user_settings is empty
            if(the_user_settings){
                console.log('user found');
                console.log(the_user_settings);
                
                if(typeof the_user_settings.movesCode == "undefined"){
                    if(!Session.get('movesCode')){
                        // maybe do a simplier check..
                        var access_token = window.location.href.split("&");
                        console.log(access_token);
                        if(access_token.length > 1 ){
                            access_token = access_token[0].split("?code=")[1];
                            Session.set('movesCode', access_token);
                            if(access_token[1] != "state="){
                            // store token into user_settings ?
                                Session.set('movesState',access_token[1].split("state=")[1]);
                           }
                        }
                    }else{
                    
                        
                        // store variable to moves token , redirect uri to '/' to get rid of it in menubar
                       user_settings.update(the_user_settings._id,
                            {"$set" :{
                                 movesCode : Session.get('movesCode')}
                            }
                        );
                    }
                }else if(!Session.get('movesRequestToken') && typeof the_user_settings.movesCode != "undefined" && typeof the_user_settings.movesToken == "undefined"){
                    // authorize it next ...
                    // only call this once
                    // make backend check /store actual token
                    Meteor.call("movesRequestToken",the_user_settings.movesCode,function(error,result){
                        if(typeof error != "undefined"){
                            console.log('Problem with moves request token');
                            console.log(error);
                        }else{
                            console.log('token obtained');
                            console.log(result);
                             //window.location.replace(result);
                        }
                    
                    });
                    Session.set('movesRequestToken',1);
                    console.log('moves token active');
                }
                
                
                if(typeof the_user_settings.movesCode != "undefined"){
                // get subscriptions for moves data
                     var user_moves_locations_sub = Meteor.subscribe("userMovesPlaces",Meteor.userId());
                     var user_moves_activities_sub = Meteor.subscribe("userMovesActivities",Meteor.userId());
                
                }
            }else if(user_settings_sub.ready()){
                console.log('user not found');
                // create a new user settings ...
                Meteor.call('newUserSettings',Meteor.userId(),function(error,result){
                    if(typeof error == 'undefined'){
                        console.log('made user');
                        console.log(result);
                        // this is the vcode next do sub from here >?
                        }
                    // next do call to check if code has been entered yet based on status
                });
            }
        });
}

}
);

Template.content.noMoves = function(){
    if(typeof user_settings != "undefined"){
        var settings = user_settings.findOne();
        if(typeof settings != 'undefined')
            return (typeof settings.movesToken == 'undefined'? true : false);
    }
};

Template.content.events = {
    "click .getMovesKey" : function(){
        // redirect to result from serverside call
        Meteor.call("movesAuth",
            function(error,result){if (typeof error != 'undefined') console.log(error); else window.location.replace(result);
        });
    }

}

Template.public_view.isVerified = function(){
    var q  = user_settings.find({status:1}).fetch();
    return q;
};

Template.public_view.events = {
    "click .accountSubmit" : function(evt,tmpl){
        
        var inputCode = tmpl.find('.accountVerification').value;
        
        if(inputCode){
            user_settings_sub = Meteor.subscribe("userSettings", Meteor.userId(),inputCode);
            // set session and let deps and subscribe handle the rest
        }
    },
    "click .sendCodeSubmit" : function(evt,tmpl){
        var sms = tmpl.find('.smsPhone').value;
        if(sms){
            console.log(sms);
            // actual text is provided via sms
            // pass meteor userid to get user_settings.vCode value ...
            Meteor.call('sendSMS',sms,Meteor.userId());
            Session.set('SMSSent',true);
            }
        
    },
    "click .sendCodeEmail": function(evt,tmpl){
        // gets user email address based on accounts collection?
        var meteor_email = Meteor.user(),
        meteor_email = meteor_email.emails[0].address;
        // mehhhhh cant do this on backend ?
        Meteor.call('sendEmail',Meteor.userId(),meteor_email);
        this.clicked= true;
        Session.set('emailSent',true);
    }
};
Template.public_view.notClicked = function(){
    return (Session.get('emailSent') ? false:true);
};

Template.public_view.notClickedSMS = function(){
    return (Session.get('SMSSent') ? false:true);
};


Template.new_event.events = {
    "click .createEvent" : function(evt,tmpl){
        alert('Make this happen');
        console.log('here');
        var title = tmpl.find('.eventTitle').value;
        var location = tmpl.find('.eventLocation').value;
        var activity = tmpl.find('.eventActivity').value;
        var date = tmpl.find('.eventDate').value;
        var time = tmpl.find('.eventTime').value;
        var expense = tmpl.find('.eventExpense').value;
        var details = tmpl.find('.eventDetails').value;


        Meteor.call('createEvent',Meteor.userId(),{title:title,location:location,activity:activity,date:date,time:time,expense:expense,details:details},function(error,result){if(typeof error == 'undefined') console.log(result);});
    }

}


Template.new_activity.events = {
    "click .createActivity" : function(evt,tmpl){
        var title = tmpl.find('.activityTitle').value;
        
        Meteor.call('createActivity',Meteor.userId(),{title:title},function(error,result){if(typeof error == 'undefined') console.log(result);});
    }

}

Template.new_location.events = {
    "click .createLocation" : function(evt,tmpl){
        var title = tmpl.find('.locationTitle').value;
        var address = tmpl.find('.locationAddress').value;
        Meteor.call('createLocation',Meteor.userId(),{title:title,address:address},function(error,result){if(typeof error == 'undefined') console.log(result);});
    }

}

Template.send_sms_reminder.events = {
    "click .sendSMSReminder" : function(evt,tmpl){
        console.log('here');
        var number = tmpl.find('.smsPhoneNumber').value;
        var activity = tmpl.find('.smsReminderActivity').value;
        
        console.log(user_activities.findOne({_id : activity}));
        var sms = 'You have an activity' +
            Meteor.call('sendSMS',sms,Meteor.userId());

        
//        Meteor.call('sendSMS',Meteor.userId(),number,activity);
        }
    };

// for email
Template.send_reminder.events = {
    "click .sendReminder" : function(evt,tmpl){
        var email = tmpl.find('.emailReminder').value;
        var activity = tmpl.find('.smsReminderActivity').value;
//        Meteor.call('sendSMS',Meteor.userId(),number,activity);

        }
    };

Template.sidebar.events = {

    "click .newActivity" : function(){
        Session.set("page","newActivity");
    },
    "click .sendReminder" : function(){
        Session.set("page","sendReminder");
    },
    "click .movesApi" : function(){
        Session.set("page","movesApi");
    },
    "click .home" :function(){
        Session.set("page",undefined);
    }
};


Template.public_view.newActivity = function(){
    return Session.equals("page","newActivity");
};

Template.public_view.sendReminder = function(){
    return Session.equals("page","sendReminder");
};

Template.public_view.movesApi = function(){
    return Session.equals("page","movesApi");
};

Template.sidebar.hasMoves = function(){

    if(typeof user_settings != "undefined"){
        var settings = user_settings.findOne();
        if(typeof settings != 'undefined')
            return (typeof settings.movesToken == 'undefined'? false : true);
    }


};

Template.public_view.atHome = function(){
    return Session.equals("page",undefined);
}

Template.users_events.getEvents = function(){
    return user_events.find();
}

Template.new_event.getActivities = function(){
    console.log('find');
    var q= user_activities.find().fetch();
    return (q.length > 0 ? q : false);
}

Template.new_event.getLocations = function(){
    var q= user_locations.find().fetch();
    return (q.length > 0 ? q : false);
};

Template.send_sms_reminder.getEvents = function(){
    console.log('find');
    
    var q= user_events.find().fetch();
    return (q.length > 0 ? q : false);
}

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
        format = "ddd do MMM";
    }
    return moment(date,"YYYYMMDD").format(format);

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
}
Template.moves.getActivities = function(){
    var q = user_moves_activities.find().fetch();
    if(q.length>0){
        var new_set = [];
        q.filter(function(arr){
            var new_object = arr;
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
                        new_activity.duration = '00:' + arr3.duration;
                    else{
                        var seconds = arr3.duration % 60;
                        var mintutes = parseInt(arr3.duration/60);
                        new_activity.duration = mintutes + ':' + (seconds < 10 ? '0':'') + seconds ;
                        
                        
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
}

