import Layer from "../layers/Layer";
import Search from "../search/Search";
import { BerthSearchResult } from "../types/SearchTypes";
import DisplayInfo from "./DisplayInfo";

export default class DisplayBerthInfo extends DisplayInfo {
    protected TITLE_TEXT: string = "Ligplaatsen";

    public constructor(layer: Layer, sidebar: L.Control.Sidebar) {
        super(layer, sidebar);
    }

    public async show(searchResult: any): Promise<void> {
        this.clear();
        this.setTitle(searchResult.name);
        this.loadTableData(searchResult);
    }

    protected loadTableData(berthResult: BerthSearchResult): void {
        console.log("TODO: LOAD BERTH DATA INTO TABLE");
    }
}