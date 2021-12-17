import * as L from "leaflet";
import Layer from "./Layer";
import { arcgisToGeoJSON } from "@esri/arcgis-to-geojson-utils";

// TODO: Create a class for each of these layers.
const arcgis = {
    berths: require('../../northSeaPortGeoJson/ligplaatsen_northsp.json'),
    bolders: require("../../northSeaPortGeoJson/bolders_northsp.json"),
    buildings: require("../../northSeaPortGeoJson/gebouwen_fm_northsp.json"),
    lifebuoys: require('../../northSeaPortGeoJson/reddingsboeien_northsp.json'),
    scaffolding: require('../../northSeaPortGeoJson/steigers_northsp.json')
}

export default class BerthLayer extends Layer {
    private _berthsLayer: L.GeoJSON;
    private _boldersLayer: L.GeoJSON;
    private _buildingsLayer: L.GeoJSON;
    private _lifebuoysLayer: L.GeoJSON;
    private _scaffoldingLayer: L.GeoJSON;

    private searchBerth: {[index: string]: any};
    private berthNumbersLayer: L.LayerGroup;

    public constructor(map: L.Map) {
        super(map);

        this._berthsLayer = this.createBerthsJSON();
        this._boldersLayer = this.createBoldersJSON();
        this._buildingsLayer = this.createBuildingsJSON();
        this._lifebuoysLayer = this.createLifebuoysJSON();
        this._scaffoldingLayer = this.createScaffoldingJSON();
    }

    /**
     * Rendert alle layers
     */
    public render(): void {
        if (this.shouldRender()) {
            this.clearLayers();
            const zoomLevel = this._map.getZoom();
            this.renderBerths();
            this.renderBolders(zoomLevel);
            this.renderNumbers(zoomLevel);
            this.renderLifebuoys(zoomLevel);
        }
    }

    protected clearLayers(): void {
        this._layerGroup.clearLayers();
        this._berthsLayer.clearLayers();
        this._boldersLayer.clearLayers();
        this._buildingsLayer.clearLayers();
        this._lifebuoysLayer.clearLayers();
        this._scaffoldingLayer.clearLayers();
    }

    /**
     * Checkt of de layers nu gerendert moeten worden.
     */
    private shouldRender(): boolean {
        return this._map.hasLayer(this.main);
    }

    /**
     * Rendert de daadwerkelijke ligplaatsen.
     */
    private renderBerths(): void {
        this.main.addLayer(this._berthsLayer);
    }

    /**
     * Rendert de aanlegpunten van ligplaatsen.
     */
    private renderBolders(zoomLevel: number): void {
        if (zoomLevel >= 18) {
            this.main.addLayer(this._boldersLayer);
        } else {
            this.main.removeLayer(this._boldersLayer);
        }
    }

    /**
     * Rendert de nummers van ligplaatsen.
     */
    private renderNumbers(zoomLevel: number): void {
        if (zoomLevel >= 16) {
            this.main.addLayer(this.berthNumbersLayer);
        } else {
            this.main.removeLayer(this.berthNumbersLayer);
        }
    }

    /**
     * Rendert de reddingsboeien.
     */
    private renderLifebuoys(zoomLevel: number): void {
        if (zoomLevel >= 16) {
            this.main.addLayer(this._lifebuoysLayer);
        } else {
            this.main.removeLayer(this._lifebuoysLayer);
        }
    }

    private createBerthsJSON(): L.GeoJSON {
        this.searchBerth = {};
        this.berthNumbersLayer = new L.LayerGroup();
        return L.geoJSON(arcgis.berths, {
            onEachFeature: (feature, layer) => {
                layer.on("click", (event) => {
                    console.log("TODO: Display berth information.");
                    // this.berthDisplay.show(BerthSearch.convertFeatureToBerth(feature));
                });
    
                if (layer instanceof L.Polygon) {
                    feature.properties.center = layer.getBounds().getCenter();
                    this.searchBerth[`${feature.properties.type} ${feature.properties.ligplaatsNr}`] = feature.properties;
                    L.marker(feature.properties.center, {
                        icon: L.divIcon({
                            className: 'label',
                            html: feature.properties.ligplaatsNr,
                            iconSize: [30, 40]
                        })
                    }).addTo(this.berthNumbersLayer);
                }
            }
        });
    }

    private createBoldersJSON(): L.GeoJSON {
        return L.geoJSON(arcgisToGeoJSON(arcgis.bolders), {
            onEachFeature: (_, layer) => {
                if (layer instanceof L.Marker) {
                    layer.setIcon(L.icon({
                        iconUrl: '/icons/bollard.png',
                        iconSize: [18, 18],
                        iconAnchor: [9, 9]
                    }))
                }
            }
        });
    }

    private createBuildingsJSON(): L.GeoJSON {
        return L.geoJSON(arcgisToGeoJSON(arcgis.buildings), {
            style: {
                "color": "#ff7800",
                "weight": 3,
                "opacity": 0.65
            }
        });
    }

    private createLifebuoysJSON(): L.GeoJSON {
        return L.geoJSON(arcgisToGeoJSON(arcgis.lifebuoys), {
            onEachFeature: (_, layer) => {
                if (layer instanceof L.Marker) {
                    layer.setIcon(L.icon({
                        iconUrl: '/icons/lifebuoy.png',
                        iconSize: [20, 20],
                        iconAnchor: [10, 10]
                    }))
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
}