import PortAPI from "../api/PortAPI";
import { PortDetails } from "../types/port-types";
import DisplayInfo from "./DisplayInfo";

export default class DisplayPortInfo extends DisplayInfo {
    public async show(portId: number): Promise<void> {
        this.clear();
        const portDetails = await PortAPI.getDetails(portId).catch(console.error);
        if (portDetails) {
            this.clear();
            this.loadTableData(portDetails);
            this.sidebar.open(this.DETAILS_TAB_ID);
        }
    }

    protected loadTableData(port: PortDetails): void {
        const unknownText = "Onbekend";
        this.addInfoRow("Naam", port.name ? port.name : unknownText);
        this.addInfoRow("Id", port.id ? String(port.id): unknownText);
        this.addInfoRow("Land", port.country ? `${port.country} (${port.countryCode})` : unknownText);
        this.addInfoRow("Coördinaten", port.latitude ? `${port.latitude}, ${port.longitude}` : unknownText);
    }
}