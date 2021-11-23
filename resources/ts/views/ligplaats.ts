import * as L from "leaflet";

let ligplaatsen = require('../../northSeaPortGeoJson/ligplaatsen_northsp.json');
let bolders = require('../../northSeaPortGeoJson/bolders_northsp.json');
let steigers = require('../../northSeaPortGeoJson/steigers_northsp.json');
let reddingsboeien = require('../../northSeaPortGeoJson/reddingsboeien_northsp.json');
let gebouwen = require('../../northSeaPortGeoJson/gebouwen_fm_northsp.json');
const { arcgisToGeoJSON } = require('@esri/arcgis-to-geojson-utils');

export class Ligplaats {
    sidebar: L.Control.Sidebar;

    constructor(sidebar: L.Control.Sidebar) {
        this.sidebar = sidebar
    }

    private ligplaatsenNummers = L.layerGroup();
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

    private searchLigplaats: { [id: string]: any } = {};

    private ligplaatsenLayer = L.geoJSON(ligplaatsen, {
        onEachFeature: (feature, layer) => {
            layer.on("click", (event)=>{
                this.showInTable(event.sourceTarget.feature.properties)
            })
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


    public async enableSearch(map: L.Map) {
        const searchfield = <HTMLInputElement>document.getElementById("searchfieldLigplaats");
        const searchresults = <HTMLDivElement>document.getElementById("searchresultsLigplaats");

        searchfield.addEventListener("input", (_) => {
            const results = document.createElement("RESULTS");
            let i = 0
            for (const [key, value] of Object.entries(this.searchLigplaats)) {
                if (key.toLowerCase().includes(searchfield.value.toLowerCase()) && i < 10 && searchfield.value !== "") {
                    const result = document.createElement("RES");
                    const name = document.createElement("NAME");
                    name.textContent = key;
                    const description = document.createElement("D");
                    description.textContent = value.enigmaNaam;

                    result.appendChild(name);
                    result.appendChild(description);
                    result.addEventListener("click", () => {
                        this.showInTable(value);
                        map.flyTo(new L.LatLng(value.center.lat, value.center.lng), 16);
                    });

                    results.appendChild(result);
                    i += 1
                }
            }
            searchresults.replaceChildren(results);
        });
    }

    public main = L.layerGroup([this.ligplaatsenLayer, this.gebouwenLayer, this.steigersLayer]);

    private showInTable(properties: any) {
        document.getElementById("main-ligplaatssearch").style.display = "none";
        document.getElementById("main-ligplaatsinfo").style.display = "block";
        document.getElementById("main-ligplaatstitle").textContent = "Ligplaats informatie";
        document.getElementById("ligplaatsname").textContent = `${properties.type} ${properties.ligplaatsNr}`;
        this.loadTableData(properties);
        this.sidebar.open('ligplaatsTab');
    }

    private addInfoRow(table: HTMLTableElement, key: string, value: string | number | Date | void): HTMLTableRowElement {
        const row = table.insertRow();
        const nameCell = row.insertCell(0);
        const valueCell = row.insertCell(1);

        nameCell.innerHTML = `<b>${key}</b>`;
        valueCell.innerHTML = String(value);

        return row;
    }

    public async enableBackButton() {
        const searchResults = document.querySelectorAll(".back-button");
        searchResults.forEach((element: HTMLSpanElement) => {
            element.addEventListener("click", () => {
                let tabName = <HTMLSpanElement>document.getElementById("main-ligplaatstitle");
                tabName.textContent = "Ligplaats zoeken";
                document.getElementById("main-ligplaatsinfo").style.display = "none";
                document.getElementById("main-ligplaatssearch").style.display = "block";
            })
        });
    }

    private loadTableData(ligplaats: any) {
        const table = <HTMLTableElement>document.getElementById("ligplaatsinfo-content");
        table.innerHTML = "";

        this.addInfoRow(table, "Ligplaats nummer", ligplaats.ligplaatsNr ? ligplaats.ligplaatsNr : "Unknown")
        this.addInfoRow(table, "Type", ligplaats.type ? ligplaats.type : "Unknown")
        this.addInfoRow(table, "Zone", ligplaats.zone ? ligplaats.zone : "Unknown")
        this.addInfoRow(table, "Opmerkingen", ligplaats.opmerking ? ligplaats.opmerking : "Geen opmerkingen")
    }


    /**
     * checkZoom
     */
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

    /**
     * checkLayer
     */
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

}
