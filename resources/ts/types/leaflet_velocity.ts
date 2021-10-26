/// <reference types="leaflet" />

import * as L from 'leaflet';

declare module 'leaflet' {
    export function velocityLayer(options?: any): L.LayerGroup;
}
