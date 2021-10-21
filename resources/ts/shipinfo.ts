/// <reference path="../../node_modules/@types/geojson/index.d.ts" />
import * as L from "leaflet";

export class ShipInfo {
    constructor(map: L.Map) {
        this.getShipInfo(map)
    }
    public getShipInfo(map: L.Map) {
        let bounds = map.getBounds();
		var sw = bounds.getSouthWest();
		var ne = bounds.getNorthEast();
        const params = new URLSearchParams({
            type: "json",
            minlat: String(sw.lat),
            maxlat: String(ne.lat),
            minlon: String(sw.lng),
            maxlon: String(ne.lng),
            zoom: String(Math.round(map.getZoom())),
            selid: "null",
            seltype: "null",
            timecode: "0",
            slmp: "",
            filters: JSON.stringify({
                "vtypes": ",0,3,4,6,7,8,9,10,11,12,13",
                "minsog": 0,
                "maxsog": 60,
                "minsz": 0,
                "maxsz": 500,
                "minyr": 1950,
                "maxyr": 2021,
                "flag": "",
                "status": "",
                "mapflt_from": "",
                "mapflt_dest": "",
                "ports": "1"
            }),
            _: String(new Date().getTime())
        });

        const request = new Request(`https://services.myshiptracking.com/requests/vesselsonmaptempw.php?${params}`);

        fetch(request)
            .then(response => {
                if (response.status === 200) {
                    response.text().then(body => {
                        const allInfo = body.split("\n");
                        allInfo.shift();
                        allInfo.pop();
                        let ships: GeoJSON.Feature[] = [];
                        allInfo.map((line, index) => {
                            const shipInfo = line.split('\t');
                            if (shipInfo[5] !== undefined) {
                                L.Projection
                                let location = L.latLng(Number(shipInfo[5]), Number(shipInfo[6]))
                                ships.push({
                                    type: "Feature",
                                    id: index as number,
                                    geometry: {
                                        type: "Point",
                                        coordinates: [location.lng, location.lat],
                                    },
                                    properties: {
                                        aisType: shipInfo[0],
                                        imo: shipInfo[1],
                                        name: shipInfo[2],
                                        SOG: shipInfo[3], //speed
                                        COG: shipInfo[4], //direction
                                        S1: shipInfo[7],
                                        S2: shipInfo[8],
                                        S3: shipInfo[9],
                                        S4: shipInfo[10],
                                        ARV_Text: shipInfo[11],
                                        ARV: new Date(shipInfo[11]),
                                        rtime: shipInfo[12],
                                        DEST: shipInfo[13],
                                        eta: shipInfo[14],
                                        pid: shipInfo[15],
                                        type: shipInfo[16],
                                        offset: shipInfo[17]
                                    }
                                })
                            }
                        })

                        const newInfo: GeoJSON.FeatureCollection = {
                            type: "FeatureCollection",
                            features: ships
                        };
                        L.geoJSON(newInfo).addTo(this.main)
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
