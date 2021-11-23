import VesselType from "./VesselType";

export default interface SimpleVesselInfo {
    aisType: number,
    imo: number,
    name: string,
    speed: number,
    direction: number,
    longitude: number,
    latitude: number,
    _S1: number,
    _S2: number,
    _S3: number,
    _S4: number,
    arrivalText: string,
    arrival?: Date,
    requestTime: Date,
    destination: string,
    ETA?: Date,
    portId: number,
    vesselType: VesselType,
    _offset: any,
}