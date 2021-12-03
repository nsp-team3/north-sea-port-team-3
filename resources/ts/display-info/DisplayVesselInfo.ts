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
        this.addInfoRow("IMO", vessel.imo ? String(vessel.imo) : "Unknown");
        this.addInfoRow("MMSI", String(vessel.mmsi));
        this.addInfoRow("Type", vessel.typeText);
        this.addInfoRow("Status", vessel.statusText);
        this.addInfoRow("Last AIS signal", lastSignal ? lastSignal.toLocaleDateString() : "Unknown");
        this.addInfoRow("Country of origin", `${vessel.country} [${vessel.flag}]`);
        this.addInfoRow("ETA", vessel.ETA ? vessel.ETA.toLocaleString() : "Unknown");
        this.addInfoRow("Velocity", `${vessel.course}° at ${vessel.speed} knots`);
        this.addInfoRow("Length", `${vessel.length}m`);
        this.addInfoRow("Width", `${vessel.width}m`);
        this.addInfoRow("Draught", vessel.draught ? `${vessel.draught}m` : "Unknown");
        this.addInfoRow("Safe depth range", (typeof vessel.minDepth === "number" && typeof vessel.maxDepth === "number") ? `${vessel.minDepth}m to ${vessel.maxDepth}m` : "Unknown");
        this.addInfoRow("Last draught change", vessel.lastDraught ? `${vessel.lastDraught}m (${vessel.lastDraughtChange ? vessel.lastDraughtChange.toLocaleString() : ''})` : "Unknown");
        this.addPortRow("Last port", vessel.lastPort, vessel);
        this.addPortRow("Current port", vessel.port, vessel);
        this.addPortRow("Next port", vessel.nextPort, vessel);
        this.addVesselImage(vessel.mmsi);
    }

    private addPortRow(title: string, port: Port, vessel: Vessel){
        const portRow = this.addInfoRow(title, port.name || "Unknown");
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
        img.alt = "Could not find an image for this vessel.";

        td.appendChild(img);
    }
}