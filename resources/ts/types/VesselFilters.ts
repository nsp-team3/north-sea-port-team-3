import VesselStatus from "./enums/VesselStatus";
import VesselType from "./enums/VesselType";

type VesselFilters = {
    vesselTypes?: VesselType[];
    countryCode?: string;
    status?: VesselStatus;
    origin?: number;
    destination?: number;
    includePorts?: boolean;
}

export default VesselFilters;