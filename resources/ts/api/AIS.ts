/// <reference path="Vessel.ts" />

import { Vessel } from "./Vessel";

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
}

export default AIS;
