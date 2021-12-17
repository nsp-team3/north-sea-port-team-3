import Layer from "../layers/Layer";
import Search from "../search/Search";

export default abstract class DisplayInfo {
    // De id van de leaflet details sidebar
    public static readonly DETAILS_ID: string = "detailsTab";

    protected static readonly INFO_TABLE_ID: string = "details-content";
    protected static readonly BACK_BUTTON_ID: string = "back-button";
    protected static readonly TITLE_ID: string = "details-title";

    protected title: HTMLHeadingElement;
    protected sidebar: L.Control.Sidebar;
    protected map: L.Map;
    protected layer: Layer;

    protected detailsTable: HTMLTableElement;
    protected backButton: HTMLButtonElement;
    protected previousSearch?: Search;
    protected previousInfo?: DisplayInfo;

    protected abstract TITLE_TEXT: string;
    protected abstract loadTableData(info: any): void;
    
    public constructor(layer: Layer, sidebar: L.Control.Sidebar) {
        this.detailsTable = document.getElementById(DisplayInfo.INFO_TABLE_ID) as HTMLTableElement;
        this.backButton = document.getElementById(DisplayInfo.BACK_BUTTON_ID) as HTMLButtonElement;
        this.title = document.getElementById(DisplayInfo.TITLE_ID) as HTMLHeadingElement;
        this.map = layer.map;
        this.layer = layer;
        this.sidebar = sidebar;
        this.enableBackButton();
    }

    public abstract show(searchResult: any): void;

    public clear(): void {
        this.detailsTable.innerHTML = "";
    }

    protected setTitle(title: string): void {
        this.title.innerText = title;
    }

    protected addInfoRow(title: string, value: string): HTMLTableRowElement {
        const row = this.detailsTable.insertRow();
        const titleCell = row.insertCell(0);
        const valueCell = row.insertCell(1);

        titleCell.innerHTML = title;
        valueCell.innerHTML = value;

        return row;
    }

    protected enableBackButton(): void {
        const backButton = document.getElementById("back-button");
        backButton.addEventListener("click", () => {
            this.setTitle(this.TITLE_TEXT);
            this.sidebar.open(Search.SEARCH_ID);
        });
    }
}