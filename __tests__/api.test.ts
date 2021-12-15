import "isomorphic-fetch";

import AIS from "../resources/ts/api/AIS";

describe("#getVessel() using valid mmsi", () => {
    it("should return vessel information", () => {
        return AIS.getVessel(244169000).then(data => {
            expect(data).toBeDefined()
            expect(data.name).toEqual("PR MAXIMA")
            expect(data.country).toEqual("Netherlands")
            expect(data.mmsi).toEqual(244169000);
        });
    });
});