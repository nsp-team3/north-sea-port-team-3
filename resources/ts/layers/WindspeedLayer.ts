import * as Leaflet from "leaflet";
import Layer from "./Layer";

/**
 * Besturing van de windsnelheidslaag
 */
export default class WindspeedLayer extends Layer {
    /**
     * nestedWindLayer { windLayer { windinfo }}
     * laag in laag zodat de informatie snel weg en terug gehaald kan worden,
     * door de laag opnieuw te koppelen zonder informatie opnieuw op te vragen.
     */
    private _nestedWindLayer: L.LayerGroup;

    /**
     * @param map koppeling met de kaart, niet nodig in deze functie maar voor abstract
     */
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

    /**
     * windinformatie laag verwijderen van de windlaag,
     * zodat windinfromatie niet op de map staat, bijv. voor zoomen
     */
    public hide(): void {
        this._layerGroup.removeLayer(this._nestedWindLayer);
    }

    /**
     * hoofdwindlaag ophalen
     */
    public get nestedLayer(): Leaflet.LayerGroup<any> {
        return this._nestedWindLayer;
    }

    /**
     * windinformatie op de map zetten
     * @param windInfo de opgehaalde windinformatie
     * @returns laag die gekoppeld kan worden aan de map
     */
    private getWeatherLayer(windInfo: object): L.Layer {
        return Leaflet.velocityLayer({
            // windsnelheidsgetallen weergeven voor windinformatie rechtsonderin als laag geactiveerd is
            displayValues: true,
            // vertalingen voor items linksonderin en instellingen
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

    /**
     * windinformatie ophalen van de zelf-draaiende API
     * @returns de opgehaalde windinformatie
     */
    private async fetchWindInfo(): Promise<any> {
        const res = await fetch("https://nsp-weather.jobse.space/latest").catch(console.error);
        if (res) {
            return await res.json().catch(console.error);
        }
    }
}
