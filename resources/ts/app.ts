/// <reference path="../../node_modules/@types/leaflet/index.d.ts" />
/// <reference path="./types/leaflet_velocity.ts" />
/// <reference path="./types/leaflet_mouse_position.ts" />
import * as L from "leaflet";
import 'leaflet-sidebar-v2';
import 'leaflet-velocity';
import 'leaflet-mouse-position';

import { ShipInfo } from "./shipinfo";
import { Bedrijven } from "./views/bedrijven";
import { Ligplaats } from "./views/ligplaats";
import { Windsnelheid } from "./views/windsnelheid";
const { arcgisToGeoJSON } = require('@esri/arcgis-to-geojson-utils');
let scheepvaartsignalisatie = require('../northSeaPortGeoJson/scheepvaartsignalisatie_northsp.json');

let main = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

var OpenSeaMap = L.tileLayer('https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="http://www.openseamap.org">OpenSeaMap</a> contributors'
});

let map: L.Map = L.map('map', {
    center: { lat: 51.2797429555907, lng: 3.7477111816406254 },
    maxBounds: [[52.45600939264076, 8.322143554687502], [50.085344397538876, -2.2247314453125004]],
    zoom: 8,
    minZoom: 8,
    layers: [main]
});
L.control.scale().addTo(map);
L.control.mousePosition().addTo(map);

let scheepvaartsignalisatieLayer = L.geoJSON(arcgisToGeoJSON(scheepvaartsignalisatie), {
    onEachFeature: (feature, layer) => {
        var popupContent = `<table>
            <tr>
              <th>Omschrijving</th>
              <th>Haven</th>
            </tr>
            <tr>
              <td>${feature.properties.omschrijving}</td>
            </tr>
        </table>`;
        layer.bindPopup(popupContent);
    },
    style: {
        "color": "#ff7800",
        "weight": 0,
        "opacity": 0.65
    }
});

let ligplaats = new Ligplaats;
let bedrijven = new Bedrijven;
let windsnelheid = new Windsnelheid;
let shipinfo = new ShipInfo(map);

let overlays = {
    "Bedrijven": bedrijven.bedrijvenGroup,
    "Ligplaatsen": ligplaats.main,
    "Signalatie": scheepvaartsignalisatieLayer,
};
let optionalOverlays = {
    "Windsnelheid": windsnelheid.main,
    "Ship info": shipinfo.main,
    "Open sea maps": OpenSeaMap
};

L.control.layers(overlays, optionalOverlays, {
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
    let test = shipinfo.main.getLayer(244690791);
    var popupContent = `I am here!`;
    test.bindPopup(popupContent);
    test.openPopup()
}

map.on('click', onMapClick);

map.on('zoomend', () => {
    ligplaats.checkZoom(map);
    bedrijven.checkZoom(map);
    shipinfo.getShipInfo(map);
});

map.on('dragend', () => {
    shipinfo.getShipInfo(map);
})

map.on('baselayerchange', () => {
    ligplaats.checkLayer(map);
    bedrijven.checkLayer(map);
});
