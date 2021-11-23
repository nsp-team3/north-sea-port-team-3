import VesselType from "./VesselType";

export default interface SimpleVesselInfo {
    aisType: number,
    imo: number,
    name: string,
    speed: number,
    direction: number,
    _num5: any,
    _num6: any,
    _S1: any,
    _S2: any,
    _S3: any,
    _S4: any,
    arrivalText: string,
    arrival: Date,
    _rtime: any,
    destination: string,
    ETA: Date,
    portId: number,
    vesselType: VesselType,
    _offset: any,
}