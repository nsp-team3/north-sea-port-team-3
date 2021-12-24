import * as L from "leaflet";
import Application from "../app";
import BerthLayer from "../layers/BerthLayer";
import { BerthInfo } from "../types/berth-types";
import Search from "./Search";

const berthsData = require("../../northSeaPortGeoJson/ligplaatsen_northsp.json");

type feature = {
	properties: {
		lat: string,
		long: string,
		ligplaatsNr: string,
		enigmaNaam: string,
		eigenaar: string,
		enigmaCode: string,
		externeCode: string,
		maxDiepgang_m: string,
		type: string,
		zone: string,
		breedte: string,
		lengte: string,
		dok: number
	}
}

/**
 * Voegt zoekfunctionaliteit toe voor ligplaatsen
 */
export default class BerthSearch extends Search {
    /**
     * @param searchBarId ID van de zoekbalk binnen html
     */
    public constructor(searchBarId: string) {
        super(searchBarId);
    }

    /**
     * Gaat over elk item binnen geojsonom het te converten naar een leesbare dictionary
     * @param features geojson data
     * @returns array van dictionaries met ligplaatsinformatie
     */
    public convertFeaturesToBerths(features: any): BerthInfo[] {
        return features.map((feature: feature) => this.convertFeatureToBerth(feature)).filter((berth: BerthInfo) => berth !== undefined);
    }

    /**
     * Zet de geojson data om naar een makkelijk leesbaar dictionary met ligplaatsinformatie
     * https://leafletjs.com/examples/geojson/
     * @param feature huidige ligplaats binnen geojson
     * @returns makkelijk leesbare dictionary
     */
    public convertFeatureToBerth(feature: feature): BerthInfo | void {
        const properties = feature.properties;
        if (!properties.lat || !properties.long) {
            return;
        }
        return {
            id: properties.ligplaatsNr ? Number(properties.ligplaatsNr.substring(2)) : undefined,
            name: properties.enigmaNaam,
            owner: properties.eigenaar,
            enigmaCode: properties.enigmaCode,
            externalCode: properties.externeCode,
            maxDepth: properties.maxDiepgang_m ? parseFloat(properties.maxDiepgang_m) : undefined,
            type: properties.type,
            region: properties.zone,
            location: this.getCenter(properties),
            width: properties.breedte ? Number(properties.breedte) : undefined,
            length: properties.lengte ? Number(properties.lengte) : undefined,
            dock: properties.dok
        }
    }

    protected async getSearchResults(query: string): Promise<BerthInfo[]> {
        if (query.length < 2) {
            return [];
        }

        return this.convertFeaturesToBerths(berthsData.features).filter((berth: BerthInfo) => (berth.name) ? berth.name.includes(query) || String(berth.id).startsWith(query) : false);
    }

    protected async executeSearch(): Promise<void> {
        const searchbar = document.getElementById(Search.SEARCH_BAR_ID) as HTMLInputElement;
        const searchResultsElement = document.getElementById(Search.RESULTS_ID) as HTMLTableElement;
        const results = await this.getSearchResults(searchbar.value).catch(console.error);
        if (results) {
            results.forEach((result) => this.displayResult(searchResultsElement, result));
        }
    }

    protected displayResult(searchResultsElement: HTMLTableElement, berthResult: BerthInfo): void {
        const div = document.createElement("div");
        div.classList.add("list-group-item", "list-group-item-action", "my-2");

        const title = this.createTitle(berthResult);
        const info = this.createInfo(berthResult);

        div.append(title, info);
        div.addEventListener("click", () => this.onResultClicked(berthResult));

        searchResultsElement.appendChild(div);
    }

    private getCenter(properties: {lat: string, long: string}): L.LatLng {
        const filteredLat = Number(properties.lat.replace(",", "."));
        const filteredLng = Number(properties.long.replace(",", "."));
        return new L.LatLng(filteredLat, filteredLng)
    }

    /**
     * Maakt de desctiptie voor items in de lijst met zoekresultaten
     * @param berthResult 1 zoekresultaat van het zoeken
     * @returns HTML item voor de descriptie van het zoekresultaat
     */
    private createInfo(berthResult: BerthInfo): HTMLParagraphElement {
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
    private createTitle(berthResult: BerthInfo): HTMLElement {
        const title = document.createElement("strong");
        title.classList.add("mb-1");
        title.innerText = `${berthResult.name} (${berthResult.id})`;

        return title;
    }

    protected onResultClicked(berthInfo: BerthInfo): void {
        const berthLayer = Application.layers.berths as BerthLayer;
        berthLayer.focus(berthInfo);
    }
}
