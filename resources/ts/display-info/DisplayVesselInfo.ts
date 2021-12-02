import * as Leaflet from "leaflet";
import "../libs/tracksymbol";
import { AIS } from "../api/AIS";
import { Vessel } from "../api/Vessel";
import LocationInfo from "../types/LocationInfo";
import DisplayPortInfo from "./DisplayPortInfo";
import { Port } from "../api/Port";
import { format } from "date-fns";
import SimpleVesselInfo from "../types/SimpleVesselInfo";
import { SearchResult } from "../types/SearchTypes";

export default class DisplayVesselInfo {
    public static readonly circle = Leaflet.layerGroup();
    public static readonly main = Leaflet.layerGroup();
    private static readonly VESSEL_COLORS: string[] = ["#6b6b6c", "#0fa8b7", "#ac7b22", "#2856fe", "#0c9338", "#d60202", "#e716f4", "#ede115", "#e716f4", "#e716f4", "#e716f4"];

    public static async enableSearch(map: Leaflet.Map) {
        const searchfield = document.getElementById("searchfield") as HTMLInputElement;
        searchfield.addEventListener("input", async () => {
            const searchResultsElement = document.getElementById("searchresults") as HTMLDivElement;
            if (searchfield.value.length < 3) {
                searchResultsElement.innerHTML = "";
                return;
            }

            const searchResults = await AIS.search(searchfield.value, { excludePorts: true });

            DisplayVesselInfo.displaySearchResults(searchResultsElement, map, searchResults);
        });
    }

    public static enableBackButton(): void {
        const searchResults = document.querySelectorAll(".back-button");
        searchResults.forEach((element: HTMLSpanElement) => {
            element.addEventListener("click", () => {
                const tabName = document.getElementById("main-title") as HTMLSpanElement;
                tabName.textContent = "Schip zoeken";
                document.getElementById("main-shipinfo").style.display = "none";
                document.getElementById("main-search").style.display = "block";
                DisplayVesselInfo.circle.clearLayers();
            });
        });
    }

    public static async showVessels(map: Leaflet.Map, sidebar: Leaflet.Control.Sidebar): Promise<void> {
        const nearbyVessels = await DisplayVesselInfo.getNearbyVessels(map, sidebar);
        this.main.clearLayers();
        nearbyVessels.forEach((vesselInfo) => DisplayVesselInfo.drawVesselOnMap(map, sidebar, vesselInfo));
    }

    private static displaySearchResults(element: HTMLDivElement, map: L.Map, searchResults: SearchResult[]): void {
        element.innerHTML = ""

        if (searchResults.length === 0) {
            return;
        }

        searchResults.forEach((searchResult) => DisplayVesselInfo.displaySearchResult(searchResult, element, map));
    }

    private static displaySearchResult(searchResult: SearchResult, element: HTMLDivElement, map: Leaflet.Map) {
        const div = document.createElement("div");
        div.classList.add("list-group-item", "list-group-item-action", "my-2");

        const title = document.createElement("strong");
        title.classList.add("mb-1");
        title.innerText = `${searchResult.name} (${searchResult.flag})`;

        const info = document.createElement("p");
        info.classList.add("mb-1", "small");
        info.innerHTML = `${searchResult.typeText} (${searchResult.mmsi || searchResult.portId})`;

        div.append(title, info);
        element.append(div);

        div.addEventListener("click", () => {
            if (searchResult.mmsi) {
                this.showVesselOnMap(searchResult.mmsi, map, true, undefined);
            } else if (searchResult.portId) {
                //TODO: PortInfo.show(map)
            }
        });
    }

    /**
     * change back button action
     * @param mssi mssi of a ship, undefined if none
     * @param map leaflet map
     */
    public static changeBackButton(mssi: number, map: Leaflet.Map): void {
        // replace all backbutton elements to remove all eventlisteners on them
        document.querySelectorAll(".back-button").forEach((element: HTMLSpanElement) => {
            element.parentNode.replaceChild(element.cloneNode(true), element);
        });

        // add the new event listeners
        document.querySelectorAll(".back-button").forEach((element: HTMLSpanElement) => {
            element.addEventListener("click", () => {
                if (mssi !== null) {
                    DisplayVesselInfo.showVesselOnMap(mssi, map, true, undefined);
                } else {
                    DisplayVesselInfo.shipBackButton();
                }
            });
        });

    }

    /**
     * back to search
     */
    public static shipBackButton(): void {
        const tabName = document.getElementById("main-title") as HTMLSpanElement;
        tabName.textContent = "Schip zoeken";
        document.getElementById("main-shipinfo").style.display = "none";
        document.getElementById("main-search").style.display = "block";
        DisplayVesselInfo.circle.clearLayers();
    }

    private static async getNearbyVessels(map: Leaflet.Map, sidebar: Leaflet.Control.Sidebar) {
        const nearbyVessels: SimpleVesselInfo[] = await AIS.getNearbyVessels(map, { includePorts: false });
        return nearbyVessels.filter((vesselInfo: SimpleVesselInfo) => vesselInfo.latitude && vesselInfo.longitude && DisplayVesselInfo.VESSEL_COLORS[vesselInfo.vesselType]);
    }

