

describe("The filteredMarkers function", function() {

    var view_model = new MarkersViewModel();

    var markers = [
        { title: 'Park Ave Penthouse', location: { lat: 40.7713024, lng: -73.9632393 } },
        { title: 'Chelsea Loft', location: { lat: 40.7444883, lng: -73.9949465 } },
        { title: 'Union Square Open Floor Plan', location: { lat: 40.7347062, lng: -73.9895759 } },
        { title: 'East Village Hip Studio', location: { lat: 40.7281777, lng: -73.984377 } },
        { title: 'TriBeCa Artsy Bachelor Pad', location: { lat: 40.7195264, lng: -74.0089934 } },
        { title: 'Chinatown Homey Space', location: { lat: 40.7180628, lng: -73.9961237 } }
    ];


    view_model.markers(markers);

  it("returns the whole array when there is no filter", function() {

    view_model.filter("")
    expect(view_model.filteredMarkers()).toEqual(markers);
  });

  it("returns an empty array if the filter is different from the names", function() {

    view_model.filter("sdfsdjhl")
    expect(view_model.filteredMarkers()).toEqual([]);
  }); 

  it("filters partial matches correctly", function() {

    view_model.filter("Loft")
    expect(view_model.filteredMarkers()).toEqual([
      { title: 'Chelsea Loft', location: { lat: 40.7444883, lng: -73.9949465 } }
    ]);

  });  

  it("is not case sensitive", function() {

    view_model.filter("pad")
    expect(view_model.filteredMarkers()).toEqual([
      { title: 'TriBeCa Artsy Bachelor Pad', location: { lat: 40.7195264, lng: -74.0089934 } }
    ]);

  });  

});
