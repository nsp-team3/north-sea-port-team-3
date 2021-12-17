import * as L from "leaflet";

import "leaflet-sidebar-v2";
import "leaflet-velocity";
import "leaflet-mouse-position";
import "./libs/smoothWheelZoom";

import Layer from "./layers/Layer";
import OpenStreetMapsLayer from "./layers/OpenStreetMapsLayer";
import OpenSeaMapsLayer from "./layers/OpenSeaMapsLayer";
import BerthLayer from "./layers/BerthLayer";
import BridgeLayer from "./layers/BridgeLayer";
import VesselLayer from "./layers/VesselLayer";

type Layers = {[index: string]: Layer};

class Application {
    private readonly INITIAL_LATITUDE = 51.2797429555907;
    private readonly INITIAL_LONGITUDE = 3.7477111816406254;
    private readonly INITIAL_ZOOM = 8;

    private _map: L.Map;
    private _sidebar: L.Control.Sidebar;
    private _layers: Layers;
    private _scale: L.Control.Scale;
    private _overlays: L.Control.Layers;

    private _movedSinceLastUpdate: boolean;

    public constructor() {
        this._map = this.createMap();
        this._sidebar = this.createSidebar();
        this._layers = this.createLayers();
        this._scale = this.createScale();
        this._overlays = this.createOverlays();
        this.addEventListeners();
        this.startIntervalUpdates();
    }

    /**
     * Maakt de leaflet map aan.
     * @returns 
     */
    private createMap() {
        return L.map("map", {
            scrollWheelZoom: false,
            smoothWheelZoom: true,
            smoothSensitivity: 1.5,
        }).setView(
            new L.LatLng(this.INITIAL_LATITUDE, this.INITIAL_LONGITUDE),
            this.INITIAL_ZOOM
        );
    }

    /**
     * Maakt de zijbalk aan en laadt deze in.
     * @returns 
     */
    private createSidebar(): L.Control.Sidebar {
        return L.control.sidebar({
            autopan: false,       // Moet de map dezelfde plek tonen wanneer de zijbalk wordt geopend?
            closeButton: true,    // Moeten de tabs een close button hebben?
            container: "sidebar", // De html id van de sidebar container. 
            position: "right"     // Of de sidebar rechts of links moet staan.
        }).addTo(this._map);
    }

    private createScale(): L.Control.Scale {
        return new L.Control.Scale().addTo(this._map);
    }

    private createOverlays(): L.Control.Layers {
        console.log("TODO: Add companies layer & windspeed layer!!!");
        const overlays = {
            // "Bedrijven": this._layers.companies.main,
            "Ligplaatsen": this._layers.berths.main,
            // "Windsnelheid": this._layers.windspeed.main,
            "Schepen": this._layers.vessels.main,
            "Open sea maps": this._layers.openSeaMaps.main,
            "Bruggen": this._layers.bridges.main
        };
        
        return L.control.layers({}, overlays, {
            sortLayers: true
        }).addTo(this._map);
    }

    /**
     * Maakt alle lagen aan voor de leaflet map.
     */
    private createLayers(): Layers {
        return {
            openStreetMaps: new OpenStreetMapsLayer(this._map),
            openSeaMaps: new OpenSeaMapsLayer(this._map),
            berths: new BerthLayer(this._map),
            bridges: new BridgeLayer(this._map),
            vessels: new VesselLayer(this._map),
        };
    }

    /**
     * Voegt alle event listeners toe aan de kaart.
     */
    private addEventListeners(): void {
        this._map.on("zoomstart", () => this.onZoomStart());
        this._map.on("zoomend", () => this.onZoomEnd());
        this._map.on("dragstart", () => this.onDragStart());
        this._map.on("dragend", () => this.onDragEnd());
        // TODO: Check if we really need these events:
        this._map.on("overlayremove", () => {});
        this._map.on("overlayadd", () => {});
    }

    /**
     * Zorgt ervoor dat enkele functies elke seconde worden aangeroepen.
     */
    private startIntervalUpdates(): void {
        this._movedSinceLastUpdate = false;
        console.log("TODO: Add automatic searching every second.");
        console.log("TODO: Add all search methods back.");
        setInterval(() => {
            if (this._movedSinceLastUpdate) {
                this._movedSinceLastUpdate = false;
                this._layers.vessels.render();
                this._layers.bridges.render();
            }
        }, 1000);
    }

    private onZoomStart(): void {
        this._layers.bridges.hide();
        this._layers.openSeaMaps.hide();
        this._layers.vessels.hide();
        // this._layers.windspeed.hide();
    }

    private onZoomEnd(): void {
        this._movedSinceLastUpdate = true;
        this._layers.bridges.show();
        this._layers.openSeaMaps.show();
        this._layers.vessels.show();
        // this._layers.companies.show();
    }

    private onDragStart(): void {

    }

    private onDragEnd(): void {
        this._movedSinceLastUpdate = true;
    }
}

window.addEventListener("load", () => {
    const app = new Application();
});