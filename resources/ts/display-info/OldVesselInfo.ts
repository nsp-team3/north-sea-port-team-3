// import * as Leaflet from "leaflet";
// import "../libs/tracksymbol";
// import { AIS } from "../api/AIS";
// import { Vessel } from "../api/Vessel";
// import LocationInfo from "../types/LocationInfo";
// import DisplayPortInfo from "./DisplayPortInfo";
// import { Port } from "../api/Port";
// import { format } from "date-fns";
// import SimpleVesselInfo from "../types/SimpleVesselInfo";
// import { SearchResult } from "../types/SearchTypes";

// export default class DisplayVesselInfo {
//     public static readonly circle = Leaflet.layerGroup();
//     public static readonly main = Leaflet.layerGroup();
//     private static readonly VESSEL_COLORS: string[] = ["#6b6b6c", "#0fa8b7", "#ac7b22", "#2856fe", "#0c9338", "#d60202", "#e716f4", "#ede115", "#e716f4", "#e716f4", "#e716f4"];

//     public static async showVessels(map: Leaflet.Map, sidebar: Leaflet.Control.Sidebar): Promise<void> {
//         const nearbyVessels = await DisplayVesselInfo.getNearbyVessels(map, sidebar);
//         this.main.clearLayers();
//         nearbyVessels.forEach((vesselInfo) => DisplayVesselInfo.drawVesselOnMap(map, sidebar, vesselInfo));
//     }

//     private static async getNearbyVessels(map: Leaflet.Map, sidebar: Leaflet.Control.Sidebar) {
        // const nearbyVessels: SimpleVesselInfo[] = await AIS.getNearbyVessels(map, { includePorts: false });
        // return nearbyVessels.filter((vesselInfo: SimpleVesselInfo) => vesselInfo.latitude && vesselInfo.longitude && DisplayVesselInfo.VESSEL_COLORS[vesselInfo.vesselType]);
//     }

//     private static drawVesselOnMap(map: L.Map, sidebar: L.Control.Sidebar, vesselInfo: SimpleVesselInfo) {
//         const location = Leaflet.latLng(
//             Number(vesselInfo.latitude),
//             Number(vesselInfo.longitude)
//         );

//         // update marker position
//         if (this.circle.getLayers().length !== 0 && this.circle.getLayers()[0].getAttribution() === String(vesselInfo.mmsi)) {
//             this.circle.clearLayers();
//             Leaflet.circleMarker(location, {radius: 12, attribution: String(vesselInfo.mmsi)}).addTo(this.circle);
//         }

//         const ship = Leaflet.trackSymbol(location, {
//             trackId: vesselInfo.mmsi,
//             fill: true,
//             fillColor: DisplayVesselInfo.VESSEL_COLORS[vesselInfo.vesselType],
//             fillOpacity: 1.0,
//             stroke: true,
//             color: "#000000",
//             opacity: 1.0,
//             weight: 1.0,
//             speed: vesselInfo.speed,
//             course: vesselInfo.direction * Math.PI / 180,
//             heading: vesselInfo.direction * Math.PI / 180,
//             updateTimestamp: vesselInfo.requestTime
//         });


//         ship.on("click", (context) => {
//             // TODO: Open sidebar
//             sidebar.open("home");

//             this.circle.clearLayers();
//             this.showVesselOnMap(vesselInfo.mmsi, map, false, vesselInfo.requestTime);
//         });

//         ship.addTo(this.main);
//     }

//     public static async showVesselOnMap(mmsi: number, map: Leaflet.Map, zoom: boolean, updateTimestamp: Date) {
//         DisplayVesselInfo.changeBackButton(null, map);

//         const selectedVessel: Vessel = await AIS.getVessel(mmsi);
//         document.getElementById("main-search").style.display = "none";
//         document.getElementById("main-shipinfo").style.display = "block";
//         document.getElementById("main-title").textContent = "Scheepsinformatie";
//         document.getElementById("shipname").textContent = selectedVessel.name;

//         DisplayVesselInfo.loadTableData(map, selectedVessel, updateTimestamp);

//         const location: LocationInfo = await selectedVessel.getLocation() as LocationInfo;
//         if (zoom) {
//             map.flyTo(new Leaflet.LatLng(location.latitude, location.longtitude), 16);
//         }

//         Leaflet.circleMarker([location.latitude, location.longtitude], {radius: 12, attribution: String(mmsi)}).addTo(this.circle);
//     }



// }
