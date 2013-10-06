Template.public_view.rendered = function(){
        if(typeof map == 'undefined'){
            //console.log('creating map')
            //createMap();
            
        }else{
            //setMapCenter();
        }
}


Meteor.startup(function(){
    if(Meteor.userId()){
    
         var user_events_sub = Meteor.subscribe("userEvents",Meteor.userId());
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
            
           
            
            
        }else{
            Session.set("doRefferal",true);
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
        
        
    }

});

Template.public_view.isVerified = function(){
    var q  = user_settings.find({status:1}).fetch();
    return q;
};

Template.public_view.events = {
    "click .accountSubmit" : function(evt,tmpl){
        console.log(this);
        console.log(tmpl.find('.accountVerification').value);
        
        var inputCode = tmpl.find('.accountVerification').value;
        
        if(inputCode){
            console.log('found');
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

Template.users_events.getEvents = function(){
    return user_events.find();
}
