Template.new_event.events = {
    "click .createEvent" : function(evt,tmpl){
        var title = tmpl.find('.eventTitle').value;
        var location = tmpl.find('.eventLocation').value;
        var activity = tmpl.find('.eventActivity').value;
        var date = tmpl.find('.eventDate').value;
        var time = tmpl.find('.eventTime').value;
        var expense = tmpl.find('.eventExpense').value;
        var details = tmpl.find('.eventDetails').value;
        Meteor.call('createEvent',Meteor.userId(),{title:title,location:location,activity:activity,date:date,time:time,expense:expense,details:details},function(error,result){if(typeof error == 'undefined')         Session.set("page",undefined);});
    }

};


Template.new_activity.events = {
    "click .createActivity" : function(evt,tmpl){
        var title = tmpl.find('.activityTitle').value;
        
        Meteor.call('createActivity',Meteor.userId(),{title:title},function(error,result){if(typeof error == 'undefined') console.log(result);});
    }

};

Template.new_location.events = {
    "click .createLocation" : function(evt,tmpl){
        var title = tmpl.find('.locationTitle').value;
        var address = tmpl.find('.locationAddress').value;
        Meteor.call('createLocation',Meteor.userId(),{title:title,address:address},function(error,result){if(typeof error == 'undefined') console.log(result);});
    }

};

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
};

Template.users_events.getEvents = function(){
    return user_events.find();
}
