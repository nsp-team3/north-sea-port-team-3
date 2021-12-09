import * as Leaflet from "leaflet";
import Layer from "./Layer";

export default class WindspeedLayer extends Layer {
    private _nestedWindLayer: L.LayerGroup;

    public constructor(map: L.Map) {
        super(map);
        this._nestedWindLayer = new Leaflet.LayerGroup();
        this._nestedWindLayer.addTo(this._layerGroup);
        this.show();
    }

    public async show(): Promise<void> {
        const windInfo = await this.fetchWindInfo();
        if (windInfo) {
            this._nestedWindLayer.clearLayers();
            this._layerGroup.clearLayers();
            const weatherLayer = this.getWeatherLayer(windInfo);
            weatherLayer.addTo(this._nestedWindLayer);
            this._nestedWindLayer.addTo(this._layerGroup);
        }
    }

    public hide(): void {
        this._layerGroup.removeLayer(this._nestedWindLayer);
    }

    public get nestedLayer(): Leaflet.LayerGroup<any> {
        return this._nestedWindLayer;
    }

    private getWeatherLayer(windInfo: object): L.Layer {
        return Leaflet.velocityLayer({
            displayValues: true,
            displayOptions: {
                velocityType: "Globale wind",
                position: "bottomleft",//REQUIRED !
                emptyString: "Geen windsnelheid informatie beschikbaar",//REQUIRED !
                angleConvention: "bearingCW",//REQUIRED !
                displayPosition: "bottomleft",
                displayEmptyString: "Geen windsnelheid informatie beschikbaar",
                showCardinal: true,
                directionString: "directie",
                speedString: "snelheid",
                speedUnit: "m/s"
            },
            data: windInfo,            // see demo/*.json, or wind-js-server for example data service
            minVelocity: 0,      // used to align color scale
            maxVelocity: 32,       // used to align color scale
            // velocityScale: 0.005,  // modifier for particle animations, arbitrarily defaults to 0.005
            // colorScale: []         // define your own array of hex/rgb colors
        });
    }

    private async fetchWindInfo(): Promise<any> {
        const res = await fetch("https://nsp-weather.jobse.space/latest").catch(console.error);
        if (res) {
            return await res.json().catch(console.error);
        }
    }
}