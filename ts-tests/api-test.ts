test("Vessel information API - Happy path", async () => {
    const BASE_URL = "https://services.myshiptracking.com/requests";
    const TEST_MMSI = 244574000;

    const params = new URLSearchParams({
        type: "json",
        mmsi: String(TEST_MMSI),
        slmp: undefined
    });
    const res = await fetch(`${BASE_URL}/vesseldetails.php?${params}`);
    const rawInfo = await res.json();

    console.log(rawInfo);

    expect(rawInfo).toBe(1);
    // const actual: number = null; // not implemented yet
    // expect(actual).toBe(1);
});