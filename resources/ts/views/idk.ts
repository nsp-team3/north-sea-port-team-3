import * as L from "leaflet";

let windmolens = require('../../northSeaPortGeoJson/windmolens_northsp.json');
let kaainrs = require('../../northSeaPortGeoJson/kaainrs_northsp_be.json');
let kaarverdeling = require('../../northSeaPortGeoJson/kaaiverdeling_northsp_be.json');
let kaaimuren = require('../../northSeaPortGeoJson/kaaimuren_northsp.json');
let haven_dokken = require('../../northSeaPortGeoJson/haven_dokken_northsp.json');
let fietspaden = require('../../northSeaPortGeoJson/fietspaden_northsp.json');
let spooras = require('../../northSeaPortGeoJson/spooras_northsp.json');
let wegen = require('../../northSeaPortGeoJson/wegen_northsp.json');

const { arcgisToGeoJSON } = require('@esri/arcgis-to-geojson-utils');

export class Ligplaats {
    public fietspadenLayer = L.geoJSON(arcgisToGeoJSON(fietspaden));

    public haven_dokkenLayer = L.geoJSON(arcgisToGeoJSON(haven_dokken));
    public kaaimurenLayer = L.geoJSON(arcgisToGeoJSON(kaaimuren));
    public kaainrsLayer = L.geoJSON(arcgisToGeoJSON(kaainrs), {
        onEachFeature: (feature, layer) => {
            if (layer instanceof L.Marker) {
                layer.setIcon(new L.DivIcon({
                    html: feature.properties.kaainummer,
                    iconSize: [0, 0]
                }));
            }
        }
    });
    public kaarverdelingLayer = L.geoJSON(arcgisToGeoJSON(kaarverdeling));

    public spoorasLayer = L.geoJSON(arcgisToGeoJSON(spooras));

    public wegenLayer = L.geoJSON(arcgisToGeoJSON(wegen));
    public windmolensLayer = L.geoJSON(arcgisToGeoJSON(windmolens), {
        onEachFeature: (feature, layer) => {
            if (layer instanceof L.Marker) {
                layer.setIcon(L.icon({
                    iconUrl: '/icons/windmill.png',
                    iconSize: [28, 28],
                    iconAnchor: [14, 28]
                }));
            }
        }
    });
}
