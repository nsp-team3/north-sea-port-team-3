import * as L from "leaflet";

export default abstract class Layer {
    // Koppeling met de kaart.
    protected _map: L.Map;
    // Lagengroep, zodat die gevult / geleegd kan worden met data binnen zijn eigen class.
    protected _layerGroup: L.LayerGroup;
    // De verborgen lagengroep, die afzonderlijk aan/uitgezet kan worden.
    protected _nestedLayer: L.LayerGroup;

    public constructor(map: L.Map) {
        this._map = map;
        this._layerGroup = new L.LayerGroup();
        this._nestedLayer = new L.LayerGroup();
        this._layerGroup.addLayer(this._nestedLayer);
    }

    /**
     * Vraagt de layergroup op, zodat deze gebruikt kan worden door andere code.
     */
    public get main(): L.LayerGroup {
        return this._layerGroup;
    }

    /**
     * Vraagt de kaart aan waarop de Layer wordt gebruikt.
     */
    public get map(): L.Map {
        return this._map;
    }

    /**
     * Wordt aangevraagd om de layer op de kaart te renderen.
     */
    public abstract update(): void;

    /**
     * Voegt de nested layer toe aan de main layer.
     */
    public show(): void {
        if (!this._layerGroup.hasLayer(this._nestedLayer)) {
            this._layerGroup.addLayer(this._nestedLayer);
        }
    }

    /**
     * Verwijdert de nested layer van de main layer.
     */
    public hide(): void {
        if (this._layerGroup.hasLayer(this._nestedLayer)) {
            this._layerGroup.removeLayer(this._nestedLayer);
        }
    }

    /**
     * Wist de leaflet lagen van de Layer.
     */
    protected clearLayers(): void {
        this._nestedLayer.clearLayers();
    }
}