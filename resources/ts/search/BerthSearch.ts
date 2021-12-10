import DisplayBerthInfo from "../display-info/DisplayBerthInfo";
import { BerthSearchResult, SearchResult } from "../types/SearchTypes";
import Search from "./Search";

const berthsData = require("../../northSeaPortGeoJson/ligplaatsen_northsp.json");

/**
 * Voegt zoekfunctionaliteit toe voor ligplaatsen
 */
export default class BerthSearch extends Search {
    protected SEARCH_FILTERS = {};
    protected MIN_INPUT_LENGTH = 1;
    protected RESULTS_ELEMENT = document.getElementById("berth-search-results") as HTMLDivElement;

    /**
     * @param map koppeling met de kaart, bijvoorbeeld zoomen naar locatie van boot
     * @param searchBarId ID van de zoekbalk binnen html
     * @param displayInfo koppeling met de class die aangeeft hoe de data moet worden weergeven
     */
    public constructor(map: L.Map, searchBarId: string, displayInfo: DisplayBerthInfo) {
        super(map, searchBarId, displayInfo);
    }

    /**
     * Gaat over elk item binnen geojsonom het te converten naar een leesbare dictionary
     * @param features geojson data
     * @returns array van dictionaries met ligplaatsinformatie
     */
    public static convertFeaturesToBerths(features: any): BerthSearchResult[] {
        return features.map((feature: any) => this.convertFeatureToBerth(feature));
    }

    /**
     * Zet de geojson data om naar een makkelijk leesbaar dictionary met ligplaatsinformatie
     * https://leafletjs.com/examples/geojson/
     * @param feature huidige ligplaats binnen geojson
     * @returns makkelijk leesbare dictionary
     */
    public static convertFeatureToBerth(feature: any): BerthSearchResult {
        const properties = feature.properties;
        return {
            id: properties.ligplaatsNr ? Number(properties.ligplaatsNr.substring(2)) : undefined,
            name: properties.enigmaNaam,
            owner: properties.eigenaar,
            enigmaCode: properties.enigmaCode,
            externalCode: properties.externeCode,
            maxDepth: properties.maxDiepgang_m ? parseFloat(properties.maxDiepgang_m) : undefined,
            type: properties.type,
            region: properties.zone,
            center: properties.center,
            width: properties.breedte ? Number(properties.breedte) : undefined,
            length: properties.lengte ? Number(properties.lengte) : undefined,
            dock: properties.dok
        }
    }

    protected async getSearchResults(query: string): Promise<BerthSearchResult[]> {
        const berths = BerthSearch.convertFeaturesToBerths(berthsData.features).filter((berth: BerthSearchResult) => (berth.name) ? berth.name.includes(query) || String(berth.id).startsWith(query) : false);

        if (!isNaN(Number(query))) {
            return berths.sort((a: BerthSearchResult, b: BerthSearchResult) => {
                if (a.id < b.id) {
                    return -1;
                }
                if (a.id > b.id) {
                    return 1;
                }
                return 0;
            });
        }

        return berths;
    }

    protected displayResult(berthResult: any): HTMLElement {
        const div = document.createElement("div");
        div.classList.add("list-group-item", "list-group-item-action", "my-2");

        const title = this.createTitle(berthResult);
        const info = this.createInfo(berthResult);

        div.append(title, info);

        return div;
    }

    /**
     * Maakt de desctiptie voor items in de lijst met zoekresultaten
     * @param berthResult 1 zoekresultaat van het zoeken
     * @returns HTML item voor de descriptie van het zoekresultaat
     */
    private createInfo(berthResult: BerthSearchResult): HTMLParagraphElement {
        const info = document.createElement("p");
        info.classList.add("mb-1", "small");
        info.innerHTML = `${berthResult.region} - ${berthResult.type}`;

        return info;
    }

    /**
     * Maakt de titel voor items in de lijst met zoekresultaten
     * @param berthResult 1 zoekresultaat van het zoeken
     * @returns HTML item voor de titel van het zoekresultaat
     */
    private createTitle(berthResult: BerthSearchResult): HTMLElement {
        const title = document.createElement("strong");
        title.classList.add("mb-1");
        title.innerText = `${berthResult.name} (${berthResult.id})`;

        return title;
    }

    protected onResultClicked(berthResult: any): void {
        this.hideDiv();
        this.displayInfo.show(berthResult, this);
        this.map.flyTo(berthResult.center, 16);
    }
}
