/// <reference path="Port.ts" />

import { Destination } from "./Destination";
import { LocationInfo } from "./enums/LocationInfo";
import { PortType } from "./enums/PortType";
import { RawDestination } from "./enums/RawDestination";
import { RawVesselInfo } from "./enums/RawVesselInfo";
import { Port } from "./Port";

export class Vessel {
    private _rawVesselInfo: RawVesselInfo;
    private static BASE_URL: string = "https://services.myshiptracking.com/requests";

    public constructor (rawVesselInfo: RawVesselInfo) {
        this._rawVesselInfo = rawVesselInfo;
    }

    public async getLocationInfo(): Promise<LocationInfo | void> {
        const params: URLSearchParams = new URLSearchParams({
            type: "json",
            selid: String(this.mmsi),
            seltype: String(0),
            _: String(new Date().getTime())
        });
        const response = await fetch(`${Vessel.BASE_URL}/vesselsonmaptempw.php?${params}`);
        const body = await response.text();

        const allInfo = body.split("\n");
        allInfo.shift();
        allInfo.pop();

        const results = allInfo.map((line) => {
            const shipInfo: string[] = line.split("\t");

            if (shipInfo[0] !== "0") {
                return undefined;
            }

            return {
                mmsi: Number(shipInfo[1]),
                name: shipInfo[2],
                latitude: Number(shipInfo[5]),
                longtitude: Number(shipInfo[6]),
                lastUpdatedText: shipInfo[11] ? shipInfo[11] : undefined,
                lastUpdated: shipInfo[11] ? new Date(shipInfo[11]) : undefined
            }
        }).filter(e => e !== undefined);

        if (results.length === 0) {
            throw new Error("Could not find this vessel.");
        }

        return results[0];
    }

    public get PD(): string {
        console.log("I need to figure out what this means.");
        return this._rawVesselInfo.PD;
    }

    public get SN(): number {
        console.log("I need to figure out what this means.");
        return this._rawVesselInfo.SN;
    }

    public get ROT(): number {
        console.log("I need to figure out what this means.");
        return this._rawVesselInfo.ROT;
    }

    public get TRV_SRC(): number {
        console.log("I need to figure out what this means.");
        return this._rawVesselInfo.TRV_SRC;
    }

    public get TRV(): number {
        console.log("I need to figure out what this means.");
        return this._rawVesselInfo.TRV;
    }

    public get INP(): number {
        console.log("I need to figure out what this means.");
        return this._rawVesselInfo.INP;
    }

    public get SEP(): number {
        console.log("I need to figure out what this means.");
        return this._rawVesselInfo.SEC;
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

    public get destinations(): Destination[] | void {
        const rawDestinations: RawDestination[] = this._rawVesselInfo.EST;
        if (!rawDestinations || Array.isArray(rawDestinations[0])) {
            return;
        }
        return rawDestinations
            .filter((entry) => !Array.isArray(entry))
            .map((rawDestination: RawDestination) => new Destination(rawDestination));
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

    public get height(): number {
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

    public get lastPort(): Port {
        return new Port(this._rawVesselInfo, PortType.Last);
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

    public get nextPort(): Port {
        return new Port(this._rawVesselInfo, PortType.Next);
    }

    public get route(): string | void {
        if (this._rawVesselInfo.RDEST.length > 0) {
            return this._rawVesselInfo.RDEST;
        }
    }

    public get port(): Port {
        return new Port(this._rawVesselInfo, PortType.Current);
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
