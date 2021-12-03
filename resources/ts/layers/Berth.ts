import * as L from "leaflet";
import { DisplayBerthInfo } from "../display-info/DisplayInfoExports";
import BerthSearch from "../search/BerthSearch";

let ligplaatsen = require('../../northSeaPortGeoJson/ligplaatsen_northsp.json');
let bolders = require('../../northSeaPortGeoJson/bolders_northsp.json');
let steigers = require('../../northSeaPortGeoJson/steigers_northsp.json');
let reddingsboeien = require('../../northSeaPortGeoJson/reddingsboeien_northsp.json');
let gebouwen = require('../../northSeaPortGeoJson/gebouwen_fm_northsp.json');
const { arcgisToGeoJSON } = require('@esri/arcgis-to-geojson-utils');

export default class Berth {
    private sidebar: L.Control.Sidebar;
    private searchLigplaats: { [id: string]: any } = {};
    private ligplaatsenNummers = L.layerGroup();
    private berthDisplay = new DisplayBerthInfo(
        "main-berth-info",
        "berth-name",
        "berth-info-content",
        "berth-back-button"
    );

    private gebouwenLayer = L.geoJSON(arcgisToGeoJSON(gebouwen), {
        style: {
            "color": "#ff7800",
            "weight": 3,
            "opacity": 0.65
        }
    });
    private steigersLayer = L.geoJSON(arcgisToGeoJSON(steigers), {
        style: {
            "color": "#fd5353",
            "weight": 3,
            "opacity": 0.65
        }
    });
    private boldersLayer = L.geoJSON(arcgisToGeoJSON(bolders), {
        onEachFeature: (feature, layer) => {
            if (layer instanceof L.Marker) {
                layer.setIcon(L.icon({
                    iconUrl: '/icons/bollard.png',
                    iconSize: [18, 18],
                    iconAnchor: [9, 9]
                }))
            }
        }
    });
    private reddingsboeienLayer = L.geoJSON(arcgisToGeoJSON(reddingsboeien), {
        onEachFeature: (feature, layer) => {
            if (layer instanceof L.Marker) {
                layer.setIcon(L.icon({
                    iconUrl: '/icons/lifebuoy.png',
                    iconSize: [20, 20],
                    iconAnchor: [10, 10]
                }))
            }
        }
    });
    private ligplaatsenLayer = L.geoJSON(ligplaatsen, {
        onEachFeature: (feature, layer) => {
            layer.on("click", (event) => {
                this.berthDisplay.show(BerthSearch.convertFeatureToBerth(feature), undefined);
            });

            if (layer instanceof L.Polygon) {
                feature.properties.center = layer.getBounds().getCenter();
                this.searchLigplaats[`${feature.properties.type} ${feature.properties.ligplaatsNr}`] = feature.properties;
                L.marker(feature.properties.center, {
                    icon: L.divIcon({
                        className: 'label',
                        html: feature.properties.ligplaatsNr,
                        iconSize: [30, 40]
                    })
                }).addTo(this.ligplaatsenNummers);
            }
        }
    });
    private _main = L.layerGroup([this.ligplaatsenLayer, this.gebouwenLayer, this.steigersLayer]);

    constructor(sidebar: L.Control.Sidebar) {
        this.sidebar = sidebar
    }

    // public async enableBackButton() {
    //     const searchResults = document.querySelectorAll(".back-button");
    //     searchResults.forEach((element: HTMLSpanElement) => {
    //         element.addEventListener("click", () => {
    //             let tabName = <HTMLSpanElement>document.getElementById("main-ligplaatstitle");
    //             tabName.textContent = "Ligplaats zoeken";
    //             document.getElementById("main-ligplaatsinfo").style.display = "none";
    //             document.getElementById("main-ligplaatssearch").style.display = "block";
    //         })
    //     });
    // }

    public checkZoom(map: L.Map) {
        if (map.hasLayer(this.ligplaatsenLayer)) {
            if (map.getZoom() >= 18) {
                map.addLayer(this.boldersLayer)
            } else {
                map.removeLayer(this.boldersLayer)
            }
            if (map.getZoom() >= 16) {
                map.addLayer(this.ligplaatsenNummers)
                map.addLayer(this.reddingsboeienLayer)
            } else {
                map.removeLayer(this.ligplaatsenNummers)
                map.removeLayer(this.reddingsboeienLayer)
            }
        }
    }

    public checkLayer(map: L.Map) {
        if (map.hasLayer(this.ligplaatsenLayer)) {
            if (map.getZoom() >= 18) {
                map.addLayer(this.boldersLayer)
            }
            if (map.getZoom() >= 16) {
                map.addLayer(this.ligplaatsenNummers)
                map.addLayer(this.reddingsboeienLayer)
            }
        } else {
            map.removeLayer(this.boldersLayer)
            map.removeLayer(this.reddingsboeienLayer)
            map.removeLayer(this.ligplaatsenNummers)
        }
    }

    public get main(): L.LayerGroup {
        return this._main;
    }
}
