import PortInfo from "../api/PortInfo";
import VesselAPI from "../api/VesselAPI";
import { VesselInfo } from "../api/VesselInfo";
import DisplayInfo from "./DisplayInfo";

export default class DisplayVesselInfo extends DisplayInfo {
    public async show(mmsi: number): Promise<void> {
        this.clear();
        const vesselDetails = await VesselAPI.getDetails(mmsi).catch(console.error);
        if (vesselDetails) {
            this.clear();
            this.loadTableData(vesselDetails);
            this.sidebar.open(this.DETAILS_TAB_ID);
        }
    }

    protected loadTableData(vesselDetails: VesselInfo): void {
        const unknownText = "Onbekend";
        this.addInfoRow("Naam", vesselDetails.name ? vesselDetails.name : unknownText);
        this.addInfoRow("IMO", vesselDetails.imo ? String(vesselDetails.imo) : unknownText);
        this.addInfoRow("Lengte", vesselDetails.length !== 0 ? `${vesselDetails.length} meter` : unknownText);
        this.addInfoRow("Breedte", vesselDetails.width !== 0 ? `${vesselDetails.width} meter` : unknownText);
        this.addInfoRow("Diepte", vesselDetails.draught ? `${vesselDetails.draught} meter` : unknownText);
        this.addInfoRow("Koers", `${vesselDetails.course}°`);
        this.addInfoRow("Snelheid", `${vesselDetails.speed} knopen`);
        this.addInfoRow("Status", vesselDetails.statusText !== "Default" ? vesselDetails.statusText : unknownText);
        this.addInfoRow("ETA", vesselDetails.ETA ? vesselDetails.ETA.toLocaleString() : unknownText);
        this.addInfoRow("Type", vesselDetails.typeText);
        this.addInfoRow("Land van herkomst", `${vesselDetails.country} [${vesselDetails.flag}]`);
        // this.addPortRow("Vorige haven", vesselDetails.lastPort, vesselDetails);
        // this.addPortRow("Huidige haven", vesselDetails.port, vesselDetails);
        // this.addPortRow("Volgende haven", vesselDetails.nextPort, vesselDetails);
        // this.addInfoRow("Laatste update AIS", lastSignal ? lastSignal.toLocaleDateString() : unknownText);
        this.addInfoRow("MMSI", String(vesselDetails.mmsi));
        this.addVesselImage(vesselDetails.mmsi);
    }

    private addPortRow(title: string, port: PortInfo, vesselDetails: VesselInfo){
        const portRow = this.addInfoRow(title, port.name || "Onbekend");
        // portRow.addEventListener("click", () => this.portDisplay.show());
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
        img.alt = "Voor dit schip kon geen afbeelding gevonden worden.";

        td.appendChild(img);
    }
}