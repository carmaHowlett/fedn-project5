

var viewModel = function() {
	var self = this;
  var map;
  var defaultNeighborhood = "Singapore, Singapore";
  var mapMarkers   = [];
  var infowindow;

  self.topPicks         = ko.observableArray([]); 
  self.topPicksFiltered = ko.observableArray(self.topPicks());
  self.neighborhood = ko.observable(defaultNeighborhood); 
  self.filterString = ko.observable('');

  
  initializeMap();

  self.newNeighborhood = ko.computed(function() {
    if (self.neighborhood() != '') {
      requestNeighborhood(self.neighborhood());
    }
  });

  self.clickVenue = function(clickedItem) {
    var clickedVenueName = clickedItem.venue.name;
    for (var i = 0; i < mapMarkers.length; i ++) {
      if (clickedVenueName === mapMarkers[i].title) {
            console.log("I was clicked!!" + clickedVenueName);
            google.maps.event.trigger(mapMarkers[i], 'click');
            map.panTo(mapMarkers[i].position);
            map.setZoom(15);
      }
    }
  };

  self.filterTopPicks = ko.computed(function() {
    var venue;
    var filteredTopPicks = [];
    var filterString     = self.filterString().toLowerCase();

    for (var i in self.topPicks()) {
      venue = self.topPicks()[i].venue;

      if (venue.name.toLowerCase().indexOf(filterString) != -1 ||
          venue.categories[0].name.toLowerCase().indexOf(filterString) != -1) {
        filteredTopPicks.push(self.topPicks()[i]);

        console.log("in listToppicks.." + self.topPicks()[i].venue.name + filterString);

      }
    }

    console.log("Total number of filtered items.." + filteredTopPicks.length);

    self.topPicksFiltered(filteredTopPicks);

  });

  self.filterMarkers = ko.computed(function() {
     displayFilteredMarkers(self.filterString().toLowerCase())
  });

  function displayFilteredMarkers(filterString) {
    for (var j in mapMarkers) {
      if (mapMarkers[j].map === null) {
        mapMarkers[j].setMap(map);
      }

      if (mapMarkers[j].title.toLowerCase().indexOf(filterString) === -1) {
              console.log("hide marker for.." + mapMarkers[j].title + filterString); 
              mapMarkers[j].setMap(null);       
      }

      for (var i in self.topPicksFiltered()) {
        if (mapMarkers[j].title.toLowerCase() === self.topPicksFiltered()[i].venue.name.toLowerCase()) {
          mapMarkers[j].setMap(map);
          console.log("marker:" + mapMarkers[j].title + ">>>" + self.topPicksFiltered()[i].venue.name);
        }
      }
    }
  }

  function initializeMap() {
    var mapOptions = {
      zoom: 14,
      disableDefaultUI: true,
      // center: new google.maps.LatLng(-34.397, 150.644)
    };
  
    map = new google.maps.Map(document.getElementById('map-canvas'),mapOptions);

    google.maps.event.addDomListener(window, "resize", function() {
     var center = map.getCenter();
     google.maps.event.trigger(map, "resize");
     map.setCenter(center); 
    });
    
    infowindow = new google.maps.InfoWindow();
  }

  //
  function getNeighborhoodInformation(locationDetail) {
    var lat   = locationDetail.geometry.location.lat();
    var longt = locationDetail.geometry.location.lng();
    var name  = locationDetail.name;
    
    newLocation = new google.maps.LatLng(lat, longt);
    map.setCenter(newLocation);
    map.setZoom(14);
    console.log("Lat and long for  " + name + " : " + lat + "**" + longt);

    foursquareUri = "https://api.foursquare.com/v2/venues/explore?ll=";
    baseLocation  = lat + ", " + longt;
    extraParams   = "&limit=15&section=topPicks&day=any&time=any&locale=en";
    clientID      = "&client_id=1AMO01APWLHPX1VNICMSOD2VWXQSDRUMFDSVTSTJZITY2ZQE";
    clientSecret  = "&client_secret=XYSEVN4ABIDAWIULKL14TM5GABGQP3EWUOYHOH4XIXSWK2JT&v=YYYYMMDD&v=20141121";
    foursquareQueryUri = foursquareUri + baseLocation + extraParams + clientID + clientSecret;
    $.getJSON(foursquareQueryUri, function(data) {
      self.topPicks(data.response.groups[0].items);
      for (var i in self.topPicks()) {
        console.log("FS API return : " + self.topPicks()[i].venue.name + self.topPicks()[i].tips[0].text + 
                                         self.topPicks()[i].venue.location.lat + "counter = " + i);
        createMarker(self.topPicks()[i].venue,self.topPicks()[i].tips);
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

  function createMarker(venue, tips) {
    var lat = venue.location.lat;
    var lng = venue.location.lng;
    var name = venue.name;
    var category = venue.categories[0].name;
    var address = venue.location.formattedAddress;
    var position = new google.maps.LatLng(lat, lng);
    var tipText = "TIP: " + tips[0].text;

    var marker = new google.maps.Marker({
      map: map,
      position: position,
      title: name
    });

    mapMarkers.push(marker);

    var contentString = '<div class="infowindow"><p><span class="v-name">' + name +
      '</span></p><p class="v-category"><span>' + category +
      '</span></p><p class="v-address"><span>' + tipText;

    google.maps.event.addListener(marker, 'click', function() {
      infowindow.setContent(contentString);
      infowindow.open(map, marker);
    });

    
    console.log("pushed to mapMarkers " + mapMarkers[mapMarkers.length - 1].title);
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
