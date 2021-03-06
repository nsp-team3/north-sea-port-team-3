import VesselAPI from "../api/VesselAPI";
import Application from "../app";
import DisplayVesselInfo from "../displays/DisplayVesselInfo";
import VesselLayer from "../layers/VesselLayer";
import { VesselSearchResult } from "../types/vessel-types";
import Search from "./Search";

/**
 * Voegt zoekfunctionaliteit toe voor schepen
 */
export default class VesselSearch extends Search {
    private SEARCH_FILTERS = { excludePorts: true };

    public constructor(searchButtonId: string) {
        super(searchButtonId);
    }

    protected async executeSearch(): Promise<void> {
        if (!this.enabled) {
            return;
        }

        const searchbar = document.getElementById(Search.SEARCH_BAR_ID) as HTMLInputElement;
        const searchResultsElement = document.getElementById(Search.RESULTS_ID) as HTMLTableElement;
        const results = await VesselAPI.search(searchbar.value, this.SEARCH_FILTERS).catch(console.error);
        if (results) {
            results.forEach((result) => this.displayResult(searchResultsElement, result));
        }
    }

    protected displayResult(searchResultsElement: HTMLTableElement, searchResult: VesselSearchResult): void {
        const div = document.createElement("div");
        div.classList.add("list-group-item", "list-group-item-action", "my-2");

        const title = this.createTitle(searchResult);
        const info = this.createInfo(searchResult);

        div.append(title, info);
        div.addEventListener("click", async () => {
            const simpleVesselInfo = await VesselAPI.getLocationInfo(searchResult.mmsi).catch(console.error);
            const vesselLayer = Application.layers.vessels as VesselLayer;
            const vesselDisplay = Application.displays.vessels as DisplayVesselInfo;
            if (simpleVesselInfo) {
                vesselLayer.focus(simpleVesselInfo);
                vesselDisplay.show(simpleVesselInfo.mmsi);
            }
        });

        searchResultsElement.appendChild(div);
    }

    /**
     * Maakt de desctiptie voor items in de lijst met zoekresultaten
     * @param searchResult 1 zoekresultaat van het zoeken
     * @returns HTML item voor de descriptie van het zoekresultaat
     */
    private createInfo(searchResult: VesselSearchResult): HTMLParagraphElement {
        const info = document.createElement("p");
        info.classList.add("mb-1", "small");
        info.innerHTML = `${searchResult.typeText} (${searchResult.mmsi})`;

        return info;
    }

    /**
     * Maakt de titel voor items in de lijst met zoekresultaten
     * @param searchResult 1 zoekresultaat van het zoeken
     * @returns HTML item voor de titel van het zoekresultaat
     */
    private createTitle(searchResult: VesselSearchResult): HTMLElement {
        const title = document.createElement("strong");
        title.classList.add("mb-1");
        title.innerText = `${searchResult.name} (${searchResult.flag})`;

        return title;
    }
}
