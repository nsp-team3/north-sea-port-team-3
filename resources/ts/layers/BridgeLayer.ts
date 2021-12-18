import * as L from "leaflet";
import BridgeAPI from "../api/BridgeAPI";
import Layer from "./Layer";

export default class BridgeLayer extends Layer {
    // Minimale zoomlevel om de bruggen te tonen op de kaart.
    private readonly MIN_ZOOM = 11;

    public constructor(map: L.Map) {
        super(map);
        this.update();
        this.show();
    }

    public update(): void {
        if (this._map.getZoom() >= this.MIN_ZOOM) {
            this.updateNearbyBridges();
        } else {
            this.clearLayers();
        }
    }

    private async updateNearbyBridges(): Promise<void> {
        const nearbyBridges = await this.fetchNearbyBridges();
        if (nearbyBridges) {
            this.clearLayers();
            nearbyBridges.forEach((bridgeData: object) => this.displayBridge(bridgeData));
            this._layerGroup.addLayer(this._nestedLayer);
        }
    }

    /**
     * Haalt bruggen op die momenteel op de kaart zouden zijn.
     */
    private async fetchNearbyBridges(): Promise<object[] | void> {
        // ophalen van de hoeken van het zichtbare scherm
        const bounds = this._map.getBounds();
        const sw = bounds.getSouthWest();
        const ne = bounds.getNorthEast();
        return await BridgeAPI.fetchBridges(sw, ne);
    }

    /**
     * Voegt de brug toe aan de bruggenlayer en koppelt een onclick voor popup.
     * @param bridge een brug via de bruggenapi
     */
    private displayBridge(bridge: any): void {
        const marker = this.createBridgeMarker(bridge);
        marker.addTo(this._nestedLayer);
        marker.on("click", (event: L.LeafletMouseEvent) => this.handleBridgeClick(event, bridge));
    }

    /**
     * laat de popup zien wanneer op een schip geklikt is
     * @param event de onclick event van de bruggenicoon
     * @param bridge bruginformatie
     */
    private async handleBridgeClick(event: L.LeafletMouseEvent, bridge: any): Promise<void> {
        // Toont een bericht zodat mensen weten dat ze wel goed hebben geklikt.
        L.popup().setLatLng(event.latlng).setContent("Laden van gegevens...").openOn(this._map);

        let data = "Geen gegevens.";

        // telefoonnummber toevoegen wanneer beschikbaar
        if (bridge.lnk.length > 4) {
            bridge.lnk = await BridgeAPI.fetchCountryCode(bridge.lat, bridge.lng);
            data = "<h6>" + bridge.name + "</h6><b>Telefoonnummer: </b>" + bridge.lnk
        } else {
            data = "<h6>" + bridge.name + "</h6>Geen bijzonderheden"
        }

        // hoogte/breedte toevoegen wanneer beschikbaar
        if ("" !== bridge.hoogte) {
            data += "<br><b>Doorvaarthoogte</b>: " + bridge.hoogte + " meter <br><b>Breedte:</b> " + bridge.breedte + " meter."
        } else {
            data += "<br>Doorvaarhoogte en -breedte onbekend";
        }

        data += await BridgeAPI.fetchAdministration(bridge);

        if (["sluit", "brug_open"].includes(bridge.icoo)) {
            data += await BridgeAPI.fetchBridgePicture(bridge);
        }

        // popup zichtbaar maken
        L.popup().setLatLng(event.latlng).setContent(data).openOn(this._map);
    }

    private createBridgeMarker(bridge: any): L.Marker {
        return new L.Marker([
            bridge.lat,
            bridge.lng
        ], {
            icon: this.createBridgeIcon(bridge)
        });
    }

    private createBridgeIcon(bridge: any): L.Icon {
        return new L.Icon({
            iconUrl: `https://waterkaart.net/items/images/iconen/${bridge.icoo}.png`,
            iconSize: [24, 14],
            className: bridge.RWS_Id
        });
    }
}