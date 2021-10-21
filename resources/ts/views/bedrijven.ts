import * as L from "leaflet";

let bedrijven = require('../../northSeaPortGeoJson/bedrijven_northsp.json');
let beheersgebied = require('../../northSeaPortGeoJson/beheergebied_northsp.json');
const { arcgisToGeoJSON } = require('@esri/arcgis-to-geojson-utils');

export class Bedrijven {
    private bedrijvenLayer = L.geoJSON(arcgisToGeoJSON(bedrijven), {
        onEachFeature: (feature, layer) => {
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
        },
        style: {
            "color": "#ff7800",
            "weight": 0,
            "opacity": 0.65
        }
    });
    private beheersgebiedLayer = L.geoJSON(arcgisToGeoJSON(beheersgebied));

    public bedrijvenGroup = L.layerGroup();

    /**
     * checkZoom
     */
    public checkZoom(map: L.Map) {
        if (map.hasLayer(this.bedrijvenGroup)) {
            if (map.getZoom() >= 13) {
                map.addLayer(this.bedrijvenLayer)
                map.removeLayer(this.beheersgebiedLayer)
            } else {
                map.removeLayer(this.bedrijvenLayer)
                map.addLayer(this.beheersgebiedLayer)
            }
        }
    }

    /**
     * checkLayer
     */
    public checkLayer(map: L.Map) {
        if (map.hasLayer(this.bedrijvenGroup)) {
            if (map.getZoom() >= 13) {
                map.addLayer(this.bedrijvenLayer)
            } else {
                map.addLayer(this.beheersgebiedLayer)
            }
        } else {
            map.removeLayer(this.bedrijvenLayer)
            map.removeLayer(this.beheersgebiedLayer)
        }
    }

}
