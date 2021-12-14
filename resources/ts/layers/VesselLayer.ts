import * as Leaflet from "leaflet";
import "../libs/tracksymbol";

import AIS from "../api/AIS";
import { DisplayVesselInfo } from "../display-info/DisplayInfoExports";
import SimpleVesselInfo from "../types/SimpleVesselInfo";
import Layer from "./Layer";
import VesselType from "../types/enums/VesselType";

/**
 * Besturing van de schepenlaag
 */
export default class VesselLayer extends Layer {
    /**
     * standaard geactiveerde items binnen schepenfilter
     */
    private vessels: VesselType[] = [
        VesselType.Unavailable,
        VesselType.NavigationAid,
        VesselType.HighSpeed,
        VesselType.Passenger,
        VesselType.Cargo,
        VesselType.Tanker,
        VesselType.Yacht,
        VesselType.Fishing,
    ];
    /**
     * legendaitem naar vesseltype conversie voor schepenfilter
     */
    private static readonly vesselTypes: { [id: string]: VesselType; } = {
        "Onbekend": VesselType.Unavailable,
        "Sleepboot": VesselType.NavigationAid,
        "Hogesnelheidsvaartuig": VesselType.HighSpeed,
        "Passagiersschip": VesselType.Passenger,
        "Vrachtschip": VesselType.Cargo,
        "Tanker": VesselType.Tanker,
        "Jacht": VesselType.Yacht,
        "Vissersboot": VesselType.Fishing,
    }
    /**
     * kleuren voor elk vesseltype
     */
    private static readonly VESSEL_COLORS = {
        "0": "#6b6b6c", // VesselType.Unavailable
        "3": "#0fa8b7", // VesselType.Pilot
        "4": "#ac7b22", // VesselType.HighSpeed
        "6": "#2856fe", // VesselType.Passenger
        "7": "#0c9338", // VesselType.Cargo
        "8": "#d60202", // VesselType.Tanker
        "9": "#e716f4", // VesselType.Yacht
        "10": "#ede115", // VesselType.Fishing
        "11": "#e71694", // VesselType.BaseStation
        "12": "#e71664", // VesselType.AirCraft
        "13": "#e71634"  // VesselType.NavigationAid
    };

    private vesselDisplay = new DisplayVesselInfo(
        "main-vessel-info",
        "vessel-name",
        "vessel-info-content",
        "vessel-back-button"
    );
    private _nestedVesselLayer: L.LayerGroup;

    protected _sidebar: L.Control.Sidebar;
    protected _circleGroup: L.LayerGroup;

    /**
     * @param map koppeling met de kaart, voor bijv. zichtbaarheid gebaseerd op zoomniveau
     * @param sidebar de zoekbalk voor als op het schip geklikt word, het te kunnen openen
     */
    public constructor(map: L.Map, sidebar: L.Control.Sidebar) {
        super(map);
        this._sidebar = sidebar;
        this._circleGroup = new Leaflet.LayerGroup();
        this._nestedVesselLayer = new Leaflet.LayerGroup();
        this._nestedVesselLayer.addTo(this._layerGroup);
        this.show();
        this.getSelectedVessels();
    }

    public async show(): Promise<void> {
        const nearbyVessels: SimpleVesselInfo[] = await AIS.getNearbyVessels(this._map);
        this._layerGroup.clearLayers();
        this._nestedVesselLayer.clearLayers();

        nearbyVessels.forEach((vesselInfo: SimpleVesselInfo) => this.draw(vesselInfo));

        this._circleGroup.addTo(this._layerGroup);
        this._nestedVesselLayer.addTo(this._layerGroup);
    }

    public hide(): void {
        this._layerGroup.removeLayer(this._nestedVesselLayer);
    }

    /**
     * acties voorrdat de gedetaileerde informatie te laten zien over het gezochte of aangeklikte schip,
     * vraagt aan show() om de data werkelijk te laten zien
     * @param vesselInfo voor welk schip informatie getoont moet worden
     * @param autoZoom moet er ingezoomt worden naar het schip binnen de map
     */
    public focusVessel(vesselInfo: SimpleVesselInfo, autoZoom?: boolean): void {
        this.vesselDisplay.show(vesselInfo);
        if (autoZoom) {
            this._map.flyTo(new Leaflet.LatLng(vesselInfo.latitude, vesselInfo.longitude), 16)
        }
        this.drawVesselCircle(vesselInfo);
    }

    /**
     * word aangeroepen na het aanklikken van een filter in de legenda
     * checkt welk schiptype wel/niet zichtbaar gemaakt moet worden gebaseerd op het veranderde input veld
     */
    private getSelectedVessels(): void {
        const schipLegend = document.getElementById("schipLegenda");
        schipLegend.querySelectorAll("input").forEach(element => {
            this.addClickHandler(element);
        });
    }

    private addClickHandler(element: HTMLElement): void {
        element.addEventListener("click", (event: MouseEvent) => {
            const target = event.target as HTMLInputElement;
            if (target.checked) {
                this.vessels.push(VesselLayer.vesselTypes[target.id]);
            } else {
                this.vessels = this.vessels.filter(e => e !== VesselLayer.vesselTypes[target.id]);
            }
            this.show();
        });
    }

    /**
     * Schip op de kaart zetten
     * @param vesselInfo scheepsinformatie
     */
    private draw(vesselInfo: SimpleVesselInfo): void {
        const allowedVesselTypes = this.vessels;
        if (!allowedVesselTypes.includes(vesselInfo.vesselType)) {
            return;
        }

        const location = Leaflet.latLng(
            Number(vesselInfo.latitude),
            Number(vesselInfo.longitude)
        );

        if (this._circleGroup.getLayers().length > 0 && this._circleGroup.getLayers()[0].getAttribution() === String(vesselInfo.mmsi)) {
            this._circleGroup.clearLayers();
            this.drawVesselCircle(vesselInfo);
        }

        const vessel: L.LayerGroup = this.drawVessel(vesselInfo, location);

        vessel.on("click", () => {
            this._sidebar.open("vesselsTab");
            this._circleGroup.clearLayers();
            this.focusVessel(vesselInfo, false);
        });

        vessel.addTo(this._nestedVesselLayer);
    }

    /**
     * tekent een cirkel om het schip heen
     * @param vesselInfo scheepsinformatie
     */
    private drawVesselCircle(vesselInfo: SimpleVesselInfo): void {
        Leaflet.circleMarker([vesselInfo.latitude, vesselInfo.longitude], {
            radius: 12,
            attribution: String(vesselInfo.mmsi)
        }).addTo(this._circleGroup);
    }

    /**
     * de scheepsinformatie koppelen aan het schip dat getekend word
     * @param vesselInfo scheepsinformatie
     * @param location scheepslocatie
     * @returns scheepitem die gekoppeld kan worden aan de scheepslaag
     */
    private drawVessel(vesselInfo: SimpleVesselInfo, location: L.LatLng): L.LayerGroup {
        return Leaflet.trackSymbol(location, {
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
            updateTimestamp: vesselInfo.requestTime
        });
    }

    /**
     * haalt kleurcode uit de VESSEL_COLORS dictionary
     * @param vesselInfo scheepsinformatie
     * @returns kleurcode string: "#6b6b6c"
     */
    private getVesselColor(vesselInfo: SimpleVesselInfo): string {
        return VesselLayer.VESSEL_COLORS[vesselInfo.vesselType];
    }
}
