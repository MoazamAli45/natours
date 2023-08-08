// const locations = document.getElementById('map').dataset.location;
// console.log(locations);
// console.log('Hello from client-side');
// // https://api.mapbox.com/styles/v1/moazam-ali/clkv7ruuy002s01pmgnxnddqo.html?title=view&access_token=pk.eyJ1IjoibW9hemFtLWFsaSIsImEiOiJjbGt2NzhiaG8wZWczM2dwaW9nNm9udnY3In0.aCE5dDX8DkkLekn8QGUAsA&zoomwheel=true&fresh=true#11/40.73/-74

// mapboxgl.accessToken =
//   'pk.eyJ1IjoibW9hemFtLWFsaSIsImEiOiJjbGt2N29xb2UwMjk5M3Bsd2pscXNsNnA4In0.bqe3ZIRD5qgeym0_h6lMGQ';
// const map = new mapboxgl.Map({
//   container: 'map', // container ID
//   style: 'mapbox://styles/mapbox/streets-v12', // style URL
//   center: [-74.5, 40], // starting position [lng, lat]
//   zoom: 9, // starting zoom
// });

/* eslint-disable */

// const locations = document.getElementById('map').dataset.location;
// console.log(locations);
mapboxgl.accessToken =
  'pk.eyJ1IjoibW9hemFtLWFsaSIsImEiOiJjbGt2N29xb2UwMjk5M3Bsd2pscXNsNnA4In0.bqe3ZIRD5qgeym0_h6lMGQ';

var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/jonasschmedtmann/cjvi9q8jd04mi1cpgmg7ev3dy',
  scrollZoom: false,
  // center: [-118.113491, 34.111745],
  // zoom: 10,
  // interactive: false
});

const bounds = new mapboxgl.LngLatBounds();

locations.forEach((loc) => {
  // Create marker
  const el = document.createElement('div');
  el.className = 'marker';

  // Add marker
  new mapboxgl.Marker({
    element: el,
    anchor: 'bottom',
  })
    .setLngLat(loc.coordinates)
    .addTo(map);

  // Add popup
  new mapboxgl.Popup({
    offset: 30,
  })
    .setLngLat(loc.coordinates)
    .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
    .addTo(map);

  // Extend map bounds to include current location
  bounds.extend(loc.coordinates);
});

map.fitBounds(bounds, {
  padding: {
    top: 200,
    bottom: 150,
    left: 100,
    right: 100,
  },
});
