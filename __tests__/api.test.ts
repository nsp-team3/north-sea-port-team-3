import "isomorphic-fetch";

import AIS from "../resources/ts/api/AIS";

describe("#getVessel() using valid mmsi", () => {
    it("should return vessel information", () => {
        return AIS.getVessel(123456789).then(data => {
            expect(data).toBeDefined()
            expect(data.name).toEqual("AIS KEPANDUAN")
            expect(data.mmsi).toEqual(123456789);
        });
    });
});