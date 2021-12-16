import AIS from "../api/AIS";
import DisplayPortInfo from "../display-info/DisplayPortInfo";
import { SearchResult } from "../types/SearchTypes";
import Search from "./Search";

/**
 * Voegt zoekfunctionaliteit toe voor havens
 */
export default class PortSearch extends Search {
    private SEARCH_FILTERS = { excludeVessels: true };

    /**
     * @param map koppeling met de kaart, bijvoorbeeld zoomen naar locatie van boot
     * @param searchButtonId ID van de zoekbalk binnen html
     * @param displayInfo koppeling met de class die aangeeft hoe de data moet worden weergeven
     */
    public constructor(map: L.Map, sidebar: L.Control.Sidebar, searchButtonId: string) {
        super(map, sidebar, searchButtonId);
    }

    protected async executeSearch(): Promise<void> {
        const searchbar = document.getElementById(Search.SEARCH_BAR_ID) as HTMLInputElement;
        const searchResultsElement = document.getElementById(Search.RESULTS_ID) as HTMLTableElement;
        const results = await AIS.search(searchbar.value, this.SEARCH_FILTERS).catch(console.error);
        if (results) {
            results.forEach((result) => this.displayResult(searchResultsElement, result));
        }
    }
    

    protected displayResult(searchResultsElement: HTMLTableElement, searchResult: SearchResult): void {
        const div = document.createElement("div");
        div.classList.add("list-group-item", "list-group-item-action", "my-2");

        const title = this.createTitle(searchResult);
        const info = this.createInfo(searchResult);

        div.append(title, info);
        div.addEventListener("click", () => {
            console.log("TODO: SHOW PORT DETAILS");
        });

        searchResultsElement.appendChild(div);
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
