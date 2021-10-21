/// <reference path="../../node_modules/@types/geojson/index.d.ts" />
/// <reference path="./types/leaflet_tracksymbol.ts" />
import * as L from "leaflet";
import './libs/tracksymbol'

const colors = ["#6b6b6c", "#0fa8b7", "#ac7b22", "#2856fe", "#0c9338", "#d60202", "#e716f4", "#ede115", "#e716f4", "#e716f4", "#e716f4"];

export class ShipInfo {
    constructor(map: L.Map) {
        this.getShipInfo(map)
        const searchfield = <HTMLInputElement>document.getElementById('searchfield');
        searchfield.addEventListener('input', (e) => {
            const params = new URLSearchParams({
                req: searchfield.value,
                res: "all"
            })
            const request = new Request(`http://localhost:8000/search?${params}`);
            fetch(request)
                .then(response => {
                    if (response.status === 200) {
                        console.log(response)
                    } else {
                        throw new Error('Something went wrong on api server!');
                    }
                }).catch(error => {
                    console.error(error);
                });

        });
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
        this.main.clearLayers();
        fetch(request)
            .then(response => {
                if (response.status === 200) {
                    response.text().then(body => {
                        const allInfo = body.split("\n");
                        allInfo.shift();
                        allInfo.pop();
                        allInfo.map((line) => {
                            const shipInfo = line.split('\t');
                            if (shipInfo[5] !== undefined && colors[Number(shipInfo[16])] !== undefined) {
                                let location = L.latLng(Number(shipInfo[5]), Number(shipInfo[6]))
                                let ship = L.trackSymbol(location, {
                                    trackId: shipInfo[1],
                                    fill: true,
                                    fillColor: colors[Number(shipInfo[16])],
                                    fillOpacity: 1.0,
                                    stroke: true,
                                    color: '#000000',
                                    opacity: 1.0,
                                    weight: 1.0,
                                    speed: shipInfo[3],
                                    course: Number(shipInfo[4]) * Math.PI / 180,
                                    heading: Number(shipInfo[4]) * Math.PI / 180,
                                })
                                ship.on('click', (context) => {
                                    console.log(context.sourceTarget.options.trackId)
                                })
                                ship.addTo(this.main);
                                // console.log({
                                //     aisType: shipInfo[0],
                                //     imo: shipInfo[1],
                                //     name: shipInfo[2],
                                //     SOG: shipInfo[3], //speed
                                //     COG: shipInfo[4], //direction
                                //     S1: shipInfo[7],
                                //     S2: shipInfo[8],
                                //     S3: shipInfo[9],
                                //     S4: shipInfo[10],
                                //     ARV_Text: shipInfo[11],
                                //     ARV: new Date(shipInfo[11]),
                                //     rtime: shipInfo[12],
                                //     DEST: shipInfo[13],
                                //     eta: shipInfo[14],
                                //     pid: shipInfo[15],
                                //     type: shipInfo[16],
                                //     offset: shipInfo[17]
                                // })
                            }
                        })
                    }

                    )
                } else {
                    throw new Error('Something went wrong on api server!');
                }
            }).catch(error => {
                console.error(error);
            });
    }

    public main = L.layerGroup();
}
