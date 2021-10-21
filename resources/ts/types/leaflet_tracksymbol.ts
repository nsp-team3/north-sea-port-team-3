/// <reference types="leaflet" />

import * as L from 'leaflet';

declare module 'leaflet' {
    export function trackSymbol(latlng: L.LatLng, options?: any): L.LayerGroup;
}
