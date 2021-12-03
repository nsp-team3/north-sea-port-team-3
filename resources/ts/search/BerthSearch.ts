import DisplayBerthInfo from "../display-info/DisplayBerthInfo";
import { BerthSearchResult, SearchResult } from "../types/SearchTypes";
import Search from "./Search";

const berthsData = require("../../northSeaPortGeoJson/ligplaatsen_northsp.json");

export default class BerthSearch extends Search {
    protected MIN_INPUT_LENGTH = 1;
    protected RESULTS_ELEMENT = document.getElementById("berth-search-results") as HTMLDivElement;

    public constructor(map: L.Map, searchBarId: string, displayInfo: DisplayBerthInfo) {
        super(map, searchBarId, displayInfo);
    }

    public static convertFeaturesToBerths(features: any): BerthSearchResult[] {
        return features.map((feature: any) => this.convertFeatureToBerth(feature));
    }

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

    private createInfo(berthResult: BerthSearchResult): HTMLParagraphElement {
        const info = document.createElement("p");
        info.classList.add("mb-1", "small");
        info.innerHTML = `${berthResult.region} - ${berthResult.type}`;

        return info;
    }

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