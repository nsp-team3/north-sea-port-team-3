/// <reference path="Vessel.ts" />

import { Vessel } from "./Vessel";
import * as Leaflet from "leaflet";
import VesselFilters from "../types/VesselFilters";
import SimpleVesselInfo from "../types/enums/SimpleVesselInfo";

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

    public static filterVessels = async (map: Leaflet.Map, vesselFilters: VesselFilters) : Promise<SimpleVesselInfo[]> => {
        const bounds = map.getBounds();
        const sw = bounds.getSouthWest();
        const ne = bounds.getNorthEast();
        const vesselTypes: string = (vesselFilters.vesselTypes !== undefined) ? vesselFilters.vesselTypes.join(",") : ",0,3,4,6,7,8,9,10,11,12,13";

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
                "vtypes": "," + vesselTypes,
                "minsog": 0, // Minimum speed in knots
                "maxsog": 60, // Maximum speed in knots
                "minsz": 0, // Minimum length
                "maxsz": 500, // Maximum length
                "minyr": 1950, // Minimum build yeare
                "maxyr": 2021, // Maximum build year
                "flag": typeof(vesselFilters.countryCode) === "string" ? vesselFilters.countryCode : "",
                "status": typeof(vesselFilters.status) === "number" ? vesselFilters.status : "",
                "mapflt_from": typeof(vesselFilters.origin) === "number" ? String(vesselFilters.origin) : "", // Departure port id
                "mapflt_dest": typeof(vesselFilters.destination) === "number" ? String(vesselFilters.destination) : "", // Destination port id
                "ports": vesselFilters.includePorts ? "1" : undefined
            }),
            _: String(new Date().getTime())
        });
        const res = await fetch(`https://services.myshiptracking.com/requests/vesselsonmaptempw.php?${params}`);
        const body = await res.text();
        return AIS.parseSearchResponse(body);
    }

    private static parseSearchResponse = async (body: string): Promise<SimpleVesselInfo[]> => {
        const allInfo = body.split("\n");
        allInfo.shift();
        allInfo.pop();
        return allInfo.map((line) => {
            const shipInfo = line.split("\t");
            return {
                aisType: Number(shipInfo[0]),
                imo: Number(shipInfo[1]),
                name: shipInfo[2],
                speed: Number(shipInfo[3]),
                direction: Number(shipInfo[4]),
                longitude: Number(shipInfo[5]),
                latitude: Number(shipInfo[6]),
                _S1: Number(shipInfo[7]),
                _S2: Number(shipInfo[8]),
                _S3: Number(shipInfo[9]),
                _S4: Number(shipInfo[10]),
                arrivalText: shipInfo[11],
                arrival: shipInfo[11].length > 0 ? new Date(Number(shipInfo[11] + '000')) : undefined,
                requestTime: new Date(Number(shipInfo[12] + '000')),
                destination: shipInfo[13],
                ETA: shipInfo[14].length > 0 ? new Date(Number(shipInfo[14] + '000')) : undefined,
                portId: Number(shipInfo[15]),
                vesselType: Number(shipInfo[16]),
                _offset: shipInfo[17],
            }
        });
    }
}

export default AIS;
