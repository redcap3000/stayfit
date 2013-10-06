
/**
*
*  Base64 encode / decode
*  http://www.webtoolkit.info/
*
**/
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
            var q =user_settings.findOne({owner:userid},{vCode:1});
            console.log(q.vCode);
            
            if(q && typeof q.vCode != 'undefined')
            
          console.log(Meteor.http.post('https://api.twilio.com/2010-04-01/Accounts/ACbe383739477ce50535347399480c8403/Messages',
          {
            params:{From:'+14696434684', To: dest, Body: 'Your stayfit code is ' + q.vCode},
            headers: {
            'content-type':'application/x-www-form-urlencoded',
                'authorization' : 'Basic ' +  Base64.encode('ACbe383739477ce50535347399480c8403:6ccdf3fb40753f5dff511b920b541468'),
            }
          }, function () {
              console.log(arguments)
            }
          ));
        

    },
    
    sendEmail : function(userId,address){
        // verify userId exists and  check status : 0
            
        var confirmation = user_settings.findOne({owner:userId});
        console.log('send email');
        if(confirmation && typeof confirmation.vCode != 'undefined'){
            var message = 'Your confirmation code for stayfit.meteor.com is ' + confirmation.vCode;
        
            var to_name = 'User';
            var subject = 'Confirmation Code';
            var sendgrid_user = 'pooran';
            var sendgrid_key = '0nd3ckcup';
            var base_url = 'https://sendgrid.com/api/mail.send.json?api_user='+sendgrid_user+'&api_key='+sendgrid_key+'&to='+address+'&toname='+to_name+'&subject=Example_Subject&text='+message+'&from=donotreply@stayfit.meteor.com';
                
            console.log(Meteor.http.get(base_url));
            
        }else{
            console.log('confirmation email already sent');
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
    }
    
});