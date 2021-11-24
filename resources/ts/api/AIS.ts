/// <reference path="Vessel.ts" />

import * as Leaflet from "leaflet";
import { Vessel } from "./Vessel";
import VesselFilters from "../types/VesselFilters";
import SimpleVesselInfo from "../types/SimpleVesselInfo";
import { parseHtmlDate } from "./Util";

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

    public static searchVessels = async (map: Leaflet.Map, vesselFilters: VesselFilters) : Promise<SimpleVesselInfo[]> => {
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
                "mapflt_from": typeof(vesselFilters.originPortId) === "number" ? String(vesselFilters.originPortId) : "", // Departure port id
                "mapflt_dest": typeof(vesselFilters.destinationPortId) === "number" ? String(vesselFilters.destinationPortId) : "", // Destination port id
                "ports": vesselFilters.includePorts ? "1" : undefined
            }),
            _: String(new Date().getTime())
        });
        const res = await fetch(`https://services.myshiptracking.com/requests/vesselsonmaptempw.php?${params}`);
        const body = await res.text();
        const foundVessels = AIS.parseSearchResponse(body);

        const filteredVessels = foundVessels.filter((simpleVesselInfo)=>{
            const destination = simpleVesselInfo.destination;
            const portID = simpleVesselInfo.portId;
            const matchesPortId = vesselFilters.currentPortId ? portID && portID === vesselFilters.currentPortId : true;
            const matchesDestination = vesselFilters.destination ? destination && destination.toLowerCase().includes("Vlissingen".toLowerCase()) : true;
            
            return matchesPortId && matchesDestination;
        })

        return filteredVessels;
    }

    private static parseSearchResponse = (body: string): SimpleVesselInfo[] => {
        const allInfo = body.split("\n");
        allInfo.shift();
        allInfo.pop();
        return allInfo.map((line) => {
            const shipInfo = line.split("\t");
            return this.parseSimpleVesselInfo(shipInfo);
        });
    }

    private static parseSimpleVesselInfo = (shipInfo: string[]): SimpleVesselInfo => {
        const simpleInfo: SimpleVesselInfo = {
            aisType: Number(shipInfo[0]),
            mmsi: Number(shipInfo[1]),
            name: shipInfo[2],
            speed: Number(shipInfo[3]),
            direction: Number(shipInfo[4]),
            longitude: Number(shipInfo[5]),
            latitude: Number(shipInfo[6]),
            requestTime: new Date(Number(shipInfo[12] + "000")),
            portId: Number(shipInfo[15]),
            vesselType: Number(shipInfo[16]),
        }

        if (shipInfo[11] && shipInfo[11].length > 0) {
            simpleInfo.arrival = new Date(shipInfo[11]);
        }

        if (shipInfo[13] && shipInfo[13].length > 0) {
            simpleInfo.destination = shipInfo[13];
        }

        if (shipInfo[14] && shipInfo[14].length > 0) {
            simpleInfo.ETA = new Date(Number(shipInfo[14] + "000"));
        }

        return simpleInfo;
    }

}

export default AIS;
