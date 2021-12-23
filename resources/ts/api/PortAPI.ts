import { PortDetails, PortSearchFilters, PortSearchResult } from "../types/port-types";

export default class PortAPI {
    private static readonly SEARCH_URL = "/api/search";
    private static readonly DETAILS_URL = "/api/ports";

    /**
     * Zoekt naar resultaten op basis van een zoekopdracht en filters.
     * @param query De zoekopdracht, dit kan een naam of identificatienummer zijn.
     * @param searchFilters De filters voor de zoekopdracht.
     * @returns Zoekresultaten.
     */
    public static async search(query: string, searchFilters?: PortSearchFilters): Promise<PortSearchResult[]> {
        const res = await fetch(`${PortAPI.SEARCH_URL}?query=${query}`).catch(console.error);
        if (!res || res.status !== 200) {
            return [];
        }
        const body = await res.text();
        return PortAPI.filterSearchResults(PortAPI.parseSearchXML(body), searchFilters);
    }

    public static async getDetails(portId: number): Promise<PortDetails | void> {
        const res = await fetch(`${PortAPI.DETAILS_URL}?id=${portId}`);
        if (res.status === 200) {
            return await res.json();
        }
    } 

    /**
     * Past de filters toe op de zoekresultaten.
     * @param searchResults De zoekresultaten.
     * @param searchFilters De zoekfilters.
     * @returns Gefilterde zoekresultaten.
     */
    private static filterSearchResults = (searchResults: PortSearchResult[], searchFilters?: PortSearchFilters): PortSearchResult[] => {
        searchResults = searchResults.filter((searchResult) => searchResult.portId ? searchResult.portId < 1000000 : true);

        if (!searchFilters) {
            return searchResults;
        }

        console.log("Complete TODOs of PortAPI");
        // TODO: Filter by name
        // TODO: Filter by port id
        // TODO: Filter by flag

        return searchResults;
    }

    /**
     * Zet XML gegevens om naar JSON, zodat het makkelijker te gebruiken is in code.
     * @param xml De onbewerkte response data.
     * @returns Informatie van zoekresultaten in JSON.
     */
    private static parseSearchXML(xml: string): PortSearchResult[] {
        const resultsMatch = xml.match(/<RES>.*?<\/RES>/g);
        if (!resultsMatch) {
            return [];
        }

        return resultsMatch.map((e) => {
            const resultInfoMatch = e.match(/<RES><ID>([0-9]*)<\/ID><NAME>(.*?)<\/NAME><D>(.*?)<\/D><TYPE>([0-9]*)<\/TYPE><FLAG>([a-zA-Z]+)<\/FLAG><LAT>.*?<\/LAT><LNG>.*?<\/LNG><\/RES>/);
            if (resultInfoMatch && resultInfoMatch[4] === "0") {
                return {
                    portId: Number(resultInfoMatch[1]),
                    name: resultInfoMatch[2],
                    flag: resultInfoMatch[5]
                }
            }
            return undefined;
        }).filter((e) => e !== undefined);
    }
}