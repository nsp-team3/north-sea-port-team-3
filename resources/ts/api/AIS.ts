/// <reference path="Vessel.ts" />

import { Vessel } from "./Vessel";

type VesselFilters = {
    minimumLatitude: number;
    maximumLatitude: number;
    minimumLongitude: number;
    maximumLongitude: number;
    zoom: number;
    vesselType: number;
}
export class AIS {
    private static BASE_URL: string = "https://services.myshiptracking.com/requests";

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

    public static filterVessels = async () : Promise<void> => {
        const params = new URLSearchParams({
            type: "json",
            minlat: String(1),
            maxlat: String(50),
            minlon: String(1),
            maxlon: String(50),
            zoom: String(17),
            selid: "null",
            seltype: "null",
            timecode: "0",
            slmp: "",
            filters: JSON.stringify({
                "vtypes": ",0,3,4,6,7,8,9,10,11,12,13",
                "minsog": 0,
                "maxsog": 60,
                "minsz": 0,
                "maxsz": 500,
                "minyr": 1950,
                "maxyr": 2021,
                "flag": "",
                "status": "",
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

AIS.filterVessels();



export default AIS;
