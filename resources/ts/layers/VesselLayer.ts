import * as L from "leaflet";
import "../libs/tracksymbol";
import VesselAPI from "../api/VesselAPI";
import { SimpleVesselInfo, VesselFilters, VesselType } from "../types/vessel-types";
import Layer from "./Layer";
import Application from "../app";
import DisplayVesselInfo from "../displays/DisplayVesselInfo";

export default class VesselLayer extends Layer {
    private _circleLayer: L.LayerGroup;
    private _shownVesselTypes: VesselType[];

    public constructor(map: L.Map) {
        super(map);
        this._circleLayer = new L.LayerGroup();
        this._shownVesselTypes = this.getAllVesselTypes();
        this.update();
        this.show();
    }

    public async update(): Promise<void> {
        const defaultFilters = this.getDefaultVesselFilters();
        const nearbyVessels = await VesselAPI.getNearbyVessels(defaultFilters).catch(console.error);
        if (nearbyVessels) {
            this.clearLayers();
            nearbyVessels.forEach((vesselInfo: SimpleVesselInfo) => this.renderVessel(vesselInfo));
        }
    }

    public show(): void {
        if (!this._layerGroup.hasLayer(this._nestedLayer)) {
            this._layerGroup.addLayer(this._nestedLayer);
        }
        if (!this._layerGroup.hasLayer(this._circleLayer)) {
            this._layerGroup.addLayer(this._circleLayer);
        }
    }

    public hide(): void {
        if (this._layerGroup.hasLayer(this._nestedLayer)) {
            this._layerGroup.removeLayer(this._nestedLayer);
        }
        if (this._layerGroup.hasLayer(this._circleLayer)) {
            this._layerGroup.removeLayer(this._circleLayer);
        }
    }

    public focus(simpleVesselInfo: SimpleVesselInfo): void {
        if (simpleVesselInfo.latitude && simpleVesselInfo.longitude) {
            this.flyTo(simpleVesselInfo.latitude, simpleVesselInfo.longitude);
            this.renderVessel(simpleVesselInfo);
            this.renderCircle(simpleVesselInfo);
        }
    }

    public flyTo(latitude: number, longitude: number, duration?: number): void {
        this._map.flyTo(
            new L.LatLng(latitude, longitude),
            16,
            {
                duration: typeof(duration) === "number" ? duration : 1
            }
        );
    }

    /**
     * de scheepsinformatie koppelen aan het schip dat getekend word
     * @param vesselInfo scheepsinformatie
     * @returns scheepitem die gekoppeld kan worden aan de scheepslaag
     */
    public renderVessel(vesselInfo: SimpleVesselInfo): void {
        if (!this._shownVesselTypes.includes(vesselInfo.vesselType)) {
            return;
        }

        const vesselSymbol = this.createVesselSymbol(vesselInfo);

        // Kijkt of er een bestaande cirkel is, zo ja dan tekent dit een cirkel op de nieuwe positie van het schip.
        if (this._circleLayer.getLayers().length > 0 && this._circleLayer.getLayers()[0].getAttribution() === String(vesselInfo.mmsi)) {
            this.renderCircle(vesselInfo);
        }

        vesselSymbol.on("click", () => this.handleVesselClick(vesselInfo));

        vesselSymbol.addTo(this._nestedLayer);
    }

    /**
     * tekent een cirkel om het schip heen
     * @param vesselInfo scheepsinformatie
     * @returns Cirkel die om een schip heen staat.
     */
    private renderCircle(vesselInfo: SimpleVesselInfo): void {
        this._circleLayer.clearLayers();
        L.circleMarker([vesselInfo.latitude, vesselInfo.longitude], {
            radius: 12,
            attribution: String(vesselInfo.mmsi)
        }).addTo(this._circleLayer);
    }

    /**
     * Maakt een symbool aan voor een schip, zodat dit schip zichtbaar wordt op de kaart.
     * @param vesselInfo Informatie over een schip
     * @returns Een symbool van het schip voor op de kaart.
     */
    private createVesselSymbol(vesselInfo: SimpleVesselInfo): L.LayerGroup | L.Marker {
        const location = new L.LatLng(vesselInfo.latitude, vesselInfo.longitude);
        const symbolOptions = {
            trackId: vesselInfo.mmsi,
            fill: true,
            fillColor: this.getVesselColor(vesselInfo),
            fillOpacity: 1.0,
            stroke: true,
            color: "#000000",
            opacity: 1.0,
            weight: 1.0,
            speed: vesselInfo.speed,
            course: vesselInfo.direction * Math.PI / 180,
            heading: vesselInfo.direction * Math.PI / 180,
            updateTimestamp: vesselInfo.requestTime,
        }
        if (vesselInfo.speed <= 0.5) {
            symbolOptions.heading = undefined;
        }

        return L.trackSymbol(location, symbolOptions);
    }

    private handleVesselClick(vesselInfo: SimpleVesselInfo): void {
        this.renderCircle(vesselInfo);
        const vesselDisplay = Application.displays.vessels as DisplayVesselInfo;
        vesselDisplay.show(vesselInfo.mmsi);
    }

    private getDefaultVesselFilters(): VesselFilters {
        const bounds = this._map.getBounds();
        return {
            zoom: Math.round(this._map.getZoom()),
            southWest: bounds.getSouthWest(),
            northEast: bounds.getNorthEast()
        }
    }

    private getAllVesselTypes(): VesselType[] {
        return [
            VesselType.Unavailable,
            VesselType.HighSpeed,
            VesselType.Passenger,
            VesselType.Cargo,
            VesselType.Tanker,
            VesselType.Yacht,
            VesselType.Fishing
        ];
    }

    private getVesselColor(vesselInfo: SimpleVesselInfo): string {
        const VESSEL_COLORS: { [index: string]: string } = {
            "0": "#6b6b6c", // VesselType.Unavailable
            "3": "#0fa8b7", // VesselType.Pilot
            "4": "#ac7b22", // VesselType.HighSpeed
            "6": "#2856fe", // VesselType.Passenger
            "7": "#0c9338", // VesselType.Cargo
            "8": "#d60202", // VesselType.Tanker
            "9": "#e716f4", // VesselType.Yacht
            "10": "#ede115", // VesselType.Fishing
            "11": "#e7f694", // VesselType.BaseStation
            "12": "#971f64", // VesselType.AirCraft
            "13": "#1716f4"  // VesselType.NavigationAid
        }
        return VESSEL_COLORS[vesselInfo.vesselType];
    }
}
