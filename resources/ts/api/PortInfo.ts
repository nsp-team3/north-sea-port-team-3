import { PortType } from "../types/port-types";
import { RawVesselInfo } from "../types/vessel-types";

/**
 * Een klasse die het makkelijker maakt om specifieke informatie op te halen over een haven.
 * Want de onbewerkte data is erg onduidelijk.
 */
 export default class PortInfo {
    private _type: PortType;
    private _rawVesselInfo: RawVesselInfo;

    public constructor (rawVesselInfo: RawVesselInfo, type: PortType) {
        this._type = type;
        this._rawVesselInfo = rawVesselInfo;
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
            return this.parseHtmlDate(this._rawVesselInfo[`${this._type}ETA`]);
        }
    }

    public get departTime(): Date | void {
        if (this._type === PortType.Last) {
            return this.parseHtmlDate(this._rawVesselInfo[`${this._type}DEP`]);
        }
    }

    public get arrivalTime(): Date | void {
        if (this._type === PortType.Current) {
            const rawArrivalTime = this._rawVesselInfo[`${this._type}ARR`];
            if (rawArrivalTime) {
                return this.parseHtmlDate(rawArrivalTime);
            }
        }
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
