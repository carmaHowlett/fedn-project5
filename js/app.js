

var viewModel = function() {
	var self = this;
  var map;
  var defaultNeighborhood = "Singapore, Singapore";

  self.topPicks     = ko.observableArray([]); 
  self.neighborhood = ko.observable(defaultNeighborhood); 

  initializeMap();

  self.newNeighborhood = ko.computed(function() {
    if (self.neighborhood() != '') {
      requestNeighborhood(self.neighborhood());
    }
  });

  function initializeMap() {
    var mapOptions = {
      zoom: 15
//      center: new google.maps.LatLng(-34.397, 150.644)
    };
  
    map = new google.maps.Map(document.getElementById('map-canvas'),mapOptions);
  }

  //
  function getNeighborhoodInformation(locationDetail) {
    var lat   = locationDetail.geometry.location.lat();
    var longt = locationDetail.geometry.location.lng();
    var name  = locationDetail.name;
    
    newLocation = new google.maps.LatLng(lat, longt);
    map.setCenter(newLocation);
    console.log("Lat and long for  " + name + " : " + lat + "**" + longt);

    foursquareUri = "https://api.foursquare.com/v2/venues/explore?ll=";
    baseLocation = lat + ", " + longt;
    extraParams = "&limit=15&section=topPicks&day=any&time=any&locale=en&oauth_token=5WJZ5GSQURT4YEG251H42KKKOWUNQXS5EORP2HGGVO4B14AB&v=20141121";
    foursquareQueryUri = foursquareUri + baseLocation + extraParams;
    $.getJSON(foursquareQueryUri, function(data) {
      self.topPicks(data.response.groups[0].items);
      for (var i in self.topPicks()) {
        console.log("FS API return : " + self.topPicks()[i].venue.name + 
                                         self.topPicks()[i].venue.location.lat);
         var posi = new google.maps.LatLng(self.topPicks()[i].venue.location.lat, 
                                               self.topPicks()[i].venue.location.lng);
         createMarker(posi);
      }
    });

  }

  // this is the callback function from calling the Place Service
  function neighborhoodCallback(location, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      getNeighborhoodInformation(location[0]);
      console.log("value of location:" + location[0]);
    } else {
      console.log("Invalid location, not found in Google Maps");
    }
  }

  function createMarker(posi) {
    var marker = new google.maps.Marker({
      map: map,
      position: posi
    })
  }

  // get neighborhood location data using Google Map Place Service
  function requestNeighborhood(neighborhood) {
    var searchLocation = {
      query: neighborhood
    };
    service = new google.maps.places.PlacesService(map);
    service.textSearch(searchLocation, neighborhoodCallback);
  }

}

// initiate KO framework

$(function() {
  ko.applyBindings(new viewModel());
});
