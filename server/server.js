
/**
*
*  Base64 encode / decode
*  http://www.webtoolkit.info/
*
**/

var serialize = function(obj) {
  var str = [];
  for(var p in obj)
     str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
  return str.join("&");
};

var Base64 = {

// private property
_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

// public method for encoding
encode : function (input) {
    var output = "";
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    var i = 0;

    input = Base64._utf8_encode(input);

    while (i < input.length) {

        chr1 = input.charCodeAt(i++);
        chr2 = input.charCodeAt(i++);
        chr3 = input.charCodeAt(i++);

        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;

        if (isNaN(chr2)) {
            enc3 = enc4 = 64;
        } else if (isNaN(chr3)) {
            enc4 = 64;
        }

        output = output +
        this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
        this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

    }

    return output;
},

// public method for decoding
decode : function (input) {
    var output = "";
    var chr1, chr2, chr3;
    var enc1, enc2, enc3, enc4;
    var i = 0;

    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

    while (i < input.length) {

        enc1 = this._keyStr.indexOf(input.charAt(i++));
        enc2 = this._keyStr.indexOf(input.charAt(i++));
        enc3 = this._keyStr.indexOf(input.charAt(i++));
        enc4 = this._keyStr.indexOf(input.charAt(i++));

        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;

        output = output + String.fromCharCode(chr1);

        if (enc3 != 64) {
            output = output + String.fromCharCode(chr2);
        }
        if (enc4 != 64) {
            output = output + String.fromCharCode(chr3);
        }

    }

    output = Base64._utf8_decode(output);

    return output;

},

// private method for UTF-8 encoding
_utf8_encode : function (string) {
    string = string.replace(/\r\n/g,"\n");
    var utftext = "";

    for (var n = 0; n < string.length; n++) {

        var c = string.charCodeAt(n);

        if (c < 128) {
            utftext += String.fromCharCode(c);
        }
        else if((c > 127) && (c < 2048)) {
            utftext += String.fromCharCode((c >> 6) | 192);
            utftext += String.fromCharCode((c & 63) | 128);
        }
        else {
            utftext += String.fromCharCode((c >> 12) | 224);
            utftext += String.fromCharCode(((c >> 6) & 63) | 128);
            utftext += String.fromCharCode((c & 63) | 128);
        }

    }

    return utftext;
},

// private method for UTF-8 decoding
_utf8_decode : function (utftext) {
    var string = "";
    var i = 0;
    var c = c1 = c2 = 0;

    while ( i < utftext.length ) {

        c = utftext.charCodeAt(i);

        if (c < 128) {
            string += String.fromCharCode(c);
            i++;
        }
        else if((c > 191) && (c < 224)) {
            c2 = utftext.charCodeAt(i+1);
            string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
            i += 2;
        }
        else {
            c2 = utftext.charCodeAt(i+1);
            c3 = utftext.charCodeAt(i+2);
            string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
            i += 3;
        }

    }

    return string;
}

}



Meteor.publish("userSettings",function(userId,vCode){
    if(typeof userId != "undefined" && userId != null && typeof vCode != 'undefined'){
        var q = user_settings.find({owner:userId, vCode: vCode,status:0}).fetch();
        if(q){
            // update user setting to status 1
            
            console.log('updating here');
            user_settings.update({owner:userId,vCode:vCode},{'$set':{status:1}});
        }
    }else{
        // look for a value with status 1
        return user_settings.find({owner:userId, status:1});
    }
});



Meteor.publish("userEvents",function(userId){
    //console.log('publishing');
    if(typeof userId != "undefined" && userId != null){
        return user_events.find({owner:userId});
    }
});


Meteor.publish("userActivities",function(userId){
    if(typeof userId != "undefined" && userId != null){
        return user_activities.find({owner:userId});
    }
});

Meteor.publish("userLocations",function(userId){
    if(typeof userId != "undefined" && userId != null){
        return user_locations.find({owner:userId});
    }
});

