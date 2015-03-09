

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

// self.listToppicks = ko.computed(function() {
//    for (var i in self.topPicks()) {
//      console.log("in listToppicks.." + self.topPicks()[i].venue.name);
//    }
//    self.topPicks();
//  });

  function initializeMap() {
    var mapOptions = {
      zoom: 15,
      disableDefaultUI: true,
      // center: new google.maps.LatLng(-34.397, 150.644)
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
    extraParams = "&limit=15&section=topPicks&day=any&time=any&locale=en&client_id=1AMO01APWLHPX1VNICMSOD2VWXQSDRUMFDSVTSTJZITY2ZQE&client_secret=XYSEVN4ABIDAWIULKL14TM5GABGQP3EWUOYHOH4XIXSWK2JT&v=YYYYMMDD&v=20141121";
    foursquareQueryUri = foursquareUri + baseLocation + extraParams;
    $.getJSON(foursquareQueryUri, function(data) {
      self.topPicks(data.response.groups[0].items);
      for (var i in self.topPicks()) {
        console.log("FS API return : " + self.topPicks()[i].venue.name + 
                                         self.topPicks()[i].venue.location.lat + "counter = " + i);
        createMarker(self.topPicks()[i].venue);
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

  function createMarker(venue) {
    var lat = venue.location.lat;
    var lng = venue.location.lng;
    var name = venue.name;
    var position = new google.maps.LatLng(lat, lng);

    var marker = new google.maps.Marker({
      map: map,
      position: position,
      title: name
    });
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
