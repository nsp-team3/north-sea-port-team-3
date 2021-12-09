import * as L from "leaflet";

import "leaflet-sidebar-v2";
import "leaflet-velocity";
import "leaflet-mouse-position";
import "./libs/smoothWheelZoom";

import { Bridges, Companies, Berth, VesselLayer, WindspeedLayer } from "./layers/LayerExports";
import { VesselSearch, PortSearch, BerthSearch } from "./search/SearchExports";
import { DisplayBerthInfo, DisplayPortInfo, DisplayVesselInfo } from "./display-info/DisplayInfoExports";

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

    const berths = new Berth(sidebar);

    const vesselLayer = new VesselLayer(map, sidebar);
    const windspeedLayer = new WindspeedLayer(map);

    new VesselSearch(map, "vessel-search", new DisplayVesselInfo(
        "main-vessel-info",
        "vessel-name",
        "vessel-info-content",
        "vessel-back-button"
    ));

    new PortSearch(map, "port-search", new DisplayPortInfo(
        "main-port-info",
        "port-name",
        "port-info-content",
        "port-back-button"
    ));

    new BerthSearch(map, "berth-search", new DisplayBerthInfo(
        "main-berth-info",
        "berth-name",
        "berth-info-content",
        "berth-back-button"
    ));

    const optionalOverlays = {
        "Bedrijven": Companies.bedrijvenGroup,
        "Ligplaatsen": berths.main,
        "Windsnelheid": windspeedLayer.main,
        "Schepen": vesselLayer.main,
        "Open sea maps": openSeaMap,
        "Diepte Water": diepteLayer,
        "Bruggen": Bridges.main
    };

    L.control.scale().addTo(map);
    L.control.mousePosition().addTo(map);
    sidebar.addTo(map).open("vesselsTab");
    L.control.layers({}, optionalOverlays, {
        sortLayers: true
    }).addTo(map);
    Bridges.main.removeFrom(map);

    map.on("zoomend", () => {
        vesselLayer.show();
        Bridges.getBridges(map);
        berths.checkZoom(map);
        Companies.checkZoom(map);
        if (map.getZoom() < 11) {
            Bridges.main.removeFrom(map);
        } else {
            Bridges.main.addTo(map);
        }
    });

    map.on("dragend", () => {
        Bridges.getBridges(map);
        vesselLayer.show();
    });

    map.on("overlayremove", () => {
        berths.checkLayer(map);
        Companies.checkLayer(map);
    });

    map.on("overlayadd", () => {
        berths.checkLayer(map);
        Companies.checkLayer(map);
    });

    Bridges.getBridges(map);

    setInterval(() => {
        vesselLayer.show();
        Bridges.getBridges(map);
    }, 15000);
}

window.addEventListener("load", onPageLoaded);
