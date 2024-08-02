const {DeckGL, GeoJsonLayer} = deck;

const MAPBOX_TOKEN = 'pk.eyJ1Ijoia29ieW1vcmVubyIsImEiOiJja2tqd3NmYmswOWc5Mm5tbm92aHk4bzZrIn0.reIvwUnQYc9gCW4IClg1ww';
const parcelData = 'extentSmall.json';

let fillColor = [160, 140, 0, 100];

function createGeoJsonLayer() {
  return new deck.GeoJsonLayer({
    id: 'geojson-layer',
    data: parcelData,
    getFillColor: d => fillColor,
    getLineColor: [255, 255, 255],
    getLineWidth: 1,
    lineWidthMinPixels: 1,
    pickable: true,
    updateTriggers: {
      getFillColor: fillColor
    }
  });
}

const deckOverlay = new deck.DeckGL({
  mapboxApiAccessToken: MAPBOX_TOKEN,
  mapStyle: 'mapbox://styles/mapbox/light-v9',
  initialViewState: {
    longitude: -90.1994,
    latitude: 38.627003,
    zoom: 15
  },
  controller: true,
  layers: [createGeoJsonLayer()]
});

document.getElementById('control-panel').addEventListener("click", function () {
  console.log("click");
  // Update the fill color
  fillColor = [0, 128, 0, 255]; // New fill color (green)

  // Update the layer with the new fill color
  deckOverlay.setProps({
    layers: [createGeoJsonLayer()]
  });
});
