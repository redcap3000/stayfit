
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
                
                if(typeof the_user_settings.movesToken == "undefined"){
                    if(!Session.get('movesToken')){
                        // maybe do a simplier check..
                        var access_token = window.location.href.split("&");
                        console.log(access_token);
                        if(access_token.length > 1 ){
                            access_token = access_token[0].split("?code=")[1];
                            Session.set('movesToken', access_token);
                            if(access_token[1] != "state="){
                            // store token into user_settings ?
                                Session.set('movesState',access_token[1].split("state=")[1]);
                           }
                        }
                    }else{
                        // store variable to moves token , redirect uri to '/' to get rid of it in menubar
                       user_settings.update(the_user_settings._id,
                            {"$set" :{
                                 movesToken : Session.get('movesToken')}
                            }
                        );
                    }
                }else{
                    console.log('moves token active');
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
        Meteor.call("movesAuth",function(error,result){if (typeof error != 'undefined') console.log(error); else window.location.replace(result);
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


