import { LatLng } from "leaflet";
import AIS from "../api/AIS";
import Layer from "../layers/Layer";
import PortInfoResponse from "../types/PortInfoResponse";
import { SearchResult } from "../types/SearchTypes";
import DisplayInfo from "./DisplayInfo";

export default class DisplayPortInfo extends DisplayInfo {
    protected TITLE_TEXT: string = "Havens";

    public constructor(layer: Layer, sidebar: L.Control.Sidebar) {
        super(layer, sidebar);
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
        this.sidebar.open(DisplayInfo.DETAILS_ID);
        this.map.flyTo(new LatLng(port.latitude, port.longitude), 16);
    }

    protected loadTableData(port: PortInfoResponse): void {
        this.addInfoRow("Port ID", port.id ? String(port.id): "Onbekend");
        this.addInfoRow("Land", port.country ? `${port.country} (${port.countryCode})` : "Onbekend");
        this.addInfoRow("Coördinaten", port.latitude ? `${port.latitude}, ${port.longitude}` : "Onbekend");
    }
}
