import * as L from "leaflet";

export default class Bridges {
    public static main = L.layerGroup();
    private static BASE_URL = "https://www.brug-open.nl/openstreet/jsonBruggen/";

    public static async getBridges(map: L.Map): Promise<void> {
        const res = await fetch("/api/brugtoken").catch(console.error);
        if (!res) {
            return;
        }
        
        const body = await res.json();
        const res2 = await fetch(`${Bridges.BASE_URL}${body.token}`);
        const rawInfo = await res2.json();

        Bridges.main.clearLayers();

        Object.keys(rawInfo.markers).forEach((key) => {
            Bridges.displayBridge(rawInfo, key, map);
        });
    }

    private static displayBridge(rawInfo: any, key: string, map: L.Map) {
        const values = rawInfo.markers[key];
        var myIcon = L.icon({
            iconUrl: values.icon,
            iconSize: [20, 20],
            className: key,
        });

        const marker = L.marker([values.lat, values.lon], { icon: myIcon });
        marker.addTo(Bridges.main);
        marker.on("click", (event: L.LeafletMouseEvent) => this.handleBridgeClick(event, map));
    }

    private static async handleBridgeClick(event: L.LeafletMouseEvent, map: L.Map): Promise<void> {
        const id = event.sourceTarget.options.icon.options.className;
        const params = new URLSearchParams({
            id: id,
        });
        const res = await fetch(`https://www.brug-open.nl/openstreet/jsonHtmlTag/?${params}`).catch(console.error);
        if (res) {
            const data = await res.json().catch(console.error);
            L.popup()
                .setLatLng(event.latlng)
                .setContent(data.html)
                .openOn(map);
        }
    }
}
