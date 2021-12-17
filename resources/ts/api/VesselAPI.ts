import { SimpleVesselInfo, VesselFilters, VesselSearchFilters, VesselSearchResult, VesselType } from "../types/vessel-types";
import { VesselInfo } from "./VesselInfo";

export default class VesselAPI {
    private static readonly SHIP_TRACKING_URL = "https://services.myshiptracking.com/requests";
    private static readonly SEARCH_URL: string = "/api/search";

    /**
     * Haalt schepen op die in de buurt zijn van het gebied, dat de gebruiker bekijkt op de kaart.
     * @param map De leaflet kaart die wordt gebruikt om de lagen op te tonen.
     * @param vesselFilters Filters om alleen bepaalde schepen op te halen van de api.
     * @returns Nabijgelegen schepen.
     */
    public static async getNearbyVessels(vesselFilters: VesselFilters): Promise<SimpleVesselInfo[]> {
        const params = this.getNearbyVesselParameters(vesselFilters);
        const res = await fetch(`${this.SHIP_TRACKING_URL}/vesselsonmaptempw.php?${params}`);
        const body = await res.text();
        const nearbyVessels = VesselAPI.parseNearbyVesselsResponse(body);
        // TODO: Add UI for these filters, and then implement other filters.
        return nearbyVessels.filter((simpleVesselInfo) => {
            const portId = simpleVesselInfo.portId;
            const matchesPortId = vesselFilters.currentPortId ? portId && portId === vesselFilters.currentPortId : true;
            return matchesPortId;
        });
    }

    /**
     * Zoekt naar resultaten op basis van een zoekopdracht en filters.
     * @param query De zoekopdracht, dit kan een naam of identificatienummer zijn.
     * @param searchFilters De filters voor de zoekopdracht.
     * @returns Zoekresultaten.
     */
    public static search = async (query: string, searchFilters?: VesselSearchFilters): Promise<VesselSearchResult[]> => {
        const res = await fetch(`${VesselAPI.SEARCH_URL}?query=${query}`).catch(console.error);
        if (!res || res.status !== 200) {
            return [];
        }
        const body = await res.text();
        return VesselAPI.filterSearchResults(VesselAPI.parseSearchXML(body), searchFilters);
    }

    public static async getLocationInfo(mmsi: number): Promise<SimpleVesselInfo | void> {
        const params: URLSearchParams = new URLSearchParams({
            type: "json",
            selid: String(mmsi),
            seltype: "0",
            _: String(new Date().getTime())
        });
        const response = await fetch(`${VesselAPI.SHIP_TRACKING_URL}/vesselsonmaptempw.php?${params}`).catch(console.error);
        if (response) {
            const body = await response.text();
            const results = VesselAPI.parseNearbyVesselsResponse(body);
            if (results.length === 0) {
                return;
            }
    
            return results.length > 0 ? results[0] : undefined;
        }
    }

    public static async getDetails(mmsi: number): Promise<VesselInfo | void> {
        const params = new URLSearchParams({
            type: "json",
            mmsi: String(mmsi),
            slmp: undefined
        });
        const res = await fetch(`${VesselAPI.SHIP_TRACKING_URL}/vesseldetails.php?${params}`);
        const rawInfo = await res.json();

        return new VesselInfo(rawInfo);
    }

    /**
     * Maakt de parameters aan die nodig zijn om de nabijgelen schepen op te vragen.
     * @param vesselFilters Filters die worden ingesteld in de url parameters.
     * @returns Url parameters
     */
    private static getNearbyVesselParameters(vesselFilters: VesselFilters): URLSearchParams {
        return new URLSearchParams({
            type: "json",
            minlat: String(vesselFilters.southWest.lat),
            maxlat: String(vesselFilters.northEast.lat),
            minlon: String(vesselFilters.southWest.lng),
            maxlon: String(vesselFilters.northEast.lng),
            zoom: String(Math.round(vesselFilters.zoom)),
            selid: "null",
            seltype: "null",
            timecode: "0",
            slmp: "",
            filters: JSON.stringify({
                "vtypes": VesselAPI.getVesselTypes(vesselFilters.vesselTypes),
                "minsog": 0, // Minimum speed in knots
                "maxsog": 60, // Maximum speed in knots
                "minsz": 0, // Minimum length
                "maxsz": 500, // Maximum length
                "minyr": 1950, // Minimum build yeare
                "maxyr": new Date().getUTCFullYear(), // Maximum build year
                "flag": typeof(vesselFilters.countryCode) === "string" ? vesselFilters.countryCode : "",
                "status": typeof(vesselFilters.status) === "number" ? vesselFilters.status : "",
                "mapflt_from": typeof(vesselFilters.originPortId) === "number" ? String(vesselFilters.originPortId) : "", // Departure port id
                "mapflt_dest": typeof(vesselFilters.destinationPortId) === "number" ? String(vesselFilters.destinationPortId) : "", // Destination port id
                "ports": vesselFilters.includePorts ? "1" : undefined
            }),
            _: String(new Date().getTime())
        });
    }

    private static getVesselTypes(vesselTypes?: VesselType[]): string {
        if (vesselTypes !== undefined && vesselTypes.length > 0) {
            return "," + vesselTypes.join(",");
        }
        return ",0,3,4,6,7,8,9,10,11,12,13";
    }

    /**
     * Zet de onbewerkte gegevens van nabijgelegen schepen om naar JSON, zodat het gebruikt kan worden in code.
     * @param body Onbewerkte gegevens van nabijgelen schepen.
     * @returns Informatie van nabijgelen schepen in JSON.
     */
    private static parseNearbyVesselsResponse = (body: string): SimpleVesselInfo[] => {
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

    /**
     * Past de filters toe op de zoekresultaten.
     * @param searchResults De zoekresultaten.
     * @param searchFilters De zoekfilters.
     * @returns Gefilterde zoekresultaten.
     */
     private static filterSearchResults = (searchResults: VesselSearchResult[], searchFilters?: VesselSearchFilters): VesselSearchResult[] => {
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
    private static parseSearchXML(xml: string): VesselSearchResult[] {
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
}