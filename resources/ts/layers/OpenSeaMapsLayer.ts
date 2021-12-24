import * as L from "leaflet";
import Layer from "./Layer";

export default class OpenStreetMapLayer extends Layer {
    private _tileLayer: L.TileLayer;

    public constructor(map: L.Map) {
        super(map);
        this._tileLayer = new L.TileLayer("https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png", {
            attribution: `Map data: &copy; <a href="http://www.openseamap.org">OpenSeaMap</a> contributors`
        }).addTo(this._nestedLayer);
    }

    public update(): void {
		return
	}
}
