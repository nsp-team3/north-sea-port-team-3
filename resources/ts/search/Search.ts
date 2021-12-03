import DisplayInfo from "../display-info/DisplayInfo";
import { SearchResult } from "../types/SearchTypes";

export default abstract class Search {
    protected abstract MIN_INPUT_LENGTH: number;
    protected abstract RESULTS_ELEMENT: HTMLDivElement;
    
    protected abstract displayResult(searchResult: SearchResult): HTMLElement;
    protected abstract getSearchResults(query: string): Promise<any>;
    
    protected map: L.Map;
    protected searchBar: HTMLInputElement;
    protected displayInfo: DisplayInfo;

    public constructor(map: L.Map, searchBarId: string, displayInfo: DisplayInfo) {
        this.map = map;
        this.searchBar = document.getElementById(searchBarId) as HTMLInputElement;
        this.displayInfo = displayInfo;
        this.enableSearch();
    }

    public showDiv(): void {
        this.searchBar.style.display = "block";
        this.RESULTS_ELEMENT.style.display = "block";
    }
    
    public hideDiv(): void {
        this.searchBar.style.display = "none";
        this.RESULTS_ELEMENT.style.display = "none";
    }

    private enableSearch(): void {
        this.searchBar.addEventListener("input", () => {
            this.onInputEntered();
        });
    }

    private async onInputEntered(): Promise<void> {
        if (this.searchBar.value.length >= this.MIN_INPUT_LENGTH) {
            const searchResults = await this.getSearchResults(this.searchBar.value);
            this.displayResults(searchResults);
        } else {
            this.RESULTS_ELEMENT.innerHTML = "";
        }
    }

    private displayResults(searchResults: SearchResult[]): void {
        this.RESULTS_ELEMENT.innerHTML = "";
        searchResults.forEach((searchResult: SearchResult) => {
            const resultElement: HTMLElement = this.displayResult(searchResult);
            this.RESULTS_ELEMENT.append(resultElement);
            resultElement.addEventListener("click", () => {
                this.onResultClicked(searchResult);
            });
        });
    }

    protected onResultClicked(searchResult: SearchResult): void {
        this.hideDiv();
        this.displayInfo.show(searchResult, this);
    }
}