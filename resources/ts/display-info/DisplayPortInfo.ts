import AIS from "../api/AIS";
import Search from "../search/Search";
import PortInfoResponse from "../types/PortInfoResponse";
import { SearchResult } from "../types/SearchTypes";
import DisplayInfo from "./DisplayInfo";

export default class DisplayPortInfo extends DisplayInfo {
    public constructor(mainDivId: string, titleId: string, infoTableId: string, backButtonId: string) {
        super(mainDivId, titleId, infoTableId, backButtonId);
    }

    public async show(searchResult: SearchResult, previous: Search | DisplayInfo): Promise<void> {
        this.clearTable();
        const port: PortInfoResponse | void = await AIS.getPort(searchResult.portId);
        if (!port) {
            console.error(`Kon geen port vinden met het ID: ${searchResult.portId}!`);
            return;
        }

        this.setTitle(port.name);
        this.loadTableData(port);
        this.setPrevious(previous);
        this.showDiv();
    }

    protected loadTableData(port: PortInfoResponse): void {
        this.addInfoRow("Port ID", port.id ? String(port.id): "Onbekend");
        this.addInfoRow("Land", port.country ? `${port.country} (${port.countryCode})` : "Onbekend");
        this.addInfoRow("Coördinaten", port.latitude ? `${port.latitude}, ${port.longitude}` : "Onbekend");
    }
}
