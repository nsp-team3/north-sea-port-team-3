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
        // Toont een bericht zodat mensen weten dat ze goed hebben geklikt.
        L.popup().setLatLng(event.latlng).setContent(`Laad gegevens van ${bridge.name}...`).openOn(this._map);
        
        const infoArr = [];
        infoArr.push(`<h6>${bridge.name}</h6>`);

        // Voeg telefoonnummer toe wanneer deze informatie beschikbaar is.
        const phoneNumber = await this.parsePhoneNumber(bridge).catch(console.error);
        if (phoneNumber) {
            infoArr.push(`<b>Telefoonnummer:</b> ${phoneNumber}`);
        }

        // Voet hoogte/breedte toe wanneer deze informatie beschikbaar is.
        if (bridge.hoogte.length !== 0) {
            infoArr.push(`<b>Breedte:</b> ${bridge.breedte} meter`);
            infoArr.push(`<b>Doorvaarthoogte:</b> ${bridge.hoogte} meter`);
        } else {
            infoArr.push("Doorvaarthoogte en breedte onbekend.");
        }

        const administration = await BridgeAPI.fetchAdministration(bridge).catch(console.error);
        if (administration) {
            infoArr.push(administration);
        }

        const bridgePicture = await BridgeAPI.fetchBridgePicture(bridge).catch(console.error);
        if (bridgePicture) {
            infoArr.push(bridgePicture);
        }

        // popup zichtbaar maken
        const content = infoArr.join("<br>");
        L.popup().setLatLng(event.latlng).setContent(content).openOn(this._map);
    }

    private async parsePhoneNumber(bridge: any): Promise<string | void> {
        if (bridge.lnk.length > 4) {
            if (bridge.lnk.charAt(0) === "0") {
                const countryCode = await BridgeAPI.fetchCountryCode(bridge.lat, bridge.lng);
                return `+${countryCode} ${bridge.lnk}`
            } else {
                return bridge.lnk;
            }
        }
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