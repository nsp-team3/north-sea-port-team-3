import * as L from "leaflet";

import "leaflet-sidebar-v2";
import "leaflet-velocity";
import "leaflet-mouse-position";
import "./libs/smoothWheelZoom";

import ShipInfo from "./info/shipinfo";
import Bedrijven from "./views/bedrijven";
import { Ligplaats } from "./views/ligplaats";
import Windsnelheid from "./views/windsnelheid";
import AIS from "./api/AIS";

const testClickFunction = (map: L.Map) => {
    console.log(map.getCenter());
    console.log(map.getZoom());
    console.log(map.getBounds());
    // let test = ShipInfo.main.getLayer(244690791);
    // var popupContent = `I am here!`;
    // test.bindPopup(popupContent);
    // test.openPopup()
}

(async() => {
    const map = L.map("map", {
        scrollWheelZoom: false,
        smoothWheelZoom: true,
        smoothSensitivity: 1.5,
    }).setView(new L.LatLng(51.2797429555907, 3.7477111816406254), 8);

    const main = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: `&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors`
    }).addTo(map);

    //const cleanMap = L.tileLayer('https://tile.jawg.io/be014ddc-e423-43d8-8e15-0ddb1ac99d84/{z}/{x}/{y}{r}.png?access-token=iWfpe7piHdKAYayIe6bRGELuU156lg34z2nVINNr755xTL4AbHcaKBXXhTwHxHdW', {}).addTo(map);

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
        position: "right",     // left or right
    });

    const ligplaats = new Ligplaats(sidebar);
    await Promise.all([
        Windsnelheid.getWindInfo(),
        ShipInfo.enableSearch(map),
        ShipInfo.getLocations(map),
        ShipInfo.enableBackButton(),
        ligplaats.enableSearch(map),
        ligplaats.enableBackButton()
    ]);

    const optionalOverlays = {
        "Bedrijven": Bedrijven.bedrijvenGroup,
        "Ligplaatsen": ligplaats.main,
        "Windsnelheid": Windsnelheid.main,
        "Ship info": ShipInfo.main,
        "Open sea maps": openSeaMap,
        "Diepte Water": diepteLayer
    };

    ShipInfo.circle.addTo(map);
    L.control.scale().addTo(map);
    L.control.mousePosition().addTo(map);
    sidebar.addTo(map).open("home");
    L.control.layers({}, optionalOverlays, {
        sortLayers: true
    }).addTo(map);

    map.on("click", () => {
        testClickFunction(map);
    });

    map.on("zoomend", () => {
        ligplaats.checkZoom(map);
        Bedrijven.checkZoom(map);
        ShipInfo.getLocations(map);
    });

    map.on("dragend", () => {
        ShipInfo.getLocations(map);
    });

    map.on("overlayremove", () => {
        ligplaats.checkLayer(map);
        Bedrijven.checkLayer(map);
    });

    map.on("overlayadd", () => {
        ligplaats.checkLayer(map);
        Bedrijven.checkLayer(map);
    });

    (async() => {
        updateShips();
        function updateShips() {
            ShipInfo.getLocations(map);
            setTimeout(updateShips, 15000);
        }
    })();

    // TODO: Remove this test garbage.
    window.addEventListener("keypress", async (e) => {
        if (e.key === "e") {
            const test = await AIS.searchVessels(map, {
                // includePorts: true,
                // destination: "vlissingen",
                currentPortId: 1145,
                originPortId: 166,
                destinationPortId: 1236
            });
            console.log(test);
        }
    });
})();
