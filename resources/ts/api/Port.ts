/// <reference path="Util.ts" />

import { PortType } from "../types/enums/PortType";
import { RawVesselInfo } from "../types/enums/RawVesselInfo";
import { parseHtmlDate } from "./Util";

export class Port {
    private static BASE_URL = "https://www.myshiptracking.com/ports";
    private _type: PortType;
    private _rawVesselInfo: RawVesselInfo;

    public constructor (rawVesselInfo: RawVesselInfo, type: PortType) {
        this._type = type;
        this._rawVesselInfo = rawVesselInfo;
    }

    public async getInfo(): Promise<void> {
        // TODO: Create proxy in laravel to perform this request.
        const res = await fetch(`${Port.BASE_URL}/${this.url}`, {

        });
        if (res.status !== 200) {
            return;
        }

        const body = await res.text();
        const longtitudeMatch = body.match(/<tr>.*?<td class="vessels_table_key">Longitude<\/td>.*?<td>(.*?)°<\/td>.*?<\/tr>/);
        const latitudeMatch = body.match(/<tr>.*?<td class="vessels_table_key">Latitude<\/td>.*?<td>(.*?)°<\/td>.*?<\/tr>/);
        console.log(longtitudeMatch);
        console.log(latitudeMatch);
    }

    public get id(): number | void {
        return Number(this._rawVesselInfo[this._type]);
    }

    public get name(): string | void {
        return this._rawVesselInfo[`${this._type}NAME`];
    }

    public get countryCode(): string | void {
        return this._rawVesselInfo[`${this._type}C`];
    }

    public get country(): string | void {
        return this._rawVesselInfo[`${this._type}C1`];
    }

    public get url(): string | void {
        return this._rawVesselInfo[`${this._type}URL`];
    }

    public get ETA(): Date | void {
        if (this._type == PortType.Next) {
            return parseHtmlDate(this._rawVesselInfo[`${this._type}ETA`]);
        }
    }

    public get departTime(): Date | void {
        if (this._type === PortType.Last) {
            return parseHtmlDate(this._rawVesselInfo[`${this._type}DEP`]);
        }
    }

    public get arrivalTime(): Date | void {
        if (this._type === PortType.Current) {
            return parseHtmlDate(this._rawVesselInfo[`${this._type}ARR`]);
        }
    }
}
