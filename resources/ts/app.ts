/// <reference path="../../node_modules/@types/leaflet/index.d.ts" />
/// <reference path="./types/leaflet_velocity.ts" />
/// <reference path="./types/leaflet_mouse_position.ts" />
/// <reference path="./types/smooth_wheel_zoom.ts" />
import * as L from "leaflet";
import 'leaflet-sidebar-v2';
import 'leaflet-velocity';
import 'leaflet-mouse-position';
import "./libs/smoothWheelZoom";

import { ShipInfo } from "./info/shipinfo";
import { Bedrijven } from "./views/bedrijven";
import { Ligplaats } from "./views/ligplaats";
import { Windsnelheid } from "./views/windsnelheid";
import AIS from "./api/AIS";
import VesselType from "./types/enums/VesselType";
import VesselStatus from "./types/enums/VesselStatus";

const { arcgisToGeoJSON } = require('@esri/arcgis-to-geojson-utils');
let scheepvaartsignalisatie = require('../northSeaPortGeoJson/scheepvaartsignalisatie_northsp.json');

(async() => {


    let bedrijven = new Bedrijven;
    let windsnelheid = new Windsnelheid;
    let shipinfo = new ShipInfo();

    let main = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    var OpenSeaMap = L.tileLayer('https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="http://www.openseamap.org">OpenSeaMap</a> contributors'
    });

    let diepteLayer = L.tileLayer.wms('https://geo.rijkswaterstaat.nl/services/ogc/gdr/bodemhoogte_zeeland/ows', {
        layers: 'bodemhoogte_zeeland',
        format: 'image/png',
        transparent: true,
        attribution: "Bodemdiepte Zeeland (actueel). https://maps.rijkswaterstaat.nl/dataregister-publicatie/srv/api/records/e0422848-ca9c-443e-b674-16a295bcff23"
    });

    let map: L.Map = L.map('map', {
        center: { lat: 51.2797429555907, lng: 3.7477111816406254 },
        // maxBounds: [[52.45600939264076, 8.322143554687502], [50.085344397538876, -2.2247314453125004]],
        zoom: 8,
        // minZoom: 8,
        layers: [main, shipinfo.circle],
        scrollWheelZoom: false, // disable original zoom function
        smoothWheelZoom: true,  // enable smooth zoom
        smoothSensitivity: 1,   // zoom speed. default is 1
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

    await windsnelheid.getWindInfo()
    await shipinfo.enableSearch(map);
    await shipinfo.getLocations(map);
    await shipinfo.enableBackButton();


    let sidebar = L.control.sidebar({
        autopan: false,       // whether to maintain the centered map point when opening the sidebar
        closeButton: true,    // whether t add a close button to the panes
        container: 'sidebar', // the DOM container or #ID of a predefined sidebar container that should be used
        position: 'right',     // left or right
    }).addTo(map)
        .open('home');

    let ligplaats = new Ligplaats(sidebar);
    // await ligplaats.enableSearch(map);
    await ligplaats.enableBackButton();


    let optionalOverlays = {
        "Bedrijven": bedrijven.bedrijvenGroup,
        "Ligplaatsen": ligplaats.main,
        "Signalatie": scheepvaartsignalisatieLayer,
        "Windsnelheid": windsnelheid.main,
        "Ship info": shipinfo.main,
        "Open sea maps": OpenSeaMap,
        "Diepte Water": diepteLayer
    };

    L.control.layers({}, optionalOverlays, {
        sortLayers: true
    }).addTo(map);

    function onMapClick() {
        console.log(map.getCenter());
        console.log(map.getZoom());
        console.log(map.getBounds());
        // let test = shipinfo.main.getLayer(244690791);
        // var popupContent = `I am here!`;
        // test.bindPopup(popupContent);
        // test.openPopup()
    }

    map.on('click', onMapClick);

    map.on('zoomend', async () => {
        ligplaats.checkZoom(map);
        bedrijven.checkZoom(map);
        await shipinfo.getLocations(map);
    });

    map.on('dragend', async () => {
        await shipinfo.getLocations(map);
    });

    map.on('overlayremove', () => {
        ligplaats.checkLayer(map);
        bedrijven.checkLayer(map);
    });

    map.on('overlayadd', () => {
        ligplaats.checkLayer(map);
        bedrijven.checkLayer(map);
    });

    window.addEventListener("keypress", async (e) => {
        if (e.key === "e") {
            const test = await AIS.filterVessels(map, {
                // includePorts: true,
                // destination: "vlissingen",
                currentPortId: 1145,
                // originPortId: 166,
                // destinationPortId: 1236
            });
            console.log(test);
        }
    });
})();
