import * as L from "leaflet";

export default class Bridges {
    public static main = L.layerGroup();

    public static async getBridges(map: L.Map): Promise<void> {
        const bounds = map.getBounds();
        const sw = bounds.getSouthWest();
        const ne = bounds.getNorthEast();

        const res = await fetch("/api/bridges", {
            "body": `a=${sw.lat}&b=${ne.lng}&c=${ne.lat}&d=${sw.lng}&e=0&f=0&g=0&h=0&i=0&j=0&k=0&l=0&m=0&n=0&o=0&p=0&q=0&r=0&s=0&t=0&u=0&v=1&w=0&x=0&y=0&z=0`,
            "method": "post"
        })
        const body = await res.json()

        Bridges.main.clearLayers();

        Object.keys(body).forEach((bridge) => {
            Bridges.displayBridge(body[bridge]);
        });
    }

    private static displayBridge(bridge: any) {
        var myIcon = L.icon({
            iconUrl: `https://waterkaart.net/items/images/iconen/${bridge.icoo}.png`,
            iconSize: [24, 14],
            className: bridge.RWS_Id,
        });
        const marker = L.marker([bridge.lat, bridge.lng], { icon: myIcon });
        marker.addTo(Bridges.main);
        // marker.on("click", (event: L.LeafletMouseEvent) => this.handleBridgeClick(event, map));
    }

    // private static async handleBridgeClick(event: L.LeafletMouseEvent, map: L.Map): Promise<void> {
    //     const id = event.sourceTarget.options.icon.options.className;
    //     const params = new URLSearchParams({
    //         id: id,
    //     });
    //     const res = await fetch(`https://www.brug-open.nl/openstreet/jsonHtmlTag/?${params}`).catch(console.error);
    //     if (res) {
    //         const data = await res.json().catch(console.error);
    //         L.popup()
    //             .setLatLng(event.latlng)
    //             .setContent(data.html)
    //             .openOn(map);
    //     }
    // }
}
