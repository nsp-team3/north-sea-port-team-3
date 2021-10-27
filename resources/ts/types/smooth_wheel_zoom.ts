/// <reference types="leaflet" />

import * as L from 'leaflet';

declare module 'leaflet' {
    export interface MapOptions {
        smoothWheelZoom: boolean,
        smoothSensitivity: number,
    }
}
