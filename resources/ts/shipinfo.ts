import * as Leaflet from "leaflet";
import "./libs/tracksymbol";
import { AIS } from "./api/AIS";
import { Vessel } from "./api/Vessel";
import { LocationInfo } from "./api/enums/LocationInfo";

export class ShipInfo {
    private static VESSEL_COLORS: string[] = ["#6b6b6c", "#0fa8b7", "#ac7b22", "#2856fe", "#0c9338", "#d60202", "#e716f4", "#ede115", "#e716f4", "#e716f4", "#e716f4"];

    public async show(mmsi: number, map: Leaflet.Map, zoom: boolean) {
        const selectedVessel: Vessel = await AIS.getVessel(mmsi);
        document.getElementById("main-search").style.display = "none";
        document.getElementById("main-shipinfo").style.display = "block";
        document.getElementById("main-title").textContent = "Scheepsinformatie";
        document.getElementById("shipname").textContent = selectedVessel.name;
        this.loadTableData(selectedVessel);
        const location: LocationInfo = await selectedVessel.getLocation() as LocationInfo;
        if (zoom) {
            map.flyTo(new Leaflet.LatLng(location.latitude, location.longtitude), 16);
        }
        Leaflet.circle([location.latitude, location.longtitude], {radius: 20}).addTo(this.circle);
    }

    public async enableSearch(map: Leaflet.Map) {
        const searchfield = <HTMLInputElement>document.getElementById("searchfield");
        searchfield.addEventListener("input", (e) => {
            const params = new URLSearchParams({
                req: searchfield.value,
                res: "all"
            })
            const url = `${location.protocol}//${location.hostname}${location.port?':'+location.port:''}`;
            const request = new Request(`${url}/search?${params}`);
            fetch(request)
                .then(response => {
                    if (response.status === 200) {
                        response.text().then(body => {
                            const searchresults = <HTMLDivElement>document.getElementById("searchresults");
                            const parser = new DOMParser();
                            const xmlDoc = parser.parseFromString(body, "text/xml");
                            const results = xmlDoc.getElementsByTagName("RESULTS");
                            if (results.length !== 0) {
                                const result = <HTMLElement>results[0];
                                /**
                                 * from <RES><ID>316000000</ID><NAME>TEST</NAME><D>Not available</D><TYPE>0</TYPE><FLAG>CA</FLAG><LAT>0.00000</LAT><LNG>0.00000</LNG></RES>
                                 * to <RES><NAME>UAIS TEST HO</NAME><D>Not available</D><ID>442010045</ID><FLAG>00</FLAG></RES>
                                 */
                                result.childNodes.forEach(element => {
                                    element.insertBefore(element.childNodes[0], element.childNodes[3]);
                                    element.firstChild.textContent = element.firstChild.textContent.toLowerCase();
                                    element.lastChild.remove();
                                    element.lastChild.remove();
                                    element.lastChild.previousSibling.remove();
                                    const mmsi: number = Number(element.lastChild.previousSibling.textContent);
                                    element.addEventListener("click", () => {
                                        this.show(mmsi, map, true);
                                    });
                                });

                                searchresults.replaceChildren(result);
                            }
                        })
                    } else {
                        throw new Error("Something went wrong on api server!");
                    }
                }).catch(error => {
                    console.error(error);
                });

        });
    }

    public async enableBackButton() {
        const searchResults = document.querySelectorAll(".back-button");
        searchResults.forEach((element: HTMLSpanElement) => {
            element.addEventListener("click", () => {
                let tabName = <HTMLSpanElement>document.getElementById("main-title");
                tabName.textContent = "Schip zoeken";
                document.getElementById("main-shipinfo").style.display = "none";
                document.getElementById("main-search").style.display = "block";
                this.circle.clearLayers();
            })
        });
    }

    public async getLocations(map: Leaflet.Map) {
        let bounds = map.getBounds();
        const sw = bounds.getSouthWest();
        const ne = bounds.getNorthEast();
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
        const response = await fetch(`https://services.myshiptracking.com/requests/vesselsonmaptempw.php?${params}`);

        if (response.status === 200) {
            const body = await response.text()
            this.main.clearLayers();
            const allInfo = body.split("\n");
            allInfo.shift();
            allInfo.pop();
            allInfo.map((line) => {
                const shipInfo = line.split("\t");
                if (shipInfo[5] !== undefined && ShipInfo.VESSEL_COLORS[Number(shipInfo[16])] !== undefined) {
                    const location = Leaflet.latLng(Number(shipInfo[5]), Number(shipInfo[6]))
                    const ship = Leaflet.trackSymbol(location, {
                        trackId: shipInfo[1],
                        fill: true,
                        fillColor: ShipInfo.VESSEL_COLORS[Number(shipInfo[16])],
                        fillOpacity: 1.0,
                        stroke: true,
                        color: "#000000",
                        opacity: 1.0,
                        weight: 1.0,
                        speed: shipInfo[3],
                        course: Number(shipInfo[4]) * Math.PI / 180,
                        heading: Number(shipInfo[4]) * Math.PI / 180,
                    })
                    ship.on("click", (context) => {
                        this.circle.clearLayers()
                        this.show(Number(context.sourceTarget.options.trackId), map, false);
                    });
                    ship.addTo(this.main);
                    //TODO: shipinfo spam
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
            }
            )
        } else {
            throw new Error("Something went wrong on the api server!");
        }
    }

    public circle = Leaflet.layerGroup();
    public main = Leaflet.layerGroup();

    private addInfoRow(table: HTMLTableElement, key: string, value: string | number | Date | void): HTMLTableRowElement {
        const row = table.insertRow();
        const nameCell = row.insertCell(0);
        const valueCell = row.insertCell(1);

        nameCell.innerHTML = `<b>${key}</b>`;
        valueCell.innerHTML = String(value);

        return row;
    }

    private loadTableData(vessel: Vessel) {
        const table = <HTMLTableElement>document.getElementById("shipinfo-content");
        table.innerHTML = "";

        this.addInfoRow(table, "IMO", vessel.imo ? vessel.imo : "Unknown");
        this.addInfoRow(table, "MMSI", vessel.mmsi);
        this.addInfoRow(table, "Type", vessel.typeText);
        this.addInfoRow(table, "Status", vessel.statusText);
        this.addInfoRow(table, "Country of origin", `${vessel.country} [${vessel.flag}]`);
        this.addInfoRow(table, "ETA", vessel.ETA ? vessel.ETA.toLocaleString() : "Unknown");
        this.addInfoRow(table, "Velocity", `${vessel.course}° at ${vessel.speed} knots`);
        this.addInfoRow(table, "Length", `${vessel.length}m`);
        this.addInfoRow(table, "Width", `${vessel.width}m`);
        this.addInfoRow(table, "Draught", vessel.draught ? `${vessel.draught}m` : "Unknown");
        this.addInfoRow(table, "Safe depth range", (typeof vessel.minDepth === "number" && typeof vessel.maxDepth === "number") ? `${vessel.minDepth}m to ${vessel.maxDepth}m` : "Unknown");
        this.addInfoRow(table, "Last draught", vessel.lastDraught ? `${vessel.lastDraught}m (${vessel.lastDraughtChange ? vessel.lastDraughtChange.toLocaleString() : ''})` : "Unknown");
        console.log(vessel.destinations);
        console.log(vessel.lastPort);
        console.log(vessel.port);
        console.log(vessel.nextPort);
    }
}
