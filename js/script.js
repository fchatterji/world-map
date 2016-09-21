"use strict";

var map;

// Create a new blank array for all the listing markers.
var markers = [];

// Create a single global infowindow, to have only one infowindow one the map at all times.
var infowindow;

// These are the locations that will be shown to the user.
var locations = [
    { title: 'France', location: { lat: 48.854763, lng: 2.347256 } },
    { title: 'USA', location: { lat: 38.897208, lng: -77.036515 } },
    { title: 'Mexico', location: { lat: 19.431165, lng: -99.133518 } },
    { title: 'Brazil', location: { lat: -15.794854, lng: -47.879021 } },
    { title: 'Colombia', location: { lat: 4.654406, lng: -74.091543 } },
    { title: 'Peru', location: { lat: -12.049456, lng: -77.042619 } }
];

function googleError() {
    $( ".row" ).html("Sorry, there was a problem when loading google maps. Please try again later.");
}

function initMap() {
    // Constructor creates a new map - only center and zoom are required.

    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 40.7413549, lng: -73.9980244 },
        zoom: 13,
        mapTypeControl: false
    });

    initInfoWindow();
    initMarkers();

    // initialize ko bindings after map and markers are initialized.
    ko.applyBindings(new MarkersViewModel());
}


function initInfoWindow() {
    infowindow = new google.maps.InfoWindow();
}


function initMarkers() {
    // Initialize all markers and add event listener

    var bounds = new google.maps.LatLngBounds();

    // The following group uses the location array to create an array of markers on initialize.
    locations.forEach(function(location) {

        var position = location.location;
        var title = location.title;

        // Create a marker per location, and put into markers array.
        var marker = new google.maps.Marker({
            map: map,
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
            content: ""
        });

        // Get external API data and add it to the marker
        getWikipediaArticles(marker);

        // Push the marker to our array of markers.
        markers.push(marker);

        // Create an onclick event to open an infowindow at each marker.
        marker.addListener('click', function() {
            createInfoWindow(this);
            toggleBounce(this);
        });

        // Extend the boundaries of the map for each marker
        bounds.extend(marker.position);
    });

    map.fitBounds(bounds);

}


function createInfoWindow(marker) {
    // This function populates the infowindow when the marker is clicked

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


function toggleBounce(marker) {
    // This function makes the marker bounce when it is clicked
    if (marker.getAnimation() !== null) {
        marker.setAnimation(null);
    } else {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() { marker.setAnimation(null); }, 700);
    }
}


function MarkersViewModel() {
    // Knockout view model
    var self = this;

    self.markers = ko.observableArray(markers);

    self.filter = ko.observable("");
    
    self.filteredMarkers = ko.computed(function() {
        // Filter the  array of markers

        var result = [];
        markers = self.markers();

        // if there is no filter, return all the markers and show them on the map
        if (self.filter() === "") {
            markers.forEach(function(marker) {
                result.push(marker);
                marker.setMap(map);

            });

            return result;
        }

        // if there is a filter, filter the markers and show them on the map
        else {
            markers.forEach(function(marker) {

                var title = marker.title.toLowerCase();
                var filter = self.filter().toLowerCase();

                if (title.indexOf(filter) !== -1) {
                    result.push(marker);
                    marker.setMap(map);
                } else {
                    marker.setMap(null);
                }
            });

            return result;
        }
    });

    self.itemIsClicked = function(item) {

        var marker = jQuery.grep(self.markers(), function(marker) {
            return marker.title === item.title;
        });

        marker = marker[0];

        createInfoWindow(marker);
        toggleBounce(marker);
    };
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
        });

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
