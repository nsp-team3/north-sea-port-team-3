import * as Leaflet from "leaflet";
import "../libs/tracksymbol";
import { AIS } from "../api/AIS";
import { Vessel } from "../api/Vessel";
import LocationInfo from "../types/LocationInfo";
import PortInfo from "./portinfo";
import { Port } from "../api/Port";
import { format } from "date-fns";

export default class ShipInfo {
    private static VESSEL_COLORS: string[] = ["#6b6b6c", "#0fa8b7", "#ac7b22", "#2856fe", "#0c9338", "#d60202", "#e716f4", "#ede115", "#e716f4", "#e716f4", "#e716f4"];
    private static BASE_URL: string = "/api/search";

    private static async show(mmsi: number, map: Leaflet.Map, zoom: boolean, updateTimestamp: number) {
        const selectedVessel: Vessel = await AIS.getVessel(mmsi);
        document.getElementById("main-search").style.display = "none";
        document.getElementById("main-shipinfo").style.display = "block";
        document.getElementById("main-title").textContent = "Scheepsinformatie";
        document.getElementById("shipname").textContent = selectedVessel.name;
        const image = document.getElementById("ship-image") as HTMLImageElement;
        image.src = "";
        image.src = `https://www.myshiptracking.com/requests/getimage-normal/${mmsi}.jpg`;

        ShipInfo.loadTableData(map, selectedVessel, updateTimestamp);

        const location: LocationInfo = await selectedVessel.getLocation() as LocationInfo;
        if (zoom) {
            map.flyTo(new Leaflet.LatLng(location.latitude, location.longtitude), 16);
        }

        Leaflet.circleMarker([location.latitude, location.longtitude], {radius: 12, attribution: String(mmsi)}).addTo(this.circle);
    }

    public static async enableSearch(map: Leaflet.Map) {
        const searchfield = <HTMLInputElement>document.getElementById("searchfield");
        searchfield.addEventListener("input", async () => {
            const searchResultsElement = <HTMLDivElement>document.getElementById("searchresults");
            if (searchfield.value.length < 3) {
                searchResultsElement.innerHTML = "";
                return;
            }

            const res = await fetch(`${ShipInfo.BASE_URL}?query=${searchfield.value}`).catch(console.error);
            if (!res || res.status !== 200) {
                return;
            }

            const body = await res.text();
            const searchResults = ShipInfo.parseXML(body);
            searchResultsElement.innerHTML = ""

            if (searchResults.length === 0) {
                return;
            }

            searchResults.forEach((searchResult) => {
                const div = document.createElement("div");
                div.classList.add("list-group-item", "list-group-item-action", "my-2");

                const title = document.createElement("strong");
                title.classList.add("mb-1");
                title.innerText = `${searchResult.name} (${searchResult.flag})`;
                
                const info = document.createElement("p");
                info.classList.add("mb-1", "small");
                info.innerHTML = `${searchResult.typeText} (${searchResult.mmsi || searchResult.portId})`;

                div.append(title, info);
                searchResultsElement.append(div);

                div.addEventListener("click", () => {
                    if (searchResult.mmsi){
                        this.show(searchResult.mmsi, map, true, undefined);
                    } else if(searchResult.portId){
                        //TODO: PortInfo.show(map)
                    }
                });
            });
        });
    }

    private static parseXML(xml: string){
        const resultsMatch = xml.match(/<RES>.*?<\/RES>/g);
        if (!resultsMatch) {
            return undefined;
        }

        return resultsMatch.map((e) => {
            const resultInfoMatch = e.match(/<RES><ID>([0-9]*)<\/ID><NAME>(.*?)<\/NAME><D>(.*?)<\/D><TYPE>([0-9]*)<\/TYPE><FLAG>([a-zA-Z]+)<\/FLAG><LAT>.*?<\/LAT><LNG>.*?<\/LNG><\/RES>/);
            if (resultInfoMatch) {
                const info = {
                    mmsi: Number(resultInfoMatch[1]),
                    name: resultInfoMatch[2],
                    typeText: resultInfoMatch[3],
                    type: Number(resultInfoMatch[4]),
                    flag: resultInfoMatch[5],
                    portId: 0
                }
                if (info.type === 0) {
                    info.portId = info.mmsi;
                    delete info.mmsi;
                } else {
                    delete info.portId;
                }

                return info;
            }
            return undefined;
        }).filter((e) => e !== undefined);
    }

    public static async enableBackButton() {
        const searchResults = document.querySelectorAll(".back-button");
        searchResults.forEach((element: HTMLSpanElement) => {
            element.addEventListener("click", () => {
                let tabName = <HTMLSpanElement>document.getElementById("main-title");
                tabName.textContent = "Schip zoeken";
                document.getElementById("main-shipinfo").style.display = "none";
                document.getElementById("main-search").style.display = "block";
                ShipInfo.circle.clearLayers();
            });
        });
    }

