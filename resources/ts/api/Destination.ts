/// <reference path="Util.ts" />

import RawDestination from "../types/RawDestination";
import { parseHtmlDate } from "./Util";

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
        return parseHtmlDate(this._rawDestination.ARR);
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
        console.log("I need to figure out what this means.");
        return this._rawDestination.RDIST;
    }

    public get ETA(): Date | void {
        return parseHtmlDate(this._rawDestination.SCH_ETA);
    }

    public get TRV(): number {
        console.log("I need to figure out what this means.");
        return this._rawDestination.TRV;
    }
}
