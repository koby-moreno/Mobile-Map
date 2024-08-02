

// const {DeckGL, GeoJsonLayer, ArcLayer} = MapboxOverlay;

const {DeckGL, GeoJsonLayer, ArcLayer} = deck;


// import mapboxgl from 'mapbox-gl';
// import 'mapbox-gl/dist/mapbox-gl.css';

// source: Natural Earth http://www.naturalearthdata.com/ via geojson.xyz
const COUNTRIES =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_scale_rank.geojson'; //eslint-disable-line
const AIR_PORTS =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_airports.geojson';

// const INITIAL_VIEW_STATE = {
//   latitude: 51.47,
//   longitude: 0.45,
//   zoom: 4,
//   bearing: 0,
//   pitch: 30
// };

const MAPBOX_TOKEN = 'pk.eyJ1Ijoia29ieW1vcmVubyIsImEiOiJja2tqd3NmYmswOWc5Mm5tbm92aHk4bzZrIn0.reIvwUnQYc9gCW4IClg1ww'

// const map = new mapboxgl.Map({
//   container: 'map',
//   style: 'mapbox://styles/mapbox/light-v9',
//   accessToken: MAPBOX_TOKEN,
//   center: [0.45, 51.47],
//   zoom: 4,
//   bearing: 0,
//   pitch: 30
// });

const deckOverlay = new DeckGL({
    // interleaved: true,
    _pickable: false,
    _typedArrayManagerProps: isMobile ? {overAlloc: 1, poolSize: 0} : null,

    mapboxApiAccessToken: MAPBOX_TOKEN,
    mapStyle: 'mapbox://styles/mapbox/light-v9',
    initialViewState: {
        longitude: -122.45,
        latitude: 37.8,
      zoom: 15
    },
    controller: true,


    layers: [
      new GeoJsonLayer({
        id: 'airports',
        data: AIR_PORTS,
        // Styles
        filled: true,
        pointRadiusMinPixels: 2,
        pointRadiusScale: 2000,
        getPointRadius: f => 11 - f.properties.scalerank,
        getFillColor: [200, 0, 80, 180],
        // Interactive props
        pickable: true,
        autoHighlight: true,
        onClick: info =>
          // eslint-disable-next-line
          info.object && alert(`${info.object.properties.name} (${info.object.properties.abbrev})`)
        // beforeId: 'waterway-label' // In interleaved mode render the layer under map labels
      }),
      new ArcLayer({
        id: 'arcs',
        data: AIR_PORTS,
        dataTransform: d => d.features.filter(f => f.properties.scalerank < 4),
        // Styles
        getSourcePosition: f => [-0.4531566, 51.4709959], // London
        getTargetPosition: f => f.geometry.coordinates,
        getSourceColor: [0, 128, 200],
        getTargetColor: [200, 0, 80],
        getWidth: 1
      })
    ]
  });
  
//   map.addControl(deckOverlay);
//   map.addControl(new mapboxgl.NavigationControl());