import * as L from "leaflet";

const bedrijven = require('../../northSeaPortGeoJson/bedrijven_northsp.json');
const beheersgebied = require('../../northSeaPortGeoJson/beheergebied_northsp.json');
const { arcgisToGeoJSON } = require('@esri/arcgis-to-geojson-utils');

/**
 * Besturing van de bedrijvenlaag
 */
export default class Companies {
    public static bedrijvenGroup = L.layerGroup();
    private static infoLayer = L.layerGroup();
    private static beheersgebiedLayer = L.geoJSON(arcgisToGeoJSON(beheersgebied));

    /**
     * wijzig de zichtbaarheid van items als ingezoomt is op de map
     * @param map koppeling met de kaart voor zoominformatie ophalen en lagen verwijderen
     */
    public static checkZoom(map: L.Map) {
        // extra lagen toevoegen gebaseerd op zichtbaarheid van bedrijvenlayer
        if (map.hasLayer(this.bedrijvenGroup)) {
            // infoLayer laten zien boven 13 zoomlevel
            if (map.getZoom() >= 16) {
                map.addLayer(this.infoLayer)
            // bedrijvenLayer laten zien boven 13 zoomlevel
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
     * wijzig de zichtbaarheid van items als de zichtbaarheid van lagen word aangepast
     * @param map koppeling met de kaart voor zoominformatie ophalen en lagen verwijderen
     */
    public static checkLayer(map: L.Map) {
        // extra lagen toevoegen gebaseerd op zichtbaarheid van bedrijvenlayer
        if (map.hasLayer(this.bedrijvenGroup)) {
            // bedrijvenLayer en infoLayer laten zien boven 13 zoomlevel
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

    /**
     * aanmaken bedrijvenlaag met onclick voor extra informatie
     */
    private static bedrijvenLayer = L.geoJSON(arcgisToGeoJSON(bedrijven), {
        onEachFeature: (feature, layer) => {

            if (layer instanceof L.Polygon) {
                // let marker = L.marker(layer.getBounds().getCenter(), {
                //     icon: L.icon({
                //         iconUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Infobox_info_icon.svg/480px-Infobox_info_icon.svg.png",
                //         iconSize: [20, 20]
                //     })
                // });

                const popupContent = `<table>
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
                layer.on('mouseover', function (e) {
                    this.openPopup();
                });
                layer.on('mouseout', function (e) {
                    this.closePopup();
                });

                //marker.addTo(this.infoLayer);
            }
        },
        style: {
            "color": "#ff7800",
            "weight": 0,
            "opacity": 0.65
        }
    });
}
