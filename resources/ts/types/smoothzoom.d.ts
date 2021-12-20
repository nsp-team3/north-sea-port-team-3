import * as L from "leaflet";

declare module 'leaflet' {
    export interface MapOptions {
        smoothWheelZoom: boolean,
        smoothSensitivity: number,
    }
}

declare module 'leaflet' {
    export function trackSymbol(latlng: L.LatLng, options?: any): L.LayerGroup;
}
