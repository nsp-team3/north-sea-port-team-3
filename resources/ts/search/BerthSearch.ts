import DisplayBerthInfo from "../display-info/DisplayBerthInfo";
import { BerthSearchResult } from "../types/SearchTypes";
import Search from "./Search";

const berthsData = require("../../northSeaPortGeoJson/ligplaatsen_northsp.json");

export default class BerthSearch extends Search {
    protected MIN_INPUT_LENGTH = 1;
    protected RESULTS_ELEMENT = document.getElementById("berth-search-results") as HTMLDivElement;
    protected DISPLAY_INFO = new DisplayBerthInfo(
        "main-berth-info",
        "berth-name",
        "berth-info-content",
        "berth-back-button"
    );

    public constructor(map: L.Map, searchBarId: string) {
        super(map, searchBarId);
    }

    protected async getSearchResults(query: string): Promise<BerthSearchResult[]> {
        const berths = berthsData.features.map((feature: any) => {
            if (!feature.properties.ligplaatsNr) {
                return undefined;
            }
            return {
                id: Number(feature.properties.ligplaatsNr.substring(2)),
                name: feature.properties.enigmaNaam,
                owner: feature.properties.eigenaar,
                enigmaCode: feature.properties.enigmaCode,
                externalCode: feature.properties.externeCode,
                maxDepth: parseFloat(feature.properties.maxDiepgang_m),
                type: feature.properties.type,
                region: feature.properties.zone,
                coordinates: feature.geometry.coordinates,
                center: feature.properties.center,
                width: Number(feature.properties.breedte),
                length: Number(feature.properties.lengte),
                dock: feature.properties.dok
            }
        }).filter((berth: BerthSearchResult) => berth !== undefined && ( berth.name.startsWith(query) || String(berth.id).startsWith(query) ));

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
}