import { RawDestination } from "../types/destination-types";

/**
 * Een klasse die het makkelijker maakt om specifieke informatie op te halen over een bestemming.
 * Want de onbewerkte data is erg onduidelijk.
 */
 export class Destination {
    private _rawDestination: RawDestination;

    public constructor (rawDestination: RawDestination) {
        this._rawDestination = rawDestination;
    }

    public get calculatedETA(): Date | void {
        return this.parseHtmlDate(this._rawDestination.ARR);
    }

    public get countryCode(): string {
        return this._rawDestination.C;
    }

    public get country(): string {
        return this._rawDestination.C1;
    }

    public get name(): string {
        return this._rawDestination.NAME;
    }

    public get portId(): number {
        return this._rawDestination.PID;
    }

    public get portUrl(): string {
        return this._rawDestination.URL;
    }

    public get RDIST(): number {
        return this._rawDestination.RDIST;
    }

    public get ETA(): Date | void {
        return this.parseHtmlDate(this._rawDestination.SCH_ETA);
    }

    public get TRV(): number {
        return this._rawDestination.TRV;
    }

    private parseHtmlDate(rawDate: string): Date | void {
        const [date, rawTime] = rawDate.split(" ");
        if (typeof date === "string" && typeof rawTime === "string") {
            const timeMatch = rawTime.match(/<b>([0-9]{1,2}):([0-9]{1,2})<\/b>/);
            if (timeMatch) {
                return new Date(`${date} ${timeMatch[1]}:${timeMatch[2]}`);
            }
        }
    }
}
