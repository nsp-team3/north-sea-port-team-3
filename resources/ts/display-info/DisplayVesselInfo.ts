import AIS from "../api/AIS";
import { Port } from "../api/Port";
import { Vessel } from "../api/Vessel";
import Search from "../search/Search";
import { SearchResult } from "../types/SearchTypes";
import SimpleVesselInfo from "../types/SimpleVesselInfo";
import DisplayInfo from "./DisplayInfo";

export default class DisplayVesselInfo extends DisplayInfo {
    public constructor(mainDivId: string, titleId: string, infoTableId: string, backButtonId: string) {
        super(mainDivId, titleId, infoTableId, backButtonId);
    }

    public async show(searchResult: SearchResult | SimpleVesselInfo, previous?: Search): Promise<void> {
        this.clearTable();
        const vessel: Vessel = await AIS.getVessel(searchResult.mmsi);
        this.setTitle(vessel.name);
        this.loadTableData(vessel, (searchResult as SimpleVesselInfo).requestTime);
        this.setPrevious(previous);
        this.showDiv();
    }

    protected loadTableData(vessel: Vessel, lastSignal?: Date): void {
        this.addInfoRow("IMO", vessel.imo ? String(vessel.imo) : "Onbekend");
        this.addInfoRow("MMSI", String(vessel.mmsi));
        this.addInfoRow("Type", vessel.typeText);
        this.addInfoRow("Status", vessel.statusText);
        this.addInfoRow("Laatste AIS signaal", lastSignal ? lastSignal.toLocaleDateString() : "Onbekend");
        this.addInfoRow("Land van herkomst", `${vessel.country} [${vessel.flag}]`);
        this.addInfoRow("ETA", vessel.ETA ? vessel.ETA.toLocaleString() : "Onbekend");
        this.addInfoRow("Snelheid", `${vessel.course}° met ${vessel.speed} knoop`);
        this.addInfoRow("Lengte", `${vessel.length}m`);
        this.addInfoRow("Breedte", `${vessel.width}m`);
        this.addInfoRow("Diepgang", vessel.draught ? `${vessel.draught}m` : "Onbekend");
        this.addInfoRow("Veilig dieptebereik", (typeof vessel.minDepth === "number" && typeof vessel.maxDepth === "number") ? `${vessel.minDepth}m to ${vessel.maxDepth}m` : "Onbekend");
        this.addInfoRow("Laatste diepgang verandering", vessel.lastDraught ? `${vessel.lastDraught}m (${vessel.lastDraughtChange ? vessel.lastDraughtChange.toLocaleString() : ''})` : "Onbekend");
        this.addPortRow("Laatste port", vessel.lastPort, vessel);
        this.addPortRow("Huidige port", vessel.port, vessel);
        this.addPortRow("Volgende port", vessel.nextPort, vessel);
        this.addVesselImage(vessel.mmsi);
    }

    private addPortRow(title: string, port: Port, vessel: Vessel){
        const portRow = this.addInfoRow(title, port.name || "Onbekend");
        // portRow.addEventListener("click", () => DisplayPortInfo.show(map, port, mmsi));
    }


    private addVesselImage(mmsi: number): void {
        const row = this.infoTable.insertRow();

        const td = row.insertCell(0);
        td.colSpan = 2;

        const img = document.createElement("img");
        img.id = "vessel-image";
        img.style.maxWidth = "100%";
        img.style.height = "auto";
        img.src = `https://www.myshiptracking.com/requests/getimage-normal/${mmsi}.jpg`;
        img.alt = "Voor dit schip kon geen afbeelding gevonden worden.";

        td.appendChild(img);
    }
}
