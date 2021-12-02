import Search from "../search/Search";
import { BerthSearchResult } from "../types/SearchTypes";
import DisplayInfo from "./DisplayInfo";

export default class DisplayBerthInfo extends DisplayInfo {
    public constructor(mainDivId: string, titleId: string, infoTableId: string, backButtonId: string) {
        super(mainDivId, titleId, infoTableId, backButtonId);
    }

    public async show(searchResult: any, search: Search): Promise<void> {
        this.clearTable();
        this.setTitle(searchResult.name);
        this.loadTableData(searchResult);
        this.previousSearch = search;
        this.showDiv();
    }

    protected loadTableData(berthResult: BerthSearchResult): void {
        console.log(berthResult);
    }
}