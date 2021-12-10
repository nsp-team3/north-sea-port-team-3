/// <reference path="Vessel.ts" />

import * as Leaflet from "leaflet";
import { Vessel } from "./Vessel";
import VesselFilters from "../types/VesselFilters";
import SimpleVesselInfo from "../types/SimpleVesselInfo";
import { SearchFilters, SearchResult } from "../types/SearchTypes";
import PortInfoResponse from "../types/PortInfoResponse";
import VesselType from "../types/enums/VesselType";

/**
 * Een klasse die gebruikt wordt om HTTP requests te maken naar verschillende endpoints.
 */
export class AIS {
    private static readonly BASE_URL = "https://services.myshiptracking.com/requests";
    private static readonly PORT_URL = "/api/ports";
    private static readonly SEARCH_URL: string = "/api/search";
    private static readonly HIDDEN_AIS_TYPES: VesselType[] = [
        VesselType.AirCraft,
        VesselType.BaseStation,
        VesselType.NavigationAid
    ];

    /**
     * Vraagt gedetailleerde informatie op over een schip
     * @param mmsi Het AIS identificatienummer van een schip.
     * @returns De gedetailleerde informatie over een schip.
     */
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

    /**
     * Vraagt gedetailleerde informatie op over een haven.
     * @param id Het identificatienummer van een haven.
     * @returns Gedetailleerde informatie van een haven.
     */
    public static async getPort(id?: number | void): Promise<PortInfoResponse | void> {
        const res = await fetch(`${AIS.PORT_URL}?id=${id}`);
        if (res.status === 200) {
            return await res.json();
        }
    }

    /**
     * Zoekt naar resultaten op basis van een zoekopdracht en filters.
     * @param query De zoekopdracht, dit kan een naam of identificatienummer zijn.
     * @param searchFilters De filters voor de zoekopdracht.
     * @returns Zoekresultaten.
     */
    public static search = async (query: string, searchFilters?: SearchFilters): Promise<SearchResult[]> => {
        const res = await fetch(`${AIS.SEARCH_URL}?query=${query}`).catch(console.error);
        if (!res || res.status !== 200) {
            return [];
        }

        const body = await res.text();
        return AIS.filterSearchResults(AIS.parseSearchXML(body), searchFilters);
    }

    /**
     * Haalt schepen op die in de buurt zijn van het gebied, dat de gebruiker bekijkt op de kaart.
     * @param map De leaflet kaart die wordt gebruikt om de lagen op te tonen.
     * @param vesselFilters Filters om alleen bepaalde schepen op te halen van de api.
     * @returns Nabijgelegen schepen.
     */
    public static getNearbyVessels = async (map: Leaflet.Map, vesselFilters: VesselFilters = {}) : Promise<SimpleVesselInfo[]> => {
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
        const res = await fetch(`${this.BASE_URL}/vesselsonmaptempw.php?${params}`);
        const body = await res.text();
        const foundVessels = AIS.parseSearchResponse(body);

        const filteredVessels = foundVessels.filter((simpleVesselInfo)=>{
            const destination = simpleVesselInfo.destination;
            const portID = simpleVesselInfo.portId;
            const matchesPortId = vesselFilters.currentPortId ? portID && portID === vesselFilters.currentPortId : true;
            const matchesDestination = vesselFilters.destination ? destination && destination.toLowerCase().includes("Vlissingen".toLowerCase()) : true;
            const shouldBeHidden = this.HIDDEN_AIS_TYPES.includes(simpleVesselInfo.vesselType);
            
            return matchesPortId && matchesDestination && !shouldBeHidden;
        });

        return filteredVessels;
    }

    /**
     * Past de filters toe op de zoekresultaten.
     * @param searchResults De zoekresultaten.
     * @param searchFilters De zoekfilters.
     * @returns Gefilterde zoekresultaten.
     */
    private static filterSearchResults = (searchResults: SearchResult[], searchFilters?: SearchFilters): SearchResult[] => {
        searchResults = searchResults.filter((searchResult) => searchResult.portId ? searchResult.portId < 1000000 : true);

        if (!searchFilters) {
            return searchResults;
        }

        if (searchFilters.excludePorts) {
            searchResults = searchResults.filter((searchResult) => searchResult.portId === undefined);
        }
        
        if (searchFilters.excludeVessels) {
            searchResults = searchResults.filter((searchResult) => searchResult.mmsi === undefined);
        }

        return searchResults;
    }

    /**
     * Zet XML gegevens om naar JSON, zodat het makkelijker te gebruiken is in code.
     * @param xml De onbewerkte response data.
     * @returns Informatie van zoekresultaten in JSON.
     */
    private static parseSearchXML(xml: string): SearchResult[] {
        const resultsMatch = xml.match(/<RES>.*?<\/RES>/g);
        if (!resultsMatch) {
            return [];
        }

        return resultsMatch.map((e) => {
            const resultInfoMatch = e.match(/<RES><ID>([0-9]*)<\/ID><NAME>(.*?)<\/NAME><D>(.*?)<\/D><TYPE>([0-9]*)<\/TYPE><FLAG>([a-zA-Z]+)<\/FLAG><LAT>.*?<\/LAT><LNG>.*?<\/LNG><\/RES>/);
            if (resultInfoMatch) {
                const info = {
                    mmsi: Number(resultInfoMatch[1]),
                    name: resultInfoMatch[2],
                    typeText: resultInfoMatch[3],
                    type: Number(resultInfoMatch[4]),
                    flag: resultInfoMatch[5],
                    portId: 0
                }

                if (info.type === 0) {
                    info.portId = info.mmsi;
                    delete info.mmsi;
                } else {
                    delete info.portId;
                }

                return info;
            }
            return undefined;
        }).filter((e) => e !== undefined);
    }

    /**
     * Zet de onbewerkte gegevens van nabijgelegen schepen om naar JSON, zodat het gebruikt kan worden in code.
     * @param body Onbewerkte gegevens van nabijgelen schepen.
     * @returns Informatie van nabijgelen schepen in JSON.
     */
    private static parseSearchResponse = (body: string): SimpleVesselInfo[] => {
        const allInfo = body.split("\n");
        allInfo.shift();
        allInfo.pop();
        return allInfo.map((line) => {
            const shipInfo = line.split("\t");
            return this.parseSimpleVesselInfo(shipInfo);
        });
    }

    /**
     * Zet een enkele regel van onbewerkte data om naar JSON.
     * @param shipInfo Onbewerkte data van een nabijgelegen schip.
     * @returns Informatie van een nabijgelegen schip in JSON.
     */
    private static parseSimpleVesselInfo = (shipInfo: string[]): SimpleVesselInfo => {
        const simpleInfo: SimpleVesselInfo = {
            aisType: Number(shipInfo[0]),
            mmsi: Number(shipInfo[1]),
            name: shipInfo[2],
            speed: Number(shipInfo[3]),
            direction: Number(shipInfo[4]),
            latitude: Number(shipInfo[5]),
            longitude: Number(shipInfo[6]),
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
