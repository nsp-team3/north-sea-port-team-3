import * as L from "leaflet";

export default class bruggen {
    private static BASE_URL =
        "https://www.brug-open.nl/openstreet/jsonBruggen/";

    public static async getBruggen(map: L.Map) {
        const res = await fetch("/api/brugtoken");

        const body = await res.json();

        const res2 = await fetch(`${bruggen.BASE_URL}${body.token}`);
        const rawInfo = await res2.json();

        bruggen.main.clearLayers();

        Object.keys(rawInfo.markers).forEach((key) => {
            const values = rawInfo.markers[key];
            var myIcon = L.icon({
                iconUrl: values.icon,
                iconSize: [20, 20],
                className: key,
            });

            L.marker([values.lat, values.lon], { icon: myIcon })
                .addTo(bruggen.main)
                .on("click", (event: L.LeafletMouseEvent) => {
                    const id =
                        event.sourceTarget.options.icon.options.className;
                    const params = new URLSearchParams({
                        id: id,
                    });
                    fetch(
                        `https://www.brug-open.nl/openstreet/jsonHtmlTag/?${params}`
                    ).then((res) => {
                        res.json()
                            .then((result) => {
                                L.popup()
                                    .setLatLng(event.latlng)
                                    .setContent(result.html)
                                    .openOn(map);
                            })
                            .catch((err) => {});
                    });
                });
        });
    }

    public static main = L.layerGroup();
}
