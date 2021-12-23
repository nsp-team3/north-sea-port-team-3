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
import CompanyLayer from "./layers/CompanyLayer";
import Search from "./search/Search";
import VesselSearch from "./search/VesselSearch";
import PortSearch from "./search/PortSearch";
import BerthSearch from "./search/BerthSearch";
import DisplayInfo from "./displays/DisplayInfo";
import DisplayVesselInfo from "./displays/DisplayVesselInfo";
import DisplayPortInfo from "./displays/DisplayPortInfo";

type Layers = {[index: string]: Layer};
type Searches = {[index: string]: Search};
type Displays = {[index: string]: DisplayInfo};

export default class Application {
    public static layers: Layers;
    public static searches: Searches;
    public static displays: Displays;

    private readonly INITIAL_LATITUDE = 51.2797429555907;
    private readonly INITIAL_LONGITUDE = 3.7477111816406254;
    private readonly INITIAL_ZOOM = 8;

    private _map: L.Map;
    private _sidebar: L.Control.Sidebar;
    private _scale: L.Control.Scale;
    private _overlays: L.Control.Layers;

    private _movedSinceLastUpdate: boolean;

    public constructor() {
        this._map = this.createMap();
        this._sidebar = this.createSidebar();
        Application.layers = this.createLayers();
        Application.searches = this.createSearches();
        Application.displays = this.createDisplays();
        this._scale = this.createScale();
        this._overlays = this.createOverlays();
        this.addEventListeners();
        this.startIntervalUpdates();
    }

    /**
     * Maakt de leaflet map aan.
     * @returns Leaflet map
     */
    private createMap(): L.Map {
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
        }).addTo(this._map).open("searchTab");
    }

    private createScale(): L.Control.Scale {
        return new L.Control.Scale().addTo(this._map);
    }

    private createOverlays(): L.Control.Layers {
        const overlays = {
            "Open sea maps": Application.layers.openSeaMaps.main,
            "Bedrijven": Application.layers.companies.main,
            "Ligplaatsen": Application.layers.berths.main,
            // "Windsnelheid": this._layers.windspeed.main,
            "Bruggen": Application.layers.bridges.main,
            "Schepen": Application.layers.vessels.main,
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
            companies: new CompanyLayer(this._map)
        };
    }

    /**
     * Voegt alle zoekbalken toe.
     */
    private createSearches(): Searches {
        return {
            vessels: new VesselSearch("vessels-button"),
            ports: new PortSearch("ports-button"),
            berths: new BerthSearch("berths-button")
        }
    }

    /**
     * Voegt alle sidebar displays toe.
     */
    private createDisplays(): Displays {
        return {
            vessels: new DisplayVesselInfo(this._sidebar),
            ports: new DisplayPortInfo(this._sidebar)
        }
    }

    /**
     * Voegt alle event listeners toe aan de kaart.
     */
    private addEventListeners(): void {
        this._map.on("zoomstart", () => this.onZoomStart());
        this._map.on("zoomend", () => this.onZoomEnd());
        this._map.on("dragend", () => this.onDragEnd());
    }

    /**
     * Zorgt ervoor dat enkele functies elke seconde worden aangeroepen.
     */
    private startIntervalUpdates(): void {
        this._movedSinceLastUpdate = false;
        setInterval(() => {
            if (this._movedSinceLastUpdate) {
                this._movedSinceLastUpdate = false;
                Application.layers.vessels.update();
                Application.layers.bridges.update();
            }
            this.searchUpdate();
        }, 1000);

        setInterval(() => {
            Application.layers.vessels.update();
            Application.layers.bridges.update();
        }, 15000);
    }

    private searchUpdate(): void {
        if (Search.hasQueryChanged()) {
            for (const searchMethod in Application.searches) {
                Application.searches[searchMethod].update();
            }
        }
    }

    private onZoomStart(): void {
        this._movedSinceLastUpdate = true;
        Application.layers.bridges.hide();
        Application.layers.openSeaMaps.hide();
        Application.layers.vessels.hide();
    }

    private onZoomEnd(): void {
        Application.layers.vessels.show();
        Application.layers.bridges.show();
        Application.layers.berths.show();
        Application.layers.companies.show();
        Application.layers.openSeaMaps.show();
    }

    private onDragEnd(): void {
        this._movedSinceLastUpdate = true;
    }
}

window.addEventListener("load", () => {
    const app = new Application();
});