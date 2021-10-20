/// <reference path="../../node_modules/@types/leaflet/index.d.ts" />
import * as L from "leaflet";
/// <reference path="../../node_modules/leaflet-sidebar-v2/index.d.ts" />
import 'leaflet-sidebar-v2';
/// <reference path="../types/leaflet_velocity.ts" />
import 'leaflet-velocity-ts-scoped';

import { Bedrijven } from "./views/bedrijven";
import { Ligplaats } from "./views/ligplaats";
const { arcgisToGeoJSON } = require('@esri/arcgis-to-geojson-utils');
let windmolens = require('../northSeaPortGeoJson/windmolens_northsp.json');
let steigers = require('../northSeaPortGeoJson/steigers_northsp.json');
let kaainrs = require('../northSeaPortGeoJson/kaainrs_northsp_be.json');
let kaarverdeling = require('../northSeaPortGeoJson/kaaiverdeling_northsp_be.json');
let kaaimuren = require('../northSeaPortGeoJson/kaaimuren_northsp.json');
let haven_dokken = require('../northSeaPortGeoJson/haven_dokken_northsp.json');
let scheepvaartsignalisatie = require('../northSeaPortGeoJson/scheepvaartsignalisatie_northsp.json');
let fietspaden = require('../northSeaPortGeoJson/fietspaden_northsp.json');
let gebouwen = require('../northSeaPortGeoJson/gebouwen_fm_northsp.json');
let spooras = require('../northSeaPortGeoJson/spooras_northsp.json');
let wegen = require('../northSeaPortGeoJson/wegen_northsp.json');

let main = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
})

// var Thunderforest_Transport = L.tileLayer('https://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=db5ae1f5778a448ca662554581f283c5', {
//     attribution: '&copy; <a href="http://www.thunderforest.com/%22%3EThunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright%22%3EOpenStreetMap</a> contributors',
//     maxZoom: 22
// });
// var Thunderforest_TransportDark = L.tileLayer('https://{s}.tile.thunderforest.com/transport-dark/{z}/{x}/{y}.png?apikey=db5ae1f5778a448ca662554581f283c5', {
//     attribution: '&copy; <a href="http://www.thunderforest.com/%22%3EThunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright%22%3EOpenStreetMap</a> contributors',
//     maxZoom: 22
// });

var OpenSeaMap = L.tileLayer('https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png', {
	attribution: 'Map data: &copy; <a href="http://www.openseamap.org">OpenSeaMap</a> contributors'
});

let map: L.Map = L.map('map', {
    center: { lat: 51.2797429555907, lng: 3.7477111816406254 },
    zoom: 11,
    layers: [main]
});
L.control.scale().addTo(map);

function onEachFeature(feature: any, layer: L.Layer) {
    var popupContent = `<table>
        <tr>
          <th>Bedrijf</th>
          <th>Haven</th>
        </tr>
        <tr>
          <td>${feature.properties.bedrijf}</td>
          <td>${feature.properties.havenNummer}</td>
        </tr>
    </table>`;
    layer.bindPopup(popupContent);
}


// const request = new Request('http://10.0.0.20:7000/latest', {
//     method: 'GET',
// });

// request.json().then(function(data) {
//     let tes = L.velocityLayer({

//     	displayValues: true,
//     	displayOptions: {
//     		velocityType: 'Global Wind',
//     		position: 'bottomleft',//REQUIRED !
//     		emptyString: 'No velocity data',//REQUIRED !
//     		angleConvention: 'bearingCW',//REQUIRED !
//     		displayPosition: 'bottomleft',
//     		displayEmptyString: 'No velocity data',
//     		speedUnit: 'm/s'
//     	},
//     	data: data,            // see demo/*.json, or wind-js-server for example data service

//     	// OPTIONAL
//     	/*minVelocity: 0,      // used to align color scale
//     	maxVelocity: 10,       // used to align color scale*/
//     	velocityScale: 0.005,  // modifier for particle animations, arbitrarily defaults to 0.005
//     	colorScale: []         // define your own array of hex/rgb colors
//     }).addTo(map);
// });



let fietspadenLayer = L.geoJSON(arcgisToGeoJSON(fietspaden));
let gebouwenLayer = L.geoJSON(arcgisToGeoJSON(gebouwen));
let haven_dokkenLayer = L.geoJSON(arcgisToGeoJSON(haven_dokken));
let kaaimurenLayer = L.geoJSON(arcgisToGeoJSON(kaaimuren));
let kaainrsLayer = L.geoJSON(arcgisToGeoJSON(kaainrs), {
    onEachFeature: (feature, layer) => {
        if (layer instanceof L.Marker) {
            layer.setIcon(new L.DivIcon({
                    html: feature.properties.kaainummer,
                    iconSize: [0, 0]
            }))
        }
    }
});
let kaarverdelingLayer = L.geoJSON(arcgisToGeoJSON(kaarverdeling));

let scheepvaartsignalisatieLayer = L.geoJSON(arcgisToGeoJSON(scheepvaartsignalisatie));
let spoorasLayer = L.geoJSON(arcgisToGeoJSON(spooras));
let steigersLayer = L.geoJSON(arcgisToGeoJSON(steigers));
let wegenLayer = L.geoJSON(arcgisToGeoJSON(wegen));
let windmolensLayer = L.geoJSON(arcgisToGeoJSON(windmolens), {
    onEachFeature: (feature, layer) => {
        if (layer instanceof L.Marker) {
            layer.setIcon(L.icon({
                iconUrl: '/icons/windmill.png',
                iconSize: [28, 28],
                iconAnchor: [14, 28]
            }))
          }
    }
});

let ligplaats = new Ligplaats
let bedrijven = new Bedrijven

// let baseMaps = {
//     "Default": main,
//     "Licht": Thunderforest_Transport,
//     "Donker": Thunderforest_TransportDark
// }
let overlays = {
    "Bedrijven": bedrijven.bedrijvenGroup,
    "Ligplaatsen": ligplaats.ligplaatsenLayer,
    "Windmolens": windmolensLayer,
    "Steigers": steigersLayer,
    "Kaai nummers": kaainrsLayer,
    "Kaaiverdeling": kaarverdelingLayer,
    "Kaaimuren": kaaimurenLayer,
    "Haven en dokken": haven_dokkenLayer,
    "Signalatie": scheepvaartsignalisatieLayer,
    "Fietspaden": fietspadenLayer,
    "Gebouwen": gebouwenLayer,
    "Spoor as": spoorasLayer,
    "Wegen": wegenLayer,
    "Open sea maps": OpenSeaMap
};

L.control.layers(overlays, {}, {
    sortLayers: true
}).addTo(map);


let sidebar = L.control.sidebar({
    autopan: false,       // whether to maintain the centered map point when opening the sidebar
    closeButton: true,    // whether t add a close button to the panes
    container: 'sidebar', // the DOM container or #ID of a predefined sidebar container that should be used
    position: 'right',     // left or right
}).addTo(map)
    .open('home');

function onMapClick() {
    console.log(map.getCenter());
    console.log(map.getZoom());
    console.log(map.getBounds());
}

map.on('click', onMapClick);

map.on('zoomend', () => {
    ligplaats.checkZoom(map)
    bedrijven.checkZoom(map)
})

map.on('baselayerchange', () => {
    ligplaats.checkLayer(map)
    bedrijven.checkLayer(map)
})


map.on('overlayadd', e => {
    console.log(e)
})
