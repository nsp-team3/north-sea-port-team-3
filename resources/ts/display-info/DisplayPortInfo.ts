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
            console.error(`Could not find port with id: ${searchResult.portId}!`);
            return;
        }
        
        this.setTitle(port.name);
        this.loadTableData(port);
        this.setPrevious(previous);
        this.showDiv();
    }

    protected loadTableData(port: PortInfoResponse): void {
        this.addInfoRow("Id", port.id ? String(port.id): "Unknown");
        this.addInfoRow("Country", port.country ? `${port.country} (${port.countryCode})` : "Unknown");
        this.addInfoRow("Coordinates", port.latitude ? `${port.latitude}, ${port.longitude}` : "Unknown");
    }
}