/* PUBLISH EXAMPLES 

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

Meteor.methods({
    genCode : function(the_owner){
        console.log('generating code for' + the_owner);
        var random_value = Random.hexString(4);
        user_settings.update({owner:the_owner},{set: {vCode: random_value,status : 0}});
        return random_value;
        }
    ,
    newUserSettings : function(the_owner){
        var new_object = {};
        new_object.owner = the_owner;
        new_object.vMethod = 'email';
        new_object.status = 0;
        console.log('inserting new owner settings... probably verify one does not already exist');
        if(!user_settings.findOne({owner:the_owner})){
            var random_value = Random.hexString(4);
            new_object.vCode = random_value;
            user_settings.insert(new_object);
            // issue another call to determine to send as SMS or email
            return random_value;
        }else{
            console.log('user exists');
        }
    },
    verifyCode : function(the_owner,vCode){
    
        var q = user_settings.findOne({owner:the_owner,status:0,vCode:vCode});
        if(q){
            // update object to set status to 1
            var theUpdate = user_settings.update({owner:the_owner},{"$set":{owner:the_owner,status:1}});
            if(theUpdate)
                return theUpdate;
            else{
                console.log('problem with updating backend for ' + the_owner);
                return false;
               }
            
            }
        else{
            console.log('prob with vcode match ... try again');
            return false;
        }
        // problem with update?
        return false;
        
    },
    
    
    sendSMS : function (dest, userid) {
    
            var settings = Meteor.settings;
            
            if(settings.twilio != "undefined"){
                settings = settings.twilio;
               
                if(settings.account_sid != "undefined"){
                    var sid = settings.account_sid;
                    if(settings.auth_token != "undefined"){
                        var auth_token = settings.auth_token
                    }
               }
            }
    
            var q =user_settings.findOne({owner:userid},{vCode:1});
            console.log(q.vCode);
            
            if(q && typeof q.vCode != 'undefined')
            
          console.log(Meteor.http.post('https://api.twilio.com/2010-04-01/Accounts/'+sid+'/Messages',
          {
            params:{From:'+14696434684', To: dest, Body: 'Your stayfit code is ' + q.vCode},
            headers: {
            'content-type':'application/x-www-form-urlencoded',
                'authorization' : 'Basic ' +  Base64.encode(sid + ':' + auth_token),
            }
          }, function () {
              console.log(arguments)
            }
          ));
        

    },
    
    sendEmail : function(userId,address){
        // verify userId exists and  check status : 0
            
        var confirmation = user_settings.findOne({owner:userId});
        
        var settings = Meteor.settings;
        
        
        
        if(typeof settings != "undefined" && settings){
            if(settings.sendGrid != "undefined"){
                settings = settings.sendGrid;
            }
        }
        
        if(typeof settings.user != "undefined" && typeof settings.key != "undefined"){
            sendgrid_user = settings.user;
            sendgrid_key = settings.key;
        
        
            if(confirmation && typeof confirmation.vCode != 'undefined'){
                var message = 'Your confirmation code for stayfit.meteor.com is ' + confirmation.vCode;
            
                var to_name = 'User';
                var subject = 'Confirmation Code';
                
                var base_url = 'https://sendgrid.com/api/mail.send.json?api_user='+sendgrid_user+'&api_key='+sendgrid_key+'&to='+address+'&toname='+to_name+'&subject=Example_Subject&text='+message+'&from=donotreply@stayfit.meteor.com';
                    
                console.log(Meteor.http.get(base_url));
                
            }else{
                console.log('confirmation email already sent');
            }
        }
    },
    createEvent : function(userId,obj){
        // probably validate obj ...
        var cpy = obj;
        cpy.owner = userId;
        return user_events.insert(obj);
        
    },
    createLocation : function(userId,obj){
        var cpy = obj;
        cpy.owner = userId;
        return user_locations.insert(obj);
        
    },
    
    createActivity : function(userId,obj){
       var cpy = obj;
        cpy.owner = userId;
        user_activities.insert(cpy);
    },
    
    movesAuth : function(){
        var settings = Meteor.settings;
        if(typeof settings != 'undefined'){
            
            if(typeof settings.moves != 'undefined'){
                settings = settings.moves;
                if(typeof settings.client_id != "undefined"){
                    if(typeof settings.client_secret != "undefined"){
                        var base_url = "https://api.moves-app.com/oauth/v1/authorize?response_type=code&client_id=";
                        return base_url + settings.client_id + "&scope=activity%20location" ;
                    }
               }
            }
        }
    },
    
    movesRequestToken : function(code){
    
        var settings = Meteor.settings;
         var settings = Meteor.settings;
        if(typeof settings != 'undefined'){
            
            if(typeof settings.moves != 'undefined'){
                settings = settings.moves;
                if(typeof settings.client_id != "undefined"){
                    if(typeof settings.client_secret != "undefined"){
                        var post_request = {params : {
                            grant_type : "authorization_code",
                            code : code,
                            client_id : settings.client_id,
                            client_secret : settings.client_secret,
                            redirect_uri : settings.redirect_uri
                        }};
               
                        console.log(post_request);
                        Meteor.http.post( "https://api.moves-app.com/oauth/v1/access_token" ,post_request,function(error,result){
                            if( typeof result != "undefined"){
                                console.log(result);
                                if(result.statusCode == 200){
                                    console.log('token obtained from moves');
                                
                                if(typeof result.data != "undefined")
                                    if(typeof result.data.access_token != "undefined")
                                        // give user their moves token ...
                                        user_settings.update({movesCode : code},
                                        {"$set": {movesToken : result.data.access_token} });
                                }else{
                                    console.log('Moves token request returned error');
                                    console.log(result);
                                }
                            }else{
                                console.log('something bad happened when movesRequestToken ran');
                                console.log(error);
                            }
                        });
                   }
                }
            }
        }
    },
    
    movesApi : function (userId,action,parameters){
        // get api key
        var q = user_settings.findOne({owner:userId});
        if(q && typeof userId != "undefined" && typeof action != "undefined"){
            console.log(q);
            if (typeof q.movesToken != "undefined"){
                var token = q.movesToken;
               console.log(token);
               console.log("https://api.moves-app.com/api/v1/user/" + action +  (typeof parameters != "undefined" ? "?" + serialize(parameters) + "&" : "?" ) +  "access_token=" + token);
                // check if access token expired... PITA
                 Meteor.http.get(  "https://api.moves-app.com/api/v1/user/" + action +  (typeof parameters != "undefined" ? "?" + serialize(parameters) + "&" : "?" ) +  "access_token=" + token , function(error,result){
                    if(action == 'places/daily'){
                        result.data.filter(function(arr){
                            var date = arr.date;
                            //var new_object = arr;
                            //arr.owner = userId;
                            var segments = [];
                            // clean up segments array field to make less verbose. Should be ok.
                            arr.segments.filter(function(arr2){
                                var new_segment = {};
                                
                                new_segment.id = arr2.place.id;
                                new_segment.name = arr2.place.name;
                                new_segment.type = arr2.place.type;
                                
                                new_segment.lat = arr2.place.location.lat;
                                new_segment.lon = arr2.place.location.lon;

                                
                                new_segment.startTime = arr2.startTime;
                                new_segment.endTime = arr2.endTime;
                                segments.push(new_segment);
                            });
                            
                            var new_record = {};
                            new_record.date = arr.date;
                            if(segments.length > 0)
                                new_record.segments = segments;
                              // check to see if date does not exist support upsert !!!?
                            user_moves_places.insert( new_record );
                        });
                        // store to places
                        
                  //      user_moves_places.insert(
                    }else if(action == 'activities/daily'){
                    // no change for this data structure since activities are more embedded and don't feel like
                    // doing time difference calculations for now ...
                        result.data.filter(function(arr){
                            //var new_object = arr;
                            //arr.owner = userId;
                            var new_record = arr;
                            new_record.owner = userId;
                            console.log(new_record);
                              // check to see if date does not exist support upsert !!!?
                            console.log(user_moves_activities.insert( new_record ));
                        });
                    }
                 
                 }) ;
               
                // perhaps do some validation on types of 'actions' to accept clientside
            }
        }
    },
    fitbitAuth : function(){
    
        // old oauth greeattt
        
         console.log(Meteor.http.post('https://api.twilio.com/2010-04-01/Accounts/ACbe383739477ce50535347399480c8403/Messages',
          {
            params:{oauth_signature_method:'HMAC-SHA1', oauth_timestamp: Date.parse(new Date()).getTime()/1000, oauth_nonce: Random.hexString(6) },
            headers: {
            'content-type':'application/x-www-form-urlencoded',
                'authorization' : 'OAuth oauth_consumer_key="stayfit"',
            }
          }, function () {
              console.log(arguments)
            }
          ));
        
    }
    
    
});