var map;
// Create a new blank array for all the listing markers.
var markers = [];


// These are the locations that will be shown to the user.
var locations = [
    { title: 'France', location: { lat: 48.854763, lng: 2.347256 } },
    { title: 'USA', location: { lat: 38.897208, lng: -77.036515 } },
    { title: 'Mexico', location: { lat: 19.431165, lng: -99.133518 } },
    { title: 'Brazil', location: { lat: -15.794854, lng: -47.879021 } },
    { title: 'Colombia', location: { lat: 4.654406, lng: -74.091543 } },
    { title: 'Peru', location: { lat: -12.049456, lng: -77.042619 } }
];

function initMap() {
    // Constructor creates a new map - only center and zoom are required.
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 40.7413549, lng: -73.9980244 },
        zoom: 13,
        mapTypeControl: false
    });

    initMarkers();

    // initialize ko bindings
    ko.applyBindings(new MarkersViewModel());

}

function initMarkers() {
    // Initialize all markers and add event listener


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
            id: i,
            content: ""
        });
        // Get external API data and add it to the marker
        getWikipediaArticles(marker);

        // Push the marker to our array of markers.
        markers.push(marker);
        // Create an onclick event to open an infowindow at each marker.
        marker.addListener('click', function() {
            creatInfoWindow(this);
            toggleBounce(this);
        });
        bounds.extend(markers[i].position);
    }

    // Extend the boundaries of the map for each marker
    map.fitBounds(bounds);

}
// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function createInfoWindow(marker) {

    var infowindow = new google.maps.InfoWindow();
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
        infowindow.marker = marker;
        infowindow.setContent('<div>' + marker.title + '</div>' + marker.content);
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


// Knockout view model
function MarkersViewModel() {
    var self = this;

    // Array of unfiltered markers
    self.markers = ko.observableArray(markers);

    // Filter
    self.filter = ko.observable();

    // function to filter the  array of markers
    self.filteredMarkers = ko.computed(function() {

        result = [];
        markers = self.markers();

        // if there is no filter, return all the markers and show them on the map
        if (!self.filter()) {
            for (i = 0; i < markers.length; i++) {
                result.push(markers[i])
                markers[i].setMap(map);

            }

            return result;
        }

        // if there is a filter, filter the markers and show them on the map
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

    self.itemIsClicked = function(item) {

        marker = jQuery.grep(self.markers(), function(marker) {
            return marker.title === item.title;
        });

        marker = marker[0];

        createInfoWindow(marker);
    }
}


function getWikipediaArticles(marker) {
    var url = "https://en.wikipedia.org/w/api.php";
    url += '?' + $.param({
        'action': 'opensearch',
        'search': marker.title,
        'format': 'json',
    });

    $.ajax({
            url: url,
            dataType: "jsonp",
            timeout: 3000,
            /* timeout allows error handling, otherwise with 
                       jsonp the fail function would never be called */
        })
        .done(function(articles) {
            marker.content = formatWikipediaArticles(articles);
        })
        .fail(function() {
            marker.content = "The wikipedia data could not be fetched. Please try again later.";
        })

}



function formatWikipediaArticles(articles) {

    var formattedArticles = [];

    $.each(articles[1], function(key, val) {

        formattedArticles.push("<li>" +
            "<a href=\"https://en.wikipedia.org/wiki/" + val + "\">" +
            val +
            "</a>" +
            "</li>");

    });

    formattedArticles = formattedArticles.join("");

    return formattedArticles;
}
