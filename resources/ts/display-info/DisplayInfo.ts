import Search from "../search/Search";
import { SearchResult } from "../types/SearchTypes";

export default abstract class DisplayInfo {
    protected mainDiv: HTMLDivElement;
    protected title: HTMLHeadingElement;
    protected infoTable: HTMLTableElement;
    protected backButton: HTMLButtonElement;
    protected previousSearch?: Search;
    protected previousInfo?: DisplayInfo;

    public abstract show(searchResult: SearchResult, search: Search): void;

    protected abstract loadTableData(info: any): void;
    
    public constructor(mainDivId: string, titleId: string, infoTableId: string, backButtonId: string) {
        this.mainDiv = document.getElementById(mainDivId) as HTMLDivElement;
        this.title = document.getElementById(titleId) as HTMLHeadingElement;
        this.infoTable = document.getElementById(infoTableId) as HTMLTableElement;
        this.backButton = document.getElementById(backButtonId) as HTMLButtonElement;
        this.enableBackButton();
    }

    // public toggle(): void {
    //     const backButtons = document.querySelectorAll(".back-button");
    //     backButtons.forEach((backButton) => backButton.addEventListener("click", () => {
    //         this.onBackButtonPressed();
    //     }));
    // }

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
        console.log("Back button pressed!");
        this.hideDiv();
        
        if (this.previousSearch) {
            this.previousSearch.showDiv();
        } else if (this.previousInfo) {
            this.previousInfo.showDiv();
        } else {
            console.error("Could not find previous search!");
        }

        this.previousSearch = undefined;
        this.previousInfo = undefined;
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
}