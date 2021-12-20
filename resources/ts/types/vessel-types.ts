import { RawDestination } from "./destination-types";

export enum VesselType {
    Unavailable = 0,
    Pilot = 3,
    HighSpeed = 4,
    Passenger = 6,
    Cargo = 7,
    Tanker = 8,
    Yacht = 9,
    Fishing = 10,
    BaseStation = 11,
    AirCraft = 12,
    NavigationAid = 13
}

export type VesselFilters = {
    southWest: L.LatLng;
    northEast: L.LatLng;
    zoom: number;
    countryCode?: string;
    status?: number;
    originPortId?: number;
    currentPortId?: number;
    destinationPortId?: number;
    includePorts?: boolean;
    vesselTypes?: VesselType[];
}

export type SimpleVesselInfo = {
    aisType: number,
    mmsi: number,
    name: string,
    speed: number,
    direction: number,
    longitude: number,
    latitude: number,
    arrival?: Date | void,
    requestTime: Date,
    destination?: string,
    ETA?: Date | void,
    portId: number,
    vesselType: VesselType,
}

export type VesselSearchResult = {
    mmsi?: number;
    name: string;
    typeText: string;
    type: number;
    flag: string;
}

export type VesselSearchFilters = {
    excludePorts?: boolean;
    excludeVessels?: boolean;
}

export type RawVesselInfo = {
    AREA: string;
    C: string;
    CD: number;
    CDC: string;
    CDL: number;
    COG: string;
    CP: number | undefined;
    CPARR: string | undefined;
    CPC: string | undefined;
    CPC1: string | undefined;
    CPNAME: string | undefined;
    CPURL: string | undefined;
    DSTPORT: string | undefined;
    DSTPORTC: string | undefined;
    DSTPORTC1: string | undefined;
    DSTPORTETA: string | undefined;
    DSTPORTNAME: string | undefined;
    DSTPORTURL: string | undefined;
    EST: RawDestination[] | undefined;
    F: string;
    H: number;
    IMO: number;
    INP: number;
    LP: number | undefined;
    LPC: string | undefined;
    LPC1: string | undefined;
    LPDEP: string | undefined;
    LPNAME: string | undefined;
    LPURL: string | undefined;
    MAXD: number;
    MIND: number;
    MMSI: number;
    NS: number;
    NSTATUS: string;
    PD: string;
    RDEST: string;
    RETA: string;
    ROT: number;
    SEC: number;
    SN: number;
    SOG: string;
    TRV: number;
    TRV_SRC: number;
    VNAME: string;
    VTYPE: number;
    VTYPET: string;
    W: number;
}
