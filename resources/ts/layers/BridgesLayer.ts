import * as Leaflet from "leaflet";
import Layer from "./Layer";

export default class BridgesLayer extends Layer {
    /**
     * minimale zoom om bruggen zichtbaar te hebben
     */
    private readonly MIN_ZOOM: number = 11;
    /**
     * nestedLayer { bridgelayer { bridgeinfo }}
     * laag in laag zodat de informatie snel weg en terug gehaald kan worden,
     * door de laag opnieuw te koppelen zonder informatie opnieuw op te vragen.
     */
    private _nestedLayer: Leaflet.LayerGroup;

    /**
     * @param map koppeling met de kaart, voor bijv. zichtbaarheid gebaseerd op zoomniveau
     */
    public constructor(map: L.Map) {
        super(map);
        this._nestedLayer = new Leaflet.LayerGroup();
    }

    public async show(): Promise<void> {
        // niet laten zien waneer er te ver is uitgezoomd
        if (this._map.getZoom() >= this.MIN_ZOOM) {
            const bridgesData = await this.fetchBridges();
            this._nestedLayer.clearLayers();
            this._layerGroup.clearLayers();

            bridgesData.forEach((bridgeData: object) => {
                this.displayBridge(bridgeData);
            });

            this._layerGroup.addLayer(this._nestedLayer);
        } else {
            this._nestedLayer.clearLayers();
            this._layerGroup.clearLayers();
        }
    }

    /**
     * windinformatie laag verwijderen van de windlaag,
     * zodat windinfromatie niet op de map staat, bijv. voor zoomen
     */
    public hide(): void {
        this._layerGroup.removeLayer(this._nestedLayer);
    }

    /**
     * Ophalen van de bruggen gebaseerd op positie
     * @returns bruggen van de bruggenapi
     */
    private async fetchBridges(): Promise<any> {
        // ophalen van de hoeken van het zichtbare scherm
        const bounds = this._map.getBounds();
        const sw = bounds.getSouthWest();
        const ne = bounds.getNorthEast();

        // gebaseerd op wat hierin valt, data opvragen
        const res = await fetch("/api/bridges", {
            "body": `a=${sw.lat}&b=${ne.lng}&c=${ne.lat}&d=${sw.lng}&e=0&f=0&g=0&h=0&i=0&j=0&k=0&l=0&m=0&n=0&o=0&p=0&q=0&r=0&s=0&t=0&u=0&v=1&w=0&x=0&y=0&z=0`,
            "method": "post"
        }).catch(console.error);
        if (res) {
            return await res.json().catch(console.error);
        }
    }

    /**
     * voegt de brug toe aan de bruggenlayer en koppeld een onclick voor popup
     * @param bridge een brug via de bruggenapi
     */
    private displayBridge(bridge: any): void {
        const myIcon = Leaflet.icon({
            iconUrl: `https://waterkaart.net/items/images/iconen/${bridge.icoo}.png`,
            iconSize: [24, 14],
            className: bridge.RWS_Id,
        });
        const marker = Leaflet.marker([
            bridge.lat,
            bridge.lng
        ], {
            icon: myIcon
        });
        marker.addTo(this._nestedLayer);
        marker.on("click", (event: L.LeafletMouseEvent) => this.handleBridgeClick(event, bridge));
    }

    /**
     * Probeerd een foto op te halen van een schip,
     * wanneer die niet is gevonden geeft hij niks terug
     * @param bridge bruginformatie van de api
     * @returns img element in string: "<img>"
     */
    private async fetchBridgePicture(bridge: any): Promise<string> {
        // aanmaken van ?locatie=6554&name=brug....
        const params = new URLSearchParams({
            locatie: bridge.extradata,
            name: bridge.name,
            os: "web",
        });
        // sluis of brug als type defineren
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


    /**
     * laat de popup zien wanneer op een schip geklikt is
     * @param event de onclick event van de bruggenicoon
     * @param bridge bruginformatie
     */
    private async handleBridgeClick(event: L.LeafletMouseEvent, bridge: any): Promise<void> {
        let data = "Geen gegevens."

        // telefoonnummber toevoegen wanneer beschikbaar
        if (bridge.lnk.length > 4) {
            const res = await fetch(`http://api.geonames.org/countryCodeJSON?lat=${bridge.lat}&lng=${bridge.lng}&username=zefanjajobse`).catch(console.error);
            if (res) {
                const json: { countryCode: string } = await res.json();
                if (["NL", "BE"].includes(json.countryCode) && bridge.lnk.charAt(0) === "0") {
                    const countryCodes: { [id: string]: string } = {
                        "NL": "+31-",
                        "BE": "+32-"
                    }
                    bridge.lnk = countryCodes[json.countryCode] + bridge.lnk.substr(1, 99);
                }
            }
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
            data += await this.fetchBridgePicture(bridge);
        }

        // popup zichtbaar maken
        Leaflet.popup().setLatLng(event.latlng).setContent(data).openOn(this._map);
    }
}
