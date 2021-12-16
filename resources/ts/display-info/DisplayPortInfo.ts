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
            console.error(`Kon geen port vinden met het ID: ${searchResult.portId}!`);
            return;
        }

        this.setTitle(port.name);
        this.loadTableData(port);
    }

    protected loadTableData(port: PortInfoResponse): void {
        this.addInfoRow("Port ID", port.id ? String(port.id): "Onbekend");
        this.addInfoRow("Land", port.country ? `${port.country} (${port.countryCode})` : "Onbekend");
        this.addInfoRow("Coördinaten", port.latitude ? `${port.latitude}, ${port.longitude}` : "Onbekend");
    }
}
