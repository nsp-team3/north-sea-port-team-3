import * as L from "leaflet";

/**
 * Besturing van de windsnelheidslaag
 */
export default class Windspeed {
    public static main = L.layerGroup();

    public static async getWindInfo() {
        const response = await fetch('https://nsp-weather.jobse.space/latest');
        if (response.status === 200) {
            const data = await response.json()
            let weerInfo = L.velocityLayer({
                // windsnelheidsgetallen weergeven voor windinformatie rechtsonderin als laag geactiveerd is
                displayValues: true,
                // vertalingen voor items linksonderin en instellingen
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
                data: data,            // see demo/*.json, or wind-js-server for example data service
                minVelocity: 0,      // used to align color scale
                maxVelocity: 20,       // used to align color scale
                // velocityScale: 0.005,  // modifier for particle animations, arbitrarily defaults to 0.005
                // colorScale: []         // define your own array of hex/rgb colors
            });
            weerInfo.addTo(Windspeed.main);
        } else {
            throw new Error('Something went wrong on api server!');
        }
    }
}
