import AIS from "../api/AIS";
import Search from "../search/Search";
import PortInfoResponse from "../types/PortInfoResponse";
import { SearchResult } from "../types/SearchTypes";
import DisplayInfo from "./DisplayInfo";

export default class DisplayPortInfo extends DisplayInfo {
    protected TITLE_TEXT: string = "Havens";

    public constructor(map: L.Map, sidebar: L.Control.Sidebar) {
        super(map, sidebar);
    }

    public async show(searchResult: SearchResult): Promise<void> {
        this.clear();
        const port: PortInfoResponse | void = await AIS.getPort(searchResult.portId);
        if (!port) {
            console.error(`Could not find port with id: ${searchResult.portId}!`);
            return;
        }
        
        this.setTitle(port.name);
        this.loadTableData(port);
    }

    protected loadTableData(port: PortInfoResponse): void {
        this.addInfoRow("Id", port.id ? String(port.id): "Unknown");
        this.addInfoRow("Country", port.country ? `${port.country} (${port.countryCode})` : "Unknown");
        this.addInfoRow("Coordinates", port.latitude ? `${port.latitude}, ${port.longitude}` : "Unknown");
    }
}