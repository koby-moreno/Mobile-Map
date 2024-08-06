const { DeckGL, GeoJsonLayer } = deck;

const MAPBOX_TOKEN = 'pk.eyJ1Ijoia29ieW1vcmVubyIsImEiOiJja2tqd3NmYmswOWc5Mm5tbm92aHk4bzZrIn0.reIvwUnQYc9gCW4IClg1ww';

const fillSlider = document.getElementById("fill-slider");
let sliderVal = 5;

let controlBtn = document.getElementById("control-panel-btn");
let controlPanel = document.getElementById("control-panel");
let panelState = false;
let opacityScaleCont = document.getElementById("opacity-scale-cont");
let densityChartCont = document.getElementById("density-chart-cont");

let maxLandArea = -Infinity;

let landAreas = [];
let buckets = [];

const setBarOpacity = function(sliderVal) {
    let densityBars = document.querySelectorAll(".density-bar");
    densityBars.forEach((bar, i) => {
        bar.style.opacity = (i <= sliderVal) ? 1 : 0.2;
    });
};

let pinSizeCont = document.querySelector('#pin-size-container');
for (let i = 0; i < 6; i++){
    const pin = document.createElement('template');
    pin.innerHTML = `<div class="w-[18px] h-[24px] flex justify-center items-center"><span class="material-symbols-outlined text-green" style="font-size: ${8 * ((i+3)/3)}px;" >location_on</span></div>`
    pinSizeCont.appendChild(pin.content);
}



let sliders = document.querySelectorAll('.slider');

sliders.forEach((slider, i) => {
    let tickContainer = slider.parentElement.querySelector('.tick-container');
    let tickNums = slider.max;
    for (let j = 0; j <= tickNums; j++) {
        const tick = document.createElement('template');
        tick.innerHTML = '<div class="h-[8px] w-[18px] flex justify-center"><div class="bg-gray-300 w-[1.5px] h-[100%]"></div></div>';
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
                if (landArea > 0 && data.properties.Parcles_CS === "TRUE"){
                landAreas.push(landArea);
                }

                // Check if the current land area is greater than the maxLandArea
                // if (landArea > maxLandArea) {
                //     maxLandArea = landArea;
                // }

            });

            maxLandArea = d3.max(landAreas);
            let opacityScale = d3.scalePow([0, maxLandArea], [(25.5 * sliderVal), 255]).exponent(0.75);
            let histogram_scale = d3.scaleSqrt([0, maxLandArea], [0, 17]);
      

            for (let b = 0; b <= 17; b++){
                buckets.push([]);
            }
            
            console.log(buckets);

            landAreas.forEach((data) => {
                // if (data > maxLandArea/10){
                //     data = maxLandArea/10;
                // }
                let bucketVal = Math.round(histogram_scale(data));
                buckets.forEach((bucket, i) => {
                    if (bucketVal == i){
                        bucket.push(bucketVal)
                    }
                });
            });

            buckets.forEach((bucket, i) => {
                const bar = document.createElement('template');
                let count = bucket.length;
                let yScale = d3.scaleSqrt([0, 106], [0, 24]);
                let num = yScale(count);
                console.log(num);
                bar.innerHTML = `<div class="grow bg-green density-bar" style="height: ${num}px;" id="bar-${i}"></div>`;
                densityChartCont.appendChild(bar.content);
            });

            let densityVal = document.getElementById("density-slider").value;
            setBarOpacity(densityVal);

            // Output the highest value of Parcles_CSV_LandArea
            console.log('Highest Parcles_CSV_LandArea:', maxLandArea);

            function fillColor(d) {
                let opacity = 0;

                if (d.properties.Parcles_CS === "TRUE" && d.properties.Parcles_CSV_LandArea > 0) {
                    //opacity = 255;

                    opacity = opacityScale(d.properties.Parcles_CSV_LandArea);
                }
                else if (d.properties.Parcles_CS === "TRUE") {
                    opacity = 12.5;
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
                opacityScale = d3.scalePow([0, maxLandArea], [(25.5 * sliderVal), 255]).exponent(0.75);

                // Update the layer with the new fill color
                deckOverlay.setProps({
                    layers: [createGeoJsonLayer()]
                });
            });

            document.querySelector('#density-slider').addEventListener("input", function () {
                densityVal = document.querySelector('#density-slider').value;
                setBarOpacity(densityVal);
            });

        });
}

loadParcelData().catch(error => console.error('Error loading parcel data:', error));