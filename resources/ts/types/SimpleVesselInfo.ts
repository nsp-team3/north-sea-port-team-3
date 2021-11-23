import VesselType from "./enums/VesselType";

export default interface SimpleVesselInfo {
    aisType: number,
    imo: number,
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