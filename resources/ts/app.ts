import * as L from "leaflet";

import "leaflet-sidebar-v2";
import "leaflet-velocity";
import "leaflet-mouse-position";
import "./libs/smoothWheelZoom";

// import DisplayVesselInfo from "./display-info/DisplayVesselInfo";
import Companies from "./layers/Companies";
import Dock from "./layers/Dock";
import Windsnelheid from "./layers/WindSpeed";
import Bridges from "./layers/Bridges";
import VesselSearch from "./search/VesselSearch";
import PortSearch from "./search/PortSearch";
import BerthSearch from "./search/BerthSearch";

const onPageLoaded = async() => {
    const map = L.map("map", {
        scrollWheelZoom: false,
        smoothWheelZoom: true,
        smoothSensitivity: 1.5,
    }).setView(new L.LatLng(51.2797429555907, 3.7477111816406254), 8);

    const main = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: `&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors`
    }).addTo(map);

    // const cleanMap = L.tileLayer('https://tile.jawg.io/be014ddc-e423-43d8-8e15-0ddb1ac99d84/{z}/{x}/{y}{r}.png?access-token=iWfpe7piHdKAYayIe6bRGELuU156lg34z2nVINNr755xTL4AbHcaKBXXhTwHxHdW', {}).addTo(map);

    const openSeaMap = L.tileLayer("https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png", {
        attribution: `Map data: &copy; <a href="http://www.openseamap.org">OpenSeaMap</a> contributors`
    });

    const diepteLayer = L.tileLayer.wms("https://geo.rijkswaterstaat.nl/services/ogc/gdr/bodemhoogte_zeeland/ows", {
        layers: "bodemhoogte_zeeland",
        format: "image/png",
        transparent: true,
        attribution: `<a href="https://maps.rijkswaterstaat.nl/dataregister-publicatie/srv/api/records/e0422848-ca9c-443e-b674-16a295bcff23">Bodemdiepte Zeeland (actueel).</a>`
    });

    const sidebar = L.control.sidebar({
        autopan: false,       // whether to maintain the centered map point when opening the sidebar
        closeButton: true,    // whether t add a close button to the panes
        container: "sidebar", // the DOM container or #ID of a predefined sidebar container that should be used
        position: "right"     // left or right
    });

    const docks = new Dock(sidebar);
    new VesselSearch(map, "vessel-search");
    new PortSearch(map, "port-search");
    new BerthSearch(map, "berth-search");

    await Bridges.getBridges(map);

    const optionalOverlays = {
        "Bedrijven": Companies.bedrijvenGroup,
        "Ligplaatsen": docks.main,
        "Windsnelheid": Windsnelheid.main,
        // "Ship info": DisplayVesselInfo.main, //TODO: Replace this with a layer class in the views directory.
        "Open sea maps": openSeaMap,
        "Diepte Water": diepteLayer,
        "Bruggen": Bridges.main
    };

    // DisplayVesselInfo.circle.addTo(map);
    L.control.scale().addTo(map);
    L.control.mousePosition().addTo(map);
    sidebar.addTo(map).open("vesselsTab");
    L.control.layers({}, optionalOverlays, {
        sortLayers: true
    }).addTo(map);

    map.on("zoomend", () => {
        docks.checkZoom(map);
        Companies.checkZoom(map);
        // DisplayVesselInfo.showVessels(map, sidebar);
    });

    map.on("dragend", () => {
        // DisplayVesselInfo.showVessels(map, sidebar);
    });

    map.on("overlayremove", () => {
        docks.checkLayer(map);
        Companies.checkLayer(map);
    });

    map.on("overlayadd", () => {
        docks.checkLayer(map);
        Companies.checkLayer(map);
    });
    
    Bridges.getBridges(map);

    // DisplayVesselInfo.showVessels(map, sidebar);
    setInterval(() => {
        // DisplayVesselInfo.showVessels(map, sidebar);
        Bridges.getBridges(map);
    }, 15000);
}

window.addEventListener("load", onPageLoaded);
