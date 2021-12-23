import PortAPI from "../api/PortAPI";
import Application from "../app";
import DisplayPortInfo from "../displays/DisplayPortInfo";
import VesselLayer from "../layers/VesselLayer";
import { PortSearchResult } from "../types/port-types";
import Search from "./Search";

/**
 * Voegt zoekfunctionaliteit toe voor havens
 */
export default class PortSearch extends Search {
    /**
     * @param map koppeling met de kaart, bijvoorbeeld zoomen naar locatie van boot
     * @param searchButtonId ID van de zoekbalk binnen html
     */
    public constructor(searchButtonId: string) {
        super(searchButtonId);
    }

    protected async executeSearch(): Promise<void> {
        const searchbar = document.getElementById(Search.SEARCH_BAR_ID) as HTMLInputElement;
        const searchResultsElement = document.getElementById(Search.RESULTS_ID) as HTMLTableElement;
        const results = await PortAPI.search(searchbar.value).catch(console.error);
        if (results) {
            results.forEach((result) => this.displayResult(searchResultsElement, result));
        }
    }

    protected displayResult(searchResultsElement: HTMLTableElement, searchResult: PortSearchResult): void {
        const div = document.createElement("div");
        div.classList.add("list-group-item", "list-group-item-action", "my-2");

        const title = this.createTitle(searchResult);
        const info = this.createInfo(searchResult);

        div.append(title, info);
        const vesselLayer = Application.layers.vessels as VesselLayer;
        const portsDisplay = Application.displays.ports as DisplayPortInfo;
        div.addEventListener("click", async () => {
            const portDetails = await PortAPI.getDetails(searchResult.portId);
            if (portDetails) {
                vesselLayer.flyTo(portDetails.latitude, portDetails.longitude);
                portsDisplay.show(searchResult.portId);
            }
        });

        searchResultsElement.appendChild(div);
    }

    /**
     * Maakt de desctiptie voor items in de lijst met zoekresultaten
     * @param searchResult 1 zoekresultaat van het zoeken
     * @returns HTML item voor de descriptie van het zoekresultaat
     */
    private createInfo(searchResult: PortSearchResult): HTMLParagraphElement {
        const info = document.createElement("p");
        info.classList.add("mb-1", "small");
        info.innerHTML = `Port (${searchResult.portId})`;

        return info;
    }

    /**
     * Maakt de titel voor items in de lijst met zoekresultaten
     * @param searchResult 1 zoekresultaat van het zoeken
     * @returns HTML item voor de titel van het zoekresultaat
     */
    private createTitle(searchResult: PortSearchResult): HTMLElement {
        const title = document.createElement("strong");
        title.classList.add("mb-1");
        title.innerText = `${searchResult.name} (${searchResult.flag})`;

        return title;
    }
}
