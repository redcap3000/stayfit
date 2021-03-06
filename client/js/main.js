

Template.content.noMoves = function(){
    if(typeof user_settings != "undefined"){
        var settings = user_settings.findOne();
        if(typeof settings != 'undefined')
            return (typeof settings.movesToken == 'undefined'? true : false);
    }
};

Template.content.noMap = function(){
    return !Session.equals("page","map");
}

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
    },
    "click .showMap" : function(){
        Session.set("page","map");
        if(typeof map != "undefined")
            setMapCenter();
        // band aid to show the map ?
        
    }
};

Template.sidebar.mapLoaded = function(){
    return Session.equals("page","map");
};

Template.sidebar.totalMoves = function(){
    
    return user_moves_storyline.find().fetch().length;

}

Template.public_view.notClicked = function(){
    return (Session.get('emailSent') ? false:true);
};

Template.public_view.notClickedSMS = function(){
    return (Session.get('SMSSent') ? false:true);
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



Template.map.showMap = Template.sidebar.mapLoaded;

Template.map.rendered = function(){
// band aid to show the map right as it is created....  eventually grab
// session var with lat/long to set this properly...
     if(Session.equals("page","map") && typeof map == "undefined"){
        createMap();
        setMapCenter();
    }else if(Session.equals("page","map")){
//        createMapa();
        setMapCenter();
    }else{
        map = undefined;
    }

    
    // attempt to add/lookup new markers based on moves locations .?
    
};



