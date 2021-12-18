import * as L from "leaflet";
import Layer from "./Layer";
import { arcgisToGeoJSON } from "@esri/arcgis-to-geojson-utils";
import { BerthInfo } from "../types/berth-types";

const arcgis = {
    berths: require('../../northSeaPortGeoJson/ligplaatsen_northsp.json'),
    scaffolding: require('../../northSeaPortGeoJson/steigers_northsp.json')
}

export default class BerthLayer extends Layer {
    private readonly MIN_ZOOM_LEVEL = 12;
    private _scaffoldingLayer: L.GeoJSON;

    public constructor(map: L.Map) {
        super(map);
        this._nestedLayer = this.createBerthsJSON();
        this._scaffoldingLayer = this.createScaffoldingJSON();
        this.update();
        this.show();
    }

    /**
     * Rendert alle layers
     */
    public update(): void {
        const zoomLevel = this._map.getZoom();
        this.renderBerths(zoomLevel);
        this.renderScaffolding(zoomLevel);
    }

    public show(): void { 
        this.update();
    }

    public hide(): void {
        if (this._layerGroup.hasLayer(this._nestedLayer)) {
            this._layerGroup.removeLayer(this._nestedLayer);
        }
        if (this._layerGroup.hasLayer(this._scaffoldingLayer)) {
            this._layerGroup.removeLayer(this._scaffoldingLayer);
        }
    }

    /**
     * Zet de geojson data om naar een makkelijk leesbaar object met ligplaatsinformatie
     * https://leafletjs.com/examples/geojson/
     * @param feature huidige ligplaats binnen geojson
     * @returns makkelijk leesbaar object
     */
    private convertFeatureToBerth(feature: any, layer: L.Layer): BerthInfo {
        const properties = feature.properties;
        const id = properties.ligplaatsNr ? Number(properties.ligplaatsNr.substring(2)) : undefined;
        const maxDepth = properties.maxDiepgang_m ? parseFloat(properties.maxDiepgang_m) : undefined;
        return {
            id: id,
            name: properties.enigmaNaam,
            owner: properties.eigenaar,
            enigmaCode: properties.enigmaCode,
            externalCode: properties.externeCode,
            maxDepth: maxDepth,
            type: properties.type,
            region: properties.zone,
            location: this.getCenter(layer as L.Polygon),
            width: properties.breedte ? Number(properties.breedte) : undefined,
            length: properties.lengte ? Number(properties.lengte) : undefined,
            dock: properties.dok
        }
    }

    private getCenter(feature: L.Polygon): L.LatLng {
        return feature.getBounds().getCenter();
    }

    /**
     * Rendert de ligplaatsen.
     */
    private renderBerths(zoomLevel: number): void {
        if (zoomLevel >= this.MIN_ZOOM_LEVEL) {
            this._layerGroup.addLayer(this._nestedLayer);
        } else {
            this._layerGroup.removeLayer(this._nestedLayer);
        }
    }
    
    /**
     * Rendert de steigers.
     * @param zoomLevel 
     */
    private renderScaffolding(zoomLevel: number) {
        if (zoomLevel >= this.MIN_ZOOM_LEVEL) {
            this._layerGroup.addLayer(this._scaffoldingLayer);
        } else {
            this._layerGroup.removeLayer(this._scaffoldingLayer);
        }
    }

    private createBerthsJSON(): L.GeoJSON {
        return L.geoJSON(arcgis.berths, {
            filter: (feature: any): boolean => {
                return feature.properties.ligplaatsNr || feature.properties.enigmaNaam;
            },
            onEachFeature: (feature, layer) => {
                const berthInfo = this.convertFeatureToBerth(feature, layer);
                const content = this.createBerthPopupContent(berthInfo);

                if (berthInfo.location) {
                    const popup = L.popup()
                        .setLatLng(berthInfo.location)
                        .setContent(content);

                    layer.on("click", () => {
                        this._map.openPopup(popup);
                    });
                }
            }
        });
    }

    private createScaffoldingJSON(): L.GeoJSON {
        return L.geoJSON(arcgisToGeoJSON(arcgis.scaffolding), {
            style: {
                "color": "#fd5353",
                "weight": 3,
                "opacity": 0.65
            }
        });
    }

    private createBerthPopupContent(berthInfo: BerthInfo): string {
        const name = berthInfo.name ? `${berthInfo.name}` : "";
        const id = berthInfo.id ? `(${berthInfo.id})` : "";
        const size = (berthInfo.width && berthInfo.length) ? `Grootte: ${berthInfo.width}m x ${berthInfo.length}m` : "";
        const maxDepth = berthInfo.maxDepth ? `Maximale diepte: ${berthInfo.maxDepth}m` : "";
        const owner = berthInfo.owner ? `Eigenaar: ${berthInfo.owner}` : "";
        const region = berthInfo.region ? `Regio: ${berthInfo.region}` : "";
        const dock = berthInfo.dock ? `Dok: ${berthInfo.dock}` : "";

        return `<table>
            <tr>
                <th>${name}</th>
                <td>${id}</td>
            </tr>
            <tr>
                <td>${size}</td>
            </tr>
            <tr>
                <td>${maxDepth}</td>
            </tr>
            <tr>
                <td>${owner}</td>
            </tr>
            <tr>
                <td>${region}</td>
            </tr>
            <tr>
                <td>${dock}</td>
            </tr>
        </table>`;
    }
}