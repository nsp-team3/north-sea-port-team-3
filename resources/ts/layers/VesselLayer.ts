import * as Leaflet from "leaflet";
import "../libs/tracksymbol";

import AIS from "../api/AIS";
import { DisplayVesselInfo } from "../display-info/DisplayInfoExports";
import SimpleVesselInfo from "../types/SimpleVesselInfo";
import Layer from "./Layer";
import VesselType from "../types/enums/VesselType";

export default class VesselLayer extends Layer {
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
    private static readonly vesselTypes: { [id: string]: VesselType; } = {
        "onbekend": VesselType.Unavailable,
        "sleepboot": VesselType.NavigationAid,
        "hogesnelheid": VesselType.HighSpeed,
        "passagier": VesselType.Passenger,
        "vracht": VesselType.Cargo,
        "tanker": VesselType.Tanker,
        "yacht": VesselType.Yacht,
        "visschepen": VesselType.Fishing,
    }

    private static readonly VESSEL_COLORS = {
        "0": "#6b6b6c",
        "3": "#0fa8b7",
        "4": "#ac7b22",
        "6": "#2856fe",
        "7": "#0c9338",
        "8": "#d60202",
        "9": "#e716f4",
        "10": "#ede115",
        "11": "#e71694",
        "12": "#e71664",
        "13": "#e71634"
    };
    private vesselDisplay = new DisplayVesselInfo(
        "main-vessel-info",
        "vessel-name",
        "vessel-info-content",
        "vessel-back-button"
    );
    protected _sidebar: L.Control.Sidebar;
    protected _circleGroup: L.LayerGroup;

    public constructor(map: L.Map, sidebar: L.Control.Sidebar) {
        super(map);
        this._sidebar = sidebar;
        this._circleGroup = new Leaflet.LayerGroup();
        this.show();
        this.getSelectedVessels();
    }

    private getSelectedVessels(): void {
        const schipLegend = document.getElementById("schipLegenda");
        schipLegend.querySelectorAll("input").forEach(element => {
            element.addEventListener("click", (event: MouseEvent) => {
                const target = event.target as HTMLInputElement;
                if (target.checked) {
                    this.vessels.push(VesselLayer.vesselTypes[target.id]);
                } else {
                    this.vessels = this.vessels.filter(e => e !== VesselLayer.vesselTypes[target.id]);
                }
                this.show();
            })
        });
    }

    public async show(): Promise<void> {
        console.log(this.vessels)
        const nearbyVessels: SimpleVesselInfo[] = await AIS.getNearbyVessels(this._map);
        this._layerGroup.clearLayers();
        nearbyVessels.forEach((vesselInfo: SimpleVesselInfo) => this.draw(vesselInfo));
        this._circleGroup.addTo(this._layerGroup);
    }

    public focusVessel(vesselInfo: SimpleVesselInfo, autoZoom?: boolean): void {
        this.vesselDisplay.show(vesselInfo);
        if (autoZoom) {
            this._map.flyTo(new Leaflet.LatLng(vesselInfo.latitude, vesselInfo.longitude), 16)
        }
        this.drawVesselCircle(vesselInfo);
    }

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

        vessel.addTo(this._layerGroup);
    }

    private drawVesselCircle(vesselInfo: SimpleVesselInfo): void {
        Leaflet.circleMarker([vesselInfo.latitude, vesselInfo.longitude], {
            radius: 12,
            attribution: String(vesselInfo.mmsi)
        }).addTo(this._circleGroup);
    }

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

    private getVesselColor(vesselInfo: SimpleVesselInfo) {
        return VesselLayer.VESSEL_COLORS[vesselInfo.vesselType];
    }
}
