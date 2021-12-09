import * as Leaflet from "leaflet";
import Layer from "./Layer";

export default class WindspeedLayer extends Layer {
    public constructor(map: L.Map) {
        super(map);
        this.show();
    }

    public async show(): Promise<void> {
        const windInfo = await this.fetchWindInfo();
        this._layerGroup.clearLayers();
        if (windInfo) {
            const windLayer = this.getWeatherLayer(windInfo);
            windLayer.addTo(this.main);
        }
    }

    private getWeatherLayer(windInfo: object): L.Layer {
        return Leaflet.velocityLayer({
            displayValues: true,
            displayOptions: {
                velocityType: 'Globale wind',
                position: 'bottomleft',//REQUIRED !
                emptyString: 'Geen windsnelheid informatie beschikbaar',//REQUIRED !
                angleConvention: 'bearingCW',//REQUIRED !
                displayPosition: 'bottomleft',
                displayEmptyString: 'Geen windsnelheid informatie beschikbaar',
                showCardinal: true,
                directionString: "directie",
                speedString: "snelheid",
                speedUnit: 'm/s'
            },
            data: windInfo,            // see demo/*.json, or wind-js-server for example data service
            minVelocity: 0,      // used to align color scale
            maxVelocity: 20,       // used to align color scale
            // velocityScale: 0.005,  // modifier for particle animations, arbitrarily defaults to 0.005
            // colorScale: []         // define your own array of hex/rgb colors
        });
    }

    private async fetchWindInfo(): Promise<any> {
        const res = await fetch('https://nsp-weather.jobse.space/latest').catch(console.error);
        if (res) {
            return await res.json().catch(console.error);
        }
    }
}