    public static circle = Leaflet.layerGroup();
    public static main = Leaflet.layerGroup();

    public static async getLocations(map: Leaflet.Map, sidebar: Leaflet.Control.Sidebar) {
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
        await ShipInfo.requestVesselLocations(params, map, sidebar);
    }

    private static async requestVesselLocations(params: URLSearchParams, map: Leaflet.Map, sidebar: Leaflet.Control.Sidebar) {
        const response = await fetch(`https://services.myshiptracking.com/requests/vesselsonmaptempw.php?${params}`).catch(console.error);
        if (!response || response.status !== 200) {
            throw new Error("Something went wrong with the vessel locations api!");
        }
        const body = await response.text();
        this.main.clearLayers();
        const allInfo = body.split("\n");
        allInfo.shift();
        allInfo.pop();
        allInfo.forEach((line: string) => {
            const shipInfo = line.split("\t");
            if (shipInfo[5] !== undefined && ShipInfo.VESSEL_COLORS[Number(shipInfo[16])] !== undefined) {
                const location = Leaflet.latLng(Number(shipInfo[5]), Number(shipInfo[6]));

                // update marker position
                if (this.circle.getLayers().length !== 0 && this.circle.getLayers()[0].getAttribution() == shipInfo[1]) {
                    this.circle.clearLayers();
                    Leaflet.circleMarker(location, {radius: 12, attribution: shipInfo[1]}).addTo(this.circle);
                }

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
                    updateTimestamp: shipInfo[12]
                });

                ship.on("click", (context) => {
                    // TODO: Open sidebar
                    sidebar.open("home");
                    
                    this.circle.clearLayers();
                    this.show(Number(context.sourceTarget.options.trackId), map, false, Number(context.sourceTarget.options.updateTimestamp));
                });

                ship.addTo(this.main);
            }
        });
    }

    private static addInfoRow(table: HTMLTableElement, key: string, value: string | number | Date | void): HTMLTableRowElement {
        const row = table.insertRow();
        const nameCell = row.insertCell(0);
        const valueCell = row.insertCell(1);

        nameCell.innerHTML = `<b>${key}</b>`;
        valueCell.innerHTML = String(value);

        return row;
    }

    private static loadTableData(map: Leaflet.Map, vessel: Vessel, updateTimestamp: number) {
        const table = <HTMLTableElement>document.getElementById("shipinfo-content");
        table.innerHTML = "";

        let updateString;
        if (updateTimestamp !== undefined) {
            const updateTime = new Date(updateTimestamp * 1000)
            // console.log(formatDistanceStrict(updateTime, new Date(), { addSuffix: true })); // 3 seconds ago - date-fns
            updateString = format(updateTime, "HH:mm, dd MMM");
        }

        this.addInfoRow(table, "IMO", vessel.imo ? vessel.imo : "Unknown");
        this.addInfoRow(table, "MMSI", vessel.mmsi);
        this.addInfoRow(table, "Type", vessel.typeText);
        this.addInfoRow(table, "Status", vessel.statusText);
        this.addInfoRow(table, "Location timestamp", updateString? updateString : "Unknown");
        this.addInfoRow(table, "Country of origin", `${vessel.country} [${vessel.flag}]`);
        this.addInfoRow(table, "ETA", vessel.ETA ? vessel.ETA.toLocaleString() : "Unknown");
        this.addInfoRow(table, "Velocity", `${vessel.course}° at ${vessel.speed} knots`);
        this.addInfoRow(table, "Length", `${vessel.length}m`);
        this.addInfoRow(table, "Width", `${vessel.width}m`);
        this.addInfoRow(table, "Draught", vessel.draught ? `${vessel.draught}m` : "Unknown");
        this.addInfoRow(table, "Safe depth range", (typeof vessel.minDepth === "number" && typeof vessel.maxDepth === "number") ? `${vessel.minDepth}m to ${vessel.maxDepth}m` : "Unknown");
        this.addInfoRow(table, "Last draught", vessel.lastDraught ? `${vessel.lastDraught}m (${vessel.lastDraughtChange ? vessel.lastDraughtChange.toLocaleString() : ''})` : "Unknown");
        this.addPortRow(table, "Last port", vessel.lastPort, map);
        this.addPortRow(table, "Current port", vessel.port, map);
        this.addPortRow(table, "Next port", vessel.nextPort, map);
    }

    private static addPortRow(table: HTMLTableElement, title: string, port: Port, map: Leaflet.Map){
        const portRow = this.addInfoRow(table, title , port.name || "Unknown");
        portRow.addEventListener("click", () => {
            PortInfo.show(map, port);
        });
    }
}
