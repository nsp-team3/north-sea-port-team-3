import VesselStatus from "./enums/VesselStatus";
import VesselType from "./enums/VesselType";

type VesselFilters = {
    vesselTypes?: VesselType[];
    countryCode?: string;
    status?: VesselStatus;
    currentPortId?: number;
    destinationPortId?: number;
    originPortId?: number;
    includePorts?: boolean;
    destination?: string;
}

export default VesselFilters;