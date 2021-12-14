import DisplayInfo from "../display-info/DisplayInfo";
import { SearchResult } from "../types/SearchTypes";

/**
 * Abstracte class die de zoekfunctionaliteit in de zoekbalk regeld
 */
export default abstract class Search {
    /**
     * zoekfilters die toegepast worden bij zoeken
     */
    protected abstract SEARCH_FILTERS: { [id: string]: boolean };
    /**
     * Minimale aantal karakters voor het begint met zoeken
     */
    protected abstract MIN_INPUT_LENGTH: number;
    /**
     * Div element die aangepast moet worden bij nieuwe resultaten
     */
    protected abstract RESULTS_ELEMENT: HTMLDivElement;

    /**
     * Zet zoekresultaten om naar een HTML element
     * @param searchResult Zoekresultaten als HTML element
     */
    protected abstract displayResult(searchResult: SearchResult): HTMLElement;

    /**
     * Dit event word aangeroepen bij elk nieuw of verwijderd karacter in het zoekvenster
     * @param query inhoud van het zoekvenster
     * @returns zoekresultaat binnen await
     */
    protected abstract getSearchResults(query: string): Promise<any>;

    protected map: L.Map;
    protected searchBar: HTMLInputElement;
    protected displayInfo: DisplayInfo;

    /**
     * zet zoekfunctionaliteit aan voor de zoekbalk
     * @param map koppeling met de kaart, bijvoorbeeld zoomen naar locatie van boot
     * @param searchBarId ID van de zoekbalk binnen html
     * @param displayInfo koppeling met de class die aangeeft hoe de data moet worden weergeven
     */
    public constructor(map: L.Map, searchBarId: string, displayInfo: DisplayInfo) {
        this.map = map;
        this.searchBar = document.getElementById(searchBarId) as HTMLInputElement;
        this.displayInfo = displayInfo;
        this.enableSearch();
    }

    /**
     * Maakt de zoekbalk en resultaat zichtbaar door de <div> op zichtbaar te zetten,
     * <div style="display=block" /> is de default wanneer display niet gedefineerd is binnen de div's CSS.
     * word gebruikt als je bijv. op terug drukt.
     */
    public showDiv(): void {
        this.searchBar.style.display = "block";
        this.RESULTS_ELEMENT.style.display = "block";
    }

    /**
     * Maakt de zoekbalk en resultaat onzichtbaar zodat andere elementen,
     * zoals het resultaat, getoont kunnen worden.
     */
    public hideDiv(): void {
        this.searchBar.style.display = "none";
        this.RESULTS_ELEMENT.style.display = "none";
    }

    /**
     * Voegt een eventlistener toe aan de zoekbalk,
     * zodat onInputEntered() resultaten kan aanvragen aan getSearchResults()
     */
    private enableSearch(): void {
        this.searchBar.addEventListener("input", () => {
            this.onInputEntered();
        });
    }

    /**
     * Vraagt informatie op nadat een resultaat is ingevuld.
     */
    private async onInputEntered(): Promise<void> {
        if (this.searchBar.value.length >= this.MIN_INPUT_LENGTH) {
            const searchResults = await this.getSearchResults(this.searchBar.value);
            this.displayResults(searchResults);
        } else {
            this.RESULTS_ELEMENT.innerHTML = "";
        }
    }

    /**
     * Laat de zoekresultaten zien nadat die zijn ophehaald
     * @param searchResults de opgehaalde zoekresultaten
     */
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

    /**
     * Verbergt de zoekbalk en laat meer informatie zien als de gebruiker klikt op een resultaat.
     * elk zoekresultaat heeft een eventlistener die hier naartoe leid.
     * @param searchResult Het zoekresultaat wat moet ingeladen worden
     */
    protected onResultClicked(searchResult: SearchResult): void {
        this.hideDiv();
        this.displayInfo.show(searchResult, this);
    }
}
