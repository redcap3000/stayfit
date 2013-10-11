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
                     Meteor.call("movesApi",Meteor.userId,"activities/daily",{pastDays:7})
                // if they are empty then lookup daily activities... this may run frequently with each update ...
                     var user_moves_locations_sub = Meteor.subscribe("userMovesPlaces",Meteor.userId());
                     var user_moves_activities_sub = Meteor.subscribe("userMovesActivities",Meteor.userId());
                
                }
                
            }else if(user_settings_sub.ready()){
                console.log('user not found');
                // create a new user settings ...
                if(Meteor.userId()){
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
}

}
);
