Template.map.rendered = function(){
        if(typeof map == 'undefined'){
            console.log('creating map')
            createMap();
            
        }else{
            setMapCenter();
        }
}