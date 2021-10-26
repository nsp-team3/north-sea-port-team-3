import { RawDestination } from "./RawDestination";

export interface RawVesselInfo {
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
