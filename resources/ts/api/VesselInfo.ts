import { RawDestination } from "../types/destination-types";
import { PortType } from "../types/port-types";
import { RawVesselInfo } from "../types/vessel-types";
import { Destination } from "./Destination";
import PortInfo from "./PortInfo";

/**
 * Een klasse die het makkelijker maakt om specifieke informatie op te halen over een schip.
 * Want de onbewerkte data is erg onduidelijk.
 */
export class VesselInfo {
    private _rawVesselInfo: RawVesselInfo;

    public constructor (rawVesselInfo: RawVesselInfo) {
        this._rawVesselInfo = rawVesselInfo;
    }

    public get area(): string {
        return this._rawVesselInfo.AREA;
    }

    public get country(): string {
        return this._rawVesselInfo.C;
    }

    public get course(): number {
        return Number(this._rawVesselInfo.COG);
    }

    public get destinations(): Destination | void {
        const rawDestinations: RawDestination[] = this._rawVesselInfo.EST;
        if (!rawDestinations || Array.isArray(rawDestinations[0])) {
            return;
        }
        return rawDestinations
            .filter((entry) => !Array.isArray(entry))
            .map((rawDestination: RawDestination) => new Destination(rawDestination))[0];
    }

    public get draught(): number {
        return this._rawVesselInfo.CD;
    }

    public get ETA(): Date | void {
        if (typeof this._rawVesselInfo.RETA === "string" && this._rawVesselInfo.RETA.length > 0) {
            return new Date(this._rawVesselInfo.RETA);
        }
    }

    public get flag(): string {
        return this._rawVesselInfo.F;
    }

    public get length(): number {
        return this._rawVesselInfo.H;
    }

    public get imo(): number | void {
        if (this._rawVesselInfo.IMO > 0) {
            return this._rawVesselInfo.IMO;
        }
    }

    public get lastDraught(): number {
        return this._rawVesselInfo.CDL;
    }

    public get lastDraughtChange(): Date | void {
        if (this._rawVesselInfo.CDC.length > 0) {
            return new Date(this._rawVesselInfo.CDC);
        }
    }

    public get lastPort(): PortInfo {
        return new PortInfo(this._rawVesselInfo, PortType.Last);
    }

    public get minDepth(): number {
        return this._rawVesselInfo.MIND;
    }

    public get maxDepth(): number {
        return this._rawVesselInfo.MAXD;
    }

    public get mmsi(): number {
        return this._rawVesselInfo.MMSI;
    }

    public get name(): string {
        return this._rawVesselInfo.VNAME;
    }

    public get nextPort(): PortInfo {
        return new PortInfo(this._rawVesselInfo, PortType.Next);
    }

    public get route(): string | void {
        if (this._rawVesselInfo.RDEST.length > 0) {
            return this._rawVesselInfo.RDEST;
        }
    }

    public get port(): PortInfo {
        return new PortInfo(this._rawVesselInfo, PortType.Current);
    }

    public get speed(): number {
        return Number(this._rawVesselInfo.SOG);
    }

    public get status(): number {
        return this._rawVesselInfo.NS;
    }

    public get statusText(): string {
        return this._rawVesselInfo.NSTATUS;
    }

    public get type(): number {
        return this._rawVesselInfo.VTYPE;
    }

    public get typeText(): string {
        return this._rawVesselInfo.VTYPET;
    }

    public get width(): number {
        return this._rawVesselInfo.W;
    }
}