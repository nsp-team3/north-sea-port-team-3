import AIS from "../api/AIS";
import DisplayVesselInfo from "../display-info/DisplayVesselInfo";
import VesselLayer from "../layers/VesselLayer";
import { SearchResult } from "../types/SearchTypes";
import Search from "./Search";

/**
 * Voegt zoekfunctionaliteit toe voor schepen
 */
export default class VesselSearch extends Search {
    private SEARCH_FILTERS = { excludePorts: true };

    public constructor(vesselLayer: VesselLayer, sidebar: L.Control.Sidebar, searchButtonId: string) {
        super(vesselLayer, sidebar, searchButtonId);
        this.displayInfo = new DisplayVesselInfo(vesselLayer, sidebar);
    }

    protected async executeSearch(): Promise<void> {
        if (!this.enabled) {
            return;
        }

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
        div.addEventListener("click", async () => {
            this.displayInfo.show(searchResult);
            const vessel = await AIS.getVessel(searchResult.mmsi);
            const layer = this.layer as VesselLayer;
            const simpleVesselInfo = await vessel.getLocationInfo();
            layer.focusVessel(simpleVesselInfo, true);
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
