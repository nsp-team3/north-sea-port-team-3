import "isomorphic-fetch";

import VesselAPI from "../resources/ts/api/VesselAPI";
import { VesselInfo } from "../resources/ts/api/VesselInfo";

describe("#getVessel() using valid mmsi", () => {
    it("should return vessel information", () => {
        return VesselAPI.getDetails(244169000).then((vesselDetails: VesselInfo | void) => {
            expect(vesselDetails).toBeDefined();
            if (vesselDetails) {
                expect(vesselDetails.name).toEqual("PR MAXIMA");
                expect(vesselDetails.country).toEqual("Netherlands");
                expect(vesselDetails.mmsi).toEqual(244169000);
            }
        });
    });
});