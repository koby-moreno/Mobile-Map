const { DeckGL, GeoJsonLayer } = deck;

const MAPBOX_TOKEN = 'pk.eyJ1Ijoia29ieW1vcmVubyIsImEiOiJja2tqd3NmYmswOWc5Mm5tbm92aHk4bzZrIn0.reIvwUnQYc9gCW4IClg1ww';


const fillSliderMin = document.querySelector(".fill-slider-min");
const fillSliderMax = document.querySelector(".fill-slider-max");
const fillSliderTrack = document.querySelector(".fill-slider-track")
let fillSliderMinVal = fillSliderMin.value;
let fillSliderMaxVal = fillSliderMax.value;

const densitySliderMin = document.querySelector(".density-slider-min");
const densitySliderMax = document.querySelector(".density-slider-max");
const densitySliderTrack = document.querySelector(".density-slider-track")
let densitySliderMinVal = densitySliderMin.value;
let densitySliderMaxVal = densitySliderMax.value;

function updateSlider(sliderMin, sliderMax, sliderTrack) {
    const minVal = parseInt(sliderMin.value);
    const maxVal = parseInt(sliderMax.value);

    // Ensure the minimum handle does not surpass the maximum handle
    if (minVal >= maxVal - 1) {
        sliderMin.value = maxVal - 1;
    }

    // Ensure the maximum handle does not go below the minimum handle
    if (maxVal <= minVal + 1) {
        sliderMax.value = minVal + 1;
    }

    // Update the track background to represent the range
    const percentageMin = (sliderMin.value - sliderMin.min) / (sliderMin.max - sliderMin.min) * 100;
    const percentageMax = (sliderMax.value - sliderMax.min) / (sliderMax.max - sliderMax.min) * 100;

    sliderTrack.style.background = `linear-gradient(to right, #E5E7EB ${percentageMin}%, #9CA3AF ${percentageMin}%, #9CA3AF ${percentageMax}%, #E5E7EB ${percentageMax}%)`;

}


updateSlider(fillSliderMin, fillSliderMax, fillSliderTrack);

densitySliderMin.addEventListener('input', () => updateSlider(densitySliderMin, densitySliderMax, densitySliderTrack));
densitySliderMax.addEventListener('input', () => updateSlider(densitySliderMin, densitySliderMax, densitySliderTrack));

updateSlider(densitySliderMin, densitySliderMax, densitySliderTrack);






const fillSlider = document.getElementById("fill-slider");

const iconSlider = document.getElementById("size-slider");

let controlBtn = document.getElementById("control-panel-btn");
let controlPanel = document.getElementById("control-panel");
let panelState = false;
let opacityScaleCont = document.getElementById("opacity-scale-cont");
let densityChartCont = document.getElementById("density-chart-cont");


let maxLandArea = -Infinity;
let histogram_scale = d3.scaleSqrt([0, maxLandArea], [0, 17]);

let landAreas = [];
let buckets = [];

const setBarOpacity = function(value1, value2) {
    let densityBars = document.querySelectorAll(".density-bar");
    densityBars.forEach((bar, i) => {
        if (i >= value1 && i <= value2){
            bar.style.opacity = 1;
        }
        else {
            bar.style.opacity = 0.2;
        }
    });
};

const iconSize = function(d) {
    let iconSize = 16 + 8 * iconSlider.value;
    return iconSize;
};

const iconFill = function(d) {
    let bucketVal = Math.round(histogram_scale(d.properties.Parcles_CSV_LandArea));
    let opacity = 0;
    if (d.properties.Parcles_CS === "TRUE" && bucketVal >= densitySliderMinVal && bucketVal <= densitySliderMaxVal) {
        opacity = 255;
    }
    return [0, 56, 29, opacity];
};

let pinSizeCont = document.querySelector('#pin-size-container');
for (let i = 0; i < 6; i++){
    const pin = document.createElement('template');
    pin.innerHTML = `<div class="w-[18px] h-[24px] flex justify-center items-center"><span class="material-symbols-outlined text-green" style="font-size: ${8 * ((i+3)/3)}px;" >location_on</span></div>`
    pinSizeCont.appendChild(pin.content);
}



let sliderContainers = document.querySelectorAll('.slidecontainer');

sliderContainers.forEach((sliderContainer, i) => {
    let tickContainer = sliderContainer.querySelector('.tick-container');
    let tickNums = sliderContainer.dataset.value;
    for (let j = 0; j <= tickNums; j++) {
        const tick = document.createElement('template');
        tick.innerHTML = '<div class="h-[8px] w-[18px] flex justify-center"><div class="bg-gray-300 w-[1.5px] h-[100%]"></div></div>';
        tickContainer.appendChild(tick.content);
    }
});

