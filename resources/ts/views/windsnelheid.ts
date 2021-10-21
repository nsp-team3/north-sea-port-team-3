import * as L from "leaflet";

export class Windsnelheid {
    constructor() {
        const request = new Request('http://10.0.0.20:7000/latest');

        fetch(request)
            .then(response => {
                if (response.status === 200) {
                    response.json().then(data => {
                        let weerInfo = L.velocityLayer({

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
                            data: data,            // see demo/*.json, or wind-js-server for example data service
                            minVelocity: 0,      // used to align color scale
                            maxVelocity: 20,       // used to align color scale
                            // velocityScale: 0.005,  // modifier for particle animations, arbitrarily defaults to 0.005
                            // colorScale: []         // define your own array of hex/rgb colors
                        });
                        weerInfo.addTo(this.main);
                    }

                    )
                } else {
                    throw new Error('Something went wrong on api server!');
                }
            })
            .then(response => {
                console.debug(response);
                // ...
            }).catch(error => {
                console.error(error);
            });
    }

    public main = L.layerGroup();

}
