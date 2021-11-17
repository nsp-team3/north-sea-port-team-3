/// <reference path="Vessel.ts" />

import { Vessel } from "./Vessel";
import * as Leaflet from "leaflet";
import VesselStatus from "./enums/VesselStatus";

type VesselFilters = {
    vesselTypes?: VesselType[];
    flag?: string;
    status?: VesselStatus;
    origin?: string;
    destination?: string;
    portId?: number; //don't know if it works but hey
}


enum VesselType {
    Unavailable = 0,
    Unknown1 = 1,
    Unknown2 = 2,
    Service = 3,
    SpeedyBoys = 4,
    Unknown5 = 5,
    Unknown6 = 6,
    Cargo = 7,
    Unknown8 = 8,
    Unknown9 = 9,
    Fishing = 10,
    Unknown11 = 11,
    Unknown12 = 12,
    Station = 13,
}


export class AIS {
    private static BASE_URL = "https://services.myshiptracking.com/requests";

    public static getVessel = async (mmsi: number): Promise<Vessel> => {
        const params = new URLSearchParams({
            type: "json",
            mmsi: String(mmsi),
            slmp: undefined
        });
        const res = await fetch(`${AIS.BASE_URL}/vesseldetails.php?${params}`);
        const rawInfo = await res.json();

        return new Vessel(rawInfo);
    }

    public static filterVessels = async (map: Leaflet.Map, vesselFilters: VesselFilters) : Promise<void> => {
        const bounds = map.getBounds();
        const sw = bounds.getSouthWest();
        const ne = bounds.getNorthEast();
        const params = new URLSearchParams({
            type: "json",
            minlat: String(sw.lat),
            maxlat: String(ne.lat),
            minlon: String(sw.lng),
            maxlon: String(ne.lng),
            zoom: String(Math.round(map.getZoom())),
            selid: "null",
            seltype: "null",
            timecode: "0",
            slmp: "",
            filters: JSON.stringify({
                "vtypes": vesselFilters.vesselTypes.join(","),//",0,3,4,6,7,8,9,10,11,12,13",
                "minsog": 0,
                "maxsog": 60,
                "minsz": 0,
                "maxsz": 500,
                "minyr": 1950,
                "maxyr": 2021,
                "flag": "",
                "status": vesselFilters.status || "",
                "mapflt_from": "",
                "mapflt_dest": "",
                "ports": "1"
            }),
            _: String(new Date().getTime())
        })
        const res = await fetch(`https://services.myshiptracking.com/requests/vesselsonmaptempw.php?${params}`);
        const body = await res.text();
        console.log(body);
    }
}





export default AIS;
