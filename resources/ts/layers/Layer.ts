import * as Leaflet from "leaflet";

export default abstract class Layer {
    /**
     * koppeling met de kaart
     */
    protected _map: L.Map;
    /**
     * lagengroep, zodat die gevult / geleegd kan worden met data binnen zijn eigen class
     */
    protected _layerGroup: L.LayerGroup;

    /**
     *
     * @param map koppeling met de kaart, voor bijv. zichtbaarheid gebaseerd op zoomniveau
     */
    public constructor(map: L.Map) {
        this._map = map;
        this._layerGroup = new Leaflet.LayerGroup();
    }

    /**
     * layergroup aanvragen voor koppeling met map
     */
    public get main(): L.LayerGroup {
        return this._layerGroup;
    }

    /**
     * nieuwe data aanvragen, kan bijv worden aangevraagt na het inzoomen
     */
    public abstract show(): void;
}
