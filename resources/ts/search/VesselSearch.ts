import AIS from "../api/AIS";
import DisplayInfo from "../display-info/DisplayInfo";
import DisplayVesselInfo from "../display-info/DisplayVesselInfo";
import { SearchResult } from "../types/SearchTypes";
import Search from "./Search";

/**
 * Voegt zoekfunctionaliteit toe voor schepen
 */
export default class VesselSearch extends Search {
    protected SEARCH_FILTERS = { excludePorts: true };
    protected MIN_INPUT_LENGTH = 3;
    protected RESULTS_ELEMENT = document.getElementById("vessel-search-results") as HTMLDivElement;

    public constructor(map: L.Map, searchBarId: string, displayInfo: DisplayVesselInfo) {
        super(map, searchBarId, displayInfo);
    }

    protected async getSearchResults(query: string): Promise<SearchResult[]> {
        return await AIS.search(query, this.SEARCH_FILTERS);
    }

    protected displayResult(searchResult: SearchResult): HTMLElement {
        const div = document.createElement("div");
        div.classList.add("list-group-item", "list-group-item-action", "my-2");

        const title = this.createTitle(searchResult);
        const info = this.createInfo(searchResult);

        div.append(title, info);

        return div;
    }

    /**
     * Maakt de desctiptie voor items in de lijst met zoekresultaten
     * @param searchResult 1 zoekresultaat van het zoeken
     * @returns HTML item voor de descriptie van het zoekresultaat
     */
    private createInfo(searchResult: SearchResult): HTMLParagraphElement {
        const info = document.createElement("p");
        info.classList.add("mb-1", "small");
        info.innerHTML = `${searchResult.typeText} (${searchResult.mmsi || searchResult.portId})`;

        return info;
    }

    /**
     * Maakt de titel voor items in de lijst met zoekresultaten
     * @param searchResult 1 zoekresultaat van het zoeken
     * @returns HTML item voor de titel van het zoekresultaat
     */
    private createTitle(searchResult: SearchResult): HTMLElement {
        const title = document.createElement("strong");
        title.classList.add("mb-1");
        title.innerText = `${searchResult.name} (${searchResult.flag})`;

        return title;
    }
}
