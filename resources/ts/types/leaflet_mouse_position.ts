/// <reference types="leaflet" />

import * as L from 'leaflet';

declare module 'leaflet' {
    namespace control {
        export function mousePosition(options?: any): L.LayerGroup;
    }
}
