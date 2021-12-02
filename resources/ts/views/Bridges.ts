import * as L from "leaflet";

export default class Bridges {
    public static main = L.layerGroup();
    private static BASE_URL = "https://www.brug-open.nl/openstreet/jsonBruggen/";

    public static async getBruggen(map: L.Map) {
        const res = await fetch("/api/brugtoken");
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

        L.marker([values.lat, values.lon], { icon: myIcon })
            .addTo(Bridges.main)
            .on("click", async (event: L.LeafletMouseEvent) => {
                const id = event.sourceTarget.options.icon.options.className;
                const params = new URLSearchParams({
                    id: id,
                });
                const res = await fetch(`https://www.brug-open.nl/openstreet/jsonHtmlTag/?${params}`);
                const data = await res.json().catch(console.error);
                L.popup()
                    .setLatLng(event.latlng)
                    .setContent(data.html)
                    .openOn(map);
            });
    }
}
