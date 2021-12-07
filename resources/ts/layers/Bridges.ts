import * as L from "leaflet";

export default class Bridges {
    public static main = L.layerGroup();

    public static async getBridges(map: L.Map): Promise<void> {
        if (map.getZoom() > 11) {
            const bounds = map.getBounds();
            const sw = bounds.getSouthWest();
            const ne = bounds.getNorthEast();

            const res = await fetch("/api/bridges", {
                "body": `a=${sw.lat}&b=${ne.lng}&c=${ne.lat}&d=${sw.lng}&e=0&f=0&g=0&h=0&i=0&j=0&k=0&l=0&m=0&n=0&o=0&p=0&q=0&r=0&s=0&t=0&u=0&v=1&w=0&x=0&y=0&z=0`,
                "method": "post"
            });
            const body = await res.json();

            Bridges.main.clearLayers();

            Object.keys(body).forEach((bridge) => {
                Bridges.displayBridge(body[bridge], map);
            });
        } else {
            Bridges.main.clearLayers();
        }
    }

    private static displayBridge(bridge: any, map: L.Map): void {
        const myIcon = L.icon({
            iconUrl: `https://waterkaart.net/items/images/iconen/${bridge.icoo}.png`,
            iconSize: [24, 14],
            className: bridge.RWS_Id,
        });
        const marker = L.marker([
            bridge.lat,
            bridge.lng
        ], {
            icon: myIcon
        });
        marker.addTo(Bridges.main);
        marker.on("click", (event: L.LeafletMouseEvent) => this.handleBridgeClick(event, bridge, map));
    }

    private static async bridgePicture(bridge: any) {
        const params = new URLSearchParams({
            locatie: bridge.extradata,
            name: bridge.name,
            os: "web",
        });
        if (bridge.icoo == "sluis") {
            params.append("soort", "sluis")
        } else {
            params.append("soort", "brug")
        }
        const res = await fetch(`/api/detailedbridge?${params}`).catch(console.error);
        if (res) {
            const html = await res.text();
            const doc = new DOMParser().parseFromString(html, 'text/html');
            const image = doc.querySelector('img');
            if (image !== null) {
                return image.outerHTML;
            }
        }
        return "";
    }

    private static async handleBridgeClick(event: L.LeafletMouseEvent, bridge: any, map: L.Map): Promise<void> {
        let data = "Geen gegevens."

        // telefoonnummber toevoegen wanneer beschikbaar
        if (bridge.lnk.length > 4) {
            data = "<h6>" + bridge.name + "</h6><b>Telefoonnummer: </b>" + bridge.lnk
        } else {
            data = "<h6>" + bridge.name + "</h6>Geen bijzonderheden"
        }

        // hoogte/breedte toevoegen wanneer beschikbaar
        if ("" != bridge.hoogte) {
            data += "<br><b>Doorvaarthoogte</b>: " + bridge.hoogte + " meter <br><b>Breedte:</b> " + bridge.breedte + " meter."
        } else {
            data += "<br>Doorvaarhoogte en -breedte onbekend";
        }

        if (["sluit", "brug_open"].includes(bridge.icoo)) {
            data += await Bridges.bridgePicture(bridge);
        }

        L.popup()
        .setLatLng(event.latlng)
        .setContent(data)
        .openOn(map);
    }
}
