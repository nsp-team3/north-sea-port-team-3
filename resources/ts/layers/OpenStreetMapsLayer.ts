import * as L from "leaflet";
import Layer from "./Layer";

export default class OpenStreetMapLayer extends Layer {
    private _tileLayer: L.TileLayer;

    public constructor(map: L.Map) {
        super(map);
        this._tileLayer = new L.TileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: `&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors`
        }).addTo(this._layerGroup);
        this._tileLayer.addTo(this._nestedLayer);
        this._layerGroup.addTo(map);
    }

    public render(): void {
        this._layerGroup.addLayer(this._nestedLayer);
    }
}