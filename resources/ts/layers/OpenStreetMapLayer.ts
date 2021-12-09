import * as Leaflet from "leaflet";
import Layer from "./Layer";

export default class OpenStreetMapLayer extends Layer {
    private _nestedLayer: L.TileLayer;

    public constructor(map: L.Map) {
        super(map);
        this._nestedLayer = Leaflet.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: `&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors`
        }).addTo(this._layerGroup);
        this._layerGroup.addTo(map);
    }

    public show(): void {
        this._layerGroup.addLayer(this._nestedLayer);
    }

    public hide(): void {
        this._layerGroup.removeLayer(this._nestedLayer);
    }
}