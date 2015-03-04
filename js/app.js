

var viewModel = function() {
	var self = this;
  var map;
  var defaultNeighborhood = "Singapore, Singapore";

  self.neighborhood = ko.observable(defaultNeighborhood); 

  initializeMap();

  self.newNeighborhood = ko.computed(function() {
    if (self.neighborhood() != '') {
      requestNeighborhood(self.neighborhood());
    }
  });

  function initializeMap() {
    var mapOptions = {
      zoom: 10
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
  }

  // this is the callback function from calling the Place Service
  function neighborhoodCallback(location, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      getNeighborhoodInformation(location[0])
    } else {
      console.log("Invalid location, not found in Google Maps");
    }
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

$(function() {
  ko.applyBindings(new viewModel());
});
