import * as Leaflet from "leaflet";

export default abstract class Layer {
    protected _map: L.Map;
    protected _layerGroup: L.LayerGroup;

    public constructor(map: L.Map) {
        this._map = map;
        this._layerGroup = new Leaflet.LayerGroup();
    }

    public get main(): L.LayerGroup {
        return this._layerGroup;
    }

    public abstract show(): void;
}