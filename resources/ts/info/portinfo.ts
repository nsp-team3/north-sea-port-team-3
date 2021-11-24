import { Port } from "../api/Port";
import * as Leaflet from "leaflet";
import PortInfoResponse from "../types/PortInfoResponse";

export default class PortInfo {
    public static async show(map: Leaflet.Map, port: Port){
        document.getElementById("main-search").style.display = "none";
        document.getElementById("main-shipinfo").style.display = "block";
        document.getElementById("main-title").textContent = "Haven informatie";
        document.getElementById("shipname").textContent = port.name || "Unknown";

        const info: PortInfoResponse | void = await port.getInfo();

        if (info) {
            map.flyTo(new Leaflet.LatLng(info.latitude, info.longitude), 16);
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
            this.addInfoRow(table, "Longitude", info.longitude);
            this.addInfoRow(table, "Latitude", info.latitude);
        }

        port.ETA ? this.addInfoRow(table, "ETA", port.ETA) : null;
        port.departTime ? this.addInfoRow(table, "Time of departure", port.departTime) : null;
        port.arrivalTime ? this.addInfoRow(table, "Time of arrival", port.arrivalTime) : null;
        
    }
}