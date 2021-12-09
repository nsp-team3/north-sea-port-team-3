import * as Leaflet from "leaflet";
import Layer from "./Layer";

export default class OpenSeaMapLayer extends Layer {
    private _nestedLayer: L.TileLayer;

    public constructor(map: L.Map) {
        super(map);
        this._nestedLayer = Leaflet.tileLayer("https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png", {
            attribution: `Map data: &copy; <a href="http://www.openseamap.org">OpenSeaMap</a> contributors`
        });
        this._nestedLayer.addTo(this._layerGroup);
    }

    public show(): void {
        this._layerGroup.addLayer(this._nestedLayer);
    }

    public hide(): void {
        this._layerGroup.removeLayer(this._nestedLayer);
    }
}