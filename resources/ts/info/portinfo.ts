import { Port } from "../api/Port";
import * as Leaflet from "leaflet";

export default class PortInfo{
    public static async show(map: Leaflet.Map, port: Port){
        document.getElementById("main-search").style.display = "none";
        document.getElementById("main-shipinfo").style.display = "block";
        document.getElementById("main-title").textContent = "Haven informatie";
        document.getElementById("shipname").textContent = port.name || "Unknown";

        const info = await port.getInfo();
        console.log(info);

        this.loadTableData(port);
    }

    private static addInfoRow(table: HTMLTableElement, key: string, value: string | number | Date | void): HTMLTableRowElement {
        const row = table.insertRow();
        const nameCell = row.insertCell(0);
        const valueCell = row.insertCell(1);

        nameCell.innerHTML = `<b>${key}</b>`;
        valueCell.innerHTML = String(value);

        return row;
    }

    private static loadTableData(port: Port){
        const table = <HTMLTableElement>document.getElementById("shipinfo-content");
        table.innerHTML = "";

        this.addInfoRow(table, "Name", port.name ? `${port.name} (${port.id})`: "Unknown");
        this.addInfoRow(table, "Country", port.country ? `${port.country} (${port.countryCode})` : "Unknown");
        port.ETA ? this.addInfoRow(table, "ETA", port.ETA) : null;
        port.departTime ? this.addInfoRow(table, "Time of departure", port.departTime) : null;
        port.arrivalTime ? this.addInfoRow(table, "Time of arrival", port.arrivalTime) : null;
        
    }
}