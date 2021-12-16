import * as L from "leaflet";

import "leaflet-sidebar-v2";
import "leaflet-velocity";
import "leaflet-mouse-position";
import "./libs/smoothWheelZoom";

import { Berth, BridgesLayer, Companies, OpenSeaMapLayer, VesselLayer, WindspeedLayer, OpenStreetMapLayer } from "./layers/LayerExports";
import { VesselSearch, PortSearch, BerthSearch } from "./search/SearchExports";
import Search from "./search/Search";

const onPageLoaded = async() => {
    const map = L.map("map", {
        scrollWheelZoom: false,
        smoothWheelZoom: true,
        smoothSensitivity: 1.5,
    }).setView(new L.LatLng(51.2797429555907, 3.7477111816406254), 8);

    // const cleanMap = L.tileLayer('https://tile.jawg.io/be014ddc-e423-43d8-8e15-0ddb1ac99d84/{z}/{x}/{y}{r}.png?access-token=iWfpe7piHdKAYayIe6bRGELuU156lg34z2nVINNr755xTL4AbHcaKBXXhTwHxHdW', {}).addTo(map);

    // inladen zijbalk
    const sidebar = L.control.sidebar({
        autopan: false,       // whether to maintain the centered map point when opening the sidebar
        closeButton: true,    // whether t add a close button to the panes
        container: "sidebar", // the DOM container or #ID of a predefined sidebar container that should be used
        position: "right"     // left or right
    });

    let movedSinceLastUpdate: boolean = false;

    const berths = new Berth(sidebar);

    const mainLayer = new OpenStreetMapLayer(map);
    const vesselLayer = new VesselLayer(map, sidebar);
    const windspeedLayer = new WindspeedLayer(map);
    const openSeaMapLayer = new OpenSeaMapLayer(map);
    const bridgesLayer = new BridgesLayer(map);

   // activering schepen zoeken
   const vesselSearch = new VesselSearch(map, sidebar, "vessels-button");

   // activering havens zoeken
   const portSearch = new PortSearch(map, sidebar, "ports-button");

   // activering ligplaatsen zoeken
   const berthSearch = new BerthSearch(map, sidebar, "berths-button");

    // Items zichtbaar in het lagenactiveermenu
    const optionalOverlays = {
        "Bedrijven": Companies.bedrijvenGroup,
        "Ligplaatsen": berths.main,
        "Windsnelheid": windspeedLayer.main,
        "Schepen": vesselLayer.main,
        "Open sea maps": openSeaMapLayer.main,
        "Bruggen": bridgesLayer.main
    };

    L.control.scale().addTo(map);
    L.control.mousePosition().addTo(map);

    L.control.layers({}, optionalOverlays, {
        sortLayers: true
    }).addTo(map);

    map.on("zoomstart", () => {
        bridgesLayer.hide();
        openSeaMapLayer.hide();
        vesselLayer.hide();
        windspeedLayer.hide();
    });

    // word aangeroepen bij zoomen
    map.on("zoomend", () => {
        movedSinceLastUpdate = true;
        berths.checkZoom(map);
        openSeaMapLayer.show();
        windspeedLayer.show();
        Companies.checkZoom(map);
    });

    map.on("dragstart", () => {
        windspeedLayer.hide();
    });

    // word aangeroepen bij het verslepen van de map
    map.on("dragend", () => {
        movedSinceLastUpdate = true;
        windspeedLayer.show();
    });

    // word aangeroepen bij het verwijderen van een laag via het lagenactiveermenu
    map.on("overlayremove", () => {
        berths.checkLayer(map);
        Companies.checkLayer(map);
    });

    // word aangeroepen bij het toevoegen van een laag via het lagenactiveermenu
    map.on("overlayadd", () => {
        berths.checkLayer(map);
        Companies.checkLayer(map);
    });

    sidebar.addTo(map).open(Search.SEARCH_ID);

    setInterval(() => {
        // Heeft de gebruiker gezoomed of de map verplaatst?
        if (movedSinceLastUpdate) {
            movedSinceLastUpdate = false;
            vesselLayer.show();
            bridgesLayer.show();
        }

        if (Search.hasQueryChanged()) {
            vesselSearch.update();
            portSearch.update();
            berthSearch.update();
        }
    }, 1000);
}

window.addEventListener("load", onPageLoaded);
