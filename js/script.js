var map;
// Create a new blank array for all the listing markers.
var markers = [];

// These are the real estate listings that will be shown to the user.
// Normally we'd have these in a database instead.
var locations = [
    { title: 'Park Ave Penthouse', location: { lat: 40.7713024, lng: -73.9632393 } },
    { title: 'Chelsea Loft', location: { lat: 40.7444883, lng: -73.9949465 } },
    { title: 'Union Square Open Floor Plan', location: { lat: 40.7347062, lng: -73.9895759 } },
    { title: 'East Village Hip Studio', location: { lat: 40.7281777, lng: -73.984377 } },
    { title: 'TriBeCa Artsy Bachelor Pad', location: { lat: 40.7195264, lng: -74.0089934 } },
    { title: 'Chinatown Homey Space', location: { lat: 40.7180628, lng: -73.9961237 } }
];

function initMap() {
    // Constructor creates a new map - only center and zoom are required.
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 40.7413549, lng: -73.9980244 },
        zoom: 13,
        mapTypeControl: false
    });

    var largeInfowindow = new google.maps.InfoWindow();
    var bounds = new google.maps.LatLngBounds();

    // The following group uses the location array to create an array of markers on initialize.
    for (var i = 0; i < locations.length; i++) {
        // Get the position from the location array.
        var position = locations[i].location;
        var title = locations[i].title;
        // Create a marker per location, and put into markers array.
        var marker = new google.maps.Marker({
            map: map,
            position: position,
            title: title,
            draggable: true,
            animation: google.maps.Animation.DROP,
            id: i
        });
        // Push the marker to our array of markers.
        markers.push(marker);
        // Create an onclick event to open an infowindow at each marker.
        marker.addListener('click', function() {
            populateInfoWindow(this, largeInfowindow);
            toggleBounce(this);
        });
        bounds.extend(markers[i].position);
    }

    // Extend the boundaries of the map for each marker
    map.fitBounds(bounds);

    document.getElementById('show-listings').addEventListener('click', showListings);
    document.getElementById('hide-listings').addEventListener('click', hideListings);

    // initialize ko bindings
    ko.applyBindings(new MarkersViewModel());
}
// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow(marker, infowindow) {
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
        infowindow.marker = marker;
        infowindow.setContent('<div>' + marker.title + '</div>');
        infowindow.open(map, marker);
        // Make sure the marker property is cleared if the infowindow is closed.
        infowindow.addListener('closeclick', function() {
            infowindow.marker = null;
        });
    }
}

// This function makes the marker bounce when it is clicked
function toggleBounce(marker) {
    if (marker.getAnimation() !== null) {
        marker.setAnimation(null);
    } else {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() { marker.setAnimation(null); }, 500);
    }
}

// This function will loop through the markers array and display them all.
function showListings() {
    console.log("show" + markers)
    var bounds = new google.maps.LatLngBounds();
    // Extend the boundaries of the map for each marker and display the marker
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
        bounds.extend(markers[i].position);
    }
    map.fitBounds(bounds);
}
// This function will loop through the listings and hide them all.
function hideListings() {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
}


// Overall viewmodel for this screen, along with initial state
function MarkersViewModel() {
    var self = this;

    // Array of markers
    self.markers = ko.observableArray(markers);

    // Filter
    self.filter = ko.observable();

    // Filter array of markers
    self.filteredMarkers = ko.computed(function() {

        result = [];
        markers = self.markers();

        if (!self.filter()) {
            return markers;
        }

        for (i = 0; i < markers.length; i++) {
            title = markers[i].title.toLowerCase();
            filter = self.filter().toLowerCase();

            if (title.indexOf(filter) !== -1) {
                result.push(markers[i])
                markers[i].setMap(map);
            } else {
                markers[i].setMap(null);
            }
        }

        return result;

    });

}
