const { DeckGL, GeoJsonLayer } = deck;

const MAPBOX_TOKEN = 'pk.eyJ1Ijoia29ieW1vcmVubyIsImEiOiJja2tqd3NmYmswOWc5Mm5tbm92aHk4bzZrIn0.reIvwUnQYc9gCW4IClg1ww';

const fillSlider = document.getElementById("fill-slider");
let sliderVal = 5;

let controlBtn = document.getElementById("control-panel-btn");
let controlPanel = document.getElementById("control-panel");
let panelState = false;

let maxLandArea = -Infinity;

let sliders = document.querySelectorAll('.slider');

sliders.forEach((slider, i) => {
    let tickContainer = slider.parentElement.querySelector('.tick-container');
    let tickNums = slider.max;
    for (let j = 0; j < tickNums; j++) {
        const tick = document.createElement('template');
        tick.innerHTML = '<div class="h-[8px] w-[20px] flex justify-center"><div class="bg-gray-300 w-[1.5px] h-[100%]"></div></div>';
        tickContainer.appendChild(tick.content);
    }
});

controlBtn.addEventListener("click", function () {
    if (panelState == false) {
        controlPanel.style.top = "50vh";
        panelState = true;
    } else {
        controlPanel.style.top = "80vh";
        panelState = false;
    }
});

function loadParcelData() {
    return fetch('./extentSmall.json')
        .then(response => response.json())
        .then(parcelData => {
            // Loop through each feature in the JSON data
            parcelData.features.forEach((data) => {
                // Convert the Parcles_CSV_LandArea property to a number
                const landArea = parseFloat(data.properties.Parcles_CSV_LandArea);

                // Check if the current land area is greater than the maxLandArea
                if (landArea > maxLandArea) {
                    maxLandArea = landArea;
                }
            });

            let opacityScale = d3.scaleLinear([0, maxLandArea], [(25 * sliderVal), 255]);

            // Output the highest value of Parcles_CSV_LandArea
            console.log('Highest Parcles_CSV_LandArea:', maxLandArea);

            function fillColor(d) {
                let opacity = 0;

                if (d.properties.Parcles_CS === "TRUE") {
                    //opacity = 255;

                    opacity = opacityScale(d.properties.Parcles_CSV_LandArea);
                }

                return [0, 120, 62, opacity];
            }

            function createGeoJsonLayer() {
                return new deck.GeoJsonLayer({
                    id: 'geojson-layer',
                    data: parcelData,
                    getFillColor: d => fillColor(d),
                    getLineColor: [255, 255, 255],
                    getLineWidth: 1,
                    lineWidthMinPixels: 1,
                    pickable: true,
                    updateTriggers: {
                        getFillColor: d => fillColor(d)
                    }
                });
            }

            const deckOverlay = new deck.DeckGL({
                mapboxApiAccessToken: MAPBOX_TOKEN,
                mapStyle: 'mapbox://styles/mapbox/light-v9',
                initialViewState: {
                    longitude: -90.223526,
                    latitude: 38.649401,
                    zoom: 15
                },
                controller: true,
                layers: [createGeoJsonLayer()]
            });

            fillSlider.addEventListener("input", function () {
                sliderVal = fillSlider.value;
                opacityScale = d3.scaleLinear([0, maxLandArea], [(25 * sliderVal), 255]);

                // Update the layer with the new fill color
                deckOverlay.setProps({
                    layers: [createGeoJsonLayer()]
                });
            });

        });
}

loadParcelData().catch(error => console.error('Error loading parcel data:', error));