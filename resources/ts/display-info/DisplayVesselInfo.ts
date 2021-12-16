import * as Leaflet from "leaflet";
import AIS from "../api/AIS";
import { Port } from "../api/Port";
import { Vessel } from "../api/Vessel";
import SimpleVesselInfo from "../types/SimpleVesselInfo";
import DisplayInfo from "./DisplayInfo";

export default class DisplayVesselInfo extends DisplayInfo {
    protected TITLE_TEXT: string = "Schepen";

    public constructor(map: L.Map, sidebar: L.Control.Sidebar) {
        super(map, sidebar);
    }

    public async show(searchResult: SimpleVesselInfo): Promise<void> {
        this.clear();
        const vessel: Vessel = await AIS.getVessel(searchResult.mmsi);
        this.clear();
        this.loadTableData(vessel, (searchResult as SimpleVesselInfo).requestTime);
        this.sidebar.open(DisplayInfo.DETAILS_ID);
        const locationInfo = await vessel.getLocationInfo();
        if (location) {
            this.map.flyTo(new Leaflet.LatLng(locationInfo.latitude, locationInfo.longitude), 16, {
                duration: 3
            });
        }
    }

    protected loadTableData(vessel: Vessel, lastSignal?: Date): void {
        const unknownText = "Onbekend";
        this.addInfoRow("Naam", vessel.name ? vessel.name : unknownText);
        this.addInfoRow("IMO", vessel.imo ? String(vessel.imo) : unknownText);
        this.addInfoRow("Type", vessel.typeText);
        this.addInfoRow("Status", vessel.statusText);
        this.addInfoRow("Country of origin", `${vessel.country} [${vessel.flag}]`);
        this.addInfoRow("ETA", vessel.ETA ? vessel.ETA.toLocaleString() : unknownText);
        this.addInfoRow("Koers", `${vessel.course}°`);
        this.addInfoRow("Snelheid", `${vessel.speed} knopen`);
        this.addInfoRow("Lengte", `${vessel.length}m`);
        this.addInfoRow("Breedte", `${vessel.width}m`);
        this.addInfoRow("Diepte", vessel.draught ? `${vessel.draught}m` : unknownText);
        this.addPortRow("Vorige haven", vessel.lastPort, vessel);
        this.addPortRow("Huidige haven", vessel.port, vessel);
        this.addPortRow("Volgende haven", vessel.nextPort, vessel);
        this.addInfoRow("Laatste update AIS", lastSignal ? lastSignal.toLocaleDateString() : unknownText);
        this.addInfoRow("MMSI", String(vessel.mmsi));
        this.addVesselImage(vessel.mmsi);
    }

    private addPortRow(title: string, port: Port, vessel: Vessel){
        const portRow = this.addInfoRow(title, port.name || "Onbekend");
        // portRow.addEventListener("click", () => DisplayPortInfo.show(map, port, mmsi));
    }

    private addVesselImage(mmsi: number): void {
        const row = this.detailsTable.insertRow();

        const td = row.insertCell(0);
        td.colSpan = 2;

        const img = document.createElement("img");
        img.id = "vessel-image";
        img.style.maxWidth = "100%";
        img.style.height = "auto";
        img.src = `https://www.myshiptracking.com/requests/getimage-normal/${mmsi}.jpg`;
        img.alt = "Could not find an image for this vessel.";

        td.appendChild(img);
    }
}