    private static drawVesselOnMap(map: L.Map, sidebar: L.Control.Sidebar, vesselInfo: SimpleVesselInfo) {
        const location = Leaflet.latLng(
            Number(vesselInfo.latitude),
            Number(vesselInfo.longitude)
        );

        // update marker position
        if (this.circle.getLayers().length !== 0 && this.circle.getLayers()[0].getAttribution() === String(vesselInfo.mmsi)) {
            this.circle.clearLayers();
            Leaflet.circleMarker(location, {radius: 12, attribution: String(vesselInfo.mmsi)}).addTo(this.circle);
        }

        const ship = Leaflet.trackSymbol(location, {
            trackId: vesselInfo.mmsi,
            fill: true,
            fillColor: DisplayVesselInfo.VESSEL_COLORS[vesselInfo.vesselType],
            fillOpacity: 1.0,
            stroke: true,
            color: "#000000",
            opacity: 1.0,
            weight: 1.0,
            speed: vesselInfo.speed,
            course: vesselInfo.direction * Math.PI / 180,
            heading: vesselInfo.direction * Math.PI / 180,
            updateTimestamp: vesselInfo.requestTime
        });


        ship.on("click", (context) => {
            // TODO: Open sidebar
            sidebar.open("home");

            this.circle.clearLayers();
            this.showVesselOnMap(vesselInfo.mmsi, map, false, vesselInfo.requestTime);
        });

        ship.addTo(this.main);
    }

    public static async showVesselOnMap(mmsi: number, map: Leaflet.Map, zoom: boolean, updateTimestamp: Date) {
        DisplayVesselInfo.changeBackButton(null, map);

        const selectedVessel: Vessel = await AIS.getVessel(mmsi);
        document.getElementById("main-search").style.display = "none";
        document.getElementById("main-shipinfo").style.display = "block";
        document.getElementById("main-title").textContent = "Scheepsinformatie";
        document.getElementById("shipname").textContent = selectedVessel.name;

        DisplayVesselInfo.loadTableData(map, selectedVessel, updateTimestamp);

        const location: LocationInfo = await selectedVessel.getLocation() as LocationInfo;
        if (zoom) {
            map.flyTo(new Leaflet.LatLng(location.latitude, location.longtitude), 16);
        }

        Leaflet.circleMarker([location.latitude, location.longtitude], {radius: 12, attribution: String(mmsi)}).addTo(this.circle);
    }

    private static loadTableData(map: Leaflet.Map, vessel: Vessel, updateTimestamp: Date) {
        const table = document.getElementById("shipinfo-content") as HTMLTableElement;
        table.innerHTML = "";

        this.addInfoRow(table, "IMO", vessel.imo ? vessel.imo : "Unknown");
        this.addInfoRow(table, "MMSI", vessel.mmsi);
        this.addInfoRow(table, "Type", vessel.typeText);
        this.addInfoRow(table, "Status", vessel.statusText);
        this.addInfoRow(table, "Location timestamp", updateTimestamp? format(updateTimestamp, "HH:mm, dd MMM") : "Unknown");
        this.addInfoRow(table, "Country of origin", `${vessel.country} [${vessel.flag}]`);
        this.addInfoRow(table, "ETA", vessel.ETA ? vessel.ETA.toLocaleString() : "Unknown");
        this.addInfoRow(table, "Velocity", `${vessel.course}° at ${vessel.speed} knots`);
        this.addInfoRow(table, "Length", `${vessel.length}m`);
        this.addInfoRow(table, "Width", `${vessel.width}m`);
        this.addInfoRow(table, "Draught", vessel.draught ? `${vessel.draught}m` : "Unknown");
        this.addInfoRow(table, "Safe depth range", (typeof vessel.minDepth === "number" && typeof vessel.maxDepth === "number") ? `${vessel.minDepth}m to ${vessel.maxDepth}m` : "Unknown");
        this.addInfoRow(table, "Last draught", vessel.lastDraught ? `${vessel.lastDraught}m (${vessel.lastDraughtChange ? vessel.lastDraughtChange.toLocaleString() : ''})` : "Unknown");
        this.addPortRow(table, "Last port", vessel.lastPort, map, vessel.mmsi);
        this.addPortRow(table, "Current port", vessel.port, map, vessel.mmsi);
        this.addPortRow(table, "Next port", vessel.nextPort, map, vessel.mmsi);
        this.addImage(table, "Image", vessel.mmsi);
    }

    private static addInfoRow(table: HTMLTableElement, key: string, value: string | number | Date | void): HTMLTableRowElement {
        const row = table.insertRow();
        const nameCell = row.insertCell(0);
        const valueCell = row.insertCell(1);

        nameCell.innerHTML = `<b>${key}</b>`;
        valueCell.innerHTML = String(value);

        return row;
    }

    private static addPortRow(table: HTMLTableElement, title: string, port: Port, map: Leaflet.Map, mmsi: number){
        const portRow = this.addInfoRow(table, title , port.name || "Unknown");
        portRow.addEventListener("click", () => DisplayPortInfo.show(map, port, mmsi));
    }

    private static addImage(table: HTMLTableElement, key: string, mmsi: number): HTMLTableRowElement {
        let imageSrcString = "";
        imageSrcString = `https://www.myshiptracking.com/requests/getimage-normal/${mmsi}.jpg`

        const row = table.insertRow();

        let rowHTML =
        /*html*/
        `
        <tr>
            <td colspan="2">
                <img id="ship-image" style="max-width: 100%; height: auto;"
                src="${imageSrcString}"
                alt="Could not find an image for this vessel.">
            </td>
        </tr>
        `

        row.innerHTML = rowHTML;

        return row;
    }
}