controlBtn.addEventListener("click", function () {
    controlPanel.style.top = panelState ? "85vh" : "40vh";
    panelState = !panelState;
});

function loadParcelData() {
    return fetch('./extentSmall.json')
        .then(response => response.json())
        .then(parcelData => {

            // Loop through each feature in the JSON data
            parcelData.features.forEach((data) => {
                // Convert the Parcles_CSV_LandArea property to a number
                const landArea = parseFloat(data.properties.Parcles_CSV_LandArea);
                if (data.properties.Parcles_CS === "TRUE"){
                landAreas.push(landArea);
                }

                // Check if the current land area is greater than the maxLandArea
                // if (landArea > maxLandArea) {
                //     maxLandArea = landArea;
                // }

            });

            maxLandArea = d3.max(landAreas);
            let opacityScale = d3.scalePow([0, maxLandArea], [(25.5 * fillSliderMinVal), (25.5 * fillSliderMaxVal)]).exponent(0.75);
            histogram_scale = d3.scaleSqrt([0, maxLandArea], [0, 17]);
      

            for (let b = 0; b <= 17; b++){
                buckets.push([]);
            }
            
        

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
                let yScale = d3.scalePow([0, 1423], [0, 24]).exponent(0.35);
                let num = yScale(count);
                bar.innerHTML = `<div class="grow bg-green density-bar" style="height: ${num}px;" id="bar-${i}"></div>`;
                densityChartCont.appendChild(bar.content);
            });

            setBarOpacity(densitySliderMinVal, densitySliderMaxVal);

            // Output the highest value of Parcles_CSV_LandArea
            console.log('Highest Parcles_CSV_LandArea:', maxLandArea);

            function fillColor(d) {
                let opacity = 0;
                if (d.properties.Parcles_CS === "TRUE") {

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

            function createIconLayer() {
            return new deck.IconLayer({
                id: 'IconLayer',
                data: parcelData.features,
                getColor: d => iconFill(d),
                getIcon: d => 'marker',
                getPosition: d => [Number(d.properties.centroid_xcoord), Number(d.properties.centroid_ycoord)],
                getSize: d => iconSize(d),
                iconAtlas: './pin_outlined.png',
                iconMapping: './pin.json',
                pickable: true,
                updateTriggers: {
                    getSize: d => iconSize(d),
                    getColor: d => iconFill(d)
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
                layers: [createGeoJsonLayer(), createIconLayer()]
            });

            fillSliderMin.addEventListener("input", function () {
                updateSlider(fillSliderMin, fillSliderMax, fillSliderTrack);
                fillSliderMinVal = fillSliderMin.value;
                opacityScale = d3.scalePow([0, maxLandArea], [(25.5 * fillSliderMinVal), (25.5 * fillSliderMaxVal)]).exponent(0.75);
                deckOverlay.setProps({
                    layers: [createGeoJsonLayer(), createIconLayer()]
                });
            });

            fillSliderMax.addEventListener("input", function () {
                updateSlider(fillSliderMin, fillSliderMax, fillSliderTrack);
                fillSliderMaxVal = fillSliderMax.value;
                opacityScale = d3.scalePow([0, maxLandArea], [(25.5 * fillSliderMinVal), (25.5 * fillSliderMaxVal)]).exponent(0.75);
                deckOverlay.setProps({
                    layers: [createGeoJsonLayer(), createIconLayer()]
                });
            });

            iconSlider.addEventListener("input", function () {

                // Update the layer with the new fill color
                deckOverlay.setProps({
                    layers: [createGeoJsonLayer(), createIconLayer()]
                });
            });

            densitySliderMin.addEventListener("input", function () {
                densitySliderMinVal = densitySliderMin.value;
                console.log(densitySliderMinVal)
                setBarOpacity(densitySliderMinVal, densitySliderMaxVal);

                deckOverlay.setProps({
                    layers: [createGeoJsonLayer(), createIconLayer()]
                });
            });

            densitySliderMax.addEventListener("input", function () {
                densitySliderMaxVal = densitySliderMax.value;
                console.log(densitySliderMaxVal)

                setBarOpacity(densitySliderMinVal, densitySliderMaxVal);
                deckOverlay.setProps({
                    layers: [createGeoJsonLayer(), createIconLayer()]
                });
            });

        });
}

loadParcelData().catch(error => console.error('Error loading parcel data:', error));