var map;
var gmarkers = [];
var amountOfMarkers;
var locationNameLength = [];
		
function initialize() {

	$.ajax({
		type: "GET",
		url: "addresses.json",
		dataType: "json"
	})
	.done(function( data, textStatus, jqXHR ) {
		var locationData = data;
		var centerLocation = new google.maps.LatLng(locationData[0].Lat, locationData[0].Lng);
		var mapOptions = {
			center: centerLocation,
			zoom: 6
		};
		map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);			
		var openInfoWindows = [];
		var longitudeArray = [];
		var sideBarHtml = "";
		amountOfMarkers = locationData.length;

		for (i=0;i<amountOfMarkers;i++) {
						
			(function( locationData ) {		
				//draws markers and map
				var markerText = "<strong>" + locationData.LocationName + "</strong><br />" + locationData.Address;
				var infoWindow = new google.maps.InfoWindow({
					content: markerText
				});
				var myLatLng = new google.maps.LatLng(locationData.Lat, locationData.Lng);
				var marker = new google.maps.Marker({
					position: myLatLng,
					map: map,
					title: locationData.LocationName
				});
				marker.setMap(map);	
				gmarkers.push(marker);	
				
				//add location info into side bar
				sideBarHtml += '<a href="javascript:myclick(' + (i) + ')">' + locationData.LocationName + '<\/a>';
				
				//opens info window on marker click					
				google.maps.event.addListener(marker, 'click', function() {
					// Close any currently opened InfoWindows
					if ( openInfoWindows.length > 0 ) {
						$.each( openInfoWindows, function(index, openInfoWindow) {
							if ( infoWindow.content !== openInfoWindow.content ) {
								openInfoWindow.close();
							}
							else if ( infoWindow.title === openInfoWindow.title ) { return; }
						});
					}
					infoWindow.open(map,this);
					openInfoWindows.push( infoWindow );	
				});	
									
				longitudeArray.push(locationData.Lng);
				locationNameLength.push(locationData.LocationName.length);
				
									
			}( locationData[i] ) );		
		}		
		
		//adds links to sidebar
		$("#side-bar .locations").append(sideBarHtml);
	
		//resizes map to get all markers on the map
		var mostEastLocation = longitudeArray.indexOf(Math.max.apply(Math, longitudeArray));
		var mostWestLocation = longitudeArray.indexOf(Math.min.apply(Math, longitudeArray));
		var mostEastLatLng = new google.maps.LatLng(locationData[mostEastLocation].Lat, locationData[mostEastLocation].Lng);
		var mostWestLatLng = new google.maps.LatLng(locationData[mostWestLocation].Lat, locationData[mostWestLocation].Lng);
		var bounds = new google.maps.LatLngBounds(mostWestLatLng,mostEastLatLng);
		map.fitBounds(bounds);
		
		//sets height of side bar
		var sideBar = $("#side-bar");
		sideBar.children('.locations').css('height', amountOfMarkers * 25);
		
		//sets width of side bar
		var locationNameWidth = Math.max.apply(Math, locationNameLength);
		sideBar.css('width', locationNameWidth * 8);
		
		//add highlighting on side bar menu
		sideBar.find('.locations a').on('click', function () {
			sideBar.find('.locations a').removeClass('active');
			$(this).addClass('active');
		});
		
		//toggles sidebar
		sideBar.children('.view').on('click', function () {
			var viewLink = $(this);
			viewLink.toggleClass('open');
			sideBar.children('.locations').slideToggle( "normal", function() { });
			if (viewLink.hasClass('open')) {
				viewLink.html('x');
			} else {
				viewLink.hide();
				setTimeout(function() {
					viewLink.show();
					sideBar.find('.locations a').removeClass('active');
      				viewLink.html('View Locations');}, 250);	
			}
		});
		
	})
	.fail(function (  jqXHR, textStatus, errorThrown ) {
		console.info( textStatus );
		console.info( errorThrown );
	});
}

google.maps.event.addDomListener(window, 'load', initialize);

//centers map on browser resize
google.maps.event.addDomListener(window, "resize", function() {
	var center = map.getCenter();
	google.maps.event.trigger(map, "resize");
	map.setCenter(center);  
});

//opens info window from sidebar click
function myclick(i) {
	google.maps.event.trigger(gmarkers[i], "click");
}
