import "isomorphic-fetch";

import VesselAPI from "../resources/ts/api/VesselAPI";
import BridgeAPI from "../resources/ts/api/BridgeAPI";
import { VesselInfo } from "../resources/ts/api/VesselInfo";

/*
describe("Fake test", () => {
    it("should do nothing", () => {
        expect(Number("1")).toStrictEqual(1);
    });
})
*/

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

// describe("fetchBridges using known coordinates", () => {
//     it("should return bridge information", () => {
//         return BridgeAPI.fetchBridges(51.49327951485106, 3.612747429596617, 51.49650876515796, 3.617813780263211).then((bridges: object[] | void) => {
//             expect(bridges).toBeDefined();
//             if (bridges) {
//                 expect(bridges.length).toEqual(2);
//                 expect(bridges.some(function(bridge: any) {
//                     return bridge.name === "Schroebrug" && bridge.lnk === "0118-412372";
//                 }));
//             }
//         })
//     });
// });
