import Search from "../search/Search";

export default abstract class DisplayInfo {
    protected mainDiv: HTMLDivElement;
    protected title: HTMLHeadingElement;
    protected infoTable: HTMLTableElement;
    protected backButton: HTMLButtonElement;
    protected previousSearch?: Search;
    protected previousInfo?: DisplayInfo;
    
    public constructor(mainDivId: string, titleId: string, infoTableId: string, backButtonId: string) {
        this.mainDiv = document.getElementById(mainDivId) as HTMLDivElement;
        this.title = document.getElementById(titleId) as HTMLHeadingElement;
        this.infoTable = document.getElementById(infoTableId) as HTMLTableElement;
        this.backButton = document.getElementById(backButtonId) as HTMLButtonElement;
        this.enableBackButton();
    }

    public abstract show(searchResult: any, previous?: Search | DisplayInfo, map?: L.Map): void;
    protected abstract loadTableData(info: any): void;

    protected setPrevious(previous: Search | DisplayInfo): void {
        if (previous instanceof Search) {
            this.previousSearch = previous;
        } else if (previous instanceof DisplayInfo) {
            this.previousInfo = previous;
        }
    }

    protected showDiv(): void {
        this.mainDiv.style.display = "block";
    }

    protected hideDiv(): void {
        this.mainDiv.style.display = "none";
    }

    protected enableBackButton(): void {
        this.backButton.addEventListener("click", () => {
            this.onBackButtonPressed();
        });
    }

    protected onBackButtonPressed(): void {
        this.hideDiv();
        if (this.previousSearch) {
            this.previousSearch.showDiv();
            this.clearPrevious();
        } else if (this.previousInfo) {
            this.previousInfo.showDiv();
            this.clearPrevious();
        }
    }

    protected setTitle(title: string): void {
        this.title.innerText = title;
    }

    protected clearTable(): void {
        this.infoTable.innerHTML = "";
    }

    protected addInfoRow(title: string, value: string): HTMLTableRowElement {
        const row = this.infoTable.insertRow();
        const titleCell = row.insertCell(0);
        const valueCell = row.insertCell(1);

        titleCell.innerHTML = title;
        valueCell.innerHTML = value;

        return row;
    }

    private clearPrevious(): void {
        this.previousSearch = undefined;
        this.previousInfo = undefined;
    }
}