export default class BridgeAPI {
    private static readonly COUNTRY_CODES: {[index: string]: number} = {
        "NL": 31,
        "BE": 32
    }

    private static readonly BRIDGES_URL: string = "/api/bridges";

    public static async fetchBridges(southWestLat: number, southWestLng: number, northEastLat: number, northEastLng: number): Promise<object[] | void> {
        // gebaseerd op de coordinaten, alle bruggen hierbinnen opvragen.

        const res = await fetch(BridgeAPI.BRIDGES_URL, {
            "body": `a=${southWestLat}&b=${northEastLng}&c=${northEastLat}&d=${southWestLng}&e=0&f=0&g=0&h=0&i=0&j=0&k=0&l=0&m=0&n=0&o=0&p=0&q=0&r=0&s=0&t=0&u=0&v=1&w=0&x=0&y=0&z=0`,
            "method": "POST"
        }).catch(console.error);
        if (res) {
            return await res.json().catch(console.error);
        }
    }

    /**
     * Haalt verdere informatie over de brug op van https://vaarweginformatie.nl/
     * @param bridge de brug waarvan de administratieve informatie van opgehaald worden
     * @returns de administratieve informatie van de brug
     */
    public static async fetchAdministration(bridge: any): Promise<string | void> {
        const administration: string[] = [];
        const res = await fetch(`/api/bridgeadministration/${bridge.RWS_Id}`).catch(console.error);
        if (res) {
            const data = await res.json().catch(console.error);
            return BridgeAPI.createAdministration(administration, data);
        }
    }

    /**
     * Probeerd een foto op te halen van een schip,
     * wanneer die niet is gevonden geeft hij niks terug
     * @param bridge bruginformatie van de api
     * @returns img element in string: "<img>"
     */
    public static async fetchBridgePicture(bridge: any): Promise<string | void> {
        const imageIndicators = ["sluit", "brug_open"];
        if (!imageIndicators.includes(bridge.icoo)) {
            return;
        }

        // aanmaken van ?locatie=6554&name=brug....
        const params = new URLSearchParams({
            locatie: bridge.extradata,
            name: bridge.name,
            os: "web",
        });

        // sluis of brug als type defineren
        bridge.icoo === "sluis" ? params.append("soort", "sluis") : params.append("soort", "brug");

        const res = await fetch(`/api/detailedbridge?${params}`).catch(console.error);
        if (res) {
            const html = await res.text();
            const doc = new DOMParser().parseFromString(html, "text/html");
            const image = doc.querySelector("img");
            if (image) {
                return image.outerHTML;
            }
        }
    }

    /**
     * Haalt de landcode op van de gegeven locatie.
     * @param latitude De lengtegraad van de positie
     * @param longitude De breedtegraad van de postie
     * @returns De landcode van het land waar de brug zich in bevindt.
     */
    public static async fetchCountryCode(latitude: number, longitude: number): Promise<number | void> {
        const res = await fetch(`http://api.geonames.org/countryCodeJSON?lat=${latitude}&lng=${longitude}&username=zefanjajobse`).catch(console.error);
        if (res) {
            return BridgeAPI.parseCountryCode(res);
        }
    }

    private static createAdministration(administration: string[], data: { [id: string]: { [id: string]: string } }): string {
        const info: { [id: string]: string[] } = {
            "Bezoeksadres": [],
            "Postadres": []
        }

        if (data.administration !== undefined) {
            Object.entries(data.administration).forEach(([key, value]) => {
                if (key.includes("postal")) {
                    info.Postadres.push(value);
                } else if (key.includes("visiting")) {
                    info.Bezoeksadres.push(value);
                }
            });
        }

        Object.entries(info).forEach(([key, value]) => {
            if (value.length !== 0) {
                administration.push(`<br><b>${key}</b>`);
                value.forEach((item) => {
                    administration.push(`<br>${item}`);
                });
            }
        });

        return administration.join("");
    }

    private static async parseCountryCode(res: Response): Promise<number | void> {
        const data = await res.json().catch(console.error);
        if (data) {
            return BridgeAPI.COUNTRY_CODES[data.countryCode];
        }
    }
}
