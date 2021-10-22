/// <reference path="Util.ts" />

class Port {
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
        const key = `${this._type}CPC`;
        return this._rawVesselInfo[`${this._type}CPC`];
    }

    public get country(): string | void {
        return this._rawVesselInfo[`${this._type}CPC1`];
    }

    public get url(): string | void {
        return this._rawVesselInfo[`${this._type}URL`];
    }

    public get ETA(): Date | void {
        return parseHtmlDate(this._rawVesselInfo[`${this._type}ETA`]);
    }

    public get department(): Date | void {
        return parseHtmlDate(this._rawVesselInfo[`${this._type}DEP`]);
    }

    public get arrival(): Date | void {
        return parseHtmlDate(this._rawVesselInfo[`${this._type}ARR`]);
    }
}