import Search from "../search/Search";
import { BerthSearchResult } from "../types/SearchTypes";
import DisplayInfo from "./DisplayInfo";

export default class DisplayBerthInfo extends DisplayInfo {
    protected TITLE_TEXT: string = "Ligplaatsen";

    public constructor(map: L.Map, sidebar: L.Control.Sidebar) {
        super(map, sidebar);
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