export default abstract class DisplayInfo {
    // De id van de leaflet details sidebar.
    protected readonly DETAILS_TAB_ID: string = "detailsTab";
    // De id van de leaflet search sidebar.
    protected readonly SEARCH_TAB_ID: string = "searchTab";
    protected readonly INFO_TABLE_ID: string = "details-content";
    protected readonly BACK_BUTTON_ID: string = "back-button";
    protected readonly TITLE_ID: string = "details-title";

    protected title: HTMLHeadingElement;
    protected sidebar: L.Control.Sidebar;

    protected detailsTable: HTMLTableElement;
    protected backButton: HTMLButtonElement;

    protected abstract loadTableData(info: any): void;
    
    public constructor(sidebar: L.Control.Sidebar) {
        this.detailsTable = document.getElementById(this.INFO_TABLE_ID) as HTMLTableElement;
        this.backButton = document.getElementById(this.BACK_BUTTON_ID) as HTMLButtonElement;
        this.title = document.getElementById(this.TITLE_ID) as HTMLHeadingElement;
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
            this.sidebar.open(this.SEARCH_TAB_ID);
        });
    }
}