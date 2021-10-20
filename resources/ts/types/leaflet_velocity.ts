/// <reference types="leaflet" />

import * as L from 'leaflet';

declare module 'leaflet' {

    export class VelocityLayer {
        constructor(options?: any);

        addTo(map: L.Map): this;
        removeFrom(map: L.Map): this;
    }

    export function velocityLayer(options?: any): VelocityLayer;
}
