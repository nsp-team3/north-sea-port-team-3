import * as L from "leaflet";

let bedrijven = require('../../northSeaPortGeoJson/bedrijven_northsp.json');
let beheersgebied = require('../../northSeaPortGeoJson/beheergebied_northsp.json');
const { arcgisToGeoJSON } = require('@esri/arcgis-to-geojson-utils');

export class Bedrijven {
    private infoLayer = L.layerGroup();

    private bedrijvenLayer = L.geoJSON(arcgisToGeoJSON(bedrijven), {
        onEachFeature: (feature, layer) => {

            if (layer instanceof L.Polygon) {
                let marker = L.marker(layer.getBounds().getCenter(), {
                    icon: L.icon({
                        iconUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Infobox_info_icon.svg/480px-Infobox_info_icon.svg.png",
                        iconSize: [20, 20]
                    })
                });

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
            marker.bindPopup(popupContent);

            marker.addTo(this.infoLayer);
            }


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
            if (map.getZoom() >= 16) {
                map.addLayer(this.infoLayer)
            } else if (map.getZoom() >= 13) {
                map.addLayer(this.bedrijvenLayer)
                map.removeLayer(this.infoLayer)
                map.removeLayer(this.beheersgebiedLayer)
            } else {
                map.removeLayer(this.bedrijvenLayer)
                map.removeLayer(this.infoLayer)
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
                map.addLayer(this.infoLayer)
            } else {
                map.addLayer(this.beheersgebiedLayer)
            }
        } else {
            map.removeLayer(this.bedrijvenLayer)
            map.removeLayer(this.infoLayer)
            map.removeLayer(this.beheersgebiedLayer)
        }
    }

}
