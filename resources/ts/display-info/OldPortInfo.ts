
//     private static portSizeToZoomLevel: {[index: string]: number} = {
//         "XSmall": 18,
//         "Small": 17,
//         "Medium": 16,
//         "Large": 15,
//         "XLarge": 14
//     };

//     public static async show(map: Leaflet.Map, port: Port, vesselMsi: number){
//         if (vesselMsi !== null) {
//             DisplayVesselInfo.changeBackButton(vesselMsi, map);
//         }

//         document.getElementById("main-search").style.display = "none";
//         document.getElementById("main-shipinfo").style.display = "block";
//         document.getElementById("main-title").textContent = "Haven informatie";
//         document.getElementById("shipname").textContent = port.name || "Unknown";
//         document.getElementById("ship-image").innerHTML = '';

//         const info: PortInfoResponse | void = await Port.getInfo(port.id);

//         if (info) {
//             map.flyTo(new Leaflet.LatLng(info.latitude, info.longitude), DisplayPortInfo.portSizeToZoomLevel[info.size]);
//         }

//         await this.loadTableData(port, info);
//     }