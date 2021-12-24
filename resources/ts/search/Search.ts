/**
 * Abstracte class die de zoekfunctionaliteit in de zoekbalk regeld
 */
export default abstract class Search {
    public static forceUpdate = false;

    // De id van de zoekbalk
    protected static readonly SEARCH_BAR_ID: string = "searchbar";

    // De id van de zoekresultaten tabel.
    protected static readonly RESULTS_ID: string = "search-results";

    // Laatste zoekopdracht
    private static lastQuery = "";

    // Voert de zoekopdracht uit.
    protected abstract executeSearch(): void;

    // De klasse die gebruikt wordt om gedetailleerde informatie te tonen.

    protected searchButton: HTMLButtonElement;
    protected enabled: boolean;

    /**
     * zet zoekfunctionaliteit aan voor de zoekbalk
     * @param map koppeling met de kaart, bijvoorbeeld zoomen naar locatie van boot
     * @param searchButtonId Het ID van de zoek knop in html
     */
    public constructor(searchButtonId: string) {
        this.searchButton = document.getElementById(searchButtonId) as HTMLButtonElement;
        this.enabled = true;
        this.addFilterListener();
    }

    public static hasQueryChanged(): boolean {
        const searchbar = document.getElementById(Search.SEARCH_BAR_ID) as HTMLInputElement;
        const query: string = searchbar.value;
        if (Search.forceUpdate || query !== Search.lastQuery) {
            Search.clearSearchResults();
            Search.lastQuery = query;
            Search.forceUpdate = false;
            return true;
        }
        return false;
    }

    private static clearSearchResults(): void {
        const resultsElement = document.getElementById(Search.RESULTS_ID);
        resultsElement.innerHTML = "";
    }

    public update(): void {
        if (!this.enabled) {
            return;
        }
        this.executeSearch();
    }

    private addFilterListener(): void {
        this.searchButton.addEventListener("click", () => this.onFilterClicked());
    }

    private onFilterClicked(): void {
        this.enabled = !this.enabled;
        if (this.enabled) {
            this.searchButton.classList.remove("btn-secondary");
            this.searchButton.classList.add("btn-primary");
        } else {
            this.searchButton.classList.remove("btn-primary");
            this.searchButton.classList.add("btn-secondary");
        }
        Search.forceUpdate = true;
    }
}
