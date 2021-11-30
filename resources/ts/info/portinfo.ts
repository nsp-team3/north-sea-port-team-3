import { Port } from "../api/Port";
import * as Leaflet from "leaflet";
import PortInfoResponse from "../types/PortInfoResponse";
import ShipInfo from "./shipinfo";

export default class PortInfo {
    private static portSizeToZoomLevel: {[index: string]: number} = {
        "XSmall": 18,
        "Small": 17,
        "Medium": 16,
        "Large": 15,
        "XLarge": 14
    };

    public static async show(map: Leaflet.Map, port: Port){
        document.getElementById("main-search").style.display = "none";
        document.getElementById("main-shipinfo").style.display = "block";
        document.getElementById("main-title").textContent = "Haven informatie";
        document.getElementById("shipname").textContent = port.name || "Unknown";
        document.getElementById("ship-image").innerHTML = '';

        const info: PortInfoResponse | void = await Port.getInfo(port.id);

        if (info) {
            map.flyTo(new Leaflet.LatLng(info.latitude, info.longitude), PortInfo.portSizeToZoomLevel[info.size]);
        }

        await this.loadTableData(port, info);
    }

    private static addInfoRow(table: HTMLTableElement, key: string, value: string | number | Date | void): HTMLTableRowElement {
        const row = table.insertRow();
        const nameCell = row.insertCell(0);
        const valueCell = row.insertCell(1);

        nameCell.innerHTML = `<b>${key}</b>`;
        valueCell.innerHTML = String(value);

        return row;
    }

    private static async loadTableData(port: Port, info: PortInfoResponse | void) {
        const table = <HTMLTableElement>document.getElementById("shipinfo-content");
        table.innerHTML = "";

        this.addInfoRow(table, "Name", port.name ? `${port.name} (${port.id})`: "Unknown");
        this.addInfoRow(table, "Country", port.country ? `${port.country} (${port.countryCode})` : "Unknown");


        if (info) {
            // TODO: Might replace this with a button, so you're taken to these coordinates.
            this.addInfoRow(table, "Location", `Latitude: ${info.latitude}\nLongitude: ${info.longitude}`);
        }

        port.ETA ? this.addInfoRow(table, "ETA", port.ETA) : null;
        port.departTime ? this.addInfoRow(table, "Time of departure", port.departTime) : null;
        port.arrivalTime ? this.addInfoRow(table, "Time of arrival", port.arrivalTime) : null;
    }